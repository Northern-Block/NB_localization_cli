module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/transform-runtime",
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "@services": "./src/services",
          "@typings": "./src/types",
          "@utilities": "./src/utilities",
        },
      },
    ],
  ],
};
