function setPixel (imageData: Uint8ClampedArray, w: number, h: number, x: number, y: number, r: number, g: number, b: number) {
    const i = (y * w + x) * 4;
    imageData[i] = r;
    imageData[i+1] = g;
    imageData[i+2] = b;
    imageData[i+3] = 255;
}

function blendPixel (imageData: Uint8ClampedArray, w: number, h: number, x: number, y: number, r: number, g: number, b: number, a: number) {
    const i = (y * w + x) * 4;
    const ia = 1 - a;
    imageData[i] = imageData[i] * ia + r * a;
    imageData[i+1] = imageData[i+1] * ia + g * a;
    imageData[i+2] = imageData[i+2] * ia + b * a;
    imageData[i+3] = Math.max(imageData[i+3], a * 255);
}
function fillCircle (imageData: Uint8ClampedArray, w: number, h: number, x0: number, y0: number, radius: number, r: number, g: number, b: number) {
    function plot (x: number, y: number) {
        //setPixel (imageData, w, h, x, y, r, g, b);
        const dx = x - x0;
        const dy = y - y0;
        const f = 1.0 - Math.max(Math.min(1.0, (dx * dx + dy * dy) / (radius * radius)), 0.0);
        blendPixel (imageData, w, h, x, y, r, g, b, f * f)
        //setPixel (imageData, w, h, x, y, f * 255, f * 255, f * 255);
        // const r1 = Math.floor(255 * f);
        // const g1 = Math.floor(255 * f);
        // const b1 = Math.floor(255 * f);
        // setPixel (imageData, w, h, x, y, r1, g1, b1);
    }
    let x = 0, y = radius, dx = 3, dy = 2 - radius - radius, d = 1 - radius, xi;
    plot (x + x0, y + y0);
    plot (x + x0, -y + y0);
    for (xi = -radius + x0; xi <= radius + x0; xi++) {
        plot (xi, y0);
    }
    while (x < y) {
        if (d < 0) {
            d += dx;
            dx += 2;
            x++;
        } else {
            d += (dx + dy);
            dx += 2;
            dy += 2;
            x++;
            y--;
        }
        for (xi = -x + x0; xi <= x + x0; xi++) {
            plot (xi, -y + y0);
            plot (xi, y + y0);
        }
        for (xi = -y + x0; xi <= y + x0; xi++) {
            plot (xi, -x + y0);
            plot (xi, x + y0);
        }
    }
}

function bresenhamDrawLine (imageData: Uint8ClampedArray, w: number, h: number, x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number) {
    let dx = Math.abs (x2 - x1);
    let dy = Math.abs (y2 - y1);
    let yy = 0, t;
    if (dx < dy) {
        yy = 1;
        t = x1;
        x1 = y1;
        y1 = t;
        t = x2;
        x2 = y2;
        y2 = t;
        t = dx;
        dx = dy;
        dy = t;
    }
    const ix = x2 > x1 ? 1 : -1;
    const iy = y2 > y1 ? 1 : -1;
    let cx = x1, cy = y1, n2dy = dy * 2, n2dydx = (dy - dx) * 2, d = dy * 2 - dx;
    if (yy === 1) {
        while (cx !== x2) {
            if (d < 0) {
                d += n2dy;
            } else {
                cy += iy;
                d += n2dydx;
            }
            setPixel (imageData, w, h, cy, cx, r, g, b);
            cx += ix;
        }
    } else {
        while (cx !== x2) {
            if (d < 0) {
                d += n2dy;
            } else {
                cy += iy;
                d += n2dydx;
            }
            setPixel (imageData, w, h, cx, cy, r, g, b);
            cx += ix;
        }
    }
}

interface IColorRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

function parseColorRGBA (rgba: string): IColorRGBA {
    let result: IColorRGBA = {
        r: 255,
        g: 255,
        b: 255,
        a: 255
    }
    let c: number[] = [];
    let t = 0;
    const s = rgba.toLowerCase();
    const d1 = '0'.charCodeAt(0), d2 = '9'.charCodeAt(0);
    const h1 = 'a'.charCodeAt(0), h2 = 'f'.charCodeAt(0);
    for (let i = 1; i < rgba.length; i++) {
        const ch = rgba.charCodeAt(i);
        let val = 0;
        if (ch >= d1 && ch <= d2) {
            val = ch - d1;
        } else if (ch >= h1 && ch <= h2) {
            val = ch - h1;
        }
        if (i % 2 === 1) {
            t = val;
        } else {
            c.push (t * 16 + val)
        }
    }
    if (c.length > 0) {
        result.r = c[0];
    }
    if (c.length > 1) {
        result.g = c[1];
    }
    if (c.length > 2) {
        result.b = c[2];
    }
    if (c.length > 3) {
        result.a = c[3];
    }
    return result;
}

export function cwDrawLine (context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    const rgba = parseColorRGBA (color);
    const xmin = x1 > x2 ? x2 : x1;
    const ymin = y1 > y2 ? y2 : y1;
    const xmax = x1 > x2 ? x1 : x2;
    const ymax = y1 > y2 ? y1 : y2;
    const imageData = context.getImageData (xmin, ymin, xmax - xmin + 1, ymax - ymin + 1);
    bresenhamDrawLine (imageData.data, imageData.width, imageData.height, x1 - xmin, y1 - ymin, x2 - xmin, y2 - ymin, rgba.r, rgba.g, rgba.b);
    context.putImageData (imageData, xmin, ymin);
}

export function cwFillCircle (context: CanvasRenderingContext2D, x0: number, y0: number, radius: number, color: string) {
    const rgba = parseColorRGBA (color);
    const imageData = context.getImageData (x0 - radius, y0 - radius, 2 * radius + 1, 2 * radius + 1);
    fillCircle (imageData.data, imageData.width, imageData.height, radius, radius, radius, rgba.r, rgba.g, rgba.b);
    context.putImageData (imageData, x0 - radius, y0 - radius);
}