import yargs from 'yargs';
import yeoman from 'yeoman-environment';

export type Params = {};
export const command = 'create plugin';
export const desc = '';
export const builder: Record<string, yargs.Options> = {};

export async function handler(params: Params) {
  const env = yeoman.createEnv();
  env.register(
    require.resolve('@openreceipt/generator-plugin'),
    'openreceipt:plugin',
  );

  return new Promise((resolve, reject) => {
    env.run('openreceipt:plugin', () => {
      return;
      // console.log('Done');
    });
  });

  // const emlPath = path.resolve(process.cwd(), params.emlPath);
  // const source = fs.readFileSync(emlPath, 'utf8');
  // await Engine.run(source);
}
