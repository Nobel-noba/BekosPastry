import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Activity,
    TrendingUp,
    AlertTriangle,
    Package,
    ChefHat,
    DollarSign,
    FileCheck,
    Trash2,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react';

export default function Dashboard({
    metrics,
    capacity_overview = [],
    low_stock_ingredients = [],
    recent_batches = [],
    recent_wastages = []
}) {
    const getYieldBadgeColor = (yieldVal) => {
        if (yieldVal >= 95) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
        if (yieldVal >= 85) return 'text-amber-700 bg-amber-100 border-amber-300';
        return 'text-rose-700 bg-rose-100 border-rose-300';
    };

    return (
        <AppLayout>
            <Head title="Owner Productivity Dashboard" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Kitchen Productivity & Efficiency Overview
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Monitor resource-to-cake yields, raw ingredient allocations, and operational loss in real-time.
                    </p>
                </div>
                <div className="flex items-center space-x-2.5">
                    <Link
                        href="/admin/supplies"
                        className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Package className="w-4 h-4" />
                        <span>Assign Supplies to Kitchen</span>
                    </Link>
                    {metrics?.pending_recipes_count > 0 && (
                        <Link
                            href="/admin/recipes"
                            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs animate-bounce cursor-pointer"
                        >
                            <FileCheck className="w-4 h-4" />
                            <span>{metrics.pending_recipes_count} Pending Recipes</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 4 Primary KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Kitchen Yield Efficiency Card */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Yield Productivity</span>
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <TrendingUp className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-stone-900">{metrics?.average_yield_efficiency}%</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getYieldBadgeColor(metrics?.average_yield_efficiency || 0)}`}>
                            Target &ge; 95%
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-stone-500">
                        Produced <strong className="text-stone-800">{metrics?.total_cakes_produced}</strong> of {metrics?.total_cakes_planned} planned cakes
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                            className="bg-amber-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(metrics?.average_yield_efficiency || 0, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Total Sales Revenue */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Sales Revenue</span>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-stone-900">
                        ${Number(metrics?.total_sales_revenue || 0).toFixed(2)}
                    </div>
                    <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                        <span>Gross Material Spend:</span>
                        <strong className="text-stone-800">${Number(metrics?.total_supply_spend || 0).toFixed(2)}</strong>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-4/5"></div>
                    </div>
                </div>

                {/* Total Wastage & Spoilage Loss */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Recorded Wastage Loss</span>
                        <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <Trash2 className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-rose-600">
                        -${Number(metrics?.total_wastage_loss || 0).toFixed(2)}
                    </div>
                    <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                        <span>Estimated Cakes Lost:</span>
                        <strong className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
                            -{metrics?.total_lost_cake_potential || 0} cakes
                        </strong>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div className="bg-rose-500 h-1.5 rounded-full w-1/4"></div>
                    </div>
                </div>

                {/* Estimated Operational Net Margin */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Est. Operating Margin</span>
                        <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <Activity className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-stone-900">
                        ${Number(metrics?.net_estimated_profit || 0).toFixed(2)}
                    </div>
                    <div className="mt-2 text-xs text-stone-500">
                        Sales minus total recorded waste loss
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full w-3/4"></div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Kitchen Capacity Matrix & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left: Resource Capacity - How many cakes can the kitchen make right now? */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-serif font-bold text-stone-900">
                                Current Kitchen Resource Capacity (Theoretical Yield)
                            </h2>
                            <p className="text-xs text-stone-500">
                                Bottleneck cakes possible right now using current allocated kitchen ingredients.
                            </p>
                        </div>
                        <Link href="/admin/products" className="text-xs text-amber-600 font-semibold hover:text-amber-800">
                            View Products &rarr;
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-semibold">
                                    <th className="pb-2.5">Product Name</th>
                                    <th className="pb-2.5">Category</th>
                                    <th className="pb-2.5">In Kitchen Ready</th>
                                    <th className="pb-2.5">On Counter</th>
                                    <th className="pb-2.5 text-right">Potential Yield from Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {capacity_overview.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-stone-50/50">
                                        <td className="py-3 font-semibold text-stone-900 flex items-center space-x-2">
                                            <span className={`w-2 h-2 rounded-full ${prod.has_approved_recipe ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                                            <span>{prod.name}</span>
                                        </td>
                                        <td className="py-3 text-stone-600">{prod.category}</td>
                                        <td className="py-3 font-medium text-stone-700">{prod.kitchen_ready_stock} ready</td>
                                        <td className="py-3 font-medium text-stone-700">{prod.current_display_stock} on display</td>
                                        <td className="py-3 text-right">
                                            {prod.has_approved_recipe ? (
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        prod.possible_from_kitchen_stock > 5
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {prod.possible_from_kitchen_stock} cakes possible
                                                </span>
                                            ) : (
                                                <span className="text-stone-400 text-[11px] italic">
                                                    No approved recipe
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Low Kitchen Stock Warnings & Quick Allocate */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-rose-600">
                            <AlertTriangle className="w-5 h-5" />
                            <h2 className="text-base font-serif font-bold text-stone-900">Low Stock in Kitchen</h2>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                            {low_stock_ingredients.length} Alert
                        </span>
                    </div>

                    {low_stock_ingredients.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                            <p className="text-sm font-medium text-stone-700">Kitchen Pantry Stock Optimal</p>
                            <p className="text-xs text-stone-400 mt-1">All kitchen ingredients exceed their minimum alert thresholds.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
                            {low_stock_ingredients.map((ing) => (
                                <div
                                    key={ing.id}
                                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between"
                                >
                                    <div>
                                        <div className="text-xs font-bold text-stone-900">{ing.name}</div>
                                        <div className="text-[11px] text-rose-700 font-medium">
                                            Kitchen has: <strong>{ing.kitchen_stock} {ing.unit}</strong> (Min: {ing.minimum_alert_level})
                                        </div>
                                        <div className="text-[10px] text-stone-500">
                                            Central Store has: {ing.main_store_stock} {ing.unit} available
                                        </div>
                                    </div>
                                    <Link
                                        href="/admin/supplies"
                                        className="text-xs px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold whitespace-nowrap shadow-xs cursor-pointer"
                                    >
                                        Allocate
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 mt-auto border-t border-stone-100">
                        <Link
                            href="/admin/supplies"
                            className="w-full flex justify-center items-center space-x-2 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                        >
                            <span>Manage All Supplies & Dispatches</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Batches & Recent Wastage Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Batches */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-serif font-bold text-stone-900">Recent Kitchen Production Batches</h2>
                        <span className="text-xs text-stone-500">Latest 5 runs</span>
                    </div>
                    <div className="space-y-2.5">
                        {recent_batches.map((batch) => (
                            <div
                                key={batch.id}
                                className="p-3 rounded-xl border border-stone-100 bg-stone-50/70 flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-stone-900">{batch.product?.name}</div>
                                    <div className="text-[11px] text-stone-500">
                                        {batch.batch_code} &bull; Chef: {batch.chef?.name}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-extrabold text-stone-900">
                                        {batch.actual_quantity} / {batch.planned_quantity} cakes
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            batch.yield_efficiency_percent >= 95
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {batch.yield_efficiency_percent}% Yield
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Wastage Events */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-serif font-bold text-stone-900">Recent Wastage Log & Lost Cake Yields</h2>
                        <Link href="/admin/wastage" className="text-xs text-amber-600 font-semibold hover:text-amber-800 cursor-pointer">
                            Full Audit &rarr;
                        </Link>
                    </div>
                    <div className="space-y-2.5">
                        {recent_wastages.map((waste) => (
                            <div
                                key={waste.id}
                                className="p-3 rounded-xl border border-stone-100 bg-stone-50/70 flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-stone-900">
                                        {waste.ingredient ? `${waste.ingredient.name} (${waste.quantity} ${waste.unit})` : waste.product ? `${waste.product.name} (${waste.quantity} ${waste.unit})` : ''}
                                    </div>
                                    <div className="text-[11px] text-stone-500 capitalize">
                                        Stage: {waste.stage?.replace('_', ' ')} &bull; Reason: {waste.reason?.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-extrabold text-rose-600">
                                        -${Number(waste.cost_loss || 0).toFixed(2)}
                                    </div>
                                    <div className="text-[11px] text-rose-700 font-medium">
                                        -{waste.potential_product_loss_qty} cakes potential lost
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
