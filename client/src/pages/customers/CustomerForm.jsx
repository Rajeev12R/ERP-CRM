import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCustomerById, createCustomer, updateCustomer } from '../../api/customer.api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CustomerForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        type: 'RETAIL',
        status: 'LEAD',
        address: '',
        notes: ''
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

    const { data: responseData, isLoading: isLoadingCustomer } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => getCustomerById(id),
        enabled: isEdit,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isEdit && responseData?.success) {
            const { name, mobile, email, businessName, gstNumber, type, status, address, notes } = responseData.data;
            setFormData({
                name: name || '',
                mobile: mobile || '',
                email: email || '',
                businessName: businessName || '',
                gstNumber: gstNumber || '',
                type: type || 'RETAIL',
                status: status || 'LEAD',
                address: address || '',
                notes: notes || ''
            });
        }
    }, [isEdit, responseData]);

    const mutation = useMutation({
        mutationFn: (data) => isEdit ? updateCustomer(id, data) : createCustomer(data),
        onSuccess: () => {
            toast.success(isEdit ? "Customer updated successfully" : "Customer created successfully");
            setIsDirty(false);
            
            // Invalidate queries to update lists and dashboard
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // If we start grouping dashboard stats
            
            if (isEdit) {
                queryClient.invalidateQueries({ queryKey: ['customer', id] });
            }
            
            navigate('/customers');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to save customer");
        }
    });

    const handleChange = (e) => {
        setIsDirty(true);
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isEdit && isLoadingCustomer) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center space-x-4">
                <Link to="/customers" className="p-2 -ml-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>
                    <p className="text-sm text-slate-500">Fill in the details below.</p>
                </div>
            </div>

            <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile *</label>
                            <input type="text" name="mobile" required pattern="[0-9]{10,15}" title="10 to 15 digits" value={formData.mobile} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                            <input type="email" name="email" pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" title="Valid email address" value={formData.email} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
                            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">GST Number</label>
                            <input type="text" name="gstNumber" pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" title="Valid GST Number (e.g. 22AAAAA0000A1Z5)" value={formData.gstNumber} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 uppercase transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Type *</label>
                            <select name="type" required value={formData.type} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 bg-white transition-colors">
                                <option value="RETAIL">Retail</option>
                                <option value="WHOLESALE">Wholesale</option>
                                <option value="DISTRIBUTOR">Distributor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 bg-white transition-colors">
                                <option value="LEAD">Lead</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Address *</label>
                        <textarea name="address" required rows="3" value={formData.address} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                        <textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2.5 px-3 transition-colors"></textarea>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                        <Link to="/customers" className="px-5 py-2.5 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={mutation.isPending} className="inline-flex justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
                            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerForm;
