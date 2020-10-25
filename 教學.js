'use strict';
/** @type {HTMLCanvasElement} */ // 宣告作業環境
class Round {
    constructor(drg){
        let def = {
            age: 10,
        }
        Object.assign(def,drg);
        Object.assign(this,def);
    }
    draw(){

    }
}
let round = new Round({name:"kiki"});

const canvas = document.getElementById('canvas'); // 取得畫布
const ctx = canvas.getContext('2d'); // 宣告2D畫布
round.draw();
