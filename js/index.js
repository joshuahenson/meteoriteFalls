/* global d3 topojson */

const width = 960;
const height = 960;

const tooltip = d3.select('#root').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

const svg = d3.select('#root').append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', width)
    .attr('height', height)
    .append('g');

svg.append('rect')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height);

const g = svg.append('g');

const projection = d3.geo.mercator();

const zoomed = () => {
  g.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
};

const zoom = d3.behavior.zoom()
  .scaleExtent([1, 8])
  .on('zoom', zoomed);

const path = d3.geo.path()
  .projection(projection);

svg
  .call(zoom)
  .call(zoom.event);

d3.json('../json/world-110m.json', (error, world) => {
  if (error) { console.error(error); }

  // append basic shape of landmass
  g.append('path')
    .datum(topojson.feature(world, world.objects.countries))
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
    const formatNum = d3.format('0,000');
    g.selectAll('circle')
      // sort data by descending size to lay smaller meteors on top of bigger
      .data(data.features.sort((a, b) => b.properties.mass - a.properties.mass))
      .enter()
      .append('circle')
      .attr('class', 'meteor')
      .attr('cx', d => projection([d.properties.reclong, d.properties.reclat])[0])
      .attr('cy', d => projection([d.properties.reclong, d.properties.reclat])[1])
      .attr('r', d => Math.pow(d.properties.mass * 0.001, 1 / 3))
      .attr('fill', (d, i) => colors(i))
      .on('mouseover', d => {
        tooltip.transition()
          .style('opacity', 1);
        tooltip.html(`<h3>${d.properties.name}</h3>
          <span>${d.properties.year.substr(0, 4)}</span>
          <span>${formatNum(d.properties.mass / 1000)} kg</span>`)
          .style('left', `${d3.event.pageX + 20}px`)
          .style('top', `${d3.event.pageY - 30}px`);
      })
      .on('mouseout', () => {
        tooltip.transition()
          .style('opacity', 0);
      });
  });
});

/*
helpful sites
https://bost.ocks.org/mike/map/ -topojson
https://www.pluralsight.com/courses/d3js-data-visualization-fundamentals
https://gist.github.com/harlantwood/6900108 - fullscreen
https://bl.ocks.org/mbostock/8fadc5ac9c2a9e7c5ba2 -zoom
*/
