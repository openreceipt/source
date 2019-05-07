import { extract, Item, Parser, roundToDecimal } from '@openreceipt/core';

import Plugin from './';

export default class ZooPlusV1 extends Parser {
  static readonly meta = {
    since: new Date(2017, 1, 1).getTime(),
  };

  private products: Item[] = [];

  private getProductName = (htmlString: string) => {
    const productNameHtmlString = extract(
      htmlString,
      '<!-- Product name -->',
      '</tr>',
    );

    const productName = this.engine.domParser.parse(
      productNameHtmlString,
    ) as any;
    return productName.window.document
      .querySelector('span')
      .textContent.replace(/^\s?-\s?/, '')
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

    const productDetails = this.engine.domParser.parse(
      productDetailsHtmlString,
    ) as any;
    const res = productDetails.window.document.querySelector('p').textContent;

    const [, quantity, amount, currency] = res.match(/(\d)+x\s+(.*)\s(\w+)/);

    return {
      amount,
      currency,
      quantity,
    };
  };

  private getProducts = (html: string) => {
    const start = html.indexOf('<!-- Order block for one product -->');
    const end = html.indexOf('<!-- End Order block for one product -->', start);

    // Finished
    if (start === -1 && end === 0) {
      return;
    }

    if (start === -1 || end === -1 || start > end) {
      throw new Error('Something bad has happened');
    }

    const orderItemHtml = html.slice(start, end);
    const name = this.getProductName(orderItemHtml);
    const { amount, currency, quantity } = this.getProductDetails(
      orderItemHtml,
    );

    this.products.push({
      amount: parseInt(amount.replace('.', ''), 10),
      currency,
      description: name,
      quantity: parseInt(quantity, 10),
    });

    this.getProducts(html.slice(end));
  };

  private getCurrencyAndTotal = (htmlString: string) => {
    const orderTotalHtmlString = extract(
      htmlString,
      '<!-- Grand total block -->',
      '<!-- End Grand total block -->',
    );
    const orderTotalHtml = this.engine.domParser.parse(orderTotalHtmlString);

    const node = orderTotalHtml.window.document.querySelector(
      'tr > td[align=right] > p',
    );

    if (!node) {
      throw new Error('Order total could not be retrieved');
    }

    const [, amount, currency] = (node.textContent as string).match(
      /(\d+.\d+)\s(\w+)/,
    ) as any[];

    return {
      currency,
      total: parseInt(amount.replace('.', ''), 10),
    };
  };

  private getOrderId = (htmlString: string) => {
    const html = this.engine.domParser.parse(htmlString);

    const nodes = html.window.document.querySelectorAll('b');

    const node = Array.from(nodes).find((element: HTMLElement) => {
      return element.textContent === 'Order number:';
    });

    if (!node || !node.parentNode) {
      throw new Error('Order number could not be retrieved');
    }

    const textContent = node.parentNode.textContent! as string;

    const [, orderId] = textContent.match(/(\d+)/) as any;

    return orderId;
  };

  private getOrderDate = (htmlString: string) => {
    const html = this.engine.domParser.parse(htmlString);

    const nodes = html.window.document.querySelectorAll('b');

    const node = Array.from(nodes).find((element: HTMLElement) => {
      return element.textContent === 'Order date:';
    });

    if (!node || !node.parentNode) {
      throw new Error('Order date could not be retrieved');
    }

    const textContent = node.parentNode.textContent! as string;

    const [, date] = textContent.match(/(\d+\/\d+\/\d+)/) as any;

    return new Date(date);
  };

  async parse(): Promise<void> {
    const html = this.engine.state.email.html as string;

    this.getProducts(html);

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
      items: this.products,
      orderId: this.getOrderId(html),
      taxes: [tax],
      total,
    };
  }
}
