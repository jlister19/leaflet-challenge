const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// calculate radius of markers
function markerSize(mag) {
  return Math.sqrt(mag) ** 5;
}

// set up earthquake data layer
function createEarthquakeLayer(earthquakeData) {
    return L.geoJson(earthquakeData, {
      pointToLayer: function (feature, latLong) {
        var color = deriveColor(feature.properties.mag.toFixed(4))
        var currentMarkerProperties = {
          radius: markerSize(feature.properties.mag),
          fillColor: color,
          color: "red",
          weight: 2,
          fillOpacity: .6
        };
        return L.circleMarker(latLong, currentMarkerProperties);
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(createPopup(feature.properties));
      }
    });
  }
  
  //use magnitude to establish color
  function deriveColor(magnitude) {
    return magnitude >= 5 ? '#010606' :
      magnitude >= 4 ? '#086185' :
      magnitude >= 3 ? '#0ea99a' :
      magnitude >= 2 ? '#50f1e1' :
      magnitude >= 1 ? '#86f5ea' :
      magnitude >= 0 ? '#f3fefd' :
      '#ffffff';
  }
  
  // create popup on each earthquake 
  function createPopup(details) {
    return `
    <h4>${details.place}</h4>
    <b>Time: </b>${new Date(details.time).toLocaleString()}<br>
    <b>Magnitude: </b>${details.mag}<br>
    `;
  }
  
  //set up a legend
  function addLegend(map) {
    var legend = L.control({
      position: 'bottomright'
    });
    legend.onAdd = function (map) {
      //populate legend info
      var div = L.DomUtil.create('legend', 'legend'),
        labels = ["< 1", "1 - 2", "2 - 3", "3 - 4", "4 - 5", "5+"];
  
      div.innerHTML += `<b> Magnitude Range</b><br>`;

      const totalLegends = 6
      for (var i = 0; i < totalLegends; i++) {
        div.innerHTML += '<div><i style="background:' + deriveColor(i) + '"> </i>' + labels[i] + '</div><br>';
      }
      return div;
    }
    legend.addTo(map);
  }
      
  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }) 

  function createMap(earthquakes) {
  
    //define baseMap object to hold base layers
    var baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    }
  
    // create overlayObject to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes
    }
  
    // Create a map object
    var defaultMap = L.map("map", {
      center: [
        35.0522, -118.2437
      ],
      zoom: 6,
    layers: [street, earthquakes]
    });
  
    addLegend(defaultMap);
  
    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(defaultMap);
  }

  async function all() {
    var earthquakeData = await d3.json(url);
    var earthquakes = createEarthquakeLayer(earthquakeData);
  
    createMap(earthquakes)
  }

  all();