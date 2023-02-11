import { assert, describe, expect, it } from "vitest"
import { add, mySum } from "./calc"

describe("calc module", () => {
  it("add fn", () => {
    expect(add(1, 2)).toEqual(3)
  })
  it("mySum fn", () => {
    assert.equal(mySum([1, 2, 3]), 6)
  })
})
