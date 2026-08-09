import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductById, createProduct, updateProduct } from '../../api/product.api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ProductForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category: 'Electronics',
        unitPrice: '',
        minStockAlert: 10
    });
    
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const { data: responseData, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        enabled: isEdit,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isEdit && responseData?.success) {
            const { name, sku, description, category, unitPrice, minStockAlert } = responseData.data;
            setFormData({
                name: name || '',
                sku: sku || '',
                description: description || '',
                category: category || 'Electronics',
                unitPrice: unitPrice || '',
                minStockAlert: minStockAlert || 10
            });
        }
    }, [isEdit, responseData]);

    const mutation = useMutation({
        mutationFn: (payload) => isEdit ? updateProduct(id, payload) : createProduct(payload),
        onSuccess: () => {
            toast.success(isEdit ? "Product updated successfully" : "Product created successfully");
            setIsDirty(false);
            
            // Invalidate lists and details
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            
            if (isEdit) {
                queryClient.invalidateQueries({ queryKey: ['product', id] });
            }
            
            navigate('/products');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to save product");
        }
    });

    const handleChange = (e) => {
        setIsDirty(true);
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            unitPrice: parseFloat(formData.unitPrice),
            minStockAlert: parseInt(formData.minStockAlert, 10)
        };
        mutation.mutate(payload);
    };

    if (isEdit && isLoadingProduct) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center space-x-4">
                <Link to="/products" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
                    <p className="text-sm text-slate-500">Fill in the details below. Stock cannot be changed here.</p>
                </div>
            </div>

            <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name *</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">SKU (Stock Keeping Unit) *</label>
                            <input type="text" name="sku" required value={formData.sku} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2.5 px-3 uppercase transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                            <select name="category" required value={formData.category} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2.5 px-3 bg-white transition-colors">
                                <option value="Electronics">Electronics</option>
                                <option value="Apparel">Apparel</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Office">Office</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Price (₹) *</label>
                            <input type="number" step="0.01" min="0" name="unitPrice" required value={formData.unitPrice} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Min Stock Alert *</label>
                            <input type="number" min="0" name="minStockAlert" required value={formData.minStockAlert} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                        <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2.5 px-3 transition-colors"></textarea>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                        <Link to="/products" className="px-5 py-2.5 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={mutation.isPending} className="inline-flex justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50">
                            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
