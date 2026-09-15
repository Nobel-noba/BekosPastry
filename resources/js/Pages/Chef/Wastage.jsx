import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Trash2,
    Plus,
    AlertTriangle,
    X,
    Cake,
    Layers,
    DollarSign
} from 'lucide-react';

export default function ChefWastage({
    ingredients = [],
    products = [],
    wastages = []
}) {
    const [showWastageModal, setShowWastageModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        stage: 'raw_material', // raw_material, kitchen_production
        ingredient_id: ingredients[0]?.id || '',
        product_id: products[0]?.id || '',
        quantity: '',
        reason: 'spilled_damaged',
        notes: '',
    });

    const selectedIngredient = useMemo(() => {
        return ingredients.find(i => String(i.id) === String(data.ingredient_id));
    }, [ingredients, data.ingredient_id]);

    const selectedProduct = useMemo(() => {
        return products.find(p => String(p.id) === String(data.product_id));
    }, [products, data.product_id]);

    // Calculate live potential lost cakes estimation
    const estimatedLostCakes = useMemo(() => {
        if (data.stage === 'kitchen_production') {
            return Number(data.quantity) || 0;
        }

        if (!selectedIngredient || !data.quantity) return 0;

        const qty = Number(data.quantity);
        const name = selectedIngredient.name.toLowerCase();
        if (name.includes('flour')) {
            return Math.floor(qty / 0.5);
        } else if (name.includes('sugar')) {
            return Math.floor(qty / 0.35);
        } else if (name.includes('cocoa')) {
            return Math.floor(qty / 0.2);
        } else if (name.includes('butter')) {
            return Math.floor(qty / 0.25);
        } else if (name.includes('milk')) {
            return Math.floor(qty / 0.25);
        } else if (name.includes('cheese')) {
            return Math.floor(qty / 0.8);
        }

        return Math.floor(qty / 0.3) || 1;
    }, [data.stage, data.quantity, selectedIngredient]);

    const openCreateModal = () => {
        reset();
        setData({
            stage: 'raw_material',
            ingredient_id: ingredients[0]?.id || '',
            product_id: products[0]?.id || '',
            quantity: '',
            reason: 'spilled_damaged',
            notes: '',
        });
        setShowWastageModal(true);
    };

    const submitWastage = (e) => {
        e.preventDefault();
        post('/chef/wastage', {
            onSuccess: () => {
                setShowWastageModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Kitchen Wastage & Yield Loss - Chef" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Kitchen Wastage & Lost Yield Registration
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Record raw material spoilage, spills, or baking defects. The system automatically recalculates lost cake capacity.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Log Kitchen Wastage</span>
                </button>
            </div>

            {/* Wastage Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-serif font-bold text-stone-900">Kitchen Wastage Entries</h2>
                        <p className="text-xs text-stone-500">Trace raw material losses and ruined bakes.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{wastages.length} Incidents</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Tracking Code</th>
                                <th className="py-3 px-4">Stage</th>
                                <th className="py-3 px-4">Item & Wasted Quantity</th>
                                <th className="py-3 px-4">Reason / Notes</th>
                                <th className="py-3 px-4 text-center">Lost Cake Equivalent</th>
                                <th className="py-3 px-4 text-right">Cost Loss</th>
                                <th className="py-3 px-4 text-right">Reported At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {wastages.map((w) => (
                                <tr key={w.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                                        {w.tracking_code}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                w.stage === 'raw_material' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                                            }`}
                                        >
                                            {w.stage === 'raw_material' ? 'Raw Ingredient' : 'Baking Defect'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                                        {w.ingredient && <div>{w.ingredient.name}</div>}
                                        {w.product && <div>{w.product.name}</div>}
                                        <div className="text-[11px] text-stone-500 font-normal">
                                            {w.quantity} {w.unit}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-600 capitalize">
                                        <span className="font-medium text-stone-800">{w.reason?.replace('_', ' ')}</span>
                                        {w.notes && <div className="text-[10px] text-stone-400">{w.notes}</div>}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        {w.potential_product_loss_qty > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                                -{w.potential_product_loss_qty} cakes lost
                                            </span>
                                        ) : (
                                            <span className="text-stone-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                                        -${Number(w.cost_loss).toFixed(2)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-stone-500">
                                        {new Date(w.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LOG WASTAGE MODAL */}
            {showWastageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-rose-600">
                                <Trash2 className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Record Kitchen Wastage</h3>
                            </div>
                            <button onClick={() => setShowWastageModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitWastage} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Wastage Stage / Type</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setData('stage', 'raw_material')}
                                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                                            data.stage === 'raw_material' ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                                        }`}
                                    >
                                        Raw Ingredient (Pantry)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('stage', 'kitchen_production')}
                                        className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                                            data.stage === 'kitchen_production' ? 'bg-purple-600 text-white border-purple-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                                        }`}
                                    >
                                        Baked Cake Defect
                                    </button>
                                </div>
                            </div>

                            {/* Item selector */}
                            {data.stage === 'raw_material' ? (
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Select Raw Ingredient</label>
                                    <select
                                        value={data.ingredient_id}
                                        onChange={(e) => setData('ingredient_id', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    >
                                        {ingredients.map((ing) => (
                                            <option key={ing.id} value={ing.id}>
                                                {ing.name} (Pantry stock: {ing.kitchen_stock} {ing.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Select Pastry / Cake</label>
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    >
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Kitchen stock: {p.kitchen_ready_stock} units)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block font-bold uppercase text-stone-700">
                                    Wasted Quantity ({data.stage === 'raw_material' ? (selectedIngredient?.unit || 'units') : 'Cakes'})
                                </label>
                                <input
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    placeholder="e.g. 2.5"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl font-bold"
                                />
                            </div>

                            {/* Live Lost Cake Potential Alert */}
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                                <div className="font-bold flex items-center space-x-1">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                    <span>Yield Productivity Impact:</span>
                                </div>
                                <p className="mt-1">
                                    This wastage destroys approximately <strong className="text-rose-700 font-extrabold text-sm">-{estimatedLostCakes} cakes</strong> in potential production that the kitchen could have produced.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Reason</label>
                                <select
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                >
                                    <option value="spilled_damaged">Spilled / Dropped</option>
                                    <option value="expired">Expired / Soured</option>
                                    <option value="burned_overbaked">Burned / Overbaked</option>
                                    <option value="temperature_failure">Fridge / Temperature Issue</option>
                                    <option value="quality_rejection">Failed Texture / Visual Quality</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Notes (Optional)</label>
                                <input
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    type="text"
                                    placeholder="Details regarding the incident..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowWastageModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Deduct & Record Wastage
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
