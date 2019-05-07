import { simpleParser } from 'mailparser';

export default class MailParser {
  constructor(public driver: typeof simpleParser = simpleParser) {}

  parse = (emlString: string) => {
    return this.driver(emlString);
  };
}
