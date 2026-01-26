Title: フレームワーク非依存な"use cache"の仕組みとViteでの実装

# 1. RSC API を学ぶ

## 1.0. React RSC パッケージ構成

`react-server-dom-xxx` パッケージは、RSC の基本機能を提供するランタイム API 群であり、RSC フレームワークを構築するための基盤です。

`"use client"` / `"use server"` は React が定義する RSC のセマンティクスであり、バンドラがトランスフォームとモジュールインポートを通じて実装します。`xxx` サフィックス（`webpack`、`parcel` など）は、バンドラ固有のモジュールインポート機構を反映しています。フレームワークはこれらを抽象化します。

Part 1 ではこれらの API を個別に解説し、Part 2 では `use cache` を実装するためにどう組み合わせるかを示します。

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

## 1.1. サーバコンポーネントのレンダリング

React Server Components は、コンポーネントをサーバ上で事前に実行し、ストリーミング形式にシリアライズするレンダリングモデルです。Server API（`renderToReadableStream`）は React ツリーをストリームにシリアライズします。Client API（`createFromReadableStream`）はストリームを React ツリーに復元します。（ここでの "client" は RSC ストリームのコンシューマを意味し、SSR も含みます。）復元後は以下のように処理されます：

- CSR（クライアントサイドレンダリング）：React ツリーは `react-dom/client` を通じてブラウザの DOM にマウントまたはハイドレートされる
- SSR（サーバサイドレンダリング）：React ツリーは `react-dom/server` を通じてサーバ上で HTML テキストストリームにレンダーされる

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
// "React Server" 環境上の ReactNode ツリー
{
  '$$typeof': Symbol(react.transitional.element),
  type: [AsyncFunction: ServerComponent],
  key: null,
  ref: null,
  props: {}
}

// `ServerComponent` 関数を実行
0:["$","div",null,{"children":["$","span",null,{"children":0.8033}]}]

// SSR と CSR（ハイドレーション）で同じ React ノードが使用されるため、ハイドレーションミスマッチが起きない
// <div>{0.8033}</div> と同等
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

## 1.2. サーバ関数の引数処理

`encodeReply` はブラウザ上で関数の引数をシリアライズします。`decodeReply` はサーバ上でそれらをデシリアライズします。標準の JS オブジェクトは JSON 形式の文字列に、FormData やバイナリデータは FormData としてエンコードされます。HTTP 通信と再レンダリングの仕組みはフレームワークが担当し、React ランタイムはシリアライズのみを担当します。

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

フレームワークでの実装例

```tsx
// == "React Client" 環境（ブラウザ）==

import { encodeReply } from "react-server-dom-xxx/client";

const body = await encodeReply(args);
const response = await fetch("/...endpoint...", {
  method: "POST",
  body,
});

import { decodeReply } from "react-server-dom-xxx/server";

const args = await decodeReply(request.body);
// ...`args` を使ってサーバ関数を呼び出す...
```

# 2. "use cache" の実装

## 2.1. ドーナツパターンと Temporary References

`use cache` のフロー全体は RSC 環境内で完結します。4 つの API すべてを使った自己ループです。

**ドーナツパターン**

`use cache` は、コンポーネントをキャッシュしながら `children` を動的に保つことを可能にします。静的なシェルと動的な子を持つドーナツのようなイメージです。課題は、`children` をキャッシュにシリアライズすると古くなってしまうことです。解決策は `temporaryReferences` です。

**temporaryReferences の仕組み**

`encodeReply` で引数をシリアライズする際、React ノードは `$T` プレースホルダーになり、別のマップに保存されてシリアライズ出力から除外されます。`decodeReply` は `$T` を Proxy に変換し、評価されずにそのまま通過します。`renderToReadableStream` で結果をシリアライズする際、Proxy は再び `$T` になります。最後に `createFromReadableStream` が `$T` をマップから元のノードに置き換えます。これが `use cache` がキャッシュキーに `encodeReply`（`renderToReadableStream` ではなく）を使う理由です。`temporaryReferences` 付きの `encodeReply` だけが React ノードを除外できるためです。

**5 ステップのフロー**（すべて RSC 環境内）

1. `encodeReply(args)` → キャッシュキー（`children` は `$T` になる）
2. `decodeReply` → Proxy プレースホルダー付きの引数
3. 関数を実行（Proxy はそのまま通過）
4. `renderToReadableStream(result)` → キャッシュ値（Proxy は `$T` になる）
5. `createFromReadableStream` → 復元、`$T` を最新の children に置換

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

// 静的シェルと動的な子を組み合わせる
<CachedParent>
  <DynamicChild />
</CachedParent>

// ⬇️ "use cache" トランスフォーム
//    （高階関数ラッパー）

const CacheParent_wrapped = __cache_wrapper__(CachedParent)

<CacheParent_wrapped>
  <DynamicChild />
</CacheParent_wrapped>

// ⬇️ レンダリングとは、`props` を引数としてコンポーネント関数を実行すること
CacheParent_wrapped({ children: <DynamicChild /> })
```

```tsx
async function __cache_wrapper__(originalFn) {
  const cache = new Map<string, ReadableStream>();

  return (...args) => {
    // 1. `args` をキャッシュキーとしてエンコード
    const clientTempRefs = createClientTemporaryReferenceSet();
    const encodedArgs = await encodeReply(args, { temporaryReferences: clientTempRefs });

    // キャッシュを確認
    if (!cache.has(encodedArgs)) {
      // 2. 引数をデコード
      const serverTempRefs = createTemporaryReferenceSet();
      const decodedArgs = await decodeReply(encodedArgs, { temporaryReferences: serverTempRefs });

      // 3. 元の関数を実行
      const result = originalFn(...decodedArgs);

      // 4. 結果を RSC ストリームにシリアライズしてキャッシュに保存
      const stream = renderToReadableStream(result, { temporaryReferences: serverTempRefs });
      cache.set(encodedArgs, stream);
    }

    // 5. RSC ストリームをデシリアライズ
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

// キャッシュヒット時は 'encodeReply' と 'createFromReadableStream' のみ実行され、キャッシュされた 'stream'（静的シェル）と最新の 'clientTempRefs $T'（動的な子）から戻り値が生成される
```

## 2.2 まとめ Viteでの実装

`use cache` のランタイム機構はフレームワーク非依存です。React は `react-server-dom-xxx` パッケージで 4 つの RSC API すべてと `temporaryReferences` 機構を提供しています。どのフレームワークでもこれらのプリミティブを使って `use cache` を実装できます。このデモでは Vite と `@vitejs/plugin-rsc` を使用しています。

Next.js などのフレームワークは、ビルド時トランスフォーム、キャッシュストレージバックエンド、再検証 API（`revalidateTag` など）を追加しています。しかしコアランタイムはReact自体の機能です。

完全なデモコードとリソースはリポジトリ https://github.com/hi-ogawa/react-tokyo-fes-2026-use-cache にあります。右の QR コードからアクセスしてください。
