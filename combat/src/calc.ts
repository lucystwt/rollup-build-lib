import { sum } from "lodash-es"

export function add(a: number, b: number) {
  return a + b
}

export function mySum(collection: number[]) {
  return sum(collection)
}
