'use strict';
let ColorSelect = function(panelDom, panelbtnDom, barDom, barbtnDom, curPanelDom, panelWidth, panelHeight) {
    this.panelDom = panelDom;
    this.panelbtnDom = panelbtnDom;
    this.barDom = barDom;
    this.barbtnDom = barbtnDom;
    this.curPanelDom = curPanelDom;
    this.panelWidth = panelWidth || 400;
    this.panelHeight = panelHeight || 400;

    this.ctx = this.panelDom.getContext('2d');
};

ColorSelect.prototype = {
    constructor: ColorSelect,
    init: function() {

        // canvas宽高
        this.panelDom.width = this.panelWidth;
        this.panelDom.height = this.panelHeight;

        this.canvasRender();
        this.color2Pos([0, 1, 1]);
        this.bindEvent();
        this.changeValue(this.pos2Color());
    },

    /**
     * 绑定事件
     * @Date   2017-05-08T14:18:49+0800
     * @return {[type]}                 [description]
     */
    bindEvent: function() {
        let panelbtnMove = function(e) {
            e.preventDefault();
            let parent = this.panelbtnDom.parentElement;
            let left = e.clientX - parent.offsetLeft;
            let top = e.clientY - parent.offsetTop;
            if (left < 0) {
                left = 0;
            } else if (left > parent.offsetWidth) {
                left = parent.offsetWidth;
            }
            if (top < 0) {
                top = 0;
            } else if (top > parent.offsetHeight) {
                top = parent.offsetHeight;
            }
            this.panelbtnDom.style.left = left + "px";
            this.panelbtnDom.style.top = top + "px";

            this.changeValue(this.pos2Color());
        }.bind(this);

        let barbtnMove = function(e) {
            e.preventDefault();
            let parent = this.barbtnDom.parentElement;
            let top = e.clientY - parent.offsetTop;
            if (top < 0) {
                top = 0;
            } else if (top > parent.offsetHeight) {
                top = parent.offsetHeight;
            }
            this.barbtnDom.style.top = top + "px";

            this.changeValue(this.pos2Color());
        }.bind(this);

        this.panelDom.addEventListener('mousedown', function(e) {
            panelbtnMove(e);
            window.addEventListener('mousemove', panelbtnMove);
        });

        this.panelbtnDom.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            window.addEventListener('mousemove', panelbtnMove);
        });

        this.barDom.addEventListener('mousedown', function(e) {
            barbtnMove(e);
            window.addEventListener('mousemove', barbtnMove);
        });

        this.barbtnDom.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            window.addEventListener('mousemove', barbtnMove);
        });

        window.addEventListener('mouseup', function() {
            window.removeEventListener('mousemove', panelbtnMove);
            window.removeEventListener('mousemove', barbtnMove);
        });
    },

    /**
     * 颜色面板渲染(hsv)
     * @Date   2017-05-04T11:29:02+0800
     * @param  {[array[number]]}            [c1, c2, c3] [hsv]
     * @return {[type]}                     [description]
     */
    canvasRender: function(h = 0) {
        let ctx = this.ctx;

        let color = ColorConvert.hsl2rgb([h, 1, 0.5]);

        // 清除画布
        ctx.clearRect(0, 0, this.panelWidth, this.panelHeight);
        // 亮度渲染
        let lightGradient = ctx.createLinearGradient(0, 0, 0, this.panelHeight);
        lightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        // 颜色渲染
        let colorGradient = ctx.createLinearGradient(0, 0, this.panelWidth, 0);
        colorGradient.addColorStop(0, 'rgb(255, 255, 255)');
        colorGradient.addColorStop(1, `rgb(${color})`);

        ctx.fillStyle = colorGradient;
        ctx.fillRect(0, 0, this.panelWidth, this.panelHeight);

        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, this.panelWidth, this.panelHeight);
    },

    /**
     * 根据颜色确定点的位置
     * @Date   2017-05-08T14:12:42+0800
     * @param  {[number]}                 [h [h]
     * @param  {[number]}                 s  [s]
     * @param  {[number]}                 v] [v]
     * @return {[type]}                    [description]
     */
    color2Pos: function([h, s, v]) {
        let barTop = (h / 360) * this.barDom.offsetHeight;
        let PanelLeft = s * this.panelDom.offsetWidth;
        let PanelTop = (1 - v) * this.panelDom.offsetHeight;

        this.barbtnDom.style.top = barTop + "px";
        this.panelbtnDom.style.left = PanelLeft + "px";
        this.panelbtnDom.style.top = PanelTop + "px";

        this.barbtnDom.style.backgroundColor = "hsl(" + h + ", 100%, 50%)";
        this.curPanelDom.style.backgroundColor = this.panelbtnDom.style.backgroundColor = `rgb(${ColorConvert.hsv2rgb([h,s,v])})`;
    },

    /**
     * 根据点的位置得到颜色
     * @Date   2017-05-08T14:10:13+0800
     * @return {[array]}                 [hsv]
     */
    pos2Color: function() {
        let barTop = window.getComputedStyle(this.barbtnDom, null).top.split("px")[0];
        let PanelLeft = window.getComputedStyle(this.panelbtnDom, null).left.split("px")[0];
        let PanelTop = window.getComputedStyle(this.panelbtnDom, null).top.split("px")[0];

        let h = (barTop / this.barDom.offsetHeight) * 360;
        let s = PanelLeft / this.panelDom.offsetWidth;
        let v = 1 - (PanelTop / this.panelDom.offsetHeight);

        this.canvasRender(h);
        this.barbtnDom.style.backgroundColor = "hsl(" + h + ", 100%, 50%)";
        this.curPanelDom.style.backgroundColor = this.panelbtnDom.style.backgroundColor = `rgb(${ColorConvert.hsv2rgb([h,s,v])})`;

        return [h, s, v];
    },

    /**
     * 显示当前颜色值
     * @Date   2017-05-08T14:11:04+0800
     * @param  {[number]}                 [h [h]
     * @param  {[number]}                 s  [s]
     * @param  {[number]}                 v] [v]
     * @return {[type]}                    [description]
     */
    changeValue: function([h, s, v]) {
        let inpRGB = document.getElementsByClassName('color-RGB')[0].getElementsByTagName('input');
        let inpHSL = document.getElementsByClassName('color-HSL')[0].getElementsByTagName('input');
        let rgb = ColorConvert.hsv2rgb([h, s, v]);
        let hsl = ColorConvert.hsv2hsl([h, s, v]);
        let hsv = ColorConvert.rgb2hsv(rgb);
        inpRGB[0].value = rgb[0];
        inpRGB[1].value = rgb[1];
        inpRGB[2].value = rgb[2];
        inpHSL[0].value = hsl[0];
        inpHSL[1].value = hsl[1];
        inpHSL[2].value = hsl[2];

        /**
         * 补齐前导零
         * @Date   2017-05-08T13:37:51+0800
         * @param  {[number]}                 dec [十进制数字]
         * @return {[string]}                     [十六进制字符串]
         */
        function dec2hex(dec) {
            dec = dec.toString(16);
            let zero = '00';
            let tmp = zero.length - dec.length;
            return zero.substr(0, tmp) + dec;
        }

        let span = document.getElementsByClassName('color-current-value')[0].getElementsByTagName('span');
        span[0].innerText = "#" + dec2hex(rgb[0]) + dec2hex(rgb[1]) + dec2hex(rgb[2]);
        span[1].innerText = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        span[2].innerText = `hsl(${hsl[0]},${hsl[1]},${hsl[2]})`;
        span[3].innerText = `hsv(${hsv[0]},${hsv[1]},${hsv[2]})`;
    }
}
