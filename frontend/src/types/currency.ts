// src/types/currency.ts

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}
