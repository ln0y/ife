'use strict';
let ColorConvert = (function () {

    /**
     * @Date   2017-05-01T14:29:07+0800
     * @param  {[munber]}
     * @param  {[munber]}
     * @param  {[munber]}
     * @return {[Array]}  
     */
    function rgb2hsl([r, g, b]) {
        [r, g, b] = [].map.call([r, g, b], function (item) {
            return item / 255;
        });

        let max = Math.max.apply(Array, [r, g, b]);
        let min = Math.min.apply(Array, [r, g, b]);

        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = 0;
            s = 0;
        } else {
            let m = max - min;
            s = l > 0.5 ? m / (2 - 2 * l) : m / (2 * l);

            switch (max) {
                case r:
                    h = 60 * (g - b) / m + (g < b ? 360 : 0);
                    break;
                case g:
                    h = 60 * (b - r) / m + 120;
                    break;
                case b:
                    h = 60 * (r - g) / m + 240;
                    break;
            }
        }

        return [Math.round(h), Math.round(s * 100) / 100, Math.round(l * 100) / 100];
    }

    /**
     * @Date   2017-05-01T14:29:56+0800
     * @param  {[munber]}
     * @param  {[munber]}
     * @param  {[munber]}
     * @return {[Array]}
     */
    function rgb2hsv([r, g, b]) {
        [r, g, b] = [].map.call([r, g, b], function (item) {
            return item / 255;
        });

        let max = Math.max.apply(Array, [r, g, b]);
        let min = Math.min.apply(Array, [r, g, b]);

        let h, s, v = max;
        let m = max - min;

        s = max == 0 ? 0 : m / max;

        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = 60 * (g - b) / m + (g < b ? 360 : 0);
                break;
            case g:
                h = 60 * (b - r) / m + 120;
                break;
            case b:
                h = 60 * (r - g) / m + 240;
                break;
        }

        return [Math.round(h), Math.round(s * 100) / 100, Math.round(v * 100) / 100];
    }

    /**
     * @Date   2017-05-01T14:30:27+0800
     * @param  {[munber]}
     * @param  {[munber]}
     * @param  {[munber]}
     * @return {[Array]}
     */
    function hsl2rgb([h, s, l]) {
        [h, s, l] = [h, s, l].map(function (item) {
            return parseFloat(item);
        });
        let r, g, b;
        if (s == 0) {
            r = g = b = l;
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
            let p = 2 * l - q;
            h /= 360;

            function eachColor(q, p, t) {
                if (t < 0) {
                    t += 1;
                } else if (t > 1) {
                    t -= 1;
                }
                switch (true) {
                    case t < (1 / 6):
                        return p + ((q - p) * 6 * t);
                    case (t >= (1 / 6)) && (t < (1 / 2)):
                        return q;
                    case (t >= (1 / 2)) && (t < (2 / 3)):
                        return p + ((q - p) * 6 * (2 / 3 - t));
                    default:
                        return p;
                }
            }

            r = eachColor(q, p, h + 1 / 3);
            g = eachColor(q, p, h);
            b = eachColor(q, p, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * @Date   2017-05-01T14:30:37+0800
     * @param  {[munber]}
     * @param  {[munber]}
     * @param  {[munber]}
     * @return {[Array]}
     */
    function hsv2rgb([h, s, v]) {
        [h, s, v] = [h, s, v].map(function (item) {
            return parseFloat(item);
        });
        let r, g, b;
        h %= 360;
        let i = Math.floor(h / 60);
        let f = h / 60 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        switch (i) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * @Date   2017-05-01T14:30:45+0800
     * @param  {[munber]}
     * @param  {[munber]}
     * @param  {[munber]}
     * @return {[Array]}
     */
    function hsl2hsv([h, s, l]) {
        return rgb2hsv(hsl2rgb([h, s, l]));
    }

    /**
     * @Date   2017-05-01T14:30:58+0800
     * @param  {[munber]}
     * @param  {[munber]}
     * @param  {[munber]}
     * @return {[Array]}
     */
    function hsv2hsl([h, s, v]) {
        return rgb2hsl(hsv2rgb([h, s, v]));
    }

    return {
        "rgb2hsl": rgb2hsl,
        "rgb2hsv": rgb2hsv,
        "hsl2rgb": hsl2rgb,
        "hsv2rgb": hsv2rgb,
        "hsl2hsv": hsl2hsv,
        "hsv2hsl": hsv2hsl
    };
})();
// let rgbReg = /^(25[0-5]|2[0-4]\d|[1]\d{2}|[1-9]?\d)\,(25[0-5]|2[0-4]\d|[1]\d{2}|[1-9]?\d)\,(25[0-5]|2[0-4]\d|[1]\d{2}|[1-9]?\d)$/;
// let hslReg = /^(360|3[0-5]\d|[12]\d{2}|[1-9]?\d)\,(0(\.\d{1,2})?|1(\.0{1,2})?)\,(0(\.\d{1,2})?|1(\.0{1,2})?)$/;