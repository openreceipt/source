import { ParsedMail } from '@openreceipt/mail';

import Engine from './Engine';
import FatalError from './Errors/FatalError';
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
  abstract getId(): string;
  abstract getTaxes(): Tax[];
  abstract getTotal(): number;

  getCurrency(): string {
    if (!this.merchant.currency) {
      throw new FatalError(
        'Please override the `getCurrency()` method in your parser',
      );
    }
    return this.merchant.currency;
  }

  getDate(): Date {
    return this.engine.state.email.date as Date;
  }

  getTaxNumber(): string {
    if (!this.merchant.taxNumber) {
      throw new FatalError(
        'Please override the `getTaxNumber()` method in your parser',
      );
    }
    return this.merchant.taxNumber;
  }

  async parse() {
    this.engine.state.receipt = {
      currency: this.getCurrency(),
      date: this.getDate(),
      items: this.getItems(),
      merchant: {
        ...this.merchant,
        taxNumber: this.getTaxNumber(),
      },
      orderId: this.getId(),
      taxes: (this.getTaxes && this.getTaxes()) || [],
      total: this.getTotal(),
    };
  }
}
