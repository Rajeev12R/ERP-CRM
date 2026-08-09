import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerById } from '../../api/customer.api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Building2, Mail, Phone, MapPin, Hash, StickyNote, Edit } from 'lucide-react';
import FollowUpSection from './components/FollowUpSection';
import { useQuery } from '@tanstack/react-query';

const CustomerDetail = () => {
    const { id } = useParams();

    const { data: responseData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => getCustomerById(id),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    const customer = responseData?.data;

    useEffect(() => {
        if (isError) {
            toast.error(error?.response?.data?.message || "Failed to load customer details");
        }
    }, [isError, error]);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    if (!customer) {
        return (
            <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Customer not found</h3>
                <p className="text-slate-500 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
                <Link to="/customers" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/customers" className="p-2 -ml-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                                {customer.type}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                                customer.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 
                                customer.status === 'INACTIVE' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                                {customer.status}
                            </span>
                        </div>
                    </div>
                </div>
                <Link to={`/customers/${id}/edit`} className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all">
                    <Edit className="w-4 h-4 mr-2 text-slate-400" />
                    Edit Customer
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-base font-semibold text-slate-900">Customer Information</h3>
                        </div>
                        <div className="px-6 py-2">
                            <dl className="divide-y divide-slate-100">
                                <div className="py-4 grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-slate-500 flex items-center"><Phone className="w-4 h-4 mr-2 text-slate-400" />Mobile</dt>
                                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 font-medium">{customer.mobile}</dd>
                                </div>
                                <div className="py-4 grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-slate-500 flex items-center"><Mail className="w-4 h-4 mr-2 text-slate-400" />Email</dt>
                                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2">{customer.email || <span className="text-slate-400 italic">Not provided</span>}</dd>
                                </div>
                                <div className="py-4 grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-slate-500 flex items-center"><Building2 className="w-4 h-4 mr-2 text-slate-400" />Business Name</dt>
                                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2">{customer.businessName || <span className="text-slate-400 italic">Not provided</span>}</dd>
                                </div>
                                <div className="py-4 grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-slate-500 flex items-center"><Hash className="w-4 h-4 mr-2 text-slate-400" />GST Number</dt>
                                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 uppercase">{customer.gstNumber || <span className="text-slate-400 italic font-normal capitalize">Not provided</span>}</dd>
                                </div>
                                <div className="py-4 grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-slate-500 flex items-start mt-0.5"><MapPin className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />Address</dt>
                                    <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 leading-relaxed">{customer.address}</dd>
                                </div>
                                {customer.notes && (
                                    <div className="py-4 grid grid-cols-3 gap-4">
                                        <dt className="text-sm font-medium text-slate-500 flex items-start mt-0.5"><StickyNote className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />Notes</dt>
                                        <dd className="mt-1 text-sm text-slate-900 sm:mt-0 col-span-2 whitespace-pre-wrap leading-relaxed">{customer.notes}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <FollowUpSection customerId={id} followUps={customer.followUps || []} refreshCustomer={refetch} />
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
