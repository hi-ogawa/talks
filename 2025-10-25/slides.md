---
theme: default
favicon: /favicon.ico
title: Inside Vitest - Test Framework Architecture Deep Dive
class: text-center
transition: slide-left
---

# Inside Vitest <logos-vitest />
## Test Framework Architecture Deep Dive

<!--
こんにちは。
Inside Vitest というタイトルで本日は、Vitestの内部構造について紹介していきます。
よろしくお願いします。
-->

---
layout: two-cols
---

# About Me

- Hiroshi Ogawa <a href="https://github.com/hi-ogawa" target="_blank">@hi-ogawa <ri-github-fill /></a>
- [Vite](https://vite.dev/) <logos-vitejs /> and [Vitest](https://vitest.dev/) <logos-vitest /> core team member
- Working at [VoidZero](https://voidzero.dev/) <img src="/voidzero-icon.svg" class="h-5 inline" />
- SSR meta-framework fanatic 
- [Vite RSC support `@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/README.md) <logos-react />

<!-- TODO: move "about me" after intro? -->

<!-- 
My first Vitest PR on Oct 30, 2023
https://github.com/vitest-dev/vitest/pull/4396
-->

::right::

<img src="/avatar.jpeg" class="w-60 mx-auto mt-10 rounded-full" />

<!--
初めに、簡単な自己紹介です。
おがわひろしと申します。hi-ogawaというusernameとこんなavatarでgithubでopen sourceの活動をしています。
今はViteとVitestのcore team memberとしてvoidzeroで働いています。
backgroundとしては、javascript fullstack developerでReact frontendを使ってたのですが、そこからSSRに興味があってViteのmeta frameworkを探りはじめたのがきっかけです。
今では、若干その延長もあり、ViteでReact server componentを使うことが出来るようにするための、@vitejs/plugin-rscというViteのofficial packageを作ってmaintenanceしています。
-->

---
layout: two-cols
layoutClass: gap-8
---

# What is Vitest?

Testing framework


```tsx {1|1,3,6,9,14-15,19-20}
// packages/vite/src/node/__tests__/scan.spec.ts
import path from 'node:path'
import { describe, test, expect } from 'vitest'
import { commentRE, } from '../optimizer/scan'

describe('optimizer-scan:script-test', () => {
  /*...*/

  test('component return value test', () => {
    scriptRE.lastIndex = 0
    const [, tsOpenTag, tsContent] = scriptRE.exec(
      `<script lang="ts">${scriptContent}</script>`,
    )!
    expect(tsOpenTag).toEqual('<script lang="ts">')
    expect(tsContent).toEqual(scriptContent)

    scriptRE.lastIndex = 0
    const [, openTag, content] = scriptRE.exec(...)!
    expect(openTag).toEqual('<script>')
    expect(content).toEqual(scriptContent)
```

::right::

<v-click>

<div style="--slidev-code-font-size: 9px; --slidev-code-line-height: 0px;">
<<< @/snippets/vite-unit-test.ansi
</div>

</v-click>

<!--
簡単にVitestを何か、というイントロです。
このtestは実はViteのrepositoryから持ってきたものなのですが、あんまり関係なくて、基本的に注目したいのは、まずjavascript ecosystemでは未慣れのある、describe, test, expectというAPIを元にtestを書いていますとうことですね。
あと、もちろんvitestはcliを提供してて、testの結果をざらっと表示してくれます。
これは、Vitestを使ってない方で、他のmocha, jest, playwrightまたはnode, bunのnative test runnerなどを使ってるかたでも同じ仕組みや流れですね。
-->

---
layout: two-cols
---

# What is Vitest?

Features

<v-clicks>

- Jest-compatible API and feature set
  - `describe`, `test`, `expect`, ...
  - mocking, snapshot, coverage, ...
- ESM and TypeScript support out of the box
  - Vite builtin features available
- Extensible via Vite plugin ecosystem
  - React, Vue, Svelte, ...
- Runtime agnostic
  - Node.js, Browser Mode, Cloudflare Workers
- Advanced API and Programmatic API
  - Powerful customization to serve ecosystem
    (Storybook, VSCode extension, Cloudflare, ...)

</v-clicks>

::right::

<div class="h-8" />

<v-click at="1">

```ts
// [add.test.ts]
import { test, expect } from "vitest"
import { add } from "./add"

test('add', () => {
  expect(add(1, 2)).toBe(3)
})
```

</v-click>

<div class="h-2" />

<v-click at="3">

```ts
// [Hello.test.ts]
import { test, expect } from "vitest"
import { mount } from '@vue/test-utils'
import Hello from "./Hello.vue";

test('Hello', () => {
  const wrapper = mount(Hello, { attachTo: document.body })
  expect(wrapper.text()).toContain('Hello')
})
```

</v-click>

<!--
簡単にfeatureをlistしていくと、まず、Jestと互換性のあるAPIだったり、同等のtest frameworkとしての機能を提供しています。

また、Jestと比べた利点としては、modern javascriptの標準であるESM / typescriptをzero configでsupportしています。

さらに、拡張性として、Vite plugin ecosystemをそのまま使いまわせることも利点です。

そして、Vitest独自の特徴としては、runtime agnosticと言うのがあげられます。従来では "test file" をUI unit testingもjsdom/happy-domというnode上でのdomのsimulationが当然でしたが、Vitest browser modeはVite / Vitestのruntime agnosticな設計を発展させ、"test"自体をbrowserで実行することを可能にしました。

また、もう一つ強調したい特徴として、Vite pluginをもとにした拡張性だけでなく、Vitest自体がlow levelなAPIを多く提供し、Vitestのdownstream projectのecosystemを構築してきています。例としては、StorybookやCloudflareが挙げられます。 Cloudflareはruntime agnosticの例として、Cloudflare workersというruntimeの上でtestを実行するpackageを提供しています。
-->

---
layout: two-cols
layoutClass: gap-4
---

# What is Vitest?

Runtime agnostic ⟶ Browser Mode

<div style="--slidev-code-font-size: 11px; --slidev-code-line-height: 0px;">

<v-click>

```ts
// [Hello.test.ts]
import { test, expect } from "vitest"
import { page } from "vitest/browser";
import { mount } from '@vue/test-utils'
import Hello from "./Hello.vue";

test('Hello', () => {
  mount(Hello, { attachTo: document.body })
  await expect.element(page.getByText('Hello')).toBeVisible()
})
```

```ts
// [vitest.config.ts]
import { defineConfig } from "vitest/config"
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [vue()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  }
})
```

</v-click>

</div>

::right::

<div class="h-8" />

<v-click>

![alt text](/browser-mode-ui.png)

</v-click>

<!--
Vitest browser modeの例を見せますと、こんな感じです。
APIとしてplaywrightのpageAPIやtesting-libraryに似たAPIがあります。それをbrowser上で実行し、実際にUIがrenderingとinteractionがunit testとして実行がされる状況をtest UIで見ることが出来ます。
-->

---

# Vitest 4 is out!

- [Announcement Blog](https://vitest.dev/blog/vitest-4.html)
- [State of Vitest (ViteConf 2025)](https://www.youtube.com/watch?v=AGmVjX_iilo) by Vladimir <a href="https://github.com/sheremet-va" target="_blank">@sheremet-va <ri-github-fill /></a>

<img src="/vitest4.png" class="h-[65%] mt-10 mx-auto" />

<!--
ここで本題に入る前に、お伝えしたい事があって、Vitest 4がちょうど今週releaseされましたので、Vitestを使っている方はupgradeしてみたいくださいというお知らせです。
このtalkではVitest 4でのchangeやfeatureについてはお話ししませんがbrowser modeのstable releaseなど、興味ある方は、Blog, documentation, そしてVladimirのViteConfのtalkをご覧ください。
-->

---

# Overview

<div />

This talk follows the **test lifecycle** to explore Vitest architecture:
- Orchestration → Collection → Execution → Reporting

<v-click>

Along the way, we'll see how each package divide responsibilities:
- `vitest`, `@vitest/runner`, `@vitest/browser`, `@vitest/expect`, ...

</v-click>

<v-click>

And finally we learn how **Vite** powers Vitest as a foundation:
- Environment API, Custom transform pipeline, ...

</v-click>

<!--
それでは本題です。

このトークでは、前半に、Test lifecycleを四つのstep, orchestration, collection, execution, reportingに分けて、紹介していきます。

またこれを追っていく中で、どのようにVitestのmonorepo packagesが機能を分担をしているのかもお話ししていきます。

前半では、Viteに関わる部分に言及しませんが、後半では、実際にtestに関わる部分で、どのようにVitestがViteの機能を利用しているのかを説明していきます。
-->

---

# Vitest Monorepo Packages Dependencies

- **vitest** - cli entry, test orchestration, reporter, re-exports other packages
- **@vitest/runner** - `describe/suite`, `it/test`
- **@vitest/expect, @vitest/snapshot, @vitest/spy** - <br /> standalone libraries for `expect`, `toMatchSnapshot`, `vi.fn()`

<img src="/monorepo-packages.png" class="mx-auto w-[85%]" />

<!--
そして、ちなみに、これがVitestのmonorepo packagesのdependency graphです。実際にはuserは主にvitestのみをinstallして使えるのですが、内部ではstandalone libraryで使えるようなpackageも存在しています。

左側にはCore packages (つまり、vitestをinstallしたときに一緒についてくるもの)、右側にはoptional packagesです。

ここについてはおいおい出てきます。

reference https://npmgraph.js.org/?q=vitest%40beta
-->

---
layout: two-cols
layoutClass: gap-4
---

# Test Lifecycle

Example test run

<v-click>

```ts
// [add.test.ts]
import { test, expect, describe } from "vitest"
import { add } from "./add"

describe("add", () => {
  test('first', () => {
    expect(add(1, 2)).toBe(3)
  })
  test('second', () => {
    expect(add(2, 3)).toBe(4)
  })
})
```

<div class="h-2" />

```ts 
// [mul.test.ts]
import { expect, test } from "vitest"
import { mul } from "./mul"

test("mul", () => {
  expect(mul(2, 3)).toBe(6)
})
```

</v-click>

::right::

<v-click>

<div style="--slidev-code-font-size: 9px; --slidev-code-line-height: 0px;">
<<< @/snippets/lifecycle.ansi
</div>

</v-click>

<!--
それでは、まずtest lifecycleを４stepsに分けてお話しする前提として、この左側にある表示した二つのtest filesを用います。

実際に実行して、最終的なreportは右側に表示されるまでの流れを見ていくのがゴールです。
-->

---

# Test Lifecycle

<div>

👉 **Orchestration** → Collection → Execution → Reporting

- Test files scheduling

</div>

<!--
まず最初のstepはorchestrationです。
このstepは特に明確に定義できるものでもないのですが、このtalkでは簡単に、CLIを実行してから、実際にtest filesを見付けて、どのようにscheduleするのか、というstepというお話しします。
-->

---
layout: two-cols
layoutClass: gap-4
---

# Test orchestration

Find test files to run

<v-click>

- Configuration
  - `vite.config.ts`, `vitest.config.ts`

```ts [vitest.config.ts]
export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: ["**/e2e/**"],
    projects: [
      {
        name: "unit",
        test: {
          include: ["**/*.unit.ts"],
        }
      },
      ...
    ]
  },
})
```

</v-click>

::right::

<div class="h-14" />

<v-click>

- CLI arguments to overrides

```sh
vitest src/add.test.ts src/dir/ # glob file pattern
vitest --project=unit # filter projects
vitest --shard=1/3 # parallelize across multiple machines
```

</v-click>

<v-click>

<div class="text-center my-2">↓</div>

```js
pool.runTests([
  {
    project: ...,
    moduleId: "/xxx/add.test.ts"
  },
  {
    project: ...,
    moduleId: "/xxx/mul.test.ts"
  }
])
```

</v-click>

<!--
まず、test filesを見つけるには、configurationを元に、globをつかってfile systemをsearchするだけです。
また、CLIからさらにfilterがかかることもあります。

最終的に、内部としては、"pool"というconceptがあって、そこに見つかったfilesを一緒くたに投げるという仕組みです。
-->

---

# Test orchestration / Pool

packages: `vitest`, ~~`tinypool`~~

- Spawn isolated runtime from main process and assign test files
- `pool: "forks"`, `"threads"`, `"vmThreads"`, ... + Browser mode
- The default is `pool: "forks"`

```ts
import { fork } from "node:child_process"
```

<img src="/test-runner-orchestration.png" class="w-[70%] mx-auto" />

<!--
そして、このpoolというconceptはなにかという説明です。

このconceptはtest filesをどのように、どのruntimeで実行するかという仕組みを決めるところになります。

基本設計として、VitestはVitest自身が起動されたCLIのmain process自体では、test filesを実行しません。

Vitestの"pool"というconfigurationがありまして、指定できるoptionとしてはforks, threads, vmThreads,などがあります。"browser mode"は実はこのoptionを通してuserが指定できるものではないのですが、conceptとしてはこの一貫としてくくられるべきなので、この流れで説明します。

まず、このdiagramで表しているのは、"forks" poolです。この時には、nodeのchild process fork APIを使って、test fileごと専用のchild processを作って、そこでtestを実行します。

これによって、test fileのparallelizationを可能にします。

さらに、それぞれのtest fileが他のtest fileの実行を影響されることがruntimeの観点からはなく、このようにtest fileそれぞれを隔離することを、isolationと呼びます。
-->

---

# Test orchestration

- `pool: "threads"`

```js
import { Worker } from 'node:worker_threads'
```

<v-click>

- Light weight compared to child process, however:
  - `process.chdir(...)` is not available.
  - "less stable" (e.g. Native module / Node-API library compatibility - [Common Errors](https://vitest.dev/guide/common-errors.html))

<img src="/test-runner-orchestration-threads.png" class="w-[70%] mx-auto" />

</v-click>

<!--
そして、つぎに"threads" pool optionを指定した時には、node worker threads APIをしようして、child processの代わりにthreadを利用した、paralellizationとisolationを提供します。

このpoolの売り文句としては、child processを作るよりthreadの方が、早いと考えられているのですが、実際には、完全にchild processのmini versionではなく、例えば、`process.chdir`がworker内では使えなかったり、またはNode native module packageによってはworker内で使うとcrashするものがあったりと、debugするのがuserとしてもvitest側でも大変というちょっとしたedge caseが欠点です。

実は、昔は"threads"がVitestのdefault poolだったのですが、stabilityをもとめて、Vitest version 2から"forks"をdefaultにしたという経緯があります。
-->

---

# Test orchestration

packages: `@vitest/browser-playwright`, `@vitest/browser-webdriverio`

- Browser Mode

<v-click>

- Using a single browser instance and a single page to reduce overhead

<img src="/test-runner-orchestration-browser-mode.png" class="w-[85%] mx-auto" />

</v-click>

<!--
それでは、Browser modeはどうなのかというと、まずplaywrightなどを利用して、browserを立ち上げます。
そしてtest fileごとのruntimeとしては、iframeを利用し、browserのpageを立ち上げるoverheadを最小限にするようにしています。
-->

---

# Test orchestration

- No isolation (`vitest --no-isolate` or `isolate: false`)

<v-click>

<img src="/test-runner-orchestration-no-isolate.png" class="w-[90%] mx-auto" />

</v-click>

<!--
ここまでtest fileが隔離されたruntimeという設定でしたが、実はVitestは"isolate"というoptionからこれを変更することが実は出来ます。

diagramだとこの様になって、child processを一つで済ませて、そこで複数のtest filesを実行することできるようになっています。

このdiagramだとこのisolate: falseでparallelismを失ってしまうかの用に見えるんですが、実際にこれは嘘で、cpuがあればあるだけのchild processを使います。違いは、一つのtest fileが実行し終わった後、そのchild processをkillすることなく、それを次のtest fileに使いまわすということです。
-->

---
layout: two-cols
layoutClass: gap-4
---

# Module graph

- Runtime's module graph is also reused, so it avoids evaluating same modules multiple times when shared by multiple test files.

<v-click>

```ts
// [add.test.ts]
import { test } from "vitest"
import { shared } from "./shared"

test("add", ...)
```

```ts
// [mul.test.ts]
import { test } from "vitest"
import { shared } from "./shared"

test("mul", ...)
```

```ts
// [shared.ts]
console.log("[shared.ts evaluated]")
export const shared = "shared";
```

</v-click>

::right::

<v-click>

![alt text](/isolation-example.png)

</v-click>

<!--
ここで、さらに (isolate: false)について、module evalutionという観点から説明するします。

ここでは、二つのtest filesが同じmoduleをimportしています。

(isolate: true) の場合、このshared moduleもそれぞれのruntimeで別々に実行されるますが、(isolate: false)では複数のtest filesがmodule graphを共有することで、shared moduleの実行を最小限にすることが可能です。
-->

---

# About isolation and pool

- Trade-off between `pool: "forks"`, `"threads"`, `"vmThreads"`
  - `forks` as default as it's closest to how the code is actually used.
- `isolate: false` to opt-out from isolation
  - Reusing existing child process / worker thread can save time to spawn for each test file.
  - This mode still allows splitting multiple test files into multiple pools for parallelization to benefit multiple CPUs.
  - Cons: Each test file can affect each other and non deterministic behavior is easier to manifest.
- Docs [Improving Performance](https://vitest.dev/guide/improving-performance.html)

<div class="h-4" />

```ts
export default defineConfig({
  test: {
    pool: 'threads', // default is 'forks'
    isolate: false, // default is true
  },
})
```

<!--
ここまでで、poolやisolateの設定の違いを話しましたが、vitestの思いとしては、project case by caseで一番適したものを選択して欲しいと思っています。Vitestのdefaultとしては、forks + isolationを一番stableな設定としていますが、他のoptionsのlimitationをprojectやtestの対象によっては気にする必要がないこともあります。是非defaultではないoptionも試してtest performanceの改善するか見てみてください。この事については、documentationでも言及しています。
-->


---

# Test Lifecycle

<div>

Orchestration → 👉 **Collection** → Execution → Reporting

</div>

<!--
ここまでをもって、1つめのstep Orchestrationの説明として、次にcollectionのstepに移って行きます。
-->

---

# Collecting tests

- Main process only knows about test files.
- Execute **test files** to discover **test cases**

<v-click>

```sh
$ vitest list --json
[
  {
    "name": "named exports overwrite export all",
    "file": "/xxx/vite/packages/vite/src/node/ssr/__tests__/ssrLoadModule.spec.ts"
  },
  {
    "name": "buildStart before transform",
    "file": "/xxx/vite/packages/vite/src/node/ssr/__tests__/ssrLoadModule.spec.ts"
  },
  {
    "name": "module runner initialization > correctly runs ssr code",
    "file": "/xxx/vite/packages/vite/src/node/ssr/runtime/__tests__/server-runtime.spec.ts"
  },
  {
    "name": "mergeConfig > handles configs with different alias schemas",
    "file": "/xxx/vite/packages/vite/src/node/__tests__/config.spec.ts"
  },
  ...
```

</v-click>

<!--
この2番目のstepは何かと言うと、まずここまでではtest filesまでしか把握していません。

ここから、実際にtest fileを実行してその中に書かれているtest casesは何かということを見つけて行きます。これをTest collection stepと呼びます。

あまり知られてないかもしれませんが、この部分までを実行した結果のみを、vitest listというcommandは提供してます。
-->

---

# Creating `Task` tree

package: `@vitest/runner`

- `describe()` → `Suite`, `test()` → `Test`

<div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">

<div>

<div class="mt-10" />

```ts {*|1|1,2|1,2,3|1,2,6|*}{at:0}
// [add.test.ts]
describe("add", () => {
  test('first', () => {
    expect(add(1, 2)).toBe(3)
  })
  test('second', () => {
    expect(add(2, 3)).toBe(4)
  })
})
```

</div>

<div>

```ts
type Task = File | Suite | Test
```

```js {0|1|1,2|1,2,3,4|1,2,6,7|*}{at:0}
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: undefined
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) }
      result: undefined
```

</div></div>

<div class="mt-2" />

<div v-click="6">

<span class="text-[16px]">
This phase often takes time since it involves executing import statements
and evaluating dependency modules.
</span>

```ansi
...
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                                               ^^^^^^^^^^^^^ 👈
```

</div>

</div>

<!--
Test collectionで具体的に何をするのかというと、いわゆるTest APIといわれている`describe`や`test`というfunctionをもとに、tree structureを構築する事と考えられます。

実際に`@vitest/runner`という内部のpackageはこういったことを受け持っていて、たとえば右にある、`Task`というunion typeが定義されています。

これがどのように構築されるかということを、この左側にある test fileを元に説明すると、describe/test functionが実行されるに連れて、右側のようなfile/suite/testのtree structureになります。

このtreeのleafに当たる部分がtest caseに当たるわけで、重要なポイントとしては、このstepではexpectなどとTest assertionが書かれている、closureの部分は実行されてなく、testの結果もまだundefinedです。

しかし、ここまでtest fileを実行する時点で、test fileの上に書かれている、importなどを全部実行されているので、testで使われているdependencyが実行されるstepになります。

なので、test 結果が決まってないつつも、このstepがもっとも遅いstepとしてVitestの最後のduration outputに乗ることがよくあります。
-->

---
hide: true
---

# Understanding "Duration"

- The example from the first slide from Vite's unit test suites.
- The total duration can be presented way shorter than other components.
- This is because everything processing happens in parallel and each component duration is accumulated.

```ansi
...
[2m Test Files [22m [1m[32m46 passed[39m[22m[90m (46)[39m
[2m      Tests [22m [1m[32m660 passed[39m[22m[90m (660)[39m
[2m   Start at [22m 12:58:28
[2m   Duration [22m 2.48s[2m (transform 2.32s, setup 0ms, collect 17.44s, tests 9.23s, environment 4ms, prepare 1.56s)[22m
             ^^^^^            ^^^^^                     ^^^^^^        ^^^^^
             Total
```

- By forcing single file execution, we can see each component duration more clearly.

```sh
$ vitest --fileParallelism=false
```

```ansi
 Test Files  47 passed (47)
      Tests  672 passed (672)
   Start at  01:22:14
   Duration  4.70s (transform 797ms, setup 0ms, collect 1.31s, tests 3.06s, environment 1ms, prepare 41ms)
```

---
hide: true
---

# Filtering `Task` to run

- `describe.skip/only`, `test.skip/only`, `vitest -t <test-name-filter>`
- Since the filtering happens on test runner side, test file executions cannot be skipped.
- Since each test file runs independently, one file's `only` does not affect other files.

```js
// [one.test.ts]
test.only('a', () => { // --> run ✅
  expect(1).toBe(1)
})

test('b', () => {      // --> skip ❌
  expect(2).toBe(2)
})
```

```js
// [another.test.ts]
test('c', () => {      // --> run ✅
  expect(3).toBe(3)
})
```

- Should filter by the test file as CLI argument:

```sh
$ vitest one.test.ts # => runs only 'a'
```

<!--
ここまででtest casesは見つけ出してきたのですが、さらに、この段階でtest fileの中でどれをskipするのがという`skip/only`やtestの名前でCLIからfilteringされたものを処理します。
-->

---

# Test Lifecycle

<div>

Orchestration → Collection → 👉 **Execution** → Reporting

</div>

<!--
それでは3番目のstepとして、やっとtest caseを実行して、assertionをcheckします。
-->

---

# Executing `Test`

packages: `@vitest/runner`, `@vitest/expect`, `@vitest/snapshot`, `@vitest/pretty-format`

- Finally execute each `Test` functions and record results.

<v-clicks>

````md magic-move

```js {4,7}
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) } 👈
      result: undefined
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) } 👈
      result: undefined
```

```js {3-5}
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) } 👈
      result: undefined
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) }
      result: undefined
```

```js {3-5}
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) } 👈
      result: { status: 'pass' }
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) }
      result: undefined
```

```js {6-8}
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: { status: 'pass' }
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) } 👈
      result: undefined
```

```js {6-8}
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: { status: 'pass' }
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) } 👈
      result: { status: 'fail', errors: [Error('Expected 5 to be 4', diff="...")] }
```

```js
File(name: add.test.ts)
  Suite(name: add)
    Test(name: first)
      fn: () => { expect(add(1, 2)).toBe(3) }
      result: { status: 'pass' }
    Test(name: second)
      fn: () => { expect(add(2, 3)).toBe(4) }
      result: { status: 'fail', errors: [Error('Expected 5 to be 4', diff="...")] }
```
````

<div class="mt-4">

- Depending on the nature of tests, a test execution time can be shorter than collection time.

```ansi
...
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                                                            ^^^^^^^^^^^ 👈
```

</div>

</v-clicks>

<!--
さっきの例の続きをみると、ここに残っていたfunctionを実行するわけです。

このfunctionを実行した際に、errorが出なかったら、statusをpassにして、また何かerrorが出たら、statusをfailにして、またerrorの詳細な情報を(例えばerror diff)をtest runnerをerrorをcatchした後に作ります。

このstepのdurationが"tests"としてCLI outputに出ます。Testによっては2番目のcollection stepと比べて、このstepが早いということがよくあります。
-->

---
layout: two-cols
layoutClass: gap-4
hide: true
---

# Test API

- Comprehensive API to further control how tests are run

```js {*|1,3,6|5|8,10|12|*}
beforeAll(() => ...)

afterEach(() => ...)

describe.concurrent("...", () => {
  beforeEach(() => ...)

  test("test 1", { retry: 2 }, () => ...)

  test("test 2", { timeout: 5000 }, () => ...)

  test.for(["a", "b"])("test %s", (val) => ...)
})
```

::right::

<div class="h-10" />

```js {0|*}
File
  hooks: [
    beforeAll(() => ...),
    afterEach(() => ...),
  ]

  Suite
    hooks: [beforeEach(() => ...)]
    concurrent: true

    Test(name: "test 1")
      retry: 2
      fn: () => ...

    Test(name: "test 2")
      timeout: 5000
      fn: () => ...

    Test(name: "test a")
      fn: () => ...

    Test(name: "test b")
      fn: () => ...
```

<!--
簡単な例の他にも、実際には, before/after hooksだったり複数のtest functionをPromise.allで実行するdescribe.concurrentだったりと、もっと詳細にtest実行の過程を設定するAPIがあります。でこういった情報が同じようにtree structureに記録されています。
-->

---
hide: true
---

# `expect` API

packages: `@vitest/expect`, `@vitest/pretty-format`

- `@vitest/expect`: usable as standalone assertion library
- Jest's `expect` implemented as [Chai](https://www.chaijs.com) plugin system: `toEqual`, `expect.extend`, `expect.any` ...

```ts
import { expect } from 'vitest'
expect("Vitest").to.be.a('string') // Chai API
expect({ name: 'Vitest' }).not.toEqual({ name: 'Jest' }) // Jest API
```

- Error message formatting is implemented by post processing caught errors on test runner.

<div class="flex gap-4" style="--slidev-code-font-size: 11px; --slidev-code-line-height: 0;">

<div class="flex-1">

<v-click>

```js [raw error object]
AssertionError {
  message: "expected { name: 'Vitest' } to deeply equal { name: 'Jest' }",
  actual: { name: 'Vitest' },
  expected: { name: 'Jest' },
  ...
}
```

</v-click>

</div>

<div class="w-[40%]">

<v-click>

```ansi [format actual/expected and generate diff]
[32m- Expected[39m
[31m+ Received[39m
[2m  {[22m
[32m-   "name": "Jest",[39m
[31m+   "name": "Vitest",[39m
[2m  }[22m
```

</v-click>

</div>


</div>

<!--
ここで、expect APIについて説明すると、`@vitest/expect`というmonorepo packageが提供しています。
...
-->

---
hide: true
---

# Test runner aware assertions

- Some `expect` APIs are coupled to Vitest's test runner implementation
  - `expect.soft`, `expect.poll`, `toMatchSnapshot`, ...
- `expect.soft`: accumulate assertion errors until the test end without stopping execution

<v-clicks>

```js
test("softy", ({ expect }) => {
  // both errors are surfaced at the end of the test
  expect.soft(1 + 1).toBe(3) // -> ❌ expected 2 to be 3
  expect.soft(1 + 2).toBe(4) // -> ❌ expected 3 to be 4
})
```

```js
Test(name: "softy")
  fn: () => ...
  result: {
    status: 'fail',
    errors: [
      Error('❌ expected 2 to be 3'),
      Error('❌ expected 3 to be 4'),
    ]
  }
```

</v-clicks>

<!-- 

packages/vitest/src/integrations/chai/poll.ts

- toMatchSnapshot : snapshot

- `expect.poll`: detect non `await`ed calls to provide a warning at the end of test

```js
test("...", async () => {
  // this test can pass which is likely unintended
  expect(new Promise(r => setTimeout(() => r(3), 1000))).resolves.toBe(4)
})
```

 -->

---
hide: true
---

# Snapshot testing

`@vitest/snapshot`, `@vitest/pretty-format`

- Test framework agnostic logic lives in `@vitest/snapshot` package
  <!-- Used by webdriverio, rstest -->
  - `SnapshotClient.setup/assert/finish` (lower level API for snapshot assertion and state management)
  <!-- e.g. finding where to update inline snapshot by parsing stacktrace with a hand coded regex -->
  - `SnapshotEnvironment.readSnapshotFile/saveSnapshotFile` (interface to decouple runtime)
  <!-- for example, this is implemented as RPC which works across Node.js and Browser -->
- Some logic is coupled to Vitest's test runner
  - `SnapshotClient.assert` as chai plugin `toMatchSnapshot`, `toMatchInlineSnapshot` 
  <!-- packages/vitest/src/integrations/snapshot/chai.ts -->
  - Coordinate `SnapshotClient` within test lifecycle, e.g.
    <!-- packages/vitest/src/runtime/runners/test.ts -->
    - `VitestRunner.onBeforeRunSuite` -> `SnapshotClient.setup`
    - `VitestRunner.onAfterRunSuite` -> `SnapshotClient.finish`
    <!-- also on each test retry, the previous snapshot failure needs to be reset -->
    <!-- saving snapshot files needs to be done after all `toMatchInlineSnapshot` inside one test file are finished -->
- Printing logic is implemented in `@vitest/pretty-format` package
  - Customizable via `expect.addSnapshotSerializer`

```ts
import { expect } from 'vitest'
expect({ name: 'Vitest' }).toMatchInlineSnapshot()
```

<!--
TODO: sample snapshot inline / file
-->

---

# Test Lifecycle

<div>

Orchestration → Collection → Execution → 👉 **Reporting**

</div>

<!--
それでは最後の4番目のstepとしてreportingを話します。
-->

---

# Reporting results

- `onCollected(files: File[])` notify collected `Task` tree
- `onTaskUpdate(pack: { id, result }[], ...)` notify test status incrementally in batch
- `onConsoleLog(log: ConsoleLog)` notify captured console logs during test run

<img src="/reporting-results.png" class="w-[70%] mx-auto" />

<!--
ここまで、左側のtest runnerがtest fileそしてtest caseを実行して、Task tree structureを管理していましたが、それをmain process側に持ってくる仕組みがあります。

実際には、2番目のstepのcollectionの段階でtest runnerはmain process側に見つかったtest caseの情報を送っています。

また3番目のstepのtest caseを実行した際の、pass/failのtest結果やconsole.logの情報はそのeventが発生次第、main process側に送って、Cliがreal timeでtestの結果をterminalに表示できるような仕組みになっています。
-->

---

# Runtime communication

- [birpc](https://github.com/antfu-collective/birpc) - Protocol agnostic typed two-way rpc library
- `node:child_process / fork`: `process.send`, `process.on("message")`
- `node:worker_threads / Worker`: `parentPort.postMessage`, `parentPort.on("message")`
- Browser mode: `Websocket`

<v-click>

- Support sending events from main process to test runner (e.g. gracefully abort tests on Control+C)

<img src="/birpc-on-cancel.png" class="w-[70%] mx-auto" />

</v-click>

<!--
そして、ここまでは言及していませんでしたが、test runner sideとmain processのdataのやりとりがどうなっているかという話をここでしようと思います。

Vitestはpoolごとに使えるcommunicationの媒体が違いつつもbirpcというprotocol agnosticなrpc libraryをもとにして、共通化されたinterfaceでeventを双方から送る仕組みを作っています。

例えば、今まで挙げた、fork, worker thread, browser mod を比べてみるとこうなります。

eventの方向としては、基本的にtest runner側がmain processにtestのstatusを送るのが主ですが、逆方向のeventの例として、VitestのterminalでControl+Cを押したときに、main processからchild processを強制的にkillするのではなく、test runner自身が、testを全部skipをさせるような仕組みがあります。
-->

---

# Reporter API

- Conveniently normalized data structure `TestModule` is provided instead of raw `Task` tree structure.
- Buildin reporters: `default`, `tree`, `dot`, `github-actions`, `json`, `junit`, `tap`, ...
- https://vitest.dev/advanced/api/reporters.html

<div style="--slidev-code-font-size: 10px; --slidev-code-line-height: 1.4;">

```ts
// [custom-reporter.ts]
import { BaseReporter } from 'vitest/reporters'

export default class CustomReporter extends BaseReporter {
  onTestRunEnd(
    testModules: TestModule[],
    unhandledErrors: SerializedError[],
  ) {
    console.log(testModules.length, 'tests finished running')
    super.onTestRunEnd(testModules, unhandledErrors)
  }
}
```

```ts
// [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['./custom-reporter.ts'],
  },
})
```

</div>

<!--
ここまでの過程で、main process側がtestの結果または途中結果を得た際に、こういった情報を最終的にどのようにprocessまたは表示するかをreporter APIでcustomizeできます。

Builtin reporterも様々ありますがこのAPIをもとに作られていてます。
-->

---

# Example: Default reporter

<div style="--slidev-code-font-size: 10px; --slidev-code-line-height: 0px;">
<<< @/snippets/lifecycle-default-reporter.ansi
</div>

<!--
Default reporterはTestの途中経過をreal timeで表示しつつ、Errorの詳細をsource code blockとともに表示します。
-->

---

# Example: Github Actions Reporter

```sh
::error file={/xxx/add.test.ts},line={9},...::AssertionError: expected 5 to be 4 ...
```

<img src="/lifecycle-github-actions-reporter.png" class="w-[60%] mx-auto" />

<!--
Github actions reporterはtest errorをgithub UIのfile viewで表示するためのformatが決まっているので、それにそって全部testが終わった後に、このような"::error..."というようなdirectiveをconsoleにoutputするようになっています。

https://github.com/hi-ogawa/talks/pull/1/commits/00618544d031f72ddc0f919b86730e2e26c9584e
-->

---

# Test Lifecycle

<div>

Orchestration → Collection → Execution → Reporting

**Done! ✅**

</div>

<!--
ここまでで、Test lifecycleとして定義した４つのstepsを終えました。
-->

---

# Where is Vite?

- We followed the entire lifecycle of test run, but how does Vite come into play?

<v-click>

```ansi
...
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                    ^^^^^^^^^^^^^^ 👈
```

</v-click>

<!--
それでは、ここからが後半で、ここまでViteについて話してきませんでしたが、実際にVitestがViteをどのように利用しているのかを見ていきたいと思います。

reporterのoutputがtransformのdurationを示している通り先ほどの4つのstepの中でどこかでViteがもちろん使われています。
-->

---

# Test runner and Vite environment API

Client-server architecture

- Node test → SSR environment
- Browser mode → Client environment

<v-click>

<img src="/test-runner-and-vite-environment-api.png" class="w-[80%] mx-auto" />

</v-click>

<!--
まず最初に Orchestrationのstepで話した、poolやruntimeの仕組みとVite environment APIの対応を考えて行きます。

実際に右側のmain processでは、Vite development serverが使われていて、その中にVite pluginを実行してcode transformなどをするAPIがClientまたはSSR environmentとして提供されています。

左上のforks poolのchild processではtest fileをもらってから、それを実行するという話でしたが、それは実は、Vite environment APIの一部であるModuleRunnerという仕組みを利用しています。

先ほどのReportの話であった通り、child processとmain processの間では、rpcが用意されているので、それを媒体として、file transformをchild process側からrequestしてmain processがjavascriptにtranformしたものを返し、child processがtest fileを実行します。

そして左下のbrowser modeの場合をどうかというと、これはVite client applicationとanalogyと一致してて、基本的にはbrowser/iframeがtest fileを直接importしてそれをvite development serverがresponseするという形です。
-->

---

# `vite-node` → Vite environment API

- Historically, `vite-node` has been used to achieve the same architecture before Vitest 4.

<v-click>

- `import { ViteNodeRunner } from "vite-node/client"` on test runner
- `import { ViteNodeServer } from "vite-node/server"` on main process

<img src="/vite-node.png" class="w-[75%] mx-auto" />

</v-click>

<!--
VitestがVite environment APIをずっと使ってかのように話しましたが、そうではなくて、もとは`vite-node`というpackageをもとに同じようなarchitectureを実現していました。

ストーリーとしては、このvite-nodeの仕組みが、Vite environment APIとしてViteに組み込まれたので、Vitestと同じようなserver runtime agnosticなjavascriptの実行がViteで可能になったと言えます。
-->

---
layout: two-cols
layoutClass: gap-4
hide: true
---

# SSR / Client environment

- Vue SFC transform by `@vitejs/plugin-vue`
<!-- - Vite module runner transform is additionally applied for SSR -->
- [Vue SFC Playground](https://play.vuejs.org/#eNp9kUFLwzAUx7/KM5cqzBXR0+gGKgP1oKKCl1xG99ZlpklIXuag9Lv7krK5w9it7//7v/SXthP3zo23EcVEVKH2yhEEpOhm0qjWWU/QgccV9LDytoWCq4U00tTWBII2NDBN/LJ4Qq0tfFuvlxfFlTRVORzHB/FA2Dq9IOQJoFrfzLouL/d9VfKUU2VcJNhet3aJeioFcymgZFiVR/tiJCjw61eqGW+CNWzepX0pats6pdG/OVKsJ8UEMklswXa/LzkjH3G0z+s11j8n8k3YpUyKd48B/RalODBa+AZpwPPPV9zx8wGyfdTcPgM/MFgdk+NQe4hmydpHvWz7nL+/Ms1XmO8ITdhfKommZp/7UvA/eTxz9X/d2/Fd3pOmF/0fEx+nNQ==)

```vue
<script setup>
import { ref } from 'vue'
const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
</template>
```

::right::

<v-click>

<div style="--slidev-code-font-size: 12px; --slidev-code-line-height: 0px;">

```js {1,4-13}
// [client transform]
const _sfc_main = { __name: 'Hello', setup(__props, { expose: __expose }) { ... } }
...
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock(_Fragment, null, [
    _createElementVNode("h1", null, _toDisplayString($setup.msg), 1 /* TEXT */),
    _withDirectives(_createElementVNode("input", {
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (($setup.msg) = $event))
    }, null, 512 /* NEED_PATCH */), [
      [_vModelText, $setup.msg]
    ])
  ], 64 /* STABLE_FRAGMENT */))
}
...
```

```js {1,4-11}
// [ssr transform]
const _sfc_main = { __name: 'Hello', setup(__props, { expose: __expose }) { ... } };
...
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<!--[--><h1>${
    (0,__vite_ssr_import_1__.ssrInterpolate)($setup.msg)
  }</h1><input${
    (0,__vite_ssr_import_1__.ssrRenderAttr)("value", $setup.msg)
  }><!--]-->`)
}
...
```

</div>

</v-click>

<!--
ここでSSR / Client environmentを区別することを、plugin側がどのように利用できるかということの例を出すと、例えば、Vue pluginはtransformがclientのためかssrのためかによって違うtransformをします。

右上がVue SFCのtemplateがclientようにtransformされたもので、右下がssrようにtransformしたものです。
-->

---
layout: two-cols
layoutClass: gap-4
hide: true
---

# Test runner

- `@vitest/runner` defines an interface

```js
// packages/runner/src/types/runner.ts
interface VitestRunner {
  // how to process test files (entry points)
  importFile(filepath: string, ...): Promise<unknown>

  // Callbacks for each test lifecycle
  onBeforeRunTask(test: Test): unknown
  onAfterRunTask(test: Test): unknown
  ...
}
```

::right::

<div class="h-13" />

- Vite module runner

```js
// packages/vitest/src/runtime/runners/test.ts
class VitestTestRunner implements VitestRunner {
  moduleRunner: VitestModuleRunner
  async importFile(filepath: string, ...) {
    return this.moduleRunner.import(filepath)
  }
}
class VitestModuleRunner extends ModuleRunner {
  // override implementation for module mocking, etc.
}
```

- Browser mode

```js
// packages/browser/src/client/tester/runner.ts
class BrowserVitestRunner implements VitestRunner {
  async importFile(filepath: string, ...) {
    await import(filepath) // request to Vite dev server
  }
}
```

<!--
Let's see how Vitest represent such abstraction internally.
As mentioned before in Client-server architecture. Test file execution starts by importing test files on "client" side.
-->

---
hide: true
---

# Custom Test runner

- As an advanced API, you can even inherit the base class to implement custom runner.
  <!-- https://vitest.dev/advanced/runner.html#runner-api -->
  <!-- test/cli/fixtures/custom-runner/test-runner.ts -->
  <!-- don't know main use case though? -->

```ts
// [custom-runner.ts]
import { VitestTestRunner } from 'vitest/runners'
class CustomTestRunner extends VitestTestRunner { ... }

// [vite.config.ts]
export default defineConfig({
  test: {
    runner: './custom-runner.ts'
  }
})
```

---

# Vite Module Runner

- "Vite module runner transform" rewrites original `import` and `export` into runtime functions.
  - `import` ⟶ `__vite_ssr_import__`, `__vite_ssr_dynamic_import__`
  - `export` ⟶ `__vite_ssr_exportName__`, `__vite_ssr_exportAll__`

<v-click>

- Run `VITE_NODE_DEBUG_DUMP=true vitest` (`VITEST_DEBUG_DUMP=.vitest-dump vitest` for Vitest 4)

```js
// [src/add.test.ts]
import { test, expect } from "vitest"
import { add } from "./add"

test("add", () => {
  expect(add(1, 2)).toBe(3)
});
```

```js
// [.vitest-dump/root/-src-add-test-ts]
const __vite_ssr_import_0__ = await __vite_ssr_import__("/xxx/node_modules/vitest/dist/index.js", ...);
const __vite_ssr_import_1__ = await __vite_ssr_import__("/src/add.ts", ...);

(0,__vite_ssr_import_0__.test)("add", () => {
  (0,__vite_ssr_import_0__.expect)((0,__vite_ssr_import_1__.add)(1, 2)).toBe(3);
});
```

</v-click>

<!--
ここからVite module runnerの仕組みとそれをVitestがどのように利用しているのかという例を見ていきます。

まずModule runnerは何を前提としているかというと、Vite module runner tansformというものを通して、javascriptのimport / exportを書き換えます。

この様子をVitestはdebugの手助けの一分として、簡単に見れるように、DEBUG_DUMP environment variableでfileに書き出すようになっています。ここにあるのが一つの例です。

一行目にある named importのvitest が vite_ssr_import functionになるのが見えます。 `test` functionがvite_ssr_import_0をreferenceしたものになっています。

これによって、Vite module runnerはimportの仕組みを自身のsemanticsで実行することが出来ます。

TODO: elaborate more
__vite_ssr_import__ -> fetchModule -> runInlineModule
-->

---
hide: true
---

# Vite Module Runner

TODO: elaborate `__vite_ssr_import__ -> fetchModule -> runInlineModule`. diagram?

---

# Module mocking

packages: `@vitest/mocker`, `@vitest/spy`

- Auto-mocking `vi.mock("./add.js")`
  - import original module and deeply replace all exports with spies.
- Manual-mocking with factory `vi.mock("./add.js", () => ...)`
  - the original module is not imported but implementation is provided inline.

```ts {*|2,5,9}
import { test, expect } from "vitest"
import { add } from "./add"
import { mul } from "./mul"

vi.mock("./add.js") // auto-mocking
vi.mock("./mul.js", () => ({ mul: vi.fn(() => 42) })) // manual-mocking

test("add", () => {
  expect(add(1, 2)).toBeUndefined()
  expect(add).toHaveBeenCalled()
  expect(mul(2, 3)).toBe(42)
  expect(mul).toHaveBeenCalled()
})
```

<!--
この vite_ssr_import runtime functionを通して、module mockingをVitestは実装しています。

まずはVitestのmodule mockingのをお話しすると、vi.mockというAPIがあって、それによって、もとのmoduleのexportを書き換えるという機能です。

ここにある例だと、add moduleがimportされつつも、それはvi.mockされているものなので、addの仕組みがundefinedを返すようになっています。

https://vitest.dev/guide/mocking.html#automocking-algorithm
-->

---

# Module mocking with Module Runner

- Vitest transforms `vi.mock` to be at the top, so it's processed before `import`.

```ts
import { add } from "./add.js"

vi.mock("./add.js", () => ({ add: vi.fn(() => 42) }))

test("add", () => {
  expect(add(1, 2)).toBe(42)
})
```

```ts {*|1-4|5-6|*}
// register mocking state before import
__vite_ssr_import_0__.vi.mock("./add.js", () => ({
  add: __vite_ssr_import_0__.vi.fn(() => 42)
}));
// import is intercepted by Vitest to implement mocking
const __vi_import_0__ = await __vite_ssr_dynamic_import__("/src/add.ts");

(0,__vite_ssr_import_0__.test)("add", () => {
  (0,__vite_ssr_import_0__.expect)(__vi_import_0__.add(1, 2)).toBe(42);
})
```

<!--
このようなmodule evaluationの仕組みを書き換えるためには、Vitestはまず自身のtransform pluginによって、`vi.mock`をfileの一番上に持ってきます。

それによって、test fileを実行した際にmockingの情報をimportが走る前にprocessすることができます。

また、その後に、mockされたmoduleをimportする際にはVitest自身のvite_ssr_importの実装を元にmoduleをすり替えることになります。
-->

---
layout: two-cols
layoutClass: gap-8
hide: true
---

# Coverage

```js
// [demo.test.ts]
import { expect, test } from "vitest"
import { prime } from "./prime"

test("prime", async () => {
  expect(prime(1)).toBe(2);
  expect(prime(3)).toBe(5);
  expect(prime(5)).toBe(11);
})
```

::right::

![](/coverage.png)

<!-- 
As another example of how 
Vitest's feature is powered by Vite.
Let's take a look at coverage system.
 -->

---
hide: true
---

# Coverage

packages: `@vitest/coverage-istanbul`, `@vitest/coverage-v8`, `ast-v8-to-istanbul`

- Official coverage providers:
  - `v8`: [V8 engine](https://v8.dev/)'s built-in coverage tracking
  - `istanbul`: custom transform injects code to count each function call and branch hit
- [Getting Started with Vitest Code Coverage (ViteConf 2024)](https://www.youtube.com/watch?v=UOdgx2Mm3X8) by Ari Perkkiö <a href="https://twitter.com/AriPerkkio" target="_blank">@AriPerkkio <ri-github-fill /></a>

<div class="h-2" />

<div style="--slidev-code-font-size: 10px; --slidev-code-line-height: 0;">

```sh
$ vitest --coverage
```

```ts
// [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // 'istanbul', 'custom'
      // customProviderModule: './my-provider.ts'
    },
  },
})
```

</div>

---
layout: two-cols
layoutClass: gap-4
hide: true
---

# Coverage / Istanbul

Istanbul instrumentation transform example

```js
// [original code]
export function getUsername(id) {
  if (id == null) {
    throw new Error('User ID is required')
  }
  return database.getUser(id)
}
```

- Pros:
  - Works on any Javascript runtime
- Cons:
  - transform affects test execution speed

::right::

```js {*|1-4,8,11,15,20-21}
// [transform output (simplified)]
const __cov_xyz = { 
  b: { 1: [0, 0] },  // branch coverage counter
  f: { 1: 0 },       // function coverage counter
} 

export function getUsername(id) {
  __cov_xyz.f['1']++ // function invoked

  if (id == null) {
    __cov_xyz.b['1'][0]++ // if-branch hit

    throw new Error('User ID is required')
  }
  __cov_xyz.b['1'][1]++ // else-branch hit

  return database.getUser(id)
}

globalThis.__VITEST_COVERAGE__ ||= {} 
globalThis.__VITEST_COVERAGE__[filename] = __cov_xyz
```

---
hide: true
---

# Coverage / V8

- **V8**: Coverage raw data provided by the V8 runtime. No custom transform is needed.
  However, the post processing requires accurate source map through the whole Vite transform pipeline.
  - `DevEnvironment.transformRequest(file) -> { code: string; map: SourceMap }`
- Coverage aggregation / reporting is powered by Istanbul ecosystem tooling.

<div style="--slidev-code-font-size: 10px; --slidev-code-line-height: 0;">

```js
// v8 inspector API
import inspector from 'node:inspector/promises'
const session = new inspector.Session()
const coverage = await session.post('Profiler.takePreciseCoverage')
```

</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; --slidev-code-font-size: 10px; --slidev-code-line-height: 0;">

```json
// raw coverage data
[
  {
    "scriptId": "23",
    "url": "file://xxx/prime.ts",
    "functions": [
      {
        "functionName": "prime",
        "ranges": [
          { "startOffset": 0, "endOffset": 150, "count": 1 },
          { "startOffset": 20, "endOffset": 50, "count": 1 },
          ...
        ],
      }
    ]
...
```

```json
// istanbul coverage format
{
  "/xxx/prime.ts": {
    "f": { "0": 3 },  // function
    "b": { "0": [1, 0, 1, 0, 1, 0] }, // branch
    "s": { "0": 3, "1": 1, "2": 0, "3": 1, "4": 0, "5": 1, "6": 0 },
    "fnMap": {
      "0": {
        "name": "prime",
        "decl": {
          "start": { "line": 1, "column": 16 },
          "end": { "line": 1, "column": 22 }
        },
        ...
```

</div>

---
hide: true
---

# Watch mode

- `vitest`: watch mode is default like development server
- Efficient test-rerun: similar mechanism to Vite HMR
  - File watcher API: `ViteDevServer.watch.on("change", ...)`
  - Module graph API: `ModuleGraph.invalidateModule(...)`
  - Re-transform only changed files
  - Test worker and runner side module graph is evaluated from scratch

<div class="h-4" />

```ansi
[2m Test Files [22m [1m[32m2 passed[39m[22m[90m (2)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 16:51:13
[2m   Duration [22m 130ms[2m (transform 33ms, setup 0ms, collect 46ms, tests 3ms, environment 0ms, prepare 7ms)[22m
                    ^^^^^^^^^^^^^^ 👈
[1m[42m PASS [49m[22m [32mWaiting for file changes...[39m
```

<!--
Vite server's module graph keeps previously transformed results.
It only invalidates changed files.
-->

---

# Key Takeaways

- Walked through test lifecycle to understand testing framework architecture
  - Orchestration → Collection → Execution → Reporting
- Reviewed how Vitest is powered Vite
  - Test runner leverages the same runtime mechanism as Vite's client and SSR application
  - Vite's transform pipeline and environment API provides a foundation

<!--
最後にまとめです。

このトークでは、Test lifecycleとして4つのstepの観点からVitesのtest frameworkの機能とimplementationを理解しました。

後半では、VitestのTest runnerとVite environment APIの対応や、VitestがどのようにViteのfeatureをどのように利用しているかという例を見ました。

トークはここまでです。ご清聴ありがとうございました。
-->
