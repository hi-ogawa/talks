import { test, expect, describe } from "vitest"
import { add } from "./add"

describe(add, () => {
  test('one plus two', () => {
    expect(add(1, 2)).toBe(3)
  })
})
