'use strict';
/** @type {HTMLCanvasElement} */ // 宣告作業環境
const canvas = document.getElementById('canvas'); // 取得畫布
const ctx = canvas.getContext('2d'); // 宣告2D畫布

// 物件導向
class Player{
    constructor(args) {
        let def = {
            y: 0,
            x: 0,
            tmpset: 0,
        }
        Object.assign(def,args);
        Object.assign(this,def);
        this.Getblock();
    }
    Getblock() {
        if (this.N_block === undefined) {
            let Rand = rand(0,6);
            this.N_block = Block[Rand];
            this.N_blockind = Rand;
        }
        let Rand = rand(0,6);
        this.Block = this.N_block;
        this.Blockind = this.N_blockind;
        this.x = Math.floor(screen.x / 2) -1 - (this.Blockind === 6);
        this.y = 1;
        this.N_block = Block[Rand];
        this.N_blockind = Rand;
        this.tmpset = 0;
        if (this.touch()) this.lose();
    }
    draw() {
        // 陰影 & 自身邊框
        for (let y = 0 ; y < screen.y ; y++){
            if(this.touch(y + 1,0)){
                this.border(y);
                break;
            }
        }
        // 方塊
        let block = this.Block;
        for (let y = 0 ; y < block.length ; y++) 
            for (let x = 0 ; x < block[y].length ; x++) 
                if (block[y][x]) 
                    decoration(y + this.y,x + this.x, Getdraw[block[y][x]]);
    }
    touch(y1 = 0,x1 = 0) {
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
        let lines = 0;
        for (let y = screen.y - 2 ; y > 0 ; y--) {
            if (map[y].includes(0)) continue;
            for (let y1 = y ; y1 > 1 ; y1--) {
                map[y1] = SA(map[y1 - 1]);
                map[1] = SA(line);
            }y++;
            lines++;
        }
        Gui.score += [0,40,100,300,1200][lines];
    }
    move(y = move.y,x = move.x) {
        movetime = +new Date();
        if ((y | x) === 0) return;
        else if (y === 1) this.down();
        else if (y === -1) this.transform();
        else if (y | x && !this.touch(y,x)) {
            this.y += y;
            this.x += x;
        }
    }
    transform() {
        move.y = 0;
        if (this.Blockind === 1) return;
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
                    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},.4)`;
                    ctx.rect((x + this.x) * screen.span,(y + this.y + y1) * screen.span,screen.span,screen.span);
                    ctx.fillRect((x + this.x) * screen.span,(y + this.y + y1) * screen.span,screen.span,screen.span);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
        ctx.closePath();
    }
    lose() {
        alert("U lose");
        init();
    }
    set() {
        if (this.tmpset) return;
        else if (this.tmp_blockind === undefined) {
            this.tmp_blockind = this.Blockind;
            this.Getblock();
            this.tmpset = 1;
        }
        else {
            this.Block = Block[this.tmp_blockind];
            this.Blockind = [this.tmp_blockind, this.tmp_blockind = this.Blockind][0];
            this.x = Math.floor(screen.x / 2) -1 - (this.Blockind === 6);
            this.y = 1;
            this.tmpset = 1;
        }
    }
}
class GUI{
    constructor(args) {
        let def = {
            score: 0,
            light: [160,-255,-255,160],
            sqrt: Math.ceil(20),
            bc: [0,254,254]
        }
        Object.assign(def,args);
        Object.assign(this,def);
        this.x = 5;
    }
    draw() {
        for (let y = 0 ; y < this.y ; y++)
            for (let x = 0 ; x < this.x ; x++)
                decoration(y,x + screen.x,Getdraw[8]);
        let block = Block[player.N_blockind];
        for (let y = 0 ; y < 2 ; y++) {
            if (block[y] === undefined) block[y] = [];
            for (let x = 0 ; x < 4 ; x++) {
                if (block[y][x] !== undefined && block[y][x]) decoration(y + 1,x + screen.x,Getdraw[block[y][x]]);
                else {
                    ctx.save();
                    ctx.translate((x + screen.x) * this.span,(y + 1) * this.span);
                    ctx.clearRect(0, 0, this.span, this.span);
                    decoration(0,0,[50,50,50,.08]);
                    ctx.restore();
                }
            }
        }
        this.tmp();
        this.sscore();
    }
    tmp() {
        let block = Block[player.tmp_blockind];
        for (let y = 0 ; y < 2 ; y++) {
            for (let x = 0 ; x < 4 ; x++) {
                ctx.save();
                ctx.translate((x + screen.x) * this.span,(y + 19) * this.span);
                if (block !== undefined && block[y][x]) decoration(0,0,Getdraw[block[y][x]]);
                else {
                    ctx.clearRect(0, 0, this.span, this.span);
                    decoration(0,0,[50,50,50,.08])
                }
                ctx.restore();
            }
        }
    }
    sscore() {
        ctx.save();
        // 區塊
        ctx.translate(this.L,this.span * 5);
        ctx.fillStyle = 'rgb(96, 226, 225)';
        ctx.shadowColor = 'rgb(96, 236, 255)';
        ctx.shadowBlur = 20;
        ctx.fillRect(0,0,this.span * 4,this.span * 2);
        // 文字
        ctx.font = "40px Arial";
        ctx.fillStyle = 'rgb(0, 50, 255)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.score, this.span * 4, this.span + 5);
        ctx.restore();
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
let screen = {x:12,y:22,span:40};
let player;
let Gui = new GUI(screen);
let map = [];
let Getdraw = [[64,64,64],[145,0,188],[236,208,50],[255,165,0],[205,92,92],[140,190,0],[0,85,254],[30,220,220],[160,160,160]];
let ww = (screen.x + Gui.x)* screen.span;
let wh = screen.y * screen.span;
canvas.width = ww;
canvas.height = wh;
let now;
let movetime;
let line = [];
let move = {x:0,y:0};

function init() { // 初始化
    for (let y = 0 ; y < screen.y ; y++) {
        map[y] = [];
        for (let x = 0 ; x < screen.x ; x++) {
            if (y && y + 1 != screen.y && x && x + 1 != screen.x) map[y][x] = 0;
            else map[y][x] = 8;
        }
    }
    now = +new Date();
    movetime = +new Date();
    player = new Player();
    Object.assign(Gui,{
        score: 0,
        L: screen.span * screen.x
    });
    line = SA(map[1]);
}

let keydown = 1;
window.addEventListener('keydown', e => {
    let t = e.key;
    if (t === ' ') player.bottom();
    else if (t === 'Shift') player.set();
    move = {
        y: (['w','ArrowUp','W'].includes(t)) ?-1 : (['s','ArrowDown','S'].includes(t)) ?1 :0,
        x: (['a','ArrowLeft','A'].includes(t)) ?-1 : (['d','ArrowRight','D'].includes(t)) ?1 :0
    }
    if (keydown) {
        player.move();
        movetime += 20;
    }
    keydown = 0;
})
window.addEventListener('keyup', e => {
    let t = e.key;
    move = {
        y: (['w','ArrowUp','W','s','ArrowDown','S'].includes(t)) ? 0 : move.y,
        x: (['a','ArrowLeft','A','d','ArrowRight','D'].includes(t)) ? 0 : move.x
    }
    keydown = 1;
})
function draw() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(0,0,ww,wh);
    for (let y = 0 ; y < screen.y ; y++) { // 畫方塊
        for (let x = 0 ; x < screen.x ; x++) {
            let color = Getdraw[map[y][x]];
            if (map[y][x]) decoration(y,x,color);
            else {
                ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                ctx.fillRect(x * screen.span,y * screen.span,screen.span,screen.span);
            }
        }
    }
    player.draw();
    Gui.draw();
    let now_time = +new Date();
    if (now_time - movetime >= 60) { // 移動更新
        player.move();
        movetime = +new Date();
    }
    if (now_time - now >= speed) { // 更新
        player.down();
        now = +new Date();
    }
    requestAnimationFrame(draw); 
}

function rand(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min} // 隨機整數，含最大值、最小值 
function SA(array) {return JSON.parse(JSON.stringify(array))}
let light = [180,-200,-240,120]; // 亮度變化
let sqrt = Math.ceil(Math.sqrt(screen.span) + 1); // 陰影大小
function decoration(y = 0, x = 0,color){
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${(color[3] === undefined) ?1 :color[3]})`;
    ctx.fillRect(x * screen.span,y * screen.span,screen.span,screen.span);
    for (let i = 0 ; i < 4 ; i++){
        ctx.save();
        ctx.beginPath();

        ctx.translate(screen.span * x + ((i && i < 3) ?screen.span :0),y * screen.span + ((i >= 2) ?screen.span :0));
        ctx.rotate(Math.PI / 2 * i);
        ctx.moveTo(0,0);
        ctx.lineTo(sqrt,sqrt);
        ctx.lineTo(screen.span - sqrt,sqrt);
        ctx.lineTo(screen.span,0);
        ctx.fillStyle = `rgba(${(255 - color[0]) / 255 * light[i] + color[0]},${(255 - color[1]) / 255 * light[i] + color[1]},${(255 - color[2]) / 255 * light[i] + color[2]},${(color[3] === undefined) ?1 :color[3]})`; // 亮度變化
        ctx.fill();

        ctx.closePath();
        ctx.restore();
    }
}

let speed = 1000; // 掉落毫秒數
init();
requestAnimationFrame(draw);