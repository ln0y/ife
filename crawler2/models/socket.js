const crawler = require('../phantomCrawler/task');
const ResultDB = require('../models/crawlermongoose');
const async = require('async');
const {
    loadimg
} = require('../utils');
const {
    render
} = require('../templating');
const concurrentNumber = 5;

async function getResult(query) {
    let results = await crawler(query.keyword, query.device, query.page).catch(e => console.error(e.message));

    // async函数返回一个包装过的Promise对象，如果不用Promise.all方法得到的数组内容将是Promise对象
    // 遍历dataList
    results.dataList = await Promise.all(Array.from(results.dataList, (async data => {
        // 遍历data.pic，并发请求图片
        data.pic = await Promise.all(Array.from(data.pic || [], (async picURL => {
            // 这里的Array.from得到的数组内容为Promise对象
            try {
                return await loadimg(picURL); // async的return XXX可以理解为resolve(XXX)
            } catch (e) {
                console.error(e.message);
            }
        })));
        return data;
    })));
    if (results.device === 'default') results.device = 'pc';
    return results;
}

module.exports = function (server) {
    const io = require('socket.io')(server);
    let i = 0;
    let n = 0;

    const q = async.queue(async function (task, callback) {
        console.log(`current concurrentNumber:${++i}`);
        let results = await getResult(task);
        console.log(`current concurrentNumber:${--i}`);
        task.socket.emit('result', {
            html: render('crawlerResult.html', {
                dataList: results.dataList,
                num: ++n
            }),
            device: results.device,
            keyword: results.word
        });
        callback || callback();
    }, concurrentNumber);

    q.drain = function () {
        console.log('all tasks have been processed');
    };

    io.on('connection', function (socket) {
        socket.on('query', function (data) {
            data = data.map(i => {
                i.socket = socket;
                return i;
            });
            q.push(data);
        });
    });

    return io;
};
