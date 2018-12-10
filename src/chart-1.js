import * as d3 from 'd3'

// Set up margin/height/width
var margin = { top: 40, left: 30, right: 90, bottom: 30 }

var height = 550 - margin.top - margin.bottom
var width = 450 - margin.left - margin.right

// Add your svg
var svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)

// Create a time parser (see hints)
var parseTime = d3.timeParse('%B-%y')

// Create your scales

let xPositionScale = d3
  .scaleLinear()
  .domain([0, 10])
  .range([0, width])

let yPositionScale = d3.scaleLinear().range([height, 0])

// Create a d3.line function that uses your scales
var line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.price)
  })

// Read in your housing price data
d3.csv(require('./housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })
// Build color scale
let colorScale = d3
  .scaleOrdinal()
  .range([
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#a1d76a'
  ])

// Write your ready function

function ready(datapoints) {
  // console.log(datapoints)

  // Convert your months to dates
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })

  // Get a list of dates and a list of prices
  let housingPrice = datapoints.map(d => +d.price)
  yPositionScale.domain(d3.extent(housingPrice))

  let housingMonth = datapoints.map(d => d.datetime)
  xPositionScale.domain(d3.extent(housingMonth))

  // Group your data together
  var nested = d3
    .nest()
    .key(function(d) {
      return d.region
    })
    .entries(datapoints)

  // console.log('nested data looks like: ', nested)

  // Draw your lines
  svg
    .selectAll('.housing-line')
    .data(nested)
    .enter()
    .append('path')
    .attr('d', d => line(d.values))
    .attr('stroke', d => colorScale(d.key))
    .attr('fill', 'none')
    .attr('class', 'housing-line')

  // Add your text on the right-hand side
  svg
    .selectAll('.housing-text')
    .data(nested)
    .enter()
    .append('text')
    .text(d => d.key)
    .attr('x', d => {
      var dValues = d.values
      var lastMonth = d3.max(dValues.map(d => d.datetime))

      return xPositionScale(lastMonth)
    })
    .attr('y', d => {
      var dValues = d.values
      var nestedPrice = dValues.map(d => +d.price)
      var lastPrice = nestedPrice[0]

      return yPositionScale(lastPrice)
    })
    .attr('font-size', 10)
    // .attr('dy', -4)
    .attr('dx', 4)
    .attr('text-anchor', 'start')
    .attr('class', 'housing-text')
    .attr('alignment-baseline', 'middle')

  svg
    .selectAll('.housing-circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('r', 3)
    .attr('cx', d => {
      var dValues = d.values
      var lastMonth = d3.max(dValues.map(d => d.datetime))

      return xPositionScale(lastMonth)
    })
    .attr('cy', d => {
      var dValues = d.values
      var nestedPrice = dValues.map(d => +d.price)
      var lastPrice = nestedPrice[0]

      return yPositionScale(lastPrice)
    })
    .attr('fill', d => colorScale(d.key))
    .attr('class', 'housing-circle')

  // Add your title
  svg
    .append('text')
    .text('U.S. Housing Prices Fall in Winter')
    .attr('x', width + 10)
    .attr('y', 0)
    .attr('font-size', 20)
    .attr('text-anchor', 'end')
    .attr('dy', -15)
  // Add the shaded rectangle
  svg
    .append('rect')
    .attr('x', d => {
      var december = parseTime('December-16')
      return xPositionScale(december)
    })
    .attr('y', 0)
    .attr('height', height)
    .attr('width', d => {
      var widthStart = parseTime('December-16')
      var widthEnd = parseTime('February-17')
      var rectWidth = xPositionScale(widthEnd) - xPositionScale(widthStart)

      return rectWidth
    })
    .attr('fill', 'lightgray')
    .lower()
  // Add your axes
  var xAxis = d3.axisBottom(xPositionScale).tickFormat(d3.timeFormat('%b %y'))
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  var yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
}

export {
  xPositionScale,
  yPositionScale,
  colorScale,
  line,
  width,
  height,
  parseTime
}
