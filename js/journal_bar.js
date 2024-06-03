var data = [{"journal":"IEEE access","count_elite":2003,"count_not_elite":5305},{"journal":"Lecture notes in computer science","count_elite":1972,"count_not_elite":2591},{"journal":"Proceedings of the AAAI Conference on Artificial Intelligence","count_elite":1786,"count_not_elite":1973},{"journal":"Scientific reports","count_elite":1370,"count_not_elite":2317},{"journal":"Bioinformatics","count_elite":1323,"count_not_elite":1278},{"journal":"PloS one","count_elite":1323,"count_not_elite":2198},{"journal":"Remote sensing","count_elite":816,"count_not_elite":1691},{"journal":"Sensors","count_elite":813,"count_not_elite":2649}];

// Initialize dimensions
var margin = {top: 20, right: 50, bottom: 180, left: 40}; // Adjust bottom margin for rotated text

function drawChart() {
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#journal-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .html(""); // Clear previous contents

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.map(function(d) { return d.journal; }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) { return Math.max(d.count_elite, d.count_not_elite); })]);

    var xAxis = g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-35)"); // Rotate text by -45 degrees

    var yAxis = g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    var tooltip = d3.select("body").append("div").attr("class", "tooltip");

    g.selectAll(".bar.elite")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar elite")
        .style("fill", "#F93E52")
        .attr("x", function(d) { return x(d.journal); })
        .attr("width", x.bandwidth() / 2)
        .attr("y", function(d) { return y(d.count_elite); })
        .attr("height", function(d) { return height - y(d.count_elite); })
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Elite: " + d.count_elite)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    g.selectAll(".bar.not_elite")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar not_elite")
        .style("fill", "#81E0FE")
        .attr("x", function(d) { return x(d.journal) + x.bandwidth() / 2; })
        .attr("width", x.bandwidth() / 2)
        .attr("y", function(d) { return y(d.count_not_elite); })
        .attr("height", function(d) { return height - y(d.count_not_elite); })
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Not Elite: " + d.count_not_elite)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 150) + "," + 10 + ")");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", "#F93E52");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text("Elite Authors")
        .attr("fill", "white");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", "#81E0FE");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .attr("dy", ".35em")
        .text("Non-Elite Authors")
        .attr("fill", "white");
}

// Initial draw
drawChart();

// Listen to resize events
window.addEventListener('resize', drawChart);