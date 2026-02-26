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
========================================================
Step 1/3: Server Component Node
Purpose: React element on server environment
========================================================
{
  '$$typeof': Symbol(react.transitional.element),
  type: [AsyncFunction: ServerComponent],
  key: null,
  ref: null,
  props: {}
}

========================================================
Step 2/3: RSC Stream Payload
Purpose: renderToReadableStream output
========================================================
0:["$","div",null,{"children":["$","span",null,{"children":0.8340104797874847}]}]


========================================================
Step 3/3: Client React Node
Purpose: createFromReadableStream output
========================================================
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
========================================================
Step 1/3: Server Function Arguments
Purpose: input before encoding
========================================================
[ { greet: 'hi' } ]

========================================================
Step 2/3: encodeReply Result
Purpose: encoded arguments payload
========================================================
[{"greet":"hi"}]

========================================================
Step 3/3: decodeReply Result
Purpose: decoded arguments payload
========================================================
[ { greet: 'hi' } ]
```

#### Form

```sh
$ pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx form
[vite] connected.
========================================================
Step 1/3: Server Function Arguments
Purpose: input before encoding
========================================================
FormData {}
FormData entries: [ [ 'greet', 'hey' ] ]

========================================================
Step 2/3: encodeReply Result
Purpose: encoded arguments payload
========================================================
FormData { '0': '"$K1"', '1_greet': 'hey' }

========================================================
Step 3/3: decodeReply Result
Purpose: decoded arguments payload
========================================================
FormData {}
FormData entries: [ [ 'greet', 'hey' ] ]
```

### Demo 2.1

```sh
$ pnpm -C examples/run -s vite-run src/demo-use-cache.tsx
[vite] connected.
Run #1
========================================================
Step 1/5: Encode Args as Cache Key
Purpose: encodeReply(args)
========================================================
[{"children":"$T"}]

Cache: miss

========================================================
Step 2/5: Decode Arguments
Purpose: decodeReply(encodedArgs)
========================================================
[ { children: [Function (anonymous)] } ]
Note: [Function (anonymous)] is a temporary reference proxy for encoded $T.

========================================================
Step 3/5: Execute Original Function
Purpose: originalFn(...decodedArgs)
========================================================
{
  '$$typeof': Symbol(react.transitional.element),
  type: Symbol(react.fragment),
  key: null,
  ref: null,
  props: {
    children: [
      {
        '$$typeof': Symbol(react.transitional.element),
        type: 'span',
        key: null,
        ref: null,
        props: { children: [ 'static: ', '2026-02-26T10:12:38.227Z' ] }
      },
      [Function (anonymous)]
    ]
  }
}

========================================================
Step 4/5: Serialize Result and Cache
Purpose: renderToReadableStream(result)
========================================================
0:[["$","span",null,{"children":["static: ","2026-02-26T10:12:38.227Z"]}],"$T0:0:children"]
Note: static timestamp is baked into the cached RSC payload.
Note: temporary reference proxy is encoded back to $T in the payload.

========================================================
Step 5/5: Deserialize Cached RSC Stream
Purpose: createFromReadableStream(stream)
========================================================
[
  {
    '$$typeof': Symbol(react.transitional.element),
    type: 'span',
    key: null,
    ref: null,
    props: { children: [ 'static: ', '2026-02-26T10:12:38.227Z' ] }
  },
  {
    '$$typeof': Symbol(react.transitional.element),
    type: [Function: DynamicChild],
    key: null,
    ref: null,
    props: {}
  }
]
Note: $T in payload is restored to the latest <DynamicChild /> reference.

Run #2 (same args shape)
========================================================
Step 1/5: Encode Args as Cache Key
Purpose: encodeReply(args)
========================================================
[{"children":"$T"}]

Cache: hit (skip Steps 2-4)

========================================================
Step 5/5: Deserialize Cached RSC Stream
Purpose: createFromReadableStream(stream)
========================================================
[
  {
    '$$typeof': Symbol(react.transitional.element),
    type: 'span',
    key: null,
    ref: null,
    props: { children: [ 'static: ', '2026-02-26T10:12:38.227Z' ] }
  },
  {
    '$$typeof': Symbol(react.transitional.element),
    type: [Function: DynamicChild],
    key: null,
    ref: null,
    props: {}
  }
]
Note: $T in payload is restored to the latest <DynamicChild /> reference.
```
