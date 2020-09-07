var Fireball = Entity.extend(function () {
    this.exploding = false;
    var damageLevel = 50;
    var vFrame=0;
    this.states = {
        Fireball: 'Fireball',
        Explodir: 'Explodir'
    };

    this.constructor = function (spriteSheet, x, y, damageLevel) {
        this.super();
        this.spriteSheet = spriteSheet; // spriteSheet
        this.x = x; //posX inicial
        this.y = y; // posY inicial
        this.currentState = this.states.Fireball; //estado inicial
        this.currentFrame = 0; //frame inicial
        this.vx = 5;
        this.vy = 0;
        this.damageLevel = damageLevel;

        setup();

    };

    this.update = function () {
        if (!this.active)
            return;

        this.x -= this.vx;
        this.vx -= this.vx > 0 ? 0.005 : 0;

        this.y -= this.vy;

        // passar à proxima frame e voltar a zero se chegar ao fim do array; Método mais eficiente pois utiliza só operações
        // aritméticas e não recorre a condições
        vFrame = vFrame < this.frames.length - 1 ? vFrame + 0.7 : 0;
        this.currentFrame = Math.floor(vFrame);


        this.width = Math.floor(this.frames[this.currentFrame].width * this.scaleFactor);
        this.height = Math.floor(this.frames[this.currentFrame].height * this.scaleFactor);

    };

    this.getSprite = function () {
        return this.frames[this.currentFrame];

    };

    var setup = function () {
        this.eStates[this.states.Fireball] = this.spriteSheet.getStats('Fireball');
        this.eStates[this.states.Explodir] = this.spriteSheet.getStats('Explodir');
        this.frames = this.eStates[this.currentState];
        this.width = this.frames[0].width;
        this.height = this.frames[0].height;
    }
        .bind(this);


    this.explodir = function () {
        if (!this.active)
            return;
        toogleState(this.states.Explodir);
        this.vx = 0;
        this.vy = 0;
        this.exploding = true;
    };

    var toogleState = function (theState) {
        if (this.currState != theState) {
            this.currState = theState;
            this.frames = this.eStates[theState];
            this.currentFrame = 0;
        }
    }
        .bind(this);

});
