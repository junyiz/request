const request = require('../request');

(async () => {
  let repo = await request({
    url: 'https://api.github.com/repos/junyiz/request',
    json: true,
    headers: { 'User-Agent': '@junyiz/request' }
  });
  console.log('repos name: ' + repo.full_name);
})();