import { useState, useEffect, useCallback, useMemo } from 'react';
import { quotesApi, fallbackQuotes } from '@/api/endpoints/quotes.api';
import { Quote } from '@/types';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(fallbackQuotes);
  const [coefficient, setCoefficient] = useState<number>(8.5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [coeff, list] = await Promise.all([
        quotesApi.getPricingCoefficient(),
        quotesApi.getQuotes(),
      ]);
      setCoefficient(coeff);
      setQuotes(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveQuote = useCallback(async (newQuote: Quote): Promise<boolean> => {
    setQuotes((current) => [newQuote, ...current]);
    return quotesApi.createQuote(newQuote);
  }, []);

  const updateCoefficient = useCallback(async (newCoeff: number): Promise<boolean> => {
    setCoefficient(newCoeff);
    return quotesApi.updatePricingCoefficient(newCoeff);
  }, []);

  const filteredQuotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((item) =>
      `${item.recipient_name} ${item.destination}`.toLowerCase().includes(q)
    );
  }, [quotes, search]);

  const totalVolume = useMemo(() => {
    return quotes.reduce((sum, q) => sum + Number(q.cubic_meter || 0), 0);
  }, [quotes]);

  const totalRevenue = useMemo(() => {
    return quotes.reduce((sum, q) => sum + Number(q.final_price || 0), 0);
  }, [quotes]);

  return {
    quotes,
    filteredQuotes,
    coefficient,
    isLoading,
    search,
    setSearch,
    saveQuote,
    updateCoefficient,
    totalVolume,
    totalRevenue,
    refresh: loadData,
  };
}
