/* globals describe */
/* globals it */

// TODO: add some more tests

const chai = require('chai');
const chalk = require('chalk');

const assert = chai.assert;
/* const expect = chai.expect;
const should = chai.should();*/

const packageAge = require('../index.js');

describe('Versions', () => {
  describe('#compare()', () => {
    it('should return the version in red and bold and the new version in green and bold', () => {
      const result = packageAge.Versions.compare('1.2.0', '1.3.0');
      assert.equal(result, `${chalk.bgRed.bold('1.2.0')} => ${chalk.bgGreen.bold('1.3.0')}`);
    });
    it('should return the version in green and bold', () => {
      const result = packageAge.Versions.compare('1.3.0', '1.3.0');
      assert.equal(result, chalk.bgGreen.bold('1.3.0'));
    });
    it('should return the version in green and bold', () => {
      const result = packageAge.Versions.compare('1.4.0', '1.3.0');
      assert.equal(result, chalk.bgGreen.bold('1.4.0'));
    });
  });

  describe('#clean()', () => {
    it('should return the clean version of (  ^1.2.0  )', () => {
      const result = packageAge.Versions.clean('  ^1.2.0  ');
      assert.equal(result, '1.2.0');
    });
    it('should return the clean version of (  ~1.2.0  )', () => {
      const result = packageAge.Versions.clean('  ~1.2.0  ');
      assert.equal(result, '1.2.0');
    });
  });
});

describe('Dates', () => {
  describe('#compare()', () => {
    it('should return the date in red and bold', () => {
      const x = new Date();
      x.setFullYear(x.getFullYear() - 3);
      const result = packageAge.Dates.compare(x);
      assert.equal(result, chalk.bgRed.bold(x));
    });
    it('should return the date in green and bold', () => {
      const x = new Date();
      x.setFullYear(x.getFullYear() - 1);
      const result = packageAge.Dates.compare(x);
      assert.equal(result, chalk.bgGreen.bold(x));
    });
  });
});
