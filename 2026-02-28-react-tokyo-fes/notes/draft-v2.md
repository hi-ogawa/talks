# Understanding `use cache` through React's RSC APIs

**Goal**: RSC education at the API level. The surprise is that `use cache` is just underlying RSC APIs stitched together.

---

# PART 1: RSC Basics (Poster Left Side)

## 1.1 RSC Rendering Flow (demo1)

The fundamental RSC flow most developers know:

**TODO: diagram — basic RSC flow (from diagrams.md "basic flow")**

TODO:

- color code block / box to highlight environment difference

**Code:**

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

import { createRoot, hydrateRoot } from "react-dom/client";
hydrateRoot(document, reactNode);

import { renderToReadableStream } from "react-dom/server";
const htmlStream = await renderToReadableStream(reactNode);
```

```tsx
// == "React Server" environment ==
import { renderToReadableStream } from "react-server-dom-xxx/server";

function ServerComponent() {
  return <div>{Math.random()}</div>;
}
const reactNode = <ServerComponent />;

// once serialized, the stream can be sent to anywhere
const rscStream = renderToReadableStream(reactNode);
```

```tsx
// == CSR / SSR (aka "React Client" environment) ==

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
// == ReactNode tree on react-server environment ==



{
  '$$typeof': Symbol(react.transitional.element),
  type: [AsyncFunction: ServerComponent],
  key: null,
  ref: null,
  props: {}
}



// ==== RSC stream ====
// `ServerComponent` function is executed




0:["$","div",null,{"children":["$","span",null,{"children":0.8033}]}]




// ==== ReactNode tree for CSR / SSR ====
// equivalent to <div>{0.8033}</div>
// same react node is shared between SSR and CSR (hydration)
// thus no hydration mismatch is guaranteed.

<div>{0.8033}</div>


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

**Data transformation:**

```
┌───────────────────────────────────┐
│ React Tree (input)                │
│ <ServerComponent />               │
│   → Server Component evaluated:   │
│   <div>0.5765</div>               │
└───────────────────────────────────┘
          ↓ renderToReadableStream
┌───────────────────────────────────────────────────┐
│ RSC Payload (wire format)                         │
│ 0:["$","div",null,{"children":0.5765}]            │
└───────────────────────────────────────────────────┘
          ↓ createFromReadableStream
┌───────────────────────────────────┐
│ React Tree (output)               │
│ {                                 │
│   $$typeof: Symbol(react.element),│
│   type: "div",                    │
│   props: { children: 0.5765 }     │
│ }                                 │
└───────────────────────────────────┘
```

**Key point**: Server Components are evaluated once during `renderToReadableStream`. The result is serializable and restorable.

---

## 1.2 Server Action (encodeReply/decodeReply)

**TODO: add Server Action flow — encodeReply (client) → decodeReply (server)**

```
Client                              Server
───────                             ──────
serverAction(args)
       ↓
encodeReply(args)  →  HTTP POST  →  decodeReply(body)
       ↓                                   ↓
 FormData/JSON                      original args
```

- formData encoded to formData
- non binary data encoded to string

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
// → encodeReply([{ message: "hello" }])
// → '[{"message":"hello"}]'

const formData = new FormData();
formData.set("message", "hello");
actionForm(formData);
// → encodeReply([formData])
// → FormData { "0": "$K1", "1_message": "hello" }
```

```
        ↓ encodeReply        ↓ HTTP POST        ↓ decodeReply
```

```tsx
"use server";

async function actionSimple(data) {
  console.log(data.greet); // "hi"
}

async function actionForm(formData) {
  console.log(formData.get("greet")); // "hey"
}
```

```js
[{ greet: "hi" }];


FormData {
  "0": "$K1",
  "1_greet": "hey"
}


```

At framework level.

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

```tsx
// == "React Server" environment ==
import { decodeReply } from "react-server-dom-xxx/server";

