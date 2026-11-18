import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData { name: string; value: number; }
interface StatsChartProps { data: ChartData[]; title: string; }

export default function StatsChart({ data, title }: StatsChartProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" name={title} stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}