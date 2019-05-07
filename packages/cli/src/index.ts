import yargs from 'yargs';

// tslint:disable-next-line:no-unused-expression
yargs
  .commandDir('Commands')
  .demandCommand(1)
  .help()
  .version().argv;
