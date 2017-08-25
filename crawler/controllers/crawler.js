const crawler = require('../phantomCrawler/task');
const ResultDB = require('../models/crawlermongoose');
const fs = require('mz/fs');
const mime = require('mime');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

/**
 * 加载图片并缓存，返回存储的图片路径
 * 
 * @param {string} url 
 * @returns path
 */
const loadimg = function (url) {
    return new Promise(function (resolve, reject) {
        https.get(url, res => {
            if (res.statusCode !== 200) {
                let error = new Error('请求失败。\n' + `状态码: ${statusCode}`);
                // 消耗响应数据以释放内存
                res.resume();
                return reject(error);
            }

            let name = `${crypto.createHash('md5').update(Date.now().toString()).digest('hex')}.${mime.extension(res.headers['content-type'])}`;
            let rawData = '';

            res.setEncoding('binary');
            res.on('data', function (chunk) {
                rawData += chunk;
            });

            res.on('end', async function () {
                await fs.writeFile(path.join(process.cwd(), 'static/img', name), rawData, 'binary');
                resolve(path.join('static/img', name));
            });
        }).on('error', (e) => {
            reject(e);
        });
    })
}

module.exports = {
    'GET /crawler': async(ctx, next) => {

        let results = await crawler(ctx.request.query.keyword, ctx.request.query.device).catch(e => console.error(e.message));

        // async函数返回一个包装过的Promise对象，如果不用Promise.all方法得到的数组内容将是Promise对象
        // 遍历dataList
        results.dataList = await Promise.all(Array.from(results.dataList, (async data => {
            // 遍历data.pic，并发请求图片
            data.pic = await Promise.all(Array.from(data.pic, (async picURL => {
                // 这里的Array.from得到的数组内容为Promise对象
                try {
                    return await loadimg(picURL);// async的return XXX可以理解为resolve(XXX)
                } catch (e) {
                    console.error(e.message);
                }
            })));
            return data;
        })));

        let result = new ResultDB(results);
        result.save((err, result) => {
            if (err) return logError(err);
            console.log('result saved');
        });

        ctx.render('crawlerResult.html', {
            dataList: results.dataList,
        });
    }
}
