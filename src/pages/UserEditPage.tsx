import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { userSchema, type UserFormData, type UserFormInput } from '@/schemas/user.schema';
import { usersService } from '@/services/users.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import FormField from '@/components/common/FormField';
import Skeleton from '@/components/common/Skeleton';

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = Number(id);

  // Завантажуємо поточні дані користувача
  const { data: user, isPending: isLoadingUser } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => usersService.getById(userId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormInput, unknown, UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // Коли дані завантажилися, підставляємо їх у форму
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  // Мутація для оновлення
  const updateUser = useMutation({
    mutationFn: (data: UserFormData) => usersService.update(userId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Дані користувача оновлено');
      navigate('/users');
    },
    onError: (error) => {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? 'Помилка оновлення');
    },
  });

  if (isLoadingUser) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Редагування користувача</h1>
      <form
        onSubmit={handleSubmit((data) => updateUser.mutate(data))}
        className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900"
        noValidate
      >
        <FormField label="Ім'я" error={errors.name?.message}>
          <Input placeholder="Іван Петренко" {...register('name')} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="ivan@example.com" {...register('email')} />
        </FormField>

        <div className="flex gap-4">
          <Button type="submit" isLoading={updateUser.isPending}>
            Зберегти
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            Скасувати
          </Button>
        </div>
      </form>
    </div>
  );
}