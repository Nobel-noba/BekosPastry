import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    PackageCheck,
    Cake
} from 'lucide-react';

export default function SalesTransfers({ transfers = [] }) {
    const handleReceive = (transfer) => {
        router.post(`/sales/transfers/${transfer.id}/receive`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Incoming Transfers - Sales" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Incoming Pastry Transfers from Kitchen
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Review and acknowledge fresh pastries dispatched by the Chef to add them to your POS counter stock.
                    </p>
                </div>
            </div>

            {/* Transfers Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-serif font-bold text-stone-900">Transfer Slips</h2>
                        <p className="text-xs text-stone-500">History of kitchen-to-counter handovers.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{transfers.length} Total Slips</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Transfer Code</th>
                                <th className="py-3 px-4">Pastry Product</th>
                                <th className="py-3 px-4 text-center">Dispatched Qty</th>
                                <th className="py-3 px-4">Dispatched By</th>
                                <th className="py-3 px-4">Timestamp</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
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
                                        +{t.quantity} units
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-600">
                                        {t.chef?.name}
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
                                    <td className="py-3.5 px-4 text-right">
                                        {t.status === 'pending' ? (
                                            <button
                                                type="button"
                                                onClick={() => handleReceive(t)}
                                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5 ml-auto"
                                            >
                                                <PackageCheck className="w-3.5 h-3.5" />
                                                <span>Accept & Stock</span>
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-stone-400">
                                                Received by {t.sales?.name || 'You'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
