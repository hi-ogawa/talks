import { test, expect } from "vitest"
// import { render } from 'vitest-browser-vue'
import { mount } from '@vue/test-utils'
// @ts-ignore
import Hello from "./Hello.vue";
import { page } from "vitest/browser";

test('Hello', async () => {
  // render(Hello))
  mount(Hello, { attachTo: document.body })
  await expect.element(page.getByText('Hello')).toBeVisible()
})
