import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    ArrowLeftRight,
    Plus,
    CheckCircle2,
    Clock,
    X,
    Cake,
    PackageCheck
} from 'lucide-react';

export default function ChefTransfers({
    products = [],
    transfers = []
}) {
    const [showTransferModal, setShowTransferModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        product_id: products[0]?.id || '',
        quantity: 1,
        notes: '',
    });

    const selectedProduct = products.find(p => String(p.id) === String(data.product_id)) || products[0] || null;

    const openCreateModal = () => {
        reset();
        if (products.length > 0) {
            setData({
                product_id: products[0].id,
                quantity: 1,
                notes: '',
            });
        }
        setShowTransferModal(true);
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        post('/chef/transfers', {
            onSuccess: () => {
                setShowTransferModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Product Transfers to Sales - Chef" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Product Transfers to Front Sales Counter
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Send freshly baked pastries from the kitchen to the sales display counter for retail sale.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={products.length === 0}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Transfer to Sales</span>
                </button>
            </div>

            {/* Transfers Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-serif font-bold text-stone-900">Transfer Slips History</h2>
                        <p className="text-xs text-stone-500">Track pending and acknowledged counter handovers.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{transfers.length} Transfers</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Transfer Slip #</th>
                                <th className="py-3 px-4">Product Transferred</th>
                                <th className="py-3 px-4 text-center">Quantity</th>
                                <th className="py-3 px-4">Dispatched At</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Received By Cashier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {transfers.map((t) => (
                                <tr key={t.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                                        {t.transfer_code}
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                                        {t.product?.name}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-extrabold text-stone-900 text-sm">
                                        {t.quantity} units
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-500">
                                        {new Date(t.transferred_at).toLocaleString()}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                t.status === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                                            }`}
                                        >
                                            <span>{t.status}</span>
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-stone-600">
                                        {t.sales ? (
                                            <span>{t.sales.name}</span>
                                        ) : (
                                            <span className="text-stone-400 italic">Waiting cashier...</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TRANSFER MODAL */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-emerald-600">
                                <ArrowLeftRight className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Transfer Cakes to Sales</h3>
                            </div>
                            <button onClick={() => setShowTransferModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitTransfer} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Select Ready Product</label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    required
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Kitchen has: {p.kitchen_ready_stock} ready)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Quantity to Transfer</label>
                                <input
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                    type="number"
                                    min="1"
                                    max={selectedProduct?.kitchen_ready_stock || 100}
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl font-bold"
                                />
                                <p className="text-[11px] text-stone-500 mt-1">
                                    Units will be deducted from kitchen inventory and queued for the sales counter cashier to accept.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Notes for Front Counter (Optional)</label>
                                <input
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    type="text"
                                    placeholder="e.g. Warm batch straight from oven"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Send Transfer Slip
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
