/**
 * 主文件：
 *      1. 负责网站的启动
 *      2. 开放文件夹（开放静态资源）
 *      3. post请求的配置
 */

const express = require('express');
const path = require('path');
const router = require('./router');
let  bodyParser = require('body-parser');

let session = require('express-session');
let compression = require('compression'); //开启 gzip 服务

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(compression());

app.use('/node_modules/',express.static(path.join(__dirname, 'node_modules')))
app.use('/manage/',express.static(path.join(__dirname, 'manage')))

app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 1000, // 设置 session 的有效时间，单位毫秒
    },
}));
// app.all('*', function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     res.header('Access-Control-Allow-Methods', '*');
//     res.header('Content-Type', 'application/json;charset=utf-8');
//     next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!404")
})

app.listen(80,function(){
    console.log('running...');
})