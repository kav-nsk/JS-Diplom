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

        objPleace != undefined ? this.pos = objPleace : this.pos = new Vector(0, 0);
        objSize != undefined ? this.size = objSize : this.size = new Vector(1, 1);
        objVelocity != undefined ? this.speed = objVelocity : this.speed = new Vector(0, 0);
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
        // Игнорирование объектов с отрицательными размерами.
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
        // Расчет длины диагонали объектов.
        let diagStatObj = Math.pow(this.size.x, 2) + Math.pow(this.size.y, 2);
        let diagMoveObj = Math.pow(objMove.size.x, 2) + Math.pow(objMove.size.y, 2);
        // Объекты одинаковы по размеру и расположены один над другим.
        if ((diagStatObj == diagMoveObj) && (this.left == objMove.left)) {
            return true;
        }
        // Статичный больше подвижного и подвижный находится в нем.
        if ((diagStatObj > diagMoveObj) && (objMove.left > this.left && objMove.right < this.right)) {
            return true;
        }
        // Случаи частичного пересечения объектов.
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
        }

         // Получаем параметры высоты и ширины игрового поля.
        if (grid != undefined && grid.length != 0) {
            this.height = grid.length;   
            this.width = 0;
            for (let i of grid) {
                if (i != undefined && i.length > this.width) {
                    this.width = i.length;
                }
            }
        } else {
            this.height = 0;
            this.width = 0;
        }
    }

    isFinished() {
        if (this.status != null && this.finishDelay < 0) {
            return true;
        } else {
            return false;
        }
    }

    actorAt(objMove) {
        if (this.actors == undefined) {
            return undefined;
        }
        let result = undefined;
        if (objMove == undefined || !(objMove instanceof Actor)) {
            throw new SyntaxError('Требуется объект типа Actor');
        } else {
            this.actors.forEach(i => {
            if (i.isIntersect(objMove)) {
                result = i;
            }
        });
        return result;
    }
    }

    obstacleAt(pos, objSize) {
        if (!(pos instanceof Vector) || !(objSize instanceof Vector)) {
            throw new SyntaxError('Требуется объект типа Vector');
        } else {
            let distObj = pos.plus(objSize);
            // Проверка выхода за боковые границы поля
            if ((distObj.x < 1 && distObj.y >=1 && distObj.y <= this.height) ||
            (distObj.x > this.width && distObj.y >=1 && distObj.y <= this.height)) {
                return 'wall';
            }
            // Проверка выхода за нижнюю границу
            if (distObj.y > this.height) {
                return 'lava';
            }
            // Проверка выхода за верхнюю границу
            if (distObj.y < 1) {
                return 'wall';
            }
            // Проверка пересечений стен и лав:
            for (let x = Math.ceil(pos.x); x <= distObj.x; x++) {
                for (let y = Math.ceil(pos.y); y <= distObj.y; y++) {
                    if (this.grid[x][y] == 'lava') {
                        return 'lava';
                    }
                    if (this.grid[x][y] == 'wall') {
                        return 'wall';
                    }
                }
            }
        }
    }

    removeActor(obj) {
        delete this.actors[this.actors.indexOf(obj)];
    }

    noMoreActors(typeObj) {
        let flagTypeObj = false;
        if (this.actors != undefined) {
            for (let i of this.actors) {
                if (i.type == typeObj) {
                    flagTypeObj = true;
                }
            }
        }
        if (!flagTypeObj) {
            return true;
        } else {
            return false;
        }
    }

    playerTouched(typeObj, obj) {
        if (this.status == null) {
            if (typeObj == 'lava' || typeObj == 'fireball') {
                this.status = 'lost';
            }
            if (obj != undefined && typeObj == 'coin' && obj.type == typeObj) {
                let delCoin = this.actors.indexOf(obj);
                if (delCoin >= 0) {
                    this.actors.splice(delCoin, 1);
                    delCoin = this.actors.indexOf(obj);
                    if (delCoin === -1) {
                        this.status = 'won';
                    }
                }
            }
        }
    }

}