const args = await decodeReply(request.body);
// ...invoke server action with `args` ...
```

```tsx
// == "React Client" environment (browser) ==
import { encodeReply, createFromReadableStream } from "react-server-dom-xxx/client";

createFromReadableStream(..., {
  callServer: async (id, args) => {
    const body = await encodeReply(args);
    const response = await fetch("/...server action endpoint...", {
      method: "POST",
      body,
    })
    ...
  }
})
```

```tsx
// == "React Server" environment ==
import { decodeReply } from "react-server-dom-xxx/server";

const args = await decodeReply(request.body);
// ...invoke server action with `arg`
```

---

## 1.3 Note: React RSC Package Structure

TODO: stich two boxes together where internal packages supports main server/client exports?

The RSC APIs live in `react-server-dom-*` packages (webpack, turbopack, parcel, etc.):

```
react-server-dom-xxx/
├── server.edge.js, server.node.js
│   ├─▸ renderToReadableStream
│   ├─▸ decodeReply
│   └─▸ createTemporaryReferenceSet
│
└── client.edge.js, client.node.js, client.browser.js
    ├─▸ createFromReadableStream
    ├─▸ encodeReply
    └─▸ createTemporaryReferenceSet
```

These are wrappers around the "internal" packages, which implements core logic:

https://github.com/facebook/react

```
packages/react-server/
├── ReactFlightServer.js
│   └─▸ createRequest → renderToReadableStream
└── ReactFlightReplyServer.js
    └─▸ createResponse → decodeReply

packages/react-client/
├── ReactFlightClient.js
│   └─▸ createResponse → createFromReadableStream
└── ReactFlightReplyClient.js
    └─▸ processReply → encodeReply
```

**Key insight**: `client` here means "consumer of RSC stream", not "browser". You can use `client.edge.js` on the server to deserialize RSC payloads!

---

# PART 2: `use cache` Application (Poster Right Side)

## 2.1 First Twist: Round-trip within RSC Environment

Here's something less obvious: **you can also `createFromReadableStream` on the server!**

**TODO: diagram — RSC environment self-loop (from diagrams.md)**

```
┌─────────────────────────────────────────────────────────────┐
│  RSC Environment                                            │
│                                                             │
│  React Tree  →  renderToReadableStream  →  RSC Payload      │
│      ↑                                          ↓           │
│      └────────  createFromReadableStream  ←─────┘           │
│                                                             │
│  (serialize and deserialize within the same environment!)   │
└─────────────────────────────────────────────────────────────┘
```

**Code:**

```tsx
// == "React Server" environment ==
import { renderToReadableStream } from "react-server-dom-xxx/server";
import { createFromReadableStream } from "react-server-dom-xxx/client";

const reactNode = <ServerComponent />;

const rscStream = renderToReadableStream(reactNode);

const reactNodeRestored = await createFromReadableStream(rscStream);
```

**Why this matters**: You can save the RSC payload somewhere (cache, disk, etc.) and restore it later without re-running Server Components. The restored `reactNode` can be composed like any `reactNode` as a part of server component.

---

## 2.2 Second Twist: `encodeReply` and the `$T` Marker

`encodeReply` is typically used for Server Actions (encoding function arguments). But with `temporaryReferences`, it does something special:

**Code:**

```tsx
import { encodeReply, createTemporaryReferenceSet } from "react-server-dom-xxx/client";

const args = [
  {
    greet: "hi",
    children: <DynamicChild />,
  },
];
const tempRefs = createTemporaryReferenceSet();
const encoded = await encodeReply(args, { temporaryReferences: tempRefs });

// TODO: can we do createFromReadableStream here?
// (would require whole encodeReply -> decodeReply -> renderToReadableStream?)

// TODO: or create useActionState like example in 1.2. Server Function Payload Encoding
//  and remove 2.2?
```

```js
{
  greet: "hi",
  children: "$T",
}
```

**Data transformation:**

```
┌─────────────────────────────────────────────┐
│ Input                                       │
│ [{ message: "hello", children: <Dynamic/> }]│
└─────────────────────────────────────────────┘
          ↓ encodeReply (with temporaryReferences)
