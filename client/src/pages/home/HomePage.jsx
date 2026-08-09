import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Users, Package, FileText, CheckCircle2, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
            <nav className="fixed w-full z-50 top-0 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">
                                Mini ERP
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                    Sign In
                                </Link>
                            )}
                            <Link
                                to={isAuthenticated ? "/dashboard" : "/login"}
                                className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-white">
                <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-blue-50 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-32 -left-24 w-72 h-72 bg-indigo-100 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                        The modern standard for operations
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
                        The Operating System for <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                            Modern Business
                        </span>
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                        Unify your CRM, Inventory, and Sales in one powerful, beautifully designed platform. Focus on growing your business, we'll handle the operations.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/login"}
                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-full shadow-md hover:shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:-translate-y-0.5 group"
                        >
                            {isAuthenticated ? "Go to Dashboard" : "Start your journey"}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all shadow-sm"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>
            </div>

            <div className="py-12 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
                        <div>
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">99.9%</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Uptime</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">24/7</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Support</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">10k+</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Businesses</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-blue-600 mb-2">5M+</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Transactions</div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="features" className="py-24 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to scale</h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">A complete suite of tools designed for speed, efficiency, and clarity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Customer CRM</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Track leads, manage client relationships, and keep detailed histories of all customer interactions in one centralized database.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                                <Package className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Inventory Management</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Real-time stock tracking with automated low-stock alerts. Maintain perfect control over your warehouse movements.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Sales & Challans</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Generate delivery challans seamlessly. Ensure atomic stock deduction and clean transaction histories with every confirmed sale.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-24 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Trusted by industry leaders</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex text-yellow-400 mb-4">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <p className="text-slate-700 italic mb-6">"Mini ERP completely transformed how we handle our warehouse and sales. It's fast, intuitive, and remarkably stable."</p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3">JD</div>
                                <div>
                                    <div className="font-semibold text-slate-900">John Doe</div>
                                    <div className="text-sm text-slate-500">Operations Manager</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex text-yellow-400 mb-4">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <p className="text-slate-700 italic mb-6">"The CRM integration is seamless. We can track customer histories and generate challans in half the time it used to take."</p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3">AS</div>
                                <div>
                                    <div className="font-semibold text-slate-900">Alice Smith</div>
                                    <div className="text-sm text-slate-500">Sales Director</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex text-yellow-400 mb-4">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <p className="text-slate-700 italic mb-6">"Finally, an ERP that doesn't require a master's degree to operate. Beautiful interface and rock-solid reliability."</p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 mr-3">MJ</div>
                                <div>
                                    <div className="font-semibold text-slate-900">Michael Johnson</div>
                                    <div className="text-sm text-slate-500">CEO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-24 relative bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-blue-600 rounded-3xl p-8 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]" />
                        
                        <div className="flex-1 relative z-10 text-white">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Built for production. <br className="hidden sm:block" />Ready for scale.</h2>
                            <ul className="space-y-4">
                                {[
                                    'Secure Role-Based Access Control',
                                    'Atomic Transactions for Data Integrity',
                                    'Responsive Design for Mobile & Desktop',
                                    'Blazing Fast Performance'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center text-blue-100">
                                        <CheckCircle2 className="w-5 h-5 text-white mr-3 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 relative z-10 w-full">
                            <div className="aspect-4/3 rounded-xl bg-white shadow-2xl p-4 flex flex-col overflow-hidden">
                                <div className="flex space-x-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                </div>
                                <div className="flex-1 flex gap-4">
                                    <div className="w-1/4 h-full bg-slate-50 rounded-lg hidden sm:block"></div>
                                    <div className="flex-1 h-full flex flex-col gap-4">
                                        <div className="w-full h-24 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center">
                                            <TrendingUp className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-lg p-4 flex flex-col gap-3">
                                            <div className="w-full h-8 bg-slate-200 rounded mb-1"></div>
                                            <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                                            <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="border-t border-slate-200 py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-900">Mini ERP</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Mini ERP. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
