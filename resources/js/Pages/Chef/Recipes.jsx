import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    UtensilsCrossed,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    X,
    FileText,
    AlertCircle
} from 'lucide-react';

export default function ChefRecipes({
    recipes = [],
    products = [],
    ingredients = []
}) {
    const [showFormulateModal, setShowFormulateModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        product_id: products[0]?.id || '',
        batch_yield: 1,
        prep_time_minutes: 60,
        instructions: '',
        ingredients: [
            { ingredient_id: ingredients[0]?.id || '', quantity_required: 0.5, unit: ingredients[0]?.unit || 'kg' },
            { ingredient_id: ingredients[1]?.id || '', quantity_required: 0.3, unit: ingredients[1]?.unit || 'kg' },
        ],
    });

    const addIngredientRow = () => {
        setData('ingredients', [
            ...data.ingredients,
            {
                ingredient_id: ingredients[0]?.id || '',
                quantity_required: 0.1,
                unit: ingredients[0]?.unit || 'kg',
            }
        ]);
    };

    const removeIngredientRow = (index) => {
        if (data.ingredients.length > 1) {
            const next = [...data.ingredients];
            next.splice(index, 1);
            setData('ingredients', next);
        }
    };

    const onIngredientChange = (index, id) => {
        const found = ingredients.find(i => String(i.id) === String(id));
        const next = [...data.ingredients];
        next[index] = {
            ...next[index],
            ingredient_id: id,
            unit: found ? found.unit : next[index].unit,
        };
        setData('ingredients', next);
    };

    const onQuantityChange = (index, val) => {
        const next = [...data.ingredients];
        next[index] = {
            ...next[index],
            quantity_required: val,
        };
        setData('ingredients', next);
    };

    const submitRecipe = (e) => {
        e.preventDefault();
        post('/chef/recipes', {
            onSuccess: () => {
                setShowFormulateModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Recipe Formulation - Chef" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Recipe Formulation & Ingredient Ratios
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Define Bill of Materials (BOM) per cake. Submitted recipes must be approved by the Admin before baking.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowFormulateModal(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Formulate New / Revised Recipe</span>
                </button>
            </div>

            {/* Recipe Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-serif text-lg font-bold text-stone-900">{recipe.product_name}</h3>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                                            v{recipe.version}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-0.5">Category: {recipe.product_category}</p>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    {recipe.status === 'approved' && (
                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Approved for Production</span>
                                        </span>
                                    )}
                                    {recipe.status === 'pending_approval' && (
                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Awaiting Admin Review</span>
                                        </span>
                                    )}
                                    {recipe.status !== 'approved' && recipe.status !== 'pending_approval' && (
                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                            <span>Needs Revision</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Admin Feedback Alert if Rejected */}
                            {recipe.status === 'rejected' && (
                                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                                    <strong>Admin Feedback:</strong> {recipe.admin_feedback}
                                </div>
                            )}

                            {/* Recipe Ingredients BOM */}
                            <div className="mt-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                    Ingredient BOM (Per Single Cake):
                                </h4>
                                <div className="space-y-1.5">
                                    {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-stone-50 border border-stone-100"
                                        >
                                            <span className="font-medium text-stone-800">{ing.ingredient_name}</span>
                                            <span className="font-extrabold text-stone-900">{ing.quantity_required} {ing.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            {recipe.instructions && (
                                <div className="mt-3 text-xs text-stone-600 bg-stone-50/60 p-2.5 rounded-lg border border-stone-100">
                                    <strong>Prep Instructions:</strong> {recipe.instructions}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                            <span>Est. Material Cost: ${Number(recipe.total_cost).toFixed(2)}</span>
                            <span>Prep Time: {recipe.prep_time_minutes} mins</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* FORMULATE RECIPE MODAL */}
            {showFormulateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-emerald-600">
                                <UtensilsCrossed className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Formulate / Revise Recipe</h3>
                            </div>
                            <button onClick={() => setShowFormulateModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitRecipe} className="mt-4 space-y-4 text-xs">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                                <strong>Important:</strong> All recipe formulations or ratio modifications will be sent to the <strong>Administrator for approval</strong>. The kitchen cannot produce this product until approved.
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Select Pastry Product</label>
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    >
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Prep Time (Minutes)</label>
                                    <input
                                        value={data.prep_time_minutes}
                                        onChange={(e) => setData('prep_time_minutes', parseInt(e.target.value) || 0)}
                                        type="number"
                                        min="1"
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Ingredients BOM Builder */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block font-bold uppercase text-stone-700">Required Ingredients per 1 Cake</label>
                                    <button
                                        type="button"
                                        onClick={addIngredientRow}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Ingredient</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {data.ingredients.map((row, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center space-x-2 bg-stone-50 p-2 rounded-xl border border-stone-200"
                                        >
                                            <select
                                                value={row.ingredient_id}
                                                onChange={(e) => onIngredientChange(idx, e.target.value)}
                                                className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                                            >
                                                {ingredients.map((ing) => (
                                                    <option key={ing.id} value={ing.id}>
                                                        {ing.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                value={row.quantity_required}
                                                onChange={(e) => onQuantityChange(idx, parseFloat(e.target.value) || 0)}
                                                type="number"
                                                step="0.0001"
                                                min="0.0001"
                                                placeholder="Qty"
                                                required
                                                className="w-24 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                                            />
                                            <span className="text-stone-500 text-xs w-12 font-medium">{row.unit}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeIngredientRow(idx)}
                                                className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Baking Instructions & Techniques</label>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    rows="3"
                                    placeholder="Mix dry ingredients, folding temperature, bake duration at 180C..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowFormulateModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Submit for Admin Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
