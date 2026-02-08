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

  if (loading) return <div>Lade Analysedaten...</div>;
  if (!analytics) return <div>Kei Analysedaten.</div>;

  return (
    <div className="deals-analytics-desktop-card deals-analytics-mobile-card">
      <h2 className="deals-analytics-title">Deals-Analytics</h2>
      <div className="deals-analytics-grid">
        <div className="deals-analytics-item"><span className="deals-analytics-label">Total Deals</span><span className="deals-analytics-value">{analytics.total}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Gwunne</span><span className="deals-analytics-value">{analytics.won}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Verlore</span><span className="deals-analytics-value">{analytics.lost}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Gwinnrate</span><span className="deals-analytics-value">{analytics.winRate}%</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Verluscht-Rate</span><span className="deals-analytics-value">{analytics.lossRate}%</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Durchschnitts-Dealgrösse</span><span className="deals-analytics-value">{analytics.avgDealSize}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Umwandligsrate</span><span className="deals-analytics-value">{analytics.conversionRate}%</span></div>
      </div>
    </div>
  );
}
