import cheerio from 'cheerio';

export default class DomParser {
  constructor(public driver: CheerioAPI = cheerio) {}

  parse = (htmlString: string) => {
    return this.driver.load(htmlString);
  };
}
