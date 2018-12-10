import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 150, right: 0, bottom: 0 }

let height = 600 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()

let path = d3.geoPath().projection(projection)

let radiusScale = d3.scaleSqrt().range([0, 8])

var colorScale = d3.scaleOrdinal(d3.schemeSet1)

var yPositionScale = d3.scaleBand().range([100, 500])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([usStates, powerplants]) {
  // console.log(json.objects)

  let states = topojson.feature(usStates, usStates.objects.us_states)

  // console.log(states)
  projection.fitSize([width, height], states)
  svg
    .selectAll('.states')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'states')
    .attr('d', path)
    .attr('stroke', 'white')
    .attr('fill', 'lightgray')

  // console.log(powerplants)

  let mws = powerplants.map(d => d.Total_MW)
  radiusScale.domain([0, d3.max(mws)])

  let powerplantTypes = powerplants.map(d => d.PrimSource)

  let types = d3.set(powerplantTypes).values()
  yPositionScale.domain(types)

  svg
    .selectAll('.annotation')
    .data(types)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('fill', d => colorScale(d))
    .attr('transform', d => {
      var yPosition = yPositionScale(d)
      return `translate(-100, ${yPosition})`
    })

  svg
    .selectAll('.annotation-label')
    .data(types)
    .enter()
    .append('text')
    .text(d => {
      return d.charAt(0).toUpperCase() + d.slice(1)
    })
    .attr('transform', d => {
      var yPosition = yPositionScale(d)
      // console.log(d)
      return `translate(-85, ${yPosition})`
    })
    .attr('font-weight', '600')
    .attr('text-anchor', 'start')
    .attr('alignment-baseline', 'middle')

  svg
    .selectAll('.powerplants')
    .data(powerplants)
    .enter()
    .append('circle')
    .attr('class', 'powerplants')
    .attr('r', d => radiusScale(d.Total_MW))
    .attr('transform', d => {
      // console.log(d)
      var coords = [d.Longitude, d.Latitude]
      // console.log(coords)
      return `translate(${projection(coords)})`
    })
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('opacity', '0.5')

  svg
    .selectAll('.states-label')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'states-label')
    .text(d => {
      return d.properties.postal
    })
    .attr('transform', d => {
      var center = path.centroid(d)
      return `translate(${center[0]}, ${center[1]})`
    })
    .attr('font-weight', '600')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )

  // console.log(us_states.objects)
}
