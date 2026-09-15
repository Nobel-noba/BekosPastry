import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    ChefHat,
    Plus,
    CheckCircle2,
    Clock,
    AlertTriangle,
    X,
    TrendingUp,
    Layers,
    Package
} from 'lucide-react';

export default function ChefProduction({
    approved_products = [],
    batches = []
}) {
    const [showStartModal, setShowStartModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completingBatch, setCompletingBatch] = useState(null);

    const {
        data: startData,
        setData: setStartData,
        post: postStart,
        processing: startProcessing,
        reset: resetStart
    } = useForm({
        product_id: approved_products[0]?.id || '',
        planned_quantity: 10,
        notes: '',
    });

    const {
        data: completeData,
        setData: setCompleteData,
        post: postComplete,
        processing: completeProcessing,
        reset: resetComplete
    } = useForm({
        actual_quantity: '',
        notes: '',
    });

    const selectedProduct = useMemo(() => {
        return approved_products.find(p => String(p.id) === String(startData.product_id));
    }, [approved_products, startData.product_id]);

    const requiredIngredientsPreview = useMemo(() => {
        if (!selectedProduct || !selectedProduct.recipe_ingredients) return [];
        return selectedProduct.recipe_ingredients.map(ri => {
            const totalNeeded = (ri.quantity_required || 0) * (parseFloat(startData.planned_quantity) || 0);
            const hasEnough = (ri.kitchen_stock || 0) >= totalNeeded;
            return {
                ...ri,
                totalNeeded,
                hasEnough,
            };
        });
    }, [selectedProduct, startData.planned_quantity]);

    const hasEnoughStockToStart = useMemo(() => {
        if (requiredIngredientsPreview.length === 0) return false;
        return requiredIngredientsPreview.every(i => i.hasEnough);
    }, [requiredIngredientsPreview]);

    const openStartModal = () => {
        resetStart();
        if (approved_products.length > 0) {
            setStartData('product_id', approved_products[0].id);
            setStartData('planned_quantity', 10);
            setStartData('notes', '');
        }
        setShowStartModal(true);
    };

    const openCompleteModal = (batch) => {
        setCompletingBatch(batch);
        setCompleteData({
            actual_quantity: batch.planned_quantity,
            notes: '',
        });
        setShowCompleteModal(true);
    };

    const submitStartBatch = (e) => {
        e.preventDefault();
        postStart('/chef/production/start', {
            onSuccess: () => {
                setShowStartModal(false);
                resetStart();
            },
        });
    };

    const submitCompleteBatch = (e) => {
        e.preventDefault();
        if (!completingBatch) return;
        postComplete(`/chef/production/${completingBatch.id}/complete`, {
            onSuccess: () => {
                setShowCompleteModal(false);
                setCompletingBatch(null);
                resetComplete();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Batch Production - Chef" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Batch Production & Kitchen Yield Tracking
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Launch baking batches for approved recipes. Ingredient consumption and yield efficiency are calculated on batch completion.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openStartModal}
                    disabled={approved_products.length === 0}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Start New Production Batch</span>
                </button>
            </div>

            {/* Warning banner if no approved products */}
            {approved_products.length === 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                        No approved recipes are currently available. The Administrator must approve recipe submissions before the kitchen can launch production batches.
                    </span>
                </div>
            )}

            {/* Batches Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-serif font-bold text-stone-900">Production Batches History</h2>
                        <p className="text-xs text-stone-500">Track planned vs actual cakes and efficiency variance.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{batches.length} Batches</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Batch Code</th>
                                <th className="py-3 px-4">Product</th>
                                <th className="py-3 px-4">Planned Output</th>
                                <th className="py-3 px-4">Actual Output</th>
                                <th className="py-3 px-4">Yield Efficiency</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {batches.map((b) => (
                                <tr key={b.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                                        {b.batch_code}
                                        <div className="text-[10px] text-stone-400 font-normal">
                                            {new Date(b.started_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                                        {b.product?.name}
                                    </td>
                                    <td className="py-3.5 px-4 font-medium text-stone-700">
                                        {b.planned_quantity} cakes
                                    </td>
                                    <td className="py-3.5 px-4 font-extrabold text-stone-900">
                                        {b.status === 'completed' ? (
                                            <span>{b.actual_quantity} cakes</span>
                                        ) : (
                                            <span className="text-stone-400 italic">Baking...</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {b.status === 'completed' ? (
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    b.yield_efficiency_percent >= 95 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {b.yield_efficiency_percent}%
                                            </span>
                                        ) : (
                                            <span className="text-stone-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                            }`}
                                        >
                                            <span>{b.status.replace('_', ' ')}</span>
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        {b.status === 'in_progress' ? (
                                            <button
                                                type="button"
                                                onClick={() => openCompleteModal(b)}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                                            >
                                                Complete Batch &rarr;
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-stone-400">Recorded</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* START PRODUCTION BATCH MODAL */}
            {showStartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-emerald-600">
                                <ChefHat className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Start Production Batch</h3>
                            </div>
                            <button onClick={() => setShowStartModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitStartBatch} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Select Pastry (Approved Recipes Only)</label>
                                <select
                                    value={startData.product_id}
                                    onChange={(e) => setStartData('product_id', e.target.value)}
                                    required
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                >
                                    {approved_products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Pantry max: {p.possible_batches} cakes)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Planned Output Quantity (Cakes)</label>
                                <input
                                    value={startData.planned_quantity}
                                    onChange={(e) => setStartData('planned_quantity', parseInt(e.target.value) || 0)}
                                    type="number"
                                    min="1"
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl font-bold"
                                />
                            </div>

                            {/* Required Ingredients Live Preview */}
                            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                                    <span>Ingredients Required from Kitchen Pantry:</span>
                                    <span className={`text-[10px] ${hasEnoughStockToStart ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}`}>
                                        {hasEnoughStockToStart ? 'Stock Sufficient' : 'Insufficient Stock'}
                                    </span>
                                </h4>
                                <div className="space-y-1 max-h-36 overflow-y-auto">
                                    {requiredIngredientsPreview.map((ing, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between py-1 text-[11px] border-b border-stone-100 last:border-0"
                                        >
                                            <span className="text-stone-700">{ing.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-bold ${ing.hasEnough ? 'text-stone-900' : 'text-rose-600'}`}>
                                                    Need: {ing.totalNeeded.toFixed(2)} {ing.unit}
                                                </span>
                                                <span className="text-stone-400 text-[10px]">(Have: {ing.kitchen_stock} {ing.unit})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Notes (Optional)</label>
                                <input
                                    value={startData.notes}
                                    onChange={(e) => setStartData('notes', e.target.value)}
                                    type="text"
                                    placeholder="Special morning run, catering order, etc."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowStartModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!hasEnoughStockToStart || startProcessing}
                                    className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Confirm & Start Baking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* COMPLETE BATCH MODAL */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <h3 className="font-serif text-lg font-bold text-stone-900">Finish Production Batch</h3>
                            <button onClick={() => setShowCompleteModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCompleteBatch} className="mt-4 space-y-4 text-xs">
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="font-bold text-stone-900 text-sm">{completingBatch?.product?.name}</div>
                                <div className="text-stone-500 mt-1">
                                    Planned batch output: <strong>{completingBatch?.planned_quantity} cakes</strong>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Actual Finished Good Cakes</label>
                                <input
                                    value={completeData.actual_quantity}
                                    onChange={(e) => setCompleteData('actual_quantity', e.target.value)}
                                    type="number"
                                    min="0"
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm font-extrabold"
                                />
                                <p className="text-[11px] text-stone-500 mt-1">
                                    System will automatically consume standard recipe ingredients from Kitchen Pantry stock.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Notes (Optional)</label>
                                <textarea
                                    value={completeData.notes}
                                    onChange={(e) => setCompleteData('notes', e.target.value)}
                                    rows="2"
                                    placeholder="e.g. Perfect golden crust, zero defects..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCompleteModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={completeProcessing}
                                    className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Record Actual Output & Complete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
