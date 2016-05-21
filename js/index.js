/* global d3 topojson */

const width = 800;
const height = 800;

const svg = d3.select('#root').append('svg')
    .attr('width', width)
    .attr('height', height);

const projection = d3.geo.mercator()
  .scale(130)
  .translate([width / 2, height / 2]);

const path = d3.geo.path()
  .projection(projection);

d3.json('../json/world-50m.json', (error, world) => {
  if (error) { console.error(error); }

  const countries = topojson.feature(world, world.objects.countries);

  // append basic shape of landmass
  svg.append('path')
    .datum(countries)
    .attr('class', 'land')
    .attr('d', path);

  // append borders
  svg.append('path')
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr('d', path)
    .attr('class', 'country-border');

  d3.json('../json/meteorite-strike-data.json', (e, data) => {
    if (e) { console.error(e); }

    // set color scale for meteor dots avoiding blue/green due to map color
    const colors = d3.scale.ordinal()
      .domain([0, data.features.length])
      .range(['#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
        '#cab2d6', '#6a3d9a', '#ffff99', '#b15928']);

    // append meteor dots to map
    svg.selectAll('circle')
      .data(data.features)
      .enter()
      .append('circle')
      .attr('cx', d => projection([d.properties.reclong, d.properties.reclat])[0])
      .attr('cy', d => projection([d.properties.reclong, d.properties.reclat])[1])
      .attr('r', d => Math.sqrt(d.properties.mass * 0.0001))
      .attr('fill', (d, i) => colors(i))
      .attr('opacity', 0.6);
  });
});

// helpful sites
// https://bost.ocks.org/mike/map/ -topojson
// https://www.pluralsight.com/courses/d3js-data-visualization-fundamentals
