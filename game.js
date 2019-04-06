'use strict';

class Vector {
    constructor(x, y) {
        if (x == undefined && y == undefined) {
            x = 0;
            y = 0;
        }
        this.x = x;
        this.y = y;
    };
    plus(obj) {
        if (!(obj instanceof Vector)) {
            throw new SyntaxError('Можно прибавлять к вектору только вектор типа Vector');
        } else {
            return new Vector(this.x + obj.x, this.y + obj.y);
        };
    };
    times(multi) {
        return new Vector(this.x * multi, this.y * multi);
    };
}

class Actor {
    constructor(objPleace, objSize, objVelocity) {

        function checkToVector(obj) {
            return obj instanceof Vector ? true : false;
        };

        if (objPleace == undefined && objSize == undefined && objVelocity == undefined) {
            this.pos = new Vector(0, 0);
            this.size =  new Vector(1, 1);
            this.speed = new Vector (0, 0);
        } else if ((!checkToVector(objPleace) && objPleace != undefined) ||
        (!checkToVector(objSize) && objSize != undefined) || 
        (!checkToVector(objVelocity) && objVelocity != undefined)) {
            throw new SyntaxError('Требуется объект типа Vector');
        };

        objPleace != undefined ? this.pos = objPleace : this.pos = new Vector(0, 0);
        objSize != undefined ? this.size = objSize : this.size = new Vector(1, 1);
        objVelocity != undefined ? this.speed = objVelocity : this.speed = new Vector(0, 0);
    };

    get left() {
        return this.pos.x;
    };
    get top() {
        return this.pos.y;
    };
    get right() {
        return this.pos.x + this.size.x;
    };
    get bottom() {
        return this.pos.y + this.size.y;
    };
    get type() {
        return 'actor';
    };

    act() {
    };

    isIntersect(objMove) {
        if (!(objMove instanceof Actor)) {
            throw new SyntaxError('Требуется объект типа Actor');
        } else if (objMove === this) {
            return false;
        };
        // Игнорирование объектов с отрицательными размерами.
        if ((objMove.size.x < 0 || objMove.size.y < 0) &&
        ((objMove.left == this.left && objMove.bottom == this.bottom) || (objMove.right == this.right && objMove.top == this.top) ||
        (objMove.left == this.left && objMove.top == this.top) || (objMove.bottom == this.bottom && objMove.right == this.right))) {
            return false;
        };
        if ((this.size.x < 0 || this.size.y < 0) &&
        ((objMove.left == this.left && objMove.bottom == this.bottom) || (objMove.right == this.right && objMove.top == this.top) ||
        (objMove.left == this.left && objMove.top == this.top) || (objMove.bottom == this.bottom && objMove.right == this.right))) {
            return false;
        };
        // Расчет длины диагонали объектов.
        let diagStatObj = Math.pow(this.size.x, 2) + Math.pow(this.size.y, 2);
        let diagMoveObj = Math.pow(objMove.size.x, 2) + Math.pow(objMove.size.y, 2);
        // Объекты одинаковы по размеру и расположены один над другим.
        if ((diagStatObj == diagMoveObj) && (this.left == objMove.left)) {
            return true;
        };
        // Статичный больше подвижного и подвижный находится в нем.
        if ((diagStatObj > diagMoveObj) && (objMove.left > this.left && objMove.right < this.right)) {
            return true;
        };
        // Случаи частичного пересечения объектов.
        if (((objMove.bottom >= this.bottom && objMove.bottom < this.top) && (objMove.left >= this.left && objMove.left < this.right)) ||
        ((objMove.bottom >= this.bottom && objMove.bottom < this.top) && (objMove.right <= this.right && objMove.right > this.left)) ||
        ((objMove.top <= this.top && objMove.top > this.bottom) && (objMove.left >= this.left && objMove.left < this.right)) ||
        ((objMove.top <= this.top && objMove.top > this.bottom) && (objMove.right <= this.right && objMove.right > this.left)) ||
        ((objMove.left >= this.left && objMove.left < this.right) && (objMove.top == this.top && objMove.bottom == this.bottom)) ||
        ((objMove.right > this.left && objMove.right <= this.right) && (objMove.top == this.top && objMove.bottom == this.bottom))) {
            return true;
        };
        return false;
    };
}

class Level {
    constructor(grid, listActorsObj) {
        this.grid = grid;
        this.actors = listActorsObj;
        this.status = null;
        this.finishDelay = 1;

        if (listActorsObj != undefined) {
            listActorsObj.forEach(i => {
                if (i.type == 'player') {
                    this.player = i;
                }
            });
        };

         // Получаем параметры высоты и ширины игрового поля.
        if (grid != undefined && grid.length != 0) {
            this.height = grid.length;   
            this.width = 0;
            for (let i of grid) {
                if (i != undefined && i.length > this.width) {
                    this.width = i.length;
                };
            };
        } else {
            this.height = 0;
            this.width = 0;
        };
    }

    isFinished() {
        if (this.status != null && this.finishDelay < 0) {
            return true;
        } else {
            return false;
        };
    };

    actorAt(objMove) {
        if (this.actors == undefined) {
            return undefined;
        };
        let result = undefined;
        if (objMove == undefined || !(objMove instanceof Actor)) {
            throw new SyntaxError('Требуется объект типа Actor');
        } else {
            this.actors.forEach(i => {
            if (i.isIntersect(objMove)) {
                result = i;
            };
        });
        return result;
    };
    };

    obstacleAt(pos, objSize) {
        if (!(pos instanceof Vector) || !(objSize instanceof Vector)) {
            throw new SyntaxError('Требуется объект типа Vector');
        } else {
            let distObj = pos.plus(objSize);
            // Проверка выхода за боковые границы поля
            if ((distObj.x < 1 && distObj.y >=1 && distObj.y <= this.height) ||
            (distObj.x > this.width && distObj.y >=1 && distObj.y <= this.height)) {
                return 'wall';
            };
            // Проверка выхода за нижнюю границу
            if (distObj.y > this.height) {
                return 'lava';
            };
            // Проверка выхода за верхнюю границу
            if (distObj.y < 1) {
                return 'wall';
            };
            // Проверка пересечений стен и лав:
            for (let x = Math.ceil(pos.x); x <= distObj.x; x++) {
                for (let y = Math.ceil(pos.y); y <= distObj.y; y++) {
                    if (this.grid[x][y] == 'lava') {
                        return 'lava';
                    };
                    if (this.grid[x][y] == 'wall') {
                        return 'wall';
                    };
                };
            };
        };
    };

    removeActor(obj) {
        delete this.actors[this.actors.indexOf(obj)];
    };

    noMoreActors(typeObj) {
        let flagTypeObj = false;
        if (this.actors != undefined) {
            for (let i of this.actors) {
                if (i.type == typeObj) {
                    flagTypeObj = true;
                };
            };
        };
        if (!flagTypeObj) {
            return true;
        } else {
            return false;
        };
    };

    playerTouched(typeObj, obj) {
        if (this.status == null) {
            if (typeObj == 'lava' || typeObj == 'fireball') {
                this.status = 'lost';
            };
            if (obj != undefined && typeObj == 'coin' && obj.type == typeObj) {
                let delCoin = this.actors.indexOf(obj);
                if (delCoin >= 0) {
                    this.actors.splice(delCoin, 1);
                    delCoin = this.actors.indexOf(obj);
                    if (delCoin === -1) {
                        this.status = 'won';
                    };
                };
            };
        };
    };

}