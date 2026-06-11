/**
 * Default Expo Metro config. The workspace uses pnpm's hoisted node-linker
 * (see root .npmrc), so no monorepo resolution overrides are needed —
 * expo/metro-config detects the workspace root on its own.
 */
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
