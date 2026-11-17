import { BrowserRouter, Route, Routes } from 'react-router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersListPage from '@/pages/UsersListPage';
import UserCreatePage from '@/pages/UserCreatePage';
import UserEditPage from '@/pages/UserEditPage';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}