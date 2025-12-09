// Claus per al sessionStorage, localStorage i cookies
var CONFIG_KEY = 'configNavegador';
var BEST_SCORE_KEY = 'millorPuntuacio';
var COOKIE_PLAYER_NAME = 'nomJugador';

/**
 * Obté el nom del navegador a partir del userAgent.
 * Retorna: 'Chrome', 'Firefox', 'Safari', 'Edge' o 'Altres'
 */
var obtenirNomNavegador = function () {
  var userAgent = navigator.userAgent;
  var navegador = 'Altres';

  if (userAgent.indexOf('Firefox') !== -1) {
    navegador = 'Firefox';
  } else if (userAgent.indexOf('Edg') !== -1) {
    navegador = 'Edge';
  } else if (userAgent.indexOf('Chrome') !== -1) {
    navegador = 'Chrome';
  } else if (userAgent.indexOf('Safari') !== -1) {
    navegador = 'Safari';
  }

  return navegador;
};

/**
 * Retorna el nom de la classe CSS del fons segons el navegador.
 */
var obtenirClasseFons = function (navegador) {
  var classe = 'bg-other';

  if (navegador === 'Firefox') {
    classe = 'bg-firefox';
  } else if (navegador === 'Chrome') {
    classe = 'bg-chrome';
  } else if (navegador === 'Safari') {
    classe = 'bg-safari';
  } else if (navegador === 'Edge') {
    classe = 'bg-edge';
  }

  return classe;
};

/**
 * Crea l'objecte de configuració i el guarda al sessionStorage.
 */
var crearConfiguracio = function () {
  var navegadorNom = obtenirNomNavegador();
  var fonsClasse = obtenirClasseFons(navegadorNom);
  var idioma = navigator.language || navigator.userLanguage;
  var url = window.location.origin;

  var config = {
    // idioma del navegador
    idiomaNavegador: idioma,
    // nom del navegador
    navegadorNom: navegadorNom,
    // host + port (amb protocol)
    urlAplicacio: url,
    // classe CSS pel fons de pantalla
    fonsClasse: fonsClasse
  };

  // Guardem l'objecte en format text al sessionStorage
  sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));

  return config;
};

/**
 * Aplica la configuració a la pantalla inicial.
 */
var aplicarConfiguracioPantalla = function (config) {
  // Color de fons del body
  document.body.classList.add(config.fonsClasse);

  // Mostrem informació a la pantalla
  var navegadorElement = document.getElementById('browserInfo');
  var idiomaElement = document.getElementById('languageInfo');
  var urlElement = document.getElementById('urlInfo');

  if (navegadorElement) {
    navegadorElement.textContent = config.navegadorNom;
  }

  if (idiomaElement) {
    idiomaElement.textContent = config.idiomaNavegador;
  }

  if (urlElement) {
    urlElement.textContent = config.urlAplicacio;
  }
};

/**
 * Carrega la configuració del sessionStorage o la crea si no existeix.
 */
var carregarConfiguracio = function () {
  var textConfig = sessionStorage.getItem(CONFIG_KEY);
  var config;

  if (textConfig) {
    config = JSON.parse(textConfig);
  } else {
    config = crearConfiguracio();
  }

  aplicarConfiguracioPantalla(config);
};

/**
 * Mostra la puntuació més alta obtinguda del localStorage.
 * Format: nomjugador - punts - data
 */
var mostrarPuntuacioMesAlta = function () {
  var bestScoreTextElement = document.getElementById('bestScoreText');

  if (!bestScoreTextElement) {
    return;
  }

  var puntuacioJSON = localStorage.getItem(BEST_SCORE_KEY);
  var text = 'No hi ha puntuació actual';

  if (puntuacioJSON) {
    try {
      var puntuacio = JSON.parse(puntuacioJSON);

      if (
        puntuacio &&
        puntuacio.nomJugador &&
        typeof puntuacio.punts !== 'undefined' &&
        puntuacio.data
      ) {
        text = puntuacio.nomJugador + ' - ' +
          puntuacio.punts + ' - ' +
          puntuacio.data;
      }
    } catch (error) {
      // Si hi ha algun error amb el JSON, mostrem el text per defecte
      text = 'No hi ha puntuació actual';
    }
  }

  bestScoreTextElement.textContent = text;
};

/**
 * Esborra la puntuació de localStorage després de confirmar-ho.
 */
var onClickBorrarPuntuacio = function () {
  var resposta = window.confirm('Estàs segur que vols eliminar la informació de la puntuació?');

  if (resposta) {
    localStorage.removeItem(BEST_SCORE_KEY);
    mostrarPuntuacioMesAlta();
  }
};

/**
 * Guarda una cookie amb nom, valor i dies de caducitat.
 */
var setCookie = function (name, value, days) {
  var expires = '';

  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }

  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
};

/**
 * Llegeix una cookie pel seu nom.
 */
var getCookie = function (name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';'); // Array amb totes les cookies
  var i;

  for (i = 0; i < ca.length; i++) {
    var c = ca[i].trim();

    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
};

/**
 * Carrega el nom del jugador de la cookie (si existeix) i el posa a l'input.
 */
var carregarNomJugador = function () {
  var nom = getCookie(COOKIE_PLAYER_NAME);
  var inputNom = document.getElementById('playerName');

  if (nom && inputNom) {
    inputNom.value = nom;
  }
};

/**
 * Handler del botó "Començar partida" de la pantalla inicial.
 * - Comprova que s'ha informat el nom.
 * - Desa el nom en una cookie.
 * - Va a la pàgina del joc.
 */
var onClickComencarPartida = function () {
  var inputNom = document.getElementById('playerName');
  var nom = '';

  if (inputNom) {
    nom = inputNom.value.trim();
  }

  if (nom === '') {
    window.alert('Has d’informar el nom d’un jugador.');
    return;
  }

  // Guardem el nom del jugador a la cookie
  setCookie(COOKIE_PLAYER_NAME, nom, 7);

  // Anem a la pàgina del joc
  window.location.href = 'joc.html';
};

/**
 * Funció principal d'inicialització de la pàgina index.html
 */
var inicialitzarIndex = function () {
  carregarConfiguracio();        // navegador, idioma, url, fons
  mostrarPuntuacioMesAlta();     // millor puntuació des de localStorage
  carregarNomJugador();          // nom del jugador des de la cookie (si hi és)

  // Afegim els listeners als botons
  var botoComencar = document.getElementById('startGameButton');
  var botoBorrar = document.getElementById('clearScoreButton');

  if (botoComencar) {
    botoComencar.addEventListener('click', onClickComencarPartida);
  }

  if (botoBorrar) {
    botoBorrar.addEventListener('click', onClickBorrarPuntuacio);
  }
};

// Executem la inicialització quan es carrega el fitxer JS
inicialitzarIndex();
