// Function to initialize the map
function initializeMap() {
    var map = L.map('map-chart', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    return map;
}

// Function to create the scatter plot
function createScatterPlot(map, institutions) {
    var eliteColor = '#c21a09';
    var nonEliteColor = '#daa520';
    var markersLayer = new L.LayerGroup(); // Create a new layer group for markers
    var plottedInstitutions = {}; // Object to keep track of plotted institutions

    institutions.forEach(function(d) {
        // Check if the institution has already been plotted
        if (!plottedInstitutions[d.author_institution]) {
            var color = d.is_elite === "True" ? eliteColor : nonEliteColor;
            var marker = L.circleMarker([+d.chosen_latitude, +d.chosen_longitude], {
                radius: 1,
                color: color,
                fillOpacity: 0.2
            }).addTo(markersLayer);

            marker.bindPopup(`
                <b>Institution:</b> ${d.author_institution}<br>
                <b>Country:</b> ${d.country}<br>
                <b>Coordinates:</b> ${d.chosen_latitude}, ${d.chosen_longitude}<br>
                <b>Elite Institution:</b> ${d.is_elite}
            `);

            // Mark the institution as plotted
            plottedInstitutions[d.author_institution] = true;
        }
    });

    // Add the legend
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <i style="background: ${eliteColor}"></i> 精英机构<br>
            <i style="background: ${nonEliteColor}"></i> 非精英机构
        `;
        return div;
    };
    legend.addTo(map);

    // Add markers layer to the map
    map.addLayer(markersLayer);

    return markersLayer; // Return the markers layer
}

// Function to update the map based on selected country
function updateMapByCountry(map, markersLayer, institutions) {
    var eliteColor = '#c21a09';
    var nonEliteColor = '#daa520';

    const countrySelect = document.getElementById('country-select');
    countrySelect.addEventListener('change', function () {
        const selectedCountry = this.value;
        var plottedInstitutions = {}; // Object to keep track of plotted institutions

        // Clear previous markers
        markersLayer.clearLayers();

        if (selectedCountry) {
            const countryInstitutions = institutions.filter(inst => inst.country === selectedCountry);

            if (countryInstitutions.length > 0) {
                countryInstitutions.forEach(function(d) {
                    // Check if the institution has already been plotted
                    if (!plottedInstitutions[d.author_institution]) {
                        console.log(d.is_elite)
                        var color = d.is_elite === "True" ? eliteColor : nonEliteColor;
                        var marker = L.circleMarker([+d.chosen_latitude, +d.chosen_longitude], {
                            radius: 5,
                            color: color,
                            fillOpacity: 0.5
                        }).addTo(markersLayer);

                        marker.bindPopup(`
                            <b>Institution:</b> ${d.author_institution}<br>
                            <b>Country:</b> ${d.country}<br>
                            <b>Coordinates:</b> ${d.chosen_latitude}, ${d.chosen_longitude}<br>
                            <b>Elite Institution:</b> ${d.is_elite}
                        `);

                        // Mark the institution as plotted
                        plottedInstitutions[d.author_institution] = true;
                    }
                });

                // Adjust the map view to fit the markers
                const group = new L.featureGroup(markersLayer.getLayers());
                map.fitBounds(group.getBounds());
            } else {
                // If there are no markers for the selected country, reset the map view
                map.setView([20, 0], 2);
            }
        }
    });
}


// Initialize the map
var map = initializeMap();

// Load CSV data and create the scatter plot
d3.csv("data/institution_category.csv").then(function(data) {
    const markersLayer = createScatterPlot(map, data);
    
    // Set up country selection
    const countrySelect = document.getElementById('country-select');
    const countries = [...new Set(data.map(inst => inst.country))].sort();

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });

    // Update the map when a country is selected
    updateMapByCountry(map, markersLayer, data);
});
