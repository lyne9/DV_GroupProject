async function fetchData() {
    try {
        const dataResponse = await fetch('./data/au_nodes.json');
        const publicationsResponse = await fetch('./data/au_edges.json');

        if (!dataResponse.ok || !publicationsResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await dataResponse.json();
        const publications = await publicationsResponse.json();
        return { data, publications };
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function preprocessData(data, publications) {
    const nodes = {};
    const links = [];

    // Initialize nodes
    data.forEach(d => {
        nodes[d.author_id] = { id: d.author_id, name: d.author_name, elite: d.author_is_elite, degree: 0 };
    });

    // Calculate node degrees and create links
    publications.forEach(pub => {
        pub.forEach((author, index) => {
            for (let i = 0; i < pub.length; i++) {
                if (i !== index) {
                    if (!nodes[author]) continue;
                    if (!nodes[pub[i]]) continue;
                    nodes[author].degree++;
                    links.push({ source: author, target: pub[i] });
                }
            }
        });
    });

    return { nodes: Object.values(nodes), links };
}

function drawChart(nodes, links) {
    const svg = d3.select("#network-chart");
    const width = Math.min(window.innerWidth - 150, 1200);
    const height = window.innerHeight - 150;

    svg.attr("width", width).attr("height", height);

    // Clear previous chart content
    svg.selectAll("*").remove();

    const container = svg.append("g");

    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
            container.attr("transform", event.transform);
        });

    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-30))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(15));

    const link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const node = container.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", d => d.elite ? "node elite" : "node non-elite")
        .attr("r", 5)
        .on("mouseover", function (event, d) {
            d3.select(this).select("title").remove();
            d3.select(this).append("title").text(`Degree: ${d.degree}`);
        })
        .on("mouseout", function () {
            d3.select(this).select("title").remove();
        });

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Manually stop the simulation after a set time
    setTimeout(() => {
        simulation.stop();

        const bounds = container.node().getBBox();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        const scale = Math.min(width / fullWidth, height / fullHeight) * 2; // Scale to fit the entire content
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }, 10000); // Adjust the timeout duration as necessary

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20,20)");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 150)
        .attr("height", 50)
        .attr("fill", "white")
        .attr("stroke", "black");

    legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 15)
        .attr("r", 6)
        .attr("class", "node elite");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .text("精英作者");

    legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 35)
        .attr("r", 6)
        .attr("class", "node non-elite");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .text("非精英作者");
}

function updateChart() {
    // Show loading message
    const loadingMessage = document.getElementById("loading-message");
    loadingMessage.style.display = "block";

    fetchData().then(({ data, publications }) => {
        if (data && publications) {
            const { nodes, links } = preprocessData(data, publications);
            drawChart(nodes, links);

            let countdown = 10; // seconds
            const countdownInterval = setInterval(() => {
                if (countdown > 0) {
                    console.log("Countdown:", countdown);
                    countdown--;
                } else {
                    clearInterval(countdownInterval);
                    console.log("Simulation ended");

                    // Hide loading message
                    loadingMessage.style.display = "none";
                }
            }, 1000); // 1 second interval

            // Check if the simulation has ended
            const checkCompletion = () => {
                if (countdown <= 0) {
                    clearInterval(checkCompletionInterval);
                    console.log("Chart rendering completed");

                    // Hide loading message
                    loadingMessage.style.display = "none";
                }
            };

            const checkCompletionInterval = setInterval(checkCompletion, 1000); // Check every second
        }
    });
}

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.addEventListener('resize', debounce(updateChart, 500));

updateChart();
