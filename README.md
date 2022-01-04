# `localize` CLI

CLI interface for comparing/validating `i18n` localization files.

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
  localize compare  Compare a translation file against a base file
```

### `compare`

i18n files can be compared together to ensure that all localization strings from a base file are present in another file. For example, to ensure all English strings are present in the French localization file. Partial comparisons (ie. for override files) are possible with the `--ignore-missing` flag (will skip missing keys).

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
