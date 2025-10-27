import {
  JestChaiExpect,
  JestExtend,
} from '@vitest/expect'
import * as chai from 'chai'
chai.use(JestExtend)
chai.use(JestChaiExpect)
const expect = chai.expect

function main() {
  expect({ name: 'Vitest' }).toBe({ name: "Jest" })
}

main();
