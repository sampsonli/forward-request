/**
 * Created by lichun on 2016/1/28.
 */
var http = require('http');
var https = require('https');
// var iconv = require('iconv-lite');
function forwardHttp(req, res, host, ip, port, endPath,showLog) {
    delete req.headers['accept-encoding'];
    host && (req.headers['host'] = host);
    // console.log('\u001b[31m转发：\u001b[39m \u001b[36m' + (endPath||req.url)+ '\u001b[39m 到：\u001b[34m'+(host||req.headers['host']) + '\u001b[39m  ip:\u001b[35m'+ip+':'+(port||'80')+'\u001b[39m');
    var clientRequest = http.request({
        host: ip,
        port: port || 80,
        method: req.method,
        path: endPath || req.originalUrl,
        headers: req.headers
    }, function (resp) {
        var chunks = [];
        resp.on('data', function (chunk) {
            chunks.push(chunk)
        }).on('end', function () {
            var data = Buffer.concat(chunks);
            var sendData;
            sendData = data;
            showLog&&console.log('\u001b[31m转发：\u001b[39m \u001b[36m' + (endPath || req.url) + '\u001b[39m 到：\u001b[32m' + (host || req.headers['host']) + '\u001b[39m  ip:\u001b[35m' + ip + ':' + (port || '80') + '\u001b[39m \u001b[37m' + resp.statusCode + '\u001b[39m');
            if (resp.statusCode === 302) {
                if (resp.headers.location && req.isHttps) {
                    resp.headers.location = resp.headers.location.replace(/http:/, 'https:').replace(/http%3A/g, 'https%3A');
                }
            }

            res.writeHead(resp.statusCode, resp.headers);
            res.end(sendData);
        })
    });
    if(req.method === 'POST'){
        (function () {
            var chunks = [];
            req.on('data', function (data) {
                chunks.push(data);
            }).on('end', function () {
                var data = Buffer.concat(chunks);
                showLog&&console.log('\u001b[36mPOST到\u001b[36m' + (endPath || req.url) + '\u001b[39m--->' + data + '\u001b[39m');
                clientRequest.end(data);
            })
        })();
    }else {
        clientRequest.end();
    }
    clientRequest.on('error', function (e) {
        console.log('转发错误，错误信息：'+e.message)
    })
}


function forwardHttps(req, res, host, ip, port, endPath) {
    delete req.headers['accept-encoding'];
    host && (req.headers['host'] = host);
    // console.log('\u001b[31m转发：\u001b[39m \u001b[36m' + (endPath||req.url)+ '\u001b[39m 到：\u001b[34m'+(host||req.headers['host']) + '\u001b[39m  ip:\u001b[35m'+ip+':'+(port||'80')+'\u001b[39m');
    var clientRequest = https.request({
        host: ip,
        port: port || 443,
        method: req.method,
        path: endPath || req.originalUrl,
        headers: req.headers
    }, function (resp) {
        var chunks = [];
        resp.on('data', function (chunk) {
            chunks.push(chunk)
        }).on('end', function () {
            var data = Buffer.concat(chunks);
            var sendData;
            sendData = data;
            console.log('\u001b[31m转发：\u001b[39m \u001b[36m' + (endPath || req.url) + '\u001b[39m 到：\u001b[32m' + (host || req.headers['host']) + '\u001b[39m  ip:\u001b[35m' + ip + ':' + (port || '80') + '\u001b[39m \u001b[37m' + resp.statusCode + '\u001b[39m');
            if (resp.statusCode === 302) {
                if (resp.headers.location && req.isHttps) {
                    resp.headers.location = resp.headers.location.replace(/http:/, 'https:').replace(/http%3A/g, 'https%3A');
                }
            }

            res.writeHead(resp.statusCode, resp.headers);
            res.end(sendData);
        })
    });
    if(req.method === 'POST'){
        (function () {
            var chunks = [];
            req.on('data', function (data) {
                chunks.push(data);
            }).on('end', function () {
                var data = Buffer.concat(chunks);
                console.log('\u001b[36mPOST到\u001b[36m' + (endPath || req.url) + '\u001b[39m--->' + data + '\u001b[39m');
                clientRequest.end(data);
            })
        })();
    }else {
        clientRequest.end();
    }
    clientRequest.on('error', function (e) {
        console.log('转发错误，错误信息：'+e.message)
    })
}
module.exports = {
    http: forwardHttp,
    https: forwardHttps
};