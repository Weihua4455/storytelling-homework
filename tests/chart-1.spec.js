/* global describe test expect document */

const d3 = require('d3')

/* Fill in our fake web page with our actual index.html */
const fs = require('fs')
document.body.innerHTML = fs.readFileSync('src/index.html')

/* Run the code for our chart */
const chart = require('../src/chart-1')

/* 
  Unit tests
*/

describe('The width', () => {
  test('Was exported', () => {
    expect(chart.width).not.toBeUndefined()
  })
})

describe('The height', () => {
  test('Was exported', () => {
    expect(chart.height).not.toBeUndefined()
  })
})

describe('The time parser', () => {
  test('Was exported', () => {
    expect(chart.parseTime).not.toBeUndefined()
  })

  test('Parses dates correctly', () => {
    let date = new Date(2017, 1)
    expect(chart.parseTime('February-17')).toEqual(date)
  })
})

describe('The x position scale', () => {
  test('Was exported', () => {
    expect(chart.xPositionScale).not.toBeUndefined()
  })

  test('Works with a random date', () => {
    let date = new Date(2017, 3)
    let result = chart.xPositionScale(date)
    let rounded = (result / chart.width).toFixed(2)
    expect(rounded).toEqual('0.82')
  })
})

describe('The y position scale', () => {
  test('Was exported', () => {
    expect(chart.yPositionScale).not.toBeUndefined()
  })
})

describe('The line generator', () => {
  test('Was exported', () => {
    expect(chart.line).not.toBeUndefined()
  })
})

describe('The color scale generator', () => {
  test('Was exported', () => {
    expect(chart.colorScale).not.toBeUndefined()
  })

  test('Has enough color outputs for each section to get its own color', () => {
    expect(chart.colorScale.range().length).toBeGreaterThan(9)
  })
})

/*
  Functional tests
*/

describe('The grey box', () => {
  let nov = new Date(2016, 10)
  let jan = new Date(2017, 0)
  let mar = new Date(2017, 3)

  test('Should exist', () => {
    const rect = d3.selectAll('#chart-1 rect')
    expect(rect).not.toBeNull()
  })

  test('Starts after November, but before January', () => {
    const rect = d3.select('#chart-1 rect')
    const novemberPos = chart.xPositionScale(nov)
    expect(+rect.attr('x')).toBeGreaterThan(novemberPos)
  })

  test('Starts before January', () => {
    const rect = d3.select('#chart-1 rect')
    const januaryPos = chart.xPositionScale(jan)
    expect(+rect.attr('x')).toBeLessThan(januaryPos)
  })

  test('Ends before March', () => {
    const rect = d3.select('#chart-1 rect')
    const x = +rect.attr('x') + +rect.attr('width')
    const marchPos = chart.xPositionScale(mar)

    expect(x).toBeLessThan(marchPos)
  })
})

describe('The group element', () => {
  test('Exists', () => {
    let group = d3.select('#chart-1 > svg > g')
    expect(group).not.toBeNull()
  })
})

describe('The lines', () => {
  test('There should be one for each region', () => {
    let lines = d3.selectAll('#chart-1 > svg > g > path')
    expect(lines.size()).toEqual(10)
  })

  test('They should each have different colors', () => {
    let lines = d3.selectAll('#chart-1 > svg > g > path')
    let uniqueColors = []
    lines.each(function() {
      let color = d3.select(this).attr('stroke')
      if (uniqueColors.indexOf(color) == -1) {
        uniqueColors.push(color)
      }
    })

    expect(uniqueColors.length).toBe(10)
  })
})

describe('The points', () => {
  test('should be one for each region', () => {
    let points = d3.selectAll('#chart-1 > svg > g > circle')
    expect(points.size()).toEqual(10)
  })

  test('are the same color as the lines', () => {
    let pointColors = d3
      .selectAll('#chart-1 > svg > g > circle')
      .nodes()
      .map(e => e.getAttribute('fill'))
    let lineColors = d3
      .selectAll('#chart-1 > svg > g > path')
      .nodes()
      .map(e => e.getAttribute('stroke'))
    pointColors.sort()
    lineColors.sort()
    expect(pointColors).toEqual(lineColors)
  })

  test('are on the right-hand side of the chart', () => {
    d3.selectAll('#chart-1 > svg > g > circle').each(function() {
      let circle = d3.select(this)
      expect(+circle.attr('cx')).toEqual(chart.width)
    })
  })
})

describe('The text', () => {
  test('has the same coordinates as the circles', () => {
    let pointCoords = d3
      .selectAll('#chart-1 > svg > g > circle')
      .nodes()
      .map(e => [+e.getAttribute('cx'), +e.getAttribute('cy')])

    let textCoords = d3
      .selectAll('#chart-1 > svg > g > text')
      .nodes()
      .slice(0, pointCoords.length)
      .map(e => [+e.getAttribute('x'), +e.getAttribute('y')])

    expect(pointCoords).toEqual(textCoords)
  })

  test('uses dx as an offset', () => {
    let dy = +d3.select('#chart-1 > svg > g > text').attr('dx')
    expect(dy).not.toBeUndefined()
    expect(dy).not.toBeNull()
    expect(dy).toBeGreaterThan(0)
  })
})

describe('The y axis', () => {
  test('Exists and has the class y-axis', () => {
    let group = d3.select('#chart-1 .y-axis')
    expect(group).not.toBeNull()
  })

  test('has more than 5 but fewer than 10 tick marks', () => {
    let texts = d3.selectAll('#chart-1 .y-axis text')
    expect(texts.size()).toBeGreaterThan(5)
    expect(texts.size()).toBeLessThan(10)
  })
})

describe('The x axis', () => {
  test('Exists and has the class x-axis', () => {
    let group = d3.select('#chart-1 .x-axis')
    expect(group).not.toBeNull()
  })

  test('is formatted as the abbreviated month name and the 2-digit year', () => {
    let texts = d3.selectAll('#chart-1 .x-axis text')
    texts.each(function(d) {
      let element = d3.select(this)
      expect(element.text()).toMatch(/\w\w\w \d\d/)
    })
  })
})