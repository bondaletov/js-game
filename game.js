'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new SyntaxError("ошибка"); // почему тут try-catch не сработал в тестах? функционал такой же
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
}