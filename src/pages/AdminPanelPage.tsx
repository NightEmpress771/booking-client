import { useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { vehiclesService } from '@/services/vehicles.service';
import { usersService } from '@/services/users.service';
import type { User, Vehicle, VehicleStatus, VehicleType } from '@/types/api.types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function AdminPanelPage() {
  const queryClient = useQueryClient();

  // Форма нового транспорту
  const [type, setType] = useState<VehicleType>('BIKE');
  const [model, setModel] = useState('');
  const [pricePerHour, setPricePerHour] = useState(60);
  const [status, setStatus] = useState<VehicleStatus>('AVAILABLE');
  const [description, setDescription] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const { data: vehiclesData, isPending: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles', 'admin'],
    queryFn: () => vehiclesService.getAll({ limit: 50 }),
  });

  const { data: usersData, isPending: isLoadingUsers } = useQuery({
    queryKey: ['users', 'admin'],
    queryFn: () => usersService.getAll({ limit: 50 }),
  });

  const createVehicle = useMutation({
    mutationFn: vehiclesService.create,
    onSuccess: async () => {
      toast.success('Транспорт додано');
      setModel('');
      setDescription('');
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err) => {
      const msg = isAxiosError(err) ? err.response?.data?.error : undefined;
      toast.error(msg ?? 'Помилка додавання транспорту');
    },
  });

  const updateVehicleStatus = useMutation({
    mutationFn: ({ vehicle, nextStatus }: { vehicle: Vehicle; nextStatus: VehicleStatus }) =>
      vehiclesService.update(vehicle.id, {
        type: vehicle.type,
        model: vehicle.model,
        description: vehicle.description ?? undefined,
        pricePerHour: vehicle.pricePerHour,
        imageUrl: vehicle.imageUrl ?? undefined,
        status: nextStatus,
      }),
    onSuccess: async () => {
      toast.success('Статус доступності оновлено');
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: () => toast.error('Не вдалося змінити статус'),
  });

  const deleteVehicle = useMutation({
    mutationFn: vehiclesService.remove,
    onSuccess: async () => {
      toast.success('Транспорт видалено');
      setVehicleToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: () => toast.error('Не вдалося видалити транспорт'),
  });

  const toggleAdminRole = useMutation({
    mutationFn: (u: User) => usersService.updateRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN'),
    onSuccess: async (updated) => {
      toast.success(`Роль для ${updated.name}: ${updated.role}`);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Не вдалося змінити роль'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Панель адміністратора</h1>

      <TabGroup>
        <TabList className="mb-6 flex gap-2 border-b dark:border-gray-800">
          <Tab className="rounded-t-lg px-4 py-2.5 text-sm font-medium outline-none data-[selected]:border-b-2 data-[selected]:border-blue-600 data-[selected]:text-blue-600">
            🚲 Транспорт та доступність
          </Tab>
          <Tab className="rounded-t-lg px-4 py-2.5 text-sm font-medium outline-none data-[selected]:border-b-2 data-[selected]:border-blue-600 data-[selected]:text-blue-600">
            👑 Користувачі та права адміна
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel className="space-y-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (model.trim().length < 2) {
                  toast.error('Вкажіть модель (мінімум 2 символи)');
                  return;
                }
                createVehicle.mutate({
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
                  placeholder="Xiaomi Pro 2 / Trek FX 2"
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
                <label className="mb-1 block text-sm font-medium">Початковий статус</label>
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
                <Button type="submit" className="w-full" isLoading={createVehicle.isPending}>
                  Додати
                </Button>
              </div>

              <div className="md:col-span-5">
                <Input
                  placeholder="Опис або примітка (необов'язково)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </form>

            {isLoadingVehicles ? (
              <TableSkeleton />
            ) : (
              <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['ID', 'Тип', 'Модель', 'Ціна/год', 'Доступність', 'Дії'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {vehiclesData?.data.map((v) => (
                      <tr key={v.id}>
                        <td className="px-6 py-4">{v.id}</td>
                        <td className="px-6 py-4">{v.type === 'BIKE' ? 'Велосипед' : 'Самокат'}</td>
                        <td className="px-6 py-4 font-medium">{v.model}</td>
                        <td className="px-6 py-4">{v.pricePerHour} грн</td>
                        <td className="px-6 py-4">
                          <select
                            aria-label={`Статус для ${v.model}`}
                            value={v.status}
                            disabled={updateVehicleStatus.isPending}
                            onChange={(e) =>
                              updateVehicleStatus.mutate({
                                vehicle: v,
                                nextStatus: e.target.value as VehicleStatus,
                              })
                            }
                            className="rounded border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
                          >
                            <option value="AVAILABLE">✅ Вільний (AVAILABLE)</option>
                            <option value="IN_USE">🚴 В оренді (IN_USE)</option>
                            <option value="MAINTENANCE">🔧 На обслуговуванні (MAINTENANCE)</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <Button size="sm" variant="danger" onClick={() => setVehicleToDelete(v)}>
                            Видалити
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabPanel>

          <TabPanel>
            {isLoadingUsers ? (
              <TableSkeleton />
            ) : (
              <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-900">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['ID', "Ім'я", 'Email', 'Баланс', 'Роль', 'Права адміністратора'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {usersData?.data.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4">{u.id}</td>
                        <td className="px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">{u.balance ?? 0} грн</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant={u.role === 'ADMIN' ? 'secondary' : 'primary'}
                            isLoading={toggleAdminRole.isPending}
                            onClick={() => toggleAdminRole.mutate(u)}
                          >
                            {u.role === 'ADMIN' ? 'Зняти адміна' : 'Зробити адміном'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <ConfirmDialog
        isOpen={vehicleToDelete !== null}
        title="Видалення транспорту"
        message={`Видалити «${vehicleToDelete?.model}»?`}
        confirmText="Видалити"
        isLoading={deleteVehicle.isPending}
        onConfirm={() => vehicleToDelete && deleteVehicle.mutate(vehicleToDelete.id)}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  );
}