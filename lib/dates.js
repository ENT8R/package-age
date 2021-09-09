import chalk from 'chalk';

/* Compares a given date (usually the date when
   a specific version of a package has been released)
   with another date which is constructed by specifying
   a year and a month after which a package is considered old */
export function compare(date, year, month) {
  const x = new Date();
  x.setFullYear(x.getFullYear() - year);
  x.setMonth(x.getMonth() - month);
  const y = new Date(date);
  // TODO: add the locale as a parameter
  date = new Date(date).toLocaleString();

  if (x <= y) {
    return chalk.bgGreen.bold(date);
  } else {
    return chalk.bgRed.bold(date);
  }
}
