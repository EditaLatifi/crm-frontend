import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function TimeLineChart({ data }: { data: { labels: string[], values: number[] } }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <Line
        data={{
          labels: data.labels,
          datasets: [
            {
              label: 'Time Tracked (h)',
              data: data.values,
              borderColor: '#0052cc',
              backgroundColor: 'rgba(0,82,204,0.1)',
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Time Tracking' },
          },
        }}
      />
    </div>
  );
}
