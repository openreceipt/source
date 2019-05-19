import { Events, Plugin } from '@openreceipt/core';

import Merchant from './Merchant';
import Steam1480013334000 from './Steam1480013334000';

export default class SteamPlugin extends Plugin {
  meta = {
    merchant: Merchant,
  };

  parsers = [Steam1480013334000];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };
}
