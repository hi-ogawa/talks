# Understanding `use cache` through React's RSC APIs

**Goal**: RSC education at the API level. The surprise is that `use cache` is just underlying RSC APIs stitched together.

---

# PART 1: RSC Basics (Poster Left Side)

## 1.1 RSC Rendering Flow (demo1)

The fundamental RSC flow most developers know:

**TODO: diagram — basic RSC flow (from diagrams.md "basic flow")**

**Code:**

```tsx
function ServerComponent() {
  return <div>{Math.random()}</div>;
}

const stream = renderToReadableStream(<ServerComponent />);
const restored = await createFromReadableStream(stream);
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

## 1.2 Server Action Flow (encodeReply/decodeReply)

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

```tsx
// Client: encode arguments for server
const encoded = await encodeReply([arg1, arg2]);
// → FormData or JSON string

// Server: decode and execute
const args = await decodeReply(requestBody);
const result = await serverAction(...args);
```

---

## 1.3 Note: React RSC Package Structure

The RSC APIs live in `react-server-dom-*` packages (webpack, turbopack, parcel, etc.):

```
react-server-dom-webpack/
├── server.edge.js      → renderToReadableStream (RSC → Stream)
├── server.node.js
├── client.edge.js      → createFromReadableStream (Stream → React)
├── client.browser.js   → encodeReply (args → FormData/JSON)
└── client.node.js
```

These are thin wrappers around the core packages:

```
packages/react-server/
└── ReactFlightServer.js       → Core serialization logic

packages/react-client/
├── ReactFlightClient.js       → Core deserialization logic
└── ReactFlightReplyClient.js  → encodeReply implementation
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
// Both on server!
const stream = renderToReadableStream(<ServerComponent />);
const restored = await createFromReadableStream(stream);
```

**Why this matters**: You can save the RSC payload somewhere (cache, disk, etc.) and restore it later without re-running Server Components.

---

## 2.2 Second Twist: `encodeReply` and the `$T` Marker

`encodeReply` is typically used for Server Actions (encoding function arguments). But with `temporaryReferences`, it does something special:

**Code:**

```tsx
const args = [{ message: "hello", children: <DynamicChild /> }];
const tempRefs = createTemporaryReferenceSet();
const encoded = await encodeReply(args, { temporaryReferences: tempRefs });
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

TODO: add brief `"use cache"` transform?

Now combine the two twists:

```tsx
function CachedParent({ children, message }) {
  "use cache";
  return (
    <>
      <span>static: {Date.now()}</span>
      <span>message: {message}</span>
      {children}
    </>
  );
}

<CachedParent message="hello">
  <DynamicChild />
</CachedParent>;
```

**The `use cache` runtime is essentially:**

```tsx
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
