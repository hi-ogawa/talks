# React RSC Serialization Internals

## Overview

This document analyzes the serialization/deserialization mechanisms in React Server Components:

1. **Server→Client**: `renderToReadableStream` → `createFromReadableStream`
2. **Client→Server**: `encodeReply` → `decodeReply`

**Key Finding**: These two mechanisms **share the same JSON value reference markers** but use **different wire formats**.

**Important**: The shared markers are a **convention**, not actual code reuse. The serialization functions are duplicated across files.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SHARED MECHANISM                                │
│                                                                         │
│  JSON Value Reference Markers ($ prefix system)                        │
│  - $      → REACT_ELEMENT_TYPE                                         │
│  - $$     → Escaped string (literal $)                                 │
│  - $@id   → Promise reference                                          │
│  - $Lid   → Lazy component                                             │
│  - $hid   → Server function reference                                  │
│  - $Qid   → Map                                                        │
│  - $Wid   → Set                                                        │
│  - $Kid   → FormData                                                   │
│  - $Bid   → Blob                                                       │
│  - $Ddate → Date (ISO string)                                          │
│  - $nbig  → BigInt                                                     │
│  - $T     → Temporary reference marker                                 │
│  - $Infinity, $-Infinity, $NaN, $-0, $undefined                       │
│  - $Aid, $Oid, $oid, $Uid, $Sid, $sid, $Lid, $lid, $Gid, $gid,       │
│    $Mid, $mid, $Vid → TypedArray variants                              │
│  - $Rid   → ReadableStream                                             │
│  - $rid   → ReadableStream (bytes mode)                                │
│  - $Xid   → AsyncIterable                                              │
│  - $xid   → AsyncIterator                                              │
│  - $iid   → Iterator                                                   │
│  - $Sname → Symbol                                                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│    Server → Client              │     │    Client → Server              │
│    (RSC Payload Stream)         │     │    (Server Action Reply)        │
├─────────────────────────────────┤     ├─────────────────────────────────┤
│ Wire Format:                    │     │ Wire Format:                    │
│   Row-based line-delimited      │     │   JSON string or FormData       │
│   "ID:TAG[PAYLOAD]\n"           │     │                                 │
├─────────────────────────────────┤     ├─────────────────────────────────┤
│ Files:                          │     │ Files:                          │
│ • ReactFlightServer.js          │     │ • ReactFlightReplyClient.js     │
│   (serialization)               │     │   (serialization)               │
│ • ReactFlightClient.js          │     │ • ReactFlightReplyServer.js     │
│   (deserialization)             │     │   (deserialization)             │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

## Detailed Analysis

### 1. Server→Client: RSC Payload Stream

**Serialization**: `packages/react-server/src/ReactFlightServer.js`
**Deserialization**: `packages/react-client/src/ReactFlightClient.js`

#### Wire Format

Each row follows the pattern:

```
<HEX_ID>:<TAG>[PAYLOAD]\n
```

Example rows:

```
0:{"name":"John","children":"$1"}
1:I{"id":"./ClientComponent.js","name":"default"}
2:E{"digest":"abc123","message":"Error occurred"}
:Hpreload["./style.css"]
```

#### Row Tags (Single Character)

| Tag                                                             | Purpose                       | Handler                 |
| --------------------------------------------------------------- | ----------------------------- | ----------------------- |
| (none)                                                          | Default JSON model            | `resolveModel()`        |
| `I`                                                             | Client module import          | `resolveModule()`       |
| `H`                                                             | Resource hint (preload, etc.) | `resolveHint()`         |
| `E`                                                             | Error                         | `resolveErrorModel()`   |
| `T`                                                             | Text chunk                    | `resolveText()`         |
| `R`                                                             | ReadableStream                | `startReadableStream()` |
| `r`                                                             | ReadableStream (bytes)        | `startReadableStream()` |
| `X`                                                             | AsyncIterable                 | `startAsyncIterable()`  |
| `x`                                                             | AsyncIterator                 | `startAsyncIterable()`  |
| `C`                                                             | Stream close signal           | `stopStream()`          |
| `A`, `O`, `o`, `U`, `S`, `s`, `L`, `l`, `G`, `g`, `M`, `m`, `V` | TypedArray variants           | `resolveTypedArray()`   |

#### Serialization Functions (ReactFlightServer.js:2787+)

```javascript
function serializeByValueID(id: number): string {
  return '$' + id.toString(16);  // e.g., "$1a"
}

function serializeLazyID(id: number): string {
  return '$L' + id.toString(16); // Lazy component reference
}

function serializePromiseID(id: number): string {
  return '$@' + id.toString(16); // Promise reference
}

function serializeServerReferenceID(id: number): string {
  return '$h' + id.toString(16); // Server function reference
}

function serializeNumber(number: number): string | number {
  if (number === Infinity) return '$Infinity';
  if (number === -Infinity) return '$-Infinity';
  if (Number.isNaN(number)) return '$NaN';
  if (number === 0 && 1 / number === -Infinity) return '$-0';
  return number;
}
```

### 2. Client→Server: Server Action Reply

**Serialization**: `packages/react-client/src/ReactFlightReplyClient.js`
**Deserialization**: `packages/react-server/src/ReactFlightReplyServer.js`

#### Wire Format

Returns either:

- **JSON string** - For simple values without binary data
- **FormData** - When binary data (Blobs, Streams, TypedArrays) is present

