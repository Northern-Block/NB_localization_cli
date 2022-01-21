import chalk from "chalk";
import { Arguments, CommandModule } from "yargs";

// Utilities
import { FileService } from "@services";
import { addSpaces, makeDots, print } from "@utilities/display.util";
import { compareObjects, isObject } from "@utilities/object.util";

// Types
import { JSONObject } from "@typings/app.types";
import {
  Comparison,
  ComparisonDescriptionMap,
  ComparisonDisplay,
  ComparisonOutput,
  ComparisonOutputConfig,
  ComparisonOutputMap,
} from "@typings/compare.types";

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

interface ICompareArgs extends Arguments {
  /** Base translation file for comparison */
  base: string;
  /** Target translation file being compared */
  compare: string;
  /** Whether missing values should be ignored (useful for override files) */
  "ignore-missing": boolean;
  /** Whether same values should be ignored (can indicate missed translation) */
  "ignore-same": boolean;
}

////////////////////////////////////////////////////////////////////////////////
// Command
////////////////////////////////////////////////////////////////////////////////

const CompareCommand: CommandModule = {
  command: "compare",
  describe: "Compare a translation file against a base file",
  builder: {
    base: {
      demandOption: true,
      description: "Base translation file in comparison",
      type: "string",
    },
    compare: {
      demandOption: true,
      describe: "Comparison translation file",
      type: "string",
    },
    "ignore-missing": {
      default: false,
      describe:
        "Whether missing values should be ignored (useful for override files)",
      type: "boolean",
    },
    "ignore-same": {
      describe:
        "Whether same values should be ignored (can indicate missing translation)",
      default: false,
      type: "boolean",
    },
  },
  handler: async (argv: Arguments): Promise<void> => {
    const args = argv as ICompareArgs;

    const { base, compare } = args;

    let baseFile: JSONObject;
    try {
      baseFile = await FileService.readTranslationFile(base);
    } catch (e: any) {
      print(chalk.redBright("Error parsing base file"));
      print(e.message);
      return;
    }

    let inputFile: JSONObject;
    try {
      inputFile = await FileService.readTranslationFile(compare);
    } catch (e: any) {
      print(chalk.redBright("Error parsing input file"));
      print(e.message);
      return;
    }

    const outputConfig: ComparisonOutputConfig = {
      ignoreMissing: args["ignore-missing"] ?? false,
      ignoreSame: args["ignore-same"] ?? false,
    };
    const comparison = compareObjects(
      baseFile,
      inputFile,
      [],
      // Extend base output function based on command args
      (...args) => createComparisonOutput(outputConfig, ...args),
      comparisonFilter,
    );

    const comparisonDisplay = createComparisonDisplay(comparison, []);

    printComparison(comparisonDisplay);
  },
};

////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////

/**
 * Comparison callback to filter out specific keys/values
 *
 * @param   key     - Comparison key
 * @param   value1  - Base value
 * @param   value2  - Comparison value
 * @returns Whether key should be included in comparison
 */
const comparisonFilter = (key: string, value1: any, value2: any): boolean => {
  // Ignore comment/explanation keys
  if (key.startsWith("_comment")) return false;
  // Completely ignore array comparisons
  if (Array.isArray(value1) && Array.isArray(value2)) return false;
  return true;
};

/**
 * Callback to generate output from comparison
 *
 * NOTE: Use of recursion ensures that nested objects are compared before the parent
 *         object, which is useful for a variety of use cases.
 *
 * @param   value1          - Base value
 * @param   value2          - Comparison value
 * @param   key             - Comparison key
 * @param   parents         - List of parents for key
 * @param   childComparison - Child comparison object (from nested object recursion)
 * @param   config          - Comparison output config
 * @returns Generated comparison output
 */
