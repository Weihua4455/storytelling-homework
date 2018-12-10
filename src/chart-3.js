import * as d3 from 'd3'

// Create your margins and height/width
var margin = { top: 15, right: 15, bottom: 40, left: 50 }

var height = 300 - margin.top - margin.bottom
var width = 200 - margin.left - margin.right
// I'll give you this part!
var container = d3.select('#chart-3')

// Create your scales
var xPositionScale = d3
  .scaleLinear()
  .domain([1980, 2010])
  .range([0, width])

var yPositionScale = d3
  .scaleLinear()
  .domain([0, 20000])
  .range([height, 0])

// Create your line generator
var line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.year)
  })
  .y(function(d) {
    return yPositionScale(d.income)
  })

// Read in your data
Promise.all([
  d3.csv(require('./middle-class-income-usa.csv')),
  d3.csv(require('./middle-class-income.csv'))
])
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

// Create your ready function
function ready([incomeUS, incomeWorld]) {
  // console.log('usa income looks like: ', incomeUS)
  // console.log('world income looks like', incomeWorld)

  var nestedWorld = d3
    .nest()
    .key(function(d) {
      return d.country
    })
    .entries(incomeWorld)

  // console.log('nested world income looks like', nestedWorld)

  container
    .selectAll('.country-graph')
    .data(nestedWorld)
    .enter()
    .append('svg')
    .attr('class', 'country-graph')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)

      svg
        .append('path')
        .datum(d.values)
        .attr('d', line)
        .attr('stroke', '#8B0000')
        .attr('fill', 'none')
        .attr('stroke-width', 3)

      svg
        .append('path')
        .datum(incomeUS)
        .attr('d', line)
        .attr('stroke', 'darkgray')
        .attr('fill', 'none')
        .attr('stroke-width', 3)

      svg
        .append('text')
        .text(d.key)
        .attr('x', xPositionScale(1995))
        .attr('y', yPositionScale(20000))
        .attr('stroke', '#8b0000')
        .attr('font-size', 15)
        .attr('dy', -5)
        .attr('text-anchor', 'middle')

      svg
        .append('text')
        .text('USA')
        .attr('font-size', 15)
        .attr('x', xPositionScale(1985))
        .attr('y', yPositionScale(17500))
        .attr('alignment-baseline', 'middle')
        .attr('fill', 'darkgray')
        .attr('font-weight', 'bold')

      var xAxis = d3
        .axisBottom(xPositionScale)
        .tickValues([1980, 1990, 2000, 2010])
        .tickFormat(d3.format(''))
        .tickSize(-height)

      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      svg
        .selectAll('.x-axis line')
        .attr('stroke-dasharray', '2 3')
        .attr('stroke-linecap', 'round')

      svg.select('.x-axis .domain').remove()

      var yAxis = d3
        .axisLeft(yPositionScale)
        .tickValues([5000, 10000, 15000, 20000])
        .tickFormat(d3.format('$,'))
        .tickSize(-width)

      svg
        .append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)

      svg
        .selectAll('.y-axis line')
        .attr('stroke-dasharray', '2 3')
        .attr('stroke-linecap', 'round')

      svg.select('.y-axis .domain').remove()
    })
}

export { xPositionScale, yPositionScale, line, width, height }
