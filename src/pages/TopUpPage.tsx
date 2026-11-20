import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { balanceService } from '@/services/balance.service';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const presets = [100, 250, 500, 1000];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function TopUpPage() {
  const balance = useAuthStore((s) => s.user?.balance ?? 0);
  const setBalance = useAuthStore((s) => s.setBalance);

  const [amount, setAmount] = useState<number>(250);
  const [bankStep, setBankStep] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const topUpMutation = useMutation({
    mutationFn: async (sum: number) => {
      setSuccessMessage(null);
      setBankStep("Зв'язок з банком...");
      await delay(800);
      setBankStep('Підтвердження платежу в банківському шлюзі...');
      await delay(800);
      return balanceService.topUp(sum);
    },
    onSuccess: (res) => {
      setBankStep(null);
      setBalance(res.balance);
      setSuccessMessage(`Операція успішна! На ваш рахунок зараховано ${amount} грн.`);
      toast.success('Операція успішна! Баланс оновлено.');
    },
    onError: (err) => {
      setBankStep(null);
      const msg = isAxiosError(err) ? err.response?.data?.error : undefined;
      toast.error(msg ?? 'Помилка банківської операції');
    },
  });

  const isProcessing = topUpMutation.isPending;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Поточний баланс</p>
        <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">{balance} грн</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        <h1 className="mb-4 text-2xl font-bold">Поповнення балансу</h1>

        <div className="mb-4 flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={amount === p ? 'primary' : 'secondary'}
              disabled={isProcessing}
              onClick={() => setAmount(p)}
            >
              +{p} грн
            </Button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            topUpMutation.mutate(amount);
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Сума поповнення (грн)</span>
            <Input
              type="number"
              min={1}
              max={100000}
              disabled={isProcessing}
              value={amount}
              onChange={(e) => setAmount(Math.max(Number(e.target.value) || 1, 1))}
            />
          </label>

          {bankStep && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>{bankStep}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200">
              <p className="font-semibold">✅ {successMessage}</p>
              <div className="mt-3 flex gap-3">
                <Link to="/vehicles">
                  <Button type="button" size="sm">
                    Перейти до каталогу
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isProcessing}>
            Оплатити {amount} грн
          </Button>
        </form>
      </div>
    </div>
  );
}