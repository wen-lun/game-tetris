interface Size {
    w: number
    h: number
}

interface Point {
    x: number
    y: number
}

interface Block {
    shape: Array<0 | 1>
    /**此宽度表示方块占里网格的几格 */
    w: number
    /**此高度表示方块占里网格的几格 */
    h: number
}

interface ExtendBlock extends Block {
    /**方块x坐标，指方块左上角位于网格横向格数位置 */
    x: number
    /**方块y坐标，指方块左上角位于网格竖向格数位置 */
    y: number
    /**方块颜色 */
    color: string
    /**方块在所有方块中种类处的索引(旋转方块会用到) */
    typeIndex: number
    /**方块某一旋转状态的索引(旋转方块会用到) */
    shapeIndex: number
}

interface Pile {
    use: 1 | 0
    color: string
}

interface Option {
    /**内边距 */
    padding?: number
    /**单元格宽尺寸(px) */
    cellSize?: number
    /**列数 */
    colNum?: number
    /**行数 */
    rowNum?: number
    /**是否显示预览 */
    showPreview?: boolean
    /**方块下落慢的速度，单位ms */
    slow?: number
    /**方块下落快的速度,单位ms */
    quick?: number
}

enum VelocityType {
    SLOW = "slow", QUICK = "quick"
}

enum GameState {
    RUNNING, PAUSE, OVER
}

enum Direction {
    LEFT = "left", RIGHT = "right"
}

class Tetris {

