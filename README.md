# request
Minimalist HTTP request, Only dependency `iconv-lite`.

## Install

```bash
npm i @junyiz/request
```

## Requirements

You will need [iconv-lite](https://github.com/ashtuchkin/iconv-lite)

## Usage

```javascript
const request = require('@junyiz/request');

(async () => {
  const repo = await request({
    url: 'https://api.github.com/repos/junyiz/request',
    json: true,
    headers: { 'User-Agent': '@junyiz/request' }
  });
  console.log('repos id: ' + repo.id + ' repos name: ' + repo.full_name);
})();
```

## Options

#### url

Type: String

#### data

Type: String  
Default: ''

#### json

Type: Boolean  
Default: false

Parse response body with `JSON.parse`.

#### headers

Type: Object  
Default: {}

#### method

Type: String  
Default: GET

#### timeout

Type: Number  
Default: 60 * 1000

Milliseconds to wait for a server to send response headers before aborting request with `ETIMEDOUT` error.

#### retries

Type: Number  
Default: 2

#### encoding

Type: string  
Default: 'utf8'


## License

Copyright (c) 2018-2019 junyiz. Licensed under the MIT license.
