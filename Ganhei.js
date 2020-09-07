var Ganhei = Entity.extend(function () {

	// neste exemplo as plataformas n�o t�mc componente visual, pois vem da tilesheet
	this.constructor = function (x, y, w, h) {
		this.super();
		this.x = x; //posX inicial
		this.y = y; // posY inicial
		this.width = w; //largura inicial
		this.height = h; // altura inicial
	};

	this.update = function () {
	};

	// como n�o tem componente visual, sobreescrevemos o m�todo render para evitar poss�veis chamadas indevidas
	this.render = function () {
		
	};


});
