# `localize` CLI

CLI interface for comparing/validating and generating `i18n` localization files.

## Usage

The CLI commands can be run in several ways, either as a linked NPM module (normal) or locally (when developing).

> **NOTE:** Dependencies must be installed with `npm install` before running for the first time!

```sh
# Install as a globally linked NPM module
npm run local:install
localize -h

# Run locally
npm run local:run -- -h
```

## Caveats

- ES6 modules are not supported for comparison!
  - Due to Node restrictions, ES6 modules are not supported for comparison (will result in "unexpected token" errors). Instead, please use `module.exports` as a workaround until a permanent solution can be found.

## Commands

```
Commands:
  localize compare   Compare a translation file against a base file
  localize generate  Generate a translation file from an input spreadsheet
```

### `compare`

i18n files can be compared together to ensure that all localization strings from a base file are present in another file. For example, to ensure all English strings are present in the French localization file. Partial comparisons (ie. for override files) are possible with the `--ignore-missing` flag (will skip missing keys).

#### API

```
localize compare

Compare a translation file against a base file

Options:
      --base            Base translation file in comparison                      [string] [required]
      --compare         Comparison translation file                              [string] [required]
      --ignore-missing  Whether missing values should be ignored (useful for override files)
                                                                          [boolean] [default: false]
      --ignore-same     Whether same values should be ignored (can indicate missing translation)
                                                                          [boolean] [default: false]
```

```sh
localize compare --base ./src/examples/translations.en.json --compare ./src/examples/translations.es.json
```

> **NOTE:** Values that are the same between files may not be an issue; however, it may indicate a missed translation!

### `generate`

i18n files can be generated from a (specifically formatted) Excel spreadsheet. The tool generates the output JSON from a specific `path` mapping to the section/key/value columns. For example, a path like `"Section,Name,Default English"` would use the `"Section"` column as the collection specifier, the `"Name"` column as the localization key, and the `"Default English"` column as the localization value.

A localization spreadsheet with several languages would simply require running the tool multiple times (per language). Another common pattern is using the same localization spreadsheet for optional override output. Since the tool automatically ignores rows missing either a key or value, this workflow is supported by default (see [example](./input/asset.xlsx)).

#### Formatting

The required formatting is relatively forgiving, but does have some expectations. By default, the first line of each worksheet must contain the column headers! This can be customized with the `--header-row` argument; however, note that this will ignore all previous rows! Sections (and subsections) are distinguished by the presence of a section/subsection column value. Any rows without a key/value will be ignored, allowing for additional content to be included without changing output (ie. end notes, etc). An example of the supported formats has been provided below.

| Section | Subsection | Key | Value | Description |
|---------|------------|-----|-------|-------------|
| simple
| | | key | value | Subsections are entirely optional
| complex
| | sub | | | Subsections are optional (but supported)
| | | key | value | Highly nested value
| | another | | value | Items without a key or value will be skipped
| flattened | sub | key | value | "Flattened" entries are supported
| | | another | something

#### API

```
localize generate

Generate a translation file from an input spreadsheet

Options:
      --input      Input translation file used for generation                    [string] [required]
      --output     Output generated JSON file                                    [string] [required]
      --path       Column path for parsing values (comma separated)              [string] [required]
      --worksheet  Target worksheet name                                    [string] [default: null]
```

```sh
localize generate --input input/asset.xlsx --output output/asset.json --worksheet "screens" --path "Section,Name,Default English"
```
