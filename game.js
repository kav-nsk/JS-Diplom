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

class Actor {
    constructor(objPleace, objSize, objVelocity) {

        function checkToVector(obj) {
            return obj instanceof Vector ? true : false;
        }

        if (objPleace == undefined && objSize == undefined && objVelocity == undefined) {
            this.pos = new Vector(0, 0);
            this.size =  new Vector(1, 1);
            this.speed = new Vector (0, 0);
        } else if ((!checkToVector(objPleace) && objPleace != undefined) ||
        (!checkToVector(objSize) && objSize != undefined) || 
        (!checkToVector(objVelocity) && objVelocity != undefined)) {
            throw new SyntaxError('Требуется объект типа Vector');
        }
        if (objPleace != undefined) {
            this.pos = objPleace;
        } else {
            this.pos = new Vector(0, 0);
        }
        if (objSize != undefined) {
            this.size = objSize;
        } else {
            this.size = new Vector(1, 1);
        }
        if (objVelocity != undefined) {
            this.speed = objVelocity;
        } else {
            this.speed = new Vector(0, 0);
        }
    }

    get left() {
        return this.pos.x;
    }
    get top() {
        return this.pos.y;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }
    get type() {
        return 'actor';
    }

    act() {
    }
    isIntersect(objMove) {
        if (!(objMove instanceof Actor)) {
            throw new SyntaxError('Требуется объект типа Actor');
        } else if (objMove === this) {
            return false;
        }
        // игнорирование объектов с отрицательными размерами
        if ((objMove.size.x < 0 || objMove.size.y < 0) &&
        ((objMove.left == this.left && objMove.bottom == this.bottom) || (objMove.right == this.right && objMove.top == this.top) ||
        (objMove.left == this.left && objMove.top == this.top) || (objMove.bottom == this.bottom && objMove.right == this.right))) {
            return false;
        }
        if ((this.size.x < 0 || this.size.y < 0) &&
        ((objMove.left == this.left && objMove.bottom == this.bottom) || (objMove.right == this.right && objMove.top == this.top) ||
        (objMove.left == this.left && objMove.top == this.top) || (objMove.bottom == this.bottom && objMove.right == this.right))) {
            return false;
        }
        // расчет длины диагонали объектов
        let diagStatObj = Math.pow(this.size.x, 2) + Math.pow(this.size.y, 2);
        let diagMoveObj = Math.pow(objMove.size.x, 2) + Math.pow(objMove.size.y, 2);
        // объекты одинаковы по размеру и расположены один над другим
        if ((diagStatObj == diagMoveObj) && (this.left == objMove.left)) {
            return true;
        }
        // статичный больше подвижного и подвижный находится в нем
        if ((diagStatObj > diagMoveObj) && (objMove.left > this.left && objMove.right < this.right)) {
            return true;
        }
        // случаи частичного пересечения объектов
        if (((objMove.bottom >= this.bottom && objMove.bottom < this.top) && (objMove.left >= this.left && objMove.left < this.right)) ||
        ((objMove.bottom >= this.bottom && objMove.bottom < this.top) && (objMove.right <= this.right && objMove.right > this.left)) ||
        ((objMove.top <= this.top && objMove.top > this.bottom) && (objMove.left >= this.left && objMove.left < this.right)) ||
        ((objMove.top <= this.top && objMove.top > this.bottom) && (objMove.right <= this.right && objMove.right > this.left)) ||
        ((objMove.left >= this.left && objMove.left < this.right) && (objMove.top == this.top && objMove.bottom == this.bottom)) ||
        ((objMove.right > this.left && objMove.right <= this.right) && (objMove.top == this.top && objMove.bottom == this.bottom))) {
            return true;
        }
        return false;
    }
}
