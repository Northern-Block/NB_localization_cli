// Utilities
import { addCharacter, addSpaces, joinParents } from "./display.util";

describe("'addCharacters'", () => {
  it("adds repeated characters", () => {
    const output = addCharacter(5, ".");

    const expected = ".....";

    expect(output).toBe(expected);
  });
});

describe("'addSpaces'", () => {
  it("adds repeated spaces", () => {
    const output = addSpaces(4);

    const expected = "    ";

    expect(output).toBe(expected);
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
