export class Graph {
    canvasWidth: number;
    canvasHeight: number;
    ctx: any;

    constructor(canvas: any) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();
        canvas[0].width = this.canvasWidth;
        canvas[0].height = this.canvasHeight;
        this.ctx = canvas[0].getContext('2d');
    };

    histogram(options: any): void {
        let paddingH = options.paddingH || 20;
        let paddingV = options.paddingV || 20;
        let color = options.color || '#f00';
        let bkcolor = options.bkcolor || '#fff';
        let barWidth = Math.round((this.canvasWidth - (options.values.length + 1) * paddingH) / options.values.length);
        let barHeight = this.canvasHeight - 2 * paddingV;
        let barTop = paddingV;
        let barLeft = paddingH;
        let maxValue = 0;
        for (let i = 0; i < options.values.length; i++) {
            if (options.values[i] > maxValue) {
                maxValue = options.values[i];
            }
        }
        this.ctx.fillStyle = bkcolor;
        if (maxValue > 0) {
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.ctx.fillStyle = color;
            for (let i = 0; i < options.values.length; i++) {
                let top = barTop + Math.round(barHeight * (maxValue - options.values[i]) / maxValue);
                let height = this.canvasHeight - paddingV - top;
                this.ctx.fillRect(barLeft, top, barWidth, height);
                barLeft += barWidth;
                barLeft += paddingH;
            }
        }
    };
}
