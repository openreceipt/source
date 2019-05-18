import { Item, Parser, Receipt, Util } from '@openreceipt/core';

import Merchant from './Merchant';

const formatCurrency = (price: string) => {
  return Util.formatCurrency(Merchant.currency, price);
};

export default class UberEatsV1 extends Parser {
  static readonly meta = {
    since: new Date('2019-04-17T23:04:24.000Z').getTime(),
  };

  private getProductName = (productHtmlFragment: string) => {
    return Util.extract(
      productHtmlFragment,
      '<!-- Name -->',
      '<!-- close Name -->',
    ).trim();
  };

  private getProductQuantity = (productHtmlFragment: string) => {
    const productQuantityString = Util.extract(
      productHtmlFragment,
      '<!-- Quanitty -->',
      '<!-- close Quanitty -->',
    ).trim();

    return parseInt(productQuantityString, 10);
  };

  private getProductAmount = (productHtmlFragment: string) => {
    const productAmountString = Util.extract(
      productHtmlFragment,
      '<!-- Price -->',
      '<!-- Price -->',
    ).trim();

    return formatCurrency(productAmountString);
  };

  private getProductDetails = (productHtmlFragment: string) => {
    const amount = this.getProductAmount(productHtmlFragment);
    const quantity = this.getProductQuantity(productHtmlFragment);

    if (productHtmlFragment.includes('<!-- Eats sub/optional item -->')) {
      const subItemsFragments = Util.extractAll(
        productHtmlFragment,
        '<!-- Eats sub/optional item -->',
        '<!-- close Eats sub/optional item -->',
      );

      const subItems = subItemsFragments.map((fragment: string) => {
        const description = this.getProductName(fragment);

        const subAmountString = Util.extract(
          fragment,
          '<!-- Price -->',
          '<!-- close Price -->',
        ).trim();
        const subAmount = formatCurrency(subAmountString);

        return {
          amount: subAmount,
          currency: Merchant.currency,
          description,
        };
      });

      return {
        amount,
        currency: Merchant.currency,
        quantity,
        subItems,
      };
    }

    return {
      amount,
      currency: Merchant.currency,
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
    const deliveryHtmlString = Util.extract(
      this.engine.state.email.html as string,
      '<!-- End Deducted credits -->',
      '<!-- Tax Summary section -->',
    );

    const $ = this.engine.domParser.parse(deliveryHtmlString);

    const deliveryLabelNode = $('td.Uber18_text_p1').first();
    const deliveryValueNode = $('td.Uber18_text_p1').last();

    const amount = deliveryValueNode.text().trim();

    return {
      amount: formatCurrency(amount),
      currency: 'GBP',
      description: deliveryLabelNode.text().trim(),
    };
  };

  private getProducts = () => {
    const productsHtmlString = Util.extract(
      this.engine.state.email.html as string,
      '<!-- Fare Breakdown section -->',
      '<!-- End Fare Breakdown section -->',
    );

    const productHtmlFragments = Util.extractAll(
      productsHtmlString,
      '<!-- Eats Order item -->',
      '<!-- Eats Order Item -->',
    );

    return productHtmlFragments.map(this.getProduct);
  };

  private getCurrencyAndTotal = () => {
    const totalString = Util.extract(
      this.engine.state.email.html as string,
      '<!-- Total section -->',
      '<!-- End Total section -->',
    );

    const $ = this.engine.domParser.parse(totalString);

    const orderTotalValueNode = $('tr > td').last();

    if (!orderTotalValueNode) {
      throw new Error('Order total could not be retrieved');
    }

    const amount = orderTotalValueNode.text().trim();

    return {
      currency: Merchant.currency,
      total: formatCurrency(amount),
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
      amount: Util.roundToDecimal(taxAmount, 3) * 1000,
      currency,
      description: 'VAT',
      taxNumber: Merchant.taxNumber,
    };

    this.engine.state.receipt = {
      currency,
      date: this.engine.state.email.date || this.getOrderDate(),
      items: [...this.getProducts(), this.getDelivery()],
      merchant: Merchant,
      orderId: `${this.getOrderDate().getTime()}`,
      taxes: [tax],
      total,
    } as Receipt;
  }
}
