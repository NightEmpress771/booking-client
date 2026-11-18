import { Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import TaskBoard from '@/components/TaskBoard';
import StatsChart from '@/components/StatsChart';

const sections = [
  { to: '/users', title: 'Користувачі', text: 'Керування користувачами системи' },
  { to: '/products', title: 'Транспорт', text: 'Каталог велосипедів та самокатів' },
  { to: '/orders', title: 'Бронювання', text: 'Перегляд та керування замовленнями' },
];

const chartData = [
  { name: 'Пн', value: 4 }, { name: 'Вв', value: 7 }, { name: 'Ср', value: 5 },
  { name: 'Чт', value: 10 }, { name: 'Пт', value: 15 }, { name: 'Сб', value: 22 }, { name: 'Нд', value: 18 },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Вітаємо, {user?.name}!</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-900 block">
            <h3 className="mb-2 text-xl font-semibold text-blue-600 dark:text-blue-400">{s.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{s.text}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Активність бронювань</h2>
          <StatsChart data={chartData} title="Кількість оренд за тиждень" />
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">Дошка завдань (Drag & Drop)</h2>
          <TaskBoard />
        </div>
      </div>
    </div>
  );
}