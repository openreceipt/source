import {
  extract,
  extractAll,
  Item,
  Parser,
  Receipt,
  roundToDecimal,
} from '@openreceipt/core';

import Plugin from './';

export default class UberEatsV1 extends Parser {
  static readonly meta = {
    since: new Date('2019-04-17T23:04:24.000Z').getTime(),
  };

  private getProductName = (productHtmlFragment: string) => {
    return extract(
      productHtmlFragment,
      '<!-- Name -->',
      '<!-- close Name -->',
    ).trim();
  };

  private getProductQuantity = (productHtmlFragment: string) => {
    const productQuantityString = extract(
      productHtmlFragment,
      '<!-- Quanitty -->',
      '<!-- close Quanitty -->',
    ).trim();

    return parseInt(productQuantityString, 10);
  };

  private getProductAmount = (productHtmlFragment: string) => {
    const productAmountString = extract(
      productHtmlFragment,
      '<!-- Price -->',
      '<!-- Price -->',
    )
      .trim()
      .replace(/£|\./g, '');

    return parseInt(productAmountString, 10);
  };

  private getProductDetails = (productHtmlFragment: string) => {
    const amount = this.getProductAmount(productHtmlFragment);
    const quantity = this.getProductQuantity(productHtmlFragment);

    if (productHtmlFragment.includes('<!-- Eats sub/optional item -->')) {
      const subItemsFragments = extractAll(
        productHtmlFragment,
        '<!-- Eats sub/optional item -->',
        '<!-- close Eats sub/optional item -->',
      );

      const subItems = subItemsFragments.map((fragment: string) => {
        const description = this.getProductName(fragment);

        const subAmountString = extract(
          fragment,
          '<!-- Price -->',
          '<!-- close Price -->',
        )
          .trim()
          .replace(/£|\./g, '');
        const subAmount = parseInt(subAmountString, 10);

        return {
          amount: subAmount,
          currency: 'GBP',
          description,
        };
      });

      return {
        amount,
        currency: 'GBP',
        quantity,
        subItems,
      };
    }

    return {
      amount,
      currency: 'GBP',
      quantity,
    };
  };

  private getProduct = (productHtmlFragment: string) => {
    return {
      description: this.getProductName(productHtmlFragment),
      ...this.getProductDetails(productHtmlFragment),
    };
  };

  private getDelivery = (): Item => {
    const deliveryHtmlString = extract(
      this.engine.state.email.html as string,
      '<!-- End Deducted credits -->',
      '<!-- Tax Summary section -->',
    );

    const $ = this.engine.domParser.parse(deliveryHtmlString);

    const deliveryLabelNode = $('td.Uber18_text_p1').first();
    const deliveryValueNode = $('td.Uber18_text_p1').last();

    const amount = deliveryValueNode
      .text()
      .trim()
      .replace(/£|\./g, '');

    return {
      amount: parseInt(amount, 10),
      currency: 'GBP',
      description: deliveryLabelNode.text().trim(),
    };
  };

  private getProducts = () => {
    const productsHtmlString = extract(
      this.engine.state.email.html as string,
      '<!-- Fare Breakdown section -->',
      '<!-- End Fare Breakdown section -->',
    );

    const productHtmlFragments = extractAll(
      productsHtmlString,
      '<!-- Eats Order item -->',
      '<!-- Eats Order Item -->',
    );

    return productHtmlFragments.map(this.getProduct);
  };

  private getCurrencyAndTotal = () => {
    const totalString = extract(
      this.engine.state.email.html as string,
      '<!-- Total section -->',
      '<!-- End Total section -->',
    );

    const $ = this.engine.domParser.parse(totalString);

    const orderTotalValueNode = $('tr > td').last();

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

  private getOrderDate = () => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const dateNode = $('span.Uber18_text_p1')
      .first()
      .text();

    if (!dateNode) {
      throw new Error('Order date could not be retrieved');
    }

    return new Date(dateNode);
  };

  async parse(): Promise<void> {
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
      items: [...this.getProducts(), this.getDelivery()],
      merchant: Plugin.meta.merchant,
      orderId: `${this.getOrderDate().getTime()}`,
      taxes: [tax],
      total,
    } as Receipt;
  }
}
