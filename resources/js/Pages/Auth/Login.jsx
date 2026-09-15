import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { ChefHat, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const demoLogin = (role) => {
        window.location.href = `/quick-login/${role}`;
    };

    return (
        <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500 selection:text-white">
            <Head title="Sign In - Beki's Pastry Kitchen System" />

            {/* Background Ambient Glow & Patterns */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/2 -right-40 w-96 h-96 bg-rose-700 rounded-full filter blur-3xl"></div>
                <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                {/* Brand Badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 shadow-xl ring-4 ring-amber-500/20 text-white mb-4">
                    <ChefHat className="w-9 h-9" />
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                    Beki's <span className="text-amber-400">Pastry</span>
                </h1>
                <p className="mt-2 text-sm text-stone-300">
                    Kitchen Resource Productivity & Production Monitoring System
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-stone-200">
                    {/* Sign In Form */}
                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                                Email Address
                            </label>
                            <div className="mt-1.5 relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="email"
                                    required
                                    placeholder="name@beki.com"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                                Password
                            </label>
                            <div className="mt-1.5 relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded cursor-pointer"
                                />
                                <span className="ml-2 block text-xs text-stone-600 font-medium">Remember me</span>
                            </label>
                            <span className="text-xs text-stone-500">
                                Default password: <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-800">password</code>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <span>Signing in...</span>
                            ) : (
                                <span className="flex items-center space-x-2">
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* 1-Click Fast Demo Login Switcher */}
                    <div className="mt-8 pt-6 border-t border-stone-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Quick 1-Click Evaluation Login</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Test Roles</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            {/* Admin Option */}
                            <button
                                type="button"
                                onClick={() => demoLogin('admin')}
                                className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-all text-left group cursor-pointer"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                        A
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-stone-900 group-hover:text-amber-900">Administrator (Owner)</div>
                                        <div className="text-[11px] text-stone-500">Full productivity, supplies allocation & approvals</div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </button>

                            {/* Chef Option */}
                            <button
                                type="button"
                                onClick={() => demoLogin('chef')}
                                className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all text-left group cursor-pointer"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                        C
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">Head Pastry Chef</div>
                                        <div className="text-[11px] text-stone-500">Recipe formulation, batch bake & wastage logging</div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </button>

                            {/* Sales Option */}
                            <button
                                type="button"
                                onClick={() => demoLogin('sales')}
                                className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 transition-all text-left group cursor-pointer"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                        S
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-stone-900 group-hover:text-rose-900">Sales & POS Cashier</div>
                                        <div className="text-[11px] text-stone-500">Counter terminal, receive transfers & selling</div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-rose-700 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Value Proposition Info Box */}
                <div className="mt-6 text-center text-xs text-stone-400">
                    <p>Ensuring kitchen resources yield maximum output before running out.</p>
                </div>
            </div>
        </div>
    );
}
