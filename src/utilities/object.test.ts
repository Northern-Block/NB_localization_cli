// Utilities
import { compareObjects, isObject, setDeep } from "./object.util";

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

describe("'setDeep'", () => {
  it("can set with valid nested path", () => {
    const input = { level1: { level2: { target: 1 } } };

    const output = setDeep(input, ["level1", "level2", "target"], 2);

    const expected = { level1: { level2: { target: 2 } } };
    expect(output).toStrictEqual(expected);
  });

  it("can set with missing nested path", () => {
    const input = { level1: { level2: { target: 1 } } };

    const output = setDeep(input, ["level1", "invalid", "target"], 2);

    const expected = {
      level1: { invalid: { target: 2 }, level2: { target: 1 } },
    };
    expect(output).toStrictEqual(expected);
  });

  it("can ignore setting with missing nested path", () => {
    const input = { level1: { level2: { target: 1 } } };

    const output = setDeep(input, ["level1", "invalid", "target"], 2, false);

    const expected = { level1: { level2: { target: 1 } } };
    expect(output).toStrictEqual(expected);
  });

  it("can set with mismatching nested type", () => {
    const input = { level1: { level2: 1 } };

    const output = setDeep(input, ["level1", "level2", "target"], 2, true);

    const expected = { level1: { level2: { target: 2 } } };
    expect(output).toStrictEqual(expected);
  });
});
