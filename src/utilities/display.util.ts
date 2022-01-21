import chalk from "chalk";

/**
 * Add a character to a string multiple times
 *
 * @param   amount - Number of times to add
 * @param   char   - Repeated character
 * @returns Repeated character string
 */
const addCharacter = (amount: number, char: string): string => {
  const safeAmount = Math.max(0, amount);

  return Array(safeAmount + 1).join(char);
};

/**
 * Add a number of spaces (for indentation)
 *
 * @param   spaces - Number of spaces
 * @returns Indentation spaces
 */
const addSpaces = (spaces: number): string => {
  return addCharacter(spaces, " ");
};

/**
 * Join parents (and key) together for display
 *
 * @param   parents - Parent keys
 * @param   key     - Current key
 * @returns Joined parent keys
 */
const joinParents = (parents: string[], key?: string): string => {
  const finalList = key ? [...parents, key] : parents;
  return finalList.join(" -> ");
};

/**
 * Add dots to indicate association
 *
 * @param   amount - Number of dots
 * @returns Formatted dot string
 */
const makeDots = (amount: number): string => {
  return chalk.dim(addCharacter(amount, "."));
};

/**
 * Print a console message
 *
 * @param message - Message
 */
const print = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

export { addCharacter, addSpaces, joinParents, makeDots, print };
