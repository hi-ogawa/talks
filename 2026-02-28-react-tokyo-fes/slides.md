---
theme: default
transition: slide-left
---

React RSC API and `use cache` mechanism

---

Basic concepts of RSC: Server component rendering

- `react-server` conditioned environment: React VDOM tree -> RSC stream
  - `renderToReadableStream from react-server-dom/server`
  - "server component" gets evaluted into dom primitive
  - "client comopnent" exists only as "refernece metadata"
- SSR environment: RSC stream -> React VDOM tree -> HTML stream
  - `createFromReadableStream from react-server-dom/client`
  - "client component reference metadat" is revived into actual component function.
  - `react-dom/server` provides traditional SSR i.e. React tree -> HTML
- Client environment: RSC stream -> React VDOM tree -> mount/hydrate DOM element
  - `createFromReadableStream from react-server-dom/client` (same as SSR)
  - `react-dom/client` provides traditional CSR i.e. React tree -> dom element

<!--

TODO

react-server-dom-xxx
- react-server-dom-webpack
- react-server-dom-turbopack
- react-server-dom-parcel

diagrams in
- https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc#basic-concepts
- https://github.com/hi-ogawa/vite-plugins/discussions/606

TODO
example: code
example: jsx -> rsc payload (string)

-->

---

Basic concepts of RSC: Server action/function

(might skip?)
- On browser (server function caller)
  - `encodeReply(args, { temporaryReferences }))` (encode server function call arguments)
  - `createTemporaryReferenceSet` (secret source)
- On server (server function handler)
  - `decodeReply(body, { temporaryReferences })`

<!--

TODO

Without createTemporaryReferenceSet

example: code
example: arguments -> encoded data example (formData?)

With createTemporaryReferenceSet

-->

---

(First twist)

Using `createFromReadableStream` in `react-server` environment

- React VDOM tree -> RSC stream -> React VDOM tree
- `renderToReadableStream from react-server-dom/server`
- `createFromReadableStream from react-server-dom/client`

This allows a way to:
- serialize React tree into RSC stream
  (here Server component is evaluated and becomes "dom primitive")
- serialized RSC stream can be saved anywhere
- restore RSC stream back to React tree.
  This doesn't involve Server component evaluation.
  we get back "dom primitive" form of vdom tree (+ optionally "client component reference" and "server function")

<!--

TODO: example

 -->

---

(Second twist)

using `encodeReply(args, { temporaryReferences })` to serialize "cached" function arguments,
and use it as cache key. What does this allows? TODO

- there's a fucntion (component) to cache by function argument
  - function argument as cache key

```js
function cachedFunction(arg) {
  "use cache";
  return {
    static: Date.now()
    dynamic: arg
  }
}

cachedFunction({ arg: Date.now })
```

```js
function CachedParent({ children }) {
  "use cache";
  return <>
    static: {Date.now()}
    dynamic: {children}
  </>
}

function DynamicChild() {
  return <>{Date.now()}</>
}

<CachedParent>
  <DynamicChild />
</CachedParent>
```

---

Two ideas combined

Actual transform example?
