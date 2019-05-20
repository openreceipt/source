import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import uuid from 'uuid/v4';
// @ts-ignore
import assert from 'yeoman-assert';

import { generateWithOptions } from '../setupTests';

describe('app:parser', () => {
  const PACKAGE_NAME = '@openreceipt/plugin-generated-plugin';
  const options = {
    packageName: true,
    parserEmail: 'hello@foo.com',
    parserSince: 10000000,
    projectName: PACKAGE_NAME,
    retailerCountry: 'USA',
    retailerEmail: '',
    retailerName: 'Best Buy',
    retailerNameCamelCase: 'BestBuy',
  };

  describe('Generates a CloudFormation template as JSON', () => {
    const OUTPUT_PATH = path.join(os.tmpdir(), uuid());

    beforeEach(async () => {
      return generateWithOptions(__dirname, OUTPUT_PATH, options);
    });

    afterEach(() => {
      rimraf.sync(OUTPUT_PATH);
    });

    it('creates conf/template.yml', () => {
      // assert.file(path.join(OUTPUT_PATH, 'conf', 'template.json'));
    });
  });
});
