const phantom = require('phantom');
const config = require('./config.json');
const query = require('./query.json');

module.exports = async function (keyword, device, pn = 1) {
    if (!keyword) throw Error('keyword missing.');
    const instance = await phantom.create();
    const page = await instance.createPage();

    let time = Date.now();
    pn = (pn - 1) * 10;
    if (Number.isNaN(pn)) console.error('page arg error!')
    device = device in config ? device : 'default';
    let url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword) + '&pn=' + pn;

    if (config[device].screen) {
        page.setting('userAgent', config[device].userAgent);
        page.property('viewportSize', {
            width: config[device].screen.width,
            height: config[device].screen.height,
        });
        url = 'https://m.baidu.com/s?wd=' + encodeURIComponent(keyword) + '&pn=' + pn;
    }

    page.on('onError', function (msg, trace) {
        var msgStack = ['ERROR: ' + msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function (t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function+'")' : ''));
            });
            console.error(msgStack.join('\n'));
        }
    });

    let status = await page.open(url);

    if (status !== "success") {
        throw Error('Page failed to load.');
    } else {
        let dataList = await page.evaluate(function (deviceType) {
            var dataList = [];
            var $res = $(deviceType.res);

            $res.each(function (index, value) {
                var title = $(value).find(deviceType.title).text() || '';
                var info = $(value).find(deviceType.info).text() || '';
                var link = $(value).find(deviceType.link).attr('href') || '';
                var pic = [].map.call($(value).find(deviceType.pic), function (i) {
                    return i.src;
                }).filter(function (i) {
                    return i !== '';
                });
                dataList.push({
                    title: title,
                    info: info,
                    link: link,
                    pic: pic || [],
                });
            });
            return dataList;
        }, query[config[device].deviceType]);

        let result = {
            code: 1,
            msg: '抓取成功',
            word: keyword,
            time: Date.now() - time,
            device: device,
            dataList: dataList
        };

        if (!dataList)(result.code = 0) && (result.msg = '抓取失败');

        await instance.exit();
        return result;
    }
};
