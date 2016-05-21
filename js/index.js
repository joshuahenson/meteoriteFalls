/* global d3 topojson */

const width = 800;
const height = 800;

const tooltip = d3.select('#root').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

const svg = d3.select('#root').append('svg')
    .attr('width', width)
    .attr('height', height);
    
const g = svg.append('g');

g.append('rect')
  .attr('class', 'ocean')
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
  g.append('path')
    .datum(countries)
    .attr('class', 'land')
    .attr('d', path);

  // append borders
  g.append('path')
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr('d', path)
    .attr('class', 'country-border');

  d3.json('../json/meteorite-strike-data.json', (e, data) => {
    if (e) { console.error(e); }

    // set color scale for meteor dots according to size
    const colors = d3.scale.quantize()
      .domain([0, data.features.length])
      .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84',
        '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000']);

    // append meteor dots to map
    g.selectAll('circle')
      // sort data by descending size to lay smaller meteors on top of bigger
      .data(data.features.sort((a,b) => b.properties.mass-a.properties.mass))
      .enter()
      .append('circle')
      .attr('cx', d => projection([d.properties.reclong, d.properties.reclat])[0])
      .attr('cy', d => projection([d.properties.reclong, d.properties.reclat])[1])
      .attr('r', d => Math.sqrt(d.properties.mass * 0.0001))
      .attr('fill', (d, i) => colors(i))
      .attr('opacity', 0.6)
      .on('mouseover', d => {
        tooltip.transition()
          .style('opacity', 1);
        tooltip.html(`<h3>${d.properties.name}</h3>${d.properties.year.substr(0, 4)}`)
          .style('left', `${d3.event.pageX + 20}px`)
          .style('top', `${d3.event.pageY - 30}px`);
    })
      .on('mouseout', () => {
        tooltip.transition()
          .style('opacity', 0);
      });
  });
});

const zoom = d3.behavior.zoom()
  .on('zoom', () => {
    g.attr('transform',
      `translate(${d3.event.translate.join(',')})scale(${d3.event.scale})`);
    g.selectAll('circle, path')
        .attr('d', path.projection(projection));
  });

svg.call(zoom);

// helpful sites
// https://bost.ocks.org/mike/map/ -topojson
// https://www.pluralsight.com/courses/d3js-data-visualization-fundamentals
// http://bl.ocks.org/d3noob/5193723 -zoom
