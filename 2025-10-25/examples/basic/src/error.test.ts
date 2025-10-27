import { test, expect, onTestFinished } from "vitest"


test("foo", () => {
  onTestFinished(t => {
    console.log(t.task.result?.errors)
  })
  expect({ name: 'Vitest' }).toEqual({ name: 'Jest' })  
  // try {
  // } catch (e) {
  //   console.log({ ...e })
  // }
})
