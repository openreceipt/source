import { HookCallback } from '@openreceipt/events';

import Engine from './Engine';
import { Meta } from './Types/types';

export interface PluginInterface {
  run(): Promise<void>;
}

export default abstract class Plugin implements PluginInterface {
  static readonly meta: Meta;

  constructor(protected engine: Engine) {}

  abstract setupHooks(): Record<string, HookCallback[]>;

  abstract run(): Promise<void>;
}
