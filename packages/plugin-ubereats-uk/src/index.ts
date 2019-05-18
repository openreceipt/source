import { Events, Plugin } from '@openreceipt/core';

import Merchant from './Merchant';
import UberEatsV1 from './UberEatsV1';

export default class UberEatsUKPlugin extends Plugin {
  meta = {
    merchant: Merchant,
  };

  parsers = [UberEatsV1];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };
}
