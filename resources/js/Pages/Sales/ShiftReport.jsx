import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Clock,
    DollarSign,
    ShoppingBag,
    CreditCard,
    Smartphone,
    Receipt,
    CheckCircle2
} from 'lucide-react';

export default function ShiftReport({ orders = [], summary = {} }) {
    const totalOrders = summary.total_orders || 0;
    const totalRevenue = Number(summary.total_revenue) || 0;
    const avgTicket = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

    return (
        <AppLayout>
            <Head title="Daily Shift Report - Sales" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Daily Sales & Cash Shift Summary
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Real-time breakdown of today's counter receipts, payment methods, and pastries sold.
                    </p>
                </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Total Shift Revenue</span>
                    <div className="mt-2 text-3xl font-extrabold text-stone-900">
                        ${totalRevenue.toFixed(2)}
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Gross retail takings</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Orders Processed</span>
                    <div className="mt-2 text-3xl font-extrabold text-amber-700">
                        {totalOrders}
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Completed receipts</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Pastries / Cakes Sold</span>
                    <div className="mt-2 text-3xl font-extrabold text-emerald-700">
                        {summary.total_items_sold || 0} units
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Total items dispensed</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-xs font-bold uppercase text-stone-500 block">Avg. Ticket Size</span>
                    <div className="mt-2 text-3xl font-extrabold text-blue-700">
                        ${avgTicket}
                    </div>
                    <span className="text-xs text-stone-400 mt-1 block">Average order value</span>
                </div>
            </div>

            {/* Payment Method Breakdown Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 mb-6">
                <h2 className="text-base font-serif font-bold text-stone-900 mb-3">Payment Method Breakdown</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-stone-700 block">Cash Payments</span>
                                <span className="text-xs text-stone-400">Drawer cash</span>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold text-stone-900">
                            ${Number(summary.by_payment_method?.cash || 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-stone-700 block">Card Terminal</span>
                                <span className="text-xs text-stone-400">Debit & credit</span>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold text-stone-900">
                            ${Number(summary.by_payment_method?.card || 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-stone-700 block">Mobile Money</span>
                                <span className="text-xs text-stone-400">App transfers</span>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold text-stone-900">
                            ${Number(summary.by_payment_method?.mobile_money || 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Today's Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-serif font-bold text-stone-900">Shift Receipts Log</h2>
                        <p className="text-xs text-stone-500">Every sales order completed during this session.</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">{orders.length} Receipts</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Order #</th>
                                <th className="py-3 px-4">Customer</th>
                                <th className="py-3 px-4">Items Purchased</th>
                                <th className="py-3 px-4">Payment</th>
                                <th className="py-3 px-4 text-right">Total Paid</th>
                                <th className="py-3 px-4 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                                        {order.order_number}
                                    </td>
                                    <td className="py-3.5 px-4 font-medium text-stone-900">
                                        {order.customer_name || 'Walk-in'}
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-600">
                                        {order.items && order.items.map((item) => (
                                            <div key={item.id}>
                                                {item.quantity}x {item.product?.name}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                                            {order.payment_method?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-extrabold text-stone-900 text-sm">
                                        ${Number(order.total_amount).toFixed(2)}
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-stone-500">
                                        {new Date(order.created_at).toLocaleTimeString()}
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
