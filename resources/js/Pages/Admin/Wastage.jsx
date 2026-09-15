import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Trash2,
    AlertTriangle,
    Cake,
    Layers,
    DollarSign,
    UserCheck,
    Filter
} from 'lucide-react';

export default function Wastage({ wastages = [], summary = {} }) {
    const [selectedStage, setSelectedStage] = useState('all');

    const filteredWastages = useMemo(() => {
        if (selectedStage === 'all') return wastages;
        return wastages.filter(w => w.stage === selectedStage);
    }, [wastages, selectedStage]);

    return (
        <AppLayout>
            <Head title="Wastage & Loss Audit - Admin" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Wastage, Spoilage & Yield Loss Audit
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Track raw ingredient spoilage, kitchen baking defects, counter expirations, and calculated lost cake capacity.
                    </p>
                </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Total Financial Loss</span>
                    <div className="mt-2 text-3xl font-extrabold text-rose-600">
                        -${Number(summary?.total_cost_loss || 0).toFixed(2)}
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Across all stages</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Total Lost Cake Potential</span>
                    <div className="mt-2 text-3xl font-extrabold text-amber-700">
                        -{summary?.total_lost_cakes || 0} Cakes
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Derived from wasted raw ingredients</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Kitchen Spoilage</span>
                    <div className="mt-2 text-2xl font-extrabold text-stone-800">
                        -${Number(summary?.kitchen_loss || 0).toFixed(2)}
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Baking & prep defects</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Sales Counter Expiry</span>
                    <div className="mt-2 text-2xl font-extrabold text-stone-800">
                        -${Number(summary?.counter_loss || 0).toFixed(2)}
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Unsold display shelf life</span>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2 mb-4">
                <button
                    type="button"
                    onClick={() => setSelectedStage('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedStage === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                >
                    All Wastage Stages
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedStage('raw_material')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedStage === 'raw_material' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                >
                    Raw Materials (Pantry)
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedStage('kitchen_production')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedStage === 'kitchen_production' ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                >
                    Kitchen In-Process
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedStage('sales_counter')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedStage === 'sales_counter' ? 'bg-rose-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                >
                    Sales Counter Unsold
                </button>
            </div>

            {/* Wastage Logs Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Tracking Code</th>
                                <th className="py-3 px-4">Stage</th>
                                <th className="py-3 px-4">Item & Quantity</th>
                                <th className="py-3 px-4">Reason</th>
                                <th className="py-3 px-4 text-center">Lost Cake Equivalent</th>
                                <th className="py-3 px-4 text-right">Cost Loss</th>
                                <th className="py-3 px-4 text-right">Reported By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredWastages.map((w) => (
                                <tr key={w.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-700">
                                        {w.tracking_code}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                w.stage === 'raw_material' ? 'bg-amber-100 text-amber-800' :
                                                w.stage === 'kitchen_production' ? 'bg-purple-100 text-purple-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}
                                        >
                                            {w.stage?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                                        {w.ingredient && <div>{w.ingredient.name}</div>}
                                        {w.product && <div>{w.product.name}</div>}
                                        <div className="text-[11px] text-stone-500 font-normal">
                                            Wasted: <strong>{w.quantity} {w.unit}</strong>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-600 capitalize">
                                        <span className="font-medium text-stone-800">{w.reason?.replace('_', ' ')}</span>
                                        {w.notes && <div className="text-[10px] text-stone-400 truncate max-w-xs">{w.notes}</div>}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        {w.potential_product_loss_qty > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                                -{w.potential_product_loss_qty} cakes
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 text-[11px]">N/A</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                                        -${Number(w.cost_loss).toFixed(2)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-stone-500">
                                        <div>{w.reporter?.name}</div>
                                        <span className="text-[10px] text-stone-400">{new Date(w.created_at).toLocaleDateString()}</span>
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
