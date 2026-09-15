import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ChefHat,
    UtensilsCrossed,
    ArrowLeftRight,
    Trash2,
    ShoppingBag,
    Users,
    LogOut,
    CheckCircle2,
    AlertTriangle,
    X,
    Menu,
    Clock,
    DollarSign,
    Layers,
    FileCheck
} from 'lucide-react';

export default function AppLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);

    const role = user?.role || 'sales';

    const getRoleColorBadge = () => {
        switch (role) {
            case 'admin':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'chef':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'sales':
                return 'bg-rose-100 text-rose-800 border-rose-300';
            default:
                return 'bg-stone-100 text-stone-800 border-stone-300';
        }
    };

    const getRoleTitle = () => {
        switch (role) {
            case 'admin':
                return 'Administrator (Owner)';
            case 'chef':
                return 'Head Pastry Chef';
            case 'sales':
                return 'Sales & POS Cashier';
            default:
                return 'Staff';
        }
    };

    const getNavigation = () => {
        if (role === 'admin') {
            return [
                { name: 'Productivity Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Supplies & Kitchen Allocation', href: '/admin/supplies', icon: Package },
                { name: 'Recipe Approvals', href: '/admin/recipes', icon: FileCheck },
                { name: 'Product Catalog', href: '/admin/products', icon: Layers },
                { name: 'Wastage Audit', href: '/admin/wastage', icon: Trash2 },
                { name: 'Staff Management', href: '/admin/users', icon: Users },
            ];
        } else if (role === 'chef') {
            return [
                { name: 'Kitchen Dashboard', href: '/chef/dashboard', icon: LayoutDashboard },
                { name: 'Recipe Formulation', href: '/chef/recipes', icon: UtensilsCrossed },
                { name: 'Batch Production', href: '/chef/production', icon: ChefHat },
                { name: 'Transfers to Sales', href: '/chef/transfers', icon: ArrowLeftRight },
                { name: 'Wastage Logging', href: '/chef/wastage', icon: Trash2 },
            ];
        } else {
            return [
                { name: 'POS Terminal', href: '/sales/pos', icon: ShoppingBag },
                { name: 'Incoming Transfers', href: '/sales/transfers', icon: ArrowLeftRight },
                { name: 'Counter Wastage', href: '/sales/wastage', icon: Trash2 },
                { name: 'Daily Shift Report', href: '/sales/shift-report', icon: Clock },
            ];
        }
    };

    const navigation = getNavigation();
    const currentUrl = usePage().url;

    const isCurrentRoute = (href) => {
        return currentUrl.startsWith(href);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-stone-100/70 text-stone-800 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Brand / Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-400/30">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="font-serif text-xl font-bold tracking-tight text-stone-900 block leading-tight">
                                    Beki's <span className="text-amber-600">Pastry</span>
                                </span>
                                <span className="text-xs text-stone-500 font-medium tracking-wide uppercase">
                                    Kitchen Productivity System
                                </span>
                            </div>
                        </div>

                        {/* Role & User Profile Center/Right */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider ${getRoleColorBadge()}`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse ${role === 'admin' ? 'bg-amber-500' : role === 'chef' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                <span>{getRoleTitle()}</span>
                            </div>

                            <div className="text-right">
                                <div className="text-sm font-semibold text-stone-900">{user?.name}</div>
                                <div className="text-xs text-stone-500">{user?.email}</div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Log Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Role Primary Navigation Links (Desktop) */}
                <div className="hidden md:block bg-stone-50/80 border-t border-stone-200/80 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex space-x-1 py-1.5 overflow-x-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isCurrentRoute(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm border transition-all whitespace-nowrap ${
                                        active
                                            ? 'bg-white text-amber-700 shadow-xs font-semibold border-amber-500/30'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-white/60 font-medium'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-2">
                        <div className="py-2 border-b border-stone-100 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-stone-900">{user?.name}</div>
                                <div className="text-xs text-stone-500">{getRoleTitle()}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-rose-600 font-semibold px-2.5 py-1 bg-rose-50 rounded cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isCurrentRoute(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setShowMobileMenu(false)}
                                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm ${
                                            active
                                                ? 'bg-amber-50 text-amber-800 font-semibold'
                                                : 'text-stone-600 hover:bg-stone-50 font-medium'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* Flash Messages */}
            {!dismissFlash && (flash?.success || flash?.error) && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
                    {flash.success && (
                        <div className="flex items-center justify-between p-4 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-xs">
                            <div className="flex items-center space-x-2.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="font-medium">{flash.success}</span>
                            </div>
                            <button onClick={() => setDismissFlash(true)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {flash.error && (
                        <div className="flex items-center justify-between p-4 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs">
                            <div className="flex items-center space-x-2.5">
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span className="font-medium">{flash.error}</span>
                            </div>
                            <button onClick={() => setDismissFlash(true)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Slot */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-stone-200 py-4 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-2">
                    <div>
                        &copy; 2026 <span className="font-semibold text-stone-700">Beki's Pastry</span> &bull; Resource Yield & Kitchen Management
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>React + Inertia + MySQL</span>
                        </span>
                        <span>Role: <strong className="capitalize text-stone-700">{role}</strong></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
