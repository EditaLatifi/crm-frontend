import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TasksBarChart({ data }: { data: { labels: string[], values: number[] } }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <Bar
        data={{
          labels: data.labels,
          datasets: [
            {
              label: 'Tasks',
              data: data.values,
              backgroundColor: '#0052cc',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Tasks Overview' },
          },
        }}
      />
    </div>
  );
}
