// Utilities
import { compareObjects, isObject, joinParents } from "./object.util";

describe("'compareObjects'", () => {
  const createOutputShared = (
    value1: any,
    value2: any,
    key: string,
    parents: string[],
    comparison: any,
  ) => {
    if (isObject(value1) && isObject(value2)) return comparison;
    else if (value1 && !value2) return "missing";
    else if (!value1 && value2) return "extra";
    else return "present";
  };

  it("detects extra/missing keys", () => {
    const baseObj = {
      missing: "value",
      missingNested: {
        missing: "value",
      },
      nested: {
        missing: "value",
        shared: "value",
      },
      shared: "value",
    };
    const comparisonObj = {
      extra: "value",
      nested: {
        extra: "value",
        shared: "value",
      },
      shared: "value",
    };

    const output = compareObjects(
      baseObj,
      comparisonObj,
      [],
      createOutputShared,
    );

    const expected = {
      extra: "extra",
      missing: "missing",
      missingNested: "missing",
      nested: {
        extra: "extra",
        missing: "missing",
        shared: "present",
      },
      shared: "present",
    };

    expect(output).toStrictEqual(expected);
  });

  it("filters out ignored keys", () => {
    const baseObj = {
      _comment_: "This is a test",
      nested: {
        _comment_: "This is a test",
        shared: "value",
      },
      shared: "value",
    };
    const comparisonObj = {
      nested: {
        shared: "value",
      },
      shared: "value",
    };

    const commentFilter = (key: string): boolean => {
      return !key.startsWith("_comment");
    };

    const output = compareObjects(
      baseObj,
      comparisonObj,
      [],
      createOutputShared,
      commentFilter,
    );

    const expected = {
      nested: {
        shared: "present",
      },
      shared: "present",
    };

    expect(output).toStrictEqual(expected);
  });
});

describe("'isObject'", () => {
  it("detects object values", () => {
    const inputs = [{}, { key: "value" }];

    const output = inputs.map((i) => isObject(i));

    const expected = inputs.map(() => true);
    expect(output).toStrictEqual(expected);
  });

  it("detects non-object values", () => {
    const inputs = [null, undefined, NaN, true, false, ""];

    const output = inputs.map((i) => isObject(i));

    const expected = inputs.map(() => false);
    expect(output).toStrictEqual(expected);
  });
});

describe("'joinParents'", () => {
  it("joins parents together", () => {
    const parents = ["top", "middle", "bottom"];

    const output = joinParents(parents);

    const expected = "top -> middle -> bottom";
    expect(output).toBe(expected);
  });

  it("joins parents together with child key", () => {
    const parents = ["top", "middle", "bottom"];
    const key = "inner";

    const output = joinParents(parents, key);

    const expected = "top -> middle -> bottom -> inner";
    expect(output).toBe(expected);
  });
});
