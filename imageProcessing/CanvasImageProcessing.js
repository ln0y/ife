(function() {
    'use strict';
    let CanvasFn = CanvasRenderingContext2D.prototype;

    /**
     * 转化为灰度图
     * @Date   2017-05-11T21:28:52+0800
     * @return {[type]}                 [description]
     */
    CanvasFn.myConvertToGray = function() {
        console.time("myConvertToGray Process Time");
        let imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let pixelData = imageData.data;

        let r, g, b, gray;

        for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
            r = pixelData[i * 4];
            g = pixelData[i * 4 + 1];
            b = pixelData[i * 4 + 2];

            // 分量法（R、G、B分量灰度图）
            // gray = r; || gray = g; || gray = b;
            // 最大值法
            // gray = Math.max(r, g, b);
            // 平均值法
            // gray = (r + g + b) / 3;
            // 加权平均法
            gray = r * 0.299 + g * 0.587 + b * 0.114;

            pixelData[i * 4] = gray;
            pixelData[i * 4 + 1] = gray;
            pixelData[i * 4 + 2] = gray;
        }

        this.putImageData(imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
        console.timeEnd("myConvertToGray Process Time");
    };

    /**
     * 二值化(灰度阈值)
     * 所谓二值化简单一点讲，就是将图像划分成黑和白（灰度图），通过设定一个标准如果大于这个标准就设为白，如果小于这个标准，就设为黑，而这个标准，就叫做阈值。
     * @Date   2017-05-11T21:29:17+0800
     * @param  {[type]}                 iTR [阈值]
     * @return {[type]}                     [description]
     */
    CanvasFn.myThresholdProcess = function(iTR) {
        console.time("myThresholdProcess Process Time");
        let imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let pixelData = imageData.data;

        let r, g, b, gray, v;

        iTR = iTR || 128;

        for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
            r = pixelData[i * 4];
            g = pixelData[i * 4 + 1];
            b = pixelData[i * 4 + 2];

            gray = r * 0.299 + g * 0.587 + b * 0.114;
            v = gray < iTR ? 0 : 255;

            pixelData[i * 4] = v;
            pixelData[i * 4 + 1] = v;
            pixelData[i * 4 + 2] = v;
        }

        this.putImageData(imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
        console.timeEnd("myThresholdProcess Process Time");
    };

    /**
     * 海报化
     * 所谓的海报化其实就是将每一个像素的分量与224进行与运算，而244的16进制表示可以表示成0xe0，前面介绍了一个像素的分量的范围在0-255范围内，所以只需要将这两个数值的二进制位相与即可完成海报化的处理效果。
     * @Date 2017-05-11T21:33:38+0800
     */
    CanvasFn.myPosterize = function() {
        console.time("myPosterize Process Time");
        let imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let pixelData = imageData.data;

        for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
            pixelData[i * 4] &= 0xe0;
            pixelData[i * 4 + 1] &= 0xe0;
            pixelData[i * 4 + 2] &= 0xe0;
        }

        this.putImageData(imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
        console.timeEnd("myPosterize Process Time");
    };

    /**
     * 底片效果
     * 255 - RGB各颜色分量
     * @Date   2017-05-11T21:42:33+0800
     * @return {[type]}                 [description]
     */
    CanvasFn.myToReverse = function() {
        console.time("myToReverse Process Time");
        let imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let pixelData = imageData.data;

        for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
            pixelData[i * 4] = 255 - pixelData[i * 4];
            pixelData[i * 4 + 1] = 255 - pixelData[i * 4 + 1];
            pixelData[i * 4 + 2] = 255 - pixelData[i * 4 + 2];
        }

        this.putImageData(imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
        console.timeEnd("myToReverse Process Time");
    };

    /**
     * 一维高斯效果
     * @Date   2017-05-12T22:13:42+0800
     * @param  {number}                 blurR 取样区域半径, 正数, 可选, 默认为 3.0
     * @param  {number}                 sigma 标准方差, 可选, 默认取值为 radius / 3
     * @return {[type]}                       [description]
     *
     * http://www.ruanyifeng.com/blog/2012/11/gaussian_blur.html
     * http://blog.csdn.net/markl22222/article/details/10313565
     * https://github.com/dorsywang/AlloyImage2.0/blob/master/src/filter/gaussBlur.js
     */
    CanvasFn.myGaussBlur = function(blurR, sigma) {
        console.time("myGaussBlur Process Time");
        let imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let pixelData = imageData.data;

        let width = this.canvas.width;
        let height = this.canvas.height;

        // 为什么用let声明变量会导致以下循环变慢许多(在chrome下)
        var gaussMatrix = [],
            gaussSum = 0,
            x, y,
            r, g, b, a,
            i, j, k;

        blurR = Math.floor(blurR) || 3;
        sigma = sigma || blurR / 3;

        a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        b = -1 / (2 * sigma * sigma);
        //生成高斯矩阵
        for (i = 0, x = -blurR; x <= blurR; x++, i++) {
            g = a * Math.exp(b * x * x);
            gaussMatrix[i] = g;
            gaussSum += g;

        }
        //归一化, 保证高斯矩阵的值在[0,1]之间
        for (i = 0; i < gaussMatrix.length; i++) {
            gaussMatrix[i] /= gaussSum;
        }
        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -blurR; j <= blurR; j++) {
                    k = x + j;
                    if (k >= 0 && k < width) { //确保 k 没超出 x 的范围
                        //r,g,b,a 四个一组
                        i = (y * width + k) * 4;
                        r += pixelData[i] * gaussMatrix[j + blurR];
                        g += pixelData[i + 1] * gaussMatrix[j + blurR];
                        b += pixelData[i + 2] * gaussMatrix[j + blurR];
                        // a += pixelData[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + blurR];
                    }
                }
                i = (y * width + x) * 4;
                // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                // console.log(gaussSum)
                pixelData[i] = r / gaussSum;
                pixelData[i + 1] = g / gaussSum;
                pixelData[i + 2] = b / gaussSum;
                // pixelData[i + 3] = a ;
            }
        }
        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -blurR; j <= blurR; j++) {
                    k = y + j;
                    if (k >= 0 && k < height) { //确保 k 没超出 y 的范围
                        i = (k * width + x) * 4;
                        r += pixelData[i] * gaussMatrix[j + blurR];
                        g += pixelData[i + 1] * gaussMatrix[j + blurR];
                        b += pixelData[i + 2] * gaussMatrix[j + blurR];
                        // a += pixelData[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + blurR];
                    }
                }
                i = (y * width + x) * 4;
                pixelData[i] = r / gaussSum;
                pixelData[i + 1] = g / gaussSum;
                pixelData[i + 2] = b / gaussSum;
                // pixelData[i] = r ;
                // pixelData[i + 1] = g ;
                // pixelData[i + 2] = b ;
                // pixelData[i + 3] = a ;
            }
        }

        this.putImageData(imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
        console.timeEnd("myGaussBlur Process Time");
    };
})();
