import { test, expect, describe } from "vitest"
import { add } from "./add"
import { shared } from "./shared"

describe("add", () => {
  test('one plus two', () => {
    shared;
    expect(add(1, 2)).toBe(3)
  })
  test('two plus three', () => {
    expect(add(2, 3)).toBe(5)
  })
})
