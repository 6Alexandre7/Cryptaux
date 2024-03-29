import {fetchHistoricData, fetchCryptocurrency, fillThumbnailElement} from './FavThumbnail.js';
import {fetchFavsList, favsManager} from './FavsManagerHeart.js';
import {fetchCryptoCurrenciesPrices} from './LivePrice.js';


// Récupérer la grille
const gridElement = document.querySelector(".container-thumbnail-currency");
const gridComputedStyle = window.getComputedStyle(gridElement);

// Récupérer toutes les thumbnails
const allThumbnails = document.getElementsByClassName('thumbnail-currency');

// Tableau pour les cryptomonnaies célèbres
const cryptocurrencyTrendingTableau = document.getElementById('cryptocurrency-trending-body');

var favsList = await fetchFavsList();

window.addEventListener('resize', function() {
   hideThumbnails();
});

// Créer les éléments de thumbnails
createFavsElement(favsList);

// Requête pour la liste des monnaies célèbres
fetchTrendingCryptocurrency();


/* Fonction qui créer les éléments HTML pour les thumbnails */
async function createFavsElement(favsList) {
   gridElement.innerHTML = '';
   if (favsList != '') {
      favsList.forEach(fav => {
         fav = fav.split(",");
         let id = fav[0];
         let symbol = fav[1];

         // Créer l'élément HTML
         gridElement.innerHTML += `
         <div class='thumbnail-currency thumbnail-hide' id='${id}' style='visibility: hidden; display: none;'>
            <div class='info-currency'>
               <img class='info-currency-image' src='' alt='${id}' crossorigin='anonymous'>
               <div>
                  <div class='info-currency-price-wrapper'>
                     <p class='fav-price'></p>
                     <div class='fav-taux-wrapper'>
                        <i class="bi bi-caret-up-fill"></i>
                        <p class='fav-taux'></p>
                     </div>
                  </div>
               <div class='fav-name-wrapper'></div>
               </div>
            </div>
            <canvas class='fav-chart'></canvas>
         </div>
         `;
      });

      // Fonction qui affiche et cache les thumbnails 
      hideThumbnails();
   }
   else {
      gridElement.innerHTML = `
         <p>Vous n'avez pas de fav's ✨</p>
      `;
   }
}


/* Foncton qui gère l'affichage des thumbnails et fait les requêtes */
async function hideThumbnails() {
   // Compter le nombre de colonne de thumbnails
   var gridColonneCount = gridComputedStyle.getPropertyValue("grid-template-columns").split(" ").length-1;
   
   // Récupérer toutes les informations pour tous les fav's
   var favsRequest = await fetchCryptoCurrenciesPrices();

   for (let i = 0; i < allThumbnails.length; i++) {
      var thumbnail = allThumbnails[i];
      var thumbnailId = thumbnail.id;

      // La thumbnail se situe sur la première ligne
      if (i <= gridColonneCount) {
         thumbnail.style.display = "block";
         // La thumbnail n'est pas encore affichée mais elle doit l'être
         if (thumbnail.style.display != "none" && thumbnail.classList.contains("thumbnail-hide")) {
            thumbnail.classList.remove("thumbnail-hide");
            
            // Remplir la thumbnail avec les données récupérées
            fillThumbnailElement(favsRequest[thumbnailId], thumbnail);
         }
      }
      else {
         thumbnail.style.display = "none";
      }
   }
}


/* Fonction qui récupère les crypto-monnaies célèbres */
function fetchTrendingCryptocurrency() {
   var URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d';
  
   // Récupérer les données des crypto-monnaies depuis le sessionStorage
   var trendingResponse = sessionStorage.getItem('Trending-Cryptocurrencies-Data');
   

   // Les monnaies se trouvent dans le localStorage
   if (trendingResponse != null) {
      trendingResponse = JSON.parse(trendingResponse);
      
      
      // Calculer le temps depuis la dernière mise à jour
      var timeNow = new Date();
      var timeStampLastRequest = trendingResponse['timestamp'];
      var timeDiff = timeNow - timeStampLastRequest;
      var timeDiffMinutes = Math.round(timeDiff / 60000);
      
      // Si la requête a été effectuée il y a moins de 1 minute, on retourne les données
      if (timeDiffMinutes < 1) {
         // Parcourir le dictionnaire pour créer les éléments HTML
         for (var [key, element] of Object.entries(trendingResponse)) {
            createTrendingElement(element);
         }
      }
      else {
         // On supprime les données de la requête précédente
         sessionStorage.removeItem('Trending-Cryptocurrencies-Data');
         // On effectue une nouvelle requête
         fetchTrendingCryptocurrency();
      }
   }
   else {
      fetch(URL)
         .then(response => {
            console.log("Requête");
            if (response.ok) {
               response.json().then(response => {

                  // Transformer le tableau en dictionnaire
                  trendingResponse = {};
                  for (var i = 0; i < response.length; i++) {
                     trendingResponse[response[i]['id']] = response[i];
                  }
                  // Ajouter un timestamp pour savoir quand les données ont été récupérées
                  trendingResponse['timestamp'] = new Date().getTime();
                  // Sauvegarder les données dans le sessionStorage
                  sessionStorage.setItem('Trending-Cryptocurrencies-Data', JSON.stringify(trendingResponse));

                  // Parcourir le dictionnaire pour créer les éléments HTML
                  for (var [key, element] of Object.entries(trendingResponse)) {
                     if (key != 'timestamp') {
                        createTrendingElement(element);
                     }
                  }
               })
            }
            else{
               console.error(`Impossible d'accéder à l'Api CoinGecko [${URL}]`);
               return;
            }
         })
         .catch((error) => {
            console.error(`Impossible d'accéder à l'Api CoinGecko [${URL}] : ${error}`);
            return;
         });
   }
}
   
