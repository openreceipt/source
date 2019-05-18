import { ParsedMail } from '@openreceipt/mail';

import Engine from './Engine';

export interface ParserInterface {
  parse(parsedEmail: ParsedMail): Promise<void>;
}

export interface ParserMeta {
  since?: number;
}

export default abstract class Parser implements ParserInterface {
  static readonly meta: ParserMeta;

  constructor(protected engine: Engine) {}

  abstract parse(parsedEmail: ParsedMail): Promise<void>;
}
