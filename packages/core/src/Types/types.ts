import { Omit } from 'type-zoo';
import { Merchant } from './Merchant';
import { Payment } from './Payment';

export interface Item {
  description: string;
  url?: string;
  gtin?: string;
  quantity?: number;
  unit?: string;
  amount: number;
  currency: string;
  tax?: number;
  subItems?: Omit<Item, 'subItems'>[];
}

export interface Tax {
  description: string;
  amount: number;
  currency: string;
}

export interface Receipt {
  orderId: string;
  total: number;
  currency: string;
  date: Date;
  items: Item[];
  taxes?: Tax[];
  payments?: Payment[];
  merchant?: Merchant;
}
