const BOTTOM_PADDING_ELITE = 100; 
const LEFT_PADDING_ELITE = 50;
const RIGHT_PADDING_ELITE = 50;
const TOP_PADDING_ELITE = 50;

const HEIGHT_ELITE = 500;
const WIDTH_ELITE = 500;

const usableHeightElite = HEIGHT_ELITE - TOP_PADDING_ELITE - BOTTOM_PADDING_ELITE;
const usableWidthElite = WIDTH_ELITE - LEFT_PADDING_ELITE - RIGHT_PADDING_ELITE;

const colorScaleElite = d3.scaleOrdinal(d3.schemePaired);

d3.json("data/elite_graph_data.json").then(function(data) {
    const nodesElite = data.nodes;

    const groupCountsElite = Array.from(d3.rollup(
        nodesElite,
        v => v.length,
        d => d.group
    ), ([key, value]) => ({ key, value }));

    const barPaddingElite = Math.ceil(30 / groupCountsElite.length);

    const barWidthElite = usableWidthElite / groupCountsElite.length;

    const xScaleElite = d3
        .scaleLinear()
        .domain([0, groupCountsElite.length])
        .range([LEFT_PADDING_ELITE, LEFT_PADDING_ELITE + usableWidthElite]);

    const maxElite = d3.max(groupCountsElite, d => d.value);
    const yScaleElite = d3.scaleLinear().domain([0, maxElite]).range([usableHeightElite, 0]);

    const svgElite = d3.select('#elite-chart').attr('width', WIDTH_ELITE).attr('height', HEIGHT_ELITE);

    const groupsElite = svgElite
        .selectAll('.bar')
        .data(groupCountsElite, d => d.key)
        .join(enter => {
            const groupsElite = enter.append('g').attr('class', 'bar');
            groupsElite
                .append('rect')
                .attr('height', 0)
                .attr('y', TOP_PADDING_ELITE + usableHeightElite);
            return groupsElite;
        });

    groupsElite.attr('transform', (_, i) => `translate(${xScaleElite(i)}, 0)`);

    groupsElite.select('rect')
        .attr('fill', d => colorScaleElite(d.key))
        .attr('width', barWidthElite - barPaddingElite * 2)
        .attr('height', d => usableHeightElite - yScaleElite(d.value))
        .attr('x', barPaddingElite)
        .attr('y', d => TOP_PADDING_ELITE + yScaleElite(d.value));

    groupsElite.append('text')
        .attr('fill', 'white')
        .attr('x', barWidthElite / 2)
        .attr('y', d => TOP_PADDING_ELITE + yScaleElite(d.value) + 20)
        .attr('dy', '-.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.value);

    groupsElite.append('text')
        .attr('fill', 'white')
        .attr('x', barWidthElite) // Positioning the label
        .attr('y', TOP_PADDING_ELITE + usableHeightElite + 20)
        .attr('dy', '1em')
        .attr('text-anchor', 'end') // Aligning the text to the end of the label
        .attr('transform', `rotate(-90, ${barWidthElite - 30}, ${TOP_PADDING_ELITE + usableHeightElite + 35})`) // Rotating the text
        .text(d => `Group ${d.key}`);
});
