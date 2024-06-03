// Function to initialize the map
function initializeMap() {
    // Center the map at latitude 20, longitude 0 and set zoom level range
    var map = L.map('map-chart', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2  // Set the minimum zoom level
    });

    // Add a dark mode tile layer to the map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    return map;
}

// Function to process CSV data and create heatmap
function createHeatmap(map) {
    // Load CSV data
    d3.csv("data/institution_size.csv").then(function(data) {
        // Prepare the heatmap data
        var heatData = [];
        data.forEach(function(d) {
            var intensity = +d.number_of_authors / 10;  // Initialize intensity based on the number of authors
            if (d.is_elite === "1") {
                intensity = +d.number_of_authors;  // Multiply the intensity for elite authors
            }
            heatData.push([+d.latitude, +d.longitude, intensity]);  // Add data point with latitude, longitude, and intensity
        });

        // Create the heatmap layer
        L.heatLayer(heatData, {
            radius: 5,  // Adjust radius as needed
            blur: 8,    // Adjust blur as needed
            maxZoom: 10  // Adjust max zoom as needed
        }).addTo(map);
    });
}

// Initialize the map
var map = initializeMap();

// Create heatmap
createHeatmap(map);
