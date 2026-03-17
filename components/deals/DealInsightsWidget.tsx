import React, { useEffect, useState } from 'react';
import { api } from '../../src/api/client';

/* ================================
   Types
================================ */

interface DealInsight {
  id: string;
  name: string;
  amount: number;
  stageId: string;
  daysSinceUpdate: number;
  attention: boolean;
  closeProbability: number;
}

type Recommendation = {
  icon: string;
  color: string;
  title: string;
  message: string;
  action: string;
};

/* ================================
   Business Rules (no magic numbers)
================================ */

const HIGH_VALUE_AMOUNT = 100_000;
const LOW_VALUE_AMOUNT = 100;
const HIGH_CLOSE_PROBABILITY = 0.7;
const FRESH_UPDATE_DAYS = 3;

/* ================================
   Scoring Engine (AI core)
================================ */

function calculateDealScore(insight: DealInsight): number {
  let score = 0;

  // urgency
  if (insight.attention) score += 40;

  // win / loss
  if (insight.closeProbability === 1) score += 50;
  if (insight.closeProbability === 0) score -= 50;

  // probability influence
  score += insight.closeProbability * 30;

  // deal size
  if (insight.amount > HIGH_VALUE_AMOUNT) score += 20;
  if (insight.amount < LOW_VALUE_AMOUNT) score -= 20;

  // freshness
  if (insight.daysSinceUpdate < FRESH_UPDATE_DAYS) score += 10;

  return score;
}

/* ================================
   Recommendation Logic
================================ */

function getRecommendationData(insight: DealInsight): Recommendation {
  const score = calculateDealScore(insight);

  if (insight.closeProbability === 1) {
    return {
      icon: '🏆',
      color: '#388e3c',
      title: 'Erfolg',
      message: 'Deal wurde erfolgreich abgeschlossen.',
      action: 'Ergebnis erfassen und feiern.'
    };
  }

  if (insight.closeProbability === 0) {
    return {
      icon: '❌',
      color: '#888',
      title: 'Verloren',
      message: 'Deal konnte nicht abgeschlossen werden.',
      action: 'Verlustgründe analysieren und daraus lernen.'
    };
  }

  if (score >= 80) {
    return {
      icon: '🚀',
      color: '#ff9800',
      title: 'Hohe Priorität',
      message: 'Starker Wert und starke Dynamik.',
      action: 'Führungskräfte einbeziehen und Abschluss vorantreiben.'
    };
  }

  if (score >= 60) {
    return {
      icon: '💼',
      color: '#388e3c',
      title: 'Baldiger Abschluss',
      message: 'Hohe Abschlusswahrscheinlichkeit basierend auf aktuellen Signalen.',
      action: 'Letzte Schritte einleiten.'
    };
  }

  if (score >= 40) {
    return {
      icon: '🔄',
      color: '#1976d2',
      title: 'Pflege',
      message: 'Deal entwickelt sich normal.',
      action: 'Engagement und Follow-ups fortsetzen.'
    };
  }

  return {
    icon: '⚡',
    color: '#888',
    title: 'Niedrige Priorität',
    message: 'Niedriger Wert oder schwaches Engagement.',
    action: 'Fokussieren Sie sich auf Chancen mit größerer Wirkung.'
  };
}

/* ================================
   UI Helper
================================ */

function getEnhancedRecommendation(insight: DealInsight): React.ReactNode {
  const rec = getRecommendationData(insight);

  return (
    <span style={{ color: rec.color }}>
      <b>{rec.icon} {rec.title}:</b> {rec.message} <i>{rec.action}</i>
    </span>
  );
}

/* ================================
   Main Component
================================ */

export default function DealInsightsWidget() {
  const [insights, setInsights] = useState<DealInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const data = await api.get('/deals/insights');
        setInsights(data.insights || []);
      } catch {
        setInsights([]);
      }
      setLoading(false);
    }

    fetchInsights();
  }, []);

  return (
    <div
      style={{
        margin: '24px 0',
        padding: '24px',
        background: '#f5f7fa',
        borderRadius: 16,
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}
    >
      <h3
        style={{
          marginBottom: 20,
          fontSize: 26,
          color: '#222',
          fontWeight: 700
        }}
      >
        AI Deal Insights
      </h3>

      {loading && <div>Loading insights...</div>}

      {!loading && insights.length === 0 && (
        <div>No insights available.</div>
      )}

      {!loading && insights.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {insights.map(insight => (
            <li
              key={insight.id}
              style={{
                marginBottom: 22,
                padding: 20,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 20 }}>
                {insight.name}
              </div>

              <div style={{ marginTop: 6 }}>
                Amount: <b>{insight.amount}</b>
              </div>

              <div>
                Days Since Update: <b>{insight.daysSinceUpdate}</b>
              </div>

              <div style={{ color: insight.attention ? '#d32f2f' : '#388e3c' }}>
                Needs Attention: {insight.attention ? 'Yes' : 'No'}
              </div>

              <div style={{ color: '#1976d2' }}>
                Close Probability:{' '}
                <b>{(insight.closeProbability * 100).toFixed(0)}%</b>
              </div>

              <div style={{ marginTop: 10, fontWeight: 600 }}>
                {getEnhancedRecommendation(insight)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
