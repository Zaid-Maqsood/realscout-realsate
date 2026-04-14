import { useState } from 'react';
import api from '../api/axios';

const AI_TIMEOUT = 45000;

function useAICall(endpoint) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(endpoint, payload, { timeout: AI_TIMEOUT });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'AI request failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { call, loading, error };
}

export const useGenerateDescription = () => useAICall('/ai/generate-description');
export const useDashboardSummary    = () => useAICall('/ai/dashboard-summary');
export const useDraftReply          = () => useAICall('/ai/draft-reply');
export const useParseSearch         = () => useAICall('/ai/parse-search');
export const useScoreLeads          = () => useAICall('/ai/score-leads');
export const useSuggestPrice        = () => useAICall('/ai/suggest-price');
export const useCheckQuality        = () => useAICall('/ai/check-quality');
export const useChatProperty        = () => useAICall('/ai/chat-property');
export const useChatPage            = () => useAICall('/ai/chat-page');
export const useMonthlyReport       = () => useAICall('/ai/monthly-report');
