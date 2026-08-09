import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, FileQuestion, ArrowLeft } from 'lucide-react';

export const ForbiddenPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-rose-100 selection:text-rose-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center shadow-inner border border-rose-200">
                        <ShieldAlert className="h-10 w-10 text-rose-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">403 Forbidden</h2>
                <div className="mt-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mx-4 sm:mx-0">
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                        You don't have the necessary permissions to access this resource based on your current role.
                    </p>
                    <div className="mt-8">
                        <Link to="/" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:shadow-md group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-100 selection:text-blue-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-inner border border-blue-200">
                        <FileQuestion className="h-10 w-10 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">404 Not Found</h2>
                <div className="mt-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mx-4 sm:mx-0">
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
                    </p>
                    <div className="mt-8">
                        <Link to="/" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-md group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
