var Golem = Entity.extend(function () {
	this.currState = undefined; // estado atual;
	var podeDisparar = false;
	var callback = undefined;
	this.tempoDisparo =0;
	this.flipH=-1;
	var vFrame=0;
	this.states = {
		Dying: 'Dying',
		Throwing: 'Throwing'
	};

	this.constructor = function (spriteSheet, x, y) {
		this.super();
		this.x = x;
		this.y = y;
		this.spriteSheet = spriteSheet;
		this.currState = this.states.Throwing;
		this.currentFrame = 0;
		this.tempoDisparo =0;
		setup();
	};

	this.update = function () {

		if (this.currState == this.states.Dying && this.currentFrame == this.frames.length - 1){
			this.active=false;
			return;
		}
		// passar � proxima frame e voltar a zero se chegar ao fim do array; M�todo mais eficiente pois utiliza s� opera��es
		// aritm�ticas e n�o recorre a condi��es
		vFrame = vFrame < this.frames.length - 1 ? vFrame + 0.5 : 0;
        this.currentFrame = Math.floor(vFrame);

		this.width = this.frames[this.currentFrame].width/3; //atualizar a altura
		this.height = this.frames[this.currentFrame].height/3; // atualizar os


		if (this.currState === this.statesThrowing && this.currentFrame == this.frames.length - 1) {
			this.throw();
		}


	};

	this.getSprite = function () {
		return this.frames[this.currentFrame];
	};

	var setup = function () {
		this.eStates['Throwing'] = this.spriteSheet.getStats('Golem_Throwing');
		this.eStates['Dying'] = this.spriteSheet.getStats('Golem_Dying');
		this.frames = this.eStates[this.currState];
		this.width = this.frames[this.currentFrame].width; //atualizar a altura
		this.height = this.frames[this.currentFrame].height; // atualizar os

		// atualizar o array de frames atual

	}.bind(this);

	if (this.currState === this.statesThrowing && this.currentFrame == this.frames.length >> 1) {
		if (callback != undefined)
			callback();
	}

	// só pode disparar depois de terminar a animação de disparo anterior
	if (this.currState === this.statesThrowing && this.currentFrame == this.frames.length - 1) {

		if (callback != undefined)
			callback();
		podeDisparar = true;
	}

	this.throw = function (criarBala) {
			if (!podeDisparar)
			return;
		toogleState(this.states.Throwing);
		podeDisparar = false;
		callback = criarBala;
	}
	
	this.destruir = function () {
        toogleState(this.states.Dying);
    };

	var toogleState = function (theState) {
		if (this.killed)
			return;
		if (this.currState != theState) {
			this.currState = theState;
			this.frames = this.eStates[theState];
			this.currentFrame = 0;
			vFrame = 0;
			podeDisparar = true;
		}
	}.bind(this);

});
