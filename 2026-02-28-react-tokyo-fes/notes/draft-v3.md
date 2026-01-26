# 1. Learning RSC API

## 1.0. React RSC Package Structure

TODO: `react-server-dom-xxx` packages are React's RSC runtime — the low-level APIs that power Server Components. The `xxx` suffix varies by bundler: `webpack` for Next.js, `turbopack`, `parcel`, etc. Frameworks abstract these away, but they're what make `"use client"`, `"use server"` and `"use cache"` work under the hood.

This poster explores these APIs directly. We'll see how each one works in isolation (Part 1), then how they combine to implement `use cache` (Part 2).

```js

react-server-dom-xxx/ (webpack, turbopack, parcel, ...)
├── server.edge.js, server.node.js, server.browser.js
│   ├─▸ renderToReadableStream
│   ├─▸ decodeReply
│   └─▸ createTemporaryReferenceSet
│
└── client.edge.js, client.node.js, client.browser.js
    ├─▸ createFromReadableStream
    ├─▸ encodeReply
    └─▸ createTemporaryReferenceSet



```

**Key insight**: `client` here means "consumer of RSC stream", not "browser". You can use `client.edge.js` on the server to deserialize RSC payloads!

## 1.1. Server Component Rendering

TODO: React server component is a new rendering model where components are executed on the server aheads of time serializing into a streaming format. This serialized data can be sent anywhere and then restored on the browser for CSR, or on the same server for SSR. The key APIs are `renderToReadableStream` and `createFromReadableStream`. "client" in `react-server-dom-xxx/client` doesn't mean "browser", but it means "consumer of RSC stream", which includes SSR.

```tsx
import { renderToReadableStream } from "react-server-dom-xxx/server";

function ServerComponent() {
  return <div>{Math.random()}</div>;
}
const reactNode = <ServerComponent />;

const rscStream = renderToReadableStream(reactNode);
```

```tsx
import { createFromReadableStream } from "react-server-dom-xxx/client";

const reactNode = await createFromReadableStream(rscStream);

// == CSR ==
import { createRoot, hydrateRoot } from "react-dom/client";
hydrateRoot(document, reactNode);

// == SSR ==
import { renderToReadableStream } from "react-dom/server";
const htmlStream = await renderToReadableStream(reactNode);
```

```js
//
{
  '$$typeof': Symbol(react.transitional.element),
  type: [AsyncFunction: ServerComponent],
  key: null,
  ref: null,
  props: {}
}

//
0:["$","div",null,{"children":["$","span",null,{"children":0.8033}]}]

// equivalent to <div>{0.8033}</div>
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
      props: { children: 0.8033 }
    }
  }
}
```

## 1.2. Server Function Handling

TODO: Server functions need to receive arguments from the browser. React provides `encodeReply` and `decodeReply` to serialize function arguments over HTTP. Plain objects become JSON strings; FormData stays as FormData. The framework handles the HTTP transport — React only handles serialization.

This encode/decode pair mirrors the render/restore pair from 1.1. Both are round-trip serialization mechanisms built into React's RSC runtime.

Example

```tsx
"use client";

import { actionSimple } from "./actions";
actionSimple({ greet: "hi" });

import { actionForm } from "./actions";
const formData = new FormData();
formData.set("greet", "hey");
actionForm(formData);
```

```tsx
"use client";
import { actionSimple, actionForm } from "./actions";

actionSimple({ message: "hello" });

const formData = new FormData();
formData.set("message", "hello");
actionForm(formData);
```

```js
[{ greet: "hi" }];

FormData {
  "0": "$K1",
  "1_greet": "hey"
}
```

Framework integration

```tsx
// == "React Client" environment (browser) ==

import { encodeReply } from "react-server-dom-xxx/client";

const body = await encodeReply(args);
const response = await fetch("/...endpoint...", {
  method: "POST",
  body,
});

import { decodeReply } from "react-server-dom-xxx/server";

const args = await decodeReply(request.body);
// ...invoke server action with `args` ...
```

