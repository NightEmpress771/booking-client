import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { userSchema, type UserFormData, type UserFormInput } from '@/schemas/user.schema';
import { usersService } from '@/services/users.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import FormField from '@/components/common/FormField';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormInput, unknown, UserFormData>({ resolver: zodResolver(userSchema) });

  const createUser = useMutation({
    mutationFn: usersService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Користувача успішно створено');
      navigate('/users');
    },
    onError: (error) => {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message ?? 'Помилка створення');
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Новий користувач</h1>

      <form
        onSubmit={handleSubmit((data) => createUser.mutate(data))}
        className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900"
        noValidate
      >
        <FormField label="Ім'я" error={errors.name?.message}>
          <Input placeholder="Іван Петренко" {...register('name')} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="ivan@example.com" {...register('email')} />
        </FormField>
        <FormField label="Вік (необов'язково)" error={errors.age?.message}>
          <Input type="number" placeholder="25" {...register('age')} />
        </FormField>
        <FormField label="Телефон (необов'язково)" error={errors.phone?.message}>
          <Input placeholder="+380123456789" {...register('phone')} />
        </FormField>

        <div className="flex gap-4">
          <Button type="submit" isLoading={createUser.isPending}>
            Створити
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            Скасувати
          </Button>
        </div>
      </form>
    </div>
  );
}