import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../api/product.api';
import { Plus, Search, Eye, Edit, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;
    
    const navigate = useNavigate();

    const updateParams = (newParams) => {
        const currentParams = Object.fromEntries([...searchParams]);
        setSearchParams({ ...currentParams, ...newParams });
    };

    const { data: responseData, isLoading, isError, error } = useQuery({
        queryKey: ['products', { page, limit, search, category }],
        queryFn: () => getProducts({ search, category, page, limit }),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const products = responseData?.data || [];
    const totalPages = responseData?.pagination?.totalPages || 1;

    useEffect(() => {
        if (isError) {
            toast.error(error?.response?.data?.message || "Failed to load products");
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
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage your product inventory, pricing, and details.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/products/new"
                        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
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
                        className="block w-full rounded-lg border-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 shadow-sm transition-colors"
                        placeholder="Search products or SKUs..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={category}
                        onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                        className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 shadow-sm bg-white transition-colors"
                    >
                        <option value="">All Categories</option>
                        <option value="ELECTRONICS">Electronics</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="SOFTWARE">Software</option>
                        <option value="SERVICES">Services</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                                            <span>Loading products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        No products found. Try adjusting your search filters.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const isLowStock = product.currentStock <= product.minStockAlert;
                                    
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">{product.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                                {product.sku}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                                                ₹{parseFloat(product.unitPrice).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end">
                                                    <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                                                        {product.currentStock}
                                                    </span>
                                                    {isLowStock && (
                                                        <AlertTriangle className="w-4 h-4 ml-1.5 text-red-500" title="Low Stock" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button onClick={() => navigate(`/products/${product.id}`)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => navigate(`/products/${product.id}/edit`)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && products.length > 0 && (
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                disabled={page === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
