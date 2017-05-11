'use strict';
/**
 * [input数字累加加速器]
 * @Date   2017-05-02T13:57:08+0800
 * @param  {[element]}                inputDom    [inputdom对象]
 * @param  {[element]}                upDom       [updom对象]
 * @param  {[element]}                downDom     [downdom对象]
 * @param  {[number]}                 initVal     [初始值]
 * @param  {[number]}                 max         [最大值]
 * @param  {[number]}                 min         [最小值]
 * @param  {[number]}                 step        [步长]
 * @param  {[number]}                 speed       [累加速度（ms）]
 * @param  {[number]}                 switchTime  [触发时间（ms）]
 * @return {[type]}                               [description]
 */
let NumberAccelerator = function(inputDom, upDom, downDom, initVal, max, min, step, speed, switchTime) {
    this.inpDom = inputDom;
    this.upDom = upDom;
    this.downDom = downDom;
    this.initVal = initVal || 1;
    this.max = max || 10;
    this.min = min || 0;
    this.step = step || 0.1;
    this.speed = speed || 50;
    this.switchTime = switchTime || 500;

    this.intervalId;
    this.timeoutId;
    this.upbtnFn;
    this.downbtnFn;
};

NumberAccelerator.prototype = {
    constructor: NumberAccelerator,

    /**
     * 初始化
     * @Date   2017-05-03T20:52:42+0800
     * @return {[type]}                 [description]
     */
    init: function() {
        this.inpDom.value = this.initVal;
        this.inpDom.max = this.max;
        this.inpDom.min = this.min;

        this.upDom.setAttribute("data-btn", "up");
        this.downDom.setAttribute("data-btn", "down");

        this.bindEvent();
    },

    /**
     * 绑定事件
     * @Date   2017-05-02T21:41:20+0800
     * @return {[type]}                 [description]
     */
    bindEvent: function() {
        let that = this;
        let parentEle = this.inpDom.parentElement;

        parentEle.addEventListener('mousedown', function(e) {
            e = e || window.event;
            let tar = e.target || e.srcElement;
            if (tar.nodeName.toLowerCase() === "i") {
                if (tar.getAttribute("data-btn") === "up") {
                    e.preventDefault();

                    that.clickHandle("add", that.upbtnFn);
                    that.timeoutId = setTimeout(function() {
                        that.intervalId = setInterval(function() {
                            that.clickHandle("add", that.upbtnFn);
                        }, that.speed);
                    }, that.switchTime);

                } else if (tar.getAttribute("data-btn") === "down") {
                    e.preventDefault();

                    that.clickHandle("sub", that.downbtnFn);
                    that.timeoutId = setTimeout(function() {
                        that.intervalId = setInterval(function() {
                            that.clickHandle("sub", that.downbtnFn);
                        }, that.speed);
                    }, that.switchTime);
                }
            }
            return false;
        });

        parentEle.addEventListener('mouseup', function(e) {
            e = e || window.event;
            let tar = e.target || e.srcElement;
            e.preventDefault();
            if ((tar.nodeName.toLowerCase() === "i") && (tar.getAttribute("data-btn") === "up" || "down")) {
                that.clearTimer();
            }
            return false;
        });

        parentEle.addEventListener('mouseout', function(e) {
            e = e || window.event;
            let tar = e.target || e.srcElement;
            e.preventDefault();
            if ((tar.nodeName.toLowerCase() === "i") && (tar.getAttribute("data-btn") === "up" || "down")) {
                that.clearTimer();
            }
            return false;
        });

    },

    /**
     * 加减按钮事件
     * @Date   2017-05-03T17:10:43+0800
     * @param  {[string]}                 operator [运算符（add，sub）]
     * @param  {[function]}               callBack [回调]
     * @return {[type]}                          [description]
     */
    clickHandle: function(operator, fn) {
        let that = this;
        fn = fn || function() {};
        this.inpDom.value = this.checkVlaue(this.caclNum(parseFloat(this.inpDom.value), this.step, operator));
        fn();
    },

    /**
     * 清除定时器
     * @Date   2017-05-02T21:40:52+0800
     * @return {[type]}                 [description]
     */
    clearTimer: function() {
        clearTimeout(this.timeoutId);
        clearInterval(this.intervalId);
    },

    /**
     * 浮点数加减
     * @Date   2017-05-02T19:53:12+0800
     * @param  {[number]}                 num1     [运算数1]
     * @param  {[number]}                 num2     [运算数2]
     * @param  {[string]}                 operator [运算符（add，sub）]
     * @return {[string]}                          [结果]
     */
    caclNum: function(num1, num2, operator) {
        let precision, precision1, precision2;
        try {
            precision1 = num1.toString().split(".")[1].length;
        } catch (e) {
            precision1 = 0;
        }
        try {
            precision2 = num2.toString().split(".")[1].length;
        } catch (e) {
            precision2 = 0;
        }
        precision = Math.pow(10, Math.max(precision1, precision2));
        switch (operator) {
            case "add":
                return ((num1 * precision + num2 * precision) / precision).toFixed(Math.max(precision1, precision2));
            case "sub":
                return ((num1 * precision - num2 * precision) / precision).toFixed(Math.max(precision1, precision2));
        }
    },

    /**
     * 检查数字是否在合法区间
     * @Date   2017-05-02T19:55:51+0800
     * @param  {[number]}                 val [输入数据]
     * @return {[number]}                     [输出数据]
     */
    checkVlaue: function(val) {
        val = parseFloat(val);
        switch (true) {
            case val >= this.max:
                return this.max;
            case val <= this.min:
                return this.min;
            default:
                return val;
        }
    },

    /**
     * 添加按钮事件
     * @Date  2017-05-03T20:50:15+0800
     * @param {[function]}                 fn  [函数]
     * @param {[string]}                   btn [按钮（"up"、"down"）]
     */
    addFn: function(fn, btn) {
        switch (btn) {
            case "up":
                this.upbtnFn = fn;
                break;
            case "down":
                this.downbtnFn = fn;
                break;
            default:
                this.upbtnFn = this.downbtnFn = fn;
        }
    },

    getValue: function(){
        return this.inpDom.value;
    }
}
