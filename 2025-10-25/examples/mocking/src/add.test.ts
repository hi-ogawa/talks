import { add } from "./add"
import { test, expect, vi } from "vitest"

vi.mock("./add.js", () => ({
  add: vi.fn(() => 42)
}))

test('add', () => {
  expect(add(1, 2)).not.toBe(3)
})
