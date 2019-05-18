import { Events, Meta, Plugin } from '@openreceipt/core';

import Merchant from './Merchant';
import UberEatsV1 from './UberEatsV1';

export default class UberEatsUKPlugin extends Plugin {
  static readonly meta: Meta = {
    merchant: Merchant,
    sourceAddresses: ['Uber Receipts <uber.uk@uber.com>'],
  };

  parsers = [UberEatsV1];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };

  private findValidParser = () => {
    // const sortedParsers =
    // const parserTimestamps = this.parsers.();
  };

  run = async (): Promise<void> => {
    // console.log('Running plugin @openreceipt/plugin-ubereats-uk...');
    // const sentAt = this.engine.parsedEmail.date.getTime();

    if (
      !UberEatsUKPlugin.meta.sourceAddresses!.includes(
        this.engine.state.email.from.text,
      )
    ) {
      // console.log('Not a match!');
      return;
    }

    // @TODO Resolve correct parser using `sentAt`
    const parser = new this.parsers[0](this.engine);
    await parser.parse();
  };
}
