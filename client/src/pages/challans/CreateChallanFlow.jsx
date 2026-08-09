import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCustomers } from '../../api/customer.api';
import { getProducts } from '../../api/product.api';
import { createChallan } from '../../api/challan.api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Trash2, FileText, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CreateChallanFlow = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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

    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

    const { data: customersData, isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers-all'],
        queryFn: () => getCustomers({ limit: 500 }),
        staleTime: 5 * 60 * 1000,
    });

    const { data: productsData, isLoading: loadingProducts } = useQuery({
        queryKey: ['products-all'],
        queryFn: () => getProducts({ limit: 500 }),
        staleTime: 5 * 60 * 1000,
    });

    const customers = customersData?.data || [];
    const products = productsData?.data || [];

    const loadingData = loadingCustomers || loadingProducts;

    const handleItemChange = (index, field, value) => {
        setIsDirty(true);
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setIsDirty(true);
        setItems([...items, { productId: '', quantity: 1 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setIsDirty(true);
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const mutation = useMutation({
        mutationFn: (payload) => createChallan(payload),
        onSuccess: (res) => {
            setIsDirty(false);
            toast.success("Challan created as DRAFT");
            queryClient.invalidateQueries({ queryKey: ['challans'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            navigate(`/challans/${res.data.id}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create challan");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCustomer) {
            toast.error("Please select a customer");
            return;
        }

        const validItems = items.filter(i => i.productId && i.quantity > 0);
        if (validItems.length === 0) {
            toast.error("Please add at least one valid product with quantity > 0");
            return;
        }

        const formattedItems = validItems.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity, 10)
        }));

        mutation.mutate({
            customerId: selectedCustomer,
            items: formattedItems
        });
    };

    if (loadingData) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center space-x-4">
                <Link to="/challans" className="p-2 -ml-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Create Sales Challan</h2>
                    <p className="text-sm text-slate-500">Creates a new challan in DRAFT status. No stock is deducted yet.</p>
                </div>
            </div>

            <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Customer *</label>
                        <select 
                            required 
                            value={selectedCustomer} 
                            onChange={(e) => {
                                setIsDirty(true);
                                setSelectedCustomer(e.target.value);
                            }} 
                            className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 bg-white transition-colors"
                        >
                            <option value="" disabled>-- Select a customer --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-slate-400" /> Products List *
                            </label>
                            <button type="button" onClick={addItem} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                <Plus className="w-4 h-4 mr-1" /> Add Product Row
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-start space-x-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Search className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <select 
                                                required 
                                                value={item.productId} 
                                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)} 
                                                className="block w-full rounded-lg border-slate-200 pl-9 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 bg-white transition-colors"
                                            >
                                                <option value="" disabled>-- Search / Select a product --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku}) - ₹{parseFloat(p.unitPrice).toFixed(2)} - Stock: {p.currentStock}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required 
                                            placeholder="Qty"
                                            value={item.quantity} 
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                            className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors text-center" 
                                        />
                                    </div>
                                    <div className="pt-1.5">
                                        <button 
                                            type="button" 
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                        <Link to="/challans" className="px-5 py-2.5 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={mutation.isPending} className="inline-flex justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
                            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Draft Challan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChallanFlow;
