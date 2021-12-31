#!/usr/bin/env node

import yargs from "yargs";

// Utilities
import CompareCommand from "./commands/compare";

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
  .demandCommand(1, "No default behaviour")
  .wrap(Math.min(100, yargs.terminalWidth()))
  .help().argv;
