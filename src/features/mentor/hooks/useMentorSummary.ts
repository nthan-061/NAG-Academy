import { useMemo } from 'react'
import { useMentor } from './useMentor'

export function useMentorSummary() {
  const { analysis, insights, recommendations, loading } = useMentor()

  return useMemo(() => ({
    loading,
    status: analysis?.status ?? 'attention',
    alertCount: insights.filter((item) => item.priority === 'high').length,
    recommendationCount: recommendations.length,
  }), [analysis?.status, insights, loading, recommendations.length])
}
