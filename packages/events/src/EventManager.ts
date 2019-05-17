import createDebug from 'debug';
import { HookCallback, HooksMap } from './types';

const debug = createDebug('openreceipt:events');

export default class EventManager {
  public readonly events: HooksMap = {};

  createEvent = (eventName: string) => {
    if (eventName.startsWith('before:') || eventName.startsWith('after:')) {
      const eventNameWithoutPrefix = eventName.replace(/^(before|after):/, '');
      // console.log(eventName, eventNameWithoutPrefix);
      this.createEvent(eventNameWithoutPrefix);
      return;
    }

    this.events[`before:${eventName}`] = [];
    this.events[eventName] = [];
    this.events[`after:${eventName}`] = [];
  };

  private executeEventCallbacks = async (eventName: string) => {
    debug(`Invoking callbacks for ${eventName}`);
    const callbacks = this.events[eventName];

    const hooksAsPromises = callbacks.map((hook) => {
      return hook();
    });

    await Promise.all(hooksAsPromises);
  };

  fireEvent = async (eventName: string) => {
    // Check and fire `before:` events
    if (Object.keys(this.events).includes(`before:${eventName}`)) {
      await this.executeEventCallbacks(`before:${eventName}`);
    }

    await this.executeEventCallbacks(eventName);

    // Check and fire `after:` events
    if (Object.keys(this.events).includes(`after:${eventName}`)) {
      await this.executeEventCallbacks(`after:${eventName}`);
    }
  };

  addListener = (eventName: string, callback: HookCallback) => {
    if (!this.events[eventName]) {
      this.createEvent(eventName);
    }

    this.events[eventName].push(callback);
  };

  addListeners = (eventName: string, callbacks: HookCallback[]) => {
    if (!this.events[eventName]) {
      this.createEvent(eventName);
    }

    this.events[eventName] = [...this.events[eventName], ...callbacks];
  };
}
