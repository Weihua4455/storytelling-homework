/* global describe test expect document */

const d3 = require('d3')

/* Fill in our fake web page with our actual index.html */
const fs = require('fs')
document.body.innerHTML = fs.readFileSync('src/index.html')

/* Run the code for our chart */
const chart = require('../src/chart-3')

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

  test('goes from 1980 to 2010', () => {
    expect(chart.xPositionScale(1980)).toEqual(0)
    expect(chart.xPositionScale(2010)).toEqual(chart.width)
  })
})

describe('The y position scale', () => {
  test('Was exported', () => {
    expect(chart.yPositionScale).not.toBeUndefined()
  })

  test('goes from 0 to $20k', () => {
    expect(chart.yPositionScale(0)).toEqual(chart.height)
    expect(chart.yPositionScale(20000)).toEqual(0)
  })
})

/*
  Functional tests
*/

describe('Each graph', () => {
  test('has a group element inside of it', () => {
    const divs = d3.selectAll('#chart-3 > div')
    const groups = d3.selectAll('#chart-3 > div > g')

    expect(divs.size()).toEqual(groups.size())
  })
})

describe('Graph lines', () => {
  test('one path for US and one for the other country', () => {
    const paths = d3.selectAll('#chart-3 svg:first-child > g > path')
    expect(paths.size()).toEqual(2)
  })

  test('each one is a different color', () => {
    const pathColors = d3
      .selectAll('#chart-3 > svg:first-child > g > path')
      .nodes()
      .map(node => node.getAttribute('stroke'))
      .sort()
    expect(pathColors[0]).not.toEqual(pathColors[1])
  })
})

describe('Graph text', () => {
  test('there are two pieces of text', () => {
    const texts = d3.selectAll('#chart-3 > svg:first-child > g > text')
    expect(texts.size()).toEqual(2)
  })

  test('one is the name of the country and one is "USA"', () => {
    const texts = d3
      .selectAll('#chart-3 > svg:first-child > g > text')
      .nodes()
      .map(node => node.innerHTML)
      .sort()

    expect(texts[0]).toEqual('Canada')
    expect(texts[1]).toEqual('USA')
  })
})

describe('The x axis', () => {
  test('Exists and has the class x-axis', () => {
    let group = d3.select('#chart-3 svg:first-child .x-axis')
    expect(group).not.toBeNull()
  })

  test('has tick marks at 1980, 1990, 2000 and 2010', () => {
    let texts = d3
      .selectAll('#chart-3 svg:first-child .x-axis text')
      .nodes()
      .map(node => node.innerHTML)
    texts.sort()
    expect(texts).toEqual(['1980', '1990', '2000', '2010'])
  })
})

describe('The y axis', () => {
  test('Exists and has the class y-axis', () => {
    let group = d3.select('#chart-3 svg:first-child .y-axis')
    expect(group).not.toBeNull()
  })

  test('is formatted with a $ and comma for the thousands', () => {
    let texts = d3.selectAll('#chart-3 svg:first-child .y-axis text')
    texts.each(function(d) {
      let element = d3.select(this)
      expect(element.text()).toMatch(/\$\d+,000/)
    })
  })
})
