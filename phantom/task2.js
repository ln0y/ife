"use strict";
phantom.outputEncoding = "gb2312";

var page = require('webpage').create();
var system = require('system');

if (system.args.length === 1) {
    console.log('usage: task.js <keyword> <device>');
    phantom.exit();
}

var config = {
    iphone5: {
        name: 'iphone5',
        screen: {
            width: 320,
            height: 568,
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
        deviceType: 'mobile',
    },
    iphone6: {
        name: 'iphone6',
        screen: {
            width: 375,
            height: 667,
        },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
        deviceType: 'mobile',
    },
    ipad: {
        name: 'ipad',
        screen: {
            width: 768,
            height: 1024,
        },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
        deviceType: 'pad',
    },
    default: {
        name: 'default',
        userAgent: page.settings.userAgent,
        deviceType: 'desktop',
    },
};

var query = {
    mobile: {
        res: '.c-container',
        title: '.c-title',
        info: '.c-abstract',
        link: 'a:first-of-type',
        pic: '.c-img img',
    },
    pad: {
        res: '.c-container',
        title: '.t > a:first-of-type',
        info: '.c-abstract',
        link: '.t > a:first-of-type',
        pic: '.c-img , #ala_img_pics img ',
    },
    desktop: {
        res: '.c-container',
        title: '.t > a:first-of-type',
        info: '.c-abstract',
        link: '.t > a:first-of-type',
        pic: '.c-img',
    },
}

var time = Date.now();
var keyword = system.args[1];
var device = system.args[2] in config ? system.args[2] : 'default';
var url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword);
var jQueryURL = 'http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js';
var result = {
    code: 0, //返回状态码，1为成功，0为失败
    device: device, //设备
    msg: '抓取失败', //返回的信息
    word: keyword, //抓取的关键字
    time: 0, //任务的时间
    dataList: [ //抓取结果列表
        {
            title: 'none', //结果条目的标题
            info: 'none', //摘要
            link: 'none', //链接
            pic: [], //缩略图地址
        }
    ],
};

// evaluate方法内部有console语句可以用onConsoleMessage方法监听这个事件，进行处理
// page.onConsoleMessage = function (msg) {
//     console.log(msg);
// }

page.settings.userAgent = config[device].userAgent;
config[device].screen && (page.viewportSize = {
    width: config[device].screen.width,
    height: config[device].screen.height,
});


phantom.onError = function (msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function (t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function+')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};

page.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function (t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function+'")' : ''));
        });
    }

    console.error(msgStack.join('\n'));
};


page.open(url, function (status) {
    // console.log("Status: " + status);
    if (status === "success") {
        // console.log('please waiting...')
        // 加载脚本,百度自带jQuery,多余
        page.includeJs(jQueryURL, function () {
            // jQuery is loaded

            // evaluate是在在沙箱中执行,无法访问phantom的对象（也就是回调函数无法访问外层的变量），可以通过传递多个参数进行访问
            // evaluate返回一个简单的原始对象（可以被序列化为JSON）
            var dataList = page.evaluate(function (deviceType) {
                var dataList = [];
                var $res = $(deviceType.res);

                $res.each(function (index, value) {
                    var title = $(value).find(deviceType.title).text() || 'none';
                    var info = $(value).find(deviceType.info).text() || 'none';
                    var link = $(value).find(deviceType.link).attr('href') || 'none';
                    var pic = [].map.call($(value).find(deviceType.pic), function (i) {
                        return i.src;
                    });
                    dataList.push({
                        title: title,
                        info: info,
                        link: link,
                        pic: pic,
                    });
                });
                return dataList;
            }, query[config[device].deviceType]);

            dataList.length && (result.dataList = dataList);
            // result.dataList = dataList.length > 0 ? dataList : result.dataList;
            result.code = 1;
            result.msg = '抓取成功';
            result.time = Date.now() - time;
            console.log(JSON.stringify(result, null, 4));

            // 由于是异步加载，所以phantom.exit()语句要放在page.includeJs()方法的回调函数之中
            phantom.exit();

        });
    } else {
        result.time = Date.now() - time;
        console.log(JSON.stringify(result, null, 4));
        console.log("Page failed to load.");
        phantom.exit();
    }
});