import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { bookingsService } from '@/services/bookings.service';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import TaskBoard from '@/components/TaskBoard';
import StatsChart from '@/components/StatsChart';
import Skeleton from '@/components/common/Skeleton';

// Порядок днів тижня: індекс 0 у JS Date.getDay() — це Неділя
const DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const ORDERED_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  // Оновлюємо графік наживо при створенні або завершенні бронювань
  useSocketEvent('bookings:changed', () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  });

  // Завантажуємо бронювання (бекенд сам віддає адміну всі, а користувачу — лише його)
  const { data: bookings, isPending } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsService.getAll,
  });

  // Групуємо бронювання по днях тижня для графіка
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      Пн: 0,
      Вт: 0,
      Ср: 0,
      Чт: 0,
      Пт: 0,
      Сб: 0,
      Нд: 0,
    };

    if (bookings) {
      for (const booking of bookings) {
        const dayIndex = new Date(booking.startTime).getDay();
        const dayLabel = DAY_NAMES[dayIndex];
        if (dayLabel) {
          counts[dayLabel] += 1;
        }
      }
    }

    return ORDERED_DAYS.map((name) => ({
      name,
      value: counts[name] ?? 0,
    }));
  }, [bookings]);

  const sections = [
    {
      to: '/vehicles',
      title: 'Каталог транспорту',
      text: 'Перегляд велосипедів і самокатів та оформлення оренди',
    },
    {
      to: '/bookings',
      title: 'Бронювання',
      text: 'Активні та завершені поїздки',
    },
    {
      to: '/balance',
      title: `Баланс (${user?.balance ?? 0} грн)`,
      text: 'Поповнення рахунку через банківський шлюз',
    },
    ...(isAdmin
      ? [
          {
            to: '/admin',
            title: 'Адмін-панель',
            text: 'Транспорт, доступність та ролі користувачів',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Вітаємо, {user?.name}!</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-900"
          >
            <h3 className="mb-2 text-xl font-semibold text-blue-600 dark:text-blue-400">
              {s.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{s.text}</p>
          </Link>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-8 ${isAdmin ? 'lg:grid-cols-2' : ''}`}>
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            {isAdmin ? 'Загальна активність бронювань (усі користувачі)' : 'Моя активність бронювань'}
          </h2>
          {isPending ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <StatsChart
              data={chartData}
              title={isAdmin ? 'Кількість усіх оренд по днях тижня' : 'Мої оренди по днях тижня'}
            />
          )}
        </div>

        {isAdmin && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">Дошка завдань (Drag & Drop)</h2>
            <TaskBoard />
          </div>
        )}
      </div>
    </div>
  );
}