/* Fonction qui créer le tableau */
async function createTrendingElement(cryptocurrency) {
   let cryptocurrencyTrendingLigne = document.createElement('tr');
   cryptocurrencyTrendingLigne.onclick = function() {
      // Ouvrir la page de la monnaie en personnalisant l'URL
      window.open(`cryptocurrency.php?name=${cryptocurrency['name']}&id=${cryptocurrency['id']}`, "_self");
   }

   let trendingScoreColumn = document.createElement('td');
   let cryptocurrencyFavsButton = document.createElement('i');
   if (favsList.includes(`${cryptocurrency['id']},${cryptocurrency['symbol']}`)) {
      cryptocurrencyFavsButton.classList.add('fav-button', 'fav-button-selected', 'bi', 'bi-suit-heart-fill');
   }
   else {
      cryptocurrencyFavsButton.classList.add('fav-button', 'bi', 'bi-suit-heart');
   }

   cryptocurrencyFavsButton.addEventListener('mouseover', function() {
      // Empêcher le clique d'ouvrir la page d'informations sur la cryptomonnaie
      cryptocurrencyTrendingLigne.onclick = null;
   });
   cryptocurrencyFavsButton.addEventListener('mouseout', function() {
      cryptocurrencyTrendingLigne.onclick = function() {
         // Ouvrir la page de la monnaie en personnalisant l'URL
         window.open(`cryptocurrency.php?name=${cryptocurrency['name']}&id=${cryptocurrency['id']}`, "_self");
      }
   });
   cryptocurrencyFavsButton.onclick = async function() {
      // Supprimer les données de la requête précédente
      sessionStorage.removeItem('Trending-Cryptocurrencies-Data');
      sessionStorage.removeItem('Cryptocurrencies-Data');

      fetchTrendingCryptocurrency();

      // Actualiser la liste des fav's (et changer l'icone)
      let favsList = await favsManager(cryptocurrencyFavsButton, cryptocurrency);
      createFavsElement(favsList);
   }
   trendingScoreColumn.appendChild(cryptocurrencyFavsButton);
   cryptocurrencyTrendingLigne.appendChild(trendingScoreColumn);

   let trendingNameColumn = document.createElement('td');
   trendingNameColumn.classList.add('trending-name');
   let cryptocurrencyImage = document.createElement('img');
   cryptocurrencyImage.src = cryptocurrency['image'];
   cryptocurrencyImage.alt = cryptocurrency['name'];
   trendingNameColumn.appendChild(cryptocurrencyImage);
   let cryptocurrencyName = document.createElement('p');
   cryptocurrencyName.classList.add('cryptocurrency-name');
   cryptocurrencyName.innerHTML = cryptocurrency['name'];
   trendingNameColumn.appendChild(cryptocurrencyName);
   
   let cryptocurrencySymbol = document.createElement('p');
   cryptocurrencySymbol.classList.add('cryptocurrency-symbol');
   cryptocurrencySymbol.innerHTML = cryptocurrency['symbol'].toUpperCase();
   trendingNameColumn.appendChild(cryptocurrencySymbol);
   cryptocurrencyTrendingLigne.appendChild(trendingNameColumn);
   
   let trendingPriceColumn = document.createElement('td');
   let cryptocurrencyPrice = cryptocurrency['current_price'].toString().replace('.', ',');
   trendingPriceColumn.innerHTML = `${cryptocurrencyPrice} $`;
   cryptocurrencyTrendingLigne.appendChild(trendingPriceColumn);
   
   let trendingChange1hColumnWrapper = document.createElement('td');
   let trendingChange1hColumn = document.createElement('div');
   trendingChange1hColumn.classList.add('trending-change-column');
   if (cryptocurrency['price_change_percentage_1h_in_currency'] > 0) {
      trendingChange1hColumn.innerHTML = "<i class='bi bi-arrow-up-right'></i>";
      trendingChange1hColumn.classList.add('positive-pourcentage');
   } else {
      trendingChange1hColumn.innerHTML = "<i class='bi bi-arrow-down-left'></i>";
      trendingChange1hColumn.classList.add('negative-pourcentage');
   }
   let cryptocurrencyChange1h = cryptocurrency['price_change_percentage_1h_in_currency'].toFixed(2).replace('.', ',').replace('-', '');
   trendingChange1hColumn.innerHTML += `<p>${cryptocurrencyChange1h} %</p>`;
   trendingChange1hColumnWrapper.appendChild(trendingChange1hColumn);
   cryptocurrencyTrendingLigne.appendChild(trendingChange1hColumnWrapper);

   let trendingChange24hColumnWrapper = document.createElement('td');
   let trendingChange24hColumn = document.createElement('div');
   trendingChange24hColumn.classList.add('trending-change-column');
   if (cryptocurrency['price_change_percentage_24h_in_currency'] > 0) {
      trendingChange24hColumn.innerHTML = "<i class='bi bi-arrow-up-right'></i>";
      trendingChange24hColumn.classList.add('positive-pourcentage');
   } else {
      trendingChange24hColumn.innerHTML = "<i class='bi bi-arrow-down-left'></i>";
      trendingChange24hColumn.classList.add('negative-pourcentage');
   }
   let cryptocurrencyChange24h = cryptocurrency['price_change_percentage_24h_in_currency'].toFixed(2).replace('.', ',').replace('-', '');
   trendingChange24hColumn.innerHTML += `<p>${cryptocurrencyChange24h} %</p>`;
   trendingChange24hColumnWrapper.appendChild(trendingChange24hColumn);
   cryptocurrencyTrendingLigne.appendChild(trendingChange24hColumnWrapper);

   let trendingChange7dColumnWrapper = document.createElement('td');
   let trendingChange7dColumn = document.createElement('div');
   trendingChange7dColumn.classList.add('trending-change-column');
   if (cryptocurrency['price_change_percentage_7d_in_currency'] > 0) {
      trendingChange7dColumn.innerHTML = "<i class='bi bi-arrow-up-right'></i>";
      trendingChange7dColumn.classList.add('positive-pourcentage');
   } else {
      trendingChange7dColumn.innerHTML = "<i class='bi bi-arrow-down-left'></i>";
      trendingChange7dColumn.classList.add('negative-pourcentage');
   }
   let cryptocurrencyChange7d;
   if (cryptocurrency['price_change_percentage_7d_in_currency'] == null) {
      cryptocurrencyChange7d = cryptocurrency['price_change_percentage_7d_in_currency'] = '--';
   } else {
      cryptocurrencyChange7d = cryptocurrency['price_change_percentage_7d_in_currency'].toFixed(2).replace('.', ',').replace('-', '');
   }
   trendingChange7dColumn.innerHTML += `<p>${cryptocurrencyChange7d} %</p>`;
   trendingChange7dColumnWrapper.appendChild(trendingChange7dColumn);
   cryptocurrencyTrendingLigne.appendChild(trendingChange7dColumnWrapper);

   cryptocurrencyTrendingTableau.appendChild(cryptocurrencyTrendingLigne);
}


function createChart(element, data, legende) {
   const myChart = new Chart(element, {
      type: 'line',
      data: {
         labels: legende,
         datasets: [{
            label: '',
            data: data,
            fill: false,
            backgroundColor : 'rgba(20, 20, 20, 0.1)', // Si fill=true
            borderColor: 'rgba(20, 20, 20, 0.3)', // Couleur de la ligne
            tension: 0.3
         }]
      },
      options: {
         maintainAspectRatio: false,
         scales: {
            x: {
               ticks: {
                  display: false // Graduation axe
               },
               grid: {
                  color: 'transparent',
                  borderColor: 'transparent'
               }
            },
            y: {
               ticks: {
                  display: false, // Graduation axe
               },
               beginAtZero: false,
               grid: {
                  color: 'transparent',
                  borderColor: 'transparent'
               }
            }
         },
         elements: {
            point:{
               radius: 0
            }
         },
         plugins: {
            legend: {
               display: false 
            }
         },
         layout: {
            padding: {
               top: 10,
               left: -10,
               bottom: -10
            }
         }
      }
   });
}