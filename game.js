'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            return;
        }
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new TypeError("ошибка");
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    times(n) {
        const x = this.x * n;
        const y = this.y * n;
        return new Vector({
            x: x,
            y: y
        });
    }
}

class Actor {
    constructor(pos, size, speed) {
        if (pos instanceof Vector) {
            this.pos = pos;
        } else if (pos === undefined) {
            this.pos = new Vector();
        } else {
            throw new TypeError("Ошибка в Actor pos");
        }

        if (size instanceof Vector) {
            this.size = size;
        } else if (size === undefined) {
            this.size = new Vector({
                x: 1,
                y: 1
            });
        } else {
            throw new TypeError("Ошибка в Actor size");
        }

        if (speed instanceof Vector) {
            this.speed = pos;
        } else if (speed === undefined) {
            this.speed = new Vector();
        } else {
            throw new TypeError("Ошибка в Actor speed");
        }
        // if(pos instanceof Vector) {
        //     this.size = size;
        // } else {
        //     this.size = new Vector(size);
        // }

        // this.speed = new Vector(speed);
    }

    get type() {
        return "actor";
    }

    act() {

    }

    get left() {
        return this.pos.x
    }
    get right() {
        return this.pos.x + this.size.x
    }
    get top() {
        return this.pos.y
    }
    get bottom() {
        return this.pos.y + this.size.y
    }

    isIntersect(actor) {
        if (!(actor instanceof Actor)) {
            throw new Error;
        }
        if (actor === this) return false;

        if (this.pos.x < actor.pos.x + actor.size.x &&
            this.pos.x + this.size.x > actor.pos.x &&
            this.pos.y < actor.pos.y + actor.size.y &&
            this.pos.y + this.size.y > actor.pos.y) {
            // collision detected!
            return true;
        }
        
        return false;
       }
}