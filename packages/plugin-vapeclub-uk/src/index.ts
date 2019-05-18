import { Events, Plugin } from '@openreceipt/core';

import Merchant from './Merchant';
import VapeClubV1 from './VapeClubV1';

export default class VapeClubUKPlugin extends Plugin {
  meta = {
    merchant: Merchant,
  };

  parsers = [VapeClubV1];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };
}
