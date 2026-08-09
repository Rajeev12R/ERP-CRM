import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStockMovements, getLowStockProducts } from '../../api/stock.api';
import toast from 'react-hot-toast';
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Search, Filter, Loader2 } from 'lucide-react';
import StockMovementModal from './components/StockMovementModal';
import { useQuery } from '@tanstack/react-query';

const InventoryOverview = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;

    const updateParams = (newParams) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, ...newParams });
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [movementType, setMovementType] = useState('IN');

    // React Query for Movements
    const { data: movementsData, isLoading, isError: isMovementsError, error: movementsError } = useQuery({
        queryKey: ['stock-movements', { type, search, page, limit }],
        queryFn: () => getStockMovements({ type, search, page, limit }),
        staleTime: 15 * 1000, // 15 seconds as per user request
    });

    const movements = movementsData?.data || [];
    const totalPages = movementsData?.pagination?.totalPages || 1;

    // React Query for Low Stock
    const { data: lowStockData, isError: isLowStockError } = useQuery({
        queryKey: ['low-stock'],
        queryFn: getLowStockProducts,
        staleTime: 15 * 1000,
    });

    const lowStock = lowStockData?.data || [];

    useEffect(() => {
        if (isMovementsError) {
            toast.error(movementsError?.response?.data?.message || "Failed to load stock movements");
        }
    }, [isMovementsError, movementsError]);
    
    useEffect(() => {
        if (isLowStockError) {
            console.error("Failed to fetch low stock");
        }
    }, [isLowStockError]);

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
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h2>
                    <p className="mt-1 text-sm text-slate-500">Track and manage your stock movements.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => { setMovementType('IN'); setModalOpen(true); }}
                        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all"
                    >
                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                        Stock In
                    </button>
                    <button
                        onClick={() => { setMovementType('OUT'); setModalOpen(true); }}
                        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all"
                    >
                        <ArrowUpFromLine className="w-4 h-4 mr-2" />
                        Stock Out
                    </button>
                </div>
            </div>

            {lowStock.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                    <div className="flex">
                        <div className="shrink-0">
                            <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-semibold text-orange-800">Low Stock Alerts</h3>
                            <div className="mt-2 text-sm text-orange-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {lowStock.map(p => (
                                        <li key={p.id}>
                                            <span className="font-semibold">{p.name}</span> ({p.sku}) - Current: {p.currentStock} / Min: {p.minStockAlert}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border-slate-200 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 shadow-sm transition-colors"
                        placeholder="Search product name or SKU..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:max-w-xs flex items-center">
                    <Filter className="w-5 h-5 text-slate-400 mr-2" />
                    <select
                        className="block w-full rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 shadow-sm bg-white transition-colors"
                        value={type}
                        onChange={(e) => {
                            updateParams({ type: e.target.value, page: 1 });
                        }}
                    >
                        <option value="">All Movements</option>
                        <option value="IN">Stock In</option>
                        <option value="OUT">Stock Out</option>
                        <option value="RESERVE">Reserve (Challan)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900">Movement History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Quantity</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                                            <span>Loading movements...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        No stock movements found.
                                    </td>
                                </tr>
                            ) : (
                                movements.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {new Date(movement.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                                                movement.type === 'IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                movement.type === 'OUT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {movement.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{movement.product.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">SKU: {movement.product.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                            <span className={movement.type === 'IN' ? 'text-emerald-600' : 'text-slate-900'}>
                                                {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {movement.user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={movement.reason}>
                                            {movement.reason || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && movements.length > 0 && (
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => updateParams({ page: Math.max(1, page - 1) })} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
                            <button onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span></p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => updateParams({ page: Math.max(1, page - 1) })} disabled={page === 1} className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-colors">Previous</button>
                                    <button onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })} disabled={page === totalPages} className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-colors">Next</button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {modalOpen && (
                <StockMovementModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    type={movementType} 
                />
            )}
        </div>
    );
};

export default InventoryOverview;
