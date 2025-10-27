import { test, expect } from "vitest"

test("poll", async () => {
  // this test can pass which is likely unintended
  expect(new Promise(resolve => setTimeout(() => resolve(3), 1000))).resolves.toBe(4)
})
