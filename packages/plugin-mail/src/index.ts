import { Events, Plugin } from '@openreceipt/core';

export default class MailPlugin extends Plugin {
  setupHooks = () => {
    return {
      [Events.EXEC_MAIL_PARSE]: [this.run],
    };
  };

  run = async (): Promise<void> => {
    this.engine.state.email = await this.engine.mailParser.parse(
      this.engine.input,
    );
  };
}
