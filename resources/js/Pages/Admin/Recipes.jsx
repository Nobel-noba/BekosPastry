import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    FileCheck,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Utensils,
    DollarSign,
    Sparkles,
    ChefHat,
    X
} from 'lucide-react';

export default function Recipes({ recipes = [] }) {
    const [currentTab, setCurrentTab] = useState('pending_approval');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingRecipe, setRejectingRecipe] = useState(null);

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, reset: resetReject } = useForm({
        admin_feedback: '',
    });

    const filteredRecipes = useMemo(() => {
        if (currentTab === 'all') return recipes;
        return recipes.filter(r => r.status === currentTab);
    }, [recipes, currentTab]);

    const pendingCount = useMemo(() => {
        return recipes.filter(r => r.status === 'pending_approval').length;
    }, [recipes]);

    const openRejectModal = (recipe) => {
        setRejectingRecipe(recipe);
        setRejectData('admin_feedback', '');
        setShowRejectModal(true);
    };

    const handleApprove = (recipe) => {
        if (window.confirm(`Approve recipe for "${recipe.product_name}"? This will unlock kitchen production batches for this product.`)) {
            router.post(`/admin/recipes/${recipe.id}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const submitReject = (e) => {
        e.preventDefault();
        if (!rejectingRecipe) return;
        postReject(`/admin/recipes/${rejectingRecipe.id}/reject`, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectingRecipe(null);
                resetReject();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Recipe Approvals - Admin" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Recipe Approvals & Formulation Review
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Chefs submit ingredient ratios for products. Review cost, yield impact, and approve recipes to unlock kitchen production.
                    </p>
                </div>
                {pendingCount > 0 && (
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        <span>{pendingCount} Recipe(s) Awaiting Your Review</span>
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 border-b border-stone-200 mb-6 pb-2">
                <button
                    onClick={() => setCurrentTab('pending_approval')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                        currentTab === 'pending_approval' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    <span>Pending Approval</span>
                    {pendingCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-800 font-extrabold">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setCurrentTab('approved')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentTab === 'approved' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    Approved Recipes
                </button>
                <button
                    onClick={() => setCurrentTab('rejected')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentTab === 'rejected' ? 'bg-rose-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    Rejected / Needs Revision
                </button>
                <button
                    onClick={() => setCurrentTab('all')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentTab === 'all' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    All Recipes
                </button>
            </div>

            {/* Recipe Cards Grid */}
            {filteredRecipes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-serif text-lg font-bold text-stone-800">No recipes in this status</p>
                    <p className="text-xs text-stone-500 mt-1">Check back when the chef formulates new recipes or updates ratios.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            className={`bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between ${
                                recipe.status === 'pending_approval' ? 'ring-2 ring-amber-400/40' : ''
                            }`}
                        >
                            <div>
                                {/* Top Bar: Title, Category, Status */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-serif text-lg font-bold text-stone-900">{recipe.product_name}</h3>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                                                v{recipe.version}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-500">
                                            Category: <strong>{recipe.product_category}</strong> &bull; Formulated by: <strong>{recipe.created_by_name}</strong>
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        {recipe.status === 'approved' && (
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Approved</span>
                                            </span>
                                        )}
                                        {recipe.status === 'pending_approval' && (
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Pending Approval</span>
                                            </span>
                                        )}
                                        {recipe.status !== 'approved' && recipe.status !== 'pending_approval' && (
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Rejected</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Economics Card: Cost vs Selling Price */}
                                <div className="my-4 p-3.5 rounded-xl bg-stone-50 border border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                                    <div>
                                        <span className="text-stone-400 block uppercase tracking-wider text-[10px] font-bold">Standard Cost</span>
                                        <span className="font-bold text-stone-900 text-sm">${Number(recipe.total_cost).toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block uppercase tracking-wider text-[10px] font-bold">Selling Price</span>
                                        <span className="font-bold text-stone-900 text-sm">${Number(recipe.selling_price).toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block uppercase tracking-wider text-[10px] font-bold">Gross Margin</span>
                                        <span className="font-bold text-emerald-700 text-sm">
                                            {recipe.selling_price > 0 ? Math.round(((recipe.selling_price - recipe.total_cost) / recipe.selling_price) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Ingredient BOM Table */}
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                        Bill of Materials (BOM per batch):
                                    </h4>
                                    <div className="space-y-1.5">
                                        {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-stone-50/60 border border-stone-100"
                                            >
                                                <span className="font-medium text-stone-800">{ing.ingredient_name}</span>
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-stone-900">{ing.quantity_required} {ing.unit}</span>
                                                    <span className="text-[10px] text-stone-400">
                                                        (Pantry: {ing.ingredient_kitchen_stock} {ing.unit})
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructions / Chef notes */}
                                {recipe.instructions && (
                                    <div className="mb-4 text-xs text-stone-600 bg-stone-50/40 p-2.5 rounded-lg border border-stone-100">
                                        <strong className="text-stone-800">Preparation notes:</strong> {recipe.instructions}
                                    </div>
                                )}

                                {/* Admin Feedback / Rejection reason if any */}
                                {recipe.admin_feedback && (
                                    <div className={`mb-4 text-xs p-2.5 rounded-lg ${
                                        recipe.status === 'rejected' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                    }`}>
                                        <strong>Admin Feedback:</strong> {recipe.admin_feedback}
                                    </div>
                                )}
                            </div>

                            {/* Admin Action Buttons */}
                            <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-2.5">
                                {recipe.status === 'pending_approval' ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => openRejectModal(recipe)}
                                            className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                                        >
                                            Reject with Feedback
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(recipe)}
                                            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Approve & Unlock Production</span>
                                        </button>
                                    </>
                                ) : recipe.status === 'approved' ? (
                                    <span className="text-xs text-stone-400">
                                        Approved by {recipe.approved_by_name || 'Admin'} on {recipe.approved_at}
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleApprove(recipe)}
                                        className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-200 cursor-pointer"
                                    >
                                        Re-approve Recipe
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* REJECT MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-rose-600">
                                <XCircle className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Reject Recipe Formulation</h3>
                            </div>
                            <button onClick={() => setShowRejectModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitReject} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-700">Reason for Rejection & Feedback for Chef</label>
                                <textarea
                                    value={rejectData.admin_feedback}
                                    onChange={(e) => setRejectData('admin_feedback', e.target.value)}
                                    required
                                    rows="4"
                                    placeholder="e.g. Cocoa proportion too high; please reduce cocoa to 0.18kg per batch to preserve gross margins."
                                    className="mt-1 w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 text-stone-900"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectProcessing}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
