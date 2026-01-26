# RSC `use cache` Deep Dive

> Research notes for poster text writing. Synthesized from:
> - `react-internal.md` - React source analysis
> - `examples/starter/src/demo.tsx` - Demo code
> - `@vitejs/plugin-rsc` - Vite RSC implementation
> - `use-cache-runtime.tsx` - Reference `use cache` runtime

## Overview

`use cache` is built from 4 RSC APIs working together with a shared `temporaryReferences` mechanism.

## The 4 APIs

All APIs come from `react-server-dom-xxx` packages (webpack, turbopack, parcel, etc.).

| API | Export Path | Direction | Purpose |
|-----|-------------|-----------|---------|
| `renderToReadableStream` | `/server` | React tree → Stream | Serialize React tree to RSC payload |
| `createFromReadableStream` | `/client` | Stream → React tree | Deserialize RSC payload back to React tree |
| `encodeReply` | `/client` | JS values → String/FormData | Serialize function arguments |
| `decodeReply` | `/server` | String/FormData → JS values | Deserialize function arguments |

**Key point**: "client" in `/client` doesn't mean "browser". It means "consumer of RSC stream", which includes SSR on the server.

## Standard RSC Flows

### Server Component Rendering (1.1)

```
[RSC environment]
  React tree (VDOM)
       ↓ renderToReadableStream
  RSC Stream (text, line-delimited rows)
       ↓
[SSR environment]              [Browser]
  ↓ createFromReadableStream     ↓ createFromReadableStream
  React tree                     React tree
  ↓ react-dom/server             ↓ react-dom/client
  HTML                           DOM
```

The RSC stream format is row-based:
```
0:["$","div",null,{"children":["$","span",null,{"children":0.8033}]}]
```

### Server Function Handling (1.2)

```
[Browser]
  function args (e.g. { message: "hello" })
       ↓ encodeReply
  String or FormData
       ↓ HTTP POST
[RSC environment]
       ↓ decodeReply
  function args
       ↓ invoke server action
  result
```

`encodeReply` output format:
- Plain objects → JSON string: `[{"message":"hello"}]`
- Contains FormData/Blob/etc → FormData with JSON in field `"0"`

## The `temporaryReferences` Mechanism

This is the key to `use cache`. It allows React elements to "punch through" serialization without being included in the serialized data.

### The Problem

When caching `<CachedParent><DynamicChild /></CachedParent>`:
- `children` prop contains `<DynamicChild />` (a React element)
- If serialized normally, `<DynamicChild />` becomes part of cache key/value
- Dynamic content would be frozen in cache

### The Solution: $T Markers

`temporaryReferences` creates a bidirectional mapping that excludes React elements from serialization.

**Client-side** (`createClientTemporaryReferenceSet`):
- Simple Map: `element → "$0:0:children"`
- When `encodeReply` sees a React element, it stores in map and outputs `$T`

**Server-side** (`createTemporaryReferenceSet`):
- WeakMap with Proxy: `Proxy → "$0:0:children"`
- When `decodeReply` sees `$T`, it creates an opaque Proxy placeholder
- The Proxy throws on any access (can only pass through as props)

### The Proxy Placeholder

From `ReactFlightServerTemporaryReferences.js`:

```javascript
const reference = Object.defineProperties(
  function () {
    throw new Error("Attempted to call a temporary Client Reference...");
  },
  { $$typeof: { value: TEMPORARY_REFERENCE_TAG } },
);
const wrapper = new Proxy(reference, proxyHandlers);
```

| Access | Result |
|--------|--------|
| `$$typeof` | Returns `TEMPORARY_REFERENCE_TAG` |
| `fn()` | **Throws** "cannot call" |
| `fn.foo` | **Throws** "cannot dot into" |
| `fn.x = 1` | **Throws** "cannot assign" |

The Proxy is a **black box** - you can only pass it through. This ensures dynamic content punches through without server-side evaluation.

## `use cache` Runtime Flow

From `use-cache-runtime.tsx`:

