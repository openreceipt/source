import EventManager from './EventManager';

describe('EventManager', () => {
  it('should fire a single event', async () => {
    const EVENT_NAME = 'my-event';
    const eventManager = new EventManager();
    const spy = jest.fn();
    eventManager.addListener(EVENT_NAME, spy);
    await eventManager.fireEvent(EVENT_NAME);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should fire a before event', async () => {
    const EVENT_NAME = 'my-event';
    const eventManager = new EventManager();
    const beforeSpy = jest.fn();

    eventManager.addListener(`before:${EVENT_NAME}`, beforeSpy);
    await eventManager.fireEvent(EVENT_NAME);
    expect(beforeSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire an after event', async () => {
    const EVENT_NAME = 'my-event';
    const eventManager = new EventManager();
    const afterSpy = jest.fn();

    eventManager.addListener(`after:${EVENT_NAME}`, afterSpy);
    await eventManager.fireEvent(EVENT_NAME);
    expect(afterSpy).toHaveBeenCalledTimes(1);
  });

  it('should fire lifecycle events correctly', async () => {
    const EVENT_NAME = 'my-event';
    const eventManager = new EventManager();

    let result: number[] = [];

    const beforeSpy = jest.fn(async () => {
      result.push(1);
      return await Promise.resolve();
    });
    const spy = jest.fn(async () => {
      result.push(2);
      return await Promise.resolve();
    });
    const afterSpy = jest.fn(async () => {
      result.push(3);
      return await Promise.resolve();
    });

    eventManager.addListener(`before:${EVENT_NAME}`, beforeSpy);
    eventManager.addListener(EVENT_NAME, spy);
    eventManager.addListener(`after:${EVENT_NAME}`, afterSpy);
    await eventManager.fireEvent(EVENT_NAME);

    expect(result).toEqual([1, 2, 3]);
    expect(beforeSpy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(afterSpy).toHaveBeenCalledTimes(1);
  });
});
