import { Events, Plugin } from '@openreceipt/core';

import JustEatV1 from './JustEatV1';
import Merchant from './Merchant';

export default class JustEatUKPlugin extends Plugin {
  readonly meta = {
    merchant: Merchant,
  };

  parsers = [JustEatV1];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };
}
