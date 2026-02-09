const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const emptyModule = path.resolve(__dirname, 'shims', 'empty.js');

// Supabase's realtime-js imports 'ws' (a Node.js WebSocket library) which
// pulls in Node built-ins (stream, events, http, crypto, etc.) that don't
// exist in React Native. React Native provides its own global WebSocket,
// so we shim all of these to an empty module.
const nodeBuiltins = [
  'stream', 'events', 'http', 'https', 'crypto', 'net', 'tls', 'zlib',
  'url', 'bufferutil', 'utf-8-validate',
];

const extraNodeModules = {};
nodeBuiltins.forEach(function (mod) {
  extraNodeModules[mod] = emptyModule;
});

config.resolver.extraNodeModules = Object.assign(
  {},
  config.resolver.extraNodeModules,
  extraNodeModules
);

module.exports = config;
