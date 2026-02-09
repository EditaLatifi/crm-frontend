import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DealsPieChart({ data }: { data: { labels: string[], values: number[] } }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <Pie
        data={{
          labels: data.labels,
          datasets: [
            {
              label: 'Deals', // No visible text for user, keep as is
              data: data.values,
              backgroundColor: ['#0052cc', '#36a2eb', '#ffce56', '#e74c3c'],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Deals nach Phase' }, // Already standard German, no change needed
          },
        }}
      />
    </div>
  );
}
