import { Parser, Util } from '@openreceipt/core';

export default class VapeClubV1 extends Parser {
  static readonly meta = {
    since: 1556790017000,
    sourceAddress: 'info@vapeclub.co.uk',
  };

  private formatCurrency = (price: string) => {
    return Util.formatCurrency(this.getCurrency(), price);
  };

  private getItemName = (itemNode: CheerioElement) => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nameNode = $(itemNode)
      .find('a > h2')
      .first();
    const detailNode = $(itemNode)
      .find('a + p')
      .first();

    if (!nameNode || !detailNode) {
      throw new Error('Product name could not be retrieved');
    }

    return `${nameNode.text().trim()} - ${detailNode.text().trim()}`;
  };

  private getItemDetails = (itemNode: CheerioElement) => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const detailsNode = $(itemNode)
      .find('a + p + p')
      .first();

    if (!detailsNode) {
      throw new Error('Product details could not be retrieved');
    }

    const [quantity, amountString] = detailsNode
      .text()
      .trim()
      .split('@');

    const [, amount] = amountString.match(/\(Total:\s(.*)\)/) as any;

    return {
      amount: this.formatCurrency(amount),
      currency: this.getCurrency(),
      quantity: parseInt(quantity, 10),
    };
  };

  private getItem = (itemNode: CheerioElement) => {
    return {
      description: this.getItemName(itemNode),
      ...this.getItemDetails(itemNode),
    };
  };

  getDate() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const orderDateLabelNode = $('td')
      .filter((index, el) => {
        return $(el)
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
    return new Date(`${year}-${month}-${day}`);
  }

  getId() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const orderIdLabelNode = $('td')
      .filter((index, el) => {
        return $(el)
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
  }

  getItems() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const nodes = $('tr > td[width="75%"]');

    return Array.from(nodes).map(this.getItem);
  }

  getTaxes() {
    const total = this.getTotal();

    const taxAmount = (total - total / 1.2) / 1000;

    const tax = {
      amount: Util.roundToDecimal(taxAmount, 3) * 1000,
      currency: this.getCurrency(),
      description: 'VAT',
      taxNumber: this.merchant.taxNumber,
    };

    return [tax];
  }

  getTotal() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const orderTotalLabelNode = $('tr > td[width="80%"]');

    if (!orderTotalLabelNode) {
      throw new Error('Order total could not be retrieved');
    }

    const orderTotalValueNode = orderTotalLabelNode
      .find('.colStyle1 + .colStyle2')
      .first();

    if (!orderTotalValueNode) {
      throw new Error('Order total could not be retrieved');
    }

    const amount = orderTotalValueNode.text().trim();

    return this.formatCurrency(amount);
  }
}
