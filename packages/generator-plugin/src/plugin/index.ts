import Generator from 'yeoman-generator';
import copyTemplates from '../lib/copyTemplates';

interface Options {
  projectName: string;
}

const FILES = [
  'src/index.ts.ejs',
  'src/Merchant.ts.ejs',
  '_lintstagedrc.yml',
  'jest.config.js',
  'package.json.ejs',
  'prettier.config.js',
  'tsconfig.json',
  'tsconfig.test.json',
  'tslint.json',
];

export = class PluginGenerator extends Generator {
  public options: Options;

  constructor(args: string | string[], options: Options) {
    super(args, options);
    this.options = options;

    this.option('packageName', {
      description: 'Package Name: ',
      type: String,
    });
    this.option('retailerCountry', {
      description: 'Retailer Country: ',
      type: String,
    });
    this.option('retailerName', {
      description: 'Retailer Name: ',
      type: String,
    });
    this.option('retailerNameCamelCase', {
      description: 'Retailer Name in camel case: ',
      type: String,
    });
    this.option('retailerEmail', {
      description: 'Retailer Email: ',
      type: String,
    });
  }

  writing() {
    copyTemplates(this, FILES);
  }
};
