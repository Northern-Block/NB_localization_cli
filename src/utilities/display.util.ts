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

export { addCharacter, addSpaces, makeDots, print };
