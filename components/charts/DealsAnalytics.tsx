"use client";
import './deals-analytics-desktop.css';
import './deals-analytics-mobile.css';
import { useEffect, useState } from "react";

export default function DealsAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals/analytics")
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics data.</div>;

  return (
    <div className="deals-analytics-desktop-card deals-analytics-mobile-card">
      <h2 className="deals-analytics-title">Deals Analytics</h2>
      <div className="deals-analytics-grid">
        <div className="deals-analytics-item"><span className="deals-analytics-label">Total Deals</span><span className="deals-analytics-value">{analytics.total}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Won</span><span className="deals-analytics-value">{analytics.won}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Lost</span><span className="deals-analytics-value">{analytics.lost}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Win Rate</span><span className="deals-analytics-value">{analytics.winRate}%</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Loss Rate</span><span className="deals-analytics-value">{analytics.lossRate}%</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Avg Deal Size</span><span className="deals-analytics-value">{analytics.avgDealSize}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Conversion Rate</span><span className="deals-analytics-value">{analytics.conversionRate}%</span></div>
      </div>
    </div>
  );
}
