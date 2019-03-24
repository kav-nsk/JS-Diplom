'use strict';
class Vector {
    constructor(x, y) {
        if (x == undefined && y == undefined) {
            x = 0;
            y = 0;
        }
        this.x = x;
        this.y = y;
    }
    plus(obj) {
        if (!(obj instanceof Vector)) {
            throw new SyntaxError('Можно прибавлять к вектору только вектор типа Vector');
        } else {
            return new Vector(this.x + obj.x, this.y + obj.y);
        }
    }
    times(multi) {
        return new Vector(this.x * multi, this.y * multi);
    }
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);