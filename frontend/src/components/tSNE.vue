<template>
  <div class="tsne">
    <Card style="height:47vh">
      <p slot="title" style="text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
        <span class="viewTitle">Route Cluster</span>
      </p>
      <div id="scatter"></div>
      <Modal v-model="showRouteDetailModel" :closable="false" cancel-text="Cancel" draggable ok-text="OK" scrollable
             sticky :styles="{left: '240px'}">
        <Card style="height:30vh">
          <p slot="title" style="text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
            <span class="viewTitle">Route Detail</span>
          </p>
          <div id="route_container"></div>
        </Card>
      </Modal>
    </Card>
  </div>
</template>
<script>
import axios from 'axios'
import ICol from "../../node_modules/iview/src/components/grid/col.vue";
export default {
  components: {ICol},
  name: 'tsneview',
  data() {
    return {
      base_url: 'http://127.0.0.1:8700/',
      tsneData: '',
      showRouteDetailModel: false
    }
  },
  watch: {
    mapBrushtrajectory() {
      this.gettsneData();
    },
    selectKgram() {
      this.gettsneData();
    },
    tsneSelectCluster() {
      this.getNewtsneData();
    }
  },
  computed: {
    mapBrushtrajectory() {
      return this.$store.state.mapBrushtrajectoryid;
    },
    selectKgram() {
      return this.$store.state.kgram;
    },
    tsneSelectCluster() {
      return this.$store.state.clusterNum;
    }
  },
  created() {
  },
  mounted() {},
  methods: {
    gettsneData() {
      axios.get(this.base_url + 'routecluster?day=' + this.$store.state.selectDay + "&kvalue=" + this.$store.state.kgram + "&trajectory=" + this.$store.state.mapBrushtrajectoryid)
        .then(res => {
          this.tsneData = res.data;
          this.drawScatter(this.tsneData);
          this.$store.state.clusterNum = 'R' + res.data.bestCluster; //记录最好的聚类数量
        });
    },
    getNewtsneData() {
      axios.get(this.base_url + 'routeclusterbyuser?clusterNum=' + this.$store.state.clusterNum)
        .then(res => {
          this.tsneData.clusterInfo = res.data.clusterInfo;
          this.tsneData.clusterPie = res.data.clusterPie;
          this.tsneData.bestCluster = this.$store.state.clusterNum.split('R')[1];
          this.drawScatter(this.tsneData);
        });
    },
    getRouteDetailData(cluster, route) {
      axios.get(this.base_url + 'routedetail?cluster=' + cluster + "&route=" + route)
        .then(res => {
          this.drawRouteDetailInfo(res.data);
        });
    },
    drawRouteDetailInfo(data) {
      this.showRouteDetailModel = true;
      $('#route_container').empty();
      const margin = {top: 4, left: 4, right: 4, bottom: 4};
      const container = d3.select("#route_container")
        .append('svg')
        .attr('id', 'RouteDeatilInfo');
      const svg = d3.select("#RouteDeatilInfo");
      const height = 200 + 13 * data.total - margin.top - margin.bottom;
      const width = 480;
      document.getElementById("RouteDeatilInfo").setAttribute('height', height + 'px');
      document.getElementById("RouteDeatilInfo").setAttribute('width', width + 'px');

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

      if (data.total > 1) {
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
      }

      const legend_data = new Set(data.value.map(d => d.Attr))

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

    },
    drawScatter(data) {
      var that = this;
      $('#scatter').empty();
      const margin = {top: 8, left: 8, right: 8, bottom: 8};
      const svg = d3.select("#scatter")
        .append('svg')
        .attr('id', 'scatterInfo');

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

      const height = d3.select("#scatterInfo")._groups[0][0].clientHeight - margin.top - margin.bottom;
      const width = 320;

      const scatterWidth = width - margin.left - margin.right;
      const scatterHeight = (height - margin.top - margin.bottom) * 5 / 7 - 10; //占整个视图的3/4

      const g = svg.append("g")
        .attr("id", "maingroup")
        .attr('transform', `translate(${margin.left},${0})`);

      const colorList = ['#834026', '#E66F51', '#e9c46b', '#EDDDC3', '#8ab07d', '#2a9d8c', '#287271', '#C07A92', '#e2c3c9', '#354e87'];
      const outerPie_radius = Math.min(scatterWidth, scatterHeight) / 2 - 20;

      const outerPie_arc = d3.arc().innerRadius(outerPie_radius * 0.88).outerRadius(outerPie_radius).cornerRadius(3);
      const outer_Pie = d3.pie().padAngle(0.015).sort(null).value(d => d.value);
      const outerPie_arcs = outer_Pie(data.clusterPie);

      const svgheight = 190;
      g.append("g")
        .attr('transform', `translate(${scatterWidth / 2} ${svgheight + scatterHeight / 2})`)
        .selectAll("path")
        .data(outerPie_arcs)
        .join("path")
        .attr("fill", d => colorList[d.data.name.slice(5) - 1])
        .attr("d", outerPie_arc).on('mouseover', function (e, d) {

        tooltip
          .html(
            `<div>${(d.data.name)}</div> <div>Number of Trajectories:${(d.value)}</div>`
          )
          .style('visibility', 'visible');
      })
        .on('mousemove', function (e) {

          var pageWidth = document.getElementById('scatterInfo').getBoundingClientRect().left;
          tooltip
            .style('top', e.pageY - 10 + 'px')
            .style('left', e.pageX < pageWidth + width / 2 ? e.pageX + 10 + 'px' : e.pageX - 160 + 'px');
        })
        .on('mouseout', function (e) {
          tooltip.html(``).style('visibility', 'hidden');
        })
        .on('click', function (e, d) { //点击扇形区域，弹出提示信息
          that.getRouteDetailData(that.$store.state.clusterNum, d.data.name);

        });

      const scatter_xScale = d3.scaleLinear()
        .domain([d3.min(data.clusterInfo, d => +d.x), d3.max(data.clusterInfo, d => +d.x)])
        .range([65, outerPie_radius * 2 - 28]).nice();

      const scatter_yScale = d3.scaleLinear()
        .domain([d3.max(data.clusterInfo, d => +d.y), d3.min(data.clusterInfo, d => +d.y)])
        .range([80 + svgheight, outerPie_radius * 2 - 30 + svgheight]).nice();

      const scatter_xAxis = d3.axisBottom(scatter_xScale);
      const scatter_yAxis = d3.axisLeft(scatter_yScale);

      const circles = g.selectAll("circle")
        .data(data.clusterInfo)
        .enter()
        .append("circle")
        .attr("cx", d => scatter_xScale(d.x))
        .attr("cy", d => scatter_yScale(d.y))
        .attr("r", 3.5)
        .attr("fill", d => colorList[d.cluster])
        .on('mouseover', function (e, d) {
          tooltip
            .html(
              `<div>TrajectoryId: ${d.trajectoryId}</div>`
            )
            .style('visibility', 'visible');
        })
        .on('mousemove', function (e) {
          var pageWidth = document.getElementById('scatterInfo').getBoundingClientRect().left;
          tooltip
            .style('top', e.pageY - 10 + 'px')
            .style('left', e.pageX < pageWidth + width / 2 ? e.pageX + 10 + 'px' : e.pageX - 105 + 'px');
        })
        .on('mouseout', function (e) {
          tooltip.html(``).style('visibility', 'hidden');
        });

      const legendData = data.clusterPie.map(d => d.name);
      g.append("g")
        .selectAll("circle")
        .data(legendData)
        .enter()
        .append("circle")
        .attr("cx", 280)
        .attr("cy", (d, i) => 36 + svgheight + 12 * i)
        .attr("r", 2)
        .attr("fill", d => colorList[d.slice(5) - 1]);

      g.append("g")
        .selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 286)
        .attr("y", (d, i) => 39 + svgheight + 12 * i)
        .attr('font-size', 9)
        .text(d => d);

      g.append("g")
        .append("line")
        .attr("x1", -30)
        .attr("y1", svgheight + 6)
        .attr("x2", scatterWidth + 12)
        .attr("y2", svgheight + 6)
        .attr("fill", 'none')
        .attr('stroke', '#696969')
        .attr('opacity', 0.7)
        .attr('stroke-dasharray', '3')
        .attr("stroke-width", "2px");

      g.append("g")
        .append("text")
        .attr("x", 2)
        .attr("y", scatterHeight + 10 - svgheight - 123)
        .text("Evaluation of Various Clusters:")
        .attr('fill', 'black')
        .attr("font-size", 13)
        .attr("font-weight", 'bold')
        .attr('opacity', 1);

      const column_list = new Set(data.clusterNum.map(d => d.k));
      const columnScale = d3.scaleBand().domain(column_list).range([margin.left * 3, width - margin.left - margin.right]);

      const row_list = new Set(data.clusterNum.map(d => d.name));
      const rowScale = d3.scaleBand().domain(row_list).range([scatterHeight + 38 - svgheight - 115, height + 10 - svgheight - 115]);

      const tempchi = data.clusterNum.filter(d => d.name == 'CHI.');
      const tempdbi = data.clusterNum.filter(d => d.name == 'DBI.');
      const tempis = data.clusterNum.filter(d => d.name == 'SI.');
      const tempsc = data.clusterNum.filter(d => d.name == 'SC.');

      const rCHIscale = d3.scaleLinear().domain([d3.min(tempchi, d => +d.value), d3.max(tempchi, d => +d.value)]).range([0.1, 0.8]);
      const rDBIscale = d3.scaleLinear().domain([d3.min(tempdbi, d => +d.value), d3.max(tempdbi, d => +d.value)]).range([0.1, 0.8]);
      const rSCscale = d3.scaleLinear().domain([d3.min(tempsc, d => +d.value), d3.max(tempsc, d => +d.value)]).range([0.1, 0.8]);
      const rISscale = d3.scaleLinear().domain([d3.min(tempis, d => +d.value), d3.max(tempis, d => +d.value)]).range([0.1, 0.8]);

      g.append("g")
        .selectAll("rect")
        .data(data.clusterNum)
        .enter()
        .append("rect")
        .attr('x', d => columnScale(d.k))
        .attr("y", d => rowScale(d.name))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("height", rowScale.bandwidth() - 2)
        .attr("width", columnScale.bandwidth() - 2)
        .style("fill", '#287271')
        .style("stroke-width", 1)
        .attr("opacity", d => d.name == 'CHI.' ? rCHIscale(d.value) : d.name == 'DBI.' ? rDBIscale(d.value) : d.name == 'SI.' ? rISscale(d.value) : rSCscale(d.value))
        .on('mouseover', function (e, d) {
          tooltip
            .html(
              `<div>Value:${(+d.value).toFixed(2)}</div>`
            )
            .style('visibility', 'visible');
        })
        .on('mousemove', function (e) {
          var pageWidth = document.getElementById('scatterInfo').getBoundingClientRect().left;
          tooltip
            .style('top', e.pageY - 10 + 'px')
            .style('left', e.pageX < pageWidth + width / 2 ? e.pageX + 10 + 'px' : e.pageX - 80 + 'px');
        })
        .on('mouseout', function (e) {
          tooltip.html(``).style('visibility', 'hidden');
        });

      const xAxis = g.append('g')
        .attr('transform', `translate(0,${scatterHeight + 38 - svgheight - 115})`)
        .call(d3.axisTop(columnScale).tickSize(2).tickPadding(1))
        .style("font-size", "10px")
        .attr("font-weight", 'bold')
        .call(g => g.selectAll(".domain").remove());

      const yAxis = g.append('g')
        .attr('transform', `translate(24,0)`)
        .call(d3.axisLeft(rowScale).tickSize(0))
        .style("font-size", "10px")
        .attr("font-weight", 'bold')
        .call(g => g.selectAll(".domain").remove());

      g.append("g")
        .append("text")
        .attr("x", width / 2 - 20)
        .attr("y", scatterHeight + 34 - svgheight - 128)
        .attr("font-size", 10)
        .text('Clusters');

      const sym = d3.symbol().type(d3.symbolCross).size(20);
      g.append("g")
        .selectAll("path")
        .data(column_list)
        .enter()
        .append("path")
        .attr("class", 'selectK')
        .attr("d", sym)
        .attr('fill', d => d == +data.bestCluster ? '#287271' : '#DCDCDC')
        .attr('transform', (d, i) => `translate(${31 + (i / 10) * 2 + (2 * i + 1) * columnScale.bandwidth() / 2},${scatterHeight + 32 - svgheight - 115})`)
        .on('click', function (d, i) {
          d3.selectAll(".selectK").attr("fill", '#DCDCDC');
          d3.select(this).attr("fill", '#287271');
          that.$store.state.clusterNum = 'R' + i;
        });

      var legendData_Rect = [];
      for (var i = 0; i <= 10; i++) {
        legendData_Rect.push(i);
      }

      g.append("g")
        .append("text")
        .attr("x", 230)
        .attr("y", 20)
        .text('Value:')
        .style("font", "10px sans-serif");

      g.append("g")
        .selectAll("g")
        .data(legendData_Rect)
        .enter()
        .append("g")
        .append("rect")
        .attr("x", (d, i) => 260 + i * 3)
        .attr("y", 10)
        .attr("width", 3)
        .attr("height", 10)
        .style("fill", '#287271')
        .attr("opacity", d => d / 10);

      g.append("g")
        .append("text")
        .attr("x", 260)
        .attr("y", 9)
        .text('0')
        .style("font", "8px sans-serif");

      g.append("g")
        .append("text")
        .attr("x", 288)
        .attr("y", 9)
        .text('1')
        .style("font", "8px sans-serif");
    }
  }
}
</script>

<style>
div#scatter {
  height: 490px;
  width: 333px;
  margin-top: 5px;
}

svg#scatterInfo {
  height: 490px;
  width: 333px
}

div#route_container {
  height: 300px;
  width: 478px;
  overflow-y: auto;
}

svg#RouteDeatilInfo {
  width: 468px;
}
</style>
