import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';
import { useSocketConnection } from '@/hooks/useSocketConnection'; 

export default function Layout() {
  useSocketConnection(); 

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Header />
      <main className="container mx-auto flex-grow px-4 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}