#!/usr/bin/env node

const chalk = require('chalk');
const Table = require('cli-table3');
const commander = require('commander');
const https = require('https');
const readPkg = require('read-pkg');
const semver = require('semver');

const config = {
  version: '0.1.4',
  registry: 'https://registry.npmjs.org/',
  cli: true,
  oldAfter: {
    years: 2,
    months: 0
  }
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
  .option('-f, --file [optional]', 'path to the package.json')

  .option('-y, --year [optional]', 'after how much years a package should be considered old')
  .option('-m, --month [optional]', 'after how much months a package should be considered old')

  .option('-a, --all', 'parameter to get all kinds of dependencies')
  .option('-d, --dev', 'parameter to get the devDependencies')
  .option('-p, --peer', 'parameter to get the peerDependencies')
  .option('-b, --bundled', 'parameter to get the bundledDependencies')
  .parse(process.argv);

const Dependencies = (() => {
  const me = {};

  const Types = {
    NORMAL: 'dependencies',
    DEV: 'devDependencies',
    PEER: 'peerDependencies',
    BUNDLED: 'bundledDependencies',
    short: {
      devDependencies: chalk.blue.bold('dev'),
      peerDependencies: chalk.magenta.bold('peer'),
      bundledDependencies: chalk.cyan.bold('bundled'),
    }
  };

  me.get = function(path, options) {
    return new Promise((resolve, reject) => {
      readPkg(path).then(async (pkg) => {
        const result = {};
        // always read the normal dependencies
        result.dependencies = await p(pkg.dependencies, Types.NORMAL);

        if (commander.dev || commander.all || options.dev || options.all) {
          result.devDependencies = await p(pkg.devDependencies, Types.DEV);
        }
        if (commander.peer || commander.all || options.peer || options.all) {
          result.peerDependencies = await p(pkg.peerDependencies, Types.PEER);
        }
        if (commander.bundled || commander.all || options.bundled || options.all) {
          result.bundledDependencies = await p(pkg.bundledDependencies, Types.BUNDLED);
        }
        if (require.main === module) {
          console.log(table.toString()); // eslint-disable-line no-console
        } else {
          resolve(result);
        }
      }).catch((e) => {
        reject(e);
      });
    });
  };

  async function p(dependencies, type) {
    const packages = [];
    for (const dependency in dependencies) {
      if (dependencies.hasOwnProperty(dependency)) {
        try {
          const version = dependencies[dependency];
          const output = await info(dependency, Versions.clean(version), type);
          packages.push(output);
        } catch (e) {
          /* eslint-disable no-console */
          console.log(chalk.bgRed.bold(
            'Something went wrong during requesting the information from the server.\nAre you sure you are connected to the internet?'
          ));
          /* eslint-enable no-console */
          process.exit(1);
        }
      }
    }
    return packages;
  }

  function info(name, version, type) {
    return new Promise((resolve, reject) => {
      request(`${config.registry}${name}`).then((body) => {
        if (Versions.valid(version) === false) {
          const text = chalk.bgRed.bold(`supplied invalid version: '${version}'`);
          const res = {
            name,
            type: null,
            version: text,
            date: null
          };
          table.push(Object.values(res));
          resolve(res);
        }
        const v = Versions.compare(version, body['dist-tags'].latest);
        const d = Dates.compare(body.time[version]);
        if (type === Types.NORMAL) {
          const res = {
            name,
            type: null,
            version: v,
            date: d
          };
          table.push(Object.values(res));
          resolve(res);
        } else {
          const res = {
            name,
            type: Types.short[type],
            version: v,
            date: d
          };
          table.push(Object.values(res));
          resolve(res);
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

  me.valid = function(v) {
    return semver.valid(v) !== null;
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
    // TODO: add the locale as a parameter
    d = new Date(d).toLocaleString();

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
  config.cli = false;
  exports.Dependencies = Dependencies;
  exports.Versions = Versions;
  exports.Dates = Dates;
}

Dates.init();
