import { Link } from 'react-router';
import { useTheme } from '@/hooks/useTheme';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white shadow-md dark:bg-gray-900 transition-colors">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          MyApp
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="font-medium hover:text-blue-600 dark:text-gray-200">Головна</Link>
          <Link to="/about" className="font-medium hover:text-blue-600 dark:text-gray-200">Про нас</Link>
          <button type="button" onClick={toggleTheme} className="text-xl" title="Перемкнути тему">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  );
}