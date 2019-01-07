"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var VelocityType;
(function (VelocityType) {
    VelocityType["SLOW"] = "slow";
    VelocityType["QUICK"] = "quick";
})(VelocityType || (VelocityType = {}));
var GameState;
(function (GameState) {
    GameState[GameState["RUNNING"] = 0] = "RUNNING";
    GameState[GameState["PAUSE"] = 1] = "PAUSE";
    GameState[GameState["OVER"] = 2] = "OVER";
})(GameState || (GameState = {}));
var Direction;
(function (Direction) {
    Direction["LEFT"] = "left";
    Direction["RIGHT"] = "right";
})(Direction || (Direction = {}));
var Tetris = /** @class */ (function () {
    function Tetris(canvas, options) {
        if (options === void 0) { options = {}; }
        this.options = {
            padding: 5,
            cellSize: 20,
            colNum: 12,
            rowNum: 18,
            showPreview: true,
            slow: 700,
            quick: 100,
        };
        /**缓存网格的画布 */
        this.canvasGrid = document.createElement("canvas");
        this.ctxGrid = this.canvasGrid.getContext("2d");
        this.gridSize = { w: 0, h: 0 };
        this.previewSize = { w: 0, h: 0 };
        /**用来记录堆积的方块 */
        this.piles = [];
        this.state = GameState.OVER;
        this.velocity = this.options.slow;
        /**记录消除的行数 */
        this.clearLineCount = 0;
        this.container = canvas;
        if ("string" == typeof canvas) {
            this.container = document.getElementById(canvas);
        }
        if (!(this.container instanceof HTMLCanvasElement)) {
            throw new Error("container不是一个HTMLCanvasElement对象！");
        }
        this.ctx = this.container.getContext("2d");
        this.setOptions(options);
        this.initPiles();
    }
    /**随机选取一个颜色 */
    Tetris.prototype.takeColor = function () {
        var r = Math.floor(Math.random() * 256);
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);
        return "rgb(" + r + "," + g + "," + b + ")";
    };
    /**随机选取一个方块，包括任意形状 */
    Tetris.prototype.takeBlock = function () {
        var colNum = this.options.colNum;
        var typeIndex = Math.floor(Math.random() * Tetris.BLOCKS.length);
        var types = Tetris.BLOCKS[typeIndex]; //随机数区间[0-Tetris.BLOCKS.length)
        var shapeIndex = Math.floor(Math.random() * types.length);
        var block = types[shapeIndex]; //随机数区间[0,types.length)
        var x = Math.floor((colNum - block.w) * 0.5); //尽量让方块位于水平中部
        var y = 0; //一开始方块处于最上方
        var color = this.takeColor();
        return __assign({}, block, { x: x, y: y, color: color, typeIndex: typeIndex, shapeIndex: shapeIndex });
    };
    Tetris.prototype.init = function () {
        var _a = this.options, cellSize = _a.cellSize, colNum = _a.colNum, rowNum = _a.rowNum, showPreview = _a.showPreview, padding = _a.padding;
        this.gridSize = { w: cellSize * colNum, h: cellSize * rowNum };
        //最宽的方块占4格，再加上两边为5的padding
        this.previewSize = { w: cellSize * 4 + 5 * 2, h: cellSize * rowNum };
        this.container.width = this.gridSize.w + padding * 2 + (showPreview ? this.previewSize.w : 0);
        this.container.height = this.gridSize.h + padding * 2;
        this.canvasGrid.width = this.gridSize.w;
        this.canvasGrid.height = this.gridSize.h;
        //平移画布坐标系
        this.ctx.translate(padding, padding);
        this.drawGrid(this.ctxGrid);
        this.drawBlock(this.ctx);
    };
    Tetris.prototype.initPiles = function () {
        var _a = this.options, colNum = _a.colNum, rowNum = _a.rowNum;
        var piles = [];
        for (var i = 0; i < rowNum; i++) {
            piles[i] = [];
            for (var j = 0; j < colNum; j++) {
                piles[i].push({ use: 0, color: "black" });
            }
        }
        this.piles = piles;
    };
    /**获取方块的每个小格子在网格里的坐标 */
    Tetris.prototype.blockCoordinateOfGrid = function (block) {
        var shape = block.shape, _a = block.x, x = _a === void 0 ? 0 : _a, _b = block.y, y = _b === void 0 ? 0 : _b;
        var coordinate = [];
        shape.forEach(function (use, i) {
            if (use) {
                //一维数组下标转二维数组(4*4)的下标
                var row = Math.floor(i / 4);
                var col = i % 4;
                coordinate.push({ x: x + col, y: y + row });
            }
        });
        return coordinate;
    };
    /**消行处理 */
    Tetris.prototype.clearLines = function () {
        var cursor = -1;
        //从底往上找需要被消除的行
        for (var i = this.piles.length - 1; i >= 0; i--) {
            var pile = this.piles[i];
            var useEq0 = pile.find(function (p) { return p.use == 0; });
            if (pile.find(function (p) { return p.use == 1; }) == null) { //此行是空行，再往上也必定是空行，就不必再往上走了，上面的肯定也是空行
                if (cursor > -1)
                    this.clearLineCount += cursor - i; //cursor-i即消行数量
                for (var j = i - 1; j <= cursor; j++) { //将从第i行下面一行到第cursor行置零
                    this.piles[j] = this.piles[i].map(function (p) { return (__assign({}, p)); }); //this.piles[i]就是空行，克隆该行再赋值给第j行，即完成置零
                }
                return;
            }
            else if (useEq0 == null && cursor == -1) { //若此行是满行，并且有没有对cursor赋值过
                cursor = i;
            }
            else if (useEq0 != null && cursor > -1) { //若此行既不是满行，又不是空行，并且cursor>-1，说明存在满行，需要进行下移的操作
                this.piles[cursor--] = this.piles[i]; //此行覆盖掉cursor位置处的行，并上移cursor
            }
        }
    };
    /**判断是否结束游戏 */
    Tetris.prototype.isOver = function () {
        //若顶层已经有格子被方块堆积，那么游戏结束
        return this.piles[0].filter(function (_a) {
            var use = _a.use;
            return use;
        }).length > 0;
    };
    /** 判断方块位置是否越界，或是否会叠加已堆积的方块*/
    Tetris.prototype.judge = function (block) {
        if (block === void 0) { block = this.currentBlock; }
        if (!block)
            return false;
        var _a = this.options, _b = _a.rowNum, rowNum = _b === void 0 ? 0 : _b, _c = _a.colNum, colNum = _c === void 0 ? 0 : _c;
        var _d = block.x, x = _d === void 0 ? 0 : _d, _e = block.y, y = _e === void 0 ? 0 : _e, _f = block.w, w = _f === void 0 ? 0 : _f, _g = block.h, h = _g === void 0 ? 0 : _g;
        if (x < 0 || x + w > colNum)
            return false; //两边越界 
        if (y + h > rowNum)
            return false; //下边越界
        var coordinate = this.blockCoordinateOfGrid(block);
        for (var i = 0; i < coordinate.length; i++) {
            var _h = coordinate[i], x_1 = _h.x, y_1 = _h.y;
            //若某个小格子已堆积了方块，那么返回false
            if (this.piles[y_1][x_1].use) {
                return false;
            }
        }
        return true;
    };
    /**画网格 */
    Tetris.prototype.drawGrid = function (ctx) {
        var _a = this.options, rowNum = _a.rowNum, colNum = _a.colNum, cellSize = _a.cellSize;
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#ddd";
        ctx.rect(0, 0, this.gridSize.w, this.gridSize.h);
        for (var row = 1; row < rowNum; row++) {
            ctx.moveTo(0, cellSize * row);
            ctx.lineTo(this.gridSize.w, cellSize * row);
        }
        for (var col = 1; col < colNum; col++) {
            ctx.moveTo(cellSize * col, 0);
            ctx.lineTo(cellSize * col, this.gridSize.h);
        }
        ctx.stroke();
        ctx.restore();
    };
    /**画预览 */
    Tetris.prototype.drawPreview = function (ctx) {
        //-------边框
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#ddd";
        ctx.rect(this.gridSize.w, 0, this.previewSize.w, this.previewSize.h);
        ctx.stroke();
        ctx.restore();
        if (!this.nextBlock)
            return;
        //-------方块预览
        ctx.beginPath();
        ctx.save();
        var text = "下个方块";
        var fontSize = 16;
        var paddingTop = 5;
        ctx.textBaseline = "top";
        ctx.font = fontSize + "px \u5FAE\u8F6F\u96C5\u9ED1";
        var width = ctx.measureText(text).width;
        ctx.fillText(text, this.gridSize.w + (this.previewSize.w - width) * 0.5, paddingTop);
        var _a = this.nextBlock, shape = _a.shape, w = _a.w, color = _a.color;
        var _b = this.options.cellSize, cellSize = _b === void 0 ? 0 : _b;
        //方块居中
        var x = this.gridSize.w + (this.previewSize.w - w * cellSize) * 0.5;
        var y = fontSize + paddingTop * 4;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        shape.forEach(function (use, i) {
            if (use) {
                //一维数组下标转二维数组(4*4)的下标
                var row = Math.floor(i / 4);
                var col = i % 4;
                ctx.beginPath();
                ctx.rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
                ctx.fill();
                ctx.stroke();
            }
        });
        ctx.restore();
        //-------一些提示
        ctx.save();
        text = "\u5DF2\u6D88\u884C\uFF1A" + this.clearLineCount;
        ctx.font = "14px \u5FAE\u8F6F\u96C5\u9ED1";
        ctx.fillText(text, this.gridSize.w + 5, y + paddingTop + 5 * cellSize);
        ctx.restore();
    };
    /**画方块 */
    Tetris.prototype.drawBlock = function (ctx) {
        if (!this.currentBlock)
            return;
        var _a = this.currentBlock.color, color = _a === void 0 ? "black" : _a;
        var _b = this.options.cellSize, cellSize = _b === void 0 ? 0 : _b;
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        this.blockCoordinateOfGrid(this.currentBlock).forEach(function (_a) {
            var x = _a.x, y = _a.y;
            ctx.beginPath();
            ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
    };
    /**画已堆叠的方块 */
    Tetris.prototype.drawPiles = function (ctx) {
        var _a = this.options.cellSize, cellSize = _a === void 0 ? 0 : _a;
        this.piles.forEach(function (pile, row) {
            pile.forEach(function (_a, col) {
                var use = _a.use, color = _a.color;
                if (use) {
                    ctx.beginPath();
                    ctx.save();
                    ctx.fillStyle = color;
                    ctx.strokeStyle = color;
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = "black";
                    ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            });
        });
    };
    Tetris.prototype.draw = function () {
        var padding = this.options.padding;
        //因为画布平移了,所以-padding
        this.ctx.clearRect(-padding, -padding, this.container.width, this.container.height);
        this.ctx.drawImage(this.canvasGrid, 0, 0, this.gridSize.w, this.gridSize.h);
        this.drawBlock(this.ctx);
        this.drawPiles(this.ctx);
        this.drawPreview(this.ctx);
    };
    /**消息提示 */
    Tetris.prototype.showMessage = function (msg) {
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
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.save();
        //----遮罩
        ctx.fillStyle = "white";
        ctx.globalAlpha = .7;
        ctx.rect(0, 0, this.container.width, this.container.height);
        ctx.fill();
        //----提示文字
        var fontSize = 18;
        ctx.font = fontSize + "px \u5FAE\u8F6F\u96C5\u9ED1";
        var width = ctx.measureText(msg || "").width;
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(msg || "", (this.gridSize.w - width) * 0.5, (this.gridSize.h - fontSize) * 0.5);
        ctx.restore();
    };
    Tetris.prototype.run = function () {
        var _this = this;
        if (GameState.RUNNING != this.state)
            return;
        if (!this.currentBlock) {
            //如果预览方块有值，就使用预览方块，并重新生成预览方块
            this.currentBlock = this.nextBlock || this.takeBlock();
            this.nextBlock = this.takeBlock();
        }
        this.draw();
        this.currentBlock.y++;
        if (!this.judge()) { //若出现越界等情况
            this.currentBlock.y--; //还原y坐标
            var coordinate = this.blockCoordinateOfGrid(this.currentBlock);
            coordinate.forEach(function (p) {
                _this.piles[p.y][p.x].use = 1; //标记此格已有方块
                _this.piles[p.y][p.x].color = _this.currentBlock.color;
            });
            this.currentBlock = undefined; //置空当前方块
            this.clearLines(); //消行处理
            if (this.isOver()) { //游戏是否结束
                this.state = GameState.OVER;
                clearTimeout(this.timeout);
                this.showMessage();
                return;
            }
        }
        this.timeout = setTimeout(function () {
            _this.run();
        }, this.velocity);
    };
    Tetris.prototype.setOptions = function (options) {
        var opts = {};
        Object.keys(options).forEach(function (key) {
            var val = options[key];
            if (val !== undefined) { //过滤掉值为undefined的
                opts[key] = val;
            }
        });
        this.options = __assign({}, this.options, opts);
        this.init();
        this.draw();
    };
    /**设置方块下落速度 */
    Tetris.prototype.setVelocity = function (type) {
        if (VelocityType.QUICK == type) {
            this.velocity = this.options.quick;
        }
        else {
            this.velocity = this.options.slow;
        }
        clearTimeout(this.timeout);
        this.run();
    };
    /**设置方块下落速度为慢速 */
    Tetris.prototype.slow = function () {
        this.setVelocity(VelocityType.SLOW);
    };
    /**设置方块下落速度为快速 */
    Tetris.prototype.quick = function () {
        this.setVelocity(VelocityType.QUICK);
    };
    /**
     * 移动方块
     * @param direction 移动方向，左或右
     */
    Tetris.prototype.move = function (direction) {
        if (!this.currentBlock)
            return;
        var step = Direction.LEFT == direction ? -1 : 1;
        this.currentBlock.x += step;
        if (!this.judge()) {
            this.currentBlock.x += (-step); //还原
        }
        else {
            this.draw();
        }
    };
    /**左移方块 */
    Tetris.prototype.leftMove = function () {
        this.move(Direction.LEFT);
    };
    /**右移方块 */
    Tetris.prototype.rightMove = function () {
        this.move(Direction.RIGHT);
    };
    /**旋转方块 */
    Tetris.prototype.rotate = function () {
        if (!this.currentBlock)
            return;
        var _a = this.currentBlock, _b = _a.typeIndex, typeIndex = _b === void 0 ? 0 : _b, _c = _a.shapeIndex, shapeIndex = _c === void 0 ? 0 : _c, x = _a.x, y = _a.y, color = _a.color;
        var types = Tetris.BLOCKS[typeIndex];
        if (types.length <= 1)
            return; //2个上才有旋转的必要，否则旋转后的方块并没有什么变化
        shapeIndex++; //取下一个方块，即旋转后的形状
        if (shapeIndex >= types.length)
            shapeIndex = 0; //到里最后一个，取第0个元素
        var newBlock = __assign({}, types[shapeIndex], { x: x, y: y, color: color, typeIndex: typeIndex, shapeIndex: shapeIndex });
        if (this.judge(newBlock)) { //没有越界等行为，
            this.currentBlock = newBlock;
            this.draw();
        }
    };
    /**开始游戏 */
    Tetris.prototype.start = function () {
        if (GameState.OVER == this.state) {
            this.restart();
            return;
        }
        if (GameState.RUNNING == this.state)
            return;
        this.state = GameState.RUNNING;
        this.run();
    };
    /**暂停游戏 */
    Tetris.prototype.pause = function () {
        if (GameState.RUNNING == this.state) {
            this.state = GameState.PAUSE;
            this.showMessage();
        }
    };
    /**重新开始游戏 */
    Tetris.prototype.restart = function () {
        this.initPiles();
        this.currentBlock = undefined;
        clearTimeout(this.timeout);
        this.state = GameState.RUNNING;
        this.clearLineCount = 0;
        this.run();
    };
    /**所有的方块，是一个三维数组，第1层是所有的方块种类，第2层是某个方块种类不同旋转的形状集合，第3层是一个对象{shape:一维数组表示方块，w:方块宽度,h:方块高度} */
    Tetris.BLOCKS = [
        [
            {
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
    return Tetris;
}());
