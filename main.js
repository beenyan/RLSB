'use strict';
/** @type {HTMLCanvasElement} */ // 宣告作業環境
const canvas = document.getElementById('canvas'); // 取得畫布
const ctx = canvas.getContext('2d'); // 宣告2D畫布

// 物件導向
class Player{
    constructor(args) {
        let def = {
            y: 0,
            x: 0
        }
        Object.assign(def,args);
        Object.assign(this,def);
        this.Getblock();
    }
    Getblock() {
        let Rand = rand(0,7);
        this.Block = Block[Rand];
        this.Blockind = Rand + 1;
        this.x = Math.floor(screen.x / 2) -1 - (Rand === 6);
        this.y = 1;
        if (this.touch()) this.lose();
    }
    draw() {
        // 方塊
        let block = this.Block;
        for (let y = 0 ; y < block.length ; y++) {
            for (let x = 0 ; x < block[y].length ; x++) {
                if (block[y][x]) {
                    let color = Getdraw[block[y][x]];
                    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                    ctx.fillRect((x + this.x) * screen.span,(y + this.y) * screen.span,screen.span,screen.span);
                    decoration(y + this.y,x + this.x,color);
                }
            }
        }
        // 陰影 & 自身邊框
        for (let y = 0 ; y < screen.y ; y++){
            if(this.touch(y + 1,0)){
                this.border(y);
                break;
            }
        }
    }
    touch(y1= 0,x1 = 0) {
        while (this.Block === undefined) this.Getblock();
        let block = this.Block;
        for (let y = 0 ; y < block.length ; y++)
            for (let x = 0 ; x < block[y].length ; x++)
                if (block[y][x] && map[y + this.y + y1][x + this.x + x1]) return 1;
        return 0;
    }
    down() {
        let block = this.Block; 
        // 下降
        if (this.touch(1,0)) {
            for (let y = 0 ; y < block.length ; y++)
                for (let x = 0 ; x < block[y].length ; x++)
                    if (block[y][x]) map[y + this.y][x + this.x] = block[y][x];
            this.Getblock();
        }
        else this.y++;
        now = +new Date();
        this.score();
    }
    score(){
        for (let y = screen.y - 2 ; y > 0 ; y--) {
            if (map[y].includes(0)) continue;
            for (let y1 = y ; y1 > 1 ; y1--) {
                map[y1] = SA(map[y1 - 1]);
                map[1] = SA(line);
            }y++;
        }
    }
    move(y = 0,x = 0) {
        if (y === 1) this.down();
        else if (y === -1) this.transform();
        else if (y | x && !this.touch(y,x)) {
            this.y += y;
            this.x += x;
        }
    }
    transform() {
        if (this.Blockind === 2) return;
        else {
            let orig_block = this.Block;
            let new_block = [];
            for (let x = 0 ; x < orig_block[0].length ; x++) {
                new_block.push([]);
                for (let y = 0 ; y < orig_block.length ; y++)
                    new_block[x].push(orig_block[orig_block.length - y - 1][x]);
            }
            for (let y = 0 ; y < new_block.length ; y++)
                for (let x = 0 ; x < new_block[y].length ; x++)
                    if (new_block[y][x] && map[y + this.y][x + this.x])
                        return;
            this.Block = new_block;
        }
    }
    bottom(){
        for (let y = 0 ; y < screen.y ; y++){
            if(this.touch(y + 1,0)){
                this.y += y;
                this.down();
                return;
            }
        }
    }
    border(y1 = 0){
        let block = this.Block;
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 3;
        for (let y = 0 ; y < block.length ; y++) {
            for (let x = 0 ; x < block[y].length ; x++) {
                if (block[y][x]) {
                    let color = Getdraw[block[y][x]];
                    ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                    ctx.rect((x + this.x) * screen.span,(y + this.y + y1) * screen.span,screen.span,screen.span);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
        ctx.closePath();
    }
    lose(){
        alert("U lose");
        init();
    }
}
let Block = [
    [[0,1,0],[1,1,1]],
    [[2,2],[2,2]],
    [[0,0,3],[3,3,3]],
    [[4,4,0],[0,4,4]],
    [[0,5,5],[5,5,0]],
    [[6,0,0],[6,6,6]],
    [[7,7,7,7]]
]
let player;
let screen = {x:12,y:22,span:40};
let map = [];
let Getdraw = [[64,64,64],[147,112,216],[236,208,50],[255,165,0],[205,92,92],[140,190,0],[30,144,255],[30,220,220],[160,160,160]];
let ww = screen.x * screen.span;
let wh = screen.y * screen.span;
canvas.width = ww;
canvas.height = wh;
let now;
let line = [];

function init() { // 初始化
    for (let y = 0 ; y < screen.y ; y++) {
        map[y] = [];
        for (let x = 0 ; x < screen.x ; x++) {
            if (y && y + 1 != screen.y && x && x + 1 != screen.x) map[y][x] = 0;
            else map[y][x] = 8;
        }
    }
    now = +new Date();
    player = new Player();
    line = SA(map[1]);
}

window.addEventListener('keydown', e => {
    let t = e.key;
    if (t == ' ') player.bottom();
    player.move(
        (t === 'w' || t === 'ArrowUp' || t === 'W') ? -1 : (t === 's' || t === 'ArrowDown' || t === 'S') ? 1 : 0,
        (t === 'a' || t === 'ArrowLeft' || t === 'A') ? -1 : (t === 'd' || t === 'ArrowRight' || t === 'D') ? 1 : 0
    );
})

function update() {
    player.down();
}
function draw() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(0,0,ww,wh);
    for (let y = 0 ; y < screen.y ; y++) { // 畫方塊
        for (let x = 0 ; x < screen.x ; x++) {
            let color = Getdraw[map[y][x]];
            ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
            ctx.fillRect(x * screen.span,y * screen.span,screen.span,screen.span);
            if (map[y][x]) decoration(y,x,color);
        }
    }
    
    player.draw();
    if (+new Date() - now >= speed) { // 更新
        update();
        now = +new Date();
    }
    requestAnimationFrame(draw); 
}

function rand(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min} // 隨機整數，含最大值、最小值 
function SA(array) {return JSON.parse(JSON.stringify(array))}
let light = [250,-160,-250,160]; // 亮度變化
let sqrt = Math.ceil(Math.sqrt(screen.span) + 1); // 陰影大小
function decoration(y = 0, x = 0,color){
    for (let i = 0 ; i < 4 ; i++){
        ctx.save();
        ctx.beginPath();

        ctx.translate(screen.span * x + ((i && i < 3) ?screen.span :0),y * screen.span + ((i >= 2) ?screen.span :0));
        ctx.rotate(Math.PI / 2 * i);
        ctx.moveTo(0,0);
        ctx.lineTo(sqrt,sqrt);
        ctx.lineTo(screen.span - sqrt,sqrt);
        ctx.lineTo(screen.span,0);
        ctx.fillStyle = `rgb(${(255 - color[0]) / 255 * light[i] + color[0]},${(255 - color[1]) / 255 * light[i] + color[1]},${(255 - color[2]) / 255 * light[i] + color[2]})`; // 亮度變化
        ctx.fill();

        ctx.closePath();
        ctx.restore();
    }
}

let speed = 1000; // 掉落毫秒數
init();
requestAnimationFrame(draw);