```typescript
async function cachedFn(...args: any[]): Promise<unknown> {
  // 1. Create cache key with encodeReply
  const clientTemporaryReferences = createClientTemporaryReferenceSet();
  const encodedArguments = await encodeReply(args, {
    temporaryReferences: clientTemporaryReferences,
  });
  // encodedArguments is the cache key
  // React elements become $T, stored in clientTemporaryReferences

  // 2. On cache miss: decode, execute, serialize
  const temporaryReferences = createTemporaryReferenceSet();
  const decodedArgs = await decodeReply(encodedArguments, {
    temporaryReferences,
  });
  // $T becomes Proxy placeholder

  // 3. Execute original function
  const result = await fn(...decodedArgs);
  // Proxy passes through as children prop

  // 4. Serialize result (cache value)
  const stream = renderToReadableStream(result, {
    temporaryReferences,
  });
  // Proxy becomes $T0:0:children in stream
  // Static values (Date.now()) are baked in

  // 5. Deserialize (on cache hit or after miss)
  const result = createFromReadableStream(stream, {
    temporaryReferences: clientTemporaryReferences,
  });
  // $T0:0:children → lookup clientTemporaryReferences → original <DynamicChild />
}
```

### Why `encodeReply` for Cache Key?

From the source comment:
> Using `renderToReadableStream` for argument serialization would serialize React elements (e.g. children props), which causes them to be included as a cache key. `encodeReply` with `temporaryReferences` replaces React elements with `$T` markers, excluding them from the cache key.

## Data Transformation Example

```jsx
// Original call
<CachedParent message="hello">
  <DynamicChild />
</CachedParent>

// args to cached function
args = [{ message: "hello", children: <DynamicChild /> }]
```

**Step 1: encodeReply (cache key)**
```
encodedArgs = [{"message":"hello","children":"$T"}]
clientTempRefs = { <DynamicChild /> → "$0:0:children" }
```

**Step 2: decodeReply**
```
decodedArgs = [{ message: "hello", children: (Proxy) }]
serverTempRefs = { (Proxy) → "$0:0:children" }
```

**Step 3: Execute function**
```jsx
result = <>
  <span>static: 2026-01-24T08:14:14.537Z</span>
  <span>message: hello</span>
  {(Proxy)}  // passes through untouched
</>
```

**Step 4: renderToReadableStream (cache value)**
```
0:[["$","span",null,{"children":["static: ","2026-01-24T08:14:14.537Z"]}],["$","span",null,{"children":["message: ","hello"]}],"$T0:0:children"]
```
- Static timestamp is baked in
- Proxy becomes `$T0:0:children`

**Step 5: createFromReadableStream**
```jsx
finalResult = <>
  <span>static: 2026-01-24T08:14:14.537Z</span>  // from cache
  <span>message: hello</span>                    // from cache
  <DynamicChild />                               // restored from clientTempRefs
</>
```

## Key Insights for Poster

1. **`use cache` is 4 APIs stitched together** - not magic, just RSC primitives combined
2. **`temporaryReferences` is the glue** - creates "holes" for dynamic content
3. **The Proxy is intentionally restrictive** - ensures dynamic content passes through without evaluation
4. **`encodeReply` vs `renderToReadableStream`** - critical choice for cache key (exclude vs include React elements)
5. **"client" doesn't mean browser** - it means "RSC stream consumer"
6. **`use cache` is a React feature, not Next.js** - works with any bundler (Vite, Parcel, etc.)

## Package Structure

```
react-server-dom-xxx/
├── server.edge.js, server.node.js, server.browser.js
│   ├── renderToReadableStream
│   ├── decodeReply
│   └── createTemporaryReferenceSet
│
└── client.edge.js, client.node.js, client.browser.js
    ├── createFromReadableStream
    ├── encodeReply
    └── createTemporaryReferenceSet  (different impl than server!)
```

Note: The `client` and `server` temporary reference implementations are different:
- Client: Simple Map storage
- Server: Proxy-based with error throwing on access

---

# Poster Text Drafts

## 1.0 React RSC Package Structure (Introduction)

### Understanding

`react-server-dom-xxx` packages provide runtime APIs for fundamental RSC features. Frameworks (Next.js, React Router, etc.) use these APIs internally and abstract them away from users.

