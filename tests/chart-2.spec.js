/* global describe test expect document */

const d3 = require('d3')

/* Fill in our fake web page with our actual index.html */
const fs = require('fs')
document.body.innerHTML = fs.readFileSync('src/index.html')

/* Run the code for our chart */
const chart = require('../src/chart-2')

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

describe('The x position scale', () => {
  test('Was exported', () => {
    expect(chart.xPositionScale).not.toBeUndefined()
  })
})

describe('The y position scale', () => {
  test('Was exported', () => {
    expect(chart.yPositionScale).not.toBeUndefined()
  })
})

/*
  Functional tests
*/

describe('The graphs', () => {
  test('there is one for every year', () => {
    const divs = d3.selectAll('#chart-2 > div')
    expect(divs.size()).toBeLessThan(68)
  })
})

describe('In each graph', () => {
  test('there is a title and two notes', () => {
    const texts = d3.selectAll('#chart-2 > svg:first-child > g > text')
    expect(texts.size()).toBe(3)
  })
})

describe('Colors', () => {
  test('Each area is a different color', () => {
    const colors = d3
      .select('#chart-2 > svg:first-child > g > path')
      .nodes()
      .map(node => node.getAttribute('fill'))
    expect(colors[0]).not.toEqual(colors[1])
  })

  test('The text colors match the area colors', () => {
    const pathColors = d3
      .selectAll('#chart-2 > svg:first-child > g > path')
      .nodes()
      .map(node => node.getAttribute('fill'))
      .sort()

    const textColors = d3
      .selectAll('#chart-2 > svg:first-child > g > text')
      .nodes()
      .map(node => node.getAttribute('fill'))
      .sort()

    pathColors.forEach(color => {
      expect(textColors).toContain(color)
    })
  })
})
