# Demo of code block examples

## How to run

```sh
$ pnpm -C examples/run vite-run src/demo-rsc.tsx
```

## Examples

### Demo 1.1

```sh
$ pnpm -C examples/run -s vite-run src/demo-rsc.tsx
[vite] connected.
1️⃣  <ServerComponent /> (React node on react server environment)
{
  '$$typeof': Symbol(react.transitional.element),
  type: [AsyncFunction: ServerComponent],
  key: null,
  ref: null,
  props: {}
}

2️⃣  RSC stream (renderToReadableStream result)
0:["$","div",null,{"children":["$","span",null,{"children":0.8340104797874847}]}]


3️⃣  React node on client environment (createFromReadableStream result)
{
  '$$typeof': Symbol(react.transitional.element),
  type: 'div',
  key: null,
  ref: null,
  props: {
    children: {
      '$$typeof': Symbol(react.transitional.element),
      type: 'span',
      key: null,
      ref: null,
      props: { children: 0.8340104797874847 }
    }
  }
}
```

### Demo 1.2

#### Simple

```sh
$ pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx simple
[vite] connected.
1️⃣  args (server function arguments)
[ { greet: 'hi' } ]

2️⃣  encodeReply result (encoded arguments)
[{"greet":"hi"}]

3️⃣  decodeReply result (decoded arguments)
[ { greet: 'hi' } ]
```

#### Form

```sh
$ pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx form
[vite] connected.
1️⃣  args (server function arguments)
FormData {}

2️⃣  encodeReply result (encoded arguments)
FormData { '0': '"$K1"', '1_greet': 'hey' }

3️⃣  decodeReply result (decoded arguments)
FormData {}
FormData entries: [ [ 'greet', 'hey' ] ]
```

### Demo 2.1

TODO:

```sh
$ pnpm -C examples/run -s vite-run src/demo-use-cache.tsx
```
