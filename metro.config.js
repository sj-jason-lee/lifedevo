const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support package.json "exports" field (needed for @supabase/supabase-js v2.x)
config.resolver.unstable_enablePackageExports = true;

// Ensure Metro checks "require" condition for CJS resolution
config.resolver.unstable_conditionNames = ['require', 'import', 'default'];

module.exports = config;
