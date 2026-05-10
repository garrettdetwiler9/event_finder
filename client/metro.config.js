const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

// Explicitly map the @event-finder/shared package name to its folder on disk.
// This is belt-and-suspenders on top of the npm workspace symlink — Metro can
// be unreliable about following symlinks outside the project root, so we give
// it a direct path so there is no ambiguity.
config.resolver.extraNodeModules = {
  '@event-finder/shared': path.resolve(workspaceRoot, 'shared'),
};

module.exports = withNativeWind(config, { input: './global.css' });
