import { Parser, Util } from '@openreceipt/core';

export default class Steam1480013334000 extends Parser {
  static readonly meta = {
    since: 1480013334000,
    sourceAddress: 'noreply@steampowered.com',
  };

  private cachedCurrency!: string;
  private cachedTaxNumber!: string;

  private formatCurrency = (price: string) => {
    return Util.formatCurrency(this.getCurrency(), price);
  };

  private getTotalAsString = () => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nodes = $('.SubTextBlueTotalsValue');
    const firstOccurrence = nodes
      .first()
      .text()
      .trim();
    const secondOccurrence = nodes
      .last()
      .text()
      .trim();

    if (firstOccurrence !== secondOccurrence) {
      throw new Error('Totals do not match');
    }

    return firstOccurrence;
  };

  getCountry(): string {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const billingAddressNode = $('tr.DetailsBox > td.SubTextWhite td.SubText')
      .filter((index, node) => {
        return (
          $(node)
            .text()
            .trim() !== ''
        );
      })
      .first();

    const countryName = billingAddressNode
      .text()
      .trim()
      .split('\n')
      .pop()!
      .trim();

    const country = Util.Countries.findCountryByName(countryName);

    if (!country) {
      throw new Error('Could not find valid country');
    }

    return country.name.official;
  }

  getCurrency(): string {
    if (this.cachedCurrency) {
      return this.cachedCurrency;
    }

    const totalAsString = this.getTotalAsString();

    const taxNumber = this.getTaxNumber();

    if (!taxNumber) {
      const country = Util.Countries.findCountryByName(this.getCountry());

      if (!country) {
        throw new Error('Could not retrieve currency information!');
      }

      return country.currency[0];
    }

    const taxCountryCode = `${taxNumber[0]}${taxNumber[1]}`;

    const possibleCurrencies = Util.Currency.currencies.filter((currency) => {
      return (
        currency.symbol === totalAsString[0] &&
        currency.code.includes(taxCountryCode)
      );
    });

    if (possibleCurrencies.length > 1) {
      throw new Error('Could not retrieve currency information!');
    }

    const [retrievedCurrency] = possibleCurrencies;

    this.cachedCurrency = retrievedCurrency.code;
    return retrievedCurrency.code;
  }

  private getItemName = (itemNode: CheerioElement) => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    const nameNode = $(itemNode)
      .find('td.LineItemTitle')
      .first();

    return nameNode.text().trim();
  };

  private getItemDetails = (itemNode: CheerioElement) => {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const detailsNode = $(itemNode)
      .find('td.BodyTextTotalsValue')
      .first();

    if (!detailsNode) {
      throw new Error('Product details could not be retrieved');
    }

    const amountAsString = $('.BodyTextTotalsValue div:not(.SubText)')
      .first()
      .text()
      .trim()
      .replace(/^Total:\s+/, '');

    return {
      amount: this.formatCurrency(amountAsString),
      currency: this.getCurrency(),
      quantity: 1,
    };
  };

  private getItem = (itemNode: CheerioElement) => {
    return {
      description: this.getItemName(itemNode),
      ...this.getItemDetails(itemNode),
    };
  };

  getDate() {
    return new Date();
  }

  getId() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);

    return $('.SubText[style="width: 250px;"]')
      .filter((index, node) => {
        return $(node)
          .text()
          .trim()
          .startsWith('Invoice:');
      })
      .first()
      .text()
      .replace('Invoice:', '')
      .trim();
  }

  getItems() {
    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const nodes = $('tr.DetailsBox').filter((index, node) => {
      return (
        $(node).find('.LineItemTitle').length === 1 &&
        $(node).find('.BodyTextTotalsValue').length === 1
      );
    });

    return Array.from(nodes).map(this.getItem);
  }

  getTaxNumber() {
    if (this.cachedTaxNumber) {
      return this.cachedTaxNumber;
    }

    const $ = this.engine.domParser.parse(this.engine.state.email
      .html as string);
    const companyInfo = $('td.SubText[colspan="3"]')
      .first()
      .text();

    const taxNumber = companyInfo
      .split('\n')
      .join('')
      .replace(/\t+/g, '\n')
      .split('\n')
      .filter((str) => {
        return !str.startsWith('Valve') && !str.startsWith('Please');
      })
      .join('')
      .split(':')
      .filter((str: string) => {
        return !/\s/g.test(str.trim());
      })
      .join('')
      .trim();

    this.cachedTaxNumber = taxNumber;
    return taxNumber;
  }

  getTaxes() {
    this.getTaxNumber();
    const total = this.getTotal();

    const taxAmount = (total - total / 1.2) / 1000;

    const tax = {
      amount: Util.roundToDecimal(taxAmount, 3) * 1000,
      currency: this.getCurrency(),
      description: 'VAT',
      taxNumber: this.getTaxNumber(),
    };

    return [tax];
  }

  getTotal() {
    return this.formatCurrency(this.getTotalAsString());
  }
}
