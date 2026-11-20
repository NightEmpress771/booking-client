import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { vehiclesService } from '@/services/vehicles.service';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types/api.types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function VehiclesManagePage() {
  const [type, setType] = useState<VehicleType>('BIKE');
  const [model, setModel] = useState('');
  const [pricePerHour, setPricePerHour] = useState(60);
  const [status, setStatus] = useState<VehicleStatus>('AVAILABLE');
  const [description, setDescription] = useState('');
  const [toDelete, setToDelete] = useState<Vehicle | null>(null);

  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['vehicles', 'manage'],
    queryFn: () => vehiclesService.getAll({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: vehiclesService.create,
    onSuccess: async () => {
      toast.success('Транспорт додано до каталогу');
      setModel('');
      setDescription('');
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err) => {
      const msg = isAxiosError(err) ? err.response?.data?.error : undefined;
      toast.error(msg ?? 'Помилка додавання транспорту');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehiclesService.remove,
    onSuccess: async () => {
      toast.success('Транспорт видалено');
      setToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: () => toast.error('Не вдалося видалити транспорт'),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Керування транспортом</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (model.trim().length < 2) {
            toast.error('Вкажіть модель (мінімум 2 символи)');
            return;
          }
          createMutation.mutate({
            type,
            model: model.trim(),
            pricePerHour: Number(pricePerHour) || 50,
            status,
            description: description.trim() || undefined,
          });
        }}
        className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900 md:grid-cols-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Тип</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as VehicleType)}
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="BIKE">Велосипед</option>
            <option value="SCOOTER">Самокат</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Модель</label>
          <Input
            placeholder="Xiaomi Mi Pro 2 / Trek FX 2"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Ціна (грн/год)</label>
          <Input
            type="number"
            min={1}
            value={pricePerHour}
            onChange={(e) => setPricePerHour(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as VehicleStatus)}
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="AVAILABLE">Вільний</option>
            <option value="IN_USE">В оренді</option>
            <option value="MAINTENANCE">На обслуговуванні</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button type="submit" className="w-full" isLoading={createMutation.isPending}>
            Додати
          </Button>
        </div>

        <div className="md:col-span-5">
          <Input
            placeholder="Короткий опис (необов'язково)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>

      {isPending ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['ID', 'Тип', 'Модель', 'Ціна/год', 'Статус', 'Дії'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.data.map((v) => (
                <tr key={v.id}>
                  <td className="px-6 py-4">{v.id}</td>
                  <td className="px-6 py-4">{v.type === 'BIKE' ? 'Велосипед' : 'Самокат'}</td>
                  <td className="px-6 py-4 font-medium">{v.model}</td>
                  <td className="px-6 py-4">{v.pricePerHour} грн</td>
                  <td className="px-6 py-4">{v.status}</td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="danger" onClick={() => setToDelete(v)}>
                      Видалити
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={toDelete !== null}
        title="Видалення транспорту"
        message={`Видалити «${toDelete?.model}»?`}
        confirmText="Видалити"
        isLoading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}