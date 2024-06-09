const BOTTOM_PADDING_NON_ELITE = 100; 
const LEFT_PADDING_NON_ELITE = 50;
const RIGHT_PADDING_NON_ELITE = 50;
const TOP_PADDING_NON_ELITE = 50;

const HEIGHT_NON_ELITE = 500;
const WIDTH_NON_ELITE = 500;

const usableHeightNonElite = HEIGHT_NON_ELITE - TOP_PADDING_NON_ELITE - BOTTOM_PADDING_NON_ELITE;
const usableWidthNonElite = WIDTH_NON_ELITE - LEFT_PADDING_NON_ELITE - RIGHT_PADDING_NON_ELITE;

const colorScaleNonElite = d3.scaleOrdinal(d3.schemePaired);

d3.json("data/non_elite_graph_data.json").then(function(data) {
    const nodesNonElite = data.nodes;

    const groupCountsNonElite = Array.from(d3.rollup(
        nodesNonElite,
        v => v.length,
        d => d.group
    ), ([key, value]) => ({ key, value }));

    const barPaddingNonElite = Math.ceil(30 / groupCountsNonElite.length);

    const barWidthNonElite = usableWidthNonElite / groupCountsNonElite.length;

    const xScaleNonElite = d3
        .scaleLinear()
        .domain([0, groupCountsNonElite.length])
        .range([LEFT_PADDING_NON_ELITE, LEFT_PADDING_NON_ELITE + usableWidthNonElite]);

    const maxNonElite = d3.max(groupCountsNonElite, d => d.value);
    const yScaleNonElite = d3.scaleLinear().domain([0, maxNonElite]).range([usableHeightNonElite, 0]);

    const svgNonElite = d3.select('#nonelite-chart').attr('width', WIDTH_NON_ELITE).attr('height', HEIGHT_NON_ELITE);

    const groupsNonElite = svgNonElite
        .selectAll('.bar')
        .data(groupCountsNonElite, d => d.key)
        .join(enter => {
            const groupsNonElite = enter.append('g').attr('class', 'bar');
            groupsNonElite
                .append('rect')
                .attr('height', 0)
                .attr('y', TOP_PADDING_NON_ELITE + usableHeightNonElite);
            return groupsNonElite;
        });
    
    groupsNonElite.attr('transform', (_, i) => `translate(${xScaleNonElite(i)}, 0)`);
    
    groupsNonElite.select('rect')
        .attr('fill', d => colorScaleNonElite(d.key))
        .attr('width', barWidthNonElite - barPaddingNonElite * 2)
        .attr('height', d => usableHeightNonElite - yScaleNonElite(d.value))
        .attr('x', barPaddingNonElite)
        .attr('y', d => TOP_PADDING_NON_ELITE + yScaleNonElite(d.value));

    groupsNonElite.append('text')
        .attr('fill', 'white')
        .attr('x', barWidthNonElite / 2)
        .attr('y', d => TOP_PADDING_NON_ELITE + yScaleNonElite(d.value) + 20)
        .attr('dy', '-.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.value);
    
    groupsNonElite.append('text')
        .attr('fill', 'white')
        .attr('x', barWidthNonElite) // Positioning the label
        .attr('y', TOP_PADDING_NON_ELITE + usableHeightNonElite + 20)
        .attr('dy', '1em')
        .attr('text-anchor', 'end') // Aligning the text to the end of the label
        .attr('transform', `rotate(-90, ${barWidthNonElite- 25}, ${TOP_PADDING_NON_ELITE + usableHeightNonElite + 30})`) // Rotating the text
        .text(d => `Group ${d.key}`);
    

});
