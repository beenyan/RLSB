'use strict'; // (嚴格模式)
/** @type {HTMLCanvasElement} */ // 宣告作業環境
const canvas = document.getElementById('canvas'); // 取得畫布
const ctx = canvas.getContext('2d'); // 宣告2D畫布

canvas.width = window.innerWidth; // 設置canvas寬度
canvas.height = window.innerHeight; // 設置canvas高度

// 位於(50,50) 繪製大小50的矩型
// 方法一
ctx.fillStyle = 'red';
ctx.fillRect(50,50,30,30);

// 方法二
ctx.save();
ctx.fillStyle = 'red';
ctx.translate(50,50);
ctx.fillRect(0,0,30,30);
ctx.restore();




