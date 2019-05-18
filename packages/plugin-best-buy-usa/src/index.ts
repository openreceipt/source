import { Events, Plugin } from '@openreceipt/core';

import BestBuyV1 from './BestBuyV1';
import Merchant from './Merchant';

export default class BestBuyPlugin extends Plugin {
  meta = {
    merchant: Merchant,
  };

  parsers = [BestBuyV1];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };
}
