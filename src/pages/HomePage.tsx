import { Link } from 'react-router';
import Button from '@/components/common/Button';

export default function HomePage() {
  return (
    <div className="space-y-10 py-6">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg md:p-12">
        <h1 className="mb-4 text-4xl font-bold">Оренда велосипедів та самокатів</h1>
        <p className="mb-6 max-w-2xl text-lg text-blue-100">
          Швидке бронювання міського транспорту онлайн, прозора погодинна оплата та миттєві
          сповіщення про статус поїздок.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/vehicles">
            <Button size="lg" variant="secondary">
              Переглянути каталог
            </Button>
          </Link>
          <Link to="/bookings">
            <Button size="lg" variant="secondary">
              Мої бронювання
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
          <h2 className="mb-2 text-xl font-semibold">🛴 Електросамокати та велосипеди</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Актуальна наявність транспорту та прозора вартість кожної години оренди.
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
          <h2 className="mb-2 text-xl font-semibold">⚡ Миттєві оновлення</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Сповіщення в реальному часі через WebSocket при оформленні та завершенні поїздки.
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
          <h2 className="mb-2 text-xl font-semibold">🔒 Безпечний кабінет</h2>
          <p className="text-gray-600 dark:text-gray-400">
            JWT-автентифікація, історія бронювань та панель керування для адміністратора.
          </p>
        </div>
      </section>
    </div>
  );
}