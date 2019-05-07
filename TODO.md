# TODO

Implement a plugin system similar to Serverless'
i.e. with `before` and `after` hooks but without any commands

```typescript
enum Events {
  'BOOT:LOAD_CONFIG',
  'BOOT:LOAD_PLUGINS',
  'PARSE_MAIL',
  'SELECT_PLUGIN',
  'RUN_PLUGIN',
}
```
