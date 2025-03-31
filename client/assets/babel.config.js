module.exports = function (api) {
<<<<<<< HEAD
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
=======
    api.cache(true);
    return {
        presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
        plugins: ["react-native-reanimated/plugin"],
    };
};
>>>>>>> 168395b (App v3)
