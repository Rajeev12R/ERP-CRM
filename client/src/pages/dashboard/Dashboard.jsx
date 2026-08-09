import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, AlertTriangle, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getCustomers } from '../../api/customer.api';
import { getProducts } from '../../api/product.api';
import { getLowStockProducts, getStockMovements } from '../../api/stock.api';
import { getChallans } from '../../api/challan.api';
import { format } from 'date-fns';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: customersData } = useQuery({
        queryKey: ['customers', { limit: 1 }],
        queryFn: () => getCustomers({ limit: 1 }),
        staleTime: 60 * 1000,
    });

    const { data: productsData } = useQuery({
        queryKey: ['products', { limit: 1 }],
        queryFn: () => getProducts({ limit: 1 }),
        staleTime: 60 * 1000,
    });

    const { data: lowStockData } = useQuery({
        queryKey: ['low-stock'],
        queryFn: getLowStockProducts,
        staleTime: 60 * 1000,
    });

    const { data: challansData } = useQuery({
        queryKey: ['challans', { status: 'DRAFT', limit: 1 }],
        queryFn: () => getChallans({ status: 'DRAFT', limit: 1 }),
        staleTime: 60 * 1000,
    });

    const { data: recentActivityData, isLoading: isActivityLoading } = useQuery({
        queryKey: ['recent-activity'],
        queryFn: () => getStockMovements({ limit: 5 }),
        staleTime: 30 * 1000,
    });

    const totalCustomers = customersData?.success ? customersData.pagination.total : '--';
    const totalProducts = productsData?.success ? productsData.pagination.total : '--';
    const lowStockAlerts = lowStockData?.success ? lowStockData.data.length : '--';
    const draftChallans = challansData?.success ? challansData.pagination.total : '--';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Here's what's happening with your operations today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl border border-slate-200 cursor-pointer" onClick={() => navigate('/customers')}>
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-blue-50 rounded-lg p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-slate-500 truncate">Total Customers</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-slate-900">{totalCustomers}</div>
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl border border-slate-200 cursor-pointer" onClick={() => navigate('/products')}>
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-indigo-50 rounded-lg p-3">
                                <Package className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-slate-500 truncate">Total Products</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-slate-900">{totalProducts}</div>
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl border border-slate-200 cursor-pointer" onClick={() => navigate('/inventory')}>
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-red-50 rounded-lg p-3">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-slate-500 truncate">Low Stock Alerts</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-slate-900">{lowStockAlerts}</div>
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl border border-slate-200 cursor-pointer" onClick={() => navigate('/challans?status=DRAFT')}>
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-emerald-50 rounded-lg p-3">
                                <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dt className="text-sm font-medium text-slate-500 truncate">Draft Challans</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-slate-900">{draftChallans}</div>
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                        <Activity className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="p-0 flex-1 flex flex-col">
                        {isActivityLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-sm text-slate-500">Loading activity...</p>
                            </div>
                        ) : recentActivityData?.data?.length > 0 ? (
                            <ul className="divide-y divide-slate-100">
                                {recentActivityData.data.map((activity) => (
                                    <li key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'IN' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                                <Package className={`h-5 w-5 ${activity.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {activity.product?.name || 'Unknown Product'}
                                                </p>
                                                <p className="text-sm text-slate-500 truncate">
                                                    {activity.type === 'IN' ? 'Stock Added' : 'Stock Deducted'} ({activity.quantity} units)
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-xs text-slate-400">
                                                {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Activity className="h-6 w-6 text-slate-400" />
                                </div>
                                <h4 className="text-sm font-medium text-slate-900 mb-1">No recent activity</h4>
                                <p className="text-sm text-slate-500">Your recent stock movements and sales will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-xl border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => navigate('/customers/new')}
                            className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all bg-slate-50 hover:bg-white text-center"
                        >
                            <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                            <span className="text-sm font-medium text-slate-900">Add Customer</span>
                        </div>
                        <div 
                            onClick={() => navigate('/products/new')}
                            className="p-4 border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm cursor-pointer transition-all bg-slate-50 hover:bg-white text-center"
                        >
                            <Package className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                            <span className="text-sm font-medium text-slate-900">Add Product</span>
                        </div>
                        <div 
                            onClick={() => navigate('/challans/new')}
                            className="p-4 border border-slate-200 rounded-lg hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all bg-slate-50 hover:bg-white text-center col-span-2"
                        >
                            <FileText className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                            <span className="text-sm font-medium text-slate-900">Create Challan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
