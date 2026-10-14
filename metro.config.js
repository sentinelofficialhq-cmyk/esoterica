// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The ESM builds of the AI SDKs contain an import cycle that crashes Metro's dev-time
// React Refresh ("Cannot access … before initialization"). Their CommonJS builds use plain
// `exports.x =` assignments and load cleanly, so resolve these packages with the `require` condition.
const CJS_PACKAGES = ['@anthropic-ai/sdk', 'openai'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const useCjs = CJS_PACKAGES.some((p) => moduleName === p || moduleName.startsWith(`${p}/`));
  const ctx = useCjs ? { ...context, unstable_conditionNames: ['require', 'default'], unstable_conditionsByPlatform: {} } : context;
  return context.resolveRequest(ctx, moduleName, platform);
};

module.exports = config;
