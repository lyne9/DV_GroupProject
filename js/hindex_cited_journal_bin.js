var data; // Your JSON data

document.addEventListener("DOMContentLoaded", function() {
    d3.json("data/hindex_cited_journal_binned_data.json").then(function(jsonData) {
        data = jsonData;
        drawHeatmap(data);
        updateChart(0); // 默认显示非精英的图表
    });
});

function drawHeatmap(data) {
    var margin = { top: 50, right: 50, bottom: 100, left: 50 }, // 增加底部边距以容纳旋转标签
        width = 800 - margin.left - margin.right, // 增加图表宽度
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#hindex-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.h_index_bin))])
        .range([0, width]) // 调整范围为箱子的左侧
        .paddingInner(0.05); // 调整箱子之间的间距

    var yScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.cited_by_count_bin))].filter(d => +d >= 50)) // 过滤掉低于50的值
        .range([height, 0])
        .padding(0.05);

    var colorScale = d3.scaleSequential(d3.interpolateRgb("#4a3728", "white"))
        .domain([0, d3.max(data, d => d.frequency) / 2]); // 调整颜色比例尺以加深颜色

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(45)") // 旋转标签
        .style("text-anchor", "start");

    svg.append("text") // 添加x轴标签
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top) + ")")
        .style("text-anchor", "middle")
        .attr("fill", "white") // 设置标签文字颜色
        .text("H-index");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))
        .attr('line', 'white');

    svg.append("text") // 添加y轴标签
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "white") // 设置标签文字颜色
        .text("Cited by Count");

    svg.append("g")
        .selectAll("rect")
        .data(data.filter(d => +d.cited_by_count_bin >= 50)) // 只显示cited_by_count_bin >= 50的矩形
        .enter().append("rect")
        .attr("x", d => xScale(d.h_index_bin))
        .attr("y", d => yScale(d.cited_by_count_bin))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        // .attr("stroke", "white")
        .attr("fill", d => colorScale(d.frequency))
        .attr("class", "data-point"); // Add a class for easier selection

    // 添加参考线
    var referenceLine = svg.append("line")
        .attr("x1", xScale("30") + 1) // 修正参考线位置
        .attr("y1", 0)
        .attr("x2", xScale("30") + 1)
        .attr("y2", height)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("class", "reference-line");

    // 添加注释文本
    svg.append("text")
        .attr("x", xScale("30") - 5) // 文字位置稍微右移
        .attr("y", -18)
        .attr("dy", "1em")
        .attr("text-anchor", "start")
        .attr("fill", "white")
        .text("31");

    // 监听非精英标签点击事件
    d3.select("#nonElite").on("click", function() {
        updateChart(0); // Update the chart to show journal_flag=0 data
    });

    // 监听精英标签点击事件
    d3.select("#elite").on("click", function() {
        updateChart(1); // Update the chart to show journal_flag=1 data
    });
}

function updateChart(eliteStatus) {
    // 过滤数据，只保留符合条件的数据
    var filteredData = data.filter(d => d.journal_flag === eliteStatus && +d.cited_by_count_bin >= 50);

    var margin = { top: 50, right: 50, bottom: 100, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var xScale = d3.scaleBand()
        .domain([...new Set(filteredData.map(d => d.h_index_bin))])
        .range([0, width])
        .padding(0.05);

    var yScale = d3.scaleBand()
        .domain([...new Set(filteredData.map(d => d.cited_by_count_bin))])
        .range([height, 0])
        .padding(0.05);

    var colorScale = d3.scaleSequential(d3.interpolateRgb("#4a3728", "white"))
        .domain([0, d3.max(filteredData, d => d.frequency) / 2]); // 调整颜色比例尺以加深颜色

    // 更新所有的矩形元素
    d3.selectAll(".data-point")
        .data(filteredData)
        .attr("x", d => xScale(d.h_index_bin))
        .attr("y", d => yScale(d.cited_by_count_bin))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.frequency));

    // 更新x轴和y轴
    d3.select(".x.axis")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(45)") // 旋转标签
        .style("text-anchor", "start");

    d3.select(".y.axis")
        .call(d3.axisLeft(yScale));
}
