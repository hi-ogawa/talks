import { expect, test } from "vitest"
import { mul } from "./mul"
import { shared } from "./shared"

test("mul", () => {
  shared;
  expect(mul(2, 3)).toBe(6)
})
