"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/auth/AuthProvider';
import './dashboard-desktop.css';
import './dashboard-mobile.css';
import TasksBarChart from '../../components/charts/TasksBarChart';
import DealsPieChart from '../../components/charts/DealsPieChart';
import TimeLineChart from '../../components/charts/TimeLineChart';

export default function DashboardPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [tasksCount, setTasksCount] = useState(0);
	const [dealsCount, setDealsCount] = useState(0);
	const [timeTracked, setTimeTracked] = useState(0);
	const [recentActivity, setRecentActivity] = useState<string[]>([]);
	const [tasksChart, setTasksChart] = useState({ labels: [], values: [] });
	const [dealsChart, setDealsChart] = useState({ labels: [], values: [] });
	const [timeChart, setTimeChart] = useState({ labels: [], values: [] });

	useEffect(() => {
		if (!loading && !user) {
			router.replace('/login');
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (!user) return;
		// Fetch tasks summary
		fetch('/api/tasks')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) {
					setTasksCount(data.filter((t: any) => t.status !== 'DONE').length);
					// Chart: tasks by status
					const statusMap: Record<string, number> = {};
					data.forEach((t: any) => {
						statusMap[t.status] = (statusMap[t.status] || 0) + 1;
					});
					setTasksChart({
						labels: Object.keys(statusMap),
						values: Object.values(statusMap),
					});
					// Recent activity (tasks)
					setRecentActivity((prev) => [
						...data.slice(0, 3).map((t: any) => `Task "${t.title || t.name || t.id}" status: ${t.status}`),
						...prev
					]);
				}
			});
		// Fetch deals summary
		fetch('/api/deals')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) {
					setDealsCount(data.length);
					// Chart: deals by stage
					const stageMap: Record<string, number> = {};
					data.forEach((d: any) => {
						stageMap[d.stageId] = (stageMap[d.stageId] || 0) + 1;
					});
					setDealsChart({
						labels: Object.keys(stageMap),
						values: Object.values(stageMap),
					});
					setRecentActivity((prev) => [
						...data.slice(0, 2).map((d: any) => `Deal "${d.name}" stage: ${d.stageId}`),
						...prev
					]);
				}
			});
		// Fetch time entries summary
		fetch('/api/time-entries')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) {
					// Sum time tracked this week
					const now = new Date();
					const weekStart = new Date(now);
					weekStart.setDate(now.getDate() - now.getDay());
					const weekEntries = data.filter((e: any) => new Date(e.startedAt) >= weekStart);
					const totalMinutes = weekEntries.reduce((sum: number, e: any) => sum + (e.durationMinutes || 0), 0);
					setTimeTracked(Math.round(totalMinutes / 60));
					// Chart: time tracked per day (last 7 days)
					const days: string[] = [];
					const values: number[] = [];
					for (let i = 6; i >= 0; i--) {
						const d = new Date(now);
						d.setDate(now.getDate() - i);
						const label = d.toLocaleDateString();
						days.push(label);
						const dayEntries = data.filter((e: any) => {
							const ed = new Date(e.startedAt);
							return ed.toLocaleDateString() === label;
						});
						values.push(dayEntries.reduce((sum: number, e: any) => sum + (e.durationMinutes || 0), 0) / 60);
					}
					setTimeChart({ labels: days, values });
					setRecentActivity((prev) => [
						...weekEntries.slice(0, 2).map((e: any) => `Time entry: ${e.durationMinutes} min on ${e.accountId || e.taskId}`),
						...prev
					]);
				}
			});
	}, []);

	return (
	   <div className="dashboard-responsive">
		   <div className="dashboard-container">
			   <h1 className="dashboard-title" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2D3748', marginBottom: '1.2rem', letterSpacing: '0.02em' }}>Dashboard</h1>
			   <div className="dashboard-cards-row" style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem' }}>
				   <div className="dashboard-card" style={{ flex: 1, background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', minWidth: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
					   <h3 className="dashboard-card-title dashboard-card-tasks" style={{ fontSize: '1rem', fontWeight: 600, color: '#4A5568', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Active Tasks</h3>
					   <div className="dashboard-card-value" style={{ fontSize: '2rem', fontWeight: 700, color: '#2B6CB0', marginBottom: '0.2rem' }}>{tasksCount}</div>
				   </div>
				   <div className="dashboard-card" style={{ flex: 1, background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', minWidth: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
					   <h3 className="dashboard-card-title dashboard-card-deals" style={{ fontSize: '1rem', fontWeight: 600, color: '#4A5568', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Deals in Pipeline</h3>
					   <div className="dashboard-card-value" style={{ fontSize: '2rem', fontWeight: 700, color: '#2B6CB0', marginBottom: '0.2rem' }}>{dealsCount}</div>
				   </div>
				   <div className="dashboard-card" style={{ flex: 1, background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', minWidth: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
					   <h3 className="dashboard-card-title dashboard-card-time" style={{ fontSize: '1rem', fontWeight: 600, color: '#4A5568', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Time Tracked (this week)</h3>
					   <div className="dashboard-card-value" style={{ fontSize: '2rem', fontWeight: 700, color: '#2B6CB0', marginBottom: '0.2rem' }}>{timeTracked} <span style={{ fontSize: '1rem', color: '#4A5568', fontWeight: 500 }}>h</span></div>
				   </div>
			   </div>
			   <div className="dashboard-charts-row" style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.2rem' }}>
				   <div className="dashboard-chart dashboard-chart-tasks" style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', minWidth: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
					   <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#4A5568', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Tasks by Status</div>
					   <TasksBarChart data={tasksChart} />
				   </div>
				   <div className="dashboard-chart dashboard-chart-deals" style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', minWidth: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
					   <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#4A5568', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Deals by Stage</div>
					   <DealsPieChart data={dealsChart} />
				   </div>
				   <div className="dashboard-chart dashboard-chart-time" style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', minWidth: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
					   <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#4A5568', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Time Tracked (7 days)</div>
					   <TimeLineChart data={timeChart} />
				   </div>
			   </div>
			   <div className="dashboard-activity" style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', marginBottom: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
				   <h2 className="dashboard-activity-title" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2D3748', marginBottom: '0.7rem', letterSpacing: '0.01em' }}>Recent Activity</h2>
				   <ul className="dashboard-activity-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
					   {recentActivity.slice(0, 8).map((a, i) => (
						   <li key={i} style={{ padding: '0.5rem 0', borderBottom: i < 7 ? '1px solid #E2E8F0' : 'none', fontSize: '0.97rem', color: '#4A5568', letterSpacing: '0.01em' }}>{a}</li>
					   ))}
				   </ul>
			   </div>
		   </div>
	   </div>
	);
}
