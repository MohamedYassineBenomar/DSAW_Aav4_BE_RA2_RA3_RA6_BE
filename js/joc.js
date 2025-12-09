// Claus utilitzades en el projecte
var CONFIG_KEY = 'configNavegador';
var COOKIE_PLAYER_NAME = 'nomJugador';
var BEST_SCORE_KEY = 'millorPuntuacio';

// Llista de lletres per generar els botons
var LLETRES = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z'
];

// Llista d'imatges del globus (posa aquí els noms dels fitxers que baixis)
var GLOBUS_IMATGES = [
  'img/globus0.png',
  'img/globus1.png',
  'img/globus2.png',
  'img/globus3.png',
  'img/globus4.png',
  'img/globus5.png',
  'img/globus6.png',
  'img/globus7.png',
  'img/globus8.png',
  'img/globus9.png'
];

// Estat del joc
var estatJoc = {
  paraulaSecreta: '',
  lletresParaula: [],
  lletresEncertades: [],
  jugadesMaximes: 9,
  jugadesActuals: 0,
  encertsConsecutius: 0,
  partidaEnMarxa: false
};

// Informació del jugador
var jugador = {
  nom: '',
  puntsPartidaActual: 0,
  partidesGuanyades: 0,
  totalPartides: 0,
  partidaAmbMesPunts: {
    punts: 0,
    dataHora: ''
  }
};

// ---------- Funcions auxiliars cookies ----------

var setCookie = function (name, value, days) {
  var expires = '';

  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }

  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
};

var getCookie = function (name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  var i;

  for (i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
};

// ---------- Carregar configuració del sessionStorage ----------

var carregarConfiguracio = function () {
  var configText = sessionStorage.getItem(CONFIG_KEY);

  if (!configText) {
    // Si no hi ha configuració, no fem res especial
    return;
  }

  var config = JSON.parse(configText);

  // Color de fons de la pàgina
  if (config.fonsClasse) {
    document.body.classList.add(config.fonsClasse);
  }

  // Idioma del navegador
  var languageElement = document.getElementById('gameLanguage');
  if (languageElement) {
    languageElement.textContent = config.idiomaNavegador;
  }
};

// ---------- Gestió del jugador i estadístiques ----------

var carregarNomJugador = function () {
  var nom = getCookie(COOKIE_PLAYER_NAME);
  var label = document.getElementById('playerNameLabel');

  if (!nom) {
    nom = '';
  }

  jugador.nom = nom;

  if (label) {
    label.textContent = nom;
  }
};

var obtenirDataActualFormatejada = function () {
  var ara = new Date();

  var dia = ara.getDate();
  var mes = ara.getMonth() + 1;
  var any = ara.getFullYear();
  var hores = ara.getHours();
  var minuts = ara.getMinutes();

  if (dia < 10) {
    dia = '0' + dia;
  }
  if (mes < 10) {
    mes = '0' + mes;
  }
  if (hores < 10) {
    hores = '0' + hores;
  }
  if (minuts < 10) {
    minuts = '0' + minuts;
  }

  return dia + '/' + mes + '/' + any + ' ' + hores + ':' + minuts;
};

var actualitzarPantallaEstadistiques = function () {
  var puntsElement = document.getElementById('currentPoints');
  var totalElement = document.getElementById('totalGames');
  var guanyadesElement = document.getElementById('wins');
  var percentElement = document.getElementById('winsPercent');
  var millorPartidaElement = document.getElementById('bestGameInfo');

  var percent = 0;

  if (jugador.totalPartides > 0) {
    percent = Math.round(
      (jugador.partidesGuanyades * 100) / jugador.totalPartides
    );
  }

  if (puntsElement) {
    puntsElement.textContent = jugador.puntsPartidaActual;
  }
  if (totalElement) {
    totalElement.textContent = jugador.totalPartides;
  }
  if (guanyadesElement) {
    guanyadesElement.textContent = jugador.partidesGuanyades;
  }
  if (percentElement) {
    percentElement.textContent = percent;
  }

  if (millorPartidaElement) {
    if (jugador.partidaAmbMesPunts.punts > 0) {
      millorPartidaElement.textContent =
        jugador.partidaAmbMesPunts.dataHora +
        ' - ' +
        jugador.partidaAmbMesPunts.punts +
        ' punts';
    } else {
      millorPartidaElement.textContent = '-';
    }
  }
};

var actualitzarMillorPuntuacioLocalStorage = function () {
  if (jugador.partidaAmbMesPunts.punts <= 0 || !jugador.nom) {
    return;
  }

  var millorPartidaActual = {
    nomJugador: jugador.nom,
    punts: jugador.partidaAmbMesPunts.punts,
    data: jugador.partidaAmbMesPunts.dataHora
  };

  var jsonGuardat = localStorage.getItem(BEST_SCORE_KEY);
  var millorGuardat;

  if (jsonGuardat) {
    millorGuardat = JSON.parse(jsonGuardat);
  }

  if (!millorGuardat || millorPartidaActual.punts > millorGuardat.punts) {
    localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(millorPartidaActual));
  }
};

