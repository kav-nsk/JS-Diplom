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
        if (this.size.x < 0 || this.size.y < 0 || objMove.size.x < 0 || objMove.size.y < 0) {
            console.log('negative');
            return false;
        }
        // Один в другом.
        if ((objMove.top >= this.top && objMove.bottom <= this.bottom && objMove.right <= this.right && objMove.left >= this.left) ||
        (this.top >= objMove.top && this.bottom <= objMove.bottom && this.right <= objMove.right && this.left >= objMove.left)) {
            console.log('inTo');
            return true;
        }
        
        // Случаи частичного пересечения объектов.
        if (((objMove.right > this.left && objMove.right <= this.right) && (objMove.bottom >= this.bottom && objMove.bottom < this.top)) ||  // подход переданного объекта слева
        ((objMove.left < this.right && objMove.left >= this.left) && (objMove.bottom >= this.bottom && objMove.bottom < this.top)) ||         // подход переданного справа
        ((objMove.bottom > this.top && objMove.bottom <= this.bottom) && (objMove.right > this.left && objMove.right <= this.right)) ||       // подход objMove сверху
        ((objMove.top < this.bottom && objMove.top >= this.top) && (objMove.right > this.left && objMove.right <= this.right))) {            // подход objMove снизу
            console.log('intersection');
            return true;
        }
        return false;
    }
}

class Level {
    constructor(area, listActorsObj) {
        this.grid = area;
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
        if (area != undefined && area.length != 0) {
            this.height = area.length;   
            this.width = 0;
            for (let i of area) {
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
            // Проверка выхода за боковые и верхнюю границы поля.
            if (pos.x < 0 || distObj.x > this.width || pos.y < 0) {
                return 'wall';
            }
            // Проверка выхода за нижнюю границу.
            if (distObj.y > this.height) {
                return 'lava';
            }
            // Проверка на пересечение с преградами.
            // Обходим массив игрового поля, при нахождении неподвижной перграды, проверяем переданный объект
            // на нахождение внутри границ преграды или ее пересечение.
            for (let yGrid = 0; yGrid < this.height; yGrid++) {
                for (let xGrid = 0; xGrid < this.width; xGrid++) {
                    if (this.grid[yGrid][xGrid] == 'wall' || this.grid[yGrid][xGrid] == 'lava') {
        
                        // Пересечение объекта с не целыми размерами или (и) позицией с преградой.
                        if (((pos.y < yGrid + 1 && pos.y > yGrid) || (distObj.y < yGrid + 1 && distObj.y > yGrid)) &&
                        ((pos.x < xGrid + 1 && pos.x > xGrid) || (distObj.x < xGrid + 1 && distObj.x > xGrid))) {
                            return this.grid[yGrid][xGrid];
                        }
                        // Соприкосновение объекта с разных сторон препятствия или вложение (пересечение) его.
                        if ((xGrid >= pos.x && xGrid + 1 <= distObj.x && yGrid >= pos.y && yGrid + 1 <= distObj.y) || // вложение                                      //вложение
                        (xGrid < distObj.x && xGrid + 1 > pos.x && yGrid <= pos.y && yGrid + 1 >= distObj.y) || // подход объекта слева
                        (xGrid + 1 > pos.x && xGrid < pos.x && yGrid <= pos.y && yGrid + 1 >= distObj.y) ||     // подход объекта справа
                        (yGrid < distObj.y && yGrid + 1 > distObj.y && xGrid <= pos.x && xGrid + 1 >= distObj.x) || // подход сверху к препятствию
                        (yGrid + 1 > pos.y && yGrid < pos.y && xGrid <= pos.x && xGrid + 1 >= distObj.x)) {         // подход снизу
                            return this.grid[yGrid][xGrid];
                        }
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
                    let actorClass = this.actorFromSymbol(symb);
                    if (actorClass != undefined && actorClass instanceof Function) {
                        let newMoveObj = new Object (new actorClass());
                        if (newMoveObj instanceof Actor) {
                            newMoveObj.pos.x = j;
                            newMoveObj.pos.y = i;
                            listMoveObj.push(newMoveObj);
                        }
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
        let xxx = new HorizontalFireball();
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

    act(t, gameLevel) {
        let nextPos = this.getNextPosition(t);
        (gameLevel.obstacleAt(nextPos, this.size) == undefined) ? this.pos = nextPos : this.handleObstacle();
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
        this.firstPos = this.pos;
    }

    handleObstacle() {
        this.pos = this.firstPos;
    }
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


const schemas = [
    ['    v    ',
    '@        ',
    '         ',
    '       oo',
    '      xxx',
    '      |  ',
    'xxx!     ',
    '         '],
    [
    '    v v  ',
    '         ',
    '  v      ',
    '        o',
    '@       x',
    '    x    ',
    'x        ',
    '         '
    ]
];

const actorDict = {
'@': Player,
'v': FireRain,
'o': Coin,
'|': VerticalFireball,
'=': HorizontalFireball
}
const parser = new LevelParser(actorDict);
//const level = parser.parse(schema);
//console.log(level.grid);
//new DOMDisplay(document.body, level); // В readme ошибка, здесь нужно добавить new.
//new DOMDisplay(document.body);
//runLevel(level, DOMDisplay)
//  .then(status => console.log(`Игрок ${status}`));
//runLevel(level, DOMDisplay);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));
