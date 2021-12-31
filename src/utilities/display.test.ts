// Utilities
import { addCharacter, addSpaces } from "./display.util";

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
