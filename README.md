# 万能服务器转发神器
1. 用法
```js
const express = require('express');
const forward = require('forward-request')
const app = express(); // 实例化express服务

app.use((req, resp, next) => {
     forward({
                req,
                resp,
                isHttps: false,
                host: 'me.host.org',
                ip: '172.16.241.11',
                path: req.originalUrl,
                showLog: false,
            });
});
```
