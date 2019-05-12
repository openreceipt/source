import { Parser, Util } from '@openreceipt/core';

export default class JustEatV1 extends Parser {
  static readonly meta = {
    since: 1529799397000,
    sourceAddress: 'justeat@order.just-eat.co.uk',
  };

  private getProductName = ($: CheerioStatic, productNode: CheerioElement) => {
    return $(productNode)
      .find('td[colspan="2"]')
      .first()
      .text();
  };

  private getProductDetails = (
    $: CheerioStatic,
    productNode: CheerioElement,
  ) => {
    const productDetailedNodes = $(productNode)
      .find('td[colspan="1"]')
      .filter((index, el) => {
        return (
          $(el)
            .text()
            .trim() !== ''
        );
      });

    const amount = Util.Currency.getAmountFromPriceString(
      this.merchant.currency!,
      $(productDetailedNodes[1]).text(),
    );

    return {
      amount,
      currency: 'GBP',
      quantity: 1,
    };
  };

  private getProduct = ($: CheerioStatic, productNode: CheerioElement) => {
    return {
      description: this.getProductName($, productNode),
      ...this.getProductDetails($, productNode),
    };
  };

  private getProducts = () => {
    const productsHtmlString = Util.Text.extract(
      this.engine.state.email.html as string,
      '<!-- start of generated items -->',
      '<!-- end of generated items -->',
    );

    const $ = this.engine.domParser.parse(
      `<table>${productsHtmlString}</table>`,
    );

    const productNodes = $('tr').filter((index, el) => {
      return $(el).find('td[colspan="2"]').length === 1;
    });

    return Array.from(productNodes).map((productNode) => {
      return this.getProduct($, productNode);
    });
  };

  private extractTotalsNode = () => {
    const totalsString = Util.Text.extract(
      this.engine.state.email.html as string,
      '<!-- totals for the order -->',
      '<!-- end of receipt -->',
    );
    return this.engine.domParser.parse(`<table>${totalsString}</table>`);
  };

  getSubtotalItem = (prefix: string) => {
    const $ = this.extractTotalsNode();
    const totalsNode = $('tr')
      .first()
      .find('table tr');

    const node = totalsNode.filter((index, el) => {
      return $(el)
        .text()
        .trim()
        .startsWith(prefix);
    });

    const amountAsString = node
      .text()
      .replace(prefix, '')
      .trim();

    return {
      amount: Util.Currency.getAmountFromPriceString(
        this.getCurrency(),
        amountAsString,
      ),
      currency: this.getCurrency(),
      description: prefix,
      quantity: 1,
    };
  };

  getDelivery = () => {
    const delivery = this.getSubtotalItem('Delivery fee');

    // For orders that do not have a delivery fee
    if (isNaN(delivery.amount)) {
      delivery.amount = 0;
    }

    return delivery;
  };

  getServiceCharge = () => {
    return this.getSubtotalItem('Service charge');
  };

  getId() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const orderString = $('td[valign="top"][align="center"] > strong')
      .first()
      .parent()
      .text();

    const [, orderId] = orderString.match(
      /Your order number is (.*)\. If/,
    ) as any;

    return orderId;
  }

  getItems() {
    return [...this.getProducts(), this.getServiceCharge(), this.getDelivery()];
  }

  getTaxes() {
    return [];
  }

  getTotal() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const totalNode = $('td[width="80"][valign="top"][align="right"]').last();

    return Util.Currency.getAmountFromPriceString(
      this.merchant.currency!,
      totalNode.text(),
    );
  }
}
