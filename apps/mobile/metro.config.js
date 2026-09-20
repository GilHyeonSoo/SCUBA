const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// pnpm monorepo: resolve hoisted deps from the workspace root, but only watch app source.
config.watchFolders = [projectRoot];
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
const escapedWorkspaceRoot = workspaceRoot.replace(/[/\\]/g, '[/\\\\]');

// Google Drive / macOS sync artifacts should never trigger Metro reloads.
const syncArtifactPattern = /[/\\]\.(DS_Store|tmp\.driveupload|tmp\.drivedownload)([/\\]|$)/;

config.resolver.blockList = [
  new RegExp(`^${escapedProjectRoot}[/\\\\]ios[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]android[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]\\.expo[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]dist[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]web-build[/\\\\].*`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]expo-env\\.d\\.ts$`),
  new RegExp(`^${escapedProjectRoot}[/\\\\]\\.metro-health-check.*`),
  new RegExp(`^${escapedWorkspaceRoot}[/\\\\]\\.git[/\\\\].*`),
  new RegExp(`^${escapedWorkspaceRoot}[/\\\\]Scrum[/\\\\].*`),
  new RegExp(`^${escapedWorkspaceRoot}[/\\\\]\\.cursor[/\\\\].*`),
  new RegExp(`^${escapedWorkspaceRoot}[/\\\\]supabase[/\\\\]\\.temp[/\\\\].*`),
  syncArtifactPattern,
];

config.watcher = {
  ...config.watcher,
  healthCheck: {
    enabled: true,
    interval: 3000,
    timeout: 5000,
  },
  additionalExclusions: [
    path.join(projectRoot, 'node_modules'),
    path.join(projectRoot, 'ios'),
    path.join(projectRoot, 'android'),
    path.join(projectRoot, '.expo'),
    path.join(projectRoot, 'dist'),
    path.join(projectRoot, 'web-build'),
    path.join(projectRoot, 'expo-env.d.ts'),
    path.join(workspaceRoot, '.git'),
    path.join(workspaceRoot, 'Scrum'),
    path.join(workspaceRoot, '.cursor'),
    path.join(workspaceRoot, 'supabase', '.temp'),
  ],
};

const mapboxWebStub = path.resolve(projectRoot, 'src/services/mapbox.web.ts');
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
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