class LevelParser {
    constructor(listObjGameArea) {
        this.listObjGameArea = listObjGameArea;
    }

    actorFromSymbol(symb) {
        if (symb != undefined && symb in this.listObjGameArea) {
            return this.listObjGameArea[symb];
        } else {
            return undefined;
        }
    }

    obstacleFromSymbol(symb) {
        if (symb == 'x') {
            return 'wall';
        }
        if (symb == '!') {
            return 'lava';
        }
        return undefined;
    }

    createGrid(plan) {
        if (plan.length == 0) {
            return [];
        } else {
            let resultList = [];
            for (let i of plan) {
                let newlist = [];
                for (let j = 0; j < i.length; j++) {
                    newlist[j] = this.obstacleFromSymbol(i[j]);
                }
                resultList.push(newlist);
            }
            return resultList;
        }
    }

    createActors(listObj) {
        if (listObj.length == 0 || this.listObjGameArea == undefined) {
            return [];
        } else {
            let listMoveObj = [];
            for (let i = 0; i < listObj.length; i++) {
                for (let j = 0; j < listObj[i].length; j++) {
                    let symb = listObj[i][j];
                    let actor = this.actorFromSymbol(symb);
                    if ((actor != undefined) && (actor instanceof Function) && (actor.prototype.__proto__.constructor.name == 'Actor' ||
                    actor.prototype.constructor.name == 'Actor')) {
                      	let obj = new Object (new actor);
                        obj.pos.x = j;
                        obj.pos.y = i;
                        listMoveObj.push(obj);
                    }
                }
            }
        return listMoveObj;
        }
    }

    parse(plan) {
        let listStaticObj = this.createGrid(plan);
        let listMoveObj = this.createActors(plan);
        let gameArea = new Level(listStaticObj, listMoveObj);
        return gameArea;
    }
}


class Fireball extends Actor{
    constructor(pos, speed) {
        super(pos, undefined, speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(t) {
        let time;
        (t == undefined) ? time = 1 : time = t;
        if (this.speed.x == 0 && this.speed.y == 0) {
            return new Vector(this.pos.x, this.pos.y);
        } else {
            let result = new Vector(this.pos.x, this.pos.y).plus(new Vector(this.speed.x, this.speed.y).times(time));
            return result;
        }
    }

    handleObstacle() {
        this.speed = this.speed.times(-1);
    }

    act(t, gameArea) {
        let nextPos = this.getNextPosition(t);
        (gameArea.obstacleAt(nextPos, this.size) == undefined) ? this.pos = nextPos : this.handleObstacle();
    }
}


class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(2, 0));
    }
}


class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
    }
}


class FireRain  extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.firstPos = pos;
    }

    handleObstacle() {
        if (this.pos != this.firstPos) {
            this.pos = this.firstPos;
        }
        this.speed = this.speed.times(1);
    }

/*  А чем обрабатывать столкновение с объектом?
    act(t, gameArea) {
        let nextPos = this.getNextPosition(t);
        if (gameArea.obstacleAt(nextPos, this.size) == undefined) {
            this.pos = nextPos;
        } else {
            this.pos = this.firstPos;
        };
    };
    */
}


class Coin extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.6, 0.6), );
        this.pos = this.pos.plus(new Vector(0.2, 0.1));
        this.initPos = this.pos;
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.floor(Math.random() * 2 * Math.PI);
    }

    get type() {
        return 'coin';
    }

    updateSpring(t) {
        let time;
        (t == undefined) ? time = 1 : time = t;
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(t) {
        let time;
        (t == undefined) ? time = 1 : time = t;
        this.updateSpring(time);
        let result = new Vector(this.pos.x, this.initPos.plus(this.getSpringVector()).y);
        return result;
    }

    act(t) {
        this.pos = this.getNextPosition(t);
    }
}


class Player extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.8, 1.5), new Vector(0, 0));
        this.pos = this.pos.plus(new Vector(0, -0.5));
    }

    get type() {
        return 'player';
    }
}