import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';
import InventoryOverview from './pages/inventory/InventoryOverview';
import ChallanList from './pages/challans/ChallanList';
import CreateChallanFlow from './pages/challans/CreateChallanFlow';
import ChallanDetail from './pages/challans/ChallanDetail';
import { ForbiddenPage, NotFoundPage } from './pages/errors/ErrorPages';

import HomePage from './pages/home/HomePage';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            
                            <Route path="customers">
                                <Route index element={<CustomerList />} />
                                <Route path="new" element={<CustomerForm />} />
                                <Route path=":id" element={<CustomerDetail />} />
                                <Route path=":id/edit" element={<CustomerForm />} />
                            </Route>

                            <Route path="products">
                                <Route index element={<ProductList />} />
                                <Route path="new" element={<ProductForm />} />
                                <Route path=":id" element={<ProductDetail />} />
                                <Route path=":id/edit" element={<ProductForm />} />
                            </Route>

                            <Route path="inventory" element={<InventoryOverview />} />

                            <Route path="challans">
                                <Route index element={<ChallanList />} />
                                <Route path="new" element={<CreateChallanFlow />} />
                                <Route path=":id" element={<ChallanDetail />} />
                            </Route>
                            
                            <Route path="unauthorized" element={<ForbiddenPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;