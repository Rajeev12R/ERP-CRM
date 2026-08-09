import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
    const location = useLocation();
    
    const getPageTitle = (pathname) => {
        if (pathname.startsWith('/dashboard')) return 'Dashboard';
        if (pathname.startsWith('/customers')) return 'Customers';
        if (pathname.startsWith('/products')) return 'Products';
        if (pathname.startsWith('/inventory')) return 'Inventory';
        if (pathname.startsWith('/challans')) return 'Sales Challans';
        return '';
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center">
                <button 
                    onClick={toggleSidebar}
                    className="md:hidden mr-4 p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-slate-800">
                    {getPageTitle(location.pathname)}
                </h1>
            </div>
        </header>
    );
};

export default Topbar;
