import { Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';

const sections = [
  { to: '/users', title: 'Користувачі', text: 'Керування користувачами системи' },
  { to: '/products', title: 'Транспорт', text: 'Каталог велосипедів та самокатів' },
  { to: '/orders', title: 'Бронювання', text: 'Перегляд та керування замовленнями' },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Вітаємо, {user?.name}!</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-900 block"
          >
            <h3 className="mb-2 text-xl font-semibold text-blue-600 dark:text-blue-400">{s.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{s.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}