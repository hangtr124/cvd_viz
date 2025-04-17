// chart1.js

// 1) select the correct SVG container
const svg1 = d3.select("#chart1");

// 2) read its size and define margins
const width  = +svg1.attr("width");
const height = +svg1.attr("height");
const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const innerWidth  = width  - margin.left - margin.right;
const innerHeight = height - margin.top  - margin.bottom;

// 3) append a group for margins
const g = svg1.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// 4) define scales
const x     = d3.scaleLinear().domain([30, 70]).range([0, innerWidth]);
const y     = d3.scaleLinear().domain([80, 200]).range([innerHeight, 0]);
const r     = d3.scaleSqrt().   domain([50, 150]).range([4, 18]);
const color = d3.scaleOrdinal().domain([0, 1]).range(["steelblue","crimson"]);

// 5) axes generators
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// 6) tooltip (must match your HTML’s <div class="tooltip">)
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// 7) load data and render
d3.dsv(";", "cardio_train.csv").then(rawData => {
  const data = rawData.map(d => ({
    age_years: Math.floor(+d.age   / 365),
    ap_hi:      +d.ap_hi,
    weight:     +d.weight,
    cardio:     +d.cardio
  }));

  // draw axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .append("text")
      .attr("x", innerWidth/2)
      .attr("y", 40)
      .attr("fill","black")
      .text("Age (years)");

  g.append("g")
    .call(yAxis)
    .append("text")
      .attr("x", -innerHeight/2)
      .attr("y", -40)
      .attr("transform","rotate(-90)")
      .attr("fill","black")
      .text("Systolic BP (ap_hi)");

  // plot circles
  const dots = g.append("g")
    .selectAll("circle")
    .data(data.slice(0,700))
    .enter().append("circle")
      .attr("cx", d => x(d.age_years))
      .attr("cy", d => y(d.ap_hi))
      .attr("r",  d => r(d.weight))
      .attr("fill", d => color(d.cardio))
      .attr("stroke","black")
      .attr("opacity",0.8)
      .on("mouseover", (event,d) => {
        tooltip.transition().duration(100).style("opacity",1);
        tooltip.html(
          `<strong>Age:</strong> ${d.age_years}<br/>
           <strong>BP:</strong> ${d.ap_hi}<br/>
           <strong>Cardio:</strong> ${d.cardio}<br/>
           <strong>Weight:</strong> ${d.weight}`
        );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left",  (event.pageX + 15) + "px")
          .style("top",   (event.pageY - 35) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity",0);
      });

  // zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1,8])
    .translateExtent([[0,0],[width,height]])
    .on("zoom", (event) => {
      const zx = event.transform.rescaleX(x);
      const zy = event.transform.rescaleY(y);
      g.select("g").call(xAxis.scale(zx));
      g.select("g:nth-of-type(2)").call(yAxis.scale(zy));
      dots
        .attr("cx", d => zx(d.age_years))
        .attr("cy", d => zy(d.ap_hi));
    });
  svg1.call(zoom);

  // legend for Cardio
  const legendData   = [0,1];
  const legendLabels = { 0:"No Disease", 1:"Has Disease" };

  const legend = svg1.append("g")
    .attr("class","legend")
    .attr("transform", `translate(${width-170},${margin.top})`);

  legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
      .attr("x",0)
      .attr("y",(d,i)=>i*25)
      .attr("width",18).attr("height",18)
      .attr("fill",d=>color(d))
      .attr("stroke","#000");

  legend.selectAll("text")
    .data(legendData)
    .enter().append("text")
      .attr("x",25)
      .attr("y",(d,i)=>i*25+14)
      .text(d => `${d} = ${legendLabels[d]}`)
      .style("font-size","13px");
});
