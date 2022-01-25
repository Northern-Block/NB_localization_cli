import chalk from "chalk";
import Excel from "exceljs";
import fs from "fs";
import { Arguments, CommandModule } from "yargs";

// Utilities
import { print } from "@utilities/display.util";
import { setDeep } from "@utilities/object.util";

// Types
import {
  IGenerateLocalizationOutput,
  IPathPart,
  IPathCell,
} from "@typings/generate.types";

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

interface IGenerateArgs extends Arguments {
  /**
   * Whether newline characters in values should be escaped.
   *
   * By default, ExcelJS will escape newline characters in translation values,
   *   which will be passed on to the output JSON, resulting in '\\n' characters.
   *   This can be disabled to pass the '\n' newline character directly to JSON.
   */
  "escape-newlines": boolean;
  /**
   * Column headers row number
   *
   * NOTE: Dangerous to change (will ignore all previous rows)!
   */
  "header-row": number;
  /** Input translation file */
  input: string;
  /** Output generated file */
  output: string;
  /**
   * Path for parsing file values (comma-separated)
   *
   * @example "Section,Name,Default English"
   */
  path: string;
  /** Target worksheet name */
  worksheet: string | null;
}

////////////////////////////////////////////////////////////////////////////////
// Command
////////////////////////////////////////////////////////////////////////////////

const GenerateCommand: CommandModule = {
  command: "generate",
  describe: "Generate a translation file from an input spreadsheet",
  builder: {
    "escape-newlines": {
      default: false,
      description:
        "Whether newline characters should be automatically escaped ('\\\\n')",
      type: "boolean",
    },
    "header-row": {
      default: 1,
      description: "Row number for column headers",
      type: "number",
    },
    input: {
      demandOption: true,
      description: "Input translation file used for generation",
      type: "string",
    },
    output: {
      demandOption: true,
      description: "Output generated JSON file",
      type: "string",
    },
    path: {
      demandOption: true,
      description: "Column path for parsing values (comma separated)",
      type: "string",
    },
    worksheet: {
      default: null,
      description: "Target worksheet name",
      type: "string",
    },
  },
  handler: async (argv: Arguments): Promise<void> => {
    const args = argv as IGenerateArgs;

    const {
      "escape-newlines": escapeNewlines,
      "header-row": headerRow,
      input,
      output: outputFile,
      path,
      worksheet: worksheetName = null,
    } = args;

    const workbook = new Excel.Workbook();
    try {
      await workbook.xlsx.readFile(`${input}`);
    } catch {
      print(chalk.red(`Could not parse input Excel file (${input})`));
      return;
    }

    const worksheet = worksheetName
      ? workbook.getWorksheet(worksheetName)
      : workbook.worksheets[0];
    if (!worksheet) {
      print(chalk.red(`Could not find worksheet (${worksheetName})`));
      return;
    }

    // Validate that all path columns exist
    const pathParts = path?.split(",").filter((p) => p);
    const paths = getPathParts(worksheet, pathParts, headerRow);
    if (paths.length < 2) {
      print(chalk.red(`Path must at least include key and value columns`));
      return;
    }
    const missingParts = paths.filter((p) => !p.exists);
    if (missingParts.length) {
      print(chalk.red(`Could not validate value path (${worksheetName})`));
      print("Please ensure all columns in 'path' are present in worksheet!");
      missingParts.forEach((p) => print(`  - ${p.name}`));
      return;
    }

    // Convert Excel rows/cells to expected format for generating localization file
    const rows: IPathCell[][] = [];
    worksheet.eachRow((row, rowNumber) => {
      // First worksheet row represents column headers
      if (rowNumber <= headerRow) return;

      const rowPathCells: IPathCell[] = paths.map((p, pIdx) => {
        const value = row.getCell(p.column).text;
        return {
          column: p.column,
          level: pIdx,
          name: p.name,
          // ExcelJS automatically escapes '\n' characters, which will result
          //   in generating JSON with '\\n' characters (likely not desired)!
          value: escapeNewlines ? value : value.replace(/\\n/g, "\n"),
        };
      });

      rows.push(rowPathCells);
    });

    const { count: keyCount, data: output } = generateLocalizationOutput(rows);
    print(chalk.green(`Parsed ${keyCount} localization keys/values`));

    const jsonOutput = JSON.stringify(output, null, 2);
    try {
      fs.writeFileSync(outputFile, jsonOutput);
    } catch {
      print(chalk.red(`Could not write output JSON file (${output})`));
      return;
    }
  },
};

////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////

/**
 * Get path/column definitions from worksheet
 *
 * @param   worksheet - Excel worksheet
 * @param   path      - Path/column definition for sections, keys, and values
 * @param   headerRow - Row number for column headers
 * @returns Path parts (validated)
 */
const getPathParts = (
  worksheet: Excel.Worksheet,
  path: string[],
  headerRow: number,
): IPathPart[] => {
  const headers = worksheet.getRow(headerRow);

  // NOTE: Inefficient looping but easiest way to check whether all
  //         parts/columns exist.
  return path.map((p) => {
    const match = {
      column: -1,
      exists: false,
      name: p,
    };

    headers.eachCell((cell) => {
      if (cell.text && cell.text === p) {
        match.column = cell.col as unknown as number;
        match.exists = true;
      }
    });

    return match;
  });
};

/**
 * Generate localization output from base data
 *
 * @param   rows - Input rows (sections/keys/values)
 * @returns Generated localization file
 */
const generateLocalizationOutput = (
  rows: IPathCell[][],
): IGenerateLocalizationOutput => {
  let output: Record<string, any> = {};
  let parents: string[] = [];
  let keyCount = 0;

  rows.forEach((row) => {
    let rowKey = "";
    let rowValue = "";

    row.forEach((cell, cellIdx) => {
      // NOTE: First items establish nesting/keys, and last item is value
      const isKey = cellIdx === row.length - 2;
      const isValue = cellIdx === row.length - 1;
      if (!cell.value) return;

      if (isKey) {
        rowKey = cell.value;
      } else if (isValue) {
        rowValue = cell.value;
      } else {
        // Replace parents from this point forward (may be nested)
        parents = [...parents.slice(0, cellIdx), cell.value];
      }
    });

    if (rowKey && rowValue) {
      output = setDeep(output, [...parents, rowKey], rowValue, true);
      keyCount++;
    }
  });

  return {
    count: keyCount,
    data: output,
  };
};

export default GenerateCommand;
