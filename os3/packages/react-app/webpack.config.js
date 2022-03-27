require("setimmediate");
export const plugins = [
  new webpack.ProvidePlugin({
    setImmediate: ["setimmediate", "setImmedate"],
    clearImmediate: ["setimmediate", "clearImmedate"],
  }),
];
