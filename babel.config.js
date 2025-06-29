module.exports = function (api) {
  const isTest = api.env('test');

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: isTest ? { node: "current" } : "> 0.25%, not dead",
          useBuiltIns: "entry",
          corejs: 3,
        },
      ],
    ],
  };
};
