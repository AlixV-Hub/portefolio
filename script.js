// Variables API Météo
const TEMPERATURE_LOCALE = document.querySelector("#temperature");
const ZONE_COUCHER_SOLEIL = document.querySelector("#coucherSoleil");
const TEXTE_COUCHER_SOLEIL = document.querySelector("#texteCoucherSoleil");

// Variables API Pokémon

let button = document.querySelector("#button")
let image = document.querySelector("#imagePokemon")
let pokeNumber = document.querySelector("#number")
let pokeName = document.querySelector("#name")

// Variables Grettings
let containerGreeting = document.querySelector("#containerGreeting")
let timeNow = new Date().getHours()

// Variables Météo

const CITYINPUT = document.querySelector("#cityInput");
const FETCHBUTTON = document.querySelector(".city-search button");
const CITYDISPLAY = document.querySelector("#city");
const COORDINATESDISPLAY = document.querySelector("#gps");
const TEMPERATUREDISPLAY = document.querySelector("#temp");
const DETAILSDISPLAY = document.querySelector("#details");

// Variables Sport Timer 
// Initialisation des variables (avec récupération depuis le localStorage si dispo)
let workMinutes = parseFloat(localStorage.getItem("workMinutes")) || 25;
let shortBreakMinutes = parseFloat(localStorage.getItem("shortBreakMinutes")) || 5;
let longBreakMinutes = parseFloat(localStorage.getItem("longBreakMinutes")) || 15;
let autoPlay = localStorage.getItem("autoPlay") === 'true';
let autoPlayLimit = parseInt(localStorage.getItem("autoPlayLimit")) || 4;

let WORK_TIME = Math.round(workMinutes * 60);
let SHORT_BREAK = Math.round(shortBreakMinutes * 60);
let LONG_BREAK = Math.round(longBreakMinutes * 60);

let timeLeft = WORK_TIME;
let timer = null;
let isRunning = false;
let mode = "work";
let sessions = parseInt(localStorage.getItem("sessions")) || 0;
let sessionCounter = 0; // compteur pour le auto-play

// Sélection des éléments DOM
const timerDisplay = document.querySelector("#timerDisplay");
const statusDisplay = document.querySelector("#status");
const startStopBtn = document.querySelector("#startStopBtn");
const sessionsDisplay = document.querySelector("#sessions");
const workInput = document.querySelector("#workInput");
const shortBreakInput = document.querySelector("#shortBreakInput");
const longBreakInput = document.querySelector("#longBreakInput");
const autoPlayToggle = document.querySelector("#autoPlayToggle");
const autoPlayLimitInput = document.querySelector("#autoPlayLimit");
const saveConfigBtn = document.querySelector("#saveConfigBtn");
const beep = document.querySelector("#beep");

//Requête API Météo
async function appelApiMeteo() {
    //Lien pour coordonnées ADA, heure sunset, température actuelle, probabilité de précipitation par 15mins
    let address =
      "https://api.open-meteo.com/v1/forecast?latitude=47.2199&longitude=-1.5325&daily=sunset&models=meteofrance_seamless&current=temperature_2m&minutely_15=precipitation_probability&timezone=Europe%2FLondon&forecast_days=1";
    let promise = await fetch(address);
    let data = await promise.json();
  
    const { current, current_units, daily } = data;
  
    //J'affiche la température locale et son unité
    TEMPERATURE_LOCALE.textContent = `🌡 ${current.temperature_2m}${current_units.temperature_2m}`;
  
    //Je récupère l'heure du coucher de soleil et transforme le format en Date, puis calcule la durée d'ensoleillement restant.
    const coucherSoleil = daily.sunset[0];
  
    let formatDateCoucherSoleil = new Date();
    formatDateCoucherSoleil.setHours(coucherSoleil[11] + coucherSoleil[12]);
    formatDateCoucherSoleil.setMinutes(coucherSoleil[14] + coucherSoleil[15]);
  
    let dureeSoleilMilliS = formatDateCoucherSoleil - new Date();
  
    if (dureeSoleilMilliS <= 0){
      ZONE_COUCHER_SOLEIL.textContent = "🌛";
      TEXTE_COUCHER_SOLEIL.textContent = "";
    } else {  
      let heuresSoleil = Math.floor(dureeSoleilMilliS / 1000 / 60 / 60) % 24;
      let minutesSoleil = Math.floor(dureeSoleilMilliS / 1000 / 60) % 60;
    
      if (minutesSoleil < 10) {
        ZONE_COUCHER_SOLEIL.textContent = `🌆 ${heuresSoleil}h0${minutesSoleil}`;
      } else {
        ZONE_COUCHER_SOLEIL.textContent = `🌆 ${heuresSoleil}h${minutesSoleil}`;
      }
    }
  
  }
  appelApiMeteo();
  setInterval(appelApiMeteo, 3600000);

