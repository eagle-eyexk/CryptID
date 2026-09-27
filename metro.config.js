const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// Replit creates and removes workflow log files under .local while Metro runs.
// Keeping that workspace metadata out of the source watcher prevents ENOENT crashes.
config.resolver.blockList = [/\/\.local\/.*/];

module.exports = config;
