import { ParsedMail } from '@openreceipt/mail';

import Engine from './Engine';
import { Meta } from './Types/types';

export interface ParserInterface {
  parse(parsedEmail: ParsedMail): Promise<void>;
}

export default abstract class Parser implements ParserInterface {
  static readonly meta: Meta;

  constructor(protected engine: Engine) {}

  abstract parse(parsedEmail: ParsedMail): Promise<void>;
}
