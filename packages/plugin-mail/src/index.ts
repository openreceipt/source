import { Events, Plugin } from '@openreceipt/core';
import createDebug from 'debug';

const debug = createDebug('openreceipt:plugin-mail');

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

    debug(`Email sent from: ${this.engine.state.email.from.text}`);
    debug(`Email sent at: ${this.engine.state.email.date!.getTime()}`);
  };
}
