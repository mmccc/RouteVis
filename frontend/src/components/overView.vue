<template>
  <div class="overview">
    <Card style="height:67vh">
      <p slot="title" style=" text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
        <span class="viewTitle">Temporal Summary</span>
        <span style="color:black; margin-left: 8%; font-weight: 400;">Rank:</span>
        <Select v-model="rankSelct" @on-change="selectRank()" size="small" style="width:80px;">
          <Option v-for="item in rankList" :value="item.value" :key="item.value" filterable>{{ item.label }}</Option>
        </Select>
      </p>
      <div id="container"></div>

    </Card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  components: {},
  name: 'overview',
  data() {
    return {
      base_url: 'http://127.0.0.1:8700/',
      rankSelct: 'date',
      drawData: '',
      rankList: [
        {
          value: 'date',
          label: 'Date'
        },
        {
          value: 'volume',
          label: 'Volume'
        },
        {
          value: 'ascore',
          label: 'Abnormal'
        },
        {
          value: 'drew',
          label: 'Dawn'
        },
        {
          value: 'morning',
          label: 'Morning'
        },
        {
          value: 'afternoon',
          label: 'Afternoon'
        },
        {
          value: 'night',
          label: 'Evening'
        },
        {
          value: 'type',
          label: 'Type'
        }
      ]
    }
  },
  watch: {},
  computed: {},
  created() {
  },
  mounted() {
    this.getTabledata();
  },
  methods: {
    getTabledata() {
      axios.get(this.base_url + 'dayinfo')
        .then(res => {
          this.drawData = res.data;
          this.drawTimeOverview(this.drawData, this.rankSelct);
        });
    },
    selectRank() {
      this.drawTimeOverview(this.drawData, this.rankSelct);
    },
    drawTimeOverview(data, rankway) {
      $('#container').empty();
      switch (rankway) {
        case 'volume':
          data.sort(function (a, b) {
            return b.volume - a.volume;
          });
          break;
        case 'ascore':
          data.sort(function (a, b) {
            return b.ascore - a.ascore;
          });
          break;
        case 'drew':
          data.sort(function (a, b) {
            return b.drew - a.drew;
          });
          break;
        case 'morning':
          data.sort(function (a, b) {
            return b.morning - a.morning;
          });
          break;
        case 'afternoon':
          data.sort(function (a, b) {
            return b.afternoon - a.afternoon;
          });
          break;
        case 'night':
          data.sort(function (a, b) {
            return b.night - a.night;
          });
          break;
        case 'date':
          data.sort(function (a, b) {
            return a.ID - b.ID;
          });
          break;
        case 'type':
          data.sort(function (a, b) {
            return a.holiday - b.holiday;
          });
          break;
      }

      var tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('padding', '10px')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('border-radius', '4px')
        .style('color', '#fff')
        .text('a simple tooltip');

      const margin = {top: 20, left: 33, right: 5, bottom: 20};
      const container = d3.select("#container").append('svg').attr('id', 'hourInfo');
      const svg = d3.select("#hourInfo");
      const height = d3.select("#hourInfo")._groups[0][0].clientHeight;
      const dayColor = ['#287271', '#E66F51', '#834026'];

      const g = svg.append("g")
        .attr("id", "maingroup").attr('transform', `translate(${margin.left},${margin.top})`);

      const outerColor = '#C0C0C0';

      var legendData = [];
      for (var i = 0; i <= 10; i++) {
        legendData.push(i);
      }

      svg.append("g")
        .append("text")
        .attr("x", 2)
        .attr("y", 20)
        .text('Weekday:')
        .style("font", "10px sans-serif");
      svg.append("g")
        .selectAll("g")
        .data(legendData)
        .enter()
        .append("g")
        .append("rect")
        .attr("x", (d, i) => 48 + i * 3)
        .attr("y", 10)
        .attr("width", 3)
        .attr("height", 10)
        .style("fill", '#287271')
        .attr("opacity", d => d / 10);

      svg.append("g")
        .append("text")
        .attr("x", 48)
        .attr("y", 9)
        .text('0')
        .style("font", "8px sans-serif");

      svg.append("g")
        .append("text")
        .attr("x", 78)
        .attr("y", 9)
        .text('1')
        .style("font", "8px sans-serif");

      svg.append("g")
        .append("text")
        .attr("x", 112)
        .attr("y", 20)
        .text('Weekend:')
        .style("font", "10px sans-serif");
      svg.append("g")
        .selectAll("g")
        .data(legendData)
        .enter()
        .append("g")
        .append("rect")
        .attr("x", (d, i) => 161 + i * 3)
        .attr("y", 10)
        .attr("width", 3)
        .attr("height", 10)
        .style("fill", '#834026')
        .attr("opacity", d => d / 10);

      svg.append("g")
        .append("text")
        .attr("x", 161)
        .attr("y", 9)
        .text('0')
        .style("font", "8px sans-serif");

      svg.append("g")
        .append("text")
        .attr("x", 190)
        .attr("y", 9)
        .text('1')
        .style("font", "8px sans-serif");

      svg.append("g")
        .append("text")
        .attr("x", 220)
        .attr("y", 20)
        .text('Holiday:')
        .style("font", "10px sans-serif");

      svg.append("g")
        .selectAll("g")
        .data(legendData)
        .enter()
        .append("g")
        .append("rect")
        .attr("x", (d, i) => 260 + i * 3)
        .attr("y", 10)
        .attr("width", 3)
        .attr("height", 10)
        .style("fill", '#E66F51')
        .attr("opacity", d => d / 10);

      svg.append("g")
        .append("text")
        .attr("x", 262)
        .attr("y", 9)
        .text('0')
        .style("font", "8px sans-serif");

      svg.append("g")
        .append("text")
        .attr("x", 290)
        .attr("y", 9)
        .text('1')
        .style("font", "8px sans-serif");

      const filterDate = (datum) => {
        return datum['ID']
      };

      const allDate = Array.from(new Set(data.map(d => filterDate(d))));
      const yscale = d3.scaleBand().domain(allDate).range([margin.top, height - margin.bottom]);

      const cardHeight = 35;
      const cardWidth = 240;
      const barleftmargin = 3;
      const gridSize = cardWidth / 24;
      const barwidth = gridSize - barleftmargin;
      const bartopmargin = 6;
      const upRectWidth = 6;

      const dayCards = g.selectAll('.day')
        .append("g")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", margin.left)
        .attr("y", d => yscale(d.ID))
        .attr("width", cardWidth)
        .attr("height", cardHeight)
        .attr("fill", 'white')
        .attr("opacity", 0.8);

      const upLine = g.selectAll('.upline')
        .append("g")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", d => yscale(d.ID))
        .attr("x2", margin.left + cardWidth)
        .attr("y2", d => yscale(d.ID))
        .attr("stroke", d => dayColor[d.holiday])
        .attr("stroke-width", "2px");

      const downLine = g.selectAll('.downline')
        .append("g")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", d => yscale(d.ID) + cardHeight)
        .attr("x2", margin.left + cardWidth)
        .attr("y2", d => yscale(d.ID) + cardHeight)
        .attr("stroke", d => dayColor[d.holiday])
        .attr("stroke-width", "2px");

      for (var i = 0; i < data.length; i++) {
        var hourArray = [];
        for (var k = 0; k < 24; ++k) {
          hourArray.push(data[i]["hour" + k])
        }

        g.selectAll(".hour")
          .append("g")
          .data(hourArray)
          .enter()
          .append("rect")
          .attr("x", (d, j) => margin.left + j * (gridSize))
          .attr("y", (d, j) => yscale(data[i].ID) + 0.8 * bartopmargin)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("width", barwidth)
          .attr("height", cardHeight - 1.5 * bartopmargin)
          .style("fill", d => dayColor[data[i].holiday])
          .attr("opacity", (d, j) => hourArray[j])
          .on('mouseover', function (e, d) {
            tooltip
              .html(
                `<div>Number of Trajectories:${d.toFixed(2)}</div>`
              )
              .style('visibility', 'visible');
          })
          .on('mousemove', function (e) {
            tooltip
              .style('top', e.pageY - 10 + 'px')
              .style('left', e.pageX + 10 + 'px');
          })
          .on('mouseout', function (e) {
            tooltip.html(``).style('visibility', 'hidden');
          });


        var houravgArray = [];
        for (var k = 0; k < 24; ++k) {
          houravgArray.push(data[i]["avg" + k])
        }
        const upHour = g.selectAll(".uphour").append("g");
        upHour.append("g")
          .data(houravgArray)
          .enter()
          .append("rect")
          .attr("width", upRectWidth)
          .attr("height", upRectWidth)
          .attr("transform", (d, j) => `translate(${margin.left + j * gridSize + (gridSize - upRectWidth) / 2},${yscale(data[i].ID) - 1.8 * bartopmargin}) rotate(45)`)
          .style("fill", d => dayColor[data[i].holiday])
          .attr("opacity", (d, j) => houravgArray[j])
          .on('mouseover', function (e, d) {
            tooltip
              .html(
                `<div>Hourly Abnormal Score:${d.toFixed(2)}</div>`
              )
              .style('visibility', 'visible');
          })
          .on('mousemove', function (e) {
            tooltip
              .style('top', e.pageY - 10 + 'px')
              .style('left', e.pageX + 10 + 'px');
          })
          .on('mouseout', function (e) {
            tooltip.html(``).style('visibility', 'hidden');
          });

        const leftglyph = g.append("g").attr("transform", d => `translate(0,${yscale(data[i].ID) + bartopmargin * 2})`);
        const outerScale = d3.scaleLinear().domain([0, 1]).range([1, 2]);
        leftglyph.append("circle")
          .style("stroke", outerColor)
          .style("stroke-width", 0.7)
          .style("fill", "white")
          .attr("r", 18.5);

        leftglyph.append("circle")
          .style("stroke", outerColor)
          .style("fill", "white")
          .attr("r", 17);

        const avgScale = d3.scaleLinear().domain([0, 1]).range([18.8, 22]);
        const tempArcdata = [];
        var tempavg = [];

        for (let k = 0; k <= 23; k++) {
          switch (k) {
            case 0:
              tempavg = data[i].disavg0;
              break;
            case 1:
              tempavg = data[i].disavg1;
              break;
            case 2:
              tempavg = data[i].disavg2;
              break;
            case 3:
              tempavg = data[i].disavg3;
              break;
            case 4:
              tempavg = data[i].disavg4;
              break;
            case 5:
              tempavg = data[i].disavg5;
              break;
            case 6:
              tempavg = data[i].disavg6;
              break;
            case 7:
              tempavg = data[i].disavg7;
              break;
            case 8:
              tempavg = data[i].disavg8;
              break;
            case 9:
              tempavg = data[i].disavg9;
              break;
            case 10:
              tempavg = data[i].disavg10;
              break;
            case 11:
              tempavg = data[i].disavg11;
              break;
            case 12:
              tempavg = data[i].disavg12;
              break;
            case 13:
              tempavg = data[i].disavg13;
              break;
            case 14:
              tempavg = data[i].disavg14;
              break;
            case 15:
              tempavg = data[i].disavg15;
              break;
            case 16:
              tempavg = data[i].disavg16;
              break;
            case 17:
              tempavg = data[i].disavg17;
              break;
            case 18:
              tempavg = data[i].disavg18;
              break;
            case 19:
              tempavg = data[i].disavg19;
              break;
            case 20:
              tempavg = data[i].disavg20;
              break;
            case 21:
              tempavg = data[i].disavg21;
              break;
            case 22:
              tempavg = data[i].disavg22;
              break;
            case 23:
              tempavg = data[i].disavg23;
              break;
          }
          tempArcdata.push({
            'value': tempavg,
            'startAngle': Math.PI * (k * 2 / 24),
            'endAngle': Math.PI * (k * 2 / 24)
          });
        }
        const avgArcPath = d3.arc()
          .innerRadius(18.8)
          .outerRadius((d) => avgScale(d.value));

        leftglyph.selectAll("path")
          .data(tempArcdata)
          .join("path")
          .attr('d', avgArcPath)
          .attr('stroke', outerColor)
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .on('mouseover', function (e, d, i) {
            tooltip
              .html(
                `<div>Hourly Average Distance:${d.value.toFixed(2)}</div>`
              )
              .style('visibility', 'visible');
          })
          .on('mousemove', function (e) {
            tooltip
              .style('top', e.pageY - 10 + 'px')
              .style('left', e.pageX + 10 + 'px');
          })
          .on('mouseout', function (e) {
            tooltip.html(``).style('visibility', 'hidden');
          });

        var tempFour = [];
        const innerScale = d3.scaleLinear().domain([0, 0.02, 1]).range([6, 9, 16.4]);
        const arc = d3.arc()
          .innerRadius(6.5)
          .outerRadius((d) => innerScale(d.data.value));

        const tempPiedata = [];
        for (let k = 0; k < 4; k++) {
          switch (k) {
            case 0:
              tempFour = data[i].drew;
              break;
            case 1:
              tempFour = data[i].morning;
              break;
            case 2:
              tempFour = data[i].afternoon;
              break;
            case 3:
              tempFour = data[i].night;
              break;
          }
          tempPiedata.push({
            'name': i,
            'value': tempFour
          });
        }

        const leftPie = d3.pie().value(1);

        leftglyph.append("g")
          .attr("stroke", "white")
          .attr("stroke-width", 0.4)
          .selectAll("path")
          .data(leftPie(tempPiedata))
          .join("path")
          .attr("fill", '#A9A9A9')
          .attr("d", arc)
          .on('mouseover', function (e, d, i) {
            tooltip
              .html(
                `<div>Number of Trajectories:${d.data.value.toFixed(2)}</div>`
              )
              .style('visibility', 'visible');

          })
          .on('mousemove', function (e) {
            tooltip
              .style('top', e.pageY - 10 + 'px')
              .style('left', e.pageX + 10 + 'px');
          })
          .on('mouseout', function (e) {
            tooltip.html(``).style('visibility', 'hidden');

          });

        const innerAScale = d3.scaleLinear().domain([0, 1]).range([0.5, 0.8]);

        leftglyph.append("g")
          .append("circle")
          .data([data[i].ascore])
          .attr("stroke", 'none')
          .attr("r", 6.7)
          .attr("fill", "black")
          .attr("opacity", innerAScale(data[i].ascore))
          .on('mouseover', function (e, d) {
            tooltip
              .html(
                `<div>Abnormal Score:${d.toFixed(2)}</div>`
              )
              .style('visibility', 'visible');
          })
          .on('mousemove', function (e) {
            tooltip
              .style('top', e.pageY - 10 + 'px')
              .style('left', e.pageX + 10 + 'px');
          })
          .on('mouseout', function (e) {
            tooltip.html(``).style('visibility', 'hidden');
          });

      }

      g.selectAll(".daytext")
        .append("g")
        .attr("class", "daytext")
        .data(data)
        .enter()
        .append("text")
        .attr("x", -margin.left / 2)
        .attr("y", d => yscale(d.ID) + cardHeight + bartopmargin * 2)
        .attr("font-size", "8")
        .text(function (d, i) {
          return data[i].ID;
        });

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
div#container {
  height: 726px;
  width: 332px;
  overflow-y: auto;
}

svg#hourInfo {
  height: 1800px;
  width: 310px;
}

.ivu-card-bordered {
  border: 2px solid #DDDFE0;
  border-color: #DDDFE0;
}

.ivu-card-head {
  background: #DDDFE0;
}

.viewTitle {
  font-size: 16px;
  color: #696969;
}
</style>
