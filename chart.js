const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().domain([30, 70]).range([0, innerWidth]);
const y = d3.scaleLinear().domain([80, 200]).range([innerHeight, 0]);
const r = d3.scaleSqrt().domain([50, 150]).range([4, 18]);
const color = d3.scaleOrdinal(d3.schemeCategory10);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.dsv(";", "cardio_train.csv").then(rawData => {
  const data = rawData.map(d => ({
    age_years: Math.floor(+d.age / 365),
    ap_hi: +d.ap_hi,
    weight: +d.weight,
    cholesterol: +d.cholesterol
  }));

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .text("Age (years)");

  g.append("g")
    .call(yAxis)
    .append("text")
    .attr("x", -innerHeight / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("fill", "black")
    .text("Systolic BP (ap_hi)");

  const circlesGroup = g.append("g");

  const dots = circlesGroup.selectAll("circle")
    .data(data.slice(0, 700)) // only show 200 for speed
    .enter().append("circle")
    .attr("cx", d => x(d.age_years))
    .attr("cy", d => y(d.ap_hi))
    .attr("r", d => r(d.weight))
    .attr("fill", d => color(d.cholesterol))
    .attr("stroke", "black")
    .attr("opacity", 0.8)
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(100).style("opacity", 1);
      tooltip.html(
        `<strong>Age:</strong> ${d.age_years}<br/>
         <strong>BP:</strong> ${d.ap_hi}<br/>
         <strong>Cholesterol:</strong> ${d.cholesterol}<br/>
         <strong>Weight:</strong> ${d.weight}`
      );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 35) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => {
      const transform = event.transform;
      const zx = transform.rescaleX(x);
      const zy = transform.rescaleY(y);

      g.select("g").call(xAxis.scale(zx));
      g.select("g:nth-of-type(2)").call(yAxis.scale(zy));

      dots
        .attr("cx", d => zx(d.age_years))
        .attr("cy", d => zy(d.ap_hi));
    });

  svg.call(zoom);

  // // Brushing
  // const brush = d3.brush()
  //   .extent([[0, 0], [innerWidth, innerHeight]])
  //   .on("brush", (event) => {
  //     const [[x0, y0], [x1, y1]] = event.selection || [[0, 0], [0, 0]];
  //     dots.attr("stroke", d => {
  //       const cx = x(d.age_years);
  //       const cy = y(d.ap_hi);
  //       return (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) ? "red" : "black";
  //     });
  //   });

  // g.append("g").attr("class", "brush").call(brush);

  // Legend
  const legendData = [1, 2, 3];
  const legendLabels = {
    1: "Normal",
    2: "Above Normal",
    3: "Well Above Normal"
  };

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 170}, ${margin.top})`);

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 25)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => color(d))
    .attr("stroke", "#000");

  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 25)
    .attr("y", (d, i) => i * 25 + 14)
    .text(d => `${d} = ${legendLabels[d]}`)
    .style("font-size", "13px");
});