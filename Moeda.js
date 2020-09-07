var Coin = Entity.extend(function () {
    this.currState = undefined; // estado atual;
    var vFrame=0;

    this.states = {
       
        Gold: 'Gold'
    };

    this.constructor = function (spriteSheet, x, y) {
        this.super();
        this.x = x;
        this.y = y;
        this.spriteSheet = spriteSheet;
        this.currState = this.states.Gold;
        this.currentFrame = 0;
        this.flipH=1;
        setup();
    };

    this.update = function () {


        // passar � proxima frame e voltar a zero se chegar ao fim do array; M�todo mais eficiente pois utiliza s� opera��es
        // aritm�ticas e n�o recorre a condi��es
        vFrame = vFrame < this.frames.length - 1 ? vFrame + 0.4 : 0;
        this.currentFrame = Math.floor(vFrame);


        this.width = this.frames[this.currentFrame].width/3; //atualizar a altura
        this.height = this.frames[this.currentFrame].height/3; // atualizar os
        (this.flipH=-1? this.flipH=1 : this.flipH=-1);
        

    };

    this.getSprite = function () {
        return this.frames[this.currentFrame];
    };

    var setup = function () {

        this.eStates['Gold'] = this.spriteSheet.getStats('Gold');
        this.frames = this.eStates[this.currState];
        this.width = this.frames[this.currentFrame].width; //atualizar a altura
        this.height = this.frames[this.currentFrame].height; // atualizar os

        // atualizar o array de frames atual

    }.bind(this);

  

    this.gold = function () {
        toogleState(this.states.Gold);
    };

    var toogleState = function (theState) {
        if (this.killed)
            return;
        if (this.currState != theState) {
            this.currState = theState;
            this.frames = this.eStates[theState];
            this.currentFrame = 0;
        }
    }.bind(this);

});
