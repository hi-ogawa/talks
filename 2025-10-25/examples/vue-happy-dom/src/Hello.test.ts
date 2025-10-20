import { test, expect } from "vitest"
import { mount } from '@vue/test-utils'
// @ts-ignore
import Hello from "./Hello.vue";

test('Hello', () => {
  const wrapper = mount(Hello, { attachTo: document.body })
  expect(wrapper.element).toMatchInlineSnapshot(`
    <span>
      Hello!
    </span>
  `)
})
