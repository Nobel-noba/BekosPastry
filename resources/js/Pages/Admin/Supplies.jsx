import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Package,
    ArrowRightLeft,
    Truck,
    X,
    Filter,
    Plus,
    Building2,
    Users,
    Phone,
    Mail,
    MapPin,
    CheckCircle2
} from 'lucide-react';

export default function Supplies({
    ingredients = [],
    suppliers = [],
    recent_supplies = [],
    recent_allocations = []
}) {
    // Navigation / View Tabs
    const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' or 'suppliers'

    // Modal Visibility
    const [showSupplyModal, setShowSupplyModal] = useState(false);
    const [showAllocateModal, setShowAllocateModal] = useState(false);
    const [showIngredientModal, setShowIngredientModal] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);

    const [selectedIngredient, setSelectedIngredient] = useState(ingredients[0] || null);

    // Filters for Ingredients
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = new Set(ingredients.map(i => i.category));
        return ['All', ...Array.from(cats)];
    }, [ingredients]);

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(ing => {
            const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
            const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ing.sku && ing.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [ingredients, selectedCategory, searchQuery]);

    // Supplier Search
    const [supplierSearch, setSupplierSearch] = useState('');
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
            (s.contact_person && s.contact_person.toLowerCase().includes(supplierSearch.toLowerCase())) ||
            (s.email && s.email.toLowerCase().includes(supplierSearch.toLowerCase()))
        );
    }, [suppliers, supplierSearch]);

    // Forms
    const supplyForm = useForm({
        supplier_id: suppliers[0]?.id || '',
        ingredient_id: ingredients[0]?.id || '',
        quantity: '',
        unit_cost: '',
        batch_number: '',
        expiry_date: '',
        notes: '',
    });

    const allocateForm = useForm({
        ingredient_id: '',
        quantity: '',
        notes: '',
    });

    const ingredientForm = useForm({
        name: '',
        sku: '',
        category: 'Flours & Grains',
        unit: 'kg',
        main_store_stock: 0,
        kitchen_stock: 0,
        minimum_alert_level: 5,
        cost_per_unit: '',
        description: '',
    });

    const supplierForm = useForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const openAllocateModal = (ing) => {
        const target = ing || ingredients[0] || null;
        setSelectedIngredient(target);
        allocateForm.setData({
            ingredient_id: target ? target.id : '',
            quantity: '',
            notes: '',
        });
        setShowAllocateModal(true);
    };

    const openSupplyForSupplier = (supplier) => {
        supplyForm.setData({
            supplier_id: supplier.id,
            ingredient_id: ingredients[0]?.id || '',
            quantity: '',
            unit_cost: '',
            batch_number: '',
            expiry_date: '',
            notes: '',
        });
        setShowSupplyModal(true);
    };

    const submitSupply = (e) => {
        e.preventDefault();
        supplyForm.post('/admin/supplies', {
            onSuccess: () => {
                setShowSupplyModal(false);
                supplyForm.reset();
            },
        });
    };

    const submitAllocate = (e) => {
        e.preventDefault();
        allocateForm.post('/admin/supplies/allocate', {
            onSuccess: () => {
                setShowAllocateModal(false);
                allocateForm.reset();
            },
        });
    };

    const submitIngredient = (e) => {
        e.preventDefault();
        ingredientForm.post('/admin/ingredients', {
            onSuccess: () => {
                setShowIngredientModal(false);
                ingredientForm.reset();
            },
        });
    };

    const submitSupplier = (e) => {
        e.preventDefault();
        supplierForm.post('/admin/suppliers', {
            onSuccess: () => {
                setShowSupplierModal(false);
                supplierForm.reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Supplies & Kitchen Allocation - Admin" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Supplies & Kitchen Resource Allocation
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Intake supplies from vendors, manage suppliers, register ingredients, and allocate raw materials to the Kitchen Pantry.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setShowIngredientModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Ingredient</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSupplierModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Supplier</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSupplyModal(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <Truck className="w-4 h-4 text-stone-500" />
                        <span>Receive Shipment</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openAllocateModal(ingredients[0])}
                        disabled={ingredients.length === 0}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Assign to Kitchen</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-stone-200 mb-6 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('ingredients')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ${
                        activeTab === 'ingredients' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    <Package className="w-4 h-4" />
                    <span>Ingredients Master Stock</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-extrabold">
                        {ingredients.length}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ${
                        activeTab === 'suppliers' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Suppliers Directory</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-extrabold">
                        {suppliers.length}
                    </span>
                </button>
            </div>

            {activeTab === 'ingredients' ? (
                <>
                    {/* Inventory Filters & Search */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                placeholder="Search ingredients by name or SKU..."
                                className="px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
                            />
                        </div>
                        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                        selectedCategory === cat ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Two-Tier Inventory Table */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-8">
                        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-serif font-bold text-stone-900">Ingredients Master Stock</h2>
                                <p className="text-xs text-stone-500">Compare Central Storage vs Kitchen Pantry on-hand levels.</p>
                            </div>
                            <span className="text-xs font-semibold text-stone-500">{filteredIngredients.length} Ingredients</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="py-3 px-4">Ingredient</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Unit Cost</th>
                                        <th className="py-3 px-4 text-center bg-blue-50/40 text-blue-900">Central Store Stock</th>
                                        <th className="py-3 px-4 text-center bg-amber-50/50 text-amber-900">Kitchen Pantry Stock</th>
                                        <th className="py-3 px-4">Min. Threshold</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {filteredIngredients.map((ing) => {
                                        const isLow = Number(ing.kitchen_stock) <= Number(ing.minimum_alert_level);
                                        return (
                                            <tr key={ing.id} className="hover:bg-stone-50/60">
                                                <td className="py-3.5 px-4 font-semibold text-stone-900">
                                                    <div>{ing.name}</div>
                                                    <span className="text-[10px] text-stone-400 font-mono">{ing.sku || 'N/A'}</span>
                                                </td>
                                                <td className="py-3.5 px-4 text-stone-600">
                                                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                                                        {ing.category}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-stone-800">
                                                    ${Number(ing.cost_per_unit).toFixed(2)} / {ing.unit}
                                                </td>
                                                <td className="py-3.5 px-4 text-center bg-blue-50/20 font-bold text-blue-950">
                                                    {ing.main_store_stock} {ing.unit}
                                                </td>
                                                <td className={`py-3.5 px-4 text-center bg-amber-50/30 font-bold ${isLow ? 'text-rose-600' : 'text-amber-950'}`}>
                                                    <span className="inline-flex items-center space-x-1">
                                                        <span>{ing.kitchen_stock} {ing.unit}</span>
                                                        {isLow && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-stone-500">
                                                    {ing.minimum_alert_level} {ing.unit}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openAllocateModal(ing)}
                                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                                                    >
                                                        Assign to Kitchen &rarr;
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* Suppliers Directory Tab */
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden mb-8">
                    <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div>
                            <h2 className="text-base font-serif font-bold text-stone-900">Registered Suppliers</h2>
                            <p className="text-xs text-stone-500">Manage supply partners, terms, and direct shipment intakes.</p>
                        </div>
                        <input
                            value={supplierSearch}
                            onChange={(e) => setSupplierSearch(e.target.value)}
                            type="text"
                            placeholder="Search suppliers..."
                            className="px-3.5 py-1.5 border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="py-3 px-4">Supplier Name</th>
                                    <th className="py-3 px-4">Contact Person</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Address</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredSuppliers.map((s) => (
                                    <tr key={s.id} className="hover:bg-stone-50/60">
                                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                                            <div className="flex items-center space-x-2">
                                                <Building2 className="w-4 h-4 text-stone-400" />
                                                <span>{s.name}</span>
                                            </div>
                                            {s.notes && <span className="text-[10px] text-stone-400 block mt-0.5">{s.notes}</span>}
                                        </td>
                                        <td className="py-3.5 px-4 text-stone-600">
                                            {s.contact_person || 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-stone-600">
                                            {s.email || 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-stone-600 font-mono">
                                            {s.phone || 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-stone-500">
                                            {s.address || 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openSupplyForSupplier(s)}
                                                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                                            >
                                                Receive Shipment &rarr;
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Activity Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Kitchen Allocations */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-serif font-bold text-stone-900">Recent Kitchen Dispatches</h2>
                        <span className="text-xs text-stone-500">Admin to Kitchen</span>
                    </div>
                    <div className="space-y-2.5">
                        {recent_allocations.map((alloc) => (
                            <div
                                key={alloc.id}
                                className="p-3 rounded-xl border border-stone-100 bg-stone-50/70 flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-stone-900">
                                        +{alloc.quantity} {alloc.ingredient?.unit} of {alloc.ingredient?.name}
                                    </div>
                                    <div className="text-[11px] text-stone-500">
                                        Code: {alloc.allocation_code} &bull; Dispatched by {alloc.allocator?.name}
                                    </div>
                                </div>
                                <span className="text-[10px] text-stone-400">
                                    {new Date(alloc.allocated_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Vendor Supply Deliveries */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-serif font-bold text-stone-900">Recent Vendor Supply Intakes</h2>
                        <span className="text-xs text-stone-500">Vendor to Main Storage</span>
                    </div>
                    <div className="space-y-2.5">
                        {recent_supplies.map((sup) => (
                            <div
                                key={sup.id}
                                className="p-3 rounded-xl border border-stone-100 bg-stone-50/70 flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-xs font-bold text-stone-900">
                                        +{sup.quantity} {sup.ingredient?.unit} of {sup.ingredient?.name}
                                    </div>
                                    <div className="text-[11px] text-stone-500">
                                        Supplier: {sup.supplier?.name} &bull; Batch: {sup.batch_number}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-emerald-700">
                                        ${Number(sup.total_cost).toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-stone-400">
                                        {new Date(sup.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL 1: Assign to Kitchen Pantry */}
            {showAllocateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-amber-600">
                                <ArrowRightLeft className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Assign to Kitchen Pantry</h3>
                            </div>
                            <button onClick={() => setShowAllocateModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitAllocate} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-700">Ingredient</label>
                                <select
                                    value={allocateForm.data.ingredient_id}
                                    onChange={(e) => {
                                        allocateForm.setData('ingredient_id', e.target.value);
                                        const found = ingredients.find(i => String(i.id) === String(e.target.value));
                                        if (found) setSelectedIngredient(found);
                                    }}
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                >
                                    {ingredients.map((ing) => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name} (Main Store: {ing.main_store_stock} {ing.unit} available)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-700">Quantity to Dispatch</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.01"
                                    required
                                    value={allocateForm.data.quantity}
                                    onChange={(e) => allocateForm.setData('quantity', e.target.value)}
                                    placeholder="e.g. 15"
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                                <p className="text-[11px] text-stone-500 mt-1">
                                    This amount will be deducted from Central Storage and credited immediately to Kitchen Pantry.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-700">Dispatch Notes (Optional)</label>
                                <textarea
                                    value={allocateForm.data.notes}
                                    onChange={(e) => allocateForm.setData('notes', e.target.value)}
                                    rows="2"
                                    placeholder="e.g. Weekend morning baking batch allotment"
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAllocateModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={allocateForm.processing}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Confirm & Dispatch to Kitchen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Receive Incoming Supply Shipment */}
            {showSupplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-amber-600">
                                <Truck className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Record Incoming Vendor Shipment</h3>
                            </div>
                            <button onClick={() => setShowSupplyModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitSupply} className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-700">Vendor / Supplier</label>
                                    <select
                                        value={supplyForm.data.supplier_id}
                                        onChange={(e) => supplyForm.setData('supplier_id', e.target.value)}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    >
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-700">Ingredient</label>
                                    <select
                                        value={supplyForm.data.ingredient_id}
                                        onChange={(e) => supplyForm.setData('ingredient_id', e.target.value)}
                                        required
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    >
                                        {ingredients.map((ing) => (
                                            <option key={ing.id} value={ing.id}>
                                                {ing.name} ({ing.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-700">Quantity Received</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={supplyForm.data.quantity}
                                        onChange={(e) => supplyForm.setData('quantity', e.target.value)}
                                        placeholder="e.g. 50"
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-700">Unit Cost ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={supplyForm.data.unit_cost}
                                        onChange={(e) => supplyForm.setData('unit_cost', e.target.value)}
                                        placeholder="e.g. 2.40"
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-700">Batch Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={supplyForm.data.batch_number}
                                        onChange={(e) => supplyForm.setData('batch_number', e.target.value)}
                                        placeholder="e.g. BATCH-2026-A1"
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-700">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={supplyForm.data.expiry_date}
                                        onChange={(e) => supplyForm.setData('expiry_date', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-700">Notes (Optional)</label>
                                <textarea
                                    value={supplyForm.data.notes}
                                    onChange={(e) => supplyForm.setData('notes', e.target.value)}
                                    rows="2"
                                    placeholder="Delivery invoice details..."
                                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowSupplyModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={supplyForm.processing}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Record & Add to Central Storage
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Create New Ingredient */}
            {showIngredientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-amber-600">
                                <Package className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Add New Raw Ingredient</h3>
                            </div>
                            <button onClick={() => setShowIngredientModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitIngredient} className="mt-4 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Ingredient Name</label>
                                <input
                                    type="text"
                                    required
                                    value={ingredientForm.data.name}
                                    onChange={(e) => ingredientForm.setData('name', e.target.value)}
                                    placeholder="e.g. Dark Belgian Chocolate 70%"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Category</label>
                                    <select
                                        value={ingredientForm.data.category}
                                        onChange={(e) => ingredientForm.setData('category', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    >
                                        <option value="Flours & Grains">Flours & Grains</option>
                                        <option value="Dairy & Eggs">Dairy & Eggs</option>
                                        <option value="Sugars & Sweeteners">Sugars & Sweeteners</option>
                                        <option value="Fats & Oils">Fats & Oils</option>
                                        <option value="Chocolate & Cocoa">Chocolate & Cocoa</option>
                                        <option value="Flavorings & Extracts">Flavorings & Extracts</option>
                                        <option value="Fruits & Nuts">Fruits & Nuts</option>
                                        <option value="Leaveners & Additives">Leaveners & Additives</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Unit of Measurement</label>
                                    <select
                                        value={ingredientForm.data.unit}
                                        onChange={(e) => ingredientForm.setData('unit', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="g">Gram (g)</option>
                                        <option value="liter">Liter (L)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="pack">Pack</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Standard Cost / Unit ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={ingredientForm.data.cost_per_unit}
                                        onChange={(e) => ingredientForm.setData('cost_per_unit', e.target.value)}
                                        placeholder="e.g. 8.50"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Low Stock Alert Level</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        required
                                        value={ingredientForm.data.minimum_alert_level}
                                        onChange={(e) => ingredientForm.setData('minimum_alert_level', e.target.value)}
                                        placeholder="e.g. 5"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Initial Central Storage</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={ingredientForm.data.main_store_stock}
                                        onChange={(e) => ingredientForm.setData('main_store_stock', e.target.value)}
                                        placeholder="0"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Initial Kitchen Pantry</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={ingredientForm.data.kitchen_stock}
                                        onChange={(e) => ingredientForm.setData('kitchen_stock', e.target.value)}
                                        placeholder="0"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">SKU Code (Optional)</label>
                                <input
                                    type="text"
                                    value={ingredientForm.data.sku}
                                    onChange={(e) => ingredientForm.setData('sku', e.target.value)}
                                    placeholder="Leave blank for auto-generation"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Description (Optional)</label>
                                <textarea
                                    value={ingredientForm.data.description}
                                    onChange={(e) => ingredientForm.setData('description', e.target.value)}
                                    rows="2"
                                    placeholder="Origin, brand, storage temperature specifications..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowIngredientModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={ingredientForm.processing}
                                    className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Save Ingredient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: Create New Supplier */}
            {showSupplierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center space-x-2 text-amber-600">
                                <Building2 className="w-5 h-5" />
                                <h3 className="font-serif text-lg font-bold text-stone-900">Add New Supplier</h3>
                            </div>
                            <button onClick={() => setShowSupplierModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitSupplier} className="mt-4 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Company / Supplier Name</label>
                                <input
                                    type="text"
                                    required
                                    value={supplierForm.data.name}
                                    onChange={(e) => supplierForm.setData('name', e.target.value)}
                                    placeholder="e.g. Artisan Flour & Grain Mills"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Contact Person</label>
                                    <input
                                        type="text"
                                        value={supplierForm.data.contact_person}
                                        onChange={(e) => supplierForm.setData('contact_person', e.target.value)}
                                        placeholder="e.g. John Miller"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Phone Number</label>
                                    <input
                                        type="text"
                                        value={supplierForm.data.phone}
                                        onChange={(e) => supplierForm.setData('phone', e.target.value)}
                                        placeholder="e.g. +1 555-0199"
                                        className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Email Address</label>
                                <input
                                    type="email"
                                    value={supplierForm.data.email}
                                    onChange={(e) => supplierForm.setData('email', e.target.value)}
                                    placeholder="e.g. orders@artisanflour.com"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Physical Address</label>
                                <input
                                    type="text"
                                    value={supplierForm.data.address}
                                    onChange={(e) => supplierForm.setData('address', e.target.value)}
                                    placeholder="e.g. 42 Baker Street, Industrial Zone"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Delivery Notes / Terms</label>
                                <textarea
                                    value={supplierForm.data.notes}
                                    onChange={(e) => supplierForm.setData('notes', e.target.value)}
                                    rows="2"
                                    placeholder="e.g. Next-day delivery for morning orders, net 30 invoice..."
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowSupplierModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={supplierForm.processing}
                                    className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Register Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
