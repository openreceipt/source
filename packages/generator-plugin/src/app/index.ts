import Generator from 'yeoman-generator';

import enhanceAnswers from '../lib/enhanceAnswers';
import prompts from './prompts';

export interface Answers {
  retailerName: string;
  retailerCountry: string;
}

export default class PluginGenerator extends Generator {
  async initializing() {
    this.log('A few questions about your project...');
  }

  async prompting() {
    const answers = (await this.prompt(prompts)) as Generator.Answers & Answers;

    const enhancedAnswers = enhanceAnswers(answers);

    // this.composeWith(require.resolve('../parser'), enhancedAnswers);
    this.composeWith(require.resolve('../plugin'), enhancedAnswers);
  }
}
