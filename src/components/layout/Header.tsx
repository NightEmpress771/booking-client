import { Link, useNavigate } from 'react-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import NotificationBell from '@/components/NotificationBell';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md transition-colors dark:bg-gray-900">
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Bike&Scooter
        </Link>

        <div className="flex flex-wrap items-center gap-5">
          <Link to="/" className="font-medium hover:text-blue-600 dark:text-gray-200">
            Головна
          </Link>
          <Link to="/vehicles" className="font-medium hover:text-blue-600 dark:text-gray-200">
            Каталог
          </Link>

          {user ? (
            <>
              <Link to="/bookings" className="font-medium hover:text-blue-600 dark:text-gray-200">
                Бронювання
              </Link>
              <Link
                to="/balance"
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
              >
                💳 {user.balance ?? 0} грн
              </Link>
              <Link to="/dashboard" className="font-medium hover:text-blue-600 dark:text-gray-200">
                Панель
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="font-semibold text-purple-600 hover:underline dark:text-purple-400"
                >
                  Адмін-панель
                </Link>
              )}
              <NotificationBell />
              <span className="text-sm font-semibold text-gray-500">{user.name}</span>
              <Button size="sm" variant="secondary" onClick={handleLogout}>
                Вийти
              </Button>
            </>
          ) : (
            <Link to="/login" className="font-medium hover:text-blue-600 dark:text-gray-200">
              Увійти
            </Link>
          )}

          <button type="button" onClick={toggleTheme} className="text-xl" title="Перемкнути тему">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  );
}