┌─────────────────────────────────────────────┐
│ Output                                      │
│ [{"message":"hello","children":"$T"}]       │
│                                 ──          │
│                    React element → "$T"     │
│            (stored in WeakMap, not serialized)
└─────────────────────────────────────────────┘
```

**What happens**:

- Serializable values (`message`) → included in output
- React elements (`children`) → replaced with `$T`, stored in WeakMap

The `$T` marker creates a "hole" — dynamic content is excluded from serialization.

---

## 2.3 The Punch Line: `use cache` = APIs Stitched Together

TODO: drop `message` prop for simplicity?

TODO: add brief `"use cache"` transform? (too simplified but better than nothing)

```tsx
import __cache_wrapper from "virtual:cache-wrapper"

export const CachedParent = __cache_wrapper(function ({ children }) {
  ...
})
```

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
import {
  createTemporaryReferenceSet,
  decodeReply,
  renderToReadableStream,
} from "react-server-dom-xxx/server";
import {
  createTemporaryReferenceSet as createClientTemporaryReferenceSet,
  createFromReadableStream,
  encodeReply,
} from "react-server-dom-xxx/client";

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
// <CacheParent_wrapped><DynamicChild /></CacheParent_wrapped>
{
  '$$typeof': Symbol(react.transitional.element),
  type: [Function: CachedParent],
  key: null,
  ref: null,
  props: {
    children: {
      '$$typeof': Symbol(react.transitional.element),
      type: [Function: DynamicChild],
      key: null,
      ref: null,
      props: {}
    }
  }
}

CacheParent_wrapped({ children: <DynamicChild /> })

// 0. `CacheParent_wrapped` receives latest props
// args =>


args = [{ children: <DynamicChild />  }]


// 1
// Serialize arguments (i.e. props) as cache key.
// React element (children value) will be replaced
// as temporary reference placeholder.
// encodeReply(args, { tempRefs }) =>

encodedArgs = [{"children":"$T"}]
clientTempRefs = { "$T" => <DynamicChild /> }

// 2
// decodeReply(encodedArgs, { tempRefs }) =>
// (the proxy fakes as `reactNode`)

decodedArgs = [{ children: (temporaryReferenceProxy) }]
serverTempRefs = { (temporaryReferenceProxy) => "$T" }

// 3. execute `CachedParent`

result = <>
  <span>static: {"2026-01-24T08:14:14.537Z"}</span>
  {(temporaryReferenceProxy)}
</>

// 4. serialize `CachedParent` result as RSC stream and cache it
// replace "TemporaryReferenceProxy" with the original reference placeholder "$T"

stream = 0:[["$","span",null,{"children":["static: ","2026-01-24T08:14:14.537Z"]}],"$T0:0:children"]


// 5. restore `stream` with replacing temp ref placeholder `$T` with latest `args` (dynamic child)

finalResult = <>
  <span>static: {"2026-01-24T08:14:14.537Z"}</span>
  <DynamicChild />
</>


```

Now combine the two twists:

```tsx
function CachedParent({ message }) {
  "use cache";
  return (
    <>
      <span>static: {Date.now()}</span>
      {children}
    </>
  );
}

<CachedParent>
  <DynamicChild />
</CachedParent>;
```

**The `use cache` runtime is essentially:**

