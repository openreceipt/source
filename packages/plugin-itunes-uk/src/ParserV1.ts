import { Parser, Receipt, Util } from '@openreceipt/core';

import Merchant from './Merchant';

const formatCurrency = (price: string) => {
  return Util.formatCurrency(Merchant.currency, price);
};

export default class ParserV1 extends Parser {
  static readonly meta = {
    since: 1554601134000,
  };

  private getProductName = (
    $: CheerioStatic,
    productElement: CheerioElement,
  ) => {
    const productNameNode = $(productElement)
      .find('.item-cell')
      .first();

    const productType = $(productNameNode)
      .find('.type')
      .first()
      .text();

    const productTitle = $(productNameNode)
      .find('.title')
      .first()
      .text();

    if (!productNameNode) {
      throw new Error('Could not retrieve product name');
    }

    return `${productType} - ${productTitle}`;
  };

  private getProductDetails = (
    $: CheerioStatic,
    productElement: CheerioElement,
  ) => {
    const productPrice = $(productElement)
      .find('td.price-cell.aapl-mobile-cell')
      .first()
      .text()
      .trim();

    if (!productPrice) {
      throw new Error('Could not retrieve product details');
    }

    return {
      amount: formatCurrency(productPrice),
      currency: Merchant.currency,
      quantity: 1,
    };
  };

  private getProduct = ($: CheerioStatic, productElement: CheerioElement) => {
    return {
      description: this.getProductName($, productElement),
      ...this.getProductDetails($, productElement),
    };
  };

  private getProducts = () => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nodes = $('.aapl-mobile-div tr[style="max-height:114px;"]');

    return Array.from(nodes).map((node) => {
      return this.getProduct($, node);
    });
  };

  private getOrderSummary = () => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nodes = $(
      '.aapl-mobile-div td.aapl-mobile-cell[colspan="2"] td[align="right"]',
    );
    const taxNode = nodes.get(3);

    const totalNode = $(
      '.aapl-mobile-div tr[height="48"] td.aapl-mobile-cell[width="120"]',
    ).first();

    return {
      currency: Merchant.currency,
      taxAmount: formatCurrency(
        $(taxNode)
          .text()
          .trim(),
      ),
      total: formatCurrency(
        $(totalNode)
          .text()
          .trim(),
      ),
    };
  };

  private getOrderNumber = () => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const node = $('.aapl-mobile-div tr[height="44"] .aapl-mobile-cell')
      .filter((index, detailNode) => {
        return $(detailNode)
          .text()
          .trim()
          .startsWith('ORDER ID');
      })
      .first();

    return node
      .text()
      .trim()
      .replace('ORDER ID', '');
  };

  private getOrderDate = () => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const node = $('.aapl-mobile-div tr[height="44"] .aapl-mobile-cell')
      .filter((index, detailNode) => {
        return $(detailNode)
          .text()
          .trim()
          .startsWith('INVOICE DATE');
      })
      .first();

    const dateAsString = node
      .text()
      .trim()
      .replace('INVOICE DATE', '');
    return new Date(dateAsString);
  };

  async parse(): Promise<void> {
    const { taxAmount, total } = this.getOrderSummary();

    const tax = {
      amount: taxAmount,
      currency: Merchant.currency,
      description: 'VAT',
    };

    this.engine.state.receipt = {
      currency: Merchant.currency,
      date: this.engine.state.email.date || this.getOrderDate(),
      items: this.getProducts(),
      merchant: Merchant,
      orderId: this.getOrderNumber(),
      taxes: [tax],
      total,
    } as Receipt;
  }
}
