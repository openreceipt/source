import { extract, Parser, Receipt } from '@openreceipt/core';

function getElementIndex(element: CheerioElement) {
  return Array.from(element.parentNode!.children).indexOf(element);
}

function getCurrencyAndAmount(value: string, fallbackCurrency: string = 'USD') {
  const [currencySymbol, ...rawAmount] = value;

  const amount = parseInt(rawAmount.join('').replace('.', ''), 10);
  const currency = currencySymbol === '$' ? 'USD' : fallbackCurrency;

  return {
    amount,
    currency,
  };
}

export default class BestBuyV1 extends Parser {
  static readonly meta = {
    since: new Date(2017, 1, 1).getTime(),
  };

  private getProductName = (
    $: CheerioStatic,
    productElement: CheerioElement,
  ) => {
    const productNameNode = $(productElement)
      .find('a[target=_blank]')
      .first();

    if (!productNameNode) {
      throw new Error('Could not retrieve product name');
    }

    return productNameNode.text().replace(/\s{2}/g, ' - ');
  };

  private getProductDetails = (
    $: CheerioStatic,
    productElement: CheerioElement,
  ) => {
    const productDetailsNode = $(productElement)
      .find('td.lineItem-details[width="123"]')
      .first();

    if (!productDetailsNode) {
      throw new Error('Could not retrieve product details');
    }

    const quantityLabelNode = productDetailsNode.find('td[width="40"]').first();

    if (!quantityLabelNode) {
      throw new Error('Could not retrieve product quantity');
    }

    const valueNodes = $(productDetailsNode).find('tr:last-child > td');

    const quantity = parseInt(
      $(valueNodes.get(quantityLabelNode.index())).text(),
      10,
    );

    const priceLabelNode = $(productDetailsNode)
      .find('td[width="83"]')
      .first();

    if (!priceLabelNode) {
      throw new Error('Could not retrieve product price');
    }

    const price = $(valueNodes.get(priceLabelNode.index())).text();

    return {
      quantity,
      ...getCurrencyAndAmount(price),
    };
  };

  private getProduct = ($: CheerioStatic, productElement: CheerioElement) => {
    return {
      description: this.getProductName($, productElement),
      ...this.getProductDetails($, productElement),
    };
  };

  private getProducts = (html: string) => {
    const productsHtmlString = extract(
      html,
      '<!-- ORDER DETAILS -->',
      '<!-- END - ORDER DETAILS -->',
    );
    const $ = this.engine.domParser.parse(productsHtmlString);

    const nodes = $('.lineItem-meta');

    return Array.from(nodes).map((node) => {
      return this.getProduct($, node);
    });
  };

  private getOrderSummaryItem = (
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
      return {
        amount: 0,
        currency: 'USD',
      };
    }

    return getCurrencyAndAmount(summaryItemLabelNode.next().text());
  };

  private getOrderSummary = (htmlString: string) => {
    const $ = this.engine.domParser.parse(htmlString);

    const nodes = $('td[width="140"]');

    const subtotal = this.getOrderSummaryItem($, nodes, 'Subtotal:');
    const tax = this.getOrderSummaryItem($, nodes, 'Tax:');
    const total = this.getOrderSummaryItem($, nodes, 'ORDER TOTAL:');

    return {
      currency: subtotal.currency,
      taxAmount: tax.amount,
      total: total.amount,
    };
  };

  private getOrderId = (htmlString: string) => {
    const orderIdHtmlString = extract(
      htmlString,
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
  };

  private getOrderDate = (htmlString: string) => {
    const orderIdHtmlString = extract(
      htmlString,
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
  };

  async parse(): Promise<void> {
    const html = this.engine.state.email.html as string;

    const { currency, taxAmount, total } = this.getOrderSummary(html);

    const tax = {
      amount: taxAmount,
      currency,
      description: 'Sales Tax',
    };

    this.engine.state.receipt = {
      currency,
      date: this.engine.state.email.date || this.getOrderDate(html),
      items: this.getProducts(html),
      orderId: this.getOrderId(html),
      taxes: [tax],
      total,
    } as Receipt;
  }
}
