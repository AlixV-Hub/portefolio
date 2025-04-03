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
