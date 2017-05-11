$(document).ready(function() {

    let r = new NumberAccelerator($('.color-RGB input').eq(0)[0], $('.color-RGB i').eq(0)[0], $('.color-RGB i').eq(1)[0], 128, 255, 0, 1, 10);
    r.init();

    let g = new NumberAccelerator($('.color-RGB input').eq(1)[0], $('.color-RGB i').eq(2)[0], $('.color-RGB i').eq(3)[0], 10, 255, 0, 1, 10);
    g.init();

    let b = new NumberAccelerator($('.color-RGB input').eq(2)[0], $('.color-RGB i').eq(4)[0], $('.color-RGB i').eq(5)[0], 10, 255, 0, 1, 10);
    b.init();

    let h = new NumberAccelerator($('.color-HSL input').eq(0)[0], $('.color-HSL i').eq(0)[0], $('.color-HSL i').eq(1)[0], 360, 360, 0, 1, 10);
    h.init();

    let s = new NumberAccelerator($('.color-HSL input').eq(1)[0], $('.color-HSL i').eq(2)[0], $('.color-HSL i').eq(3)[0], 1, 1, 0, 0.01, 10);
    s.init();

    let l = new NumberAccelerator($('.color-HSL input').eq(2)[0], $('.color-HSL i').eq(4)[0], $('.color-HSL i').eq(5)[0], 0.5, 1, 0, 0.01, 10);
    l.init();

    let sd = new ColorSelect($('#color-panel')[0], $('.color-panel-btn')[0], $('.color-bar')[0], $('.color-bar-btn')[0], $('.color-current-panel')[0]);
    sd.init();

    let rgbHandle = function() {
        let hsv = ColorConvert.rgb2hsv([r.getValue(), g.getValue(), b.getValue()]);
        sd.color2Pos(hsv);
        sd.pos2Color();

        let inpHSL = document.getElementsByClassName('color-HSL')[0].getElementsByTagName('input');
        let rgb = ColorConvert.hsv2rgb(hsv);
        let hsl = ColorConvert.hsv2hsl(hsv);

        inpHSL[0].value = hsl[0];
        inpHSL[1].value = hsl[1];
        inpHSL[2].value = hsl[2];

        function dec2hex(dec) {
            dec = dec.toString(16);
            let zero = '00';
            let tmp = zero.length - dec.length;
            return zero.substr(0, tmp) + dec;
        }

        let span = document.getElementsByClassName('color-current-value')[0].getElementsByTagName('span');
        span[0].innerText = `#${dec2hex(rgb[0])}${dec2hex(rgb[1])}${dec2hex(rgb[2])}`;
        span[1].innerText = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        span[2].innerText = `hsl(${hsl[0]},${hsl[1]},${hsl[2]})`;
        span[3].innerText = `hsv(${hsv[0]},${hsv[1]},${hsv[2]})`;
    };

    r.addFn(rgbHandle);
    g.addFn(rgbHandle);
    b.addFn(rgbHandle);

    let hslHandle = function() {
        let rgb = ColorConvert.hsl2rgb([h.getValue(), s.getValue(), l.getValue()]);
        let inpRGB = document.getElementsByClassName('color-RGB')[0].getElementsByTagName('input');
        let hsv = ColorConvert.rgb2hsv(rgb);
        let hsl = ColorConvert.rgb2hsl(rgb);

        sd.color2Pos(hsv);
        sd.pos2Color();

        inpRGB[0].value = rgb[0];
        inpRGB[1].value = rgb[1];
        inpRGB[2].value = rgb[2];

        function dec2hex(dec) {
            dec = dec.toString(16);
            let zero = '00';
            let tmp = zero.length - dec.length;
            return zero.substr(0, tmp) + dec;
        }

        let span = document.getElementsByClassName('color-current-value')[0].getElementsByTagName('span');
        span[0].innerText = `#${dec2hex(rgb[0])}${dec2hex(rgb[1])}${dec2hex(rgb[2])}`;
        span[1].innerText = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        span[2].innerText = `hsl(${hsl[0]},${hsl[1]},${hsl[2]})`;
        span[3].innerText = `hsv(${hsv[0]},${hsv[1]},${hsv[2]})`;
    };

    h.addFn(hslHandle);
    s.addFn(hslHandle);
    l.addFn(hslHandle);
});
