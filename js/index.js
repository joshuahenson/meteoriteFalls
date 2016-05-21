/* global d3 topojson */

const width = 800;
const height = 800;

const svg = d3.select('#root').append('svg')
    .attr('width', width)
    .attr('height', height);

d3.json('../json/world-50m.json', (error, world) => {
  if (error) {
    console.error(error);
  }
  console.log(world);

  const countries = topojson.feature(world, world.objects.countries);

  const projection = d3.geo.mercator()
    .scale(130)
    .translate([width / 2, height / 2]);

  const path = d3.geo.path()
    .projection(projection);

  // append basic shape of landmass
  svg.append('path')
    .datum(countries)
    .attr('class', 'land')
    .attr('d', path);

  // append borders
  svg.append('path')
    .datum(topojson.mesh(world, world.objects.countries, (y, z) => y !== z))
    .attr('d', path)
    .attr('class', 'country-border');
});

// https://bost.ocks.org/mike/map/ was helpful with learning how to use topojson/geojson in d3
