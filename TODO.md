# TODO

---

Create an `events` package for handling events in the engine i.e. with `before` and `after` hooks but without any commands

```typescript
enum Events {
  'BOOT:LOAD_CONFIG',
  'BOOT:LOAD_PLUGINS',
  'PARSE_MAIL',
  'SELECT_PLUGIN',
  'RUN_PLUGIN',
}
```

---

Make specific methods on Parser

```typescript
interface Parser {
  getItems(): Item[];
  getDate(): string;
  getId(): string;
  getSubtotal();
  getTaxes();
  getTotal?();
}
```

---

Improve documentation
