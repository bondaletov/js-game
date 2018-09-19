'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new TypeError('ошибка');
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    times(n) {
        const x = this.x * n;
        const y = this.y * n;
        return new Vector(x, y);
    }
}

class Actor {
    constructor(pos, size, speed) {
        if (pos instanceof Vector) {
            this.pos = pos;
        } else if (pos === undefined) {
            this.pos = new Vector();
        } else {
            throw new TypeError('Ошибка в Actor pos');
        }

        if (size instanceof Vector) {
            this.size = size;
        } else if (size === undefined) {
            this.size = new Vector(1, 1);
        } else {
            throw new TypeError('Ошибка в Actor size');
        }

        if (speed instanceof Vector) {
            this.speed = speed;
        } else if (speed === undefined) {
            this.speed = new Vector();
        } else {
            throw new TypeError('Ошибка в Actor speed');
        }
    }

    get type() {
        return 'actor';
    }

    act() {  }

    get left() {
        return this.pos.x;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
    get top() {
        return this.pos.y;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }

    isIntersect(actor) {
        if (!(actor instanceof Actor)) {
            throw new Error;
        }
        if (actor === this) return false;

        return this.pos.x < actor.pos.x + actor.size.x &&
        this.pos.x + this.size.x > actor.pos.x &&
        this.pos.y < actor.pos.y + actor.size.y &&
        this.pos.y + this.size.y > actor.pos.y;
    }
}

class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.status = null;
        this.finishDelay = 1;
        this.actors = actors;

        this.player = this.actors.find(function (actor) {
            return actor.type === 'player';
        });
    }

    get height() {
        return this.grid.length;
    }

    get width() {
        return typeof this._widthCache !== 'undefined' ? 
        this._widthCache :
        this._widthCache = (this.grid).reduce((maxWidth, row) => row.length > maxWidth ? maxWidth = row.length : maxWidth, 0);
    }

    set width(v) {
        this.width = v;
    }

    isFinished() {
        if (this.status && this.finishDelay < 0) return true;
        return false;
    }

    actorAt(actor) {
        if (!(actor instanceof Actor)) throw new Error;
        if (this.actors === undefined) return undefined;

        return (this.actors).find(el => { 
            if(el instanceof Actor) {
                return actor.isIntersect(el) === true
            }
            return;
        });
    }

    obstacleAt(position, size) {
        if ((false === position instanceof Vector) || (false === size instanceof Vector)) throw new Error;
        
        const leftBorder = Math.floor(position.x);
        const rightBorder = Math.ceil(position.x + size.x);
        const topBorder = Math.floor(position.y);
        const bottomBorder = Math.ceil(position.y + size.y);

        if (leftBorder < 0 || rightBorder > this.width || topBorder < 0) {
            return 'wall';
        } else if (bottomBorder > this.height) {
            return 'lava';
        }

        for (let y = topBorder; y < bottomBorder; y++) {
            for (let x = leftBorder; x < rightBorder; x++) {
                if (this.grid[y][x]) {
                    return this.grid[y][x];
                }
            }
        }
    }

    removeActor(actor) {
        const actorId = (this.actors).indexOf(actor);
        (this.actors).splice(actorId, 1);
    }

    noMoreActors(typeString) {
        if (this.actors === undefined) return true;

        return (!(this.actors).some(function (el) {
            return el.type === typeString;
         }));
    }

    playerTouched(barrierStr, actor) {
        if (barrierStr === 'lava' || barrierStr === 'fireball') this.status = 'lost';

        if (barrierStr === 'coin' && actor.type === 'coin') {
            this.removeActor(actor);
            if (this.noMoreActors('coin')) this.status = 'won';
        }
    }
}

class LevelParser {
    constructor(dictionaryActors) {
        this.dictionaryActors = dictionaryActors;
        this.dictionaryObstacles = {
            'x': 'wall',
            '!': 'lava'
        }
    }

    actorFromSymbol(actorStr) {
        if (actorStr === undefined || this.dictionaryActors === undefined) return undefined;
        return this.dictionaryActors[actorStr];
    }

    obstacleFromSymbol(obstacleStr) {
        if (this.dictionaryObstacles.hasOwnProperty(obstacleStr)) {
            return this.dictionaryObstacles[obstacleStr];
        }
    }

    createGrid(plan) {
        if (plan.length === 0) return [];
        let grid = [];

        for (let lines of plan) {
            let result = [];
            [...lines].forEach((symbol) => result.push(this.obstacleFromSymbol(symbol)));
            grid.push(result);
        }

        return grid;
    }

    createActors(actorsKeys) {
        if (!Array.isArray(actorsKeys)) {
            return;
        }

        let actors = [];
        actorsKeys.forEach((itemY, y) => {
            [...itemY].forEach((itemX, x) => {
                let Constructor = this.actorFromSymbol(itemX);
                let result;
                if (typeof Constructor === 'function') {
                    result = new Constructor(new Vector(x, y));
                }
                if (result instanceof Actor) {
                    actors.push(result);
                }
            });
        });

        return actors;
    }
 
    parse(plan) {
        let grid = this.createGrid(plan);
        let actors = this.createActors(plan);

        return new Level(grid, actors);
    }
}

class Fireball extends Actor {
    constructor(pos, speed) {
        super(pos, undefined, speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed.x = -this.speed.x;
        this.speed.y = -this.speed.y;
    }

    act(time, level) {
        let nextPosition = this.getNextPosition(time);
        const obstacle = level.obstacleAt(nextPosition, this.size);

        if (obstacle !== undefined) {
            this.handleObstacle();
        } else {
            this.pos = nextPosition;
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos) {
        const speed = new Vector(2, 0);
        super(pos, speed);
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
    }
}
class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.startPos = pos;
    }

    handleObstacle() {
        this.pos = this.startPos;
    }
}

class Coin extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.6, 0.6));
        this.pos = this.pos.plus(new Vector(0.2, 0.1));
        this.startPos = Object.assign(this.pos);
        this.spring = Math.random() * (Math.PI * 2);
        this.springDist = 0.07;
        this.springSpeed = 8;
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        const y = Math.sin(this.spring) * this.springDist;
        return new Vector(0, y);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        return this.startPos.plus(this.getSpringVector());
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(pos) {
        super(pos, new Vector(0.8, 1.5));
        this.pos = this.pos.plus(new Vector(0, -0.5));
    }

    get type() {
        return 'player';
    }
}

const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
};

const parser = new LevelParser(actorDict);

loadLevels()
    .then((res) => {runGame(JSON.parse(res), parser, DOMDisplay)
    .then(() => alert('Вы выиграли!'))});