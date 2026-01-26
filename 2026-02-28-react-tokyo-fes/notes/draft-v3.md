Title: フレームワーク非依存な"use cache"の仕組みとViteでの実装

# 1. Learning RSC API

## 1.0. React RSC Package Structure

`react-server-dom-xxx` packages provide runtime APIs for fundamental RSC features — the building blocks for RSC frameworks.

`"use client"` / `"use server"` are RSC semantics that bundlers implement via transforms and module loading. The `xxx` suffix (`webpack`, `parcel`, etc.) reflects the bundler-specific module loading. Frameworks abstract this away.

Part 1 covers these APIs individually. Part 2 shows how they combine to implement `use cache`.

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

## 1.1. Server Component Rendering

React Server Components is a rendering model where components execute on the server ahead of time, serializing into a streaming format. Server API (`renderToReadableStream`) serializes a React tree into a stream. Client API (`createFromReadableStream`) deserializes it back into a React tree. ("client" here means consumer of RSC stream, including SSR.) From there:

- CSR (Client-Side Rendering): the React tree is mounted or hydrated to the DOM in the browser via `react-dom/client`
- SSR (Server-Side Rendering): the React tree is rendered to an HTML text stream on the server via `react-dom/server`

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
// ReactNode tree on “React Server” environment
{
  '$$typeof': Symbol(react.transitional.element),
  type: [AsyncFunction: ServerComponent],
  key: null,
  ref: null,
  props: {}
}

// Execute `ServerComponent` function
0:["$","div",null,{"children":["$","span",null,{"children":0.8033}]}]

// Same react node is used both for SSR and CSR (hydration), so no hydration mismatch.
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

`encodeReply` serializes function arguments on browser. `decodeReply` deserializes them on the server. Plain objects become JSON-like strings; FormData and binary data is encoded as FormData. The framework handles the HTTP transport and re-rendering mechanism while React runtime only handles serialization.

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

## 2.1. Donut Pattern and Temporary References

The entire `use cache` flow happens within the RSC environment — a self-loop using all four APIs.

**The Donut Pattern**

`use cache` enables caching a component while keeping children dynamic — like a donut with a static shell and fresh hole. The challenge: if we serialize children into the cache, they become stale. The solution is `temporaryReferences`.

**How temporaryReferences works**

When serializing arguments with `encodeReply`, React elements become `$T` placeholders — stored in a separate map, excluded from the serialized output. `decodeReply` turns `$T` into an opaque Proxy that passes through without evaluation. When serializing the result with `renderToReadableStream`, the Proxy becomes `$T` again. Finally, `createFromReadableStream` replaces `$T` with the original fresh element from the map. This is why `use cache` uses `encodeReply` (not `renderToReadableStream`) for cache keys — only `encodeReply` with `temporaryReferences` excludes React elements.

**The 5-step flow** (all within RSC environment)

1. `encodeReply(args)` → cache key (`children` becomes `$T`)
2. `decodeReply` → args with Proxy placeholder
3. Execute function (Proxy passes through)
4. `renderToReadableStream(result)` → cache value (Proxy becomes `$T`)
5. `createFromReadableStream` → restore, replacing `$T` with fresh children

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

// On cache hit, it runs only ‘encodeReply’ and ‘createFromReadableStream’, which produces a return value by restoring a cached ‘stream’ (static shell) with latest ‘clientTempRefs $T’ (dynamic child).
```

## 2.2 Takeaway

The runtime mechanism of `use cache` is framework-independent. React provides all four RSC APIs in `react-server-dom-xxx` packages, including the `temporaryReferences` mechanism. Any framework can implement `use cache` using these primitives — this demo uses Vite with `@vitejs/plugin-rsc`.

What frameworks like Next.js add on top: build-time transforms, cache storage backends, and revalidation APIs (`revalidateTag`, etc.). But the core runtime is pure React.

You can find full demo code and resources in the repository https://github.com/hi-ogawa/react-tokyo-fes-2026-use-cache. Check it out from the QR code on the right.
