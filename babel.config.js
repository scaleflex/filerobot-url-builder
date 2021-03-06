module.exports = function (api) {
  api.cache(false);

  const presets = [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": [
            "last 2 versions",
            "ie 11"
          ]
        }
      }
    ],
    "@babel/preset-react"
  ];

  const plugins = [
    "@babel/plugin-transform-object-assign",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-syntax-jsx",
    "@babel/plugin-transform-react-jsx",
    "@babel/plugin-transform-destructuring",
    "react-hot-loader/babel",
    "react-loadable/babel"
  ];

  return {
    presets,
    plugins
  };
}