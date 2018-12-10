import * as d3 from 'd3'

let margin = { top: 20, left: 0, right: 0, bottom: 0 }

let height = 430 - margin.top - margin.bottom
let width = 300 - margin.left - margin.right

var container = d3.select('#chart-2')

let radius = 120

let radiusScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, radius])

var angleScale = d3.scaleBand().range([0, Math.PI * 2])

var line = d3
  .radialLine()
  .radius(d => radiusScale(d.value / d.max))
  .angle(d => angleScale(d.name))

d3.csv(require('./data/nba.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  container
    .selectAll('.player-graph')
    .data(datapoints)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('class', d => d.Team)
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .each(function(eachPlayer) {
      var svg = d3.select(this)

      // console.log(eachPlayer)
      var playerId = eachPlayer.Name.replace(' ', '-')

      let player = [
        { name: 'Minutes', value: eachPlayer.MP, max: 60 },
        { name: 'Points', value: eachPlayer.PTS, max: 30 },
        { name: 'Field Goals', value: eachPlayer.FG, max: 10 },
        { name: '3-Point Field Goals', value: eachPlayer.ThreeP, max: 5 },
        { name: 'Free Throws', value: eachPlayer.FT, max: 10 },
        { name: 'Rebounds', value: eachPlayer.TRB, max: 15 },
        { name: 'Assists', value: eachPlayer.AST, max: 10 },
        { name: 'Steals', value: eachPlayer.STL, max: 5 },
        { name: 'Blocks', value: eachPlayer.BLK, max: 5 }
      ]

      player.push(player[0])
      // console.log(player)

      let categories = player.map(d => d.name)
      angleScale.domain(categories)

      let bands = [0.2, 0.4, 0.6, 0.8, 1]

      svg
        .datum(player)
        .append('mask')
        .attr('id', d => {
          // console.log(playerId)
          return playerId
        })
        .append('path')
        .attr('fill', 'white')
        .attr('d', line)

      svg
        .selectAll(`.${playerId}-scale-band-shape`)
        .data(bands.reverse())
        .enter()
        .append('circle')
        .attr('class', `${playerId}-scale-band-shape`)
        .attr('r', d => radiusScale(d))
        .attr('stroke', 'none')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('mask', d => {
          return `url(#${playerId})`
        })

      svg
        .selectAll(`.${playerId}-label-text`)
        .data(player)
        .enter()
        .append('text')
        .attr('class', `${playerId}-label-text`)
        .text(d => d.name)
        .attr('font-weight', '600')
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('alignment-baseline', 'middle')
        .attr('transform', d => {
          let r = radius + 12
          let a = angleScale(d.name)

          let xPosition = Math.sin(a) * r
          let yPosition = Math.cos(a) * r * -1
          let rotation = (a / Math.PI) * 180
          return `translate(${xPosition}, ${yPosition})rotate(${rotation})`
        })

      svg
        .selectAll(`.${playerId}-scale-band`)
        .data(bands.reverse())
        .enter()
        .append('circle')
        .attr('class', `${playerId}-scale-band`)
        .attr('r', d => radiusScale(d))
        .style('fill', (d, i) => {
          // console.log('Looking at circle number', i)
          if (i % 2 === 0) {
            return '#e8e7e5'
          } else {
            return '#f6f6f6'
          }
        })
        .attr('stroke', 'none')
        .attr('cx', 0)
        .attr('cy', 0)
        .lower()

      svg
        .append('text')
        .attr('font-weight', '600')
        .attr('text-anchor', 'middle')
        .attr('font-size', 25)
        .attr('alignment-baseline', 'middle')
        .text(d => eachPlayer.Name)
        .attr('y', -radiusScale(1) - 60)
      // console.log(eachPlayer)

      let longTeamNames = {
        CLE: 'Cleveland Cavaliers',
        GSW: 'Golden State Warriors',
        SAS: 'San Antonio Spurs',
        MIN: 'Minnesota Timberwolves',
        MIL: 'Milwaukee Bucks',
        PHI: 'Philadelphia 76ers',
        OKC: 'Oklahoma City Thunder',
        NOP: 'New Orleans Pelicans',
        HOU: 'Houston Rockets'
      }

      svg
        .append('text')
        .attr('font-weight', '600')
        .attr('text-anchor', 'middle')
        .attr('font-size', 15)
        .attr('alignment-baseline', 'middle')
        .text(d => {
          var shortTeamName = eachPlayer.Team
          return longTeamNames[shortTeamName]
        })
        .attr('y', -radiusScale(1) - 40)

      d3.selectAll(`.${playerId}-scale-band`).each(function(percentage, i) {
        // console.log(percentage)
        svg
          .selectAll('.label-tick')
          .data(player)
          .enter()
          .append('text')
          .text(d => d.max * percentage)
          .attr('text-anchor', 'middle')
          .attr('font-size', 11.5)
          .attr('alignment-baseline', 'middle')
          .attr('transform', d => {
            let r = radiusScale(percentage)
            let a = angleScale(d.name)

            let xPosition = Math.sin(a) * r
            let yPosition = Math.cos(a) * r * -1
            let rotation = (a / Math.PI) * 180
            return `translate(${xPosition}, ${yPosition})rotate(${rotation})`
          })
      })
    })
}