// ---------- Gestió del formulari de la paraula secreta ----------

var esParaulaValida = function (text) {
  if (!text || text.trim() === '') {
    window.alert('Has d’afegir una paraula per poder començar a jugar');
    return false;
  }

  var paraula = text.trim();

  // Comprovar números
  var teNumero = false;
  var i;
  for (i = 0; i < paraula.length; i++) {
    var codi = paraula.charCodeAt(i);
    if (codi >= 48 && codi <= 57) {
      teNumero = true;
      break;
    }
  }

  if (teNumero) {
    window.alert('La paraula no pot contenir números');
    return false;
  }

  if (paraula.length < 4) {
    window.alert('La paraula ha de contenir més de 3 caràcters');
    return false;
  }

  return true;
};

var inicialitzarParaula = function (paraula) {
  estatJoc.paraulaSecreta = paraula.toUpperCase();
  estatJoc.lletresParaula = estatJoc.paraulaSecreta.split('');
  estatJoc.lletresEncertades = [];
  estatJoc.jugadesActuals = 0;
  estatJoc.encertsConsecutius = 0;
  estatJoc.partidaEnMarxa = true;

  var i;
  for (i = 0; i < estatJoc.lletresParaula.length; i++) {
    estatJoc.lletresEncertades.push(false);
  }

  jugador.puntsPartidaActual = 0;

  // Netegem resultat de la partida anterior
  var seccioParaula = document.querySelector('.game-word');
  if (seccioParaula) {
    seccioParaula.classList.remove('win-background');
    seccioParaula.classList.remove('lose-background');
  }

  actualitzarPantallaEstadistiques();
  actualitzarJugadesRestants();
  mostrarGuionsInicials();
  actualitzarImatgeGlobus();
};

var mostrarGuionsInicials = function () {
  var contenidor = document.getElementById('wordPlaceholders');
  if (!contenidor) {
    return;
  }

  // Esborrem contingut actual
  while (contenidor.firstChild) {
    contenidor.removeChild(contenidor.firstChild);
  }

  var i;
  for (i = 0; i < estatJoc.lletresParaula.length; i++) {
    var span = document.createElement('span');
    span.className = 'letter-slot';
    span.textContent = '_';
    contenidor.appendChild(span);
  }
};

var actualitzarJugadesRestants = function () {
  var restants = estatJoc.jugadesMaximes - estatJoc.jugadesActuals;
  var info = document.getElementById('attemptsInfo');

  if (info) {
    info.textContent = 'Jugades restants: ' + restants;
  }
};

var actualitzarImatgeGlobus = function () {
  var img = document.getElementById('balloonImage');
  if (!img) {
    return;
  }

  var index = estatJoc.jugadesActuals;

  if (index < 0) {
    index = 0;
  }

  if (index >= GLOBUS_IMATGES.length) {
    index = GLOBUS_IMATGES.length - 1;
  }

  img.src = GLOBUS_IMATGES[index];
};

// ---------- Gestió dels botons de lletres ----------

