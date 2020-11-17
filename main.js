'use strict';
/** @type {HTMLCanvasElement} */ // 宣告作業環境
const canvas = document.getElementById('canvas'); // 取得畫布
const ctx = canvas.getContext('2d'); // 宣告2D畫布

// 物件導向
class Pixel {
    constructor(args) {
        let def = {
            y: 0,
            x: 0
        }
        Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.scale, this.scale);
    }
    move() {
        ctx.fillStyle = 'rgb(64,64,64)';
        ctx.fillRect(this.x, this.y, this.scale, this.scale);
        this.x -= rand(40, 50) * this.path;
        this.y += [rand(-11, -80), rand(80, 100)][rand(0, 1)];
        if (this.x <= Gui.span || this.x + this.scale >= (Gui.screen.x - 1) * Gui.span || this.y <= Gui.span || this.y + this.scale >= (Gui.screen.y - 1) * Gui.span) return true;
        this.draw();
    }
}
class Player {
    constructor(args) {
        let def = {
            y: 0,
            x: 0,
            tmpset: 0
        }
        Object.assign(def, args);
        Object.assign(this, def);
        this.Getblock();
    }
    Getblock() {
        if (this.N_block === undefined) {
            let Rand = rand(0, 6);
            this.N_block = Block[Rand];
            this.N_blockind = Rand;
        }
        let Rand = rand(0, 6);
        this.Block = this.N_block;
        this.Blockind = this.N_blockind;
        this.x = Math.floor(Gui.screen.x / 2) - 1 - (this.Blockind === 6);
        this.y = 1;
        this.N_block = Block[Rand];
        this.N_blockind = Rand;
        this.tmpset = 0;
        if (this.touch()) this.lose();
    }
    draw() {
        if (!draw_player) return;
        // 陰影 & 自身邊框
        for (let y = 0; y < Gui.screen.y; y++) {
            if (this.touch(y + 1, 0)) {
                this.border(y);
                break;
            }
        }
        // 方塊
        let block = this.Block;
        for (let y = 0; y < block.length; y++)
            for (let x = 0; x < block[y].length; x++)
                if (block[y][x])
                    decoration(y + this.y, x + this.x, Getdraw[block[y][x]]);
    }
    touch(y1 = 0, x1 = 0) {
        while (this.Block === undefined) this.Getblock();
        let block = this.Block;
        for (let y = 0; y < block.length; y++)
            for (let x = 0; x < block[y].length; x++)
                if (block[y][x] && map[y + this.y + y1][x + this.x + x1]) return 1;
        return 0;
    }
    down() {
        let block = this.Block;
        // 下降
        if (this.touch(1, 0)) {
            for (let y = 0; y < block.length; y++)
                for (let x = 0; x < block[y].length; x++)
                    if (block[y][x]) map[y + this.y][x + this.x] = block[y][x];
            this.Getblock();
        }
        else this.y++;
        now = +new Date();
        this.score();
    }
    score() {
        let lines = 0;
        for (let y = Gui.screen.y - 2; y > 0; y--) {
            if (map[y].includes(0)) continue;
            for (let y1 = y; y1 > 1; y1--) {
                map[y1] = map[y1 - 1].slice();
                map[1] = line.slice();
                M_dele.currentTime = 0;
                M_dele.play();
            } y++;
            lines++;
        }
        Gui.score += [0, 40, 100, 300, 1200][lines];
    }
    move(y = move.y, x = move.x) {
        movetime = +new Date();
        if ((y | x) === 0) return;
        else if (y === 1) this.down();
        else if (y === -1) this.transform();
        else if (y | x && !this.touch(y, x)) {
            this.y += y;
            this.x += x;
        }
        M_move.play();
    }
    transform() {
        move.y = 0;
        if (this.Blockind === 1) return;
        else {
            let orig_block = this.Block;
            let new_block = [];
            for (let x = 0; x < orig_block[0].length; x++) {
                new_block.push([]);
                for (let y = 0; y < orig_block.length; y++)
                    new_block[x].push(orig_block[orig_block.length - y - 1][x]);
            }
            for (let y = 0; y < new_block.length; y++)
                for (let x = 0; x < new_block[y].length; x++)
                    if (new_block[y][x] && map[y + this.y][x + this.x])
                        return;
            this.Block = new_block;
        }
    }
    bottom() {
        for (let y = 0; y < Gui.screen.y; y++) {
            if (this.touch(y + 1, 0)) {
                this.y += y;
                this.down();
                M_bottom.currentTime = 0;
                M_bottom.play();
                return;
            }
        }
    }
    border(y1 = 0) {
        let block = this.Block;
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 3;
        for (let y = 0; y < block.length; y++) {
            for (let x = 0; x < block[y].length; x++) {
                if (block[y][x]) {
                    let color = Getdraw[block[y][x]];
                    ctx.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},.4)`;
                    ctx.rect((x + this.x) * Gui.span, (y + this.y + y1) * Gui.span, Gui.span, Gui.span);
                    ctx.fillRect((x + this.x) * Gui.span, (y + this.y + y1) * Gui.span, Gui.span, Gui.span);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
        ctx.closePath();
    }
    lose() {
        draw_player = false;
        if (start) play_bt.click();
        draw_all = true;
        Gui.draw();
        Buttons.forEach(e => e.draw());
        let px = [];
        let span = Gui.span;
        map.forEach((arr, y) => {
            arr.forEach((val, x) => {
                if (val % 8 === 0) return;
                let square = ctx.getImageData(span * x, span * y, span, span).data
                let scale = 12
                for (let i = 0; i < square.length; i += scale) {
                    px.push(new Pixel({
                        x: span * x + Math.floor(i / 4) % span,
                        y: span * y + Math.floor(i / span / 4),
                        color: `rgb(${square[i]},${square[i + 1]},${square[i + 2]})`,
                        path: [1, -1][rand(0, 1)],
                        scale: scale / 4
                    }))
                }
            })
        })
        px.forEach(e => e.draw());
        function move() {
            for (let i = 0; i < 1000; i++) {
                if (px.length === 0) break;
                let Rand = rand(0, px.length - 1);
                if (px[Rand].move()) px.splice(Rand, 1);
            }
            if (px.length) requestAnimationFrame(move)
            else {
                init();
                if (start) play_bt.click();
                draw_all = false;
            }
        }
        requestAnimationFrame(move)
    }
    set() {
        if (this.tmpset) return;
        else if (this.tmp_blockind === undefined) {
            this.tmp_blockind = this.Blockind;
            this.Getblock();
            this.tmpset = 1;
            M_move.play();
        }
        else {
            this.Block = Block[this.tmp_blockind];
            this.Blockind = [this.tmp_blockind, this.tmp_blockind = this.Blockind][0];
            this.x = Math.floor(Gui.screen.x / 2) - 1 - (this.Blockind === 6);
            this.y = 1;
            this.tmpset = 1;
            M_move.play();
        }
    }
}
class Button {
    constructor(args) {
        let def = {
            font: '40px Arial',
            textAlign: 'center',
            textBaseline: 'middle',
            color: 'rgb(222,222,222)',
            bgcolor: 'rgba(0,0,0,0)',
            x: Gui.screen.x * Gui.span,
            y: 0,
            onhover: false,
            hover: {
                font: '40px Arial',
                textAlign: 'center',
                textBaseline: 'middle',
                color: 'rgb(222,222,222)',
                bgcolor: 'rgba(0,0,0,0)'
            }
        }
        Object.assign(def, SA(args));
        Object.assign(def.hover, Dele(SA(def), ['x', 'y', 'onhover', 'hover', 'w', 'h', 'name']));
        Object.assign(def.hover, args.hover);
        Object.assign(this, def);
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.onhover) {
            canvas.style.cursor = 'pointer';
            ctx.fillStyle = this.hover.bgcolor;
            decoration(0, 0, this.hover.bgcolor.split(/[()]/)[1].split(',').map(e => { return parseInt(e) }), this.w, this.h);
            ctx.font = this.hover.font;
            ctx.textAlign = this.hover.textAlign;
            ctx.fillStyle = this.hover.color;
            ctx.textBaseline = this.hover.textBaseline;
        }
        else {
            canvas.style.cursor = '';
            ctx.fillStyle = this.bgcolor;
            decoration(0, 0, this.bgcolor.split(/[()]/)[1].split(',').map(e => { return parseInt(e) }), this.w, this.h);
            ctx.font = this.font;
            ctx.textAlign = this.textAlign;
            ctx.fillStyle = this.color;
            ctx.textBaseline = this.textBaseline;
        }
        ctx.fillText(this.name, Gui.span * this.w / 2, Gui.span * this.h / 2 + 2);

        ctx.restore();
    }
    click() { }
}
class GUI {
    constructor(args) {
        let def = {
            x: 5,
            y: 22,
            score: 0,
            sqrt: Math.ceil(20),
            bc: [0, 254, 254],
            span: 40,
            screen: { x: 12, y: 22 }
        }
        Object.assign(def, args);
        Object.assign(this, def);
    }
    init() {
        this.score = 0;
    }
    draw() {
        // 遊玩畫面(左)
        ctx.fillStyle = 'gray';
        ctx.fillRect(0, 0, ww, wh);
        for (let y = 0; y < this.screen.y; y++) { // 畫方塊
            for (let x = 0; x < this.screen.x; x++) {
                let color = Getdraw[map[y][x]];
                if (map[y][x]) decoration(y, x, color);
                else {
                    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                    ctx.fillRect(x * this.span, y * this.span, this.span, this.span);
                }
            }
        }
        // 遊玩介面(右)
        ctx.save();
        ctx.translate(this.screen.x * this.span, 0);
        for (let y = 0; y < this.y; y++)
            for (let x = 0; x < this.x; x++)
                decoration(y, x, Getdraw[8]);
        let block = Block[player.N_blockind];
        for (let y = 0; y < 2; y++) {
            if (block[y] === undefined) block[y] = [];
            for (let x = 0; x < 4; x++) {
                if (block[y][x] !== undefined && block[y][x]) decoration(y + 1, x, Getdraw[block[y][x]]);
                else {
                    ctx.clearRect(x * this.span, (y + 1) * this.span, this.span, this.span);
                    decoration(y + 1, x, [50, 50, 50, .08]);
                }
            }
        }
        this.tmp();
        this.show_score();
        ctx.restore();
    }
    tmp() {
        let block = Block[player.tmp_blockind];
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 4; x++) {
                ctx.save();
                ctx.translate(x * this.span, (y + 19) * this.span);
                if (block !== undefined && block[y][x]) decoration(0, 0, Getdraw[block[y][x]]);
                else {
                    ctx.clearRect(0, 0, this.span, this.span);
                    decoration(0, 0, [50, 50, 50, .08])
                }
                ctx.restore();
            }
        }
    }
    show_score() {
        ctx.save();
        // 區塊
        ctx.translate(0, this.span * 5);
        ctx.fillStyle = 'rgb(96, 226, 225)';
        ctx.shadowColor = 'rgb(96, 236, 255)';
        ctx.shadowBlur = 20;
        ctx.fillRect(0, 0, this.span * 4, this.span * 2);
        // 文字
        ctx.font = '34px Arial';
        ctx.fillStyle = 'rgb(0, 50, 255)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('分:' + this.score.toString().padStart(6, '0'), this.span * 4, this.span + 5);
        ctx.restore();
    }
}
let Block = [
    [[0, 1, 0], [1, 1, 1]],
    [[2, 2], [2, 2]],
    [[0, 0, 3], [3, 3, 3]],
    [[4, 4, 0], [0, 4, 4]],
    [[0, 5, 5], [5, 5, 0]],
    [[6, 0, 0], [6, 6, 6]],
    [[7, 7, 7, 7]]
];
let player;
let map = [];
let Gui = new GUI();
let start = false;
let draw_all = false;
let draw_player = false;
let Getdraw = [[64, 64, 64], [145, 0, 188], [236, 208, 50], [255, 165, 0], [205, 92, 92], [140, 190, 0], [0, 85, 254], [30, 220, 220], [160, 160, 160]];
let ww = (Gui.screen.x + Gui.x) * Gui.span;
let wh = Gui.screen.y * Gui.span;
canvas.width = ww;
canvas.height = wh;
let now;
let movetime;
let line = [];
let startime = 0;
let move = { x: 0, y: 0 };
// ================Button==================
let Buttons = [];
let play_bt = new Button({
    name: 'Start',
    w: 4,
    h: 2,
    y: 9 * Gui.span,
    color: 'rgb(222,222,222)',
    bgcolor: 'rgb(55,154,255)',
    hover: {
        bgcolor: 'rgb(0, 102, 205)',
        color: 'rgb(200,200,200)'
    }
});
play_bt.click = function () {
    start = !start;
    this.name = (start) ? 'Pause' : 'Start';
    if (start) {
        M_bgm.play();
        if (!draw_player) {
            draw_player = true;
            now = +new Date();
        }
    }
    else M_bgm.pause();
}
Buttons.push(play_bt);
// ================Music===================
let M_bgm = document.createElement('audio');
M_bgm.src = 'music/bgm.mp3';
M_bgm.loop = true;
let M_move = document.createElement('audio');
M_move.src = 'music/move.wav';
M_move.volume = 0.05;
let M_bottom = document.createElement('audio');
M_bottom.src = 'music/bottom.wav';
M_bottom.volume = 0.2;
let M_dele = new Audio('music/dele.wav');
// ========================================

function init() { // 初始化
    draw_player = false;
    startime = 0;
    M_bgm.currentTime = 0;
    for (let y = 0; y < Gui.screen.y; y++) {
        map[y] = [];
        for (let x = 0; x < Gui.screen.x; x++) {
            if (y && y + 1 != Gui.screen.y && x && x + 1 != Gui.screen.x) map[y][x] = 0;
            else map[y][x] = 8;
        }
    }
    now = +new Date();
    movetime = +new Date();
    player = new Player();
    Gui.init();
    line = map[1].slice();
}

let keydown = 1;
window.addEventListener('keydown', e => {
    if (!start) return;
    let t = e.key;
    if (t === ' ') player.bottom();
    else if (t === 'Shift') player.set();
    move = {
        y: (['w', 'ArrowUp', 'W'].includes(t)) ? -1 : (['s', 'ArrowDown', 'S'].includes(t)) ? 1 : 0,
        x: (['a', 'ArrowLeft', 'A'].includes(t)) ? -1 : (['d', 'ArrowRight', 'D'].includes(t)) ? 1 : 0
    }
    if (keydown) {
        player.move();
        movetime += 100;
    }
    keydown = 0;
})
window.addEventListener('keyup', e => {
    let t = e.key;
    move = {
        y: (['w', 'ArrowUp', 'W', 's', 'ArrowDown', 'S'].includes(t)) ? 0 : move.y,
        x: (['a', 'ArrowLeft', 'A', 'd', 'ArrowRight', 'D'].includes(t)) ? 0 : move.x
    }
    keydown = 1;
})
canvas.addEventListener('mousemove', mouse => {
    let pos = { y: mouse.offsetY, x: mouse.offsetX };
    Buttons.forEach(e => {
        if (pos.y >= e.y && pos.x > e.x && pos.y <= e.y + e.h * Gui.span && pos.x <= e.x + e.w * Gui.span) e.onhover = true;
        else e.onhover = false;
    });
});
canvas.addEventListener('click', mouse => {
    let pos = { y: mouse.offsetY, x: mouse.offsetX };
    Buttons.forEach(e => {
        if (pos.y >= e.y && pos.x > e.x && pos.y <= e.y + e.h * Gui.span && pos.x <= e.x + e.w * Gui.span) e.click();
    });
});
function draw() {
    if (draw_all) { requestAnimationFrame(draw); return };
    Gui.draw();
    player.draw();
    Buttons.forEach(e => e.draw());
    if (!start) { requestAnimationFrame(draw); return };
    let now_time = +new Date();
    if (now_time - movetime >= 60) { // 移動更新
        player.move();
        movetime = +new Date();
    }
    if (now_time - now >= speed - Math.min(900, 6.5 * startime)) { // 更新
        player.down();
        now = +new Date();
    }
    requestAnimationFrame(draw);
}
function Dele(Obj, Arr) {
    Arr.forEach(e => delete Obj[e]);
    return Obj;
}
function SA(i) { return JSON.parse(JSON.stringify(i)) };
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }; // 隨機整數，含最大值、最小值 
let light = [190, -140, -220, 100]; // 亮度變化
function decoration(y = 0, x = 0, color, w = 1, h = 1, sq = undefined) {
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${(color[3] === undefined) ? 1 : color[3]})`;
    let span = Gui.span;
    let sqrt = (sq === undefined) ? 8 : sq; // 陰影大小
    ctx.fillRect(x * span, y * span, span * w, span * h);
    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.beginPath();

        ctx.translate(span * x + ((i && i < 3) ? span * w : 0), y * span + ((i >= 2) ? span * h : 0));
        ctx.rotate(Math.PI / 2 * i);
        ctx.moveTo(0, 0);
        ctx.lineTo(sqrt, sqrt);
        ctx.lineTo(span * ((i % 2) ? h : w) - sqrt, sqrt);
        ctx.lineTo(span * ((i % 2) ? h : w), 0);
        ctx.fillStyle = (light[i] <= 0) ? `rgba(${color[0] + color[0] / 255 * light[i]},${color[1] + color[1] / 255 * light[i]},${color[2] + color[2] / 255 * light[i]},${(color[3] === undefined) ? 1 : color[3]})` : `rgba(${color[0] + (255 - color[0]) / 255 * light[i]},${color[1] + (255 - color[1]) / 255 * light[i]},${color[2] + (255 - color[2]) / 255 * light[i]},${(color[3] === undefined) ? 1 : color[3]})`; // 亮度變化
        ctx.fill();

        ctx.closePath();
        ctx.restore();
    }
}

let speed = 1000; // 掉落毫秒數
setInterval(e => { if (!start) return; startime++; }, 1000);
init();
requestAnimationFrame(draw);