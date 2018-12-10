import * as d3 from 'd3'

// I'll give you margins/height/width
var margin = { top: 40, left: 30, right: 90, bottom: 30 }

var height = 400 - margin.top - margin.bottom
var width = 500 - margin.left - margin.right

// And grabbing your container
var container = d3.select('#chart-4')

// Create your scales
var xPositionScale = d3
  .scaleLinear()
  .domain([-6, 6])
  .range([0, width])

var yPositionScale = d3.scaleLinear().range([height, 0])

// Create your area generator
var line = d3
  .area()
  .x(function(d) {
    return xPositionScale(d.diff)
  })
  .y1(function(d) {
    return yPositionScale(d.freq)
  })
  .y0(height)

// Read in your data, then call ready
d3.tsv(require('./climate-data.tsv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })
// Write your ready function
function ready(datapoints) {
  // console.log(datapoints)
  var freq = datapoints.map(function(d) {
    return d.freq
  })
  var freqMax = d3.max(freq)
  yPositionScale.domain([0, freqMax])

  // console.log('filtered data looks like: ', filtered)
  var filtered = datapoints.filter(function(d) {
    return d.year !== 'normal'
  })

  var filtered1951 = datapoints.filter(function(d) {
    return d.year === '1951'
  })

  var nested = d3
    .nest()
    .key(d => d.year)
    .entries(filtered)

  var keys = nested.map(d => d.key)

  var titleScale = d3
    .scaleOrdinal()
    .domain(keys)
    .range(['1951 to 1983', '1983 to 1993', '1994 to 2004', '2005 to 2015'])
  // console.log('nested data looks like: ', nested)

  container
    .selectAll('.year-graph')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'year-graph')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      var svg = d3.select(this)

      var dValues = d.values

      var veryCold = dValues.filter(function(d) {
        return d.diff <= -3
      })

      var cold = dValues.filter(function(d) {
        return d.diff <= -0.9 && d.diff >= -3
      })

      var normal = dValues.filter(function(d) {
        return d.diff <= 0.9 && d.diff >= -0.9
      })
      var hot = dValues.filter(function(d) {
        return d.diff <= 3 && d.diff >= 0.9
      })

      var veryHot = dValues.filter(function(d) {
        return d.diff >= 3
      })

      var tempList = [veryCold, cold, normal, hot, veryHot]

      // console.log(tempList.length)
      var colorScale = d3
        .scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range(['#236085', '#96bccf', '#cac7c7', '#ee9f71', '#c9604b'])
      // console.log(nested)
      tempList.forEach(function(d, i) {
        // console.log('what is d', d)
        // console.log('what is i', i)

        // console.log(colorScale(i))
        svg
          .append('path')
          .datum(d)
          .attr('d', line)
          .attr('fill', colorScale(i))
      })

      // svg
      //   .append('path')
      //   .datum(veryCold)
      //   .attr('d', line)
      //   .attr('fill', '#236085')
      //
      // svg
      //   .append('path')
      //   .datum(cold)
      //   .attr('d', line)
      //   .attr('fill', '#96bccf')
      //
      // svg
      //   .append('path')
      //   .datum(normal)
      //   .attr('d', line)
      //   .attr('fill', '#cac7c7')
      // svg
      //   .append('path')
      //   .datum(hot)
      //   .attr('d', line)
      //   .attr('fill', '#ee9f71')
      // svg
      //   .append('path')
      //   .datum(veryHot)
      //   .attr('d', line)
      //   .attr('fill', '#c9604b')

      svg
        .append('path')
        .datum(filtered1951)
        .attr('d', line)
        .attr('fill', '#DCDCDC')
        .lower()

      var textList = [
        'Extremely Cold',
        'Cold',
        'Normal',
        'Hot',
        'Extremely Hot'
      ]

      textList.forEach(function(d, i) {
        svg
          .append('text')
          .text(d)
          .attr('stroke', colorScale(i))
          .attr('y', height + 20)
          .attr('x', xPositionScale(2.25 * i - 4.5))
          .attr('text-anchor', 'middle')
          .attr('font-size', 12)
      })

      svg
        .append('text')
        .text(titleScale(d.key))
        .attr('font-size', 17)
        .attr('y', 0)
        .attr('x', xPositionScale(0))
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .attr('dy', -10)

      var xAxis = d3
        .axisBottom(xPositionScale)
        .tickSize(-height)
        .tickValues([-3, -0.9, 0.9, 3])

      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('stroke-dasharray', '2 2')
        .call(xAxis)

      svg.select('.x-axis .domain').remove()
      svg.selectAll('.tick text').remove()
    })
}
