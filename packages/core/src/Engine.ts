import { DomParser } from '@openreceipt/dom';
import { MailParser, ParsedMail } from '@openreceipt/mail';
import createDebug from 'debug';

import Explorer from './Config/Explorer';
import FatalError from './Errors/FatalError';
import Logger from './Logger';
import Plugin from './Plugin';
import { Config, HooksMap } from './Types/Engine';
import { Events } from './Types/Events';
import { Receipt } from './Types/types';

const debug = createDebug('openreceipt:core');

export interface State {
  email: ParsedMail;
  receipt: Receipt;
}

export default class Engine {
  /**
   * OpenReceipt configuration
   */
  config!: Config;

  /**
   * Source EML Input
   */
  input!: string;

  state: State = {
    email: {} as ParsedMail,
    receipt: {} as Receipt,
  };

  /**
   * All loaded plugins
   */
  loadedPlugins: Record<string, Plugin> = {};

  hooks = [
    Events.BOOT_CONFIG,
    Events.BOOT_PLUGINS,
    Events.EXEC_MAIL_PARSE,
    Events.AFTER_EXEC_MAIL_PARSE,
    Events.EXEC_RECEIPT_PARSE,
    Events.AFTER_EXEC_RECEIPT_PARSE,
  ];

  hooksMap: HooksMap = this.hooks.reduce((result, hookName) => {
    return {
      ...result,
      [hookName]: [],
    };
  }, {});

  constructor(
    protected configLoader = new Explorer(),
    public readonly log = new Logger(),
    public readonly domParser = new DomParser(),
    public readonly mailParser = new MailParser(),
  ) {}

  protected loadConfig = async () => {
    debug('Loading config...');
    const result = await this.configLoader.search();

    if (!result) {
      return this.log.error('Config could not be loaded!');
    }

    this.config = result.config;
  };

  protected loadInput = async (emailSource: string) => {
    this.input = emailSource;
  };

  protected loadPluginHooks = (plugin: Plugin) => {
    const pluginHooks = plugin.setupHooks();

    Object.keys(pluginHooks).forEach((hookName: string) => {
      if (!this.hooksMap[hookName]) {
        throw new FatalError(`Hook ${hookName} is not a known hook`);
      }

      this.hooksMap[hookName] = [
        ...this.hooksMap[hookName],
        ...pluginHooks[hookName],
      ];
    });
  };

  protected loadPlugins = async () => {
    const pluginsToLoad = ['@openreceipt/plugin-mail', ...this.config.plugins];

    const pluginLoadPromises = pluginsToLoad.map(async (pluginName) => {
      debug(`Loading plugin ${pluginName}...`);

      try {
        const pluginClassImport = await import(pluginName);
        const PluginClass = pluginClassImport.default;
        const pluginInstance = new PluginClass(this);

        this.loadPluginHooks(pluginInstance);

        return {
          [pluginName]: pluginInstance,
        };
      } catch (error) {
        throw new FatalError(`Could not load ${pluginName} plugin`);
      }
    });

    const results = await Promise.all(pluginLoadPromises);

    this.loadedPlugins = results.reduce((result, pluginKeyValuePair) => {
      return {
        ...result,
        ...pluginKeyValuePair,
      };
    }, {});

    return Promise.resolve();
  };

  protected runHooks = async (hookName: Events) => {
    const hooks = this.hooksMap[hookName];

    const hooksAsPromises = hooks.map((hook) => {
      return hook();
    });

    debug(`Running hooks for ${hookName}...`);
    await Promise.all(hooksAsPromises);
  };

  protected execute = async () => {
    // console.log(this.hooksMap);

    await this.runHooks(Events.EXEC_MAIL_PARSE);

    const sourceAddress: string = this.state.email.from.text;
    this.log.info(`Email received from: ${sourceAddress}`);

    await this.runHooks(Events.AFTER_EXEC_MAIL_PARSE);

    await this.runHooks(Events.EXEC_RECEIPT_PARSE);

    await this.runHooks(Events.AFTER_EXEC_RECEIPT_PARSE);
  };

  static run = async (emailSource: string) => {
    const engine = new Engine();

    try {
      await engine.loadConfig();
      await engine.loadInput(emailSource);
      await engine.loadPlugins();
      await engine.execute();
    } catch (error) {
      if (error instanceof FatalError) {
        // Log and die
        engine.log.error(error);
        return;
      }

      engine.log.error(error);
    }
  };
}
