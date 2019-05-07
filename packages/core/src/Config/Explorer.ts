import AdapterInterface from './Adapters/AdapterInterface';
import CosmiConfigAdapter from './Adapters/CosmiConfigAdapter';
import PathNotFoundError from './Errors/PathNotFoundError';
import ParameterBag from './ParameterBag';

export default class Explorer {
  adapter: AdapterInterface;

  constructor(adapter: AdapterInterface = new CosmiConfigAdapter()) {
    this.adapter = adapter;
  }

  load = async (path: string) => {
    try {
      const { config } = await this.adapter.load(path);

      return new ParameterBag(config);
    } catch (error) {
      if (error.code === 'ENOENT' && error.errno === -2) {
        throw PathNotFoundError.fromError(error);
      }

      throw error;
    }
  };

  search = async (searchPath?: string) => {
    return this.adapter.search(searchPath);
  };
}
