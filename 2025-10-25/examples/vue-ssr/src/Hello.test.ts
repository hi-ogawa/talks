import { test, expect } from "vitest"
import { renderToString } from "vue/server-renderer"
// @ts-ignore
import Hello from "./Hello.vue";
import { createApp } from "vue";

test('Hello', async () => {
  const app = createApp(Hello);
  const html = await renderToString(app);
  expect(html).toMatchInlineSnapshot(`"<!--[--><h1>Hello World!</h1><input value="Hello World!"><!--]-->"`)
})
