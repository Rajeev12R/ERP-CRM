import React, { useState, useEffect } from 'react';
import { stockIn, stockOut } from '../../../api/stock.api';
import { getProducts } from '../../../api/product.api';
import toast from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const StockMovementModal = ({ isOpen, onClose, type }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        reason: ''
    });

    // Fetch all products for the dropdown
    const { data: productsData, isLoading: loadingProducts } = useQuery({
        queryKey: ['products-all'],
        queryFn: () => getProducts({ limit: 1000 }), // large limit for dropdown
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });

    const products = productsData?.data || [];

    // Set initial product when products load
    useEffect(() => {
        if (products.length > 0 && !formData.productId) {
            setFormData(prev => ({ ...prev, productId: products[0].id }));
        }
    }, [products, formData.productId]);

    const mutation = useMutation({
        mutationFn: (payload) => type === 'IN' ? stockIn(payload) : stockOut(payload),
        onSuccess: () => {
            toast.success(type === 'IN' ? "Stock added successfully" : "Stock removed successfully");
            
            // Invalidate all affected queries
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', formData.productId] });
            queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
            queryClient.invalidateQueries({ queryKey: ['low-stock'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            onClose();
            // Reset form for next open
            setFormData(prev => ({ ...prev, quantity: '', reason: '' }));
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to process stock movement");
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.productId || !formData.quantity || formData.quantity <= 0) {
            toast.error("Please enter a valid product and quantity");
            return;
        }

        mutation.mutate({
            productId: formData.productId,
            quantity: parseInt(formData.quantity, 10),
            reason: formData.reason
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button type="button" onClick={onClose} className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none">
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                                {type === 'IN' ? 'Stock In' : 'Stock Out'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-500">
                                    {type === 'IN' ? 'Add inventory to a product.' : 'Remove inventory from a product.'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Product *</label>
                                    {loadingProducts ? (
                                        <div className="mt-1 block w-full text-sm text-slate-500 py-2 items-center">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-500" /> Loading products...
                                        </div>
                                    ) : (
                                        <select 
                                            name="productId" 
                                            required 
                                            value={formData.productId} 
                                            onChange={handleChange} 
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                        >
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Quantity *</label>
                                    <input 
                                        type="number" 
                                        name="quantity" 
                                        required 
                                        min="1"
                                        value={formData.quantity} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2 px-3" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Reason</label>
                                    <input 
                                        type="text" 
                                        name="reason" 
                                        placeholder="e.g. Damage, Restock, Return"
                                        value={formData.reason} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2 px-3" 
                                    />
                                </div>

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button 
                                        type="submit" 
                                        disabled={mutation.isPending || loadingProducts}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                                            type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        } disabled:opacity-50`}
                                    >
                                        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={onClose}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockMovementModal;
