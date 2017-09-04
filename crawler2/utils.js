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
                let error = new Error('请求失败。\n' + `状态码: ${res.statusCode}`);
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
    loadimg
};
