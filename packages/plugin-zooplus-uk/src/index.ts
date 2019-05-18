import { Events, Plugin } from '@openreceipt/core';

import Merchant from './Merchant';
import ZooPlusV1 from './ZooPlusV1';

export default class ZooplusUKPlugin extends Plugin {
  static readonly meta = {
    merchant: Merchant,
    sourceAddresses: ['service@zooplus.co.uk'],
  };

  parsers = [ZooPlusV1];

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
    // console.log('Running plugin @openreceipt/parser-zooplus-uk...');
    // const sentAt = this.engine.parsedEmail.date.getTime();

    if (
      !ZooplusUKPlugin.meta.sourceAddresses!.includes(
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
