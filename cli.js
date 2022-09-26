#!/usr/bin/env node
import chalk from 'chalk';
import Table from 'cli-table3';
import { program } from 'commander';

import config from './lib/config.js';
import * as dates from './lib/dates.js';
import * as dependencies from './lib/dependencies.js';
import * as versions from './lib/versions.js';

const SHORT = {
  devDependencies: chalk.blue.bold('dev'),
  peerDependencies: chalk.magenta.bold('peer'),
  bundledDependencies: chalk.cyan.bold('bundled'),
};

const table = new Table({
  head: [
    chalk.rgb(255, 165, 0).underline('Name'),
    chalk.rgb(255, 165, 0).underline('Type'),
    chalk.rgb(255, 165, 0).underline('Version'),
    chalk.rgb(255, 165, 0).underline('Last Publish')
  ]
});

program
  .name('package-age')
  .version(config.version, '-v, --version')
  .description('A CLI for detecting old dependencies used in your project')
  .option('-f, --file [optional]', 'path to the package.json', 'package.json')

  .option('-y, --year [optional]', 'after how much years a package should be considered old', 2)
  .option('-m, --month [optional]', 'after how much months a package should be considered old', 0)

  .option('-a, --all', 'parameter to get all kinds of dependencies', false)
  .option('-d, --dev', 'parameter to get the devDependencies', false)
  .option('-p, --peer', 'parameter to get the peerDependencies', false)
  .option('-b, --bundled', 'parameter to get the bundledDependencies', false)

  // The following two options, if present, are automatically detected by chalk
  // For more information see: https://github.com/chalk/supports-color/blob/v7.1.0/index.js#L8-L19
  .option('--color', 'force colored output')
  .option('--no-color', 'force non-colored output')
  .parse(process.argv);

async function cli() {
  const options = program.opts();
  const results = await dependencies.get(Object.assign(config, {
    file: options.file,
    year: options.year,
    month: options.month,
    dependencies: {
      all: options.all,
      dev: options.dev,
      peer: options.peer,
      bundled: options.bundled
    }
  }));

  // Print the results to the console
  Object.entries(results).forEach(([key, dependencies]) => {
    dependencies.forEach(dependency => {
      let version;
      let date;

      if (dependency.valid) {
        version = versions.compare(dependency.version, dependency.latest);
        date = dates.compare(dependency.date, config.year, config.month);
      } else {
        version = chalk.bgRed.bold(`supplied invalid version: '${version}'`);
        date = null;
      }

      table.push([
        dependency.name,
        SHORT[key] || null,
        version,
        date
      ]);
    });
  });

  process.stdout.write(table.toString());
}

cli();