var crearBotonsLletres = function () {
  var contenidor = document.getElementById('lettersContainer');
  if (!contenidor) {
    return;
  }

  var i;
  for (i = 0; i < LLETRES.length; i++) {
    var lletra = LLETRES[i];
    var boto = document.createElement('button');
    boto.type = 'button';
    boto.textContent = lletra;
    boto.className = 'btn letter-btn letter-disabled';
    boto.disabled = true;
    boto.setAttribute('data-letter', lletra);

    boto.addEventListener('click', onClickLletra);

    contenidor.appendChild(boto);
  }
};

var establirEstatBotonsLletres = function (habilitar) {
  var contenidor = document.getElementById('lettersContainer');
  if (!contenidor) {
    return;
  }

  var botons = contenidor.getElementsByTagName('button');
  var i;
  for (i = 0; i < botons.length; i++) {
    var boto = botons[i];

    if (habilitar) {
      boto.disabled = false;
      boto.classList.remove('letter-disabled');
      boto.classList.add('letter-enabled');
    } else {
      boto.disabled = true;
      boto.classList.remove('letter-enabled');
      boto.classList.add('letter-disabled');
    }
  }
};

// ---------- Jugades amb lletres ----------

var revelarLletresEncertades = function (posicions) {
  var contenidor = document.getElementById('wordPlaceholders');
  if (!contenidor) {
    return;
  }

  var spans = contenidor.getElementsByClassName('letter-slot');
  var i;

  for (i = 0; i < posicions.length; i++) {
    var pos = posicions[i];
    estatJoc.lletresEncertades[pos] = true;
    if (spans[pos]) {
      spans[pos].textContent = estatJoc.lletresParaula[pos];
    }
  }
};

var totesLletresEncertades = function () {
  var i;
  for (i = 0; i < estatJoc.lletresEncertades.length; i++) {
    if (!estatJoc.lletresEncertades[i]) {
      return false;
    }
  }
  return true;
};

var gestionarErrorLletra = function () {
  // Reset d'encerts seguits
  estatJoc.encertsConsecutius = 0;

  // Restem un punt però mai negatiu
  if (jugador.puntsPartidaActual > 0) {
    jugador.puntsPartidaActual--;
  }

  estatJoc.jugadesActuals++;
  actualitzarImatgeGlobus();
  actualitzarJugadesRestants();
  actualitzarPantallaEstadistiques();

  if (estatJoc.jugadesActuals >= estatJoc.jugadesMaximes) {
    finalitzarPartida(false);
  }
};

var gestionarEncertLletra = function (posicions) {
  // Cada vegada que encertem una lletra, augmentem el comptador de ratxa
  estatJoc.encertsConsecutius++;

  // Punts de la jugada: 1,2,3,... segons encerts seguits
  var puntsJugada = estatJoc.encertsConsecutius;

  // Si la lletra apareix més d'una vegada, multipliquem pels caràcters
  if (posicions.length > 1) {
    puntsJugada = puntsJugada * posicions.length;
  }

  jugador.puntsPartidaActual = jugador.puntsPartidaActual + puntsJugada;

  revelarLletresEncertades(posicions);
  actualitzarPantallaEstadistiques();

  if (totesLletresEncertades()) {
    finalitzarPartida(true);
  }
};

var onClickLletra = function (event) {
  if (!estatJoc.partidaEnMarxa) {
    return;
  }

  var boto = event.currentTarget;
  var lletra = boto.getAttribute('data-letter');

  // Botó queda deshabilitat i de color vermell
  boto.disabled = true;
  boto.classList.remove('letter-enabled');
  boto.classList.add('letter-disabled');

  var posicions = [];
  var i;

  for (i = 0; i < estatJoc.lletresParaula.length; i++) {
    if (estatJoc.lletresParaula[i] === lletra) {
      posicions.push(i);
    }
  }

  if (posicions.length === 0) {
    gestionarErrorLletra();
  } else {
    gestionarEncertLletra(posicions);
  }
};

// ---------- Finalitzar partida (guany o pèrdua) ----------

