<template>
  <div class="test">
    <Card style="height:47vh">
      <p slot="title" style="text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
        <span class="viewTitle">Trajectory Detail</span>
      </p>
      <div id="bubble_container"></div>
    </Card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  components: {},
  name: 'detailview',
  data() {
    return {
      base_url: 'http://127.0.0.1:8700/'
    }
  },
  watch: {
    mapBrushtrajectory() {
      this.getStatisticData(this.$store.state.mapBrushtrajectoryid);
    }
  },
  computed: {
    mapBrushtrajectory() {
      return this.$store.state.mapBrushtrajectoryid;
    }
  },
  created() {
  },
  mounted() {},
  methods: {
    getStatisticData(trajectory) {
      axios.get(this.base_url + 'tradetail?day=' + this.$store.state.selectDay + "&trajectory=" + trajectory)
        .then(res => {
          this.drawStatisticInfo(res.data);
        });
    },
    drawStatisticInfo(data) {
      $('#bubble_container').empty();

      const margin = {top: 4, left: 4, right: 4, bottom: 4};

      const container = d3.select("#bubble_container")
        .append('svg')
        .attr('id', 'bubbleInfo');
      const svg = d3.select("#bubbleInfo");
      const height = 200 + 13 * data.total - margin.top - margin.bottom;

      let containerA = document.getElementById("bubbleInfo").setAttribute('height', height + 'px');

      const width = 480;
      const g = svg.append("g")
        .attr("id", "maingroup")
        .attr('transform', `translate(${0},${margin.top})`);

      g.append("g")
        .append("text")
        .attr("x", 5)
        .attr("y", 12)
        .attr("font-size", "12")
        .text('Number of Selected Trajectories:');
      const num_traject = 10 + data.total.toString().length * 7.2;

      g.append("g")
        .append("rect")
        .attr("x", 200)
        .attr("y", 0)
        .attr("width", num_traject)
        .attr("height", 15)
        .attr("fill", 'none')
        .attr('stroke', '#696969')
        .attr('stroke-dasharray', '3');

      g.append("g")
        .append("text")
        .attr("x", 205)
        .attr("y", 12)
        .attr("font-size", "12")
        .attr('font-weight', 'bold')
        .text(data.total);

      g.append('g')
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", 24)
        .attr("x2", width - margin.right)
        .attr("y2", 24)
        .attr("stroke", "gray")
        .attr("stroke-width", "0.4px");

      g.append("g")
        .append("text")
        .attr("x", 5)
        .attr("y", 40)
        .attr("font-size", "12")
        .text('Distribution of Departure Time:');

      const barHeight = 65;
      const bar_xaxisdata = data.timeData.map(d => d.name);
      const bar_xsacle = d3.scaleBand().domain(bar_xaxisdata).rangeRound([margin.left * 6, width - (margin.left + margin.right) * 3]);
      const bar_yscale = d3.scaleLinear().domain([0, d3.max(data.timeData, d => +d.value)]).range([40 + barHeight + margin.top, 20 + margin.left * 6]);

      const bar_xAxis = g.append("g")
        .attr('transform', `translate(0,${40 + barHeight + margin.top})`)
        .call(d3.axisBottom(bar_xsacle).tickSizeOuter(0).tickFormat((i) => i % 3 == 0 ? i : '').tickSize(4));

      const bar_yAxis = g.append("g")
        .attr('transform', `translate(${margin.left * 6},0)`)
        .call(d3.axisLeft(bar_yscale).tickSizeOuter(0).tickSize(4).tickFormat((i) => i % 3 == 0 ? i : ''));

      const bar_content = g.append("g")
        .attr('fill', '#4169E1')
        .attr('opacity', 0.8)
        .selectAll("rect")
        .data(data.timeData)
        .enter()
        .append("rect")
        .attr("class", 'selectTime')
        .attr("x", (d, i) => bar_xsacle(i) + bar_xsacle.bandwidth() / 4)
        .attr("y", d => bar_yscale(d.value))
        .attr("height", d => bar_yscale(0) - bar_yscale(d.value))
        .attr("width", bar_xsacle.bandwidth() / 2)
        .on('click', function () {
          d3.select(this).attr('fill', 'gray').attr('opacity', 0.8);
        })
        .on('dblclick', function () {
          d3.selectAll(".selectTime").attr('fill', '#4169E1').attr('opacity', 1);
        });

      const tempdata = bar_yscale.ticks();
      const griddata = tempdata.slice(1, tempdata.length);
      const grid = g.append('g')
        .attr("stroke", "white")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1.3)
        .call(
          g => g.append("g")
            .selectAll("line")
            .data(griddata)
            .join("line")
            .attr("y1", d => 0.5 + bar_yscale(d))
            .attr("y2", d => 0.5 + bar_yscale(d))
            .attr("x1", margin.left * 6)
            .attr("x2", width - (margin.left + margin.right) * 3)
        );

      g.append("g")
        .append("rect")
        .attr("x", width - 90)
        .attr("y", 35)
        .attr("width", 8)
        .attr("height", 8)
        .attr('fill', '#4169E1')
        .attr('opacity', 0.8);

      g.append("g")
        .append("text")
        .attr("x", width - 125)
        .attr("y", 42)
        .text("Selected")
        .attr('fill', '#4169E1')
        .attr("font-size", "8")
        .attr('opacity', 0.8);

      g.append('g')
        .append("line")
        .attr("x1", width - 79)
        .attr("y1", 35)
        .attr("x2", width - 81)
        .attr("y2", 42)
        .attr("stroke", "black")
        .attr("stroke-width", "0.8px");

      g.append("g")
        .append("rect")
        .attr("x", width - 78)
        .attr("y", 35)
        .attr("width", 8)
        .attr("height", 8)
        .attr('fill', 'gray')
        .attr('opacity', 0.8);

      g.append("g")
        .append("text")
        .attr("x", width - 69)
        .attr("y", 42)
        .text("Not Selected")
        .attr('fill', 'gray')
        .attr("font-size", "8")
        .attr('opacity', 0.8);

      g.append('g')
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", 130)
        .attr("x2", width - margin.right)
        .attr("y2", 130)
        .attr("stroke", "gray")
        .attr("stroke-width", "0.4px");

      g.append("g")
        .append("text")
        .attr("x", 5)
        .attr("y", 150)
        .attr("font-size", "12")
        .text('Detail Info:');

      const listHeight = 12 * data.total;

      const column_list = new Set(data.value.map(d => d.Attr));
      const columnScale = d3.scaleBand().domain(column_list).range([margin.left * 8, width - margin.left * 5]);

      const row_list = new Set(data.value.map(d => d.id));
      const rowScale = d3.scaleBand().domain(row_list).range([0, listHeight]);

      const xAxis = d3.axisBottom(columnScale);

      const yAxis = g.append('g')
        .attr('transform', `translate(80,177)`)
        .call(d3.axisLeft(rowScale).tickSize(3))
        .style("font-size", "8px")
        .call(g => g.selectAll(".domain").remove());

      const rscale = d3.scaleLinear().domain([0, 1]).range([0, columnScale.bandwidth() - 10]);

      var roadColor = ['red', 'green', 'yellow'];
      g.append("g")
        .selectAll("rect")
        .data(data.value)
        .enter()
        .append("rect")
        .attr('x', d => d.Attr == 'Origin' ? 80 : d.Attr == 'Destination' ? 102 : columnScale(d.Attr))
        .attr("y", d => 180 + rowScale(d.id))
        .attr("height", 6)
        .attr("width", (d, i) => d.Attr == 'Origin' ? columnScale.bandwidth() - 38 : d.Attr == 'Destination' ? columnScale.bandwidth() - 38 : d.value > 0.05 ? rscale(d.value) : 0.02)
        .style("fill", (d, i) => d.Attr == 'Origin' ? '#76B7B2' : d.Attr == 'Destination' ? '#76B7B2' : '#F28E2C')
        .style("stroke", (d, i) => d.Attr == 'Origin' ? '#76B7B2' : d.Attr == 'Destination' ? '#76B7B2' : '#F28E2C')
        .style("stroke-width", 1)
        .attr("opacity", 1);

      let newData = {};
      data.value.forEach(e => {
        if (Object.keys(newData).indexOf('' + e.Attr) === -1) {
          newData[e.Attr] = []
        }

        newData[e.Attr].push(+e.value)
      });
      const chartHeight = 10;
      const whiskersHeight = 5;

      var count = 0;
      Object.keys(newData).forEach(function (index) {
        if (index == 'Destination' || index == 'Origin') {
          return;
        }
        var boxplot_data = newData[index];
        var data_sorted = boxplot_data.sort(d3.ascending);
        var quartiles = [d3.quantile(data_sorted, .25), d3.quantile(data_sorted, .5), d3.quantile(data_sorted, .75)];
        var q1 = d3.quantile(data_sorted, .25);
        var median = d3.quantile(data_sorted, .5);
        var q3 = d3.quantile(data_sorted, .75);
        var interQuantileRange = q3 - q1;
        var whiskers = [d3.min(data_sorted), d3.max(data_sorted)];
        var min = d3.min(data_sorted);
        var max = d3.max(data_sorted);
        var x_scale = d3.scaleLinear().domain([min, max]).range([0, columnScale.bandwidth() - 14]);

        var boxPlot = g.append("g")
          .attr("transform", `translate(${columnScale(index)},${165})`);

        var whiskerLineGrps = boxPlot.selectAll(".whiskers")
          .data(whiskers)
          .enter()
          .append("g")
          .attr("class", "whiskers")
          .attr("transform", function (d, i) {
            return "translate(" + x_scale(d) + "," + (chartHeight / 2 - whiskersHeight / 2) + ")";
          });

        whiskerLineGrps.append('line')
          .attr("x2", 0)
          .attr("y2", d => whiskersHeight)
          .attr("class", "whiskerLine");

        boxPlot.append('line')
          .attr("x1", x_scale(whiskers[0]))
          .attr("y1", chartHeight / 2)
          .attr("x2", x_scale(whiskers[1]))
          .attr("y2", chartHeight / 2)
          .attr("class", "whiskerLine");

        boxPlot.append("g").append("rect")
          .attr("width", x_scale(quartiles[2]) - x_scale(quartiles[0]))
          .attr("height", whiskersHeight)
          .attr("x", x_scale(quartiles[0]))
          .attr("y", chartHeight / 2 - whiskersHeight / 2)
          .attr("fill", "#f9f9f9")
          .attr("stroke", "#F28E2C")
          .attr("stroke-width", 0.5);

        // QuartileLine Groups
        var quartileLineGrps = boxPlot.selectAll(".quartiles")
          .data(quartiles)
          .enter().append("g")
          .attr("class", "quartiles")
          .attr("transform", function (d, i) {
            return "translate(" + x_scale(d) + "," + (chartHeight / 2 - whiskersHeight / 2) + ")";
          });

        quartileLineGrps.append('line')
          .attr("x2", 0)
          .attr("y2", d => whiskersHeight)
          .attr("class", "whiskerLine");

        count++;
      });

      const legend_data = new Set(data.value.map(d => d.Attr));

      g.append("g")
        .append("text")
        .attr("x", 45)
        .attr("y", 168)
        .attr("font-size", '8px')
        .text("ID");

      g.append("g")
        .selectAll("text")
        .data(legend_data)
        .enter()
        .append("text")
        .attr("x", (d, i) => i == 0 ? 68 : i == 1 ? 92 : 35 + i * columnScale.bandwidth())
        .attr("y", (d, i) => i <= 1 ? 160 : 150)
        .attr("font-size", '8px')
        .text(d => d);

      g.append('g')
        .attr("transform", "translate(85,170)")
        .append('path')
        .attr('d', d3.symbol().type(d3.symbolStar).size(30))
        .attr('fill', '#76B7B2');

      g.append('g')
        .attr("transform", "translate(103,170)")
        .append('path')
        .attr('d', d3.symbol().type(d3.symbolTriangle).size(30))
        .attr('fill', '#76B7B2');

      g.append('g')
        .append("line")
        .attr("x1", columnScale.bandwidth() * 2.4)
        .attr("y1", 175)
        .attr("x2", columnScale.bandwidth() * 2.4)
        .attr("y2", 180 + listHeight)
        .attr("stroke", "gray")
        .attr("stroke-width", "0.4px");

      g.append("g")
        .selectAll("text")
        .data(data.avgvalue)
        .enter()
        .append("text")
        .attr("x", d => 10 + columnScale(d.name))
        .attr("y", 162)
        .attr("font-size", '8px')
        .text(d => d.value);

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.mytab .ivu-tabs-tab {
  padding: 5px 5px;
  margin-right: 5px;
}

div#bubble_container {
  height: 490px;
  width: 478px;
  overflow-y: auto;
}

svg#bubbleInfo {
  width: 468px;
}

.whiskerLine {
  stroke: #F28E2C;
  stroke-width: 0.5;
  fill: none
}


</style>
