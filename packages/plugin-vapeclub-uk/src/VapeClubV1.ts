import { Parser, roundToDecimal } from '@openreceipt/core';

import Plugin from './';

export default class VapeClubV1 extends Parser {
  static readonly meta = {
    since: new Date('2017-06-17T17:56:23.000Z').getTime(),
  };

  private $!: CheerioStatic;

  private getProductName = (productNode: CheerioElement) => {
    const nameNode = this.$(productNode)
      .find('a > h2')
      .first();
    const detailNode = this.$(productNode)
      .find('a + p')
      .first();

    if (!nameNode || !detailNode) {
      throw new Error('Product name could not be retrieved');
    }

    return `${nameNode.text().trim()} - ${detailNode.text().trim()}`;
  };

  private getProductDetails = (productNode: CheerioElement) => {
    const detailsNode = this.$(productNode)
      .find('a + p + p')
      .first();

    if (!detailsNode) {
      throw new Error('Product details could not be retrieved');
    }

    const [quantity, amountString] = detailsNode
      .text()
      .trim()
      .split('@');

    const [, amountWithDecimal] = amountString.match(
      /\(Total:\s£(.*)\)/,
    ) as any;

    return {
      amount: parseInt(amountWithDecimal.replace('.', ''), 10),
      currency: 'GBP',
      quantity: parseInt(quantity, 10),
    };
  };

  private getProduct = (productNode: CheerioElement) => {
    return {
      description: this.getProductName(productNode),
      ...this.getProductDetails(productNode),
    };
  };

  private getProducts = () => {
    const nodes = this.$('tr > td[width="75%"]');

    return Array.from(nodes).map(this.getProduct);
  };

  private getCurrencyAndTotal = () => {
    const orderTotalLabelNode = this.$('tr > td[width="80%"]');

    if (!orderTotalLabelNode) {
      throw new Error('Order total could not be retrieved');
    }

    const orderTotalValueNode = orderTotalLabelNode
      .find('.colStyle1 + .colStyle2')
      .first();

    if (!orderTotalValueNode) {
      throw new Error('Order total could not be retrieved');
    }

    const amount = orderTotalValueNode
      .text()
      .trim()
      .replace(/£|\./g, '');

    return {
      currency: 'GBP',
      total: parseInt(amount, 10),
    };
  };

  private getOrderId = () => {
    const orderIdLabelNode = this.$('td')
      .filter((index, el) => {
        return this.$(el)
          .text()
          .startsWith('Order Number:');
      })
      .first();

    if (!orderIdLabelNode) {
      throw new Error('Order number could not be retrieved');
    }

    const orderIdValueNode = orderIdLabelNode.next();

    if (!orderIdValueNode) {
      throw new Error('Order number could not be retrieved');
    }

    return orderIdValueNode.text() as string;
  };

  private getOrderDate = () => {
    const orderDateLabelNode = this.$('td')
      .filter((index, el) => {
        return this.$(el)
          .text()
          .startsWith('Order Date:');
      })
      .first();

    if (!orderDateLabelNode) {
      throw new Error('Order date could not be retrieved');
    }

    const orderDateValueNode = orderDateLabelNode.next();

    if (!orderDateValueNode) {
      throw new Error('Order number could not be retrieved');
    }

    const [, , day, month, year] = orderDateValueNode
      .text()
      .match(/((\d+)\/(\d+)\/(\d+))/) as any;
    return new Date(`${year}/${month}/${day}`);
  };

  async parse(): Promise<void> {
    const htmlString = this.engine.state.email.html as string;
    this.$ = this.engine.domParser.parse(htmlString);

    const { currency, total } = this.getCurrencyAndTotal();

    const taxAmount = (total - total / 1.2) / 1000;

    const tax = {
      amount: roundToDecimal(taxAmount, 3) * 1000,
      currency,
      description: 'VAT',
      taxNumber: Plugin.meta.merchant!.taxNumber,
    };

    this.engine.state.receipt = {
      currency,
      date: this.engine.state.email.date || this.getOrderDate(),
      items: this.getProducts(),
      merchant: Plugin.meta.merchant,
      orderId: this.getOrderId(),
      taxes: [tax],
      total,
    };
  }
}
