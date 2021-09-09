import chalk from 'chalk';
import semver from 'semver';

export function compare(v, l) {
  const compare = semver.compare(v, l);
  if (compare === -1) {
    return `${chalk.bgRed.bold(v)} => ${chalk.bgGreen.bold(l)}`;
  } else {
    return chalk.bgGreen.bold(v);
  }
}

export function clean(v) {
  // TODO: maybe some more methods or even an external library are needed here
  v = v.trim();
  v = v.replace(/\^/g, '');
  v = v.replace(/~/g, '');
  return v;
}

export function valid(v) {
  return semver.valid(v) !== null;
}
