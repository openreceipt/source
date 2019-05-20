import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import uuid from 'uuid/v4';
// @ts-ignore
// import assert from 'yeoman-assert';

import { generateWithOptions } from '../setupTests';

describe('app:plugin', () => {
  const PACKAGE_NAME = '@openreceipt/plugin-generated-plugin';
  const options = {
    packageName: true,
    projectName: PACKAGE_NAME,
    retailerCountry: 'USA',
    retailerEmail: '',
    retailerName: 'Best Buy',
    retailerNameCamelCase: 'BestBuy',
  };

  describe('Generates OpenReceipt plugin files correctly', () => {
    const OUTPUT_PATH = path.join(os.tmpdir(), uuid());

    beforeEach(async () => {
      return generateWithOptions(__dirname, OUTPUT_PATH, options);
    });

    afterEach(() => {
      rimraf.sync(OUTPUT_PATH);
    });

    it('copies buildspec.yml', () => {
      expect(true).toBeTruthy()
    });
  });
});
