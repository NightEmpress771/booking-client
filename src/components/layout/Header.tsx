import { Link, useNavigate } from 'react-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';

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
    <header className="bg-white shadow-md dark:bg-gray-900 transition-colors">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          MyApp
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="font-medium hover:text-blue-600 dark:text-gray-200">
            Головна
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="font-medium hover:text-blue-600 dark:text-gray-200">
                Панель
              </Link>
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