#!/usr/bin/env node

const chalk = require('chalk');
const Table = require('cli-table3');
const commander = require('commander');

const dates = require('./lib/dates');
const dependencies = require('./lib/dependencies');
const versions = require('./lib/versions');

const config = {
  version: require('./package.json').version,
  registry: 'https://registry.npmjs.org',
  file: 'package.json',
  year: 2,
  month: 0,
  dependencies: {}
};

const SHORT = {
  devDependencies: chalk.blue.bold('dev'),
  peerDependencies: chalk.magenta.bold('peer'),
  bundledDependencies: chalk.cyan.bold('bundled'),
};

const table = new Table({
  head: [
    chalk.keyword('orange').underline('Name'),
    chalk.keyword('orange').underline('Type'),
    chalk.keyword('orange').underline('Version'),
    chalk.keyword('orange').underline('Last Publish')
  ]
});

commander
  .version(config.version, '-v, --version')
  .description('A CLI for detecting old dependencies used in your project')
  .option('-f, --file [optional]', 'path to the package.json', 'package.json')

  .option('-y, --year [optional]', 'after how much years a package should be considered old', 2)
  .option('-m, --month [optional]', 'after how much months a package should be considered old', 0)

  .option('-a, --all', 'parameter to get all kinds of dependencies', false)
  .option('-d, --dev', 'parameter to get the devDependencies', false)
  .option('-p, --peer', 'parameter to get the peerDependencies', false)
  .option('-b, --bundled', 'parameter to get the bundledDependencies', false)
  .parse(process.argv);


async function cli() {
  const results = await dependencies.get(Object.assign(config, {
    file: commander.file,
    year: commander.year,
    month: commander.month,
    dependencies: {
      all: commander.all,
      dev: commander.dev,
      peer: commander.peer,
      bundled: commander.bundled
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

  console.log(table.toString()); // eslint-disable-line no-console
}


if (require.main === module) {
  cli();
} else {
  module.exports = options => dependencies.get(Object.assign(config, options));
}
