import { describe, expect, it } from "vitest";
import {
  HISTORY_LIMIT,
  historyAt,
  stepBack,
  stepForward,
  visit,
  type RouteHistory,
} from "../../../../src/application/shell/history";

type R = { readonly name: string };
const same = (a: R, b: R) => a.name === b.name;
const at = (name: string): R => ({ name });

/** Visits each name in order from a history that starts at `a`. */
const visited = (...names: string[]): RouteHistory<R> =>
  names.reduce((history, name) => visit(history, at(name), same), historyAt(at("a")));

describe("route history", () => {
  it("starts at a route with nothing to go back or forward to", () => {
    expect(historyAt(at("a"))).toStrictEqual({ back: [], current: at("a"), forward: [] });
  });

  it("pushes the current route onto the back stack on a visit", () => {
    expect(visited("b", "c")).toStrictEqual({
      back: [at("a"), at("b")],
      current: at("c"),
      forward: [],
    });
  });

  it("pushes nothing for a visit to the current route", () => {
    const history = visited("b");
    expect(visit(history, { name: "b" }, same)).toBe(history);
  });

  it("goes back and forward between the stacks", () => {
    const back = stepBack(visited("b", "c"));
    expect(back).toStrictEqual({ back: [at("a")], current: at("b"), forward: [at("c")] });
    const twice = stepBack(back);
    expect(twice).toStrictEqual({ back: [], current: at("a"), forward: [at("b"), at("c")] });
    expect(stepForward(twice)).toStrictEqual(back);
  });

  it("stays where it is with nothing to go back or forward to", () => {
    const start = historyAt(at("a"));
    expect(stepBack(start)).toBe(start);
    expect(stepForward(start)).toBe(start);
  });

  it("clears the forward stack on a visit", () => {
    const history = visit(stepBack(stepBack(visited("b", "c"))), at("d"), same);
    expect(history).toStrictEqual({ back: [at("a")], current: at("d"), forward: [] });
  });

  it(`keeps the last ${HISTORY_LIMIT} steps back`, () => {
    expect(HISTORY_LIMIT).toBe(50);
    const names = Array.from({ length: HISTORY_LIMIT + 5 }, (_, index) => `r${index}`);
    const history = visited(...names);
    expect(history.back).toHaveLength(HISTORY_LIMIT);
    expect(history.back[0]).toStrictEqual(at("r4"));
    expect(history.back.at(-1)).toStrictEqual(at(`r${HISTORY_LIMIT + 3}`));
    expect(history.current).toStrictEqual(at(`r${HISTORY_LIMIT + 4}`));
  });
});
