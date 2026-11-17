import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4 text-red-600">404</h1>
      <p className="mb-6">Сторінку не знайдено</p>
      <Link to="/" className="text-blue-600 hover:underline">Повернутися на головну</Link>
    </div>
  );
}