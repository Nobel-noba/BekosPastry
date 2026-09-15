import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    ShoppingBag,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Smartphone,
    ArrowDownLeft,
    Receipt,
    Printer,
    Cake,
    X,
    Search
} from 'lucide-react';

export default function POS({
    products = [],
    pending_transfers = [],
    today_summary = {}
}) {
    // Category and Search filter
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    // Cart State
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState(0);

    // Receipt Modal State
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const addToCart = (product) => {
        if (product.current_display_stock <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                if (existing.quantity < product.current_display_stock) {
                    return prev.map(item =>
                        item.product_id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return prev;
            } else {
                return [
                    ...prev,
                    {
                        product_id: product.id,
                        name: product.name,
                        unit_price: parseFloat(product.selling_price) || 0,
                        quantity: 1,
                        max_stock: product.current_display_stock,
                    }
                ];
            }
        });
    };

    const updateQuantity = (item, delta) => {
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            removeFromCart(item);
        } else if (newQty <= item.max_stock) {
            setCart(prev =>
                prev.map(i => i.product_id === item.product_id ? { ...i, quantity: newQty } : i)
            );
        }
    };

    const removeFromCart = (item) => {
        setCart(prev => prev.filter(i => i.product_id !== item.product_id));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount(0);
    };

    // Calculations
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    }, [cart]);

    const roundTo2 = (val) => Math.round(val * 100) / 100;

    const tax = useMemo(() => {
        const taxable = Math.max(0, subtotal - Number(discount || 0));
        return roundTo2(taxable * 0.08); // 8% sales tax
    }, [subtotal, discount]);

    const totalAmount = useMemo(() => {
        return Math.max(0, roundTo2(subtotal - Number(discount || 0) + tax));
    }, [subtotal, discount, tax]);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        setIsCheckingOut(true);

        router.post('/sales/checkout', {
            customer_name: customerName || 'Walk-in Customer',
            customer_phone: customerPhone || null,
            payment_method: paymentMethod,
            discount: Number(discount || 0),
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
            })),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Save receipt snapshot
                setLastOrder({
                    order_number: 'ORD-' + Date.now().toString().slice(-6),
                    customer_name: customerName || 'Walk-in Customer',
                    items: [...cart],
                    subtotal: subtotal,
                    discount: Number(discount || 0),
                    tax: tax,
                    total: totalAmount,
                    payment_method: paymentMethod,
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                });
                setShowReceiptModal(true);
                clearCart();
                setIsCheckingOut(false);
            },
            onError: () => {
                setIsCheckingOut(false);
            },
        });
    };

    const handleReceiveTransfer = (transferId) => {
        router.post(`/sales/transfers/${transferId}/receive`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Point of Sale (POS) - Front Counter" />

            {/* Notification Banner: Incoming Transfers from Chef */}
            {pending_transfers.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-300 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3 text-amber-950">
                            <ArrowDownLeft className="w-6 h-6 text-amber-600 animate-bounce" />
                            <div>
                                <h3 className="font-serif font-bold text-sm">
                                    Incoming Pastry Transfers from Kitchen ({pending_transfers.length})
                                </h3>
                                <p className="text-xs text-stone-600">
                                    The kitchen has dispatched freshly baked goods. Acknowledge receipt to add them to display stock.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 overflow-x-auto">
                            {pending_transfers.map((transfer) => (
                                <div
                                    key={transfer.id}
                                    className="bg-white px-3 py-2 rounded-xl border border-amber-200 shadow-xs flex items-center space-x-3 whitespace-nowrap"
                                >
                                    <div className="text-xs font-bold text-stone-900">
                                        +{transfer.quantity} {transfer.product?.name}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleReceiveTransfer(transfer.id)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                                    >
                                        Accept & Stock
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* POS Terminal Layout: 2 Columns (Catalog on Left, Shopping Cart on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Pastry Display Catalog (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Filters & Search Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                placeholder="Search pastries..."
                                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
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

                    {/* Product Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className={`bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs flex flex-col justify-between transition-all cursor-pointer select-none group hover:border-amber-400 hover:shadow-md ${
                                    product.current_display_stock <= 0 ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            >
                                <div>
                                    <div className="h-28 rounded-xl bg-stone-100 relative overflow-hidden mb-2.5">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                <Cake className="w-8 h-8" />
                                            </div>
                                        )}
                                        <span
                                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                product.current_display_stock > 3 ? 'bg-emerald-500 text-white' :
                                                product.current_display_stock > 0 ? 'bg-amber-500 text-white' :
                                                'bg-rose-500 text-white'
                                            }`}
                                        >
                                            {product.current_display_stock} left
                                        </span>
                                    </div>

                                    <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1 leading-snug">{product.name}</h4>
                                    <span className="text-[10px] text-stone-400 block">{product.category}</span>
                                </div>

                                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                                    <span className="font-extrabold text-sm text-stone-900">${Number(product.selling_price).toFixed(2)}</span>
                                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <Plus className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Interactive Cart & Checkout (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sticky top-20">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                        <div className="flex items-center space-x-2 text-stone-900 font-serif font-bold text-base">
                            <ShoppingBag className="w-5 h-5 text-amber-600" />
                            <span>Order Cart</span>
                        </div>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Empty State */}
                    {cart.length === 0 ? (
                        <div className="py-12 text-center text-stone-400">
                            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                            <p className="text-xs font-semibold">No items in the order</p>
                            <p className="text-[11px] text-stone-400 mt-0.5">Click any pastry from the display to add</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-4">
                            {cart.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                                >
                                    <div className="flex-1 pr-2">
                                        <div className="font-bold text-stone-900">{item.name}</div>
                                        <div className="text-[11px] text-stone-500">${item.unit_price.toFixed(2)} each</div>
                                    </div>

                                    {/* Quantity Counter */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item, -1)}
                                            className="w-6 h-6 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center font-bold text-stone-900 text-xs">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item, 1)}
                                            className="w-6 h-6 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="w-16 text-right font-extrabold text-stone-900 ml-2">
                                        ${(item.unit_price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Customer Details & Payment Options */}
                    <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                type="text"
                                placeholder="Customer Name (Optional)"
                                className="px-3 py-1.5 border border-stone-300 rounded-xl text-xs"
                            />
                            <input
                                value={discount}
                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                type="number"
                                min="0"
                                placeholder="Discount ($)"
                                className="px-3 py-1.5 border border-stone-300 rounded-xl text-xs"
                            />
                        </div>

                        {/* Payment Method Buttons */}
                        <div>
                            <span className="block text-[10px] font-bold uppercase text-stone-400 mb-1.5">Payment Method</span>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                                        paymentMethod === 'cash' ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                                    }`}
                                >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>Cash</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('card')}
                                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                                        paymentMethod === 'card' ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                                    }`}
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Card</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('mobile_money')}
                                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                                        paymentMethod === 'mobile_money' ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                                    }`}
                                >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>Mobile</span>
                                </button>
                            </div>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="pt-3 border-t border-stone-100 space-y-1 text-xs">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount:</span>
                                    <span>-${Number(discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-stone-600">
                                <span>Tax (8%):</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1 border-t border-stone-200">
                                <span>Total Due:</span>
                                <span className="text-amber-700">${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Complete Sale Button */}
                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isCheckingOut}
                            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center space-x-2"
                        >
                            <Receipt className="w-4 h-4" />
                            <span>{isCheckingOut ? 'Processing Order...' : `Complete Sale • $${totalAmount.toFixed(2)}`}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* DIGITAL / PRINTABLE RECEIPT MODAL */}
            {showReceiptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-stone-900">
                        {/* Receipt Top */}
                        <div className="text-center pb-4 border-b border-dashed border-stone-300">
                            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-2">
                                <Cake className="w-6 h-6" />
                            </div>
                            <h3 className="font-serif font-bold text-lg">Beki's Pastry</h3>
                            <p className="text-[11px] text-stone-500">Fresh Artisan Pastries & Bakes</p>
                            <p className="text-[10px] text-stone-400 mt-1">Order #{lastOrder?.order_number}</p>
                            <p className="text-[10px] text-stone-400">{lastOrder?.date}</p>
                        </div>

                        {/* Items */}
                        <div className="py-4 space-y-2 text-xs border-b border-dashed border-stone-300">
                            {lastOrder?.items && lastOrder.items.map((item) => (
                                <div key={item.product_id} className="flex justify-between">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-bold">${(item.unit_price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="py-3 space-y-1 text-xs border-b border-stone-200">
                            <div className="flex justify-between text-stone-500">
                                <span>Subtotal:</span>
                                <span>${lastOrder?.subtotal.toFixed(2)}</span>
                            </div>
                            {lastOrder?.discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount:</span>
                                    <span>-${lastOrder?.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-stone-500">
                                <span>Tax:</span>
                                <span>${lastOrder?.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-1">
                                <span>Total:</span>
                                <span>${lastOrder?.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-stone-500 capitalize pt-1">
                                <span>Paid via:</span>
                                <strong>{lastOrder?.payment_method.replace('_', ' ')}</strong>
                            </div>
                        </div>

                        <div className="text-center pt-3 text-[11px] text-stone-400">
                            Thank you for enjoying Beki's Pastry!
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowReceiptModal(false)}
                                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                            >
                                New Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
