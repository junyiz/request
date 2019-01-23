const http = require('http');
const https = require('https');
const { parse } = require('url');
const iconv = require('iconv-lite');

/**
 * @param {object} options
 * @param {string} options.url - 网络地址
 * @param {string} options.data - 发送的数据
 * @param {boolean} options.json - 是否使用 JSON.parse 解析 response body, 默认 false
 * @param {object} options.headers - HTTP请求头部
 * @param {object} options.method - HTTP请求方法，默认 GET
 * @param {number} options.timeout - 超时时间，默认 1 分钟
 * @param {number} options.retries - 重试次数，默认重试 2 次；为 0 时，不支持重试
 * @param {string} options.encoding - 解析 response body 的编码，默认 uft8
 * @return promise
 */
module.exports = options => {
  let {
    url,
    data = '',
    json = false,
    headers = {},
    method = 'GET',
    timeout = 60 * 1000,
    retries = 2,
    encoding = 'utf8'
  } = options;
  if (!iconv.encodingExists(encoding)) {
    throw new Error('specified encoding unsupported');
  }
  if (typeof options == 'string') url = options;
  const isHttps = url.startsWith('https');
  const { hostname, port, path } = parse(url);
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    headers['Content-Length'] = Buffer.byteLength(data);
  }
  const opts = {
    hostname,
    path,
    method,
    headers,
    port: port || (isHttps ? 443 : 80)
  };
  const httpRequest = isHttps ? https.request : http.request;
  return new Promise((resolve, reject) => {
    function wrapper(timeout, retries) {
      let isRetry = false;
      const req = httpRequest(opts, res => {
        let buf = [], size = 0;
        res.on('data', chunk => {
          buf.push(chunk);
          size += chunk.length;
        });
        res.on('end', () => {
          let str = iconv.decode(Buffer.concat(buf, size), encoding);
          if (json) {
            try {
              str = JSON.parse(str);
            } catch (err) {
              reject(err);
            }
          }
          resolve(str);
        });
      });
      req.setTimeout(timeout, () => {
        isRetry = true;
        req.abort();
      });
      req.on('error', err => {
        isRetry = true;
        if (retries <= 0) reject(err);
      });
      req.on('close', () => {
        // 重试时，将超时时间递增 1 分钟
        if (isRetry && retries > 0) wrapper(timeout + 60 * 1000, --retries);
      });
      if (method == 'POST') req.write(data);
      req.end();
    }
    wrapper(timeout, retries);
  });
};
