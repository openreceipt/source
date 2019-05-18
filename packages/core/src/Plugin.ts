import { HookCallback } from '@openreceipt/events';

import Engine from './Engine';
import { Merchant } from './Types/Merchant';

export interface PluginInterface {
  run(): Promise<void>;
}

export interface PluginMeta {
  merchant?: Merchant;
  sourceAddresses?: string[];
}

export default abstract class Plugin implements PluginInterface {
  static readonly meta: PluginMeta;

  constructor(protected engine: Engine) {}

  abstract setupHooks(): Record<string, HookCallback[]>;

  abstract run(): Promise<void>;
}
