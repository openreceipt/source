import FatalError from './Errors/FatalError';
import Parser, { ParserMeta } from './Parser';

type SentAtParserMap = { [sentAt: number]: typeof Parser };
type SourceAddressParserMap = { [sourceAddress: string]: typeof Parser };

export default class ParserResolver {
  protected createParserMap = <T extends keyof ParserMeta>(
    field: T,
    parsers: typeof Parser[],
  ): T extends keyof Pick<ParserMeta, 'since'>
    ? SentAtParserMap
    : SourceAddressParserMap => {
    const parserMap = parsers.reduce((result, parser) => {
      const fieldValue = parser.meta[field];
      return {
        ...result,
        [fieldValue]: parser,
      };
    }, {});

    if (!parserMap) {
      throw new FatalError('Could not load parsers');
    }

    return parserMap as T extends keyof Pick<ParserMeta, 'since'>
      ? SentAtParserMap
      : SourceAddressParserMap;
  };

  protected filterBySourceAddress = (
    sourceAddress: string,
    parsers: typeof Parser[],
  ) => {
    return parsers.filter((parser: typeof Parser) => {
      return sourceAddress.includes(parser.meta.sourceAddress);
    });
  };

  protected filterByDate = (sentAt: number, parsers: typeof Parser[]) => {
    const parserMap = this.createParserMap('since', parsers);

    const parserTimestamps = Object.keys(parserMap)
      .sort()
      .map((numberString: string) => {
        return parseInt(numberString, 10);
      });

    const differences = parserTimestamps.reduce((result, timestamp) => {
      if (timestamp > sentAt) {
        return result;
      }

      return {
        ...result,
        [sentAt - timestamp]: timestamp,
      };
    }, {}) as { [since: number]: number };

    const differenceValues = Object.keys(differences).map(
      (numberString: string) => {
        return parseInt(numberString, 10);
      },
    );
    const lowestDifference = Math.min(...differenceValues);

    const resolvedTimestamp = differences[lowestDifference] as number;

    const resolvedParser = parserMap[resolvedTimestamp];

    if (!resolvedParser) {
      return [];
    }

    return [resolvedParser];
  };

  resolve = (
    sourceAddress: string,
    sentAt: number,
    parsers: typeof Parser[],
  ) => {
    const parsersFilteredBySourceAddress = this.filterBySourceAddress(
      sourceAddress,
      parsers,
    );
    const [resolvedParser] = this.filterByDate(
      sentAt,
      parsersFilteredBySourceAddress,
    );

    return resolvedParser;
  };
}
