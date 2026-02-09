const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support package.json "exports" field (needed for @supabase/supabase-js v2.x)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
