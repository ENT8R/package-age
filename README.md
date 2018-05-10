# package-age [![Build Status](https://travis-ci.org/ENT8R/package-age.svg?branch=master)](https://travis-ci.org/ENT8R/package-age)

> A CLI for detecting old dependencies used in your project

## Install

```
$ npm install package-age --global
```


## Usage

```
❯ package-age --help

    Usage: package-age [options]

    Options:

      -v, --version           output the version number
      -f, --file [optional]   path to the package.json
      -y, --year [optional]   after how much years a package should be considered old
      -m, --month [optional]  after how much months a package should be considered old
      -a, --all               parameter to get all kinds of dependencies
      -d, --dev               parameter to get the devDependencies
      -p, --peer              parameter to get the peerDependencies
      -b, --bundled           parameter to get the bundledDependencies
      -h, --help              output usage information
```

## License

GPL-3.0 © [ENT8R](https://github.com/ENT8R)
