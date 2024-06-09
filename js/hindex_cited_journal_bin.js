var data; // Your JSON data

document.addEventListener("DOMContentLoaded", function() {
    d3.json("data/hindex_cited_journal_binned_data.json").then(function(jsonData) {
        data = jsonData;
        var scales = drawHeatmap(data);
        updateChart(0, scales); // 默认显示非精英的图表
    });
});

function drawHeatmap(data) {
    var margin = { top: 50, right: 120, bottom: 100, left: 50 }, // 增加底部边距以容纳旋转标签
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

    var colorScale = d3.scaleSequential(d => {
        return d === 0 ? "#ccc" : d3.interpolateHcl("#c8b6e2", "#6a0dad")(Math.pow(d, 0.5)); // 使用平方根插值
        })
    .domain([0, d3.max(data, d => d.frequency)])
    .clamp(true);

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
        .attr("fill", "#f8f9fa") // 设置标签文字颜色
        .text("H指数");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append("text") // 添加y轴标签
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "#f8f9fa") // 设置标签文字颜色
        .text("被引次数");

    svg.append("g")
        .selectAll("rect")
        .data(data.filter(d => +d.cited_by_count_bin >= 50 && d.journal_flag === 0)) // 默认显示非精英数据
        .enter().append("rect")
        .attr("x", d => xScale(d.h_index_bin))
        .attr("y", d => yScale(d.cited_by_count_bin))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.frequency))
        .attr("class", "data-point");

    // 添加参考线
    var referenceLine = svg.append("line")
        .attr("x1", xScale("30") + 1) // 修正参考线位置
        .attr("y1", 0)
        .attr("x2", xScale("30") + 1)
        .attr("y2", height)
        .attr("stroke", "red")
        .attr("stroke-dasharray", 8)
        .attr("stroke-width", 2)
        .attr("class", "reference-line");

    // 添加注释文本
    svg.append("text")
        .attr("x", xScale("30") + xScale.bandwidth() / 2 - 60) // 文字位置稍微右移
        .attr("y", -25)
        .attr("dy", "1em")
        .attr("text-anchor", "start")
        .attr("fill", "#f8f9fa")
        .text("精英: H指数 >= 31");

    // 添加颜色条
    var legendHeight = 300;
    var legendWidth = 20;

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width + 50) + "," + (height / 2 - legendHeight / 2) + ")");

    var legendScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.frequency) / 2])
        .range([legendHeight, 0]);

    var legendAxis = d3.axisRight(legendScale)
        .ticks(5);

    legend.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + legendWidth + ",0)")
        .call(legendAxis);

    var legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    legendGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolatePurples(0.3));

    legendGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolatePurples(1));

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legendGradient)");

    // 监听非精英标签点击事件
    d3.select("#nonElite").on("click", function() {
        updateChart(0, {xScale, yScale, colorScale, width, height}); // Update the chart to show journal_flag=0 data
    });

    // 监听精英标签点击事件
    d3.select("#elite").on("click", function() {
        updateChart(1, {xScale, yScale, colorScale, width, height}); // Update the chart to show journal_flag=1 data
    });

    // 添加类别文本
    svg.append("text")
        .attr("class", "category-text")
        .attr("x", width - 10)
        .attr("y", -30)
        .attr("text-anchor", "end")
        .attr("fill", "#f8f9fa")
        .attr("font-weight", 'bold')
        .text("非顶刊"); // 初始显示非精英期刊

    return {xScale, yScale, colorScale, width, height};
}

function updateChart(eliteStatus, scales) {
    var {xScale, yScale, colorScale, width, height} = scales;

    var legendHeight = 300; // 添加颜色条的高度

    // 过滤数据，只保留符合条件的数据
    var filteredData = data.filter(d => d.journal_flag === eliteStatus && +d.cited_by_count_bin >= 50);

    // 计算数据的最大频率值
    var maxFrequency = d3.max(filteredData, d => d.frequency);

    // 调整颜色比例尺的域范围，增加一个偏移量来避免颜色过白
    var colorScale = d3.scaleSequential(d => {
        return d === 0 ? "#ccc" : d3.interpolateHcl("#c8b6e2", "#6a0dad")(Math.pow(d, 0.5)); // 使用平方根插值
        })
    .domain([0, d3.max(filteredData, d => d.frequency)])
    .clamp(true);

    // 更新所有的矩形元素
    var rects = d3.selectAll(".data-point")
        .data(filteredData, d => d.h_index_bin + ':' + d.cited_by_count_bin); // 使用一个标识符以帮助D3跟踪元素

    rects.enter().append("rect")
        .attr("x", d => xScale(d.h_index_bin))
        .attr("y", d => yScale(d.cited_by_count_bin))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.frequency))
        .attr("class", "data-point")
        .attr("opacity", 0) // 开始时透明
        .transition() // 添加过渡
        .duration(1000)
        .attr("opacity", 1); // 渐变显示

    rects.transition() // 更新现有元素
        .duration(1000)
        .attr("x", d => xScale(d.h_index_bin))
        .attr("y", d => yScale(d.cited_by_count_bin))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.frequency));

    rects.exit()
        .transition() // 添加过渡
        .duration(1000)
        .attr("opacity", 0) // 渐变隐藏
        .remove();

    // 更新颜色条
    var legendScale = d3.scaleLinear()
        .domain([0, maxFrequency / 2])
        .range([legendHeight, 0]);

    d3.select(".legend .axis")
        .transition()
        .duration(1000)
        .call(d3.axisRight(legendScale).ticks(5));

    d3.select("#legendGradient stop:nth-child(1)")
        .transition()
        .duration(1000)
        .attr("stop-color", d3.interpolatePurples(0.3));

    d3.select("#legendGradient stop:nth-child(2)")
        .transition()
        .duration(1000)
        .attr("stop-color", d3.interpolatePurples(1));


    // 更新x轴和y轴
    d3.select(".x.axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(45)") // 旋转标签
        .style("text-anchor", "start");

    d3.select(".y.axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yScale));

    // 更新类别文本
    d3.select(".category-text")
        .text(eliteStatus === 0 ? "非顶刊" : "顶刊");
}
