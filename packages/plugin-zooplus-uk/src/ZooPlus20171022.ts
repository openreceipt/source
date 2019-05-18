import { Parser, Util } from '@openreceipt/core';

export default class ZooPlus20171022 extends Parser {
  static readonly meta = {
    since: 1508632229000,
    sourceAddress: 'service@zooplus.co.uk',
  };

  private formatCurrency = (price: string) => {
    return Util.formatCurrency(this.merchant.currency, price);
  };

  private getItemName = (htmlString: string) => {
    const productNameHtmlString = Util.extract(
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

  private getItemDetails = (htmlString: string) => {
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

    const [, quantity, amount] = res.match(/(\d)+x\s+(.*)\s(\w+)/);

    return {
      amount: this.formatCurrency(amount),
      quantity: parseInt(quantity, 10),
    };
  };

  getDate() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const node = $('b').filter((index, el) => {
      return $(el).text() === 'Order date:';
    });

    if (!node || !node.parent()) {
      throw new Error('Order date could not be retrieved');
    }

    const textContent = node.parent().text() as string;

    const [, date] = textContent.match(/(\d+\/\d+\/\d+)/) as any;

    return new Date(date);
  }

  getId() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

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
  }

  getItems() {
    const itemsHtmlFragments = Util.extractAll(
      this.engine.state.email.html as string,
      '<!-- Order block for one product -->',
      '<!-- End Order block for one product -->',
    );

    return itemsHtmlFragments.map((fragment) => {
      const name = this.getItemName(fragment);

      return {
        currency: this.merchant.currency,
        description: name,
        ...this.getItemDetails(fragment),
      };
    });
  }

  getTaxes() {
    const total = this.getTotal();

    const taxAmount = (total - total / 1.2) / 1000;

    const tax = {
      amount: Util.roundToDecimal(taxAmount, 3) * 1000,
      currency: this.merchant.currency,
      description: 'VAT',
      taxNumber: this.merchant.taxNumber,
    };

    return [tax];
  }

  getTotal() {
    const orderTotalHtmlString = Util.extract(
      this.engine.state.email.html as string,
      '<!-- Grand total block -->',
      '<!-- End Grand total block -->',
    );
    const $ = this.engine.domParser.parse(orderTotalHtmlString);

    const node = $('tr > td[align=right] > p').first();

    if (!node) {
      throw new Error('Order total could not be retrieved');
    }

    const [, amount] = (node.text() as string).match(
      /(\d+.\d+)\s(\w+)/,
    ) as any[];

    return this.formatCurrency(amount);
  }
}
