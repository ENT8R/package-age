import { readPackageSync } from 'read-pkg';

const version = readPackageSync().version;
const registry = 'https://registry.npmjs.org';
const file = 'package.json';
const year = 2;
const month = 0;
const dependencies = {};

export default { version, registry, file, year, month, dependencies };
