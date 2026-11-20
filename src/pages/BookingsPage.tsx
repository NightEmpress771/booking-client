import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingsService } from '@/services/bookings.service';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useSocketEvent('bookings:changed', () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  });

  const { data: bookings, isPending, isError, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsService.getAll,
  });

  const completeMutation = useMutation({
    mutationFn: bookingsService.complete,
    onSuccess: async () => {
      toast.success('Поїздку завершено, транспорт знову доступний');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
      ]);
    },
    onError: () => toast.error('Не вдалося завершити оренду'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {user?.role === 'ADMIN' ? 'Усі бронювання системи' : 'Мої бронювання'}
      </h1>

      {isPending && <TableSkeleton />}
      {isError && (
        <p role="alert" className="text-red-500">
          Помилка: {error.message}
        </p>
      )}

      {bookings && (
        <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['ID', 'Транспорт', ...(user?.role === 'ADMIN' ? ['Користувач'] : []), 'Годин', 'Сума', 'Статус', 'Дії'].map(
                  (col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Бронювань поки немає
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-6 py-4">{b.id}</td>
                  <td className="px-6 py-4 font-medium">
                    {b.vehicle?.model ?? `Транспорт #${b.vehicleId}`}
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {b.user?.name ?? `ID ${b.userId}`}
                    </td>
                  )}
                  <td className="px-6 py-4">{b.hours} год</td>
                  <td className="px-6 py-4 font-semibold">{b.totalPrice} грн</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? 'Активна' : 'Завершена'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {b.status === 'ACTIVE' ? (
                      <Button
                        size="sm"
                        isLoading={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(b.id)}
                      >
                        Завершити
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}