phantom.outputEncoding = "gb2312";

var page = require('webpage').create();
var system = require('system');

if (system.args.length === 1) {
    console.log('usage: task.js <keyword>');
    phantom.exit();
}

var time = Date.now();
var keyword = system.args[1];
var url = 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword);
var jQueryURL = 'http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js';
var result = {
    code: 0, //返回状态码，1为成功，0为失败
    msg: '抓取失败', //返回的信息
    word: keyword, //抓取的关键字
    time: 0, //任务的时间
    dataList: [ //抓取结果列表
        {
            title: 'none', //结果条目的标题
            info: 'none', //摘要
            link: 'none', //链接
            pic: 'none', //缩略图地址
        }
    ],
};

// evaluate方法内部有console语句可以用onConsoleMessage方法监听这个事件，进行处理
page.onConsoleMessage = function (msg) {
    console.log(msg);
}

page.open(url, function (status) {
    console.log("Status: " + status);
    if (status === "success") {
        // 加载脚本
        page.includeJs(jQueryURL, function () {
            // jQuery is loaded

            // evaluate是在在沙箱中执行,无法访问phantom的对象（也就是回调函数无法访问外层的变量）
            // evaluate返回一个简单的原始对象（可以被序列化为JSON）
            var dataList = page.evaluate(function () {
                var dataList = [];
                var $res = $('.c-container');

                $res.each(function (index, value) {
                    var title = $(value).find('.t a:first-child').text() || 'none';
                    var info = $(value).find('.c-abstract').text() || 'none';
                    var link = $(value).find('.t a:first-child').attr('href') || 'none';
                    var pic = $(value).find('.c-img').attr('src') || 'none';
                    dataList.push({
                        title: title,
                        info: info,
                        link: link,
                        pic: pic,
                    });
                });
                return dataList;
            });

            result.dataList = dataList.length > 0 ? dataList : result.dataList;
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