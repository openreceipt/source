import { HookCallback } from '@openreceipt/events';
import createDebug from 'debug';

import Engine from './Engine';
import Parser from './Parser';
import ParserResolver from './ParserResolver';
import { Merchant } from './Types/Merchant';

const debug = createDebug('openreceipt:core:plugin');

export interface PluginInterface {
  run(): Promise<void>;
}

export interface PluginMeta {
  merchant?: Merchant;
}

export default abstract class Plugin implements PluginInterface {
  constructor(
    protected engine: Engine,
    protected resolver: ParserResolver = new ParserResolver(),
  ) {}

  readonly meta!: PluginMeta;
  readonly parsers?: typeof Parser[];

  abstract setupHooks(): Record<string, HookCallback[]>;

  run = async (): Promise<void> => {
    if (!this.parsers) {
      debug('No parsers found!');
      return Promise.resolve();
    }

    debug(`Resolving parser in ${this.constructor.name}...`);
    const ParserClass = this.resolver.resolve(
      this.engine.state.email.from.text,
      this.engine.state.email.date!.getTime(),
      this.parsers,
    ) as any;

    if (!ParserClass) {
      debug('Could not resolve a valid parser!');
      return Promise.resolve();
    }

    const parser = new ParserClass(this.engine, this.meta.merchant);
    await parser.parse();
  };
}
