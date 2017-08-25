const http = require('http');
const url = require('url');
const path = require('path');
const exec = require('child_process').exec;
const iconv = require('iconv-lite');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // 解决mongoose Promise兼容问题

const log = console.log.bind(console);
const logError = console.error.bind(console);

// 连接并创建数据库
let dbURL = 'mongodb://localhost/ife';
mongoose.connect(dbURL, {
    useMongoClient: true,
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    log('mongoose connected!');
});

// Define schema
let resultSchema = new mongoose.Schema({
    code: Number,
    msg: String,
    word: String,
    device: String,
    time: Number,
    dataList: [{
        info: String,
        link: String,
        pic: [String],
        title: String
    }]
});

// Creating a model(collection)
// 相当于创建数据表
let ResultModel = mongoose.model('ResultModel', resultSchema);

http.createServer((req, res) => {
    log('\nrequest received');
    let urlObject = url.parse(req.url, true)
    let reqArgs = urlObject.query; //请求的参数
    let reqPathname = urlObject.pathname; //请求的路径

    res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8',
    });

    if (reqPathname === '/') {
        let cmdPhantomjs = `phantomjs ${path.join(__dirname,'task2.js')}`;
        let keyword = reqArgs.wd || reqArgs.word;
        let device = reqArgs.device;
        // 以buffer对象输出方便转码
        let cmdEncoding = {
            encoding: 'buffer'
        };

        if (!keyword) {
            logError('请输入关键字');
            res.end();
            return;
        }
        log('waiting...');

        exec(`${cmdPhantomjs} ${keyword} ${device}`, cmdEncoding, (err, stdout, stderr) => {
            if (err) {
                logError(`exec error: ${err}`);
                res.end();
                return;
            }

            try {
                JSON.parse(stdout);
            } catch (e) {
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                return res.end(stdout);
            }

            // 对cmd的gbk编码的中文进行转码为unicode，方便储存进数据库
            // decode对象最好为buffer
            let utf8str = iconv.decode(stdout, 'gbk');

            let result = new ResultModel(JSON.parse(utf8str));
            result.save((err, result) => {
                if (err) return logError(err);
                log(result, 'save');
            });

            res.write(utf8str);
            res.end();
        });
    } else if (reqPathname === '/favicon.ico') {
        log('favicon.ico success');
        res.end();
    } else {
        res.end('Hello World');
    }


}).listen(8000);

log('server started at http://127.0.0.1:8000');