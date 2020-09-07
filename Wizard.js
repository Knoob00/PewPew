var Wizard = Entity.extend(function () {
    this.currState = undefined; // estado atual;
    var vFrame=0;
    var podeAtacar = true;
    this.states = {
        Dying: 'Dying',
        Hurt: 'Hurt',
        Idle: 'Idle',
        Jump: 'Jump',
        Running: 'Running',
        Slashing: 'Slashing'

    };
    this.gravity=2;
    this.isOnGround=undefined;
    this.jumpForce= -12;
    this.accelerationX= 0;
    this.accelerationY= 0;
    this.speedLimit= 5;
    this.friction= 1;
    this.bounce= -0.7;
    this.vida=100;

    this.constructor = function (spriteSheet, x, y,sounds) {
        this.super();
        this.x = x;
        this.y = y;
        this.spriteSheet = spriteSheet;
        this.currState = this.states.Idle;
        this.currentFrame = 0;
        this.isColliding = false;
        this.sounds = sounds;
        
        setup();
    };

    this.update = function () {

        if (this.currState == this.states.Dying && this.currentFrame == this.frames.length - 1)
            return;

        // passar � proxima frame e voltar a zero se chegar ao fim do array; M�todo mais eficiente pois utiliza s� opera��es
        // aritm�ticas e n�o recorre a condi��es
        vFrame = vFrame < this.frames.length - 1 ? vFrame + 0.5 : 0;
        this.currentFrame = Math.floor(vFrame);


        this.width = this.frames[this.currentFrame].width; //atualizar a altura
        this.height = this.frames[this.currentFrame].height; // atualizar os


        if (this.currState === this.states.Slashing && this.currentFrame == this.frames.length - 1) {
            this.parar();
        }

    };

    this.getSprite = function () {
        return this.frames[this.currentFrame];
    };

    var setup = function () {

        this.eStates['Running'] = this.spriteSheet.getStats('wizard_Running');
        this.eStates['Slashing'] = this.spriteSheet.getStats('wizard_Slashing');
        this.eStates['Idle'] = this.spriteSheet.getStats('wizard_Idle');
        this.eStates['Dying'] = this.spriteSheet.getStats('wizard_Dying');
        this.eStates['Hurt'] = this.spriteSheet.getStats('wizard_Hurt');
        this.eStates['Jump'] = this.spriteSheet.getStats('wizard_Jump');
        this.frames = this.eStates[this.currState];
        this.width = this.frames[this.currentFrame].width; //atualizar a altura
        this.height = this.frames[this.currentFrame].height; // atualizar os

        // atualizar o array de frames atual

    }.bind(this);

    this.andar = function () {
        toogleState(this.states.Running);
    };

    this.parar = function () {
        toogleState(this.states.Idle);
    };

    this.atacar = function () {
        toogleState(this.states.Slashing);

        
    };

    this.destruir = function () { 
            toogleState(this.states.Dying);
            this.killed=true;
            this.sounds.MORTE.play(false,0.2);
    };

    this.saltar = function () {
        toogleState(this.states.Jump);
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