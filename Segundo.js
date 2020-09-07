// desenho de backerounds com o software tiled 
// Autor:Cláudio Barradas 2018
(function jogo() { //não apagar

	var canvas; // representação genérica dos canvas

	var canvases = {
		background: {
			canvas: null,
			ctx: null
		}, // canvas, drawingSurface (contex2d)
		entities: {
			canvas: null,
			ctx: null
		},
		components: {
			canvas: null,
			ctx: null
		}
	};

	var mouse = { x: 0, y: 0 }

	var debug=false;  // Desenha boundaries

	var entities = [];
	var aAgua = [];
	var asPlataformas = [];
	var oFimA = [];
	var asCoins=[];
	var asFireballs = [];
	var osGolems = [];

	var teclas = new Array(255);

	var tileBackground;		// tiled map
	var offscreenBackground; // canvas manipulado em offscreen

	var animationHandler;
	var barraVidaHeroi=undefined;
	var contaMoedas=undefined; //Barra que conta o progresso da coleçao das moedas
	var moedas=0;	//Variavel para contr o numero de moedas colecionadas pelo jogador.
	var nMoedas=0;  // Variavel que contem o numero total de moedas no mapa.


	var umHeroi = undefined;
	var camera = undefined;

	var loadInfo = undefined;
	var assetsLoadInfo = undefined;
	var assetsLoaded = 0;
	var assets = [];

	var GameSounds = {
		HEROI: {},
		GOLEM:{},
		AMBIENTE: {}
	};

	var coracao=true;
	var somAgua=true;
	var somCorrer=true;

	var GameStates = {
		RUNNING: 1,
		PAUSED: 2,
		STOPED: 3,
		LOADING: 4,
		LOADED: 5
	}

	var tx = 0;
	var ty = 0;


	var gameState = undefined;

	window.addEventListener("load", init, false);

	function init() {
		canvases.background.canvas = document.querySelector("#canvasBack");
		canvases.background.ctx = canvases.background.canvas.getContext("2d");

		canvases.entities.canvas = document.querySelector("#canvasEnt");
		canvases.entities.ctx = canvases.entities.canvas.getContext("2d");

		canvases.components.canvas = document.querySelector("#canvasComp");
		canvases.components.ctx = canvases.components.canvas.getContext("2d");
		load();
	}

	function load() {
		loadInfo = document.querySelector("#loadInfo");
		assetsLoadInfo = document.querySelector("#assetLoaded");
		gameState = GameStates.LOADING;

		//PASSO 1- cria-se uma Tiled Map e carrega-se
		tileBackground = new TiledMap();
		tileBackground.load('./data', 'SegundoMapa.json', loaded);
		assets.push(tileBackground);

		var spGolem = new SpriteSheet();
		spGolem.load("assets//golem.png", "assets//golem.json", loaded);
		assets.push(spGolem);

		var spMoeda = new SpriteSheet();
		spMoeda.load("assets//coins.png", "assets//coins.json", loaded);

		var spHeroi = new SpriteSheet();
		spHeroi.load("assets//wizard.png", "assets//wizard.json", loaded);
		assets.push(spHeroi);

		var spFireball = new SpriteSheet();
		spFireball.load("assets//fireball.png", "assets//fireball.json", loaded)
		assets.push(spFireball);

		gSoundManager.loadAsync("sounds/intro.mp3", function (so) {
			GameSounds.AMBIENTE.INTRO = so;
			loaded("intro.mp3");
		});
		assets.push(GameSounds.AMBIENTE.INTRO);

		gSoundManager.loadAsync("sounds/ganhar.wav", function (so) {
			GameSounds.AMBIENTE.GANHAR = so;
			loaded("ganhar.wav");
		});
		assets.push(GameSounds.AMBIENTE.GANHAR);

		gSoundManager.loadAsync("sounds/coin.mp3", function (so) {
			GameSounds.AMBIENTE.COIN = so;
			loaded("coin.mp3");
		});
		assets.push(GameSounds.AMBIENTE.COIN);

		gSoundManager.loadAsync("sounds/background.mp3", function (so) {
			GameSounds.AMBIENTE.BG = so;
			loaded("background.mp3");
		});
		assets.push(GameSounds.AMBIENTE.BG);

		gSoundManager.loadAsync("sounds/50vida.mp3", function (so) {
			GameSounds.AMBIENTE.HBEAT = so;
			loaded("50Vida.mp3");
		});
		assets.push(GameSounds.AMBIENTE.HBEAT);

		gSoundManager.loadAsync("sounds/agua.mp3", function (so) {
			GameSounds.HEROI.AGUA = so;
			loaded("water.mp3");
		});
		assets.push(GameSounds.HEROI.AGUA);

		gSoundManager.loadAsync("sounds/ataque.mp3", function (so) {
			GameSounds.HEROI.ATAQUE = so;
			loaded("ataque.mp3");
		});
		assets.push(GameSounds.HEROI.ATAQUE);

		gSoundManager.loadAsync("sounds/heroiDamage.mp3", function (so) {
			GameSounds.HEROI.DAMAGE = so;
			loaded("heroiDamage.mp3");
		});
		assets.push(GameSounds.HEROI.DAMAGE);

		gSoundManager.loadAsync("sounds/heroiMorte.mp3", function (so) {
			GameSounds.HEROI.MORTE = so;
			loaded("heroiMorte.mp3");
		});
		assets.push(GameSounds.HEROI.MORTE);

		gSoundManager.loadAsync("sounds/correr.mp3", function (so) {
			GameSounds.HEROI.CORRER = so;
			loaded("correr.mp3");
		});
		assets.push(GameSounds.HEROI.CORRER);

		gSoundManager.loadAsync("sounds/saltar.wav", function (so) {
			GameSounds.HEROI.SALTAR = so;
			loaded("saltar.wav");
		});
		assets.push(GameSounds.HEROI.SALTAR);

		gSoundManager.loadAsync("sounds/golemMorte.mp3", function (so) {
			GameSounds.GOLEM.MORTE = so;
			loaded("golemMorte.mp3");
		});
		assets.push(GameSounds.GOLEM.FOGO);


		gSoundManager.loadAsync("sounds/fogo.mp3", function (so) {
			GameSounds.GOLEM.FOGO = so;
			loaded("fogo.mp3");
		});
		assets.push(GameSounds.GOLEM.FOGO);

		gSoundManager.loadAsync("sounds/spell.wav", function (so) {
			GameSounds.GOLEM.SPELL = so;
			loaded("Spell.wav");
		});
		assets.push(GameSounds.GOLEM.SPELL);

	}

	function loaded(assetName) {
		assetsLoaded++;
		assetsLoadInfo.innerHTML = "Loading: " + assetName;

		if (assetsLoaded < assets.length) return;
		assets.splice(0);

		assetsLoadInfo.innerHTML = "Loaded! <br> Left : ← <br> Right : → <br> Jump : ↑ <br> Slash : ↵  <br> Press Space to start"

		gameState = GameStates.LOADED;

		GameSounds.AMBIENTE.INTRO.play(true, 1);
		GameSounds.AMBIENTE.BG.play(true, 0.5);

		window.addEventListener("keypress", setupGame, false); // espera por uma tecla pressionada para
		update();

	}

	function setupGame() {

		window.removeEventListener("keypress", setupGame, false);

		loadInfo.classList.toggle("hidden"); // esconder a informaçao de loading

		// ajustar os canvas ao tamanho da janela
		canvases.background.canvas.width = window.innerWidth;
		canvases.background.canvas.height = window.innerHeight;

		// A COMPLETAR NO FINAL: AJUSTAR O BACKGROUND DO CANVAS PARA #b8dcfe. É NECESSÁRIO PARA ESTE EXEMPLO
		canvases.background.canvas.style.backgroundColor = "#234282";
		canvases.entities.canvas.width = window.innerWidth;
		canvases.entities.canvas.height = window.innerHeight;
		canvases.components.canvas.width = window.innerWidth;
		canvases.components.canvas.height = window.innerHeight;

		//PASSO 2 - Cria-se um elemento canvas para o background. Vai servir para ser desenhado o tile map
		offscreenBackground = document.createElement("canvas");
		offscreenBackground.width = tileBackground.getWidth();
		offscreenBackground.height = tileBackground.getHeight();
		camera = new Camera(0,0,canvases.entities.canvas.width,canvases.entities.canvas.height);
		camera.x=0;

		var canvas = canvases.entities.canvas;
		umHeroi = new Wizard(gSpriteSheets['assets//wizard.png'], 0, (canvas.height*3/4-120+(offscreenBackground.height - window.innerHeight))-90,GameSounds.HEROI);
		entities.push(umHeroi);


		// PASSO 3: desenhar o tiledBackground num canvas em offscreen(não está adicionado no documento HTML)
		tileBackground.draw(offscreenBackground.getContext("2d"));

		// PASSO 3.1 posicionamento:
		tx = 0;
		ty = 0;


		// PASSO 5: Obter as layers de objetos e utilizar consoante seja necessário

		let final = tileBackground.getLayerByName("ganhar").objects; 	// obter info sobre final
		for (let ga of final) {
			let oFim = new Ganhei(ga.x, ga.y, ga.width, ga.height);		// criar entidades sem componente visual
			oFimA.push(oFim);											//adicionar num array.
		}
		let objGolem = tileBackground.getLayerByName("Golem").objects;	// obter info sobre o Golem
		for (let ga of objGolem) {
			let umGolem = new Golem(gSpriteSheets['assets//golem.png'], ga.x, ga.y, ga.width, ga.height,GameSounds.GOLEM); // criar entidade
			umGolem.tempoDisparo =0;
			osGolems.push(umGolem); //adicionar num array.
			entities.push(umGolem);	//adicionar num array.

		}

		let aguas = tileBackground.getLayerByName("agua").objects;		// obter info sobre a agua
		for (let ag of aguas) {
			let umaAgua = new Agua(ag.x, ag.y, ag.width, ag.height);	// criar entidades sem componente visual
			aAgua.push(umaAgua);										//adicionar num array.
		}

		let objCoins = tileBackground.getLayerByName("Moedas").objects; // obter info sobre as moedas
		for (let coins of objCoins) {
			let umaCoin = new Coin(gSpriteSheets['assets//coins.png'],coins.x, coins.y, coins.width, coins.height); // criar entidade
			asCoins.push(umaCoin);										//adicionar num array.
		}
		nMoedas=asCoins.length; //Definir o valor de nMoedas consoante o numero de moedas que existem no mapa no inicio

		// obter info sobre as plataformas;
		let platObjs = tileBackground.getLayerByName("plataforma").objects;		  // obter info sobre as Plataformas
		for (let po of platObjs) {
			let umaPlataforma = new Plataforma(po.x, po.y, po.width, po.height); // criar entidades sem componente visual
			asPlataformas.push(umaPlataforma);									 //adicionar num array.
		}

		barraVidaHeroi = new EnergyBar(20, 6, 180, 23, canvases.components.ctx, 'Health Points', "black", "black", "red"); // Criaçao da componente visual da barra de vida do Heroi
		contaMoedas = new EnergyBar(canvas.width/2-60, 6, 220, 23, canvases.components.ctx, 'Coins', "black", "black", "yellow"); //Criaçao da componente visual do contador de moedas
		contaMoedas.update(0); //Definir o valor do progresso do contador de moedas colecionadas para 0.

		canvases.background.canvas.fadeIn(500);

		gSoundManager.stopAll(); //p�ram-se todos os  sons

		GameSounds.AMBIENTE.BG.play(true, 1);

		gameState = GameStates.RUNNING;

		window.addEventListener("keydown", function (e) { teclas[e.keyCode] = true; }, false);
		window.addEventListener("keyup", function (e) { teclas[e.keyCode] = false; }, false);
		window.addEventListener("keyup", keyUpHandler, false);
		update();

	}

	function checkColisions() {
		var canvas = canvases.entities.canvas;

		if (umHeroi.right() < 0) umHeroi.x = canvas.width;
		if (umHeroi.left() < 0) umHeroi.x = 0;
		if (umHeroi.top() < 0) umHeroi.y = 0;
		if (umHeroi.bottom() < 0) umHeroi.y = canvas.height;

		for(p of asPlataformas) {
			var collisionSide = umHeroi.blockRectangle(p);

			if (collisionSide === "BOTTOM" && umHeroi.vy >= 0) { //Se estiver em cima de uma plataforma
				umHeroi.isOnGround = true;						 //Está no chao
				umHeroi.vy = -umHeroi.gravity;
			} else if (collisionSide === "TOP" && umHeroi.vy <= 0) {
				umHeroi.vy = 0;
			} else if (collisionSide === "RIGHT" && umHeroi.vx >= 0) {
				umHeroi.vx = 0;
			} else if (collisionSide === "LEFT" && umHeroi.vx <= 0) {
				umHeroi.vx = 0;
			}
			if (collisionSide !== "BOTTOM" && umHeroi.vy > 0) { //Se nao estiver em cima de uma plataforma
				umHeroi.isOnGround = false;						// Nao está no chao
			}
		}

		for(a of aAgua){
			if(umHeroi.hitTestRectangle(a)){//Se tocar na agua
				umHeroi.destruir();			//Animaçao de morte
				umHeroi.killed = true;		//Morre
				if(somAgua){
					GameSounds.HEROI.AGUA.play(false,1);
					somAgua=false;
				}

				setTimeout(function(){

					morreu();
				},500);

			}
		}

		for(let m of asCoins){
			if(umHeroi.hitTestRectangle(m)){//Se tocar na moeda
				m.active=false;
				m.killed = true;
				moedas++;
				contaMoedas.update(moedas*100/nMoedas);
				GameSounds.AMBIENTE.COIN.play(false, 1);
			}
		}

		for (b of asFireballs){
			if (umHeroi.hitTestRectangle(b)) {
				b.explodir();
				b.active = false;
				b.killed = true;
				umHeroi.vida -= b.damageLevel;
				barraVidaHeroi.update(umHeroi.vida);
				GameSounds.HEROI.DAMAGE.play(false, 1);
			}
			for (p of asPlataformas) {
				if(b.hitTestRectangle(p)) {
					b.killed = true;
					b.active = false;
					GameSounds.GOLEM.FOGO.play(false, 0.5);
				}
			}
		}

		for(g of osGolems){
			if(umHeroi.hitTestRectangle(g) && umHeroi.currState===("Slashing")){
				g.destruir();
				g.killed= true;
				GameSounds.GOLEM.MORTE.play(false, 1);
			}
			if(umHeroi.hitTestRectangle(g) && umHeroi.currState!==("Slashing")){
				umHeroi.vida -= 0.3;
				barraVidaHeroi.update(umHeroi.vida);
			}
		}
		for(g of oFimA){
			if (umHeroi.hitTestRectangle(g) && moedas == nMoedas){
				ganhar();

				setTimeout(function(){

					window.location="Trabalho.html";
				},1000);
			}  // Se tocar no final , o jogo acaba
		}
	}

	function keyUpHandler(e) {
		var codTecla = e.keyCode;
		teclas[codTecla] = false;
		switch(codTecla){
			case keyboard.ENTER:
				umHeroi.podeAtacar = true;
				GameSounds.HEROI.ATAQUE.play(false,1);
				break;
			case keyboard.RIGHT:
				somCorrer=true;
				break;
			case keyboard.RIGHT:
				somCorrer=true;
				break;
		}
	}

	function update() {
		if(gameState!=GameStates.RUNNING){

		} else{
			if(barraVidaHeroi.energy===0){
				umHeroi.destruir();			//Animaçao de morte
				umHeroi.killed = true;		//Morre
				setTimeout(function(){

					morreu();
				},500);
				setTimeout(function(){

					location.reload();
				},1000);

			}
			if (teclas[keyboard.LEFT] && !teclas[keyboard.RIGHT]) { //Se a tecla da seta esquerda tiver premida e a seta da direita nao estiver

				somCorrer=false;
				umHeroi.flipH=-1  //Vira a parte grafica do boneco ao contrario
				umHeroi.andar();  //Animaçao de andar
				umHeroi.accelerationX = -0.2;
				umHeroi.friction = 1;
			}

			if (teclas[keyboard.RIGHT]&& !teclas[keyboard.LEFT] ){ //Se a tecla da seta esquerda nao tiver premida e a seta da direita estiver

				somCorrer=false;
				umHeroi.flipH=1		//Vira a parte grafica do boneco para a direita
				umHeroi.andar();	//Animaçao de andar
				umHeroi.accelerationX = 0.2;
				umHeroi.friction = 1;
			}

			if (teclas[keyboard.UP] && umHeroi.isOnGround){	//Se a tecla da seta para cima estiver premida e o boneco estiver no chao
				GameSounds.HEROI.SALTAR.play(false,1);
				umHeroi.saltar();	//Animaçao de salto
				umHeroi.vy += umHeroi.jumpForce; //Move o boneco umHeroi.jumpForce para cima
				umHeroi.isOnGround = false;
				umHeroi.friction = 1;

			}
			if (!teclas[keyboard.RIGHT] && !teclas[keyboard.LEFT] && !teclas[keyboard.UP] ){  //Se a seta para cima , para a esquerda e para a direita nao estiverem premidas ,
				umHeroi.parar();  //Animaçao de Idle
				umHeroi.accelerationX = 0;
				umHeroi.friction = 0;
				umHeroi.gravity = 0.3;
			};
			if(teclas[keyboard.ENTER]) {  //Se a tecla Enter for premida
				umHeroi.podeAtacar = false;
				umHeroi.atacar();
			}

			//Apply the acceleration
			umHeroi.vx += umHeroi.accelerationX;
			umHeroi.vy += umHeroi.accelerationY;

			//Apply friction
			if(umHeroi.isOnGround) umHeroi.vx *= umHeroi.friction;

			//Apply gravity
			umHeroi.vy += umHeroi.gravity;

			//Limit the speed
			//Don't limit the upward speed because it will choke the jump effect.
			if (umHeroi.vx > umHeroi.speedLimit) umHeroi.vx = umHeroi.speedLimit;

			if (umHeroi.vx < -umHeroi.speedLimit)umHeroi.vx = -umHeroi.speedLimit;

			if (umHeroi.vy > umHeroi.speedLimit * 2) umHeroi.vy = umHeroi.speedLimit * 2;

			//Move the umHeroi
			umHeroi.x += umHeroi.vx;
			umHeroi.y += umHeroi.vy;
			// restrições para as translações. Necessário para não sairmos da representação visual do mundo. Descomentar no final
			if (tx > 0) tx = 0;
			if (tx < -(offscreenBackground.width - window.innerWidth)) tx = -(offscreenBackground.width - window.innerWidth);
			if (ty > 0) ty = 0;
			if (ty <= -(offscreenBackground.height - window.innerHeight)) ty = -(offscreenBackground.height - window.innerHeight)

			for (var i=0; i< entities.length;i++){
				entities[i].update();
			}

			for (let i=0; i<asCoins.length; i++){
				asCoins[i].update();
			}


			if(umHeroi.x<0){ //Se a cordenada x do heroi for menor que 0
				umHeroi.x=0; //a cordenada x do heroi passa a 0 (Impede que o heroi saia do escrã pelo lado esquerdo)
			}


			if(umHeroi.x < camera.leftInnerBoundary()) {
				camera.x = Math.floor(umHeroi.x - (camera.width * 0.25));
				tx-=umHeroi.vx;
			}

			if(umHeroi.x + umHeroi.width > camera.rightInnerBoundary()) {
				camera.x = Math.floor(umHeroi.x + umHeroi.width - (camera.width * 0.75));
				tx-=umHeroi.vx;
			}

			if(camera.x < 0){
				camera.x = 0;
			}

			if(camera.x + camera.width > canvases.background.canvas.x + canvases.background.canvas.width){
				camera.x = canvases.background.canvas.x + canvases.background.canvas.width - camera.width;
			}

			if(camera.x > canvases.background.canvas.width){
				camera.x = canvases.background.canvas.width;
			}

			if(barraVidaHeroi.energy<=50){
				if(coracao){
					GameSounds.AMBIENTE.HBEAT.play(true,10);
					coracao=false;
				}
			}

			for (let i=0; i<osGolems.length; i++){
				let g = osGolems[i];
				g.tempoDisparo++;
				if (g.tempoDisparo == 120 && i==1) {

					g.podeDisparar = true;
					var umaFireball = new Fireball(gSpriteSheets['assets//fireball.png'], g.x - 20, g.y + 10, 50);
					asFireballs.push(umaFireball);
					entities.push(umaFireball);
					g.tempoDisparo =0;
				}
				if (g.tempoDisparo == 200 && i==0) {
					g.podeDisparar = true;
					var umaFireball = new Fireball(gSpriteSheets['assets//fireball.png'], g.x - 20, g.y + 10, 50);
					asFireballs.push(umaFireball);
					entities.push(umaFireball);
					g.tempoDisparo =0;
				}

			}

			clearArrays();
			checkColisions();
			render();
			animationHandler = requestAnimationFrame(update);
		}
	}

	function clearArrays() {
		entities = entities.filter(filterByActiveProp);
		asCoins= asCoins.filter(filterByActiveProp);
		asFireballs= asFireballs.filter(filterByActiveProp);
		osGolems= osGolems.filter(filterByActiveProp);
	}

	function filterByActiveProp(obj) {
		if (obj.active === true)
			return obj;
	}

	//função quando se ganha o jogo
	function ganhar() {
		GameSounds.AMBIENTE.GANHAR.play(true, 1);
		cancelAnimationFrame(animationHandler);
		gameState = GameStates.STOPED;

	}

	function morreu(){
		cancelAnimationFrame(animationHandler);
		gameState = GameStates.STOPED;
		location.reload();
	}

	// Desenho dos elementos gráficos
	function render() {
		canvases.background.ctx.clearRect(0, 0, canvases.background.canvas.width, canvases.background.canvas.height); //limpa o canvas
		canvases.entities.ctx.clearRect(0, 0, canvases.entities.canvas.width, canvases.entities.canvas.height); //limpa o canvas

		canvases.background.ctx.save();
		canvases.entities.ctx.save();

		// transladar o canvas de acordo com os offset calculados
		canvases.background.ctx.translate(tx, ty);
		canvases.entities.ctx.translate(tx, ty);


		// PASSO 4 - desenhar o tiled background em offscreen optimiza o rendering, pois só se desenha uma vez o tile completo

		canvases.background.ctx.drawImage(offscreenBackground,
			0, 0, offscreenBackground.width, offscreenBackground.height,
			0, 0, offscreenBackground.width, offscreenBackground.height
		);

		for (var i=0; i<asCoins.length; i++){
			var moedas = asCoins[i];
			moedas.render(canvases.entities.ctx);
		}

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			entity.render(canvases.entities.ctx);
		}


		barraVidaHeroi.render();
		contaMoedas.render();


		// PASSO 6: mostrar a area de colisao das plataformas
		if(debug){
			for (let p of asPlataformas) {
				p.drawColisionBoundaries(canvases.background.ctx, true, false, "red", "blue");
			}
			for (let p of aAgua) {
				p.drawColisionBoundaries(canvases.background.ctx, true, false, "blue", "blue");
			}

			for (let e of entities) {
				e.drawColisionBoundaries(canvases.entities.ctx, true, false, "yellow", "blue");
			}
			for (let p of oFimA) {
				p.drawColisionBoundaries(canvases.background.ctx, true, false, "green", "blue");
			}
			for (let c of asCoins) {
				c.drawColisionBoundaries(canvases.background.ctx, true, false, "red", "teal");
			}
			camera.drawFrame(canvases.background.ctx,true);



		}
		canvases.background.ctx.restore();
		canvases.entities.ctx.restore();

	}

})(); // não apagar