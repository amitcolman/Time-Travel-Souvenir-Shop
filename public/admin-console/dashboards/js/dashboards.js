function loadData(url, callback) {
    d3.json(url)
        .then(function (data) {
            if (data) {
                callback(data);
            } else {
                console.error('No data received');
                d3.select('#error-message').text('Failed to load data. Please try again.');
            }
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
            d3.select('#error-message').text('Failed to load data. Please try again.');
        });
}

function wrapText(text, width) {
    text.each(function () {
        const text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            lineHeight = 1.1;
        let word,
            line = [],
            lineNumber = 0,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", `${dy}em`);

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
            }
        }
    });
}

function renderLegend(legendContainerId, data, colorScale, labelField, valueField, isPieChart = false) {
    const legendContainer = d3.select(legendContainerId);
    legendContainer.selectAll('*').remove()
        .style("text-align", "left")
        .style("margin-top", "20px");
    const legendItem = legendContainer.selectAll(".legend-item")
        .data(data)
        .enter().append("div")
        .attr("class", "legend-item");

    if (isPieChart) {
        legendItem.append("span")
            .attr("class", "legend-color-square")
            .style("background-color", d => colorScale(d[labelField]));
    } else {
        legendItem.append("span")
            .attr("class", "legend-color-square");
    }

    legendItem.append("span")
        .attr("class", "legend-text")
        .text(d => {
            if (isPieChart) {
                const totalValue = d3.sum(data, d => d[valueField]);
                const percentage = ((d[valueField] / totalValue) * 100).toFixed(1);
                return `${d[labelField]} (${percentage}%)`;
            } else {
                return `${d[labelField]} (${d[valueField]})`;
            }
        });
}

function renderPieChart(svgId, data, valueField, labelField, threshold = 5) {
    const svg = d3.select(svgId),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        radius = Math.min(width, height) / 2;

    svg.selectAll("*").remove();
    const totalValue = d3.sum(data, d => d[valueField]);
    const percentageThreshold = threshold / 100 * totalValue;

    const groupedData = [];
    let othersCount = 0;

    data.forEach(d => {
        if (d[valueField] < percentageThreshold) {
            othersCount += d[valueField];
        } else {
            groupedData.push(d);
        }
    });

    if (othersCount > 0) {
        groupedData.push({[labelField]: "Others", [valueField]: othersCount});
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value(d => d[valueField])(groupedData);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const arcs = g.selectAll(".arc")
        .data(pie)
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data[labelField]));

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .attr("class", "pie-text").text(d => {
        const percentage = ((d.data[valueField] / totalValue) * 100).toFixed(1);
        return percentage >= threshold ? `${d.data[labelField]} (${percentage}%)` : '';
    });

    renderLegend(svgId + '-legend', groupedData, color, labelField, valueField, true);
}

function renderBarChart(svgId, data, labelField, valueField) {
    const svg = d3.select(svgId),
        margin = {top: 20, right: 30, bottom: 50, left: 60},
        width = parseInt(svg.style("width")) - margin.left - margin.right,
        height = parseInt(svg.style("height")) - margin.top - margin.bottom;

    svg.selectAll("*").remove();
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.5)
        .domain(data.map(d => d[labelField]));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d[valueField])]);

    const xAxis = g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)").call(wrapText, x.bandwidth());

    g.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.top + 30})`)
        .style("text-anchor", "middle");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(valueField);
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[labelField]))
        .attr("width", x.bandwidth()).attr("y", d => y(d[valueField]))
        .attr("height", d => height - y(d[valueField]))
        .style("fill", "#007bff");
    renderLegend(svgId + '-legend', data, null, labelField, valueField, false);
}


loadData('/dashboards/items-by-country', function (data) {
    renderPieChart("#items-country-chart", data, "count", "country");
});

loadData('/dashboards/items-per-branch', function (data) {
    renderBarChart("#items-branch-chart", data, "branch", "count");
});

loadData('/dashboards/user-type-distribution', function (data) {
    renderPieChart("#user-type-chart", data, "count", "type");
});

loadData('/dashboards/total-users', function (data) {
    d3.select("#total-users-display")
        .style("font-size", "72px").style("color", "black").text(data.total);
});

loadData('/dashboards/top-users', function (data) {
    renderBarChart("#top-users-chart", data, "username", "orderCount");
});

loadData('/dashboards/top-expensive-items', function (data) {
    renderBarChart("#expensive-items-chart", data, "itemName", "price");
});

loadData('/dashboards/top-ancient-items', function (data) {
    renderBarChart("#ancient-items-chart", data, "itemName", "year");
});

loadData('/dashboards/top-branches', function (data) {
    renderBarChart("#top-branches-chart", data, "branch", "totalOrders");
});

loadData('/dashboards/sales-by-branch', function (data) {
    renderBarChart("#sales-branch-chart", data, "branch", "totalSales");
});
