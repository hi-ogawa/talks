# Understanding `use cache` through React's RSC APIs

**Goal**: RSC education at the API level. The surprise is that `use cache` is just underlying RSC APIs stitched together.

---

## 1. RSC Basics: The Foundation (demo1)

The fundamental RSC flow most developers know:

**TODO: diagram — basic RSC flow (from diagrams.md "basic flow")**

```
React Tree  →  renderToReadableStream  →  RSC Payload  →  createFromReadableStream  →  React Tree
(server)                                  (wire format)                                 (client)
```

```tsx
// Server: React tree with Server Components
function ServerComponent() {
  return (
    <div>
      <span>{Math.random()}</span>
    </div>
  );
}
const tree = <ServerComponent />;

// Serialize: Server Components evaluated, result serialized
const stream = renderToReadableStream(tree);
// → 0:["$","div",null,{"children":["$","span",null,{"children":0.123}]}]

// Client: Restore React tree (Server Components already evaluated)
const restored = await createFromReadableStream(stream);
// → { $$typeof: Symbol(react.element), type: "div", props: { children: ... } }
```

**Key point**: Server Components are evaluated once during `renderToReadableStream`. The result is serializable and restorable.

---

## 2. First Twist: Round-trip within RSC Environment

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

```tsx
// On server: serialize
const stream = renderToReadableStream(<ServerComponent />);

// Also on server: deserialize (restore without re-evaluation!)
const restored = await createFromReadableStream(stream);
```

**Why this matters**: You can save the RSC payload somewhere (cache, disk, etc.) and restore it later without re-running Server Components.

---

## 3. Second Twist: `encodeReply` and the `$T` Marker

`encodeReply` is typically used for Server Actions (encoding function arguments). But with `temporaryReferences`, it does something special:

```tsx
const args = [{ message: "hello", children: <DynamicChild /> }];

const tempRefs = createTemporaryReferenceSet();
const encoded = await encodeReply(args, { temporaryReferences: tempRefs });

// Result:
[{ message: "hello", children: "$T" }];
//                              ↑
//              React element becomes "$T" marker!
//              (stored in WeakMap, not serialized)
```

**What happens**:

- Serializable values (`message`) → included in output
- React elements (`children`) → replaced with `$T`, stored in WeakMap

The `$T` marker creates a "hole" — dynamic content is excluded from serialization.

---

## 4. The Punch Line: `use cache` = APIs Stitched Together

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

## 5. The Full Round-trip (demo4)

```
1. Original args:
   [{ message: "hello", children: <DynamicChild /> }]

2. encodeReply (cache key):
   [{"message":"hello","children":"$T"}]
   └─ message: part of cache key
   └─ children: excluded! ($T)

3. decodeReply → CachedParent():
   <>
     <span>static: 1737123456789</span>   ← Date.now() evaluated ONCE
     <span>message: hello</span>
     [Proxy]                               ← children = opaque placeholder
   </>

4. renderToReadableStream (cache value):
   0:[...,"static: 1737123456789",...,"$T0:0:children"]
   └─ static timestamp: baked into cache
   └─ children: excluded! ($T0:0:children)

5. createFromReadableStream (restore):
   <>
     <span>static: 1737123456789</span>   ← from cache (same timestamp!)
     <DynamicChild />                      ← restored from WeakMap!
   </>
```

**The magic**:

- `message` changes → new cache key → new cache entry
- `children` changes → same cache key → static shell reused, children punches through

---

## Visual Summary

```
┌──────────────────────────────────────────────────────────────────┐
│  INPUT: <CachedParent message="hello"><DynamicChild/></CachedP>  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  CACHE KEY (via encodeReply)                                     │
│  {"message":"hello","children":"$T"}                             │
│                               ────                               │
│                            excluded!                             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  CACHE VALUE (via renderToReadableStream)                        │
│  ["static: 1737123456789", "message: hello", "$T0"]              │
│   ─────────────────────────────────────────   ────               │
│              static shell cached!          excluded!             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  OUTPUT (via createFromReadableStream)                           │
│  <span>static: 1737123456789</span>  ← cached (same every time)  │
│  <span>message: hello</span>                                     │
│  <DynamicChild />                    ← fresh (from WeakMap)      │
└──────────────────────────────────────────────────────────────────┘
```

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

## References

- Demo code: `examples/starter/src/demo.tsx` (demo4)
- Cache runtime: `examples/starter/src/use-cache-runtime.tsx`
- React internals: see `notes/react-internal.md`
