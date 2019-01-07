# 效果图
<img src="https://raw.githubusercontent.com/destiny-wenlun/game-tetris/master/img/demo.gif"/>

# 使用
> 1、script标签引用dist/tetris.js  

# Tetris构造方法参数
```javascript
//例
new Tetris("canvas", {padding: 10, cellSize: 15})
```
* canvas：可以是HTMLCanvasElement对象，也可以是canvas元素的id
* options：一些俄罗斯方块游戏的参数配置，可不传。options可选参数如下：

|属性|说明|类型|默认值|
|:-|:-|:-|:-|
|padding|内边距|number|5|
|cellSize|单元格的尺寸，正方形|number|20|
|colNum|横向有多少格子，不能小于4格，因为方块最宽占4格，建议大于等于12格|number|12|
|rowNum|竖向有多少格子，建议大于等于18格|number|18|
|showPreview|是否显示右侧的预览，即下次出现的方块|boolean|true|
|slow|方块慢速下落的速度，单位ms，即每隔多少ms下落一格|number|700|
|quick|方块快速下落的速度，单位ms，即每隔多少ms下落一格|number|100|

# Tetris提供的一些方法

|方法|参数|说明|
|:-|:-|:-|
|start|-|开始游戏|
|pause|-|暂停游戏|
|restart|-|重新开始游戏|
|slow|-|设置方块下落速度为慢速|
|quick|-|设置方块下落速度为快速|
|setVelocity|"quick" \| "slow"|设置方块下落速度，建议使用slow方法或quick方法|
|leftMove|-|左移方块|
|rightMove|-|右移方块|
|move|"left" \| "right"|移动方块，建议使用leftMove方法或rightMove方法|
|rotate|-|旋转方块|

# 例子
```html
<!DOCTYPE html>
<html>
<head>
    ...    
</head>
<body>
    <div class="container">
        <canvas id="game"></canvas>
        <div class="desc">
            <span>←:左移方块</span>
            <span>→:右移方块</span>
            <span>↑:旋转方块</span>
            <span>↓:加速下落</span>
        </div>
        <div class="operator">
            <button onclick="start()">开始游戏</button>
            <button onclick="pause()">暂停游戏</button>
            <button onclick="restart()">重新开始</button>
        </div>
    </div>
    <script src="./dist/tetris.js"></script>
    <script>
        let tetris = new Tetris("game");
        function start() {
            tetris.start();
        }
        function pause() {
            tetris.pause();
        }
        function restart() {
            tetris.restart();
        }
        window.addEventListener("keydown", function ({ keyCode }) {
            switch (keyCode) {
                case 37://左箭头
                    tetris.leftMove();
                    break;
                case 38://上箭头
                    tetris.rotate();
                    break;
                case 39://右箭头
                    tetris.rightMove();
                    break;
                case 40://下箭头
                    tetris.quick();
                    break;
            }
        });

        window.addEventListener("keyup", function ({ keyCode }) {
            switch (keyCode) {
                case 40://下箭头
                    tetris.slow();
                    break;
            }
        });
    </script>
</body>

</html>
```