**Why per-bundler?**

`"use client"` and `"use server"` are RSC semantics defined by React. Bundlers implement these semantics through:
1. **Transforms** — rewriting directives into module boundaries
2. **Module loading** — resolving references at runtime

The module loading part is bundler-specific:
- Webpack: `__webpack_require__`, chunk loading
- Vite: dynamic import via `__vite_rsc_require__`
- Parcel: its own resolution

Hence `react-server-dom-webpack`, `react-server-dom-parcel`, etc. — the runtime side of each bundler's RSC implementation.

See `core/rsc.ts` for the manifest that maps module IDs to bundler-specific loading:

```typescript
export function createClientManifest(options?: {...}): BundlerConfig {
  return new Proxy({}, {
    get(_target, $$id, _receiver) {
      let [id, name] = $$id.split('#')
      return {
        id: id + cacheTag,
        name,
        chunks: [],
        async: true,
      } satisfies ImportManifestEntry
    },
  })
}
```

Note: `"use cache"` doesn't concern module loading — we won't go deep into this topic in the poster.

### Poster text

`react-server-dom-xxx` packages provide runtime APIs for fundamental RSC features — the building blocks for RSC frameworks.

`"use client"` / `"use server"` are RSC semantics that bundlers implement via transforms and module loading. The `xxx` suffix (`webpack`, `parcel`, etc.) reflects the bundler-specific module loading. Frameworks abstract this away.

Part 1 covers these APIs individually. Part 2 shows how they combine to implement `use cache`.

---

## 1.1 Server Component Rendering

### Understanding

React Server Components is a rendering model where components execute on the server ahead of time, serializing into a streaming format. This serialized stream can then be sent anywhere and restored:
- Browser for CSR (hydration)
- Server for SSR (HTML generation)
- Or stored and restored later (caching)

The two APIs:
- `renderToReadableStream` — serialize React tree → RSC stream
- `createFromReadableStream` — deserialize RSC stream → React tree

Key insight: "client" in `react-server-dom-xxx/client` means "stream consumer", not "browser". You can call `createFromReadableStream` on the server (for SSR or caching).

### Poster text

React Server Components is a rendering model where components execute on the server ahead of time, serializing into a streaming format. Server API (`renderToReadableStream`) serializes a React tree into a stream. Client API (`createFromReadableStream`) deserializes it back into a React tree. ("client" here means consumer of RSC stream, including SSR.) From there:

- CSR (Client-Side Rendering): the React tree is mounted or hydrated to the DOM in the browser via `react-dom/client`
- SSR (Server-Side Rendering): the React tree is rendered to an HTML text stream on the server via `react-dom/server`

---

## 1.2 Server Function Handling

`encodeReply` serializes function arguments on browser. `decodeReply` deserializes them on the server. Plain objects become JSON-like strings; FormData and binary data is encoded as FormData. The framework handles the HTTP transport and re-rendering mechanism while React runtime only handles serialization.

---

2. Implementing `use cache`

## 2.1. Donut Pattern and Temporary References

### Understanding

**The Donut Pattern**

`use cache` enables caching a component's output while keeping passed-in children dynamic. Like a donut: the outer shell is cached (static), but the hole in the middle stays fresh (dynamic children).

```jsx
<CachedParent>      // ← static shell (cached)
  <DynamicChild />  // ← dynamic hole (fresh every render)
</CachedParent>
```

**The Problem**

If we simply serialize the entire React tree for caching, `<DynamicChild />` becomes part of the cache. Next render, we get stale children.

**The Solution: temporaryReferences**

When serializing with `encodeReply`, React elements in props are replaced with `$T` markers and stored in a separate map (not in the serialized output). This excludes them from the cache key and cache value.

On deserialization, `$T` markers are replaced with the original elements from the map — giving you fresh children every time.

**How $T works (the round-trip)**

1. **encodeReply** (client-side temp refs):
   - Sees `<DynamicChild />` in args
   - Stores: `clientTempRefs.set(<DynamicChild />, "$0:0:children")`
   - Outputs: `$T` in serialized string

