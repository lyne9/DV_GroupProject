// Function to update the institution selection box based on country selection
function updateInstitutionSelect(country, data) {
    // Filter data based on selected country
    var filteredData = data.filter(d => d.country === country || country === "All");

    // Extract unique institution names
    var institutions = [...new Set(filteredData.map(d => d.author_institution))];

    // Populate select box with institution options
    const institutionSelect = document.getElementById('institution-select');

    institutions.forEach(institution => {
        const option = document.createElement('option');
        option.value = institution;
        option.textContent = institution;
        institutionSelect.appendChild(option);
    });
}

// Function to render bar chart with transitions and hover functionality
function renderBarChart(eliteCount, nonEliteCount) {
    // Select the container element
    var container = d3.select("#institution-bar");

    // Set up margins
    var margin = { top: 100, right: 30, bottom: 50, left: 80 };

    // Get container dimensions
    var containerWidth = container.node().getBoundingClientRect().width;
    var containerHeight = 500; // Set a default height

    // Calculate chart dimensions
    var width = containerWidth - margin.left - margin.right;
    var height = containerHeight - margin.top - margin.bottom;

    // Create SVG element
    var svg = container
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(["精英", "非精英"]);

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, Math.max(eliteCount, nonEliteCount)]);

    // Add bars
    svg.selectAll(".bar")
        .data([{ type: "精英", count: eliteCount }, { type: "非精英", count: nonEliteCount }])
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.type))
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .style("fill", d => d.type === "精英" ? "#c21a09" : "#daa520")
        .on("mouseover", function(event, d) {
            // Show tooltip on hover
            var total = eliteCount + nonEliteCount;
            var percentage = total === 0 ? 0 : (d.type === "精英" ? eliteCount / total * 100 : nonEliteCount / total * 100).toFixed(2);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html((d.type === "精英" ? "精英作者百分比" : "非精英作者百分比") + ": " + percentage + "%")
                .style("left", (event.pageX-50) + "px")
                .style("top", (event.pageY-50) + "px");
        })
        .on("mouseout", function(d) {
            // Hide tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));

    // Add x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("fill", "#f8f9fa")
        .style("text-anchor", "middle")
        .text("作者数量");

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("fill", "#f8f9fa")
        .text("机构作者数量");

    // Define tooltip
    var tooltip = d3.select("#institution-bar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "black");
}


// Function to render distribution chart
function renderDistributionChart(hIndexValues) {
    // Set up chart dimensions
    var margin = { top: 100, right: 30, bottom: 50, left: 50 },
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create SVG element
    var svg = d3.select("#institution-dist")
        .selectAll("svg")
        .data([null]) // Ensure only one SVG is created
        .enter()
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales
    var x = d3.scaleLinear()
        .domain([0, d3.max(hIndexValues)])
        .range([0, width]);

    var histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20));

    // Generate histogram bins
    var bins = histogram(hIndexValues);

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    // Append bars to the chart
    var bars = svg.selectAll("rect")
        .data(bins);

    bars.enter().append("rect")
        .attr("x", function(d) { return x(d.x0); })
        .attr("y", height)
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .attr("height", 0)
        .style("fill", "steelblue")
        .on("mouseover", function(event, d) {
            // Show tooltip on hover
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("H指数: " + d.x0)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function(d) {
            // Hide tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .attr("y", function(d) { return y(d.length); })
        .attr("height", function(d) { return height - y(d.length); });

    // Update existing bars
    bars.transition()
        .duration(1000)
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .attr("y", function(d) { return y(d.length); })
        .attr("height", function(d) { return height - y(d.length); });

    // Remove bars that are no longer needed
    bars.exit()
        .transition()
        .duration(1000)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    // Add X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add reference line at H-index 31
    svg.append("line")
        .attr("x1", x(31))
        .attr("y1", 0)
        .attr("x2", x(31))
        .attr("y2", height)
        .style("stroke", "red")
        .style("stroke-dasharray", "3,3");

    // Add label for reference line
    svg.append("text")
        .attr("x", x(31))
        .attr("y", -25)
        .style("text-anchor", "middle")
        .style("fill", "red")
        .text("精英H指数>=31");

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("H指数");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("fill", "#f8f9fa")
        .style("text-anchor", "middle")
        .text("频率");
        
    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .attr("fill", "#f8f9fa")
        .text("机构作H指数分布");

    // Define tooltip
    var tooltip = d3.select("#institution-dist")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "black");
}

// Function to render table
function renderTable(data) {

    data.sort((a, b) => b.h_index - a.h_index);
    data.forEach(d => {
        d.is_elite = d.is_elite === '1' ? '是' : '否';
    });

    // Select the table div and clear previous table
    const tableDiv = d3.select('#author-table');
    tableDiv.html('');

    // Create table
    const table = tableDiv.append('table');

    // Append table header
    const header = table.append('thead').append('tr');
    header.append('th').text('作者OpenAlex ID');
    header.append('th').text('作者名字');
    header.append('th').text('H指数');
    header.append('th').text('是否是精英');

    // Append table body
    const tbody = table.append('tbody');

    // Populate table rows
    data.forEach(d => {
        const row = tbody.append('tr');
        row.append('td').text(d.author_id);
        row.append('td').text(d.author_name);
        row.append('td').text(d.h_index);
        row.append('td').text(d.is_elite);
    });
}

// Load CSV files using D3.js
Promise.all([
    d3.csv("data/institution_size_verify_coors.csv"),
    d3.csv("data/authors_hindex_with_verify_coords.csv")
]).then(function(files) {
    var institutionData = files[0];
    var hIndexData = files[1];

    // Initial population of institution selection box with all institutions
    updateInstitutionSelect("All", institutionData);

    // Add event listener to country select box
    d3.select("#country-select").on("change", function() {
        var selectedCountry = this.value;

        // Clear existing options in the select box
        d3.select("#institution-select").selectAll("option:not(:first-child)").remove();

        // Update institution selection box
        updateInstitutionSelect(selectedCountry, institutionData);

        // Remove existing charts
        d3.select("#institution-bar svg").remove();
        d3.select("#institution-dist svg").remove();

        // Select the table div and clear previous table
        const tableDiv = d3.select('#author-table');
        tableDiv.html('');
    });

    // Add event listener to institution selection box
    d3.select("#institution-select").on("change", function() {
        // Remove existing charts
        d3.select("#institution-bar svg").remove();
        d3.select("#institution-dist svg").remove();

        // Select the table div and clear previous table
        const tableDiv = d3.select('#author-table');
        tableDiv.html('');

        var selectedInstitution = this.value;

        // Filter data based on selected institution
        var filteredData = hIndexData.filter(d => d.author_institution === selectedInstitution);

        // Extract h-index values
        var hIndexValues = filteredData.map(d => +d.h_index);
        console.log(hIndexValues)

        // Render distribution chart
        renderDistributionChart(hIndexValues);

        // Filter data based on selected institution
        var filteredDataNum = institutionData.filter(d => d.author_institution === selectedInstitution);

        // Calculate counts of elite and non-elite authors
        var eliteCount = d3.sum(filteredDataNum, d => d.is_elite === "1" ? +d.number_of_authors : 0);
        var nonEliteCount = d3.sum(filteredDataNum, d => d.is_elite === "0" ? +d.number_of_authors : 0);

        // Render bar chart with transitions
        renderBarChart(eliteCount, nonEliteCount);

        // Filter data based on selected institution
        var filteredDataAuthor = hIndexData.filter(d => d.author_institution === selectedInstitution);
        renderTable(filteredDataAuthor);
    });
});

