const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

function resolvePackageRoot(packageName) {
  return path.dirname(require.resolve(`${packageName}/package.json`));
}

config.resolver.extraNodeModules = {
  '@expo/log-box': resolvePackageRoot('@expo/log-box'),
  '@expo/metro-runtime': resolvePackageRoot('@expo/metro-runtime'),
  expo: resolvePackageRoot('expo'),
};

const escapedProjectRoot = projectRoot.replace(/[/\\]/g, '[/\\\\]');

config.resolver.blockList = [
  new RegExp(`^${escapedProjectRoot}[/\\\\]ios[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]android[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]\\.expo[/\\\\].*`),
];

config.watcher = {
  ...config.watcher,
  additionalExclusions: [
    path.join(projectRoot, 'ios'),
    path.join(projectRoot, 'android'),
    path.join(projectRoot, '.expo'),
  ],
};

const mapboxWebStub = path.resolve(projectRoot, 'src/services/mapbox.web.ts');
const expoHmrEntry = require.resolve('expo/src/async-require/hmr.ts');
const expoLogBoxEntry = require.resolve('@expo/log-box/src/LogBox.ts');
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'expo/src/async-require/hmr' ||
    moduleName === 'expo/src/async-require/hmr.ts'
  ) {
    return {
      filePath: expoHmrEntry,
      type: 'sourceFile',
    };
  }

  if (
    moduleName === '@expo/log-box/src/LogBox' ||
    moduleName === '@expo/log-box/src/LogBox.ts'
  ) {
    return {
      filePath: expoLogBoxEntry,
      type: 'sourceFile',
    };
  }

  if (platform === 'web' && moduleName === '@rnmapbox/maps') {
    return {
      filePath: mapboxWebStub,
      type: 'sourceFile',
    };
  }

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
