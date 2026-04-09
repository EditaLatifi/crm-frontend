import React, { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { formatCHF } from '../../src/lib/formatCurrency';

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
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>
        Deal-Einschätzungen
      </h3>

      {loading && <div style={{ color: '#999', fontSize: 13 }}>Lade Einschätzungen...</div>}

      {!loading && insights.length === 0 && (
        <div style={{ color: '#999', fontSize: 13 }}>Keine Einschätzungen verfügbar.</div>
      )}

      {!loading && insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map(insight => (
            <div
              key={insight.id}
              style={{
                padding: '16px 18px',
                background: '#FAF9F6',
                borderRadius: 10,
                border: '1px solid #E8E4DE',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{insight.name}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: insight.attention ? '#dc2626' : '#16a34a', background: insight.attention ? '#fef2f2' : '#f0fdf4', borderRadius: 12, padding: '2px 10px' }}>
                  {insight.attention ? 'Handlungsbedarf' : 'OK'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666', flexWrap: 'wrap' }}>
                <span>{formatCHF(insight.amount ?? 0)}</span>
                <span>{insight.daysSinceUpdate}d seit Update</span>
                <span style={{ color: '#e8a838', fontWeight: 600 }}>{(insight.closeProbability * 100).toFixed(0)}% Abschluss</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                {getEnhancedRecommendation(insight)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