```tsx
// implemented as higher order function: cachedFn = cacheWrapper(originalFn)
async function cachedFn(...args) {
  // 1. Create cache key (children → $T, excluded!)
  const clientTempRefs = createClientTemporaryReferenceSet();
  const cacheKey = await encodeReply(args, { temporaryReferences: clientTempRefs });
  // → [{"message":"hello","children":"$T"}]

  // 2. Check cache...
  if (cache.has(cacheKey)) {
    const stream = cache.get(cacheKey);
    return createFromReadableStream(stream, { temporaryReferences: clientTempRefs });
  }

  // 3. Cache miss: decode args and execute
  const serverTempRefs = createTemporaryReferenceSet();
  const decodedArgs = await decodeReply(cacheKey, { temporaryReferences: serverTempRefs });
  const result = originalFn(...decodedArgs);

  // 4. Cache the result (children → $T, excluded!)
  const stream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
  cache.set(cacheKey, stream);

  // 5. Return (children restored from clientTempRefs!)
  return createFromReadableStream(stream, { temporaryReferences: clientTempRefs });
}
```

---

## 2.4 The Full Round-trip (demo4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Original args                                                       │
│                                                                             │
│   [{ message: "hello", children: <DynamicChild /> }]                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓ encodeReply(args, { temporaryReferences })
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Cache Key                                                           │
│                                                                             │
│   [{"message":"hello","children":"$T"}]                                     │
│                                   ──                                        │
│   message: "hello" → part of cache key                                      │
│   children: <DynamicChild /> → "$T" (EXCLUDED from cache key!)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓ decodeReply → CachedParent(decoded)
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Function Execution Result                                           │
│                                                                             │
│   <>                                                                        │
│     <span>static: 1737123456789</span>    ← Date.now() evaluated ONCE       │
│     <span>message: hello</span>                                             │
│     [Proxy]                                ← children = opaque placeholder  │
│   </>                                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓ renderToReadableStream(result, { temporaryReferences })
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Cache Value (RSC Payload)                                           │
│                                                                             │
│   0:[["$","span",null,{"children":["static: ",1737123456789]}],             │
│      ["$","span",null,{"children":["message: ","hello"]}],                  │
│      "$T0:0:children"]                                                      │
│       ──────────────                                                        │
│   static timestamp: 1737123456789 → BAKED INTO CACHE                        │
│   children: [Proxy] → "$T0:0:children" (EXCLUDED from cache value!)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓ createFromReadableStream(stream, { temporaryReferences })
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Restored Output                                                     │
│                                                                             │
│   <>                                                                        │
│     <span>static: 1737123456789</span>    ← from cache (same every time!)   │
│     <span>message: hello</span>                                             │
│     <DynamicChild />                       ← restored from WeakMap!         │
│   </>                                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The magic**:

- `message` changes → new cache key → new cache entry
- `children` changes → same cache key → static shell reused, children punches through

---

## Takeaway

`use cache` isn't magic — it's four RSC APIs working together:

| API                        | Role in `use cache`                |
| -------------------------- | ---------------------------------- |
| `encodeReply`              | Create cache key (with $T holes)   |
| `decodeReply`              | Restore args for execution         |
| `renderToReadableStream`   | Serialize result (with $T holes)   |
| `createFromReadableStream` | Restore from cache (fill $T holes) |

The `temporaryReferences` WeakMap is the glue that connects the holes on both sides.

---

## Framework-Agnostic: Vite Implementation

**`use cache` is a React feature, not just Next.js.**

The same RSC APIs work outside Next.js. Demo implementation for Vite:

- `@vitejs/plugin-rsc` — RSC support for Vite
- `use-cache-runtime.tsx` — Cache wrapper using the 4 APIs

```tsx
// Works in Vite, no Next.js required!
import cacheWrapper from "./use-cache-runtime";

const cachedFn = cacheWrapper(async (props) => {
  "use cache";
  return <ExpensiveComponent {...props} />;
});
```

**What Next.js adds on top**:

- `fetch()` caching integration
- `revalidateTag()` / `revalidatePath()`
- Build-time cache persistence

The **core mechanism** (4 APIs + temporaryReferences) is pure React.

---

## References

- Demo code: `examples/starter/src/demo.tsx` (demo4)
- Cache runtime: `examples/starter/src/use-cache-runtime.tsx`
- `@vitejs/plugin-rsc`: https://github.com/vitejs/vite-plugin-react
- React internals: see `notes/react-internal.md`
