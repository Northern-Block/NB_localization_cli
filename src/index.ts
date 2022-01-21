#!/usr/bin/env node

import yargs from "yargs";

// Utilities
import CompareCommand from "./commands/compare";
import GenerateCommand from "./commands/generate";

// Utilities
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("../package.json");

yargs
  .scriptName("localize")
  .usage("$0 <cmd> [args]")
  .version(version)
  .alias("h", "help")
  .alias("v", "version")
  .strict(true)
  .command(CompareCommand)
  .command(GenerateCommand)
  .demandCommand(1, "No default behaviour")
  .wrap(Math.min(100, yargs.terminalWidth()))
  .help().argv;
