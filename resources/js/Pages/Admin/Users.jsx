import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Users as UsersIcon, UserPlus, Shield, CheckCircle2, XCircle, X, Edit2 } from 'lucide-react';

export default function Users({ users = [] }) {
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        id: null,
        name: '',
        email: '',
        role: 'sales',
        phone: '',
        status: 'active',
        password: '',
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setData({
            id: null,
            name: '',
            email: '',
            role: 'sales',
            phone: '',
            status: 'active',
            password: '',
        });
        setShowUserModal(true);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setData({
            id: u.id,
            name: u.name || '',
            email: u.email || '',
            role: u.role || 'sales',
            phone: u.phone || '',
            status: u.status || 'active',
            password: '',
        });
        setShowUserModal(true);
    };

    const submitUser = (e) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                setShowUserModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Staff Management - Admin" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Staff & Role Management
                    </h1>
                    <p className="text-sm text-stone-600 mt-0.5">
                        Assign roles (Admin, Head Chef, Sales Cashier) and manage active system accounts.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Staff Member</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="py-3 px-4">Staff Name</th>
                                <th className="py-3 px-4">Email Address</th>
                                <th className="py-3 px-4">Role / Access</th>
                                <th className="py-3 px-4">Phone</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-stone-50/60">
                                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                                        {u.name}
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-600">
                                        {u.email}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                u.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                u.role === 'chef' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                'bg-rose-100 text-rose-800 border border-rose-300'
                                            }`}
                                        >
                                            {u.role === 'admin' ? 'Administrator' : u.role === 'chef' ? 'Head Pastry Chef' : 'Sales / POS'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-stone-500">
                                        {u.phone || 'N/A'}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span
                                            className={`inline-flex items-center space-x-1 text-xs font-bold ${
                                                u.status === 'active' ? 'text-emerald-700' : 'text-stone-400'
                                            }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                                            <span className="capitalize">{u.status}</span>
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(u)}
                                            className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer inline-flex items-center space-x-1"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* USER MODAL */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <h3 className="font-serif text-lg font-bold text-stone-900">
                                {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h3>
                            <button onClick={() => setShowUserModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitUser} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold uppercase text-stone-700">Full Name</label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    type="text"
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Email Address</label>
                                <input
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    type="email"
                                    required
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Role</label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    >
                                        <option value="admin">Administrator (Owner)</option>
                                        <option value="chef">Chef (Kitchen)</option>
                                        <option value="sales">Sales (POS Cashier)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold uppercase text-stone-700">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-xl"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">Phone Number (Optional)</label>
                                <input
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    type="text"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold uppercase text-stone-700">
                                    Password {editingUser ? '(Leave blank to keep current)' : ''}
                                </label>
                                <input
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    required={!editingUser}
                                    placeholder="••••••"
                                    className="mt-1 w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(false)}
                                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                                >
                                    Save Staff Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
