
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
    maxAngulo = 3.6,  // 20 grados de amplitud
    angulo = maxAngulo,
    //intervalo de tiempo
    dt = 0.02,
    t = 0.0,
    
    //momento de inercia fijo de la varilla y desconocido
    Ivarilla = 0;
    // Ivarilla = Math.random() * 2 / 1000 + 0.001,  //entre 0.001 y 0.003 kgm2

    //constante de torsión de la varilla
    cteTorsion = 0;
    // cteTorsion = Math.random() * 4 / 10 + 0.1;   //entre 0.1 y 0.5


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

    // muelle en espiral
    // var rEspiral = 0.1 / (4 * Math.PI + angulo);
    // var escMuelle = canvas.width / 5;
    // var x1, y1;
    // g.strokeStyle = 'black';
    // g.beginPath();
    // g.moveTo(orgX, orgY);
    // for (var ang = 0.0; ang < -angulo + 8 * Math.PI; ang += Math.PI / 40) {
    //     x1 = orgX + rEspiral * ang * Math.cos(ang) * escMuelle;
    //     y1 = orgY - rEspiral * ang * Math.sin(ang) * escMuelle;
    //     g.lineTo(x1, y1);
    // }
    // x1 = orgX + rEspiral * (-angulo + 8 * Math.PI) * Math.cos(8 * Math.PI - angulo) * escMuelle;
    // y1 = orgY - rEspiral * (-angulo + 8 * Math.PI) * Math.sin(8 * Math.PI - angulo) * escMuelle;
    // g.lineTo(x1, y1);
    // g.stroke();
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

// Botón nuevo
nuevo.onclick = function (e) {
    // Momento de inercia fijo de la varilla y desconocido
    Ivarilla = parseFloat(document.getElementById('masa_barra').value);

    // Constante de torsión de la varilla
    cteTorsion = parseFloat(document.getElementById('constante_torsion').value);

    // Constante de amortiguamiento
    // Ce^(-rt) * cos(wt + phi)

    var masa = parseFloat(document.getElementById('masa_1').value);
    if (document.varilla.posicion[0].checked) {
        distancia = parseFloat(document.getElementById('posicion_a_1').value);
    } else {
        distancia = parseFloat(document.getElementById('posicion_b_1').value);
    }
    var mInercia = Ivarilla + 4 * masa * radio * radio / 50000000 + 2 * masa * distancia * distancia / 10000000;
    periodo = 2 * Math.PI * Math.sqrt(mInercia / cteTorsion);
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

// Botón play
empieza.onclick = function (e) {
    t = 0;
    empieza.disabled = true;
    pausa.disabled = false;
    paso.style.display = 'none';
    pausa.style.display = 'inline';
    raf = window.requestAnimationFrame(animate);
}

// Botón pausa
pausa.onclick = function (e) {
    empieza.disabled = false;
    pausa.disabled = true;
    paso.style.display = 'inline';
    pausa.style.display = 'none';
    window.cancelAnimationFrame(raf);
}

// Botón paso
paso.onclick = function (e) {
    update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid('lightgray', 10, 10);
    dispositivo(ctx);
    tiempo(ctx);
}
function update() {
    angulo = maxAngulo * Math.sin(2 * Math.PI * t / periodo + Math.PI / 2);
    t += dt;
}

function animate(time) {
    update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid('lightgray', 10, 10);
    dispositivo(ctx);
    tiempo(ctx);
    raf = window.requestAnimationFrame(animate);
}