    /**所有的方块，是一个三维数组，第1层是所有的方块种类，第2层是某个方块种类不同旋转的形状集合，第3层是一个对象{shape:一维数组表示方块，w:方块宽度,h:方块高度} */
    private static BLOCKS: Array<Array<Block>> = [//第1层 方块种类
        [//第2层 //某个种类的不同旋转后的形状
            {//第三层 方块
                shape: [
                    1, 1, 1, 1,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 4, h: 1
            }, {
                shape: [
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                ], w: 1, h: 4
            },
        ], [
            {
                shape: [
                    1, 1, 0, 0,
                    1, 1, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 2
            }
        ], [
            {
                shape: [
                    1, 1, 1, 0,
                    0, 1, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            },
            {
                shape: [
                    0, 1, 0, 0,
                    1, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            },
            {
                shape: [
                    0, 1, 0, 0,
                    1, 1, 1, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            },
            {
                shape: [
                    1, 0, 0, 0,
                    1, 1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            },
        ], [
            {
                shape: [
                    1, 1, 1, 0,
                    1, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            }, {
                shape: [
                    1, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            }, {
                shape: [
                    0, 0, 1, 0,
                    1, 1, 1, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            }, {
                shape: [
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    1, 1, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            },
        ], [
            {
                shape: [
                    1, 1, 1, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            }, {
                shape: [
                    0, 1, 0, 0,
                    0, 1, 0, 0,
                    1, 1, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            }, {
                shape: [
                    1, 0, 0, 0,
                    1, 1, 1, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            }, {
                shape: [
                    1, 1, 0, 0,
                    1, 0, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            },
        ], [
            {
                shape: [
                    1, 1, 0, 0,
                    0, 1, 1, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            },
            {
                shape: [
                    0, 1, 0, 0,
                    1, 1, 0, 0,
                    1, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            },
        ], [
            {
                shape: [
                    0, 1, 1, 0,
                    1, 1, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                ], w: 3, h: 2
            },
            {
                shape: [
                    1, 0, 0, 0,
                    1, 1, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 0, 0,
                ], w: 2, h: 3
            },
        ]
    ];

    private options: Option = {
        padding: 5,
        cellSize: 20,
        colNum: 12,
        rowNum: 18,
        showPreview: true,
        slow: 700,
        quick: 100,
    }

    private timeout?: number;

    /**缓存网格的画布 */
    private canvasGrid: HTMLCanvasElement = document.createElement("canvas");
    private ctxGrid: CanvasRenderingContext2D = this.canvasGrid.getContext("2d")!;
    /**容器画布 */
    private container: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private gridSize: Size = { w: 0, h: 0 };
    private previewSize: Size = { w: 0, h: 0 };

    /**用来记录堆积的方块 */
    private piles: Array<Array<Pile>> = [];

    /**当前方块 */
    private currentBlock?: ExtendBlock;
    /**下一个方块 */
    private nextBlock?: ExtendBlock;

    private state = GameState.OVER;
    private velocity = this.options.slow!;
    /**记录消除的行数 */
    private clearLineCount = 0;

    constructor(canvas: string | HTMLCanvasElement, options: Option = {}) {
        this.container = canvas as HTMLCanvasElement;
        if ("string" == typeof canvas) {
            this.container = document.getElementById(canvas) as HTMLCanvasElement;
        }

        if (!(this.container instanceof HTMLCanvasElement)) {
            throw new Error("container不是一个HTMLCanvasElement对象！")
        }
        this.ctx = this.container.getContext("2d")!;
        this.setOptions(options);
        this.initPiles();
    }

    /**随机选取一个颜色 */
    private takeColor() {
        let r = Math.floor(Math.random() * 256)
        let g = Math.floor(Math.random() * 256)
        let b = Math.floor(Math.random() * 256)
        return `rgb(${r},${g},${b})`;
    }

    /**随机选取一个方块，包括任意形状 */
    private takeBlock(): ExtendBlock {
        let { colNum } = this.options;
        let typeIndex = Math.floor(Math.random() * Tetris.BLOCKS.length);
        let types = Tetris.BLOCKS[typeIndex];//随机数区间[0-Tetris.BLOCKS.length)
        let shapeIndex = Math.floor(Math.random() * types.length);
        let block = types[shapeIndex];//随机数区间[0,types.length)
        const x = Math.floor((colNum! - block.w) * 0.5);//尽量让方块位于水平中部
        const y = 0;//一开始方块处于最上方
        const color = this.takeColor();
        return { ...block, x, y, color, typeIndex, shapeIndex };
    }

    private init() {
        let { cellSize, colNum, rowNum, showPreview, padding } = this.options;
        this.gridSize = { w: cellSize! * colNum!, h: cellSize! * rowNum! };
        //最宽的方块占4格，再加上两边为5的padding
        this.previewSize = { w: cellSize! * 4 + 5 * 2, h: cellSize! * rowNum! };
        this.container.width = this.gridSize.w + padding! * 2 + (showPreview ? this.previewSize.w : 0);
        this.container.height = this.gridSize.h + padding! * 2;
        this.canvasGrid.width = this.gridSize.w;
        this.canvasGrid.height = this.gridSize.h;
        //平移画布坐标系
        this.ctx.translate(padding!, padding!);
        this.drawGrid(this.ctxGrid);
        this.drawBlock(this.ctx);
    }

    private initPiles() {
        let { colNum, rowNum } = this.options;
        let piles: Array<Array<Pile>> = [];
        for (let i = 0; i < rowNum!; i++) {
            piles[i] = [];
            for (let j = 0; j < colNum!; j++) {
                piles[i].push({ use: 0, color: "black" });
            }
        }
        this.piles = piles;
    }

    /**获取方块的每个小格子在网格里的坐标 */
    private blockCoordinateOfGrid(block: ExtendBlock) {
        let { shape, x = 0, y = 0 } = block;
        let coordinate: Array<Point> = [];
        shape.forEach((use, i) => {
            if (use) {
                //一维数组下标转二维数组(4*4)的下标
                let row = Math.floor(i / 4);
                let col = i % 4;
                coordinate.push({ x: x + col, y: y + row });
            }
        });
        return coordinate;
    }

    /**消行处理 */
    private clearLines() {
        let cursor = -1;
        //从底往上找需要被消除的行
        for (let i = this.piles.length - 1; i >= 0; i--) {
            let pile: any = this.piles[i];
            let useEq0 = pile.find((p: any) => p.use == 0);
            if (pile.find((p: any) => p.use == 1) == null) {//此行是空行，再往上也必定是空行，就不必再往上走了，上面的肯定也是空行
                if (cursor > -1) this.clearLineCount += cursor - i;//cursor-i即消行数量
                for (let j = i - 1; j <= cursor; j++) {//将从第i行下面一行到第cursor行置零
                    this.piles[j] = this.piles[i].map(p => ({ ...p }));//this.piles[i]就是空行，克隆该行再赋值给第j行，即完成置零
                }
                return;
            } else if (useEq0 == null && cursor == -1) {//若此行是满行，并且有没有对cursor赋值过
                cursor = i;
            } else if (useEq0 != null && cursor > -1) {//若此行既不是满行，又不是空行，并且cursor>-1，说明存在满行，需要进行下移的操作
                this.piles[cursor--] = this.piles[i];//此行覆盖掉cursor位置处的行，并上移cursor
            }
        }
    }

    /**判断是否结束游戏 */
    private isOver() {
        //若顶层已经有格子被方块堆积，那么游戏结束
        return this.piles[0].filter(({ use }) => use).length > 0;
    }

    /** 判断方块位置是否越界，或是否会叠加已堆积的方块*/
    private judge(block = this.currentBlock): boolean {
        if (!block) return false;
        let { rowNum = 0, colNum = 0 } = this.options;
        let { x = 0, y = 0, w = 0, h = 0 } = block;
        if (x < 0 || x + w > colNum) return false;//两边越界 
        if (y + h > rowNum) return false;//下边越界
        const coordinate = this.blockCoordinateOfGrid(block);
        for (let i = 0; i < coordinate.length; i++) {
            let { x, y } = coordinate[i];
            //若某个小格子已堆积了方块，那么返回false
            if (this.piles[y][x].use) {
                return false;
            }
        }
        return true;
    }

    /**画网格 */
    private drawGrid(ctx: CanvasRenderingContext2D) {
        let { rowNum, colNum, cellSize } = this.options;
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#ddd";
        ctx.rect(0, 0, this.gridSize.w, this.gridSize.h);
        for (let row = 1; row < rowNum!; row++) {
            ctx.moveTo(0, cellSize! * row);
            ctx.lineTo(this.gridSize.w, cellSize! * row);
        }
        for (let col = 1; col < colNum!; col++) {
            ctx.moveTo(cellSize! * col, 0);
            ctx.lineTo(cellSize! * col, this.gridSize.h);
        }
        ctx.stroke();
        ctx.restore();
    }

    /**画预览 */
    private drawPreview(ctx: CanvasRenderingContext2D) {
        //-------边框
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#ddd";
        ctx.rect(this.gridSize.w, 0, this.previewSize.w, this.previewSize.h);
        ctx.stroke();
        ctx.restore();

        if (!this.nextBlock) return;

        //-------方块预览
        ctx.beginPath();
        ctx.save();
        let text = "下个方块";
        const fontSize = 16;
        const paddingTop = 5;
        ctx.textBaseline = "top";
        ctx.font = `${fontSize}px 微软雅黑`;
        const { width } = ctx.measureText(text);
        ctx.fillText(text, this.gridSize.w + (this.previewSize.w - width) * 0.5, paddingTop);

        let { shape, w, color } = this.nextBlock;
        let { cellSize = 0 } = this.options;
        //方块居中
        const x = this.gridSize.w + (this.previewSize.w - w * cellSize) * 0.5;
        const y = fontSize + paddingTop * 4;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black"
        shape.forEach((use, i) => {
            if (use) {
                //一维数组下标转二维数组(4*4)的下标
                let row = Math.floor(i / 4);
                let col = i % 4;
                ctx.beginPath();
                ctx.rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
                ctx.fill();
                ctx.stroke();
            }
        });

        ctx.restore();

        //-------一些提示
        ctx.save();
        text = `已消行：${this.clearLineCount}`;
        ctx.font = `14px 微软雅黑`
        ctx.fillText(text, this.gridSize.w + 5, y + paddingTop + 5 * cellSize);

        ctx.restore();
    }

    /**画方块 */
    private drawBlock(ctx: CanvasRenderingContext2D) {
        if (!this.currentBlock) return;
        let { color = "black" } = this.currentBlock;
        let { cellSize = 0 } = this.options;

        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black"
        this.blockCoordinateOfGrid(this.currentBlock).forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.fill();
            ctx.stroke();
        })
        ctx.restore();
    }

    /**画已堆叠的方块 */
    private drawPiles(ctx: CanvasRenderingContext2D) {
        let { cellSize = 0 } = this.options;
        this.piles.forEach((pile, row) => {
            pile.forEach(({ use, color }, col) => {
                if (use) {
                    ctx.beginPath();
                    ctx.save();
                    ctx.fillStyle = color;
                    ctx.strokeStyle = color;
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = "black"
                    ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            });
        });
    }

    private draw() {
        let { padding } = this.options;
        //因为画布平移了,所以-padding
        this.ctx.clearRect(-padding!, -padding!, this.container.width, this.container.height);
        this.ctx.drawImage(this.canvasGrid, 0, 0, this.gridSize.w, this.gridSize.h);
        this.drawBlock(this.ctx);
        this.drawPiles(this.ctx);
        this.drawPreview(this.ctx);
    }

    /**消息提示 */
    private showMessage(msg?: string) {
        if (!msg) {
            switch (this.state) {
                case GameState.OVER:
                    msg = "游戏结束";
                    break;
                case GameState.PAUSE:
                    msg = "游戏暂停";
                    break;
            }
        }
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.save();
        //----遮罩
        ctx.fillStyle = "white";
        ctx.globalAlpha = .7;
        ctx.rect(0, 0, this.container.width, this.container.height);
        ctx.fill();

        //----提示文字
        const fontSize = 18;
        ctx.font = `${fontSize}px 微软雅黑`;
        const { width } = ctx.measureText(msg || "");
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(msg || "", (this.gridSize.w - width) * 0.5, (this.gridSize.h - fontSize) * 0.5);
        ctx.restore();
    }

    private run() {
        if (GameState.RUNNING != this.state) return;
        if (!this.currentBlock) {
            //如果预览方块有值，就使用预览方块，并重新生成预览方块
            this.currentBlock = this.nextBlock || this.takeBlock();
            this.nextBlock = this.takeBlock();
        }

        this.draw();
        this.currentBlock!.y! ++;
        if (!this.judge()) {//若出现越界等情况
            this.currentBlock!.y!--;//还原y坐标
            const coordinate = this.blockCoordinateOfGrid(this.currentBlock!);
            coordinate.forEach(p => {
                this.piles[p.y][p.x].use = 1;//标记此格已有方块
                this.piles[p.y][p.x].color = this.currentBlock!.color!;
            });
            this.currentBlock = undefined;//置空当前方块
            this.clearLines();//消行处理
            if (this.isOver()) {//游戏是否结束
                this.state = GameState.OVER;
                clearTimeout(this.timeout);
                this.showMessage();
                return;
            }
        }
        this.timeout = setTimeout(() => {
            this.run();
        }, this.velocity);
    }

    public setOptions(options: Option) {
        let opts: any = {};
        Object.keys(options).forEach(key => {
            const val = (options as any)[key];
            if (val !== undefined) {//过滤掉值为undefined的
                opts[key] = val;
            }
        });
        this.options = { ...this.options, ...opts };
        this.init();
        this.draw();
    }

    /**设置方块下落速度 */
    public setVelocity(type: VelocityType) {
        if (VelocityType.QUICK == type) {
            this.velocity = this.options.quick!;
        } else {
            this.velocity = this.options.slow!;
        }
        clearTimeout(this.timeout);
        this.run();
    }

    /**设置方块下落速度为慢速 */
    public slow() {
        this.setVelocity(VelocityType.SLOW);
    }

    /**设置方块下落速度为快速 */
    public quick() {
        this.setVelocity(VelocityType.QUICK);
    }

    /**
     * 移动方块
     * @param direction 移动方向，左或右 
     */
    public move(direction: Direction) {
        if (!this.currentBlock) return;
        let step = Direction.LEFT == direction ? -1 : 1;
        this.currentBlock.x! += step;
        if (!this.judge()) {
            this.currentBlock.x! += (-step);//还原
        } else {
            this.draw();
        }
    }

    /**左移方块 */
    public leftMove() {
        this.move(Direction.LEFT);
    }

    /**右移方块 */
    public rightMove() {
        this.move(Direction.RIGHT);
    }

    /**旋转方块 */
    public rotate() {
        if (!this.currentBlock) return;
        let { typeIndex = 0, shapeIndex = 0, x, y, color } = this.currentBlock;
        let types = Tetris.BLOCKS[typeIndex];
        if (types.length <= 1) return; //2个上才有旋转的必要，否则旋转后的方块并没有什么变化
        shapeIndex++;//取下一个方块，即旋转后的形状
        if (shapeIndex >= types.length) shapeIndex = 0;//到里最后一个，取第0个元素
        let newBlock = { ...types[shapeIndex], x, y, color, typeIndex, shapeIndex };
        if (this.judge(newBlock)) {//没有越界等行为，
            this.currentBlock = newBlock;
            this.draw();
        }
    }

    /**开始游戏 */
    public start() {
        if (GameState.OVER == this.state) {
            this.restart();
            return;
        }
        if (GameState.RUNNING == this.state) return;
        this.state = GameState.RUNNING;
        this.run();
    }

    /**暂停游戏 */
    public pause() {
        if (GameState.RUNNING == this.state) {
            this.state = GameState.PAUSE;
            this.showMessage();
        }
    }

    /**重新开始游戏 */
    public restart() {
        this.initPiles();
        this.currentBlock = undefined;
        clearTimeout(this.timeout);
        this.state = GameState.RUNNING;
        this.clearLineCount = 0;
        this.run();
    }
}