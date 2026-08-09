import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Warehouse, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ isOpen, setOpen }) => {
    const { user, logout } = useAuth();
    const role = user?.role;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
        { name: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES'] },
        { name: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
        { name: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['ADMIN', 'WAREHOUSE'] },
        { name: 'Sales Challans', path: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(role));

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden transition-opacity" 
                    onClick={() => setOpen(false)}
                />
            )}
            <aside className={clsx(
                "fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 text-slate-700 transform transition-transform duration-300 flex flex-col shadow-xl md:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100 font-black text-xl tracking-tight text-blue-600 shrink-0">
                    Mini ERP
                </div>
                
                <nav className="flex-1 overflow-y-auto py-6">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</div>
                    <ul className="space-y-1.5 px-3">
                        {filteredNav.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) => clsx(
                                        "flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                        isActive 
                                            ? "bg-blue-50 text-blue-700" 
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className={clsx("w-5 h-5 mr-3 transition-colors", "text-current")} />
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold mr-3 uppercase border border-blue-200 shadow-sm">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs font-medium text-slate-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
