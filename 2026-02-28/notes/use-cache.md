## React API

- `renderToReadableStream` (`react-server-dom/server`)
- `createFromReadableStream` (`react-server-dom/client`)
- `encodeReply` (`react-server-dom/server`)
- `decodeReply` (`react-server-dom/client`)
- `createTemporaryReferenceSet` (`react-server-dom/server`)
- `createTemporaryReferenceSet` (`react-server-dom/client`)

## `renderToReadableStream` / `createFromReadableStream`

### Deserialize on react client

VDOM (Server component, client component reference)
  ⇓  (evaluate server compoment: `renderToReadableStream`)
RSC Stream 
  ⇓  (revive client component reference: `createFromReadableStream`)
VDOM (client component)

### Deserialize back on react server

VDOM (Server component, client component reference)
  ⇓  (evaluate server compoment `renderToReadableStream`)
RSC Stream 
  ⇓  (revive client component reference: `createFromReadableStream`)
VDOM (client component _reference_)

This is achieved by passing different "bundler map" for `createFromReadableStream`.

## `encodeReply` / `decodeReply`

- `encodeReply(args, { temporaryReferences })`
- `decodeReply(args, { temporaryReferences })`

```js
const encoded = await encodeReply(args, { temporaryReferences })
const decoded = await encodeReply(args, { temporaryReferences })
```

### Why "temporary references"?

TODO

## Transform

Internally it's more or less function decorator.

- input

```ts
function Page(props) {
  "use cache"

  return <div>
    <h1>Static shell</h1>
    {props.children}
  </div>
}
```

- output

```ts
import __use_cache_runtime__ from "...";

const Page = __use_cache_runtime__(function Page(...) { ... })
```
