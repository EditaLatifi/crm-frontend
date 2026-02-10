"use client";
import './deals-analytics-desktop.css';
import './deals-analytics-mobile.css';
import { useEffect, useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DealsAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/deals/analytics`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Lade Analysedaten...</div>;
  if (!analytics) return <div>Keine Analysedaten.</div>;

  // Actionable summary (German)
  let summary = '';
  if (analytics.winRate > 60) summary = '🚀 Starke Leistung! Die meisten Deals werden gewonnen.';
  else if (analytics.lossRate > 40) summary = '⚠️ Viele Deals gehen verloren. Pipeline überprüfen.';
  else if (analytics.avgDealSize > 100000) summary = '💼 Hoher durchschnittlicher Dealwert. Fokus auf große Chancen.';
  else summary = '🔎 Pflegen Sie Ihre Deals für bessere Ergebnisse.';

  return (
    <div className="deals-analytics-desktop-card deals-analytics-mobile-card" style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', background: '#f5f7fa', padding: 24 }}>
      <h2 className="deals-analytics-title" style={{ fontSize: 26, fontWeight: 700, marginBottom: 18 }}>Deals-Analyse</h2>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18, color: '#1976d2' }}>{summary}</div>
      <div className="deals-analytics-grid">
        <div className="deals-analytics-item"><span className="deals-analytics-label">Gesamtdeals</span><span className="deals-analytics-value" style={{ color: '#222', fontWeight: 700 }}>{analytics.total}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Gewonnen</span><span className="deals-analytics-value" style={{ color: '#388e3c', fontWeight: 700 }}>{analytics.won}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Verloren</span><span className="deals-analytics-value" style={{ color: '#d32f2f', fontWeight: 700 }}>{analytics.lost}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Gewinnrate</span><span className="deals-analytics-value" style={{ color: '#388e3c', fontWeight: 700 }}>{analytics.winRate}%</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Verlustquote</span><span className="deals-analytics-value" style={{ color: '#d32f2f', fontWeight: 700 }}>{analytics.lossRate}%</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Durchschnittliche Dealgröße</span><span className="deals-analytics-value" style={{ color: '#1976d2', fontWeight: 700 }}>{analytics.avgDealSize}</span></div>
        <div className="deals-analytics-item"><span className="deals-analytics-label">Konversionsrate</span><span className="deals-analytics-value" style={{ color: '#1976d2', fontWeight: 700 }}>{analytics.conversionRate}%</span></div>
      </div>
    </div>
  );
}
