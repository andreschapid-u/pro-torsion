//Supongo que aquí se pinta el péndulo
function drawGrid(color, stepx, stepy) {

	ctx.save()
	ctx.strokeStyle = color;
	ctx.fillStyle = '#ffffff';
	ctx.lineWidth = 0.5;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (var i = stepx + 0.5; i < canvas.width; i += stepx) {
		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, canvas.height);
		ctx.stroke();
	}

	for (var i = stepy + 0.5; i < canvas.height; i += stepy) {
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(canvas.width, i);
		ctx.stroke();
	}
	ctx.restore();
}


var canvas = document.getElementById('canvas_1'),
	ctx = canvas.getContext('2d');
ctx.font = '13px Helvetica';
var wChar = ctx.measureText('m').width;


var orgX = canvas.width / 2,
	orgY = canvas.height / 2,
	//escala
	escala,
	//parámetros
	distancia = 10.0,     //posición del eje de las esferas
	radio = 2.0,     //radio de las esferas
	periodo,      //periodo
	lonVarilla = 50.0,   //longitud de la varilla
	//desplazamiento angular máximo
	maxAngulo = 3.6,  //360 grados de amplitud
	angulo = maxAngulo,
	//intervalo de tiempo
	dt = 0.01,
	t = 0.0,
	//momento de inercia fijo de la varilla y desconocido
	//Ivarilla=Math.random()*2/1000+0.001,  //entre 0.001 y 0.003 kgm2
	Ivarilla = 0.01
//constante de torsión de la varilla
cteTorsion = 0.5;   //entre 0.1 y 0.5
beta = 0.1;
//Gama
gama = 0;

//Fuerza Externa
fe = 0.01;

//Solición estacionaria
solucionEstacionaria = 0;

//Solución complementaria
solucionComplentaria = 0;

//Amplitud de la fuerza
amplitudFuerza = 0;
//Frecuencia fuerza
frecuenciaFuerza = 0;


escala = (canvas.width - 8 * wChar) / lonVarilla;

function dispositivo(g) {
	//marcas
	g.fillStyle = 'black';
	g.beginPath();
	g.moveTo(0, orgY - wChar);
	g.lineTo(3 * wChar, orgY);
	g.lineTo(0, orgY + wChar);
	g.fill();
	g.beginPath();
	g.moveTo(canvas.width, orgY - wChar);
	g.lineTo(canvas.width - 3 * wChar, orgY);
	g.lineTo(canvas.width, orgY + wChar);
	g.fill();
	g.save();
	g.translate(orgX, orgY);
	g.rotate(angulo);
	//varilla
	g.fillStyle = 'gray';
	g.fillRect(-lonVarilla * escala / 2, -0.25 * escala, lonVarilla * escala, 0.5 * escala);
	//esferas
	g.fillStyle = 'blue';
	g.beginPath();
	g.arc(-distancia * escala, 0, radio * escala, 0, 2 * Math.PI, false);
	g.fill();
	g.beginPath();
	g.arc(distancia * escala, 0, radio * escala, 0, 2 * Math.PI, false);
	g.fill();
	g.fillStyle = 'white';
	g.beginPath();
	g.arc(-distancia * escala, 0, 2, 0, 2 * Math.PI, false);
	g.fill();
	g.beginPath();
	g.arc(distancia * escala, 0, 2, 0, 2 * Math.PI, false);
	g.fill();
	//eje
	g.fillStyle = 'red';
	g.beginPath();
	g.arc(0, 0, 4, 0, 2 * Math.PI, false);
	g.fill();
	g.restore();
	//muelle en espiral

}

function tiempo(g) {
	g.save();
	g.fillStyle = 'black';
	g.textAlign = 'left';
	g.textBaseline = 'bottom';
	g.font = '14px Helvetica';
	g.fillText('t: ' + t.toFixed(2), wChar, canvas.height - 4);
	g.fillText('\u03B8: ' + (angulo * 180 / Math.PI).toFixed(1), wChar, canvas.height - 2 * wChar);
	g.restore();
}

var raf,
	nuevo = document.getElementById('nuevo'),
	empieza = document.getElementById('empieza'),
	paso = document.getElementById('paso'),
	pausa = document.getElementById('pausa');

drawGrid('lightgray', 10, 10);
dispositivo(ctx);
empieza.disabled = true;
pausa.disabled = true;

nuevo.onclick = function (e) {
	var masa = parseFloat(document.getElementById('masa_1').value);
	if (document.varilla.posicion[0].checked) {
		distancia = parseFloat(document.getElementById('posicion_a_1').value);
	} else {
		distancia = parseFloat(document.getElementById('posicion_b_1').value);
	}
	var mInercia = Ivarilla + 4 * masa * radio * radio / 50000000 + 2 * masa * distancia * distancia / 10000000;
	console.log(mInercia);
	periodo = 2 * Math.PI * Math.sqrt(mInercia / cteTorsion);
	console.log(periodo);

	//Amortiguado

	gama = beta / (2 * mInercia);

	//Forzado
	let part1;
	let part2;
	frecuenciaFuerza = Math.sqrt(Math.pow((2 * Math.PI) / periodo, 2) - 2 * Math.pow(gama, 2));

	part1 = Math.pow(Math.pow(2 * Math.PI / periodo, 2) - Math.pow(frecuenciaFuerza, 2), 2);
	part2 = Math.pow(2 * gama * frecuenciaFuerza, 2)

	amplitudFuerza = (fe / mInercia) / (Math.sqrt(part1 + part2));


	t = 0.0;
	angulo = maxAngulo;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid('lightgray', 10, 10);
	dispositivo(ctx);
	empieza.disabled = false;
	pausa.disabled = true;
	paso.style.display = 'none';
	pausa.style.display = 'inline';
	if (raf != undefined) {
		window.cancelAnimationFrame(raf);
	}

}

empieza.onclick = function (e) {
	t = 0;
	empieza.disabled = true;
	pausa.disabled = false;
	paso.style.display = 'none';
	pausa.style.display = 'inline';
	raf = window.requestAnimationFrame(animate);
}

pausa.onclick = function (e) {
	empieza.disabled = false;
	pausa.disabled = true;
	paso.style.display = 'inline';
	pausa.style.display = 'none';
	window.cancelAnimationFrame(raf);
}
paso.onclick = function (e) {
	update();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid('lightgray', 10, 10);
	dispositivo(ctx);
	tiempo(ctx);
}

function update() {
	//x=Amplitud*sen(frecuencia*t+phi)
	solucionComplementaria = maxAngulo * Math.pow(Math.E, -gama * t) * Math.sin(2 * Math.PI * t / periodo + Math.PI / 2);
	solucionEstacionaria = amplitudFuerza * Math.sin(frecuenciaFuerza * t - 0);
	angulo = solucionComplementaria + solucionEstacionaria;
	console.log(angulo)
	t += dt;
}

//Animación del péndulo 

function animate(time) {
	update();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid('lightgray', 10, 10);
	dispositivo(ctx);
	tiempo(ctx);
	raf = window.requestAnimationFrame(animate);
}


