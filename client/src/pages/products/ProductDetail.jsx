import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../api/product.api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Package, DollarSign, Tag, AlertTriangle, Hash, FileText, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const ProductDetail = () => {
    const { id } = useParams();
    
    const { data: responseData, isLoading, isError, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const product = responseData?.data;

    useEffect(() => {
        if (isError) {
            toast.error(error?.response?.data?.message || "Failed to load product details");
        }
    }, [isError, error]);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    if (!product) {
        return (
            <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Product not found</h3>
                <p className="text-slate-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/products" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                        <div className="flex space-x-2 mt-2">
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
                                {product.category}
                            </span>
                        </div>
                    </div>
                </div>
                <Link to={`/products/${id}/edit`} className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all">
                    <Edit className="w-4 h-4 mr-2 text-slate-400" />
                    Edit Product
                </Link>
            </div>

            <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-slate-900 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-indigo-500" />
                        Product Specifications
                    </h3>
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-500 mr-3">Current Stock:</span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold border ${
                            product.currentStock <= product.minStockAlert 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                            {product.currentStock}
                        </span>
                        {product.currentStock <= product.minStockAlert && (
                            <AlertTriangle className="w-5 h-5 text-red-500 ml-3" title="Low Stock Warning" />
                        )}
                    </div>
                </div>
                <div className="px-6 py-2">
                    <dl className="divide-y divide-slate-100">
                        <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-slate-500 flex items-center"><Hash className="w-4 h-4 mr-2 text-slate-400" />SKU</dt>
                            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 font-mono font-medium">{product.sku}</dd>
                        </div>
                        <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-slate-500 flex items-center"><Tag className="w-4 h-4 mr-2 text-slate-400" />Category</dt>
                            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2">{product.category}</dd>
                        </div>
                        <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unit Price</dt>
                            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 font-medium">₹{parseFloat(product.unitPrice).toFixed(2)}</dd>
                        </div>
                        <div className="py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-slate-500 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-slate-400" />Min Stock Alert</dt>
                            <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2">{product.minStockAlert} units</dd>
                        </div>
                        {product.description && (
                            <div className="py-4 grid grid-cols-3 gap-4">
                                <dt className="text-sm font-medium text-slate-500 flex items-start mt-0.5"><FileText className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />Description</dt>
                                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 whitespace-pre-wrap leading-relaxed">{product.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-start shadow-sm">
                <AlertTriangle className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" />
                <div>
                    <h4 className="text-sm font-semibold text-indigo-900 mb-1">Stock Management Protocol</h4>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                        To update the stock for this product, please use the <Link to="/inventory" className="font-semibold underline hover:text-indigo-900">Inventory</Link> module to log a Stock In or Stock Out movement. Direct stock editing is disabled for strict audit compliance and transaction integrity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
