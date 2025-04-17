// chart2.js
const svg2    = d3.select("#chart2");
const tooltip = d3.select(".tooltip");

// margins & sizes
const width      = +svg2.attr("width");
const height     = +svg2.attr("height");
const margin     = { top: 40, right: 40, bottom: 60, left: 60 };
const innerW     = width  - margin.left - margin.right;
const innerH     = height - margin.top  - margin.bottom;

// group for margins
const g2 = svg2.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// scales
const x2 = d3.scaleLinear().domain([30,70]).range([0, innerW]);
const y2 = d3.scaleLinear().domain([80,200]).range([innerH, 0]);
const r2 = d3.scaleSqrt().   domain([50,150]).range([4, 18]);
const c2 = d3.scaleOrdinal().domain([1,2,3]).range(d3.schemeCategory10);

// axes
const xAxis2 = d3.axisBottom(x2);
const yAxis2 = d3.axisLeft(y2);

const xg2 = g2.append("g")
  .attr("transform", `translate(0,${innerH})`)
  .call(xAxis2);
xg2.append("text")
  .attr("x", innerW/2).attr("y", 40).attr("fill","black")
  .text("Age (years)");

const yg2 = g2.append("g")
  .call(yAxis2);
yg2.append("text")
  .attr("transform","rotate(-90)")
  .attr("x",-innerH/2).attr("y",-40).attr("fill","black")
  .text("Systolic BP (ap_hi)");

// load & plot
d3.dsv(";", "cardio_train.csv").then(raw => {
  const data = raw.map(d => ({
    age_years:   Math.floor(+d.age/365),
    ap_hi:        +d.ap_hi,
    weight:       +d.weight,
    cholesterol:  +d.cholesterol
  }));

  const dots = g2.selectAll("circle")
    .data(data.slice(0,700))
    .enter().append("circle")
      .attr("cx", d => x2(d.age_years))
      .attr("cy", d => y2(d.ap_hi))
      .attr("r",  d => r2(d.weight))
      .attr("fill", d => c2(d.cholesterol))
      .attr("stroke", "#333")
      .attr("opacity", 0.8)
      .on("mouseover", (e,d) => {
        tooltip.transition().duration(100).style("opacity",1)
               .html(`Age: ${d.age_years}<br>BP: ${d.ap_hi}<br>Chol: ${d.cholesterol}`);
      })
      .on("mousemove", (e) => {
        tooltip.style("left",(e.pageX+10)+"px")
               .style("top",(e.pageY-20)+"px");
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity",0));

  // zoom
  const zoom2 = d3.zoom()
    .scaleExtent([1,8])
    .translateExtent([[0,0],[width,height]])
    .on("zoom", ({transform}) => {
      const zx = transform.rescaleX(x2);
      const zy = transform.rescaleY(y2);
      xg2.call(xAxis2.scale(zx));
      yg2.call(yAxis2.scale(zy));
      dots.attr("cx", d=> zx(d.age_years))
          .attr("cy", d=> zy(d.ap_hi));
    });
  svg2.call(zoom2);

  // legend
  const legendData   = [1,2,3];
  const legendLabels = {1:"Normal",2:"Above Normal",3:"Well Above Normal"};

  const legend = svg2.append("g")
    .attr("transform", `translate(${width-170},${margin.top})`);
  legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
      .attr("x",0).attr("y",(d,i)=>i*25)
      .attr("width",18).attr("height",18)
      .attr("fill", d=> c2(d))
      .attr("stroke","#000");
  legend.selectAll("text")
    .data(legendData)
    .enter().append("text")
      .attr("x",25).attr("y",(d,i)=>i*25+14)
      .text(d=> `${d} = ${legendLabels[d]}`)
      .style("font-size","13px");
})
.catch(err => console.error("CSV load error:", err));
