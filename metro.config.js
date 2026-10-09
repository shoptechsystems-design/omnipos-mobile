const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Native development benefits from a physical CSS file; Metro web export
  // cannot hash the generated node_modules cache reliably, so opt out there.
  forceWriteFileSystem: process.env.EXPO_EXPORT !== "1",
});
