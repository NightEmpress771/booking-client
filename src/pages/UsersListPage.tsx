import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '@/services/users.service';
import { useDebounce } from '@/hooks/useDebounce';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { TableSkeleton } from '@/components/common/Skeleton';

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  // Завантаження списку (автоматично перезапускається при зміні сторінки або пошуку)
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['users', { page, search: debouncedSearch }],
    queryFn: () => usersService.getAll({ page, limit: 10, search: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
  });

  // Мутація для видалення
  const deleteUser = useMutation({
    mutationFn: usersService.remove,
    onSuccess: () => {
      toast.success('Користувача видалено');
      return queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Не вдалося видалити користувача'),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Користувачі</h1>
        <Link to="/users/create">
          <Button>Додати користувача</Button>
        </Link>
      </div>

      <Input
        aria-label="Пошук користувачів"
        placeholder="Пошук користувачів..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // новий пошук завжди починається з першої сторінки
        }}
        className="mb-4"
      />

      {isPending && <TableSkeleton />}
      {isError && (
        <p role="alert" className="text-red-500">
          Помилка: {error.message}
        </p>
      )}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['ID', "Ім'я", 'Email', 'Дії'].map((title) => (
                    <th key={title} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.data.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="space-x-2 px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={deleteUser.isPending}
                        onClick={() => {
                          if (confirm(`Видалити користувача ${user.name}?`)) {
                            deleteUser.mutate(user.id);
                          }
                        }}
                      >
                        Видалити
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Назад
            </Button>
            <span>
              {data.pagination.page} / {data.pagination.totalPages || 1}
            </span>
            <Button variant="secondary" disabled={!data.pagination.hasMore} onClick={() => setPage((p) => p + 1)}>
              Далі
            </Button>
          </div>
        </>
      )}
    </div>
  );
}