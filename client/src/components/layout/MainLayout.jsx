import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
