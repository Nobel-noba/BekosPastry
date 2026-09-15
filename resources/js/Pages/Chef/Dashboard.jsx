import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    ChefHat,
    UtensilsCrossed,
    ArrowLeftRight,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Package,
    TrendingUp,
    Cake,
    Plus,
    X
} from 'lucide-react';

export default function ChefDashboard({
    kitchen_ingredients = [],
    bakeable_products = [],
    active_batches = [],
    pending_recipes = [],
    metrics = {}
}) {
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completingBatch, setCompletingBatch] = useState(null);

    const { data: completeData, setData: setCompleteData, post: postComplete, processing: completeProcessing, reset: resetComplete } = useForm({
        actual_quantity: '',
        notes: '',
    });

    const openCompleteModal = (batch) => {
        setCompletingBatch(batch);
        setCompleteData({
            actual_quantity: batch.planned_quantity,
            notes: '',
        });
        setShowCompleteModal(true);
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
            <Head title="Chef Kitchen Station" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Kitchen Station & Baking Operations
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Monitor pantry stock, bake approved batches, transfer finished pastries to sales, and log kitchen wastage.
                    </p>
                </div>
                <div className="flex items-center space-x-2.5">
                    <Link
                        href="/chef/production"
                        className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Baking Batch</span>
                    </Link>
                    <Link
                        href="/chef/recipes"
                        className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-stone-500" />
                        <span>Formulate Recipe</span>
                    </Link>
                </div>
            </div>

            {/* 4 Chef Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Today's Baked Output</span>
                    <div className="mt-2 text-3xl font-extrabold text-stone-900">
                        {metrics.today_cakes_produced || 0} Cakes
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">
                        Across {metrics.completed_batches_today || 0} completed batches
                    </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Today's Batch Yield</span>
                    <div className="mt-2 text-3xl font-extrabold text-emerald-600">
                        {metrics.today_avg_yield || 0}%
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Actual vs Planned Yield</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Active In-Oven / Prep</span>
                    <div className="mt-2 text-3xl font-extrabold text-amber-600">
                        {metrics.active_batch_count || 0} Batches
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Currently in progress</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Pending Admin Approvals</span>
                    <div className="mt-2 text-3xl font-extrabold text-stone-900">
                        {pending_recipes.length} Recipes
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Submitted for approval</span>
                </div>
            </div>

            {/* Active Batches In Progress Section (If Any) */}
            {active_batches.length > 0 && (
                <div className="mb-6 bg-amber-500/10 border border-amber-300 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-amber-900">
                            <Clock className="w-5 h-5 text-amber-700 animate-spin" />
                            <h2 className="font-serif font-bold text-base">Active Production Batches in Progress</h2>
                        </div>
                        <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                            {active_batches.length} Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {active_batches.map((batch) => (
                            <div
                                key={batch.id}
                                className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-serif font-bold text-stone-900 text-sm">{batch.product?.name}</div>
                                    <div className="text-xs text-stone-500 mt-0.5">
                                        Batch Code: <strong className="font-mono">{batch.batch_code}</strong> &bull; Target: <strong>{batch.planned_quantity} units</strong>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openCompleteModal(batch)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                                >
                                    Complete Batch &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Section: What We Can Bake Right Now (Capacity) & Kitchen Pantry Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left 2 Cols: What Can We Bake Right Now? */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-serif font-bold text-stone-900">
                                "What Can We Bake Today?" — Real-time Recipe Potential
                            </h2>
                            <p className="text-xs text-stone-500">
                                Based on your approved recipes and current kitchen ingredients on-hand.
                            </p>
                        </div>
                        <Link href="/chef/production" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                            Start Batch &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {bakeable_products.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-serif font-bold text-stone-900 text-sm">{item.name}</h3>
                                        {item.has_approved_recipe ? (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                                Recipe Approved
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                Needs Approval
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-stone-500 mt-1">
                                        Kitchen ready stock: <strong>{item.kitchen_ready_stock} cakes</strong>
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-stone-400 block font-bold uppercase">Max Can Bake</span>
                                        {item.has_approved_recipe ? (
                                            <span
                                                className={`text-lg font-extrabold ${
                                                    item.max_possible_batches > 0 ? 'text-emerald-700' : 'text-rose-600'
                                                }`}
                                            >
                                                {item.max_possible_batches} cakes
                                            </span>
                                        ) : (
                                            <span className="text-xs text-stone-400 italic">Locked</span>
                                        )}
                                    </div>
                                    {item.has_approved_recipe && item.max_possible_batches > 0 && (
                                        <Link
                                            href="/chef/production"
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                                        >
                                            Bake Now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right 1 Col: Kitchen Pantry Stock Levels */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-serif font-bold text-stone-900">Kitchen Pantry Stock</h2>
                        <span className="text-xs text-stone-400">{kitchen_ingredients.length} items</span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                        {kitchen_ingredients.map((ing) => (
                            <div
                                key={ing.id}
                                className="p-2.5 rounded-xl border border-stone-100 bg-stone-50/70 flex items-center justify-between text-xs"
                            >
                                <div>
                                    <div className="font-bold text-stone-900">{ing.name}</div>
                                    <div className="text-[10px] text-stone-400">Min alert: {ing.minimum_alert_level} {ing.unit}</div>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`font-extrabold text-sm ${
                                            Number(ing.kitchen_stock) <= Number(ing.minimum_alert_level) ? 'text-rose-600' : 'text-stone-800'
                                        }`}
                                    >
                                        {ing.kitchen_stock} {ing.unit}
                                    </span>
                                    {Number(ing.kitchen_stock) <= Number(ing.minimum_alert_level) && (
                                        <div className="text-[10px] text-rose-600 font-bold">
                                            Low Stock
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* COMPLETE BATCH MODAL */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <h3 className="font-serif text-lg font-bold text-stone-900">Complete Production Batch</h3>
                            <button onClick={() => setShowCompleteModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCompleteBatch} className="mt-4 space-y-4 text-xs">
                            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                                <div className="font-bold text-stone-900 text-sm">{completingBatch?.product?.name}</div>
                                <div className="text-stone-500 mt-1">
                                    Planned batch output: <strong>{completingBatch?.planned_quantity} cakes</strong>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Actual Good Cakes Produced</label>
                                <input
                                    value={completeData.actual_quantity}
                                    onChange={(e) => setCompleteData('actual_quantity', e.target.value)}
                                    type="number"
                                    min="0"
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl font-extrabold text-sm"
                                />
                                <p className="text-[11px] text-stone-500 mt-1">
                                    The system will compute batch yield efficiency % and automatically deduct ingredients from your kitchen pantry stock.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Baking Notes (Optional)</label>
                                <textarea
                                    value={completeData.notes}
                                    onChange={(e) => setCompleteData('notes', e.target.value)}
                                    rows="2"
                                    placeholder="e.g. Clean bake, 100% texture quality..."
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
                                    Finish & Record Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
