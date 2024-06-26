/*  
Thing to consider: Each filter acts separately. Might want to think about how to use multiples. (But generally speaking, this works now.)
*/

const mapContainer = document.getElementById('map');
const legendContainer = document.getElementById('legend');

// Crear un mapa con Leaflet
var map = L.map('map').setView([-1.5616, -78.8226], 7);

// Añadir un mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 25,
}).addTo(map);

let allMarkers = [];

// Obtener los datos del archivo JSON
fetch('https://raw.githubusercontent.com/pamela-chacon/Datasets/main/3oei9-cjvvb.json')
  .then(response => response.json())
  .then(data => {
  	
    const communityNames = [...new Set(data.map(point => point.community_name))];
    const countries = [...new Set(data.map(point => point.country))];
    createCommunityDropdown(communityNames, countries);

    // Guardar los datos para poder usarlos en las funciones posteriores
    communityData = data;
    
    // Iterar sobre los datos y añadir marcadores al mapa
    data.forEach(point => {
   
      let iconUrl = 'https://raw.githubusercontent.com/pamela-chacon/Picture/main/black.png'; // URL del ícono predeterminado


      // Cambiar URL del ícono basado en los valores de point.wave
      if (point.wave === "1") {
        iconUrl = 'https://raw.githubusercontent.com/pamela-chacon/Picture/main/red.png'; // URL del ícono rojo
      } else if (point.wave === "2") {
        iconUrl = 'https://raw.githubusercontent.com/pamela-chacon/Picture/main/blue.png'; // URL del ícono verde
      } else if (point.wave === "3") {
        iconUrl = 'https://raw.githubusercontent.com/pamela-chacon/Picture/main/black.png'; // URL del ícono amarillo
      } else if (point.wave === "") {
        iconUrl = 'https://raw.githubusercontent.com/pamela-chacon/Picture/main/white.png'; // URL del ícono amarillo
      }

      
      // Crear ícono personalizado
      const customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 30],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      
      const marker = L.marker([parseFloat(point.latitude), parseFloat(point.longitude)], { icon: customIcon, community: point.community_name, wave:point.wave })
        marker.addTo(map)
        .bindPopup(`Community: ${point.community_name}, Wave: ${point.wave}`); // Mostrar el nombre de la comunidad en el popup
        
         // Mostrar popup al pasar el mouse sobre el marcador
        marker.on('mouseover', function (e) {
          this.openPopup();
        });

        // Ocultar popup al quitar el mouse del marcador
        marker.on('mouseout', function (e) {
          this.closePopup();
        });
        
        allMarkers.push(marker)
         });
               
  })
  
  
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  
  
  legendContainer.innerHTML = `
  <style>
    .legend {
      text-align: left; /* Alinea el texto a la izquierda */
    }
    .legend img {
      width: 20px; /* Ajusta el ancho de las imágenes */
      height: 20px; /* Ajusta el alto de las imágenes */
      margin-right: 5px; /* Espacio entre la imagen y el texto */
      display: inline-block;
    }
  </style>
  <h4>Legend</h4>
  <ul>
    <li id="wave1" class="legend-item"><img src="https://raw.githubusercontent.com/pamela-chacon/Picture/main/red.png"> Wave 1</li>
    <li id="wave2" class="legend-item"><img src="https://raw.githubusercontent.com/pamela-chacon/Picture/main/blue.png"> Wave 2</li>
    <li id="wave3" class="legend-item"><img src="https://raw.githubusercontent.com/pamela-chacon/Picture/main/black.png"> Wave 3</li>
    <li id="notVisited" class="legend-item"><img src="https://raw.githubusercontent.com/pamela-chacon/Picture/main/white.png"> Not visited</li>
  </ul>
`;

legendContainer.classList.add('legend-right');

////new button
const showAllButton = document.createElement('button');
      showAllButton.textContent = 'Show All Communities';
      showAllButton.addEventListener('click', () => {
        // Mostrar todos los marcadores en el mapa
        allMarkers.forEach(marker => {
          marker.setOpacity(1);
        });
      });
      legendContainer.appendChild(showAllButton);

function createCommunityDropdown(communityNames, countries) {
 

  const communityDropdownHTML = `
    <div class="dropdown-item">
      <label for="community-select">Community:<p></p></label>
      <select id="community-select">
        <option value="">-- Choose a Community --</option>
        ${communityNames.map(name => `<option value="${name}">${name}</option>`).join('')}
      </select>
    </div>
  `;

  const countryDropdownHTML = `
    <div class="dropdown-item">
      <label for="country-select"><h4>Select by:</h4><p>Country:</p></label>
      <select id="country-select" onchange="updateCommunityOptions(this.value)">
        <option value="">-- Choose a Country --</option>
        ${countries.map(country => `<option value="${country}">${country}</option>`).join('')}
      </select>
    </div>
  `;

  const buttonHTML = `
    <div class="dropdown-item">
      <button onclick="filterMapByCommunity()">Go</button>
    </div>
  `;

  const dropdownHTML = countryDropdownHTML + communityDropdownHTML  + buttonHTML;

  legendContainer.insertAdjacentHTML('beforeend', dropdownHTML);
}

function updateCommunityOptions(selectedCountry) {
  const filteredCommunities = communityData.filter(point => point.country === selectedCountry);
  const communityNames = new Set(filteredCommunities.map(point => point.community_name));

  const communitySelect = document.getElementById('community-select');
  communitySelect.innerHTML = `
    <option value="">-- Choose a Community --</option>
    ${[...communityNames].map(name => `<option value="${name}">${name}</option>`).join('')}
  `;
}

let communityData = []; // Variable para almacenar los datos de las comunidades

function filterMapByCommunity() {
  const selectedCommunity = document.getElementById('community-select').value;
			allMarkers.forEach(marker => {
       
      // Verificar si el marcador pertenece a la comunidad seleccionada
      if (marker.options.community === selectedCommunity) {
        // Mostrar el marcador si pertenece a la comunidad seleccionada
        marker.setOpacity(1);

        // Centrar el mapa en las coordenadas del marcador
        map.setView(marker.getLatLng(), 10); // Ajusta el nivel de zoom (en este caso, 10)
      } else {
        // Ocultar el marcador si no pertenece a la comunidad seleccionada
        marker.setOpacity(0);
      
    }
  });
}

// Función para filtrar marcadores por tipo de wave
function filterMarkersByWave(waveType) {
  allMarkers.forEach(marker => {
    const markerWave = marker.options.wave;

    // Mostrar marcadores si coinciden con el tipo de wave seleccionado
    if (markerWave === waveType) {
      marker.setOpacity(1);
    } else {
      marker.setOpacity(0);
    }
  });
}

// Event listeners para cada tipo de wave en la leyenda
document.getElementById('wave1').addEventListener('click', () => {
  filterMarkersByWave("1");
});

document.getElementById('wave2').addEventListener('click', () => {
  filterMarkersByWave("2");
});

document.getElementById('wave3').addEventListener('click', () => {
  filterMarkersByWave("3");
});

document.getElementById('notVisited').addEventListener('click', () => {
  filterMarkersByWave(""); // Filtrar por "not visited"
});