var mostrarParaulaCompleta = function () {
  var contenidor = document.getElementById('wordPlaceholders');
  if (!contenidor) {
    return;
  }

  var spans = contenidor.getElementsByClassName('letter-slot');
  var i;

  for (i = 0; i < estatJoc.lletresParaula.length; i++) {
    if (spans[i]) {
      spans[i].textContent = estatJoc.paraulaSecreta[i];
    }
  }
};

var finalitzarPartida = function (haGuanyat) {
  estatJoc.partidaEnMarxa = false;

  // Actualitzem estadístiques del jugador
  jugador.totalPartides++;

  if (haGuanyat) {
    jugador.partidesGuanyades++;
  }

  // Actualitzem millor partida
  if (jugador.puntsPartidaActual > jugador.partidaAmbMesPunts.punts) {
    jugador.partidaAmbMesPunts.punts = jugador.puntsPartidaActual;
    jugador.partidaAmbMesPunts.dataHora = obtenirDataActualFormatejada();
  }

  actualitzarPantallaEstadistiques();
  actualitzarMillorPuntuacioLocalStorage();

  // Color de fons segons resultat
  var seccioParaula = document.querySelector('.game-word');
  if (seccioParaula) {
    seccioParaula.classList.remove('win-background');
    seccioParaula.classList.remove('lose-background');

    if (haGuanyat) {
      seccioParaula.classList.add('win-background');
    } else {
      seccioParaula.classList.add('lose-background');
    }
  }

  // Mostrem tota la paraula si ha perdut
  if (!haGuanyat) {
    mostrarParaulaCompleta();
  }

  // Rehabilitem formulari i botó
  var input = document.getElementById('secretWordInput');
  var botoComencar = document.getElementById('startRoundButton');

  if (input) {
    input.disabled = false;
  }
  if (botoComencar) {
    botoComencar.disabled = false;
  }

  establirEstatBotonsLletres(false);
};

// ---------- Handlers botons capçalera ----------

var onClickTornar = function () {
  var sortir = window.confirm('Estàs segur que vols deixar la partida?');
  if (sortir) {
    window.location.href = 'index.html';
  }
};

var onClickInstruccions = function () {
  window.open(
    'instruccions.html',
    'instruccions',
    'width=700,height=500'
  );
};

// ---------- Handler formulari paraula secreta ----------

var onClickToggleSecret = function () {
  var input = document.getElementById('secretWordInput');
  var boto = document.getElementById('toggleSecretButton');

  if (!input || !boto) {
    return;
  }

  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
};

var onClickComencarPartida = function () {
  var input = document.getElementById('secretWordInput');

  if (!input) {
    return;
  }

  var text = input.value;

  if (!esParaulaValida(text)) {
    return;
  }

  // Inicialitzem el joc amb la paraula
  inicialitzarParaula(text);

  // Deshabilitem el formulari
  input.disabled = true;

  var botoComencar = document.getElementById('startRoundButton');
  if (botoComencar) {
    botoComencar.disabled = true;
  }

  // Activem els botons de lletres
  establirEstatBotonsLletres(true);
};

// ---------- Inicialització global de la pàgina ----------

var inicialitzarJoc = function () {
  carregarConfiguracio();
  carregarNomJugador();
  crearBotonsLletres();
  actualitzarPantallaEstadistiques();
  actualitzarJugadesRestants();
  actualitzarImatgeGlobus();

  var botoTornar = document.getElementById('backButton');
  var botoInstruccions = document.getElementById('instructionsButton');
  var botoToggleSecret = document.getElementById('toggleSecretButton');
  var botoComencar = document.getElementById('startRoundButton');

  if (botoTornar) {
    botoTornar.addEventListener('click', onClickTornar);
  }

  if (botoInstruccions) {
    botoInstruccions.addEventListener('click', onClickInstruccions);
  }

  if (botoToggleSecret) {
    botoToggleSecret.addEventListener('click', onClickToggleSecret);
  }

  if (botoComencar) {
    botoComencar.addEventListener('click', onClickComencarPartida);
  }
};

// Executar inicialització
inicialitzarJoc();
