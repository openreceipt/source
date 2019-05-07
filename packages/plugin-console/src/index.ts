import { Events, Plugin } from '@openreceipt/core';

export default class ConsolePlugin extends Plugin {
  setupHooks = () => {
    return {
      [Events.AFTER_EXEC_RECEIPT_PARSE]: [this.run],
    };
  };

  run = async (): Promise<void> => {
    this.engine.log.info(this.engine.state.receipt);
  };
}
