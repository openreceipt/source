import { Events, Plugin } from '@openreceipt/core';

import Merchant from './Merchant';
import ZooPlus20171022 from './ZooPlus20171022';
import ZooPlus20180803 from './ZooPlus20180803';

export default class ZooplusUKPlugin extends Plugin {
  readonly meta = {
    merchant: Merchant,
  };

  readonly parsers = [ZooPlus20171022, ZooPlus20180803];

  setupHooks = () => {
    return {
      [Events.EXEC_RECEIPT_PARSE]: [this.run],
    };
  };
}
