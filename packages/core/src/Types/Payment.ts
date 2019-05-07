export interface CashPayment {
  type: 'cash';
  amount: number;
  currency: string;
}

export interface CardPayment {
  type: 'card';
  bin: string;
  cardNumber?: string;
  authCode: string;
  aid: string;
  mid: string;
  tid: string;
  amount: number;
  currency: string;
}

export interface GiftCardPayment {
  type: 'gift_card';
  amount: number;
  currency: string;
  giftCardType?: string;
}

export type Payment = CashPayment | CardPayment | GiftCardPayment;