// Requête API Pokémon (rédaction moderne)
const changePokemon = async() => {
    // nombre aléatoire pour choir un pokemon
    // Math.ceil on plafonne à 150 + 1 pour exclure le 0
    let randomNumber = Math.ceil(Math.random()*150)+1
    //  Gerer de façon dynamique la requête vers l'URL en injectant le randomNumber
    let requestString = `https://pokeapi.co/api/v2/pokemon/${randomNumber}`; 
    let data = await fetch(requestString)
    let response = await data.json()
      // Dans la console via les éléments récupérer on trouve la source de l'image front default 
    // => sprites => front_default on enchaine les différentes propriétés par un .
    image.src = response.sprites.front_default
    // On ajoute le numéro et le nom qui est du text d'où textContent
    // Pour ajouter un # devant le numéro on ajout `${}`
    pokeNumber.textContent = `#${response.id}`
    pokeName.textContent = response.name
}
// Pour initialiser le jeu on appelle la fonction
changePokemon()
// On écoute l'évenement click et on appelle la fonction changePokemon
buttonPoke.addEventListener("click", changePokemon) // ne pas mettre les () dans le button 

// Fonction greeting
function greeting() {
    // On déclare la variable dans la fonction
    let greeting ;
    console.log("tu es dans la fonction")
    if (timeNow >=5 && timeNow <12) {
        console.log("c'est le matin)")
        greeting = "Bonne journée!"
    } else if (timeNow >=12 && timeNow <13) {
        greeting = "Bon appetit!"
        console.log("Il est midi")
    } else if (timeNow >=13 && timeNow <18){
        greeting = "Bon après-midi!"
        console.log("On est l'après-midi")
    } else if (timeNow >=18 && timeNow <22){
        console.log("On est le soir")
        greeting = "Bonne soirée!"
    } else {
        console.log("c'est la nuit")
        greeting = "Bonne nuit!"
    }
    // On ajoute le txt au HTML
    containerGreeting.innerHTML = `<h3>${greeting}</h3>`
}
greeting()
setInterval(greeting, 900000);

// API température 

// Fonction pour récupérer les coordonnées de la ville
async function fetchCoordinates(city) {

  //requete
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json&addressdetails=1&limit=1`);
  // On attends la réponse en JSON
  const data = await response.json();
  console.log("Données de coordonnées :", data); // Debug des données
  if (data.length > 0) {
  //   on stock la réponse dans un tableau data
    const { lat, lon } = data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) }; // on tranforme en nombre la réponse
  } else {
    //  message d'erreur
    COORDINATESDISPLAY.textContent = `Ville "${city}" non trouvée.`;
    return {}; 
  }

}

// Fonction pour récupérer les données météo

async function fetchWeather(latitude, longitude) {
  // requête
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,relative_humidity_2m`);
  const data = await response.json();
  console.log("Données météo :", data); 

  // On vérifie qu'il y a bien quelque chose dans data

  if (data.current) {
      // stocker la température
      const { temperature_2m } = data.current;
      // Retour de la réponse
      return { temperature: temperature_2m.toFixed(1) };
  } else {
      TEMPERATUREDISPLAY.textContent = "Indisponible";
      return {}; 
  }
}

