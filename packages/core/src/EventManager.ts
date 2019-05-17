import { EventManager as BaseEventManager } from '@openreceipt/events';

import { Events } from './Types/Events';

export default class EventManager extends BaseEventManager {
  constructor() {
    super();
    [
      Events.BOOT_CONFIG,
      Events.BOOT_PLUGINS,
      Events.EXEC_MAIL_PARSE,
      Events.EXEC_RECEIPT_PARSE,
    ].forEach(this.createEvent);
  }
}
