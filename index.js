import config from './lib/config.js';
import * as dependencies from './lib/dependencies.js';

export default options => dependencies.get(Object.assign({}, config, options));
