// Utility function to load data using Promise-based d3.json
function loadData(url, callback) {
    d3.json(url)
        .then(function (data) {
            if (data) {
                callback(data);  // Process the data
            } else {
                console.error('No data received');
            }
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });
}

function renderPieChart(svgId, data, valueField, labelField, threshold = 5) {
    const svg = d3.select(svgId),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        radius = Math.min(width, height) / 2;

    svg.selectAll("*").remove();  // Clear any previous chart in the SVG

    const totalValue = d3.sum(data, d => d[valueField]);
    const percentageThreshold = threshold / 100 * totalValue;

    // Group small slices into "Others"
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
        groupedData.push({ [labelField]: "Others", [valueField]: othersCount });
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

    // Check if slice is small and move the text outside if needed
    arcs.append("text")
        .attr("transform", function (d) {
            const [x, y] = arc.centroid(d);
            const midAngle = (d.startAngle + d.endAngle) / 2;
            // Move the label slightly outside if the slice is small
            if (d.endAngle - d.startAngle < 0.25) {
                return `translate(${x * 1.5},${y * 1.5})`;  // Move the label outside for small slices
            }
            return `translate(${arc.centroid(d)})`;
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[valueField] / totalValue) * 100).toFixed(1);
            return percentage >= threshold ? `${d.data[labelField]} (${percentage}%)` : '';
        })
        .style("font-size", function (d) {
            return (d.endAngle - d.startAngle < 0.25) ? "10px" : "12px";  // Adjust font size for small slices
        });

    // Create the legend container outside the SVG
    const legendContainer = d3.select(svgId + '-legend');  // Separate legend div container
    legendContainer.selectAll('*').remove().style("text-align", "left");

    const legendItem = legendContainer.selectAll(".legend-item")
        .data(groupedData)
        .enter().append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "flex-start")
        .style("margin-bottom", "5px");

    // Add colored square for each legend item
    legendItem.append("span")  // Append a color square
        .style("width", "10px")
        .style("height", "10px")
        .style("background-color", d => color(d[labelField]))
        .style("margin-right", "10px");

    // Add text for legend with percentage
    legendItem.append("span")
        .text(d => {
            const percentage = ((d[valueField] / totalValue) * 100).toFixed(1);
            return `${d[labelField]} (${percentage}%)`;
        });
}

function renderBarChart(svgId, data, labelField, valueField) {
    const svg = d3.select(svgId),
        margin = { top: 20, right: 30, bottom: 50, left: 60 },  // Adjust margins for axis labels
        width = parseInt(svg.style("width")) - margin.left - margin.right,
        height = parseInt(svg.style("height")) - margin.top - margin.bottom;

    svg.selectAll("*").remove();  // Clear any previous chart in the SVG

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y scale
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.map(d => d[labelField]));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d[valueField])]);

    // X Axis
    const xAxis = g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Apply rotation or wrapping for X Axis labels
    xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)")  // You can adjust the rotation angle as needed
        .call(wrapText, x.bandwidth());

    // Y Axis
    g.append("g")
        .call(d3.axisLeft(y));

    // X Axis Label
    svg.append("text")
        .attr("transform", `translate(${(width + margin.left + margin.right) / 2},${height + margin.top + 40})`)
        .style("text-anchor", "middle")
        .text(labelField);  // Use labelField for X Axis label

    // Y Axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(valueField);  // Use valueField for Y Axis label

    // Draw bars
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[labelField]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[valueField]))
        .attr("height", d => height - y(d[valueField]))
        .style("fill", "#007bff");  // Bar fill color

    // Create the legend container outside of the SVG
    const legendContainer = d3.select(svgId + '-legend');  // Separate legend div container
    legendContainer.selectAll('*').remove();  // Clear previous legend items

    const legendItem = legendContainer.selectAll(".legend-item")
        .data(data)
        .enter().append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "start")
        .style("margin-bottom", "5px")
        .style("justify-content", "flex-start");

    // Add colored square for each legend item
    legendItem.append("div")
        .style("width", "18px")
        .style("height", "18px")
        .style("background-color", "#007bff")  // Adjust the color if needed
        .style("margin-right", "10px");

    // Add text for legend with value
    legendItem.append("span")
        .text(d => `${d[labelField]}: ${d[valueField]}`);  // Display labelField and valueField

    // Function to wrap text (if needed)
    function wrapText(text, width) {
        text.each(function () {
            const text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                lineHeight = 1.1; // ems

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
}

// Load and render charts for the dashboard
loadData('/dashboards/items-by-country', function (data) {
    renderPieChart("#items-country-chart", data, "count", "country");
});

loadData('/dashboards/items-by-branch', function (data) {
    renderBarChart("#items-branch-chart", data, "branch", "count");
});

loadData('/dashboards/user-type-distribution', function (data) {
    renderPieChart("#user-type-chart", data, "count", "type");
});

loadData('/dashboards/total-users', function (data) {
    d3.select("#total-users-value").text(`Total Users: ${data.total}`);
});

loadData('/dashboards/top-users', function (data) {
    renderBarChart("#top-users-chart", data, "username", "orderCount");
});

loadData('/dashboards/low-stock-items', function (data) {
    // For simplicity, this can be a table or additional D3 visualizations.
});

loadData('/dashboards/top-expensive-items', function (data) {
    renderBarChart("#expensive-items-chart", data, "itemName", "price");
});

loadData('/dashboards/top-ancient-items', function (data) {
    renderBarChart("#ancient-items-chart", data, "itemName", "year");
});

loadData('/dashboards/top-branches', function (data) {
    renderBarChart("#top-branches-chart", data, "branchName", "successMetric");
});

loadData('/dashboards/orders-by-branch', function (data) {
    renderBarChart("#orders-by-branch-chart", data, "branch", "orderCount");
});
