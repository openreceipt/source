import Generator from 'yeoman-generator';

import copyTemplates from '../lib/copyTemplates';

interface Options {
  parserSince: number;
}

const FILES = [
  'src/Parser.ts.ejs',
];

export = class ParserGenerator extends Generator {
  public options: Options;

  constructor(args: string | string[], options: Options) {
    super(args, options);
    this.options = options;

    this.option('retailerNameCamelCase', {
      description: 'Retailer Name in camel case: ',
      type: String,
    });

    this.option('parserSince', {
      description: 'Earliest known date of email layout: ',
      type: String,
    });
  }

  writing() {
    copyTemplates(this, FILES);
  }
};
