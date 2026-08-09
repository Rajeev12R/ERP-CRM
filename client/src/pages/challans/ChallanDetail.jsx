import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChallanById, confirmChallan, cancelChallan } from '../../api/challan.api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, CheckCircle, XCircle, FileText, User, Calendar, DollarSign, Package, AlertTriangle, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ChallanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const contentRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Invoice-${id}`,
    });

    const { data: challanData, isLoading, isError, error } = useQuery({
        queryKey: ['challan', id],
        queryFn: () => getChallanById(id),
        staleTime: 2 * 60 * 1000,
    });

    const challanRaw = challanData?.data;
    
    const challan = challanRaw ? {
        ...challanRaw,
        totalValue: challanRaw.items?.reduce((sum, item) => sum + (item.quantity * parseFloat(item.unitPrice || 0)), 0) || 0,
        items: challanRaw.items?.map(item => ({
            ...item,
            totalPrice: item.quantity * parseFloat(item.unitPrice || 0)
        }))
    } : null;

    useEffect(() => {
        if (isError) {
            toast.error(error?.response?.data?.message || "Failed to load challan details");
        }
    }, [isError, error]);

    const confirmMutation = useMutation({
        mutationFn: () => confirmChallan(id),
        onSuccess: () => {
            toast.success("Challan confirmed successfully. Stock deducted.");
            queryClient.invalidateQueries({ queryKey: ['challan', id] });
            queryClient.invalidateQueries({ queryKey: ['challans'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock changed
            queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
            queryClient.invalidateQueries({ queryKey: ['low-stock'] });
            setConfirmModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to confirm challan");
        }
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelChallan(id),
        onSuccess: () => {
            toast.success("Challan cancelled");
            queryClient.invalidateQueries({ queryKey: ['challan', id] });
            queryClient.invalidateQueries({ queryKey: ['challans'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Reserved stock restored
            queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to cancel challan");
        }
    });

    const handleConfirm = () => {
        confirmMutation.mutate();
    };

    const handleCancel = () => {
        if (!window.confirm("Are you sure you want to cancel this challan?")) return;
        cancelMutation.mutate();
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    if (!challan) {
        return (
            <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Challan not found</h3>
                <p className="text-slate-500 mb-6">The challan you're looking for doesn't exist or has been removed.</p>
                <Link to="/challans" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Challans
                </Link>
            </div>
        );
    }

    const isDraft = challan.status === 'DRAFT';
    const actionLoading = confirmMutation.isPending || cancelMutation.isPending;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/challans" className="p-2 -ml-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-mono">Challan: {challan.challanNo}</h2>
                        <div className="flex space-x-2 mt-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                                challan.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                challan.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {challan.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => handlePrint()}
                        className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2 text-slate-500" />
                        Export PDF
                    </button>
                    {isDraft && (
                        <>
                            <button 
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                Cancel
                            </button>
                            <button 
                                onClick={() => setConfirmModalOpen(true)}
                                disabled={actionLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all hover:shadow-md"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirm Challan
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div ref={contentRef} className="print:p-8 space-y-6">
                <div className="hidden print:block mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
                    <p className="text-slate-500 mt-1">Challan No: {challan.challanNo}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-slate-400" />
                        <h3 className="text-base font-semibold text-slate-900">Details</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-start text-sm">
                            <Calendar className="w-5 h-5 mr-3 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Created Date</p>
                                <p className="font-medium text-slate-900">{new Date(challan.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start text-sm">
                            <User className="w-5 h-5 mr-3 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Created By</p>
                                <p className="font-medium text-slate-900">{challan.user.name} <span className="text-slate-400 font-normal">({challan.user.role})</span></p>
                            </div>
                        </div>
                        <div className="flex items-start text-sm">
                            <DollarSign className="w-5 h-5 mr-3 text-emerald-500 mt-1" />
                            <div>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Value</p>
                                <p className="font-bold text-slate-900 text-xl">₹{parseFloat(challan.totalValue).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between print:bg-white print:border-slate-300">
                        <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-slate-400" />
                            <h3 className="text-base font-semibold text-slate-900">Customer</h3>
                        </div>
                            <Link to={`/customers/${challan.customerId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors print:hidden">View Profile</Link>
                    </div>
                    <div className="p-6 space-y-3">
                        <div>
                            <p className="font-bold text-lg text-slate-900">{challan.customer.name}</p>
                            {challan.customer.businessName && <p className="text-sm font-medium text-slate-600">{challan.customer.businessName}</p>}
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm text-slate-600 flex items-center"><span className="text-slate-400 w-16">Mobile:</span> {challan.customer.mobile}</p>
                            {challan.customer.email && <p className="text-sm text-slate-600 flex items-center"><span className="text-slate-400 w-16">Email:</span> {challan.customer.email}</p>}
                        </div>
                        <div className="pt-3 border-t border-slate-100 mt-3">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Shipping Address</p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{challan.customer.address}</p>
                        </div>
                    </div>
                </div>
            </div>

                <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center print:bg-white print:border-slate-300">
                    <Package className="w-5 h-5 mr-2 text-slate-400" />
                    <h3 className="text-base font-semibold text-slate-900">Items</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Price</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {challan.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{item.productName}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">SKU: {item.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-700">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600 font-medium">
                                        ₹{parseFloat(item.unitPrice).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                        ₹{parseFloat(item.totalPrice).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                            <tr>
                                <th scope="row" colSpan="3" className="px-6 py-5 text-right text-sm font-bold text-slate-600 uppercase tracking-wider">Grand Total:</th>
                                <td className="px-6 py-5 whitespace-nowrap text-right text-xl font-black text-slate-900">
                                    ₹{parseFloat(challan.totalValue).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                </div>
            </div>

            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setConfirmModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative border border-slate-100">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                                        Confirm Challan & Deduct Stock
                                    </h3>
                                    <div className="mt-3 text-sm text-slate-600 space-y-2">
                                        <p>You are about to confirm Challan <span className="font-bold text-slate-900 font-mono">{challan.challanNo}</span>.</p>
                                        <p className="font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">This action is irreversible and will permanently deduct the inventory from your stock.</p>
                                        <p>Are you sure you want to proceed?</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 sm:mt-5 sm:flex sm:flex-row-reverse">
                                <button 
                                    type="button" 
                                    disabled={actionLoading}
                                    onClick={handleConfirm}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-rose-600 text-base font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Confirm & Deduct'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setConfirmModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallanDetail;