const createComparisonOutput = (
  config: Partial<ComparisonOutputConfig>,
  value1: any,
  value2: any,
  key: string,
  parents: string[] = [],
  childComparison?: ComparisonOutputMap,
): ComparisonOutput | undefined => {
  let result;

  const typesAreEqual = typeof value1 === typeof value2;
  const valuesAreEqual = value1 === value2;

  // NOTE: Can return 'undefined' from a check to "skip" the key/values in output!

  // NOTE: Order of comparison checks is very important to avoid skipping conditions!
  if (isObject(value1) && isObject(value2)) {
    // NOTE: Could return 'childComparison' to avoid nesting under 'children' key
  } else if (value1 !== "" && value2 === "") {
    result = Comparison.EMPTY;
  } else if (value1 && !value2) {
    if (config.ignoreMissing) return undefined;
    result = Comparison.MISSING;
  } else if (!value1 && value2) {
    result = Comparison.EXTRA;
  } else if (valuesAreEqual) {
    if (config.ignoreSame) return undefined;
    result = Comparison.SAME;
  } else if (!typesAreEqual) {
    result = Comparison.DIFFERENT_TYPE;
  } else if (typesAreEqual && !valuesAreEqual) {
    result = Comparison.DIFFERENT_VALUES;
  } else {
    result = Comparison.UNHANDLED;
  }

  // Sections should track their total issues (useful later)
  let sectionIssues = 0;
  if (childComparison) {
    for (const childKey in childComparison) {
      const child = childComparison[childKey];

      // NOTE: Something is not calculating properly when sections have issues (ie missing)!

      // Different values (but same type) are ignored in this use case
      if (child.result && child.result !== Comparison.DIFFERENT_VALUES) {
        sectionIssues++;
      }

      if (child.issues) {
        sectionIssues += child.issues;
      }
    }
  }

  return {
    children: childComparison ?? undefined,
    parents: parents.length ? parents : undefined,
    result: result as Comparison,
    issues: childComparison ? sectionIssues : undefined,
  };
};

/**
 * Recursively generate a list of comparison displays
 *
 * @param   comparison - Comparison object
 * @param   results    - Result display list
 * @returns Result display list
 */
const createComparisonDisplay = (
  comparison: ComparisonOutputMap,
  results: ComparisonDisplay[],
): ComparisonDisplay[] => {
  for (const key in comparison) {
    const isSection =
      typeof comparison[key] === "object" && Boolean(comparison[key].children);

    // Skip sections without any "issues"
    if (isSection && !comparison[key].issues) continue;

    const result: ComparisonDisplay = {
      key,
      issues: comparison[key].issues,
      result: comparison[key].result,
      parents: comparison[key].parents,
      type: isSection ? "section" : "value",
    };

    if (isSection) {
      results.push(result);

      createComparisonDisplay(
        comparison[key].children as ComparisonOutputMap,
        results,
      );
    } else {
      // Non-different values can be ignored
      if (comparison[key].result !== Comparison.DIFFERENT_VALUES) {
        results.push(result);
      }
    }
  }

  return results;
};

/**
 * Display the comparison results
 *
 * @param comparisons - Comparison display results
 */
const printComparison = (comparisons: ComparisonDisplay[]): void => {
  if (!comparisons.length) {
    print(chalk.green("Comparison file has no issues"));
    return;
  }

  const longestResultKey = comparisons.reduce((accum, result) => {
    const indentLevel = result.parents?.length ?? 0;

    let nameLength = result.key.length;
    nameLength += indentLevel * 2;

    return nameLength > accum ? nameLength : accum;
  }, 0);

  const longestComparisonKey = comparisons.reduce((accum, result) => {
    if (!result.result) return accum;
    const item = ComparisonDescriptionMap[result.result];
    const length = item.description.length;
    return length > accum ? length : accum;
  }, 0);

  comparisons.forEach((c) => {
    let line = "";

    if (!c.parents?.length) {
      line += "\n";
    }

    const resultString = c.result
      ? ComparisonDescriptionMap[c.result].description
      : "";
    const issueString = c.issues ? `${c.issues} issues` : "";

    const keyIndent = addSpaces((c.parents?.length ?? 0) * 2);
    const keyString = `${keyIndent}${c.key}`;
    const keyPadding = longestResultKey - keyString.length;
    line += `${keyString} ${makeDots(keyPadding + 1)}`;

    if (c.result) {
      const comparisonResult = ComparisonDescriptionMap[c.result];
      const resultPadding = longestComparisonKey - resultString.length;
      const colouredResult =
        comparisonResult.type === "warning"
          ? chalk.yellow(resultString)
          : chalk.red(resultString);
      line += ` ${colouredResult} ${makeDots(resultPadding)} `;
    } else {
      line += `${makeDots(longestComparisonKey + 2)} `;
    }

    line += issueString;

    print(line);
  });
};

export default CompareCommand;
