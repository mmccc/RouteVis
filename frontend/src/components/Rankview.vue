<template>
  <div class="rankview" style="margin-top: 2px;">
    <Card style="height:32vh">
      <p slot="title" style="font-size: 16px; text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
        <span class="viewTitle">Multi-Factor Exploration</span>
      </p>

      <div id="mychart">
        <div>
          <div style="width:20%; height:320px; float: left;">
            <Button @click="rankByAbsolute" icon="ios-barcode"
                    style="color: black; font-size:16px; padding: 0px 4px; width: 27px; position: absolute; top: 37px; left: 88px;"></Button>
            <Button @click="rankByValues" icon="ios-barcode-outline"
                    style="color: black; font-size:16px; padding: 0px 4px; width: 27px; position: absolute; top: 37px;  left: 122px;"></Button>
            <svg width="220" height="300" id="attribute" style="margin-top: 24px;"></svg>
          </div>
          <div id="rank_container" style="float: left; margin-left: 5px; width: 79.5%;"></div>
        </div>
        <Modal v-model="showRadarModel" draggable sticky scrollable :closable="false" ok-text="OK" cancel-text="Cancel">
          <Card style="height:47vh">
            <p slot="title" style="text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
              <span class="viewTitle">Rardar-Comparision</span>
            </p>
            <div id="radarContent" style="width: 440px; height: 500px;"></div>
          </Card>
        </Modal>
      </div>
    </Card>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'rankview',
  data() {
    return {
      base_url: 'http://127.0.0.1:8700/',
      rankData: '',
      rankData1: '',
      showRadarModel: false
    }
  },
  watch: {
    tsneSelectCluster() {
      this.getRank();
    },
    rerankData() {
      this.drawRank(this.$store.state.rankData);
    }
  },
  computed: {
    tsneSelectCluster() {
      return this.$store.state.clusterNum;
    },
    rerankData() {
      return this.$store.state.rankData;
    }
  },
  created() {

  },
  mounted() {},
  methods: {
    getRank() {
      axios.get(this.base_url + 'rank?clusterNum=' + this.$store.state.clusterNum)
        .then(res => {
          this.$store.state.rankData = res.data;
          for (var i = 0; i < res.data.totalWeight.length; i++) {
            switch (res.data.totalWeight[i].attributeName) {
              case 'Cost':
                this.$store.state.tc = res.data.totalWeight[i].value;
                break;
              case 'Familiarity':
                this.$store.state.rf = res.data.totalWeight[i].value;
                break;
              case 'Distance':
                this.$store.state.trd = res.data.totalWeight[i].value;
                break;
              case 'Congestion':
                this.$store.state.trc = res.data.totalWeight[i].value;
                break;
              case 'Signal':
                this.$store.state.tl = res.data.totalWeight[i].value;
                break;
              case 'Departure':
                this.$store.state.dt = res.data.totalWeight[i].value;
                break;
            }
          }

          this.$store.state.rankData.totalWeight.sort(function (a, b) {
            return a.value - b.value;
          });
          this.drawRank(this.$store.state.rankData);
        });
    },
    drawRank(data) {
      console.log(data);
      $('#attribute').empty();
      $('#rank_container').empty();

      var tooltip = d3.select('body')
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

      const svgar = d3.select("#attribute");
      const margin = {top: 10, right: 10, bottom: 10, left: 35};
      const bar_width = +svgar.attr('width') - margin.left - margin.right;
      const bar_height = +svgar.attr('height') - margin.top - margin.bottom;
      const bar_max = d3.max(data.totalWeight, d => d.value);
      const bar_min = d3.min(data.totalWeight, d => d.value);

      const x0 = Math.max(Math.abs(bar_min), Math.abs(bar_max));

      const bar_yScale = d3.scaleBand()
        .range([margin.top, bar_height - margin.top])
        .domain(data.totalWeight.map(d => d.attributeName))
        .padding(0.2);

      const bar_xScale = d3.scaleLinear()
        .range([margin.left + 21, bar_width])
        .domain([0, x0]);

      const g = svgar.append("g")
        .attr("id", "maingroup")
        .attr('transform', `translate(${margin.left},${margin.top})`);

      g.append("g")
        .call(d3.axisLeft(bar_yScale).tickSizeOuter(0))
        .attr("transform", `translate(${margin.left},0)`);

      g.append("g")
        .call(d3.axisTop(bar_xScale).tickFormat('').tickSize(3).tickSizeOuter(0).ticks(5))
        .attr("transform", `translate(${-21},${12})`);

      svgar.append("g")
        .selectAll(".bars")
        .data(data.totalWeight)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => bar_yScale(d.attributeName) + bar_yScale.bandwidth() * 2 / 4 + 2)
        .attr("x", bar_xScale(0) + margin.left / 2 - 5)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("height", 16)
        .attr("width", d => Math.abs(bar_xScale(d.value) - bar_xScale(0)))
        .style("fill", d => d.value > 0 ? "#E66F51" : "#287271");

      svgar
        .append("g")
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .style("font", "8px sans-serif")
        .style('font-weight', 'bold')
        .selectAll("text")
        .data(data.totalWeight)
        .enter()
        .append("text")
        .attr("x", d => bar_xScale(Math.abs(d.value)) + margin.left)
        .attr("y", d => bar_yScale(d.attributeName) + bar_yScale.bandwidth() * 3 / 4 + 2)
        .attr("dy", "0.35em")
        .text(d => d.value)
        .style("fill", d => d.value > 0 ? "#E66F51" : "#287271");

      const rectmargin = {top: 10, left: 10, right: 10, bottom: 10};
      const svgtr = d3.select("#rank_container")
        .append('svg')
        .attr('id', 'rankInfo');
      const rectsvg = d3.select("#rankInfo");
      const rect_width = d3.select("#rank_container")._groups[0][0].clientWidth - rectmargin.right - rectmargin.left;
      const temp_height = d3.select("#rank_container")._groups[0][0].clientHeight - rectmargin.top - rectmargin.bottom;
      const gridSize = 22;
      const x_gap = (gridSize + 25) * data.rankImportance.length / 5;
      const rect_height = d3.max([x_gap, temp_height]);
      let containerA = document.getElementById("rankInfo").setAttribute('height', rect_height + 'px');

      const rectg = svgtr.append("g")
        .attr("id", "maingroup")
        .attr('transform', `translate(${rectmargin.left},${rectmargin.top})`);

      svgtr.append("g")
        .append("rect")
        .attr("x", 30)
        .attr("y", 8)
        .attr("width", 8)
        .attr("height", 10)
        .attr("fill", '#E66F51');

      svgtr.append("g")
        .append("text")
        .attr("x", 40)
        .attr("y", 14)
        .text("positive")
        .style("font-size", 8);

      svgtr.append("g")
        .append("rect")
        .attr("x", 80)
        .attr("y", 8)
        .attr("width", 8)
        .attr("height", 10)
        .attr("fill", '#287271');

      svgtr.append("g")
        .append("text")
        .attr("x", 90)
        .attr("y", 14)
        .text("nagetive")
        .style("font-size", 8);

      const filterId = (datum) => {
        return datum['RouteId']
      };
      const filterAtr = (datum) => {
        return datum['attrname']
      };

      const rect_data = data.rankImportance;
      const allIds = Array.from(new Set(rect_data.map(d => filterId(d))));
      const allATrS = Array.from(new Set(rect_data.map(d => filterAtr(d))));
      const val_max = Math.max(Math.abs(d3.max(rect_data, d => d.value)), Math.abs(d3.min(rect_data, d => d.value))); // 最大、最小值的绝对值
      const rect_xscale = d3.scaleBand().domain(allATrS).range([rectmargin.left * 14, rect_width - rectmargin.right]);
      const rect_rscale = d3.scaleLinear().domain([0, val_max]).range([0, gridSize]);
      const rect_yscale_bandwidth = 62.8;
      const rect_g = svgtr.append("g")
        .attr("id", "mainrect")
        .attr('transform', `translate(${rectmargin.top},${rectmargin.left})`);

      const radius = 20;

      function radialPoint(x, y) {
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)]
      }

      const circleRScale = d3.scaleLinear().domain([0, 1]).range([0, 6]);
      const tree = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

      for (var i = 0; i < data.routeRaw.length; i++) {
        const circleGroup = svgtr.append("g").attr('transform', `translate(${110}, ${(i + 1) * rect_yscale_bandwidth})`);
        var circleData = d3.hierarchy(data.routeRaw[i]);

        const root = tree(circleData);
        root.descendants().forEach((d, i) => {
          d.id = i;
          d._children = d.childrens;
        });

        circleGroup.append("g")
          .attr("fill", "none")
          .attr("stroke", "#555555")
          .attr("stroke-opacity", 0.4)
          .attr("stroke-width", 1.5)
          .selectAll("line")
          .data(root.links(), d => d)
          .enter()
          .append("line")
          .attr("x1", d => radialPoint(d.source.x, d.source.y)[0])
          .attr("y1", d => radialPoint(d.source.x, d.source.y)[1])
          .attr("x2", d => radialPoint(d.target.x, d.target.y)[0])
          .attr("y2", d => radialPoint(d.target.x, d.target.y)[1]);

        circleGroup.append("g")
          .selectAll("circle")
          .data(root.descendants(), d => d)
          .enter()
          .append("circle")
          .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
          .attr("r", d => circleRScale(d.data.value)) //如果是根节点，中间的圆不绘制
          .attr("stroke", d => d.data.name.slice(0, 5) == 'Route' ? 'gray' : "white")
          .attr("stroke-width", d => d.data.name.slice(0, 5) == 'Route' ? 1 : 0)
          .attr('stroke-dasharray', d => d.data.name.slice(0, 5) == 'Route' ? 2 : 0)
          .attr("fill", d => d.data.name.slice(0, 5) == 'Route' ? 'white' : "#0C4E91")
          .attr("class", d => d.data.name)
          .on('mouseover', function (e, d) {
            tooltip
              .html(
                `<div>Factor:${d.data.name}</div><div>Value:${d.data.value.toFixed(2)}</div>`
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

        var maxvalue = d3.max(data.line_data[i].value.flat().map(d => d.val));
        var minvalue = d3.min(data.line_data[i].value.flat().map(d => d.val));

        const gap_yScale = d3.scaleLinear().domain([minvalue, maxvalue]).range([2, gridSize + 18]);

        const line = d3.line()
          .x(d => rect_xscale(d.attr))
          .y(d => gap_yScale(+d.val))
          .curve(d3.curveNatural);

        svgtr.append("g")
          .attr("transform", `translate(${rect_xscale.bandwidth() / 2 + 8},${(i + 1) * rect_yscale_bandwidth - 18})`)
          .selectAll('.line')
          .data(data.line_data[i].value)
          .enter()
          .append("path")
          .attr("fill", "none")
          .attr("stroke", 'gray')
          .attr("stroke-width", 1.5)
          .attr("opacity", 0.3)
          .attr("stroke-linecap", "round")
          .attr("d", function (d, i) {
            return line(d)
          });
      }

      const routeId = rect_g.selectAll(".Id")
        .data(allIds)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", 2.5 * rectmargin.top)
        .attr("y", (d, i) => (i + 1) * rect_yscale_bandwidth - 30)
        .attr("font-size", "9pt")
        .attr("transform", "translate(0,20)");

      const attrLabels = rect_g.selectAll(".attrLabel")
        .data(allATrS)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", d => rect_xscale(d) + rect_xscale.bandwidth() / 2)
        .attr("y", rectmargin.left)
        .style("text-anchor", "middle")
        .attr("font-size", "9pt")
        .attr("transform", "translate(0,0)");

      const blscale = d3.scaleLinear().domain([d3.min(data.routeNum, d => d.value), d3.max(data.routeNum, d => d.value)]).range([0.2, 0.6]);
      const rectbg = rect_g.selectAll(".importancevalue")
        .append("g")
        .data(data.routeNum)
        .enter()
        .append("rect")
        .attr("x", rectmargin.left * 14)
        .attr("y", (d, i) => (i+1) * rect_yscale_bandwidth - 38)
        .attr("width", rect_width)
        .attr("height", 55)
        .style("fill", '#DCDCDC')
        .style("opacity", d => blscale(d.value));

      const importance = rect_g.selectAll(".importancevalue")
        .append("g")
        .data(rect_data)
        .enter()
        .append("circle")
        .attr("cx", d => rect_xscale(d.attrname) + rect_xscale.bandwidth() / 2)
        .attr("cy", (d, i) => (Math.floor(i / allATrS.length) + 1) * rect_yscale_bandwidth - 12)
        .attr("r", d => rect_rscale(Math.abs(d.value)))
        .style("fill", 'none')
        .attr("stroke", d => d.value > 0 ? "#E66F51" : "#287271")
        .attr("stroke-width", 3)
        .on('mouseover', function (e, d) {
          tooltip
            .html(`<div>Contribution:${d.value}</div>`)
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

      var clickNum = 0;
      var routeList = [];
      var radarTemp = [];
      var radarData = [];
      var that = this;

      rect_g.selectAll(".selectId")
        .data(allIds)
        .enter()
        .append("rect")
        .attr("class", 'selectId')
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", rectmargin.top)
        .attr("y", (d, i) => (i + 1) * rect_yscale_bandwidth - 20)
        .attr("fill", '#D3D3D3')
        .on('click', function (d, i) {
          radarTemp = [];
          if (clickNum == 2) {
            d3.selectAll(".selectId")
              .attr('fill', '#D3D3D3');
            clickNum = 0;
            routeList = [];
            radarData = [];
          } else {
            routeList.push(i);
            d3.select(this).attr('fill', '#0C4E91');
            clickNum = clickNum + 1;
            data.rankImportance.forEach(d => {
              if (d.RouteId == i) {
                radarTemp.push(d);
              }
            });
            radarData.push(radarTemp);

            if (routeList.length == 2) {
              that.drawRadar(routeList, radarData);
            }
          }
        });
    },
    drawRadar(routeList, radarData) {
      this.showRadarModel = true;
      var indicatorData = [];
      var data1 = [];
      var data2 = [];
      radarData[0].forEach((d, i) => {
        indicatorData.push({
          'name': d.attrname,
          'max': d.value
        });
        data1.push(d.value);
      });
      radarData[1].forEach((d, i) => {
        if (indicatorData[i].max < d.value) {
          indicatorData[i].max = d.value
        }
        data2.push(d.value);
      });
      console.log(indicatorData);
      var myChart = echarts.init(document.getElementById('radarContent'));
      var option = {
        legend: {
          data: routeList
        },
        radar: {
          indicator: indicatorData,
          splitArea: {
            areaStyle: {
              color: ['rgb(255,255,255)'].reverse(),
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "gray"
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "gray"
            }
          },
          axisName: {
            color: 'black',
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}'
        },
        series: [{
          name: 'Data Info.',
          type: 'radar',
          data: [
            {
              value: data1,
              name: routeList[0],
              areaStyle: {
                normal: {
                  color: "rgba(109,173,209, 0.4)"
                }
              },
              lineStyle: {
                normal: {
                  color: "rgba(109,173,209, 1)",
                  width: 2
                }
              },
              itemStyle: {
                normal: {
                  color: 'rgba(109,173,209, 1)',
                  borderColor: 'rgba(109,173,209, 0.3)',
                  borderWidth: 1
                }
              }
            },
            {
              value: data2,
              name: routeList[1],
              areaStyle: {
                normal: {
                  color: "rgba(220, 109, 87, 0.4)"
                }
              },
              lineStyle: {
                normal: {
                  color: "rgba(220, 109, 87, 1)",
                  width: 2
                }
              },
              itemStyle: {
                normal: {
                  color: 'rgba(220, 109, 87, 1)',
                  borderColor: "rgba(220, 109, 87, 0.3)",
                  borderWidth: 1
                }
              }
            }
          ]
        }]
      };
      myChart.setOption(option);
    },

    addTrS() {
      this.formItem.TrS = (parseFloat(this.formItem.TrS) + this.modifyThreshold).toFixed(2);
    },
    minusTrS() {
      this.formItem.TrS = (parseFloat(this.formItem.TrS) - this.modifyThreshold).toFixed(2);
    },
    addDT() {
      this.formItem.DT = (parseFloat(this.formItem.DT) + this.modifyThreshold).toFixed(2);
    },
    minusDT() {
      this.formItem.DT = (parseFloat(this.formItem.DT) - this.modifyThreshold).toFixed(2);
    },
    addRF() {
      this.formItem.RF = (parseFloat(this.formItem.RF) + this.modifyThreshold).toFixed(2);
    },
    minusRF() {
      this.formItem.RF = (parseFloat(this.formItem.RF) - this.modifyThreshold).toFixed(2);
    },
    addTL() {
      this.formItem.TL = (parseFloat(this.formItem.TL) + this.modifyThreshold).toFixed(2);
    },
    minusTL() {
      this.formItem.TL = (parseFloat(this.formItem.TL) - this.modifyThreshold).toFixed(2);
    },
    addTrC() {
      this.formItem.TrC = (parseFloat(this.formItem.TrC) + this.modifyThreshold).toFixed(2);
    },
    minusTrC() {
      this.formItem.TrC = (parseFloat(this.formItem.TrC) - this.modifyThreshold).toFixed(2);
    },
    addTrD() {
      this.formItem.TrD = (parseFloat(this.formItem.TrD) + this.modifyThreshold).toFixed(2);
    },
    minusTrD() {
      this.formItem.TrD = (parseFloat(this.formItem.TrD) - this.modifyThreshold).toFixed(2);
    },
    addTC() {
      this.formItem.TC = (parseFloat(this.formItem.TC) + this.modifyThreshold).toFixed(2);
    },
    minusTC() {
      this.formItem.TC = (parseFloat(this.formItem.TC) - this.modifyThreshold).toFixed(2);
    },
    rankByAbsolute() {
      this.$store.state.rankData.totalWeight.sort(function (a, b) {
        return a.value - b.value;
      });
      this.drawRank(this.$store.state.rankData);
    },
    rankByValues() {
      this.$store.state.rankData.totalWeight.sort(function (a, b) {
        return Math.abs(b.value) - Math.abs(a.value);
      });
      this.drawRank(this.$store.state.rankData);
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
div#rank_container {
  width: 100%;
  height: 325px;
  overflow-y: auto;
}

svg#rankInfo {
  width: 780px;
}

.configureCard .ivu-card-head {
  height: 60px;
  line-height: 70px;
  background: white;
}

.configureCard .ivu-card-bordered {
  border-color: #DCDCDC;
}

.yaxisgap .domain {
  stroke: black;
  opacity: 0.2;
}

.yaxisgap .tick {
  stroke: black;
  opacity: 0.2;
}
</style>
