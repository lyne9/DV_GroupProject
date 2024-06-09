var margin_nonelite = { top: 50, right: 50, bottom: 50, left: 50 };
var width_nonelite = 900 - margin_nonelite.left - margin_nonelite.right;
var height_nonelite = 900 - margin_nonelite.top - margin_nonelite.bottom;

var color_nonelite = d3.scaleOrdinal(d3.schemeCategory10);

// Create SVG element and set dimensions
const svg_nonelite = d3.select("#chart2").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${1000} ${1000}`);

// Load the graph data from JSON file
d3.json("data/non_elite_graph_data.json").then(function(graph) {
    const clusterData = {};
    graph.nodes.forEach(node => {
        // Group nodes by their cluster (group)
        if (!clusterData[node.group]) {
            clusterData[node.group] = { nodes: [], group: node.group };
        }
        clusterData[node.group].nodes.push(node);
    });

    // Create link elements
    const link = svg_nonelite.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", d => Math.sqrt(d.weight))
        .attr("stroke", "#999");

    // Create node elements
    const node = svg_nonelite.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g");

    node.append("circle")
        .attr("r", 5)
        .attr("fill", d => color_nonelite(d.group))
        .attr("fill-opacity", (d, i, nodes) => 0.6 + (i / nodes.length) * 0.4);

    node.append("title")
        .text(d => d.id);

    // Setup force simulation
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.index).distance(135).strength(link => link.source.group === link.target.group ? 1 : 0.1))
        .force("charge", d3.forceManyBody().strength(-100))  // Repulsive force to spread nodes
        .force("center", d3.forceCenter(width_nonelite / 2, height_nonelite / 2))
        .force("collision", d3.forceCollide().radius(20))  // Collision force to avoid overlap
        .on("tick", ticked);

    function ticked() {
        const centroids = {};
        const coords = {};

        // Calculate centroids for each cluster
        graph.nodes.forEach(node => {
            if (!coords[node.group]) {
                coords[node.group] = [];
            }
            coords[node.group].push(node);
        });

        for (const group in coords) {
            const groupNodes = coords[group];
            const n = groupNodes.length;
            let cx = 0;
            let cy = 0;

            groupNodes.forEach(node => {
                cx += node.x;
                cy += node.y;
            });

            centroids[group] = { x: cx / n, y: cy / n };
        }

        const minDistance = 20;

        // Adjust node positions to be closer to their cluster centroid
        graph.nodes.forEach(node => {
            const centroid = centroids[node.group];
            const dx = centroid.x - node.x;
            const dy = centroid.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > minDistance) {
                node.x = node.x * 0.9 + centroid.x * 0.1;
                node.y = node.y * 0.9 + centroid.y * 0.1;
            }
        });

        // Update link positions
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        // Update node positions
        node
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Update cluster positions
        clusters
            .attr("cx", d => d3.mean(d.nodes, n => n.x))
            .attr("cy", d => d3.mean(d.nodes, n => n.y));

        // Update cluster labels
        updateClusterLabels();
    }

    // Draw cluster circles
    const clusters = svg_nonelite.append("g")
        .attr("class", "clusters")
        .selectAll("ellipse")
        .data(Object.values(clusterData))
        .enter().append("ellipse")
        .attr("cx", d => d3.mean(d.nodes, n => n.x))
        .attr("cy", d => d3.mean(d.nodes, n => n.y))
        .attr("rx", d => Math.sqrt(d.nodes.length) * 30) // Radius based on number of nodes
        .attr("ry", d => Math.sqrt(d.nodes.length) * 20)  // Radius based on number of nodes
        .attr("fill", d => color_nonelite(d.group))
        .attr("fill-opacity", 0.1)
        .attr("stroke", d => color_nonelite(d.group))
        .attr("stroke-width", 2);

    function updateClusterLabels() {
        // Remove existing labels and backgrounds
        svg_nonelite.selectAll("text.cluster-label").remove();
        svg_nonelite.selectAll("rect.cluster-label-bg").remove();

        // Add cluster labels
        const labels = svg_nonelite.selectAll("text.cluster-label")
            .data(Object.values(clusterData))
            .enter()
            .append("text")
            .attr("class", "cluster-label")
            .attr("x", d => d3.mean(d.nodes, n => n.x))
            .attr("y", d => d3.mean(d.nodes, n => n.y))
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("fill", d => color_nonelite(d.group))
            .text(d => {
                const topNodes = d.nodes.slice(0, 3).map(node => node.id); // Top 3 keywords
                return topNodes.join(", ");
            });

        // Add background rectangles for labels
        labels.each(function(d) {
            const bbox = this.getBBox();
            svg_nonelite.insert("rect", ".cluster-label")
                .attr("class", "cluster-label-bg")
                .attr("x", bbox.x - 5)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 10)
                .attr("height", bbox.height + 4)
                .style("fill", "white");
        });
    }

    // Run the simulation and update the positions
    simulation.on("tick", () => {
        ticked();
        updateClusterLabels();
    });
});
