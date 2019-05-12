import {
  extract,
  extractAll,
  Item,
  Parser,
  roundToDecimal,
} from '@openreceipt/core';

import Plugin from './';

export default class ZooPlusV1 extends Parser {
  static readonly meta = {
    since: new Date(2017, 1, 1).getTime(),
  };

  private getProductName = (htmlString: string) => {
    const productNameHtmlString = extract(
      htmlString,
      '<!-- Product name -->',
      '</tr>',
    );

    const $ = this.engine.domParser.parse(productNameHtmlString);

    return $('span')
      .first()
      .text()
      .replace(/^\s?-\s?/, '')
      .replace(/-/g, ' - ')
      .replace(/\s\s/g, ' ');
  };

  private getProductDetails = (htmlString: string) => {
    const lastEmptyRow = htmlString.lastIndexOf('<tr>');

    const start = htmlString.lastIndexOf('<tr>', lastEmptyRow - 1);
    const end = htmlString.indexOf('</tr>', start);

    if (start === -1 || end === -1 || start > end) {
      throw new Error('Something bad has happened');
    }

    const productDetailsHtmlString = htmlString.slice(start, end);

    const $ = this.engine.domParser.parse(productDetailsHtmlString) as any;

    const res = $('p')
      .first()
      .text();

    const [, quantity, amount, currency] = res.match(/(\d)+x\s+(.*)\s(\w+)/);

    return {
      amount,
      currency,
      quantity,
    };
  };

  private getProducts = (html: string) => {
    const productsHtmlFragments = extractAll(
      html,
      '<!-- Order block for one product -->',
      '<!-- End Order block for one product -->',
    );

    return productsHtmlFragments.map((fragment) => {
      const name = this.getProductName(fragment);
      const { amount, currency, quantity } = this.getProductDetails(fragment);

      return {
        amount: parseInt(amount.replace('.', ''), 10),
        currency,
        description: name,
        quantity: parseInt(quantity, 10),
      };
    });
  };

  private getCurrencyAndTotal = (htmlString: string) => {
    const orderTotalHtmlString = extract(
      htmlString,
      '<!-- Grand total block -->',
      '<!-- End Grand total block -->',
    );
    const $ = this.engine.domParser.parse(orderTotalHtmlString);

    const node = $('tr > td[align=right] > p').first();

    if (!node) {
      throw new Error('Order total could not be retrieved');
    }

    const [, amount, currency] = (node.text() as string).match(
      /(\d+.\d+)\s(\w+)/,
    ) as any[];

    return {
      currency,
      total: parseInt(amount.replace('.', ''), 10),
    };
  };

  private getOrderId = (htmlString: string) => {
    const $ = this.engine.domParser.parse(htmlString);

    const node = $('b')
      .filter((index, el) => {
        return $(el).text() === 'Order number:';
      })
      .first();

    if (!node || !node.parent()) {
      throw new Error('Order number could not be retrieved');
    }

    const textContent = node.parent().text() as string;

    const [, orderId] = textContent.match(/(\d+)/) as any;

    return orderId;
  };

  private getOrderDate = (htmlString: string) => {
    const $ = this.engine.domParser.parse(htmlString);

    const node = $('b').filter((index, el) => {
      return $(el).text() === 'Order date:';
    });

    if (!node || !node.parent()) {
      throw new Error('Order date could not be retrieved');
    }

    const textContent = node.parent().text() as string;

    const [, date] = textContent.match(/(\d+\/\d+\/\d+)/) as any;

    return new Date(date);
  };

  async parse(): Promise<void> {
    const html = this.engine.state.email.html as string;

    const { currency, total } = this.getCurrencyAndTotal(html);

    const taxAmount = (total - total / 1.2) / 1000;

    const tax = {
      amount: roundToDecimal(taxAmount, 3) * 1000,
      currency,
      description: 'VAT',
      taxNumber: Plugin.meta.merchant!.taxNumber,
    };

    this.engine.state.receipt = {
      currency,
      date: this.engine.state.email.date || this.getOrderDate(html),
      items: this.getProducts(html),
      orderId: this.getOrderId(html),
      taxes: [tax],
      total,
    };
  }
}
