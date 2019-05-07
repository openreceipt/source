import Error from './Error';

export default class FatalError extends Error {
  fatal: boolean = true;
}