// Fonction pour mettre à jour l'affichage
async function updateWeather(city) {
// Affichage
CITYDISPLAY.textContent = "Chargement...";
COORDINATESDISPLAY.textContent = "";
TEMPERATUREDISPLAY.textContent = " -°C";
DETAILSDISPLAY.textContent = "Mise à jour en cours...";


// On récupère les coordonnées de la ville
const { latitude, longitude } = await fetchCoordinates(city);
if (latitude && longitude) {
  // On récupère la température avec les coordonnées
  const { temperature } = await fetchWeather(latitude, longitude);
  console.log("Données météo récupérées :", temperature); // Debug de la température
  // On mets à jour l'affichage 
  CITYDISPLAY.textContent = city;
  COORDINATESDISPLAY.textContent = `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`;
  TEMPERATUREDISPLAY.textContent = `${temperature}°C`;
  DETAILSDISPLAY.textContent = "";
} else {
  //  message d'erreur
  CITYDISPLAY.textContent = "Erreur";
  COORDINATESDISPLAY.textContent = "";
  TEMPERATUREDISPLAY.textContent = " -°C";
  DETAILSDISPLAY.textContent = "";
}
}

// Ajout de l'événement click sur le bouton
FETCHBUTTON.addEventListener('click', () => {
// 1. Récupérer le nom de la ville saisi dans l'input
const city = CITYINPUT.value;
// 2. Mettre à jour l'affichage avec les informations météorologiques de la ville
updateWeather(city);
});

// Sport Timer 

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
  sessionsDisplay.textContent = sessions;
  statusDisplay.textContent = mode === 'work' ? 'Travail' : (mode === 'short_break' ? 'Pause courte' : 'Pause longue');
}

function switchMode() {
  beep.currentTime = 0;
  beep.play().catch(() => {
    console.warn('Son bloqué par le navigateur — l’utilisateur doit interagir avec la page.');
  });

  if (mode === 'work') {
    sessions++;
    sessionCounter++;
    localStorage.setItem('sessions', sessions);
    mode = (sessions % 4 === 0) ? 'long_break' : 'short_break';
    timeLeft = (mode === 'long_break') ? LONG_BREAK : SHORT_BREAK;
  } else {
    mode = 'work';
    timeLeft = WORK_TIME;
  }
  updateDisplay();
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    clearInterval(timer);
    isRunning = false;
    startStopBtn.textContent = 'Démarrer';
    switchMode();

    if (autoPlay && sessionCounter < autoPlayLimit) {
      timer = setInterval(tick, 1000);
      isRunning = true;
      startStopBtn.textContent = 'Pause';
    }
  }
}

function startStopTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    startStopBtn.textContent = 'Démarrer';
  } else {
    timer = setInterval(tick, 1000);
    isRunning = true;
    startStopBtn.textContent = 'Pause';
  }
}

function saveConfig() {
  workMinutes = parseFloat(workInput.value);
  shortBreakMinutes = parseFloat(shortBreakInput.value);
  longBreakMinutes = parseFloat(longBreakInput.value);
  autoPlay = autoPlayToggle.checked;
  autoPlayLimit = parseInt(autoPlayLimitInput.value);

  localStorage.setItem('workMinutes', workMinutes);
  localStorage.setItem('shortBreakMinutes', shortBreakMinutes);
  localStorage.setItem('longBreakMinutes', longBreakMinutes);
  localStorage.setItem('autoPlay', autoPlay);
  localStorage.setItem('autoPlayLimit', autoPlayLimit);

  WORK_TIME = Math.round(workMinutes * 60);
  SHORT_BREAK = Math.round(shortBreakMinutes * 60);
  LONG_BREAK = Math.round(longBreakMinutes * 60);

  if (!isRunning) {
    timeLeft = (mode === 'work') ? WORK_TIME : (mode === 'short_break' ? SHORT_BREAK : LONG_BREAK);
    updateDisplay();
  }
}

