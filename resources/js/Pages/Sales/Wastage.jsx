import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Trash2,
    Plus,
    AlertTriangle,
    X,
    Cake,
    DollarSign
} from 'lucide-react';

export default function SalesWastage({ products = [], wastages = [] }) {
    const [showWastageModal, setShowWastageModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        product_id: products[0]?.id || '',
        quantity: 1,
        reason: 'expired',
        notes: '',
    });

    const openCreateModal = () => {
        reset();
        if (products.length > 0) {
            setData({
                product_id: products[0].id,
                quantity: 1,
                reason: 'expired',
                notes: '',
            });
        }
        setShowWastageModal(true);
    };

    const submitWastage = (e) => {
        e.preventDefault();
        post('/sales/wastage', {
            onSuccess: () => {
                setShowWastageModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Counter Wastage & Expiry - Sales" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Counter Wastage & Expiry Registration
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Record end-of-day unsold expired pastries or damaged display goods to maintain accurate retail inventory.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Log Counter Wastage</span>
                </button>
            </div>

            {/* Wastage Logs Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-serif font-bold text-stone-900">Display Counter Wastage History</h2>
                        <p className="text-xs text-stone-500">Items removed from retail counter inventory.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{wastages.length} Records</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Tracking Code</th>
                                <th className="py-3 px-4">Pastry Product</th>
                                <th className="py-3 px-4 text-center">Wasted Qty</th>
                                <th className="py-3 px-4">Reason</th>
                                <th className="py-3 px-4 text-right">Cost Loss</th>
                                <th className="py-3 px-4 text-right">Date Reported</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {wastages.map((w) => (
                                <tr key={w.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                                        {w.tracking_code}
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                                        {w.product?.name}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-extrabold text-stone-900">
                                        {w.quantity} units
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-600 capitalize">
                                        <span className="font-medium text-stone-800">{w.reason?.replace('_', ' ')}</span>
                                        {w.notes && <div className="text-[10px] text-stone-400">{w.notes}</div>}
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

            {/* WASTAGE MODAL */}
            {showWastageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-rose-600">
                                <Trash2 className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Log Counter Wastage</h3>
                            </div>
                            <button onClick={() => setShowWastageModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitWastage} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Select Pastry</label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    required
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Display stock: {p.current_display_stock} units)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Quantity Removed / Wasted</label>
                                <input
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                    type="number"
                                    min="1"
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Reason</label>
                                <select
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                >
                                    <option value="expired">Unsold / Passed Shelf Life Limit</option>
                                    <option value="spilled_damaged">Dropped / Counter Display Damage</option>
                                    <option value="quality_rejection">Dry / Texture Loss</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Notes (Optional)</label>
                                <input
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    type="text"
                                    placeholder="e.g. End of day 48-hour shelf-life expiration"
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
                                    Deduct from Display & Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
