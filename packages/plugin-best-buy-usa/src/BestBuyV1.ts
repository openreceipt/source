import { Parser, Util } from '@openreceipt/core';

export default class BestBuyV1 extends Parser {
  static readonly meta = {
    since: new Date(2017, 1, 1).getTime(),
    sourceAddress: 'BestBuyInfo@emailinfo.bestbuy.com',
  };

  private formatCurrency = (price: string) => {
    return Util.Currency.getAmountFromPriceString(this.getCurrency(), price);
  };

  private getItemName = ($: CheerioStatic, itemNode: CheerioElement) => {
    const itemNameNode = $(itemNode)
      .find('a[target=_blank]')
      .first();

    if (!itemNameNode) {
      throw new Error('Could not retrieve product name');
    }

    return itemNameNode.text().replace(/\s{2}/g, ' - ');
  };

  private getItemDetails = ($: CheerioStatic, itemNode: CheerioElement) => {
    const itemDetailsNode = $(itemNode)
      .find('td.lineItem-details[width="123"]')
      .first();

    if (!itemDetailsNode) {
      throw new Error('Could not retrieve product details');
    }

    const quantityLabelNode = itemDetailsNode.find('td[width="40"]').first();

    if (!quantityLabelNode) {
      throw new Error('Could not retrieve product quantity');
    }

    const valueNodes = $(itemDetailsNode).find('tr:last-child > td');

    const quantity = parseInt(
      $(valueNodes.get(quantityLabelNode.index())).text(),
      10,
    );

    const priceLabelNode = $(itemDetailsNode)
      .find('td[width="83"]')
      .first();

    if (!priceLabelNode) {
      throw new Error('Could not retrieve product price');
    }

    const price = $(valueNodes.get(priceLabelNode.index())).text();

    return {
      amount: this.formatCurrency(price),
      currency: this.getCurrency(),
      quantity,
    };
  };

  private getItem = ($: CheerioStatic, itemNode: CheerioElement) => {
    return {
      description: this.getItemName($, itemNode),
      ...this.getItemDetails($, itemNode),
    };
  };

  private getOrderSummaryItemAmount = (
    $: CheerioStatic,
    nodes: Cheerio,
    searchString: string,
  ) => {
    const summaryItemLabelNode = nodes
      .filter((index, el) => {
        return $(el)
          .text()
          .trim()
          .startsWith(searchString);
      })
      .first();

    if (!summaryItemLabelNode || !summaryItemLabelNode.next()) {
      throw new Error('Order summary item could not be retrieved');
    }

    if (
      summaryItemLabelNode
        .next()
        .text()
        .trim() === 'FREE'
    ) {
      return 0;
    }

    return this.formatCurrency(summaryItemLabelNode.next().text());
  };

  getDate() {
    const orderIdHtmlString = Util.Text.extract(
      this.engine.state.email.html as string,
      '<!-- BEGIN - MAIN MESSAGE -->',
      '<!-- END - MAIN MESSAGE -->',
    );

    const $ = this.engine.domParser.parse(orderIdHtmlString);

    const node = $('span')
      .filter((index, el) => {
        return (
          $(el)
            .text()
            .split(',').length === 2
        );
      })
      .first();

    if (!node) {
      throw new Error('Order date could not be retrieved');
    }

    const [, orderDateString] = node.text().split(',');

    const [month, day, year] = orderDateString.trim().match(/(\d{2})/g) as any;

    return new Date(`20${year}-${month}-${day}`);
  }

  getId() {
    const orderIdHtmlString = Util.Text.extract(
      this.engine.state.email.html as string,
      '<!-- BEGIN - MAIN MESSAGE -->',
      '<!-- END - MAIN MESSAGE -->',
    );

    const $ = this.engine.domParser.parse(orderIdHtmlString);

    const node = $('span')
      .filter((index, el) => {
        return $(el)
          .text()
          .trim()
          .startsWith('ORDER #');
      })
      .first();

    if (!node) {
      throw new Error('Order number could not be retrieved');
    }

    const [, orderId] = node.text().match(/ORDER\s#(.*)/) as any;

    return orderId;
  }

  getItems() {
    const productsHtmlString = Util.Text.extract(
      this.engine.state.email.html as string,
      '<!-- ORDER DETAILS -->',
      '<!-- END - ORDER DETAILS -->',
    );
    const $ = this.engine.domParser.parse(productsHtmlString);

    const nodes = $('.lineItem-meta');

    return Array.from(nodes).map((node) => {
      return this.getItem($, node);
    });
  }

  getTaxes() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nodes = $('td[width="140"]');

    const taxAmount = this.getOrderSummaryItemAmount($, nodes, 'Tax:');

    const tax = {
      amount: taxAmount,
      currency: this.getCurrency(),
      description: 'Sales Tax',
    };
    return [tax];
  }

  getTotal() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nodes = $('td[width="140"]');

    return this.getOrderSummaryItemAmount($, nodes, 'ORDER TOTAL:');
  }
}
