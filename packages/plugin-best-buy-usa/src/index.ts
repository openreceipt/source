import { Events, Meta, Plugin } from '@openreceipt/core';

import BestBuyV1 from './BestBuyV1';

export default class BestBuyPlugin extends Plugin {
  static readonly meta: Meta = {
    merchant: {
      email: 'BestBuyInfo@emailinfo.bestbuy.com',
      name: 'Best Buy USA',
      online: true,
      // phone: '+441234430366',
      // taxNumber: 'GB922901342',
    },
    sourceAddresses: ['Best Buy <BestBuyInfo@emailinfo.bestbuy.com>'],
  };

  parsers = [BestBuyV1];

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
      !BestBuyPlugin.meta.sourceAddresses!.includes(
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
