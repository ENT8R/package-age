#!/usr/bin/env node

const chalk = require('chalk');
const commander = require('commander');
const https = require('https');
const readPkg = require('read-pkg');
const semver = require('semver');

const config = {
  version: '0.1.3',
  registry: 'https://registry.npmjs.org/',
  cli: true,
  oldAfter: {
    years: 2,
    months: 0
  }
};

commander
  .version(config.version, '-v, --version')
  .description('A CLI for detecting old dependencies used in your project')
  .option('-f, --file [optional]', 'path to the package.json')

  .option('-y, --year [optional]', 'after how much years a package should be considered old')
  .option('-m, --month [optional]', 'after how much months a package should be considered old')

  .option('-a, --all', 'parameter to get all kinds of dependencies')
  .option('-d, --dev', 'parameter to get the devDependencies')
  .option('-p, --peer', 'parameter to get the peerDependencies')
  .option('-b, --bundled', 'parameter to get the bundledDependencies')
  // .option('-o, --optional', 'parameter to get the optionalDependencies')
  .parse(process.argv);

const Dependencies = (() => {
  const me = {};

  const Types = {
    NORMAL: 'dependencies',
    DEV: 'devDependencies',
    PEER: 'peerDependencies',
    BUNDLED: 'bundledDependencies',
    // OPTIONAL: 'optionalDependencies',
    short: {
      devDependencies: chalk.blue.bold('(dev)'),
      peerDependencies: chalk.magenta.bold('(peer)'),
      bundledDependencies: chalk.cyan.bold('(bundled)'),
      // optionalDependencies: chalk.yellow.bold('(optional)')
    }
  };

  me.get = function(path) {
    readPkg(path).then(pkg => {
      // always read the normal dependencies
      process(pkg.dependencies, Types.NORMAL);

      if (commander.dev || commander.all) {
        process(pkg.devDependencies, Types.DEV);
      }
      if (commander.peer || commander.all) {
        process(pkg.peerDependencies, Types.PEER);
      }
      if (commander.bundled || commander.all) {
        process(pkg.bundledDependencies, Types.BUNDLED);
      }
      /* if (commander.optional || commander.all) {
        process(pkg.optionalDependencies, Types.OPTIONAL);
      }*/
    });
  };

  async function process(dependencies, type) {
    const packages = [];
    for (const dependency in dependencies) {
      if (dependencies.hasOwnProperty(dependency)) {
        const version = dependencies[dependency];
        const output = await info(dependency, Versions.clean(version), type);
        packages.push(output);
      }
    }
    if (packages.length > 0) {
      console.log(packages.join('\n'), '\n'); // eslint-disable-line no-console
    }
  }

  function info(name, version, type) {
    return new Promise((resolve, reject) => {
      request(`${config.registry}${name}`).then((body) => {
        const v = Versions.compare(version, body['dist-tags'].latest);
        const d = Dates.compare(body.time[version]);
        if (type === Types.NORMAL) {
          resolve(`${name} ${v} ${d}`);
        } else {
          resolve(`${name} ${Types.short[type]} ${v} ${d}`);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }

  return me;
})();

const Versions = (() => {
  const me = {};

  me.compare = function(v, l) {
    const compare = semver.compare(v, l);
    if (compare === -1) {
      return `${chalk.bgRed.bold(v)} => ${chalk.bgGreen.bold(l)}`;
    } else {
      return chalk.bgGreen.bold(v);
    }
  };

  me.clean = function(v) {
    // TODO: maybe some more methods or even an external library are needed here
    v = v.trim();
    v = v.replace(/\^/g, '');
    v = v.replace(/~/g, '');
    return v;
  };

  return me;
})();

const Dates = (() => {
  const me = {};

  me.compare = function(d) {
    const x = new Date();
    x.setFullYear(x.getFullYear() - config.oldAfter.years);
    x.setMonth(x.getMonth() - config.oldAfter.months);
    const y = new Date(d);

    if (x <= y) {
      return chalk.bgGreen.bold(d);
    } else {
      return chalk.bgRed.bold(d);
    }
  };

  me.init = function() {
    if (commander.year) {
      config.oldAfter.years = commander.year;
    }
    if (commander.month) {
      config.oldAfter.months = commander.month;
    }
  };

  return me;
})();

function request(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(JSON.parse(body.join(''))));
    });
    request.on('error', (err) => reject(err));
  });
}

if (require.main === module) {
  Dependencies.get(commander.file || 'package.json');
} else {
  // TODO: add also a real API (not only a CLI)
  config.cli = false;

  exports.Versions = Versions;
  exports.Dates = Dates;
}

Dates.init();