2. **decodeReply** (server-side temp refs):
   - Sees `$T` in input
   - Creates opaque Proxy placeholder
   - Stores: `serverTempRefs.set(Proxy, "$0:0:children")`
   - Returns Proxy as `children` prop

3. **Function executes**:
   - Receives Proxy as `children`
   - Proxy passes through (can't inspect or call it — throws on access)
   - Result contains Proxy in the tree

4. **renderToReadableStream**:
   - Sees Proxy with `$$typeof: TEMPORARY_REFERENCE_TAG`
   - Looks up: `serverTempRefs.get(Proxy)` → `"$0:0:children"`
   - Outputs: `$T0:0:children` in stream

5. **createFromReadableStream**:
   - Sees `$T0:0:children` in stream
   - Looks up: `clientTempRefs.get("$0:0:children")` → `<DynamicChild />`
   - Returns original element in restored tree

**The Proxy is intentionally restrictive**

The server-side Proxy placeholder throws on any access:
- `proxy.foo` → throws "cannot dot into"
- `proxy()` → throws "cannot call"
- `proxy.x = 1` → throws "cannot assign"

Only `$$typeof` returns the tag (so React recognizes it). This ensures dynamic content passes through without server-side evaluation.

**Why encodeReply, not renderToReadableStream, for cache key?**

From `use-cache-runtime.tsx` comment:
> Using `renderToReadableStream` for argument serialization would serialize React elements (e.g. children props), which causes them to be included as a cache key.

`encodeReply` with `temporaryReferences` replaces React elements with `$T` — excluding them from cache key. `renderToReadableStream` would serialize them fully.

### Poster text

The entire `use cache` flow happens within the RSC environment — a self-loop using all four APIs.

**The Donut Pattern**

`use cache` enables caching a component while keeping children dynamic — like a donut with a static shell and fresh hole.

The challenge: if we serialize children into the cache, they become stale. The solution is `temporaryReferences`.

**How temporaryReferences works**

When serializing arguments with `encodeReply`, React elements become `$T` placeholders — stored in a separate map, excluded from the serialized output. `decodeReply` turns `$T` into an opaque Proxy that passes through without evaluation. When serializing the result with `renderToReadableStream`, the Proxy becomes `$T` again. Finally, `createFromReadableStream` replaces `$T` with the original fresh element from the map.

This is why `use cache` uses `encodeReply` (not `renderToReadableStream`) for cache keys — only `encodeReply` with `temporaryReferences` excludes React elements.

**The 5-step flow** (all within RSC environment)

1. `encodeReply(args)` → cache key (`children` becomes `$T`)
2. `decodeReply` → args with Proxy placeholder
3. Execute function (Proxy passes through)
4. `renderToReadableStream(result)` → cache value (Proxy becomes `$T`)
5. `createFromReadableStream` → restore, replacing `$T` with fresh children

---

## 2.2 Takeaway

### Understanding

The poster's main message: `use cache` runtime is framework-independent.

- React provides all 4 RSC APIs in `react-server-dom-xxx` packages
- The `temporaryReferences` mechanism is built into these APIs
- Any bundler/framework can implement `use cache` using these primitives
- This demo uses `@vitejs/plugin-rsc` — no Next.js required

What frameworks like Next.js add on top:
- Build-time transforms (hoisting `"use cache"` functions)
- Cache storage backends (memory, disk, Redis)
- Revalidation APIs (`revalidateTag`, `revalidatePath`)
- `fetch()` caching integration

But the core runtime — 4 APIs + `temporaryReferences` — is pure React.

### Poster text

The runtime mechanism of `use cache` is framework-independent. React provides all four RSC APIs in `react-server-dom-xxx` packages, including the `temporaryReferences` mechanism. Any framework can implement `use cache` using these primitives — this demo uses Vite with `@vitejs/plugin-rsc`.

What frameworks like Next.js add on top: build-time transforms, cache storage backends, and revalidation APIs (`revalidateTag`, etc.). But the core runtime is pure React.

You can find full demo code and resources in the repository https://github.com/hi-ogawa/react-tokyo-fes-2026-use-cache. Check it out from the QR code on the right.
