import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { vehiclesService } from '@/services/vehicles.service';
import { bookingsService } from '@/services/bookings.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { useAuthStore } from '@/stores/authStore';
import type { Vehicle, VehicleType } from '@/types/api.types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Skeleton from '@/components/common/Skeleton';

const statusLabels: Record<Vehicle['status'], { text: string; badge: string }> = {
  AVAILABLE: {
    text: 'Вільний',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  IN_USE: {
    text: 'В оренді',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  MAINTENANCE: {
    text: 'На обслуговуванні',
    badge: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
};

export default function VehiclesCatalogPage() {
  const [typeFilter, setTypeFilter] = useState<'ALL' | VehicleType>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hours, setHours] = useState(2);
  const [insufficientError, setInsufficientError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);
  const token = useAuthStore((s) => s.accessToken);
  const balance = useAuthStore((s) => s.user?.balance ?? 0);
  const setBalance = useAuthStore((s) => s.setBalance);
  const queryClient = useQueryClient();

  useSocketEvent('vehicles:changed', () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  });

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['vehicles', { typeFilter, onlyAvailable, search: debouncedSearch }],
    queryFn: () =>
      vehiclesService.getAll({
        limit: 24,
        type: typeFilter,
        status: onlyAvailable ? 'AVAILABLE' : 'ALL',
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const rentMutation = useMutation({
    mutationFn: bookingsService.create,
    onSuccess: async (booking) => {
      if (booking.updatedBalance !== undefined) {
        setBalance(booking.updatedBalance);
      }
      toast.success(
        `Орендовано ${booking.vehicle?.model ?? 'транспорт'} на ${booking.hours} год.`
      );
      setInsufficientError(null);
      setSelectedVehicle(null);
      setHours(2);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      ]);
    },
    onError: (err) => {
      const dataErr = isAxiosError(err) ? err.response?.data : undefined;
      const msg = typeof dataErr?.error === 'string' ? dataErr.error : undefined;

      if (
        dataErr?.code === 'INSUFFICIENT_FUNDS' ||
        (msg && msg.toLowerCase().includes('недостатньо коштів'))
      ) {
        setInsufficientError(
          msg ?? 'Недостатньо коштів на балансі для оформлення цієї оренди.'
        );
        return;
      }

      toast.error(msg ?? 'Не вдалося оформити оренду');
    },
  });

  const totalCost = selectedVehicle ? selectedVehicle.pricePerHour * hours : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Каталог транспорту</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Оберіть велосипед або електросамокат для швидкої поїздки
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['ALL', 'Увесь транспорт'],
              ['BIKE', '🚲 Велосипеди'],
              ['SCOOTER', '🛴 Самокати'],
            ] as const
          ).map(([val, label]) => (
            <Button
              key={val}
              size="sm"
              variant={typeFilter === val ? 'primary' : 'secondary'}
              onClick={() => setTypeFilter(val)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-900">
        <Input
          aria-label="Пошук транспорту"
          placeholder="Пошук за моделлю або описом..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Лише вільні зараз
        </label>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p role="alert" className="text-red-500">
          Помилка завантаження каталогу: {error.message}
        </p>
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-lg bg-white p-10 text-center shadow dark:bg-gray-900">
          <p className="text-gray-500">За заданими параметрами транспорт не знайдено.</p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((vehicle) => {
            const st = statusLabels[vehicle.status];
            return (
              <div
                key={vehicle.id}
                className="flex flex-col justify-between rounded-lg border border-gray-100 bg-white p-6 shadow dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {vehicle.type === 'BIKE' ? '🚲 Велосипед' : '🛴 Самокат'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.badge}`}
                    >
                      {st.text}
                    </span>
                  </div>

                  <h2 className="mb-2 text-xl font-bold">{vehicle.model}</h2>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {vehicle.description || 'Зручний міський транспорт у відмінному стані.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-4 dark:border-gray-800">
                  <div>
                    <span className="text-2xl font-bold">{vehicle.pricePerHour} грн</span>
                    <span className="text-sm text-gray-500"> / год</span>
                  </div>

                  <Button
                    size="sm"
                    disabled={vehicle.status !== 'AVAILABLE'}
                    onClick={() => {
                      if (!token) {
                        toast.error('Увійдіть в акаунт, щоб оформити оренду');
                        return;
                      }
                      setInsufficientError(null);
                      setHours(2);
                      setSelectedVehicle(vehicle);
                    }}
                  >
                    {vehicle.status === 'AVAILABLE' ? 'Орендувати' : 'Недоступний'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={selectedVehicle !== null}
        onClose={() => {
          setInsufficientError(null);
          setSelectedVehicle(null);
        }}
        title={selectedVehicle ? `Оренда: ${selectedVehicle.model}` : 'Оренда транспорту'}
        size="sm"
      >
        {selectedVehicle && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInsufficientError(null);
              rentMutation.mutate({ vehicleId: selectedVehicle.id, hours });
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>
                Тариф: <strong>{selectedVehicle.pricePerHour} грн/год</strong>
              </span>
              <span>
                Ваш баланс: <strong>{balance} грн</strong>
              </span>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Тривалість оренди (годин)</span>
              <Input
                type="number"
                min={1}
                max={72}
                value={hours}
                onChange={(e) => {
                  setInsufficientError(null);
                  setHours(Math.max(Number(e.target.value) || 1, 1));
                }}
              />
            </label>

            <div className="rounded bg-gray-100 p-3 dark:bg-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">До сплати: </span>
              <strong className="text-lg">{totalCost} грн</strong>
            </div>

            {insufficientError && (
              <div
                role="alert"
                className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
              >
                <p className="font-medium">{insufficientError}</p>
                <div className="mt-2">
                  <Link to="/balance" onClick={() => setSelectedVehicle(null)}>
                    <Button type="button" size="sm">
                      Поповнити баланс
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setInsufficientError(null);
                  setSelectedVehicle(null);
                }}
              >
                Скасувати
              </Button>
              <Button type="submit" isLoading={rentMutation.isPending}>
                Підтвердити оренду
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}