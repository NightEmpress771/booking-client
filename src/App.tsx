import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/common/Loading';

// Ліниві імпорти (сторінки завантажуються окремими файлами)
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
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
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
            <Route path="users/create" element={<ProtectedRoute><UserCreatePage /></ProtectedRoute>} />
            <Route path="users/:id/edit" element={<ProtectedRoute><UserEditPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}