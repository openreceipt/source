import { JSDOM } from 'jsdom';

export default class DomParser {
  constructor(public driver: typeof JSDOM = JSDOM) {}

  parse = (htmlString: string) => {
    return new this.driver(htmlString);
  };
}
