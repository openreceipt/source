import { Events, Plugin } from '@openreceipt/core';

import BestBuyV1 from './BestBuyV1';
import Merchant from './Merchant';

export default class BestBuyPlugin extends Plugin {
  static readonly meta = {
    merchant: Merchant,
    sourceAddresses: ['Best Buy <BestBuyInfo@emailinfo.bestbuy.com>'],
  };

  parsers = [BestBuyV1];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };

  run = async (): Promise<void> => {
    // console.log('Running plugin @openreceipt/parser-zooplus-uk...');
    // const sentAt = this.engine.parsedEmail.date.getTime();

    if (
      !BestBuyPlugin.meta.sourceAddresses!.includes(
        this.engine.state.email.from.text,
      )
    ) {
      // console.log('Not a match!');
      return;
    }

    // @TODO Resolve correct parser using `sentAt`
    const parser = new this.parsers[0](this.engine, Merchant);
    await parser.parse();
  };
}
