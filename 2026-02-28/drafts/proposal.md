# React Tokyoフェス2026ポスターセッション応募フォーム

https://docs.google.com/forms/d/e/1FAIpQLSfDUGgqgGm3VXPbf_1htLzIemqWyosKPoug9FwZUkGEZTIVPw/viewform

connpass id: hi-ogawa
Discord: hiroshi18181
名前: 小川浩志

---

In English

## 自己紹介文 / self introduction

OSS developer at VoidZero Inc. `@vitejs/plugin-rsc` author. Vite, Vitest and Waku team member.

## 発表タイトル / title

Is "use cache" a React feature?

## 概要 / abstract

Next.js has introduced "use cache" directive. While it appears as a Next.js feature, the core functionality is built on React primitives and fundamental RSC concepts, which are bundler/framework-agnostic.

This session explores how "use cache" works using React's serialization and deserialization APIs. The focus is on understanding the underlying React APIs and how they relate to familiar RSC concepts like client components and server functions. Through a demo implementation for `@vitejs/plugin-rsc`, we'll see that the fundamental mechanism is a React feature, while Next.js adds framework-specific features like fetch caching and revalidation on top.

## アピールポイント / appeal points

Concrete API covered in the poster will be:
- `renderToReadableStream` / `createFromReadableStream`: RSC serialization API to convert client/server references in two worlds (client and server).
- `encodeReply` / `decodeReply`: encoding / decoding of server function arguments.
- `createTemporaryReferenceSet`: temporary reference API enables donut pattern of static shell (`use cache` component) and dynamic children.

---

In Japanese

## 自己紹介文

VoidZero Inc.のOSS開発者。`@vitejs/plugin-rsc`の作者。Vite、Vitest、Wakuチームメンバー。

## 発表タイトル

フレームワーク非依存な"use cache"の仕組みとViteでの実装

## 概要

Next.jsが導入した"use cache"ディレクティブはNext.jsの独自の機能に見えますが、そのコア機能はReactが提供するAPIと基本的なRSCコンセプトで構築されており、バンドラー/フレームワークに依存しません。このセッションでは、ReactのRSC APIを使って"use cache"がどのように作られているか、そしてclient component / server functionなどで使われているAPIとどのように対応するのかを紹介します。また`@vitejs/plugin-rsc`のために作られた`vite-plugin-react-use-cache`の実装を通して、フレームワークに依存しない形での"use cache"の機能が理解できます。

## アピールポイント

具体的なAPIは以下の通りです：
- `renderToReadableStream` / `createFromReadableStream`: encoding / decoding for server component and client compoennt
- `encodeReply` / `decodeReply`: encoding / decoding of server function arguments (this is used to create cache key for "use cache" function/component arguments)
- `createTemporaryReferenceSet`: temporary reference APIがどのように "use cache" componentとdynamic childrenのドーナツパターンを可能にするか。
