import { Quote, CalculationInput, PricingSettings } from '@/types';

export interface GetQuotesResponse {
  data: Quote[];
  total: number;
}

export interface CreateQuoteRequest extends CalculationInput {
  coefficient: number;
  cubic_meter: number;
  final_price: number;
}

export interface UpdatePricingRequest {
  coefficient: number;
}

export interface PricingResponse {
  data: PricingSettings;
}
