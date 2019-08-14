const request = require('./request');
const versions = require('./versions');

module.exports = (config, name, version) => {
  return request(`${config.registry}/${name}`).then(body => {
    const valid = versions.valid(version);
    return {
      name,
      valid,
      version: valid ? version : null,
      date: valid ? body.time[version] : null,
      latest: body['dist-tags'].latest
    };
  });
};
