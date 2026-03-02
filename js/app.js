// js/app.js
const container = document.querySelector('.container');
const resultado = document.querySelector('#resultado');
const formulario = document.querySelector('#formulario');

window.addEventListener('load', () => {
  formulario.addEventListener('submit', buscarClima);
});

function buscarClima(e) {
  e.preventDefault();
  const ciudad = document.querySelector('#ciudad').value.trim();
  const pais = document.querySelector('#pais').value;

  if (!ciudad || !pais) {
    mostrarError('Ambos campos son obligatorios');
    return;
  }
  if (ciudad.length < 3) {
    mostrarError('La ciudad debe tener al menos 3 caracteres');
    return;
  }
  consultarAPI(ciudad, pais);
}

function mostrarError(mensaje) {
  const alertaExistente = document.querySelector('.bg-red-100');
  if (alertaExistente) return;

  const alerta = document.createElement('div');
  alerta.classList.add(
    'bg-red-100', 'border-red-400', 'text-red-700',
    'px-4', 'py-3', 'rounded', 'relative',
    'max-w-md', 'mx-auto', 'mt-6', 'text-center'
  );

  alerta.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">${mensaje}</span>
    `;

  container.appendChild(alerta);
  setTimeout(() => alerta.remove(), 3000);
}

function consultarAPI(ciudad, pais) {
  // Crear una clave única para caché
  const cacheKey = `${ciudad.toLowerCase()}-${pais}`;

  // Verificar si ya tenemos datos en caché
  const cacheData = localStorage.getItem(cacheKey);

  if (cacheData) {
    console.log(' Usando datos en caché');
    const datos = JSON.parse(cacheData);

    // Verificar que los datos en caché no sean muy antiguos (opcional)
    const tiempoGuardado = datos.timestamp || 0;
    const tiempoActual = Date.now();
    const unaHora = 60 * 60 * 1000; // 1 hora en milisegundos

    if (tiempoActual - tiempoGuardado < unaHora) {
      limpiarHTML();
      mostrarClima(datos);
      return;
    } else {
      // Caché expirado, eliminarlo
      localStorage.removeItem(cacheKey);
      console.log(' Caché expirada, eliminada');
    }
  }

  // Si no hay caché o expiró, hacer la petición a la API
  const appId = CONFIG.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad},${pais}&appid=${appId}`;

  Spinner();

  fetch(url)
    .then(respuesta => respuesta.json())
    .then(datos => {
      limpiarHTML();

      if (datos.cod === "404") {
        mostrarError('Ciudad No Encontrada');
      } else {
        // Agregar timestamp para control de caché
        datos.timestamp = Date.now();

        // Guardar en localStorage
        localStorage.setItem(cacheKey, JSON.stringify(datos));
        console.log(' Datos guardados en caché');

        mostrarClima(datos);
      }
    })
    .catch(() => {
      mostrarError('Error de conexión. Verifica tu internet');
    });
}

function mostrarClima(datos) {
  const { name, main: { temp, temp_max, temp_min } } = datos;

  const grados = KelvinACentigrados(temp);
  const max = KelvinACentigrados(temp_max);
  const min = KelvinACentigrados(temp_min);

  const resultadoDiv = document.createElement('div');
  resultadoDiv.classList.add('text-center', 'text-white');

  resultadoDiv.innerHTML = `
        <p class="font-bold text-2xl">Clima en: ${name}</p>
        <p class="font-bold text-6xl">${grados}°C</p>
        <p class="text-xl">Máxima: ${max}°C</p>
        <p class="text-xl">Mínima: ${min}°C</p>
        <p class="text-xs text-gray-300 mt-4">${datos.timestamp ? 'Datos en caché' : ''}</p>
    `;

  resultado.appendChild(resultadoDiv);
}

function KelvinACentigrados(grados) {
  return Math.round(grados - 273.15);
}

function limpiarHTML() {
  while (resultado.firstChild) {
    resultado.removeChild(resultado.firstChild);
  }
}

function Spinner() {
  limpiarHTML();

  const divSpinner = document.createElement('div');
  divSpinner.classList.add('sk-fading-circle');

  divSpinner.innerHTML = `
        <div class="sk-circle1 sk-circle"></div>
        <div class="sk-circle2 sk-circle"></div>
        <div class="sk-circle3 sk-circle"></div>
        <div class="sk-circle4 sk-circle"></div>
        <div class="sk-circle5 sk-circle"></div>
        <div class="sk-circle6 sk-circle"></div>
        <div class="sk-circle7 sk-circle"></div>
        <div class="sk-circle8 sk-circle"></div>
        <div class="sk-circle9 sk-circle"></div>
        <div class="sk-circle10 sk-circle"></div>
        <div class="sk-circle11 sk-circle"></div>
        <div class="sk-circle12 sk-circle"></div>
    `;

  resultado.appendChild(divSpinner);
}