# 2. Implementing "use cache"

## 2.1.

TODO: you can call `createFromReadableStream` on the server, not just in "React client" environment (CSR / SSR). This means you can serialize a React tree, store it somewhere (memory, disk, Redis), and restore it later without re-executing the Server Components. The serialized payload acts as a cache.

But what about dynamic children passed to a cached component? React solves this with "temporary references". By encoding "arguments" with `encodeReply`, React elements are replaced with `$T` placeholders and stored in a "temporary references" map — excluded from the cache key and cache value. On restore, the placeholders are filled with the latest children from the "temporary reference" map.

`use cache` is simply these four APIs stitched together: `encodeReply` creates cache keys (with $T holes), `decodeReply` restores args for execution, `renderToReadableStream` serializes results (with $T holes), and `createFromReadableStream` restores from cache (filling $T holes). The `temporaryReferences` mapping is the glue.

Example

```tsx
function CachedParent({ message }) {
  "use cache";
  return (
    <>
      <span>static: {new Date().toISOString()}</span>
      {children}
    </>
  );
}

function DynamicChild() {
  return <span>dynamic: {new Date().toISOString()}</span>
}

// Composing static shell and dynamic child
<CachedParent>
  <DynamicChild />
</CachedParent>

// ⬇️ "use cache" transform
//    (higher order function wrapper)

const CacheParent_wrapped = __cache_wrapper__(CachedParent)

<CacheParent_wrapped>
  <DynamicChild />
</CacheParent_wrapped>

// ⬇️ Rendering means executing component function with `props` as arguments.
CacheParent_wrapped({ children: <DynamicChild /> })
```

```tsx
async function __cache_wrapper__(originalFn) {
  const cache = new Map<string, ReadableStream>();

  return (...args) => {
    // 1. Encode `args` as cache key.
    const clientTempRefs = createClientTemporaryReferenceSet();
    const encodedArgs = await encodeReply(args, { temporaryReferences: clientTempRefs });

    // Check cache
    if (!cache.has(encodedArgs)) {
      // 2. Decode arguments back
      const serverTempRefs = createTemporaryReferenceSet();
      const decodedArgs = await decodeReply(encodedArgs, { temporaryReferences: serverTempRefs });

      // 3. Execute original function
      const result = originalFn(...decodedArgs);

      // 4. Serialize result into RSC stream and set cache
      const stream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
      cache.set(encodedArgs, stream);
    }

    // 5. Deserialize RSC stream
    const stream = cache.get(encodedArgs);
    const finalResult = createFromReadableStream(stream, { temporaryReferences: clientTempRefs });
    return finalResult;
  };
}
```

```js
args = [{ children: <DynamicChild />  }]

// 1
encodedArgs = [{"children":"$T"}]
clientTempRefs = { "$T" => <DynamicChild /> }

// 2
decodedArgs = [{ children: (temporaryReferenceProxy) }]
serverTempRefs = { (temporaryReferenceProxy) => "$T" }

// 3.
result = <>
  <span>static: {"2026-01-24T08:14:14.537Z"}</span>
  {(temporaryReferenceProxy)}
</>

// 4.
stream = 0:[["$","span",null,{"children":["static: ","2026-01-24T08:14:14.537Z"]}],"$T0:0:children"]

// 5.
finalResult = <>
  <span>static: {"2026-01-24T08:14:14.537Z"}</span>
  <DynamicChild />
</>
```

## 2.2 Take away and Vite Implementation

TODO: The runtime mechanism of `use cache` is made by beautiful combinations of four fundamental RSC APIs, which is available from `react-server-dom-*` pacakges. `use cache` is a React feature, not just Next.js. The same RSC APIs work in any framework. Demo implementation uses `@vitejs/plugin-rsc` — no Next.js required. What Next.js adds on top: `fetch()` caching integration, `revalidateTag()`/`revalidatePath()`, and build-time cache persistence. The core mechanism (4 APIs + temporaryReferences) is pure React.

TODO: QR code to reference (demo repo, etc..)
