import { expect, test } from "vitest"
import { prime } from "./prime"

test("demo", async () => {
  expect(prime(1)).toBe(2);
  expect(prime(3)).toBe(5);
  expect(prime(5)).toBe(11);
})
