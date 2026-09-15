import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Package,
    Plus,
    Edit3,
    CheckCircle2,
    XCircle,
    Layers,
    DollarSign,
    X,
    Cake
} from 'lucide-react';

export default function Products({ products = [] }) {
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        id: null,
        name: '',
        sku: '',
        category: 'Cakes',
        description: '',
        selling_price: '',
        shelf_life_days: 3,
        image_url: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        setData({
            id: null,
            name: '',
            sku: '',
            category: 'Cakes',
            description: '',
            selling_price: '',
            shelf_life_days: 3,
            image_url: '',
            is_active: true,
        });
        setShowProductModal(true);
    };

    const openEditModal = (p) => {
        setEditingProduct(p);
        setData({
            id: p.id,
            name: p.name || '',
            sku: p.sku || '',
            category: p.category || 'Cakes',
            description: p.description || '',
            selling_price: p.selling_price || '',
            shelf_life_days: p.shelf_life_days ?? 3,
            image_url: p.image_url || '',
            is_active: Boolean(p.is_active),
        });
        setShowProductModal(true);
    };

    const submitProduct = (e) => {
        e.preventDefault();
        post('/admin/products', {
            onSuccess: () => {
                setShowProductModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Product Catalog - Admin" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Finished Goods & Pastry Catalog
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Manage pastry items, retail prices, shelf life, and review current inventory stocks.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Pastry Product</span>
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-amber-400 transition-colors"
                    >
                        <div>
                            {/* Product Image / Banner */}
                            <div className="h-40 w-full bg-stone-100 relative overflow-hidden">
                                {p.image_url ? (
                                    <img
                                        src={p.image_url}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <Cake className="w-12 h-12" />
                                    </div>
                                )}
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs">
                                    {p.category}
                                </span>
                                <span
                                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        p.is_active ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'
                                    }`}
                                >
                                    {p.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">{p.name}</h3>
                                        <p className="text-[11px] text-stone-400 font-mono">{p.sku || 'No SKU'}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-extrabold text-amber-700">${Number(p.selling_price).toFixed(2)}</div>
                                        <div className="text-[10px] text-stone-400">Cost: ${Number(p.estimated_cost).toFixed(2)}</div>
                                    </div>
                                </div>

                                <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                                    {p.description || 'No description provided.'}
                                </p>

                                {/* Stock Status Badges */}
                                <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                                        <span className="text-[10px] text-stone-400 block font-bold uppercase">Display Stock</span>
                                        <strong className="text-stone-900 text-sm">{p.current_display_stock}</strong>
                                    </div>
                                    <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                                        <span className="text-[10px] text-stone-400 block font-bold uppercase">Kitchen Stock</span>
                                        <strong className="text-stone-900 text-sm">{p.kitchen_ready_stock}</strong>
                                    </div>
                                    <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                                        <span className="text-[10px] text-stone-400 block font-bold uppercase">Potential Yield</span>
                                        <strong className="text-amber-700 text-sm">{p.possible_yield_from_kitchen}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Action */}
                        <div className="p-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-xs text-stone-500">Shelf life: {p.shelf_life_days} days</span>
                            <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Product</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE / EDIT PRODUCT MODAL */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <h3 className="font-serif text-lg font-bold text-stone-900">
                                {editingProduct ? 'Edit Pastry Product' : 'Add New Pastry Product'}
                            </h3>
                            <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitProduct} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Product Name</label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    type="text"
                                    required
                                    placeholder="e.g. Raspberry Pistachio Tart"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Category</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    >
                                        <option value="Cakes">Cakes</option>
                                        <option value="Pastries">Pastries</option>
                                        <option value="Tarts & Pies">Tarts & Pies</option>
                                        <option value="Breads & Buns">Breads & Buns</option>
                                        <option value="Cookies & Sweets">Cookies & Sweets</option>
                                        <option value="Beverages">Beverages</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">SKU / Code</label>
                                    <input
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        type="text"
                                        placeholder="PRD-CAKE-001"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Retail Selling Price ($)</label>
                                    <input
                                        value={data.selling_price}
                                        onChange={(e) => setData('selling_price', e.target.value)}
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        placeholder="28.00"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Display Shelf Life (Days)</label>
                                    <input
                                        value={data.shelf_life_days}
                                        onChange={(e) => setData('shelf_life_days', parseInt(e.target.value) || 0)}
                                        type="number"
                                        min="1"
                                        required
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Image URL (Optional)</label>
                                <input
                                    value={data.image_url}
                                    onChange={(e) => setData('image_url', e.target.value)}
                                    type="url"
                                    placeholder="https://images.unsplash.com/..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Product Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    placeholder="Flavor profile, layers, allergen notes..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                ></textarea>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-amber-600 rounded border-stone-300"
                                />
                                <label htmlFor="is_active" className="font-bold text-stone-700">Active for Kitchen & Sales POS</label>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
