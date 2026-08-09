import React, { useState } from 'react';
import { addFollowUp } from '../../../api/customer.api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Calendar, Clock } from 'lucide-react';

const FollowUpSection = ({ customerId, followUps, refreshCustomer }) => {
    const [note, setNote] = useState('');
    const [followUpAt, setFollowUpAt] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note) {
            toast.error("Please enter a note");
            return;
        }

        setSubmitting(true);
        try {
            const data = { note };
            if (followUpAt) data.followUpAt = followUpAt;

            await addFollowUp(customerId, data);
            toast.success("Follow-up added");
            setNote('');
            setFollowUpAt('');
            refreshCustomer();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add follow-up");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow-sm sm:rounded-xl border border-slate-200 flex flex-col h-full max-h-200">
            <div className="px-4 py-5 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Follow-ups</h3>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <textarea
                            placeholder="Add a new follow-up note..."
                            rows="2"
                            required
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2 px-3"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="datetime-local"
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2 px-3"
                            value={followUpAt}
                            onChange={(e) => setFollowUpAt(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {followUps.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 py-4">No follow-ups recorded yet.</div>
                ) : (
                    followUps.slice().reverse().map((fw) => (
                        <div key={fw.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">{fw.note}</p>
                            <div className="mt-2 flex items-center text-xs text-slate-500 space-x-4">
                                <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(fw.createdAt).toLocaleDateString()}
                                </span>
                                {fw.followUpAt && (
                                    <span className="flex items-center text-amber-600">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Scheduled: {new Date(fw.followUpAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FollowUpSection;
