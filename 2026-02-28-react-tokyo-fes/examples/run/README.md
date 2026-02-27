# Demo of code block examples

## How to run

```sh
$ pnpm -C examples/run vite-run src/demo-rsc.tsx
```

## Update README snapshots

```sh
$ pnpm -C examples/run update-readme
```

The output blocks are generated between `<!-- demo:...:start -->` and `<!-- demo:...:end -->` markers.

## Examples

### Demo 1.1

- Code: [src/demo-rsc.tsx](./src/demo-rsc.tsx)

<!-- demo:demo-1-1:start -->

```sh
$ pnpm -C examples/run -s vite-run src/demo-rsc.tsx
[vite] connected.
========================================================
Step 1/3: Server Component Node
========================================================
reactNode =
  {
    '$$typeof': Symbol(react.transitional.element),
    type: [AsyncFunction: ServerComponent],
    key: null,
    ref: null,
    props: {}
  }

========================================================
Step 2/3: RSC Stream Payload (renderToReadableStream)
========================================================
rscStream =
  0:["$","div",null,{"children":["$","span",null,{"children":0.5822468487872805}]}]


========================================================
Step 3/3: React Node on Client (createFromReadableStream)
========================================================
reactNode =
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
        props: { children: 0.5822468487872805 }
      }
    }
  }
```

<!-- demo:demo-1-1:end -->

### Demo 1.2

- Code: [src/demo-server-function-arguments.tsx](./src/demo-server-function-arguments.tsx)

#### Simple

<!-- demo:demo-1-2-simple:start -->

```sh
$ pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx simple
[vite] connected.
========================================================
Step 1/3: Server Function Arguments
========================================================
args =
  [ { greet: 'hi' } ]

========================================================
Step 2/3: encodeReply Result
========================================================
body =
  [{"greet":"hi"}]

========================================================
Step 3/3: decodeReply Result
========================================================
args =
  [ { greet: 'hi' } ]
```

<!-- demo:demo-1-2-simple:end -->

#### Form

<!-- demo:demo-1-2-form:start -->

```sh
$ pnpm -C examples/run -s vite-run src/demo-server-function-arguments.tsx form
[vite] connected.
========================================================
Step 1/3: Server Function Arguments
========================================================
args =
  [ FormData { greet: 'hey' } ]

========================================================
Step 2/3: encodeReply Result
========================================================
body =
  FormData { '0': '["$K1"]', '1_greet': 'hey' }

========================================================
Step 3/3: decodeReply Result
========================================================
args =
  [ FormData { greet: 'hey' } ]
```

<!-- demo:demo-1-2-form:end -->

### Demo 2.1

- Code: [src/demo-use-cache.tsx](./src/demo-use-cache.tsx)

<!-- demo:demo-2-1:start -->

```sh
$ pnpm -C examples/run -s vite-run src/demo-use-cache.tsx
[vite] connected.
Run #1
========================================================
Step 1/5: Encode Args as Cache Key (encodeReply)
========================================================
args =
  [
    {
      children: {
        '$$typeof': Symbol(react.transitional.element),
        type: [Function: DynamicChild],
        key: null,
        ref: null,
        props: {}
      }
    }
  ]

encodedArgs =
  [{"children":"$T"}]
clientTempRefs =
  Map(3) {
    '$0' => [
      {
        children: {
          '$$typeof': Symbol(react.transitional.element),
          type: [Function: DynamicChild],
          key: null,
          ref: null,
          props: {}
        }
      }
    ],
    '$0:0' => {
      children: {
        '$$typeof': Symbol(react.transitional.element),
        type: [Function: DynamicChild],
        key: null,
        ref: null,
        props: {}
      }
    },
    '$0:0:children' => {
      '$$typeof': Symbol(react.transitional.element),
      type: [Function: DynamicChild],
      key: null,
      ref: null,
      props: {}
    }
  }

cache = miss

========================================================
Step 2/5: Decode Arguments (decodeReply)
========================================================
decodedArgs =
  [ { children: [Function (anonymous)] } ]
serverTempRefs =
  WeakMap { <items unknown> }
Note: [Function (anonymous)] is a temporary reference proxy for encoded $T.

========================================================
Step 3/5: Execute Original Function
========================================================
result =
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
          props: { children: [ 'static: ', '2026-02-27T04:10:16.178Z' ] }
        },
        [Function (anonymous)]
      ]
    }
  }

========================================================
Step 4/5: Serialize Result and Cache (renderToReadableStream)
========================================================
stream =
  0:[["$","span",null,{"children":["static: ","2026-02-27T04:10:16.178Z"]}],"$T0:0:children"]
Note: static timestamp is baked into the cached RSC payload.
Note: temporary reference proxy is encoded back to $T in the payload.

========================================================
Step 5/5: Deserialize Cached RSC Stream (createFromReadableStream)
========================================================
finalResult =
  [
    {
      '$$typeof': Symbol(react.transitional.element),
      type: 'span',
      key: null,
      ref: null,
      props: { children: [ 'static: ', '2026-02-27T04:10:16.178Z' ] }
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
Step 1/5: Encode Args as Cache Key (encodeReply)
========================================================
args =
  [
    {
      children: {
        '$$typeof': Symbol(react.transitional.element),
        type: [Function: DynamicChild],
        key: null,
        ref: null,
        props: {}
      }
    }
  ]

encodedArgs =
  [{"children":"$T"}]
clientTempRefs =
  Map(3) {
    '$0' => [
      {
        children: {
          '$$typeof': Symbol(react.transitional.element),
          type: [Function: DynamicChild],
          key: null,
          ref: null,
          props: {}
        }
      }
    ],
    '$0:0' => {
      children: {
        '$$typeof': Symbol(react.transitional.element),
        type: [Function: DynamicChild],
        key: null,
        ref: null,
        props: {}
      }
    },
    '$0:0:children' => {
      '$$typeof': Symbol(react.transitional.element),
      type: [Function: DynamicChild],
      key: null,
      ref: null,
      props: {}
    }
  }

cache = hit (skip Steps 2-4)

========================================================
Step 5/5: Deserialize Cached RSC Stream (createFromReadableStream)
========================================================
finalResult =
  [
    {
      '$$typeof': Symbol(react.transitional.element),
      type: 'span',
      key: null,
      ref: null,
      props: { children: [ 'static: ', '2026-02-27T04:10:16.178Z' ] }
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

<!-- demo:demo-2-1:end -->