startStopBtn.addEventListener('click', startStopTimer);
saveConfigBtn.addEventListener('click', saveConfig);

window.addEventListener('beforeunload', () => {
  localStorage.setItem('timeLeft', timeLeft);
  localStorage.setItem('mode', mode);
});

window.addEventListener('load', () => {
  const savedTime = parseInt(localStorage.getItem('timeLeft'));
  const savedMode = localStorage.getItem('mode');
  if (!isNaN(savedTime)) timeLeft = savedTime;
  if (savedMode) mode = savedMode;

  workInput.value = workMinutes;
  shortBreakInput.value = shortBreakMinutes;
  longBreakInput.value = longBreakMinutes;
  autoPlayToggle.checked = autoPlay;
  autoPlayLimitInput.value = autoPlayLimit;

  updateDisplay();
});

// TODOLIST

const newTaskInput = document.querySelector("#new-task input");
const tasksDiv = document.querySelector("#tasks");
const clearAllBtn = document.querySelector("#clear-all"); // bouton à ajouter dans ton HTML
let updateNote = "";
let count;

window.onload = () => {
  updateNote = "";
  count = Object.keys(localStorage).length;
  displayTasks();
};

const displayTasks = () => {
  const keys = Object.keys(localStorage);
  if (keys.length > 0) {
    tasksDiv.style.display = "inline-block";
  } else {
    tasksDiv.style.display = "none";
  }

  tasksDiv.innerHTML = "";

  const sorted = keys.sort((a, b) => parseInt(a) - parseInt(b));

  for (let key of sorted) {
    let value = localStorage.getItem(key);
    let taskInnerDiv = document.createElement("div");
    taskInnerDiv.classList.add("task");
    taskInnerDiv.setAttribute("id", key);

    const span = document.createElement("span");
    span.id = "taskname";
    span.textContent = key.split("_").slice(1).join("_");
    taskInnerDiv.appendChild(span);

    let editButton = document.createElement("button");
    editButton.classList.add("edit");
    editButton.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    if (!JSON.parse(value)) {
      editButton.style.visibility = "visible";
    } else {
      editButton.style.visibility = "hidden";
      taskInnerDiv.classList.add("completed");
    }
    taskInnerDiv.appendChild(editButton);

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    taskInnerDiv.appendChild(deleteButton);

    tasksDiv.appendChild(taskInnerDiv);

    // événements à l’intérieur de la boucle pour garder le contexte
    taskInnerDiv.addEventListener("click", () => {
      const idParts = key.split("_");
      const index = idParts[0];
      const value = idParts.slice(1).join("_");
      const isCompleted = taskInnerDiv.classList.contains("completed");
      updateStorage(index, value, !isCompleted);
    });

    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      disableButtons(true);
      newTaskInput.value = span.textContent;
      updateNote = key;
      taskInnerDiv.remove();
    });

    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      removeTask(key);
    });
  }
};

const disableButtons = (bool) => {
  const editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((btn) => (btn.disabled = bool));
};

const removeTask = (taskKey) => {
  localStorage.removeItem(taskKey);
  displayTasks();
};

const updateStorage = (index, taskValue, completed) => {
  localStorage.setItem(`${index}_${taskValue}`, completed);
  displayTasks();
};

document.querySelector("#push").addEventListener("click", () => {
  disableButtons(false);
  const task = newTaskInput.value.trim();
  if (task.length === 0) return alert("Veuillez entrer une tâche");

  if (updateNote === "") {
    updateStorage(count, task, false);
    count++;
  } else {
    let existingCount = updateNote.split("_")[0];
    removeTask(updateNote);
    updateStorage(existingCount, task, false);
    updateNote = "";
  }
  newTaskInput.value = "";
});

// Bouton pour vider toute la liste
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Tout supprimer ?")) {
      localStorage.clear();
      count = 0;
      displayTasks();
    }
  });
}