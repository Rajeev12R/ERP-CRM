import React, { useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getChallans } from '../../api/challan.api';
import { Plus, Eye, Filter, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const ChallanList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;

    const navigate = useNavigate();

    const updateParams = (newParams) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, ...newParams });
    };

    const { data: challansData, isLoading, isError, error } = useQuery({
        queryKey: ['challans', { search, status, page, limit }],
        queryFn: () => getChallans({ search, status, page, limit }),
        staleTime: 30 * 1000, // 30 seconds
    });

    const challans = (challansData?.data || []).map(c => ({
        ...c,
        totalValue: c.items?.reduce((sum, item) => sum + (item.quantity * parseFloat(item.unitPrice || 0)), 0) || 0
    }));
    const totalPages = challansData?.pagination?.totalPages || 1;

    useEffect(() => {
        if (isError) {
            toast.error(error?.response?.data?.message || "Failed to load challans");
        }
    }, [isError, error]);

    const [localSearch, setLocalSearch] = useState(search);
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (localSearch !== search) {
                updateParams({ search: localSearch, page: 1 });
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [localSearch, search]);

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Challans</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage delivery challans and confirmations.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/challans/new"
                        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:shadow-md"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Challan
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border-slate-200 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 shadow-sm transition-colors"
                        placeholder="Search challan no. or customer..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:max-w-xs flex items-center">
                    <Filter className="w-5 h-5 text-slate-400 mr-2" />
                    <select
                        className="block w-full rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 shadow-sm bg-white transition-colors"
                        value={status}
                        onChange={(e) => {
                            updateParams({ status: e.target.value, page: 1 });
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Challan No</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Value</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                                            <span>Loading challans...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : challans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        No challans found.
                                    </td>
                                </tr>
                            ) : (
                                challans.map((challan) => (
                                    <tr key={challan.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900 font-mono">{challan.challanNo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {new Date(challan.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{challan.customer.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                            ₹{parseFloat(challan.totalValue).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                                                challan.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                challan.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {challan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => navigate(`/challans/${challan.id}`)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && challans.length > 0 && (
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => updateParams({ page: Math.max(1, page - 1) })} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
                            <button onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })} disabled={page === totalPages} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span></p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => updateParams({ page: Math.max(1, page - 1) })} disabled={page === 1} className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
                                    <button onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })} disabled={page === totalPages} className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallanList;
