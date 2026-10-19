import { supabase } from '@/lib/supabase';
import { Quote } from '@/types';

export const fallbackQuotes: Quote[] = [
  {
    id: '1',
    recipient_name: 'Atelier du Sud',
    destination: 'Bordeaux, France',
    length_cm: 80,
    width_cm: 60,
    height_cm: 55,
    weight_kg: 32,
    cubic_meter: 0.264,
    coefficient: 8.5,
    final_price: 24.8,
    created_at: '2026-10-04T09:30:00Z',
  },
  {
    id: '2',
    recipient_name: 'Maison Lenoir',
    destination: 'Lyon, France',
    length_cm: 120,
    width_cm: 80,
    height_cm: 65,
    weight_kg: 48,
    cubic_meter: 0.624,
    coefficient: 8.5,
    final_price: 41.2,
    created_at: '2026-10-03T14:20:00Z',
  },
  {
    id: '3',
    recipient_name: 'Studio Rivage',
    destination: 'Nantes, France',
    length_cm: 45,
    width_cm: 40,
    height_cm: 35,
    weight_kg: 12,
    cubic_meter: 0.063,
    coefficient: 8.5,
    final_price: 12.9,
    created_at: '2026-10-02T11:15:00Z',
  },
];

export const quotesApi = {
  async getQuotes(): Promise<Quote[]> {
    if (!supabase) return fallbackQuotes;
    try {
      const { data, error } = await supabase
        .from('quote_calculations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data || data.length === 0) return fallbackQuotes;
      return data as Quote[];
    } catch {
      return fallbackQuotes;
    }
  },

  async createQuote(quote: Quote): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('quote_calculations')
        .insert({ ...quote, id: undefined });

      return !error;
    } catch {
      return false;
    }
  },

  async getPricingCoefficient(): Promise<number> {
    if (!supabase) return 8.5;
    try {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('coefficient')
        .eq('id', 1)
        .maybeSingle();

      if (error || !data) return 8.5;
      return Number(data.coefficient) || 8.5;
    } catch {
      return 8.5;
    }
  },

  async updatePricingCoefficient(coefficient: number): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .upsert({ id: 1, coefficient, updated_at: new Date().toISOString() });

      return !error;
    } catch {
      return false;
    }
  },
};