Field naming in FormData:

- `{prefix}0` - Root JSON value
- `{prefix}N` - Outlined chunk N
- `{prefix}N_fieldName` - FormData sub-fields

#### Serialization Functions (ReactFlightReplyClient.js:98+)

```javascript
// Same markers as server!
function serializeByValueID(id: number): string {
  return '$' + id.toString(16);
}

function serializePromiseID(id: number): string {
  return '$@' + id.toString(16);
}

function serializeServerReferenceID(id: number): string {
  return '$h' + id.toString(16);
}

function serializeTemporaryReferenceMarker(): string {
  return '$T';
}

function serializeMapID(id: number): string {
  return '$Q' + id.toString(16);
}

function serializeSetID(id: number): string {
  return '$W' + id.toString(16);
}

// ... same $D, $n, $Infinity, etc.
```

### 3. Parsing Comparison

Both `ReactFlightClient.js` and `ReactFlightReplyServer.js` have nearly identical `parseModelString` functions:

```javascript
// Both files share this pattern:
function parseModelString(response, obj, key, value): any {
  if (value[0] === '$') {
    switch (value[1]) {
      case '$': return value.slice(1);           // Escaped $
      case '@': /* Promise */ ...
      case 'h': /* Server Reference */ ...
      case 'T': /* Temporary Reference */ ...
      case 'Q': /* Map */ ...
      case 'W': /* Set */ ...
      case 'K': /* FormData */ ...
      case 'D': return new Date(Date.parse(value.slice(2)));
      case 'n': return BigInt(value.slice(2));
      case 'I': return Infinity;
      case '-': return value === '$-0' ? -0 : -Infinity;
      case 'N': return NaN;
      case 'u': return undefined;
      // TypedArrays...
      // Streams...
    }
  }
  return value;
}
```

## Key Files Reference

| File                        | Package      | Purpose                       |
| --------------------------- | ------------ | ----------------------------- |
| `ReactFlightServer.js`      | react-server | Server→Client serialization   |
| `ReactFlightClient.js`      | react-client | Server→Client deserialization |
| `ReactFlightReplyClient.js` | react-client | Client→Server serialization   |
| `ReactFlightReplyServer.js` | react-server | Client→Server deserialization |

## Code Reuse Analysis

### No Shared Serialization Module

The `serialize*` functions are **duplicated**, not shared:

| Function                     | `ReactFlightServer.js` | `ReactFlightReplyClient.js` |
| ---------------------------- | ---------------------- | --------------------------- |
| `serializeByValueID`         | Line 2787              | Line 98                     |
| `serializePromiseID`         | Line 2795              | Line 102                    |
| `serializeServerReferenceID` | Line 2799              | Line 106                    |
| `serializeNumber`            | Line 2825              | Line 118                    |
| `serializeBigInt`            | Line 2859              | Line 146                    |
| `serializeDateFromDateJSON`  | Line 2853              | Line 140                    |

Similarly, `parseModelString` is duplicated between:

- `ReactFlightClient.js` (server→client parsing)
- `ReactFlightReplyServer.js` (client→server parsing)

### What IS Actually Shared (from `shared/`)

Only utility/helper code is shared:

| Module                        | Purpose                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `ReactSerializationErrors.js` | Error message formatting (`describeObjectForErrorMessage`, `isSimpleObject`) |
| `ReactSymbols.js`             | Symbol constants (`REACT_ELEMENT_TYPE`, `ASYNC_ITERATOR`)                    |
| `isArray.js`                  | Array check utility                                                          |
| `getPrototypeOf.js`           | Prototype access utility                                                     |
| `hasOwnProperty.js`           | Property check utility                                                       |

### TemporaryReferences - Similar API, Different Implementations

Two separate files with different implementations:

```
react-client/src/ReactFlightTemporaryReferences.js
  - 32 lines
  - Simple Map-based storage
  - Used by encodeReply to store references

react-server/src/ReactFlightServerTemporaryReferences.js
  - 123 lines
  - Proxy-based with error throwing on property access
  - Used to create opaque references on server
```

### Why No Code Sharing?

Likely reasons:

1. **Different build targets**: react-server vs react-client have separate bundle configurations
2. **Tree-shaking**: Keeping code separate allows dead code elimination per environment
3. **Flexibility**: Each direction can evolve independently if needed

A potential refactor could extract a shared `ReactFlightSerializationFormat.js`, but the React team has chosen to keep these implementations separate.

## Conclusion

### Shared (Convention Only)

- **JSON value reference markers** (`$` prefix system) - same convention, duplicated code
- **parseModelString pattern** - same logic, duplicated implementation
- **Type support** (Date, BigInt, Map, Set, TypedArrays, Streams) - symmetric but separate

### Not Shared

- **Serialization functions** - duplicated in each file
- **Wire format handling** - completely different implementations
- **TemporaryReferences** - similar API, different implementations

### Symmetry Design

This design enables the "use cache" pattern described in draft.md:

- `encodeReply` can serialize React elements (with temporaryReferences)
- The same markers used in RSC payloads work for cache key serialization
- `createFromReadableStream` can be used in react-server environment to restore cached RSC

The shared marker **convention** (not code) allows seamless round-trip serialization:

```
React Tree → encodeReply (cache key) → stored
           → renderToReadableStream (cache value) → stored
           → createFromReadableStream → React Tree
```
