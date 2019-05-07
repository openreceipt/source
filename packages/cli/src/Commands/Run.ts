import fs from 'fs';
import path from 'path';

import { Engine } from '@openreceipt/core';
import yargs from 'yargs';

export type Params = {
  emlPath: string;
};
export const command = 'run [emlPath]';
export const desc = '';
export const builder: Record<string, yargs.Options> = {};

export async function handler(params: Params) {
  const emlPath = path.resolve(process.cwd(), params.emlPath);
  const source = fs.readFileSync(emlPath, 'utf8');
  await Engine.run(source);
}
