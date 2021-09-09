import chalk from 'chalk';
import { readPackage } from 'read-pkg';

import info from './information.js';
import * as versions from './versions.js';

export async function get(config) {
  const pkg = await readPackage(config.file);
  const result = {};

  // Always read the normal dependencies if they are available
  if (pkg.dependencies) {
    result.dependencies = await packages(config, pkg.dependencies);
  }

  if (pkg.devDependencies && (config.dependencies.dev || config.dependencies.all)) {
    result.devDependencies = await packages(config, pkg.devDependencies);
  }
  if (pkg.peerDependencies && (config.dependencies.peer || config.dependencies.all)) {
    result.peerDependencies = await packages(config, pkg.peerDependencies);
  }
  if (pkg.bundledDependencies && (config.dependencies.bundled || config.dependencies.all)) {
    result.bundledDependencies = await packages(config, pkg.bundledDependencies);
  }

  return result;
}

function packages(config, dependencies) {
  if (Object.keys(dependencies).length === 0) {
    return Promise.resolve();
  }

  const information = [];

  for (const [dependency, version] of Object.entries(dependencies)) {
    try {
      information.push(
        info(config, dependency, versions.clean(version))
      );
    } catch (e) {
      /* eslint-disable no-console */
      console.log(chalk.bgRed.bold(
        'Something went wrong during requesting the information from the server.\nAre you sure you are connected to the internet?'
      ));
      /* eslint-enable no-console */
    }
  }

  return Promise.all(information);
}
