import { it, expect } from "vitest"
import { getFullName } from "./string"

it("getFullName fn", () => {
  const correctResult = "Chengyang Han"
  expect(getFullName("Chengyang", "Han")).toBe(correctResult)
  expect(getFullName("cHEnGyang", "HaN")).toBe(correctResult)
  expect(getFullName(" C heng ya ng", "Ha n ")).toBe(correctResult)
})
