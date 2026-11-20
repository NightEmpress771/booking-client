import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Loading from '@/components/common/Loading';

const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const VehiclesCatalogPage = lazy(() => import('@/pages/VehiclesCatalogPage'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const TopUpPage = lazy(() => import('@/pages/TopUpPage'));
const AdminPanelPage = lazy(() => import('@/pages/AdminPanelPage'));
const VehiclesManagePage = lazy(() => import('@/pages/VehiclesManagePage'));
const UsersListPage = lazy(() => import('@/pages/UsersListPage'));
const UserCreatePage = lazy(() => import('@/pages/UserCreatePage'));
const UserEditPage = lazy(() => import('@/pages/UserEditPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="vehicles" element={<VehiclesCatalogPage />} />

            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="balance"
              element={
                <ProtectedRoute>
                  <TopUpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminPanelPage />
                </AdminRoute>
              }
            />
            <Route
              path="vehicles/manage"
              element={
                <AdminRoute>
                  <VehiclesManagePage />
                </AdminRoute>
              }
            />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <UsersListPage />
                </AdminRoute>
              }
            />
            <Route
              path="users/create"
              element={
                <AdminRoute>
                  <UserCreatePage />
                </AdminRoute>
              }
            />
            <Route
              path="users/:id/edit"
              element={
                <AdminRoute>
                  <UserEditPage />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}