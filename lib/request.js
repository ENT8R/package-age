/* eslint-disable consistent-return */
import https from 'https';

export default url => {
  return new Promise((resolve, reject) => {
    if (typeof url === 'undefined') {
      return reject(new TypeError('Please specify an URL'));
    }

    const request = https.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error(`Failed to load page, status code: ${response.statusCode}`));
      }
      let body = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => {
        body = body.join('');
        const content = response.headers['content-type'];
        if (content.includes('application/json')) {
          body = JSON.parse(body);
        }
        resolve(body);
      });
    });
    request.on('error', reject);
  });
};
