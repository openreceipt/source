import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import uuid from 'uuid/v4';
// @ts-ignore
import assert from 'yeoman-assert';

import { generateWithPrompts } from '../setupTests';

describe('app', () => {
  describe('Generates an OpenReceipt plugin', () => {
    const OUTPUT_PATH = path.join(os.tmpdir(), uuid());
    const PACKAGE_NAME = '@openreceipt/plugin-generated-plugin';
    const answers: object = {
      packageName: true,
      projectName: PACKAGE_NAME,
      retailerCountry: 'USA',
      retailerEmail: '',
      retailerName: 'Best Buy',
      retailerNameCamelCase: 'BestBuy',
    };

    beforeEach(async () => {
      return generateWithPrompts(__dirname, OUTPUT_PATH, answers);
    });

    afterEach(() => {
      rimraf.sync(OUTPUT_PATH);
    });

    it('copies all files', () => {
      assert.file(path.join(OUTPUT_PATH, 'src', 'index.ts'));
      assert.file(path.join(OUTPUT_PATH, 'src', 'Merchant.ts'));
    });
  });
});
