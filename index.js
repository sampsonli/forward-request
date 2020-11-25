/**
 * Created by lichun on 2016/1/28.
 */
const http = require('http');
const https = require('https');

/**
 *
 * @param {{headers, originalUrl, method, url, on}} req -- 传入初始 request 即可
 * @param {{writeHead: function, end: function}} resp -- 传入返回用户的 response 即可
 * @param {string} host -- 转发主机名(可为空， 默认是当前请求的host）
 * @param {string} ip -- 转发主机地址， 可以是ip 地址， 也可以是普通域名
 * @param {number} port -- 转发端口（默认即可）
 * @param {string} path -- 转发的路径(可为空， 默认为req.originalUrl)
 * @param {boolean} showLog -- 是否打印转发日志 默认false
 * @param {boolean} isHttps -- 是否为https转发
 */
function forward({req, resp, host, ip, port, path,showLog= false ,isHttps= false}) {
    delete req.headers['accept-encoding'];
    host && (req.headers['host'] = host);
    let clientRequest = (isHttps?https:http).request({
        host: ip,
        port: port || (isHttps?443:80),
        method: req.method,
        path: path || req.originalUrl,
        headers: req.headers
    }, function (response) {
        let chunks = [];
        response.on('data', function (chunk) {
            chunks.push(chunk)
        }).on('end', function () {
            let data = Buffer.concat(chunks);
            showLog&&console.log(`\u001b[31m转发：\u001b[39m \u001b[36m${(path || req.url)}\u001b[39m 到：\u001b[32m${(host || req.headers['host'])}\u001b[39m  ip:\u001b[35m${ip}:${(port || (isHttps?443:80))}\u001b[39m \u001b[37m${resp.statusCode}\u001b[39m`);
            resp.writeHead(response.statusCode, response.headers);
            resp.end(data);
        })
    });
    if(req.method === 'POST'){
        let chunks = [];
        req.on('data', (data)=> {
            chunks.push(data);
        }).on('end', ()=>{
            let data = Buffer.concat(chunks);
            showLog&&console.log(`\u001b[36mPOST到\u001b[36m${(path || req.url)}\u001b[39m--->${data}\u001b[39m`);
            clientRequest.end(data);
        })
    }else {
        clientRequest.end();
    }
    clientRequest.on('error',  (e)=>{
        console.error('转发错误，错误信息：'+e.message)
    })
}

module.exports = forward;
