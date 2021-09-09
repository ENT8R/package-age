/* globals describe */
/* globals it */

import { expect } from 'chai';
import chalk from 'chalk';
import { readPackageSync } from 'read-pkg';

import * as dates from '../lib/dates.js';
import information from '../lib/information.js';
import request from '../lib/request.js';
import * as versions from '../lib/versions.js';

const version = readPackageSync().version;
const config = {
  registry: 'https://registry.npmjs.org'
};

describe('versions', () => {
  describe('#compare()', () => {
    it('should return the version in red and bold and the new version in green and bold', () => {
      const result = versions.compare('1.2.0', '1.3.0');
      expect(result).to.equal(`${chalk.bgRed.bold('1.2.0')} => ${chalk.bgGreen.bold('1.3.0')}`);
    });

    it('should return the version in green and bold', () => {
      expect(versions.compare('1.3.0', '1.3.0')).to.equal(chalk.bgGreen.bold('1.3.0'));
    });

    it('should return the version in green and bold', () => {
      expect(versions.compare('1.4.0', '1.3.0')).to.equal(chalk.bgGreen.bold('1.4.0'));
    });
  });

  describe('#clean()', () => {
    it('should return the clean version of (  ^1.2.0  )', () => {
      expect(versions.clean('  ^1.2.0  ')).to.equal('1.2.0');
    });

    it('should return the clean version of (  ~1.2.0  )', () => {
      expect(versions.clean('  ~1.2.0  ')).to.equal('1.2.0');
    });
  });

  describe('#valid()', () => {
    it('should return false for the version "latest"', () => {
      expect(versions.valid('latest')).to.equal(false);
    });

    it('should return true for the version "1.2.0"', () => {
      expect(versions.valid('1.2.0')).to.equal(true);
    });
  });
});

describe('information', function() {
  this.slow(4000);

  it('should return the information without an error', done => {
    information(config, 'package-age', version).then(() => done()).catch(done);
  });

  it('should return the correct information when using the latest version', () => {
    return information(config, 'package-age', version).then(result =>
      expect(result).to.be.an('object')
        .and.to.have.all.keys('name', 'valid', 'version', 'date', 'latest')
    );
  });

  it('should return the correct information when using an old version', () => {
    return information(config, 'package-age', '0.1.0').then(result =>
      expect(result).to.be.an('object')
        .and.to.have.all.keys('name', 'valid', 'version', 'date', 'latest')
        .and.to.deep.equal({
          name: 'package-age',
          valid: true,
          version: '0.1.0',
          date: '2018-05-10T18:32:13.482Z',
          latest: version
        })
    );
  });

  it('should return the correct information when searching for an invalid version', () => {
    return information(config, 'package-age', 'latest').then(result =>
      expect(result).to.be.an('object')
        .and.to.have.all.keys('name', 'valid', 'version', 'date', 'latest')
        .and.to.deep.equal({
          name: 'package-age',
          valid: false,
          version: null,
          date: null,
          latest: version
        })
    );
  });
});

describe('request', function() {
  this.slow(4000);

  it('should finish the request without an error', done => {
    request(`${config.registry}/package-age`).then(() => done()).catch(done);
  });

  it('should throw an error if no URL has been specified', () => {
    return request().then(() =>
      Promise.reject(new Error('Expected method to reject.'))
    ).catch(error =>
      expect(error).to.be.an.instanceof(TypeError).and.to.include({
        message: 'Please specify an URL'
      })
    );
  });

  it('should throw an error if no URL has been specified', () => {
    return request('https://npmjs.org/registry/package-age').then(() =>
      Promise.reject(new Error('Expected method to reject.'))
    ).catch(error =>
      expect(error).to.be.an.instanceof(Error).and.to.include({
        message: 'Failed to load page, status code: 301'
      })
    );
  });
});

describe('dates', () => {
  describe('#compare()', () => {
    it('should return the date in red and bold', () => {
      const x = new Date();
      x.setFullYear(x.getFullYear() - 3);
      expect(dates.compare(x, 2, 0)).to.equal(chalk.bgRed.bold(x.toLocaleString()));
    });

    it('should return the date in green and bold', () => {
      const x = new Date();
      x.setFullYear(x.getFullYear() - 1);
      expect(dates.compare(x, 2, 0)).to.equal(chalk.bgGreen.bold(x.toLocaleString()));
    });
  });
});
