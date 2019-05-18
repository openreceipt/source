import { ParsedMail } from '@openreceipt/mail';

import Engine from './Engine';
import { Merchant } from './Types/Merchant';
import { Item, Tax } from './Types/types';

export interface ParserInterface {
  parse(parsedEmail: ParsedMail): Promise<void>;
}

export interface ParserMeta {
  since: number;
  sourceAddress: string;
}

export default abstract class Parser implements ParserInterface {
  static readonly meta: ParserMeta;

  constructor(protected engine: Engine, protected merchant: Merchant) {}

  abstract getItems(): Item[];
  abstract getDate(): Date;
  abstract getId(): string;
  abstract getTaxes(): Tax[];
  abstract getTotal(): number;

  async parse(): Promise<void> {
    this.engine.state.receipt = {
      currency: this.merchant.currency,
      date: this.engine.state.email.date || this.getDate(),
      items: this.getItems(),
      merchant: this.merchant,
      orderId: this.getId(),
      taxes: (this.getTaxes && this.getTaxes()) || [],
      total: this.getTotal(),
    };
  }
}
