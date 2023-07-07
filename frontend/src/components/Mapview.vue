<template>
  <div class="mapview">
    <Card style="height:67vh">
      <p slot="title" style="text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
        <span class="viewTitle">Geospatial Map</span>
      </p>
      <div id="map1-view" style="position: absolute; height: 95.4%; width: 99.6%;"></div>

      <div style="top:12%; position: absolute; left:12px;">
        <Button-group vertical>
          <Button icon="md-wifi" style="color: black; padding: 0px 4px; width: 100%;"
                  @click="drawOrigincircle()"></Button>
          <Button icon="ios-trash" style="color: black; padding: 0px 4px; width: 100%;"
                  @click="clearAllCircle()"></Button>
          <Button icon="ios-color-wand" style="color: black; padding: 0px 4px; width: 100%;"
                  @click="drawTrajectory()"></Button>
          <Button icon="md-log-in" style="color: black; padding: 0px 4px; width: 100%;"
                  @click="drawOriHeatmap()"></Button>
          <Button icon="md-log-out" style="color: black; padding: 0px 4px; width: 100%;"
                  @click="drawDesHeatmap()"></Button>
          <Button icon="ios-close-circle-outline" style="color: black; padding: 0px 4px; width: 100%;"
                  @click="closeODHeatmap()"></Button>
        </Button-group>
      </div>
    </Card>
    <div style="top:28.5%; position: absolute; left:14px;">
      <Button-group vertical>
        <Button class="zone" style="margin-bottom: 5px;" @click="drawVorinor()">FA.</Button>
        <Button class="zone" style="margin-bottom: 5px;" @click="getVorTrajectory()">Filter</Button>
        <Button class="zone" style="margin-bottom: 5px;" @click="getDetail()">Detail</Button>
        <Button class="zone" style="margin-bottom: 5px;" @click="getRoute()">Route</Button>
        <Button class="zone" style="margin-bottom: 5px;" @click="getAll()">All</Button>
      </Button-group>
    </div>

    <Modal v-model="showDetailModel" :closable="false" cancel-text="Cancel" draggable ok-text="OK" scrollable sticky>
      <detail-tra></detail-tra>
    </Modal>
  </div>
</template>

<script>
import axios from 'axios';
import Input from "../../node_modules/iview/src/components/input/input.vue";
import ISwitch from "../../node_modules/iview/src/components/switch/switch.vue";
import Row from '../../node_modules/iview/src/components/grid/row.vue';
import ICol from '../../node_modules/iview/src/components/grid/col.vue';
import detailTra from '../components/Detailview.vue'

export default {
  components: {
    ICol,
    ISwitch,
    Input,
    Row,
    detailTra
  },
  name: 'mapview',
  data() {
    return {
      base_url: 'http://127.0.0.1:8700/',
      map1: {},
      showDetailModel: false,
      originMapLayer: {},
      originDataSet: [],
      originOptins: {
        size: 5,
        gradient: {
          0.25: "rgb(85,148,196 )",
          0.55: "rgb(6,205,187 )",
          0.85: "rgb(254,248,133)",
          1.0: "rgb(216,31,29)"
        },
        max: 10,
        draw: 'heatmap'
      },
      destinationMapLayer: {},
      destinationDataSet: [],
      destinationOptins: {
        size: 5,
        gradient: {
          0.25: "rgb(85,148,196 )",
          0.55: "rgb(6,205,187 )",
          0.85: "rgb(254,248,133)",
          1.0: "rgb(216,31,29)"
        },
        max: 10,
        draw: 'heatmap'
      },
      selectOD: '',
      point_o: '',
      circle_o: '',
      point_d: '',
      circle_d: '',
      flag: 1,
      origin_lng: '',
      origin_lat: '',
      destination_lng: '',
      destination_lat: '',
      trajectory_dataSet: [],
      trajectory_options: {
        strokeStyle: 'rgba(129,187,238,1)',
        coordType: 'bd09ll',
        shadowBlur: 3,
        lineWidth: 5.0,
        draw: 'simple'
      },
      trajectoryLayer: {},
      path_dataSet: [],
      path_options: {
        fillStyle: 'rgba(255, 250, 250, 0.2)',
        coordType: 'bd09ll',
        globalCompositeOperation: "lighter",
        size: 1.5,
        animation: {
          stepsRange: {
            start: 0,
            end: 100
          },
          trails: 10,
          duration: 20,
        },
        draw: 'simple'
      },
      pathLayer: {},
      critcal_trajectory_dataSet: [],
      critcal_trajectory_options: {
        coordType: 'bd09ll',
        shadowBlur: 3,
        lineWidth: 5.0,
        draw: 'simple'
      },
      critcal_trajectoryLayer: {},
      critcal_path_dataSet: [],
      critcal_path_options: {
        fillStyle: 'rgba(255, 250, 250, 0.2)',
        coordType: 'bd09ll',
        globalCompositeOperation: "lighter",
        size: 1.5,
        animation: {
          stepsRange: {
            start: 0,
            end: 100
          },
          trails: 10,
          duration: 20,
        },
        draw: 'simple'
      },
      critcal_pathLayer: {},
      closeHeatmap: true,
      clickVorcount: 0,
      vorOptions: {
        splitList: {
          1: 'rgb(217,217,217,0.4)',
          4: 'rgb(189,189,189,0.4)',
          5: 'rgb(150,150,150,0.4)',
          7: 'rgb(115,115,115,0.4)',
          8: 'rgb(82,82,82,0.4)',
          9: 'rgb(37,37,37,0.4)'

        },
        strokeStyle: 'rgba(112,128,144, 0.8)',
        lineWidth: 1,
        draw: 'category',
        methods: {
          click: (item) => {
            this.clickVor(item);
          }
        }
      },
      vorDataSet: [],
      vorMapLayer: {},
      tempVorDataSet: [],
      selectVorDataSet: new mapv.DataSet([]),
      selectVorMapLayer: {}
    }
  },
  watch: {
    selectDays() {
      this.clearAllCircle();
      this.getDataAndrefreshLayer();

    },
    selectTsnetrajectoryid() {
      this.getRefreshData();
    },
    selectVmsppath() {
      this.getRefreshPathData();
    }
  },
  computed: {
    selectDays() {
      return this.$store.state.selectDay;
    },
    selectTsnetrajectoryid() {
      return this.$store.state.tsneBrushtrajectoryid;
    },
    selectVmsppath() {
      return this.$store.state.selectPath;
    }
  },
  created() {
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.map1 = new BMap.Map("map1-view", {
        enableMapClick: false
      });
      const point = new BMap.Point(104.090, 30.695);
      this.map1.centerAndZoom(point, 14);
      this.map1.enableScrollWheelZoom(true);
      var opts = {type: BMAP_NAVIGATION_CONTROL_ZOOM};
      this.map1.addControl(new BMap.NavigationControl(opts));
      this.map1.addControl(new BMap.ScaleControl());


      var pStart = new BMap.Point(104.04778720393539, 30.658167934874395);
      var pEnd = new BMap.Point(104.13846031323907, 30.73446834803418);
      var rectangle = new BMap.Polygon([
          new BMap.Point(pStart.lng, pStart.lat),
          new BMap.Point(pEnd.lng, pStart.lat),
          new BMap.Point(pEnd.lng, pEnd.lat),
          new BMap.Point(pStart.lng, pEnd.lat)],
        {
          fillOpacity: 0.1,
          strokeWeight: 1,
          strokeStyle: 'dashed',
          strokeColor: '#C0C0C0'
        }
      );

      this.map1.addOverlay(rectangle);

      // 地图自定义样式
      this.map1.setMapStyle({
        styleJson: [
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "color": "#ccd6d7ff"
            }
          }, {
            "featureType": "green",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "color": "#dee5e5ff"
            }
          }, {
            "featureType": "building",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "building",
            "elementType": "geometry.topfill",
            "stylers": {
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "building",
            "elementType": "geometry.sidefill",
            "stylers": {
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "building",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#aab6b6ff"
            }
          }, {
            "featureType": "subwaystation",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "color": "#888fa0ff"
            }
          }, {
            "featureType": "education",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "color": "#e1e7e7ff"
            }
          }, {
            "featureType": "medical",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "scenicspots",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "highway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "weight": 4
            }
          }, {
            "featureType": "highway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "highway",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "arterial",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "weight": 1
            }
          }, {
            "featureType": "arterial",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "arterial",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "arterial",
            "elementType": "labels",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "arterial",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "arterial",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "local",
            "elementType": "geometry",
            "stylers": {
              "visibility": "on",
              "weight": 1
            }
          }, {
            "featureType": "local",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "local",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "local",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "local",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "local",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "railway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "weight": 1
            }
          }, {
            "featureType": "railway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#9494941a"
            }
          }, {
            "featureType": "railway",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#ffffff1a"
            }
          }, {
            "featureType": "subway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "weight": 1
            }
          }, {
            "featureType": "subway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#c3bed433"
            }
          }, {
            "featureType": "subway",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#ffffff33"
            }
          }, {
            "featureType": "subway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "subway",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#979c9aff"
            }
          }, {
            "featureType": "subway",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "continent",
            "elementType": "labels",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "continent",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "continent",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#333333ff"
            }
          }, {
            "featureType": "continent",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "city",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "city",
            "elementType": "labels",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "city",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#454d50ff"
            }
          }, {
            "featureType": "city",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "town",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "on"
            }
          }, {
            "featureType": "town",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "town",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#454d50ff"
            }
          }, {
            "featureType": "town",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "poilabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "districtlabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "poilabel",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "districtlabel",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#888fa0ff"
            }
          }, {
            "featureType": "transportation",
            "elementType": "geometry",
            "stylers": {
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "companylabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "restaurantlabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "lifeservicelabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "carservicelabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "financelabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "otherlabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "village",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "district",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "land",
            "elementType": "geometry",
            "stylers": {
              "color": "#edf3f3ff"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "provincialway",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": {
              "color": "#cacfcfff"
            }
          }, {
            "featureType": "subwaylabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "subwaylabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "tertiarywaysign",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "tertiarywaysign",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "provincialwaysign",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "provincialwaysign",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "nationalwaysign",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "nationalwaysign",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "highwaysign",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "highwaysign",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "provincialway",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "highway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "highway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "highway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "highway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "highway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "highway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "highway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "nationalway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "nationalway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "nationalway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "nationalway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "provincialway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "8,8",
              "level": "8"
            }
          }, {
            "featureType": "provincialway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "8,8",
              "level": "8"
            }
          }, {
            "featureType": "provincialway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "8,8",
              "level": "8"
            }
          }, {
            "featureType": "cityhighway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "cityhighway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "cityhighway",
            "stylers": {
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "geometry",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "6"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "7"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "labels",
            "stylers": {
              "visibility": "off",
              "curZoomRegionId": "0",
              "curZoomRegion": "6,8",
              "level": "8"
            }
          }, {
            "featureType": "cityhighway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#8f5a33ff"
            }
          }, {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "country",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#8f5a33ff"
            }
          }, {
            "featureType": "country",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "country",
            "elementType": "labels.text",
            "stylers": {
              "fontsize": 28
            }
          }, {
            "featureType": "manmade",
            "elementType": "geometry",
            "stylers": {
              "color": "#dfe7e7ff"
            }
          }, {
            "featureType": "provincialway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "tertiaryway",
            "elementType": "geometry.fill",
            "stylers": {
              "color": "#fbfffeff"
            }
          }, {
            "featureType": "manmade",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "manmade",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "scenicspots",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "scenicspots",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "airportlabel",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "airportlabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "scenicspotslabel",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "scenicspotslabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "educationlabel",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "educationlabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "medicallabel",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "medicallabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "companylabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "restaurantlabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "hotellabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "hotellabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "shoppinglabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "shoppinglabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "lifeservicelabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "carservicelabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "transportationlabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "transportationlabel",
            "elementType": "labels",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "financelabel",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "off"
            }
          }, {
            "featureType": "entertainment",
            "elementType": "geometry",
            "stylers": {
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "estate",
            "elementType": "geometry",
            "stylers": {
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "shopping",
            "elementType": "geometry",
            "stylers": {
              "color": "#d1dbdbff"
            }
          }, {
            "featureType": "education",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "education",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "medical",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "medical",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }, {
            "featureType": "transportation",
            "elementType": "labels.text.fill",
            "stylers": {
              "color": "#999999ff"
            }
          }, {
            "featureType": "transportation",
            "elementType": "labels.text.stroke",
            "stylers": {
              "color": "#ffffffff"
            }
          }]

      });


      this.originDataSet = new mapv.DataSet([]);
      this.originMapLayer = new mapv.baiduMapLayer(
        this.map1,
        this.originDataSet,
        this.originOptins
      );

      this.destinationDataSet = new mapv.DataSet([]);
      this.destinationMapLayer = new mapv.baiduMapLayer(
        this.map1,
        this.destinationDataSet,
        this.destinationOptins
      );

      this.originMapLayer.hide();
      this.destinationMapLayer.hide();

    },
    async getDataAndrefreshLayer() {
      var ofilename_path = "./static/data/Origin/" + this.$store.state.selectDay + "_o.json";
      var dfilename_path = "./static/data/Destination/" + this.$store.state.selectDay + "_d.json";

      let odata = await axios.get(ofilename_path);

      let ddata = await axios.get(dfilename_path);

      this.originDataSet.set(odata.data);
      this.destinationDataSet.set(ddata.data);

      this.originMapLayer.show();
      this.destinationMapLayer.hide();
    },
    drawOriHeatmap() {
      this.clearAllCircle();
      this.closeHeatmap = true;
      this.originMapLayer.show();
      this.destinationMapLayer.hide();
    },
    drawDesHeatmap() {
      this.clearAllCircle();
      this.closeHeatmap = true;
      this.originMapLayer.hide();
      this.destinationMapLayer.show();
    },
    closeODHeatmap() {
      this.clearAllCircle();

      if (this.closeHeatmap) {
        this.originMapLayer.hide();
        this.destinationMapLayer.hide();
        this.closeHeatmap = false;
      } else {
        this.originMapLayer.show();
        this.closeHeatmap = true;
      }
    },
    clearAllCircle() {
      var allOverlay = this.map1.getOverlays();
      for (var i = 0; i < allOverlay.length; i++) {
        this.map1.removeOverlay(allOverlay[i]);
      }
      this.flag = 1;
      var pStart = new BMap.Point(104.04778720393539, 30.658167934874395);
      var pEnd = new BMap.Point(104.13846031323907, 30.73446834803418);
      var rectangle = new BMap.Polygon([
          new BMap.Point(pStart.lng, pStart.lat),
          new BMap.Point(pEnd.lng, pStart.lat),
          new BMap.Point(pEnd.lng, pEnd.lat),
          new BMap.Point(pStart.lng, pEnd.lat)],
        {
          fillOpacity: 0.1,
          strokeWeight: 1,
          strokeStyle: 'dashed',
          strokeColor: '#C0C0C0'
        });

      this.map1.addOverlay(rectangle);
      // 清除交通功能区的图例
      if (document.getElementById("FuncAid") != null) {
        document.getElementById("FuncAid").remove();
      }

    },
    drawOrigincircle() {
      this.clearAllCircle();
      this.map1.addEventListener("click", (e) => {
        if (this.flag % 2 != 0) {
          this.map1.removeOverlay(this.circle_o);
          this.point_o = new BMap.Point(e.point.lng, e.point.lat);
          this.circle_o = new BMap.Circle(this.point_o, this.$store.state.circleRadius, {
            fillColor: "rgb(208,247,233)",
            strokeColor: "rgb(208,247,233)",
            strokeWeight: 6,
            fillOpacity: 0.6,
            strokeOpacity: 1,
            enableEditing: false
          });
          this.map1.addOverlay(this.circle_o);
          this.flag = 2;
          this.origin_lng = e.point.lng;
          this.origin_lat = e.point.lat;
        } else {
          this.map1.removeOverlay(this.circle_d);
          this.point_d = new BMap.Point(e.point.lng, e.point.lat);
          this.circle_d = new BMap.Circle(this.point_d, this.$store.state.circleRadius, {
            fillColor: "rgb(255,237,197)",
            strokeColor: "rgb(255,237,197)",
            strokeWeight: 6,
            fillOpacity: 0.6,
            strokeOpacity: 1,
            enableEditing: false
          });
          this.map1.addOverlay(this.circle_d);
          this.flag = 1;
          this.destination_lng = e.point.lng;
          this.destination_lat = e.point.lat;
        }
      });
    },
    drawTrajectory() {
      if (this.origin_lng == '') {
        this.$Message.error({
          background: true,
          content: 'Please Brush O/D area!'
        });
      } else {
        axios.get(this.base_url + 'brushdata?day=' + this.$store.state.selectDay + "&olng=" + this.origin_lng + "&olat=" + this.origin_lat + "&dlng=" + this.destination_lng + "&dlat=" + this.destination_lat + "&radius=" + this.$store.state.circleRadius)
        .then(res => {
            if (res.data.trajectory.length == 0) {
              this.$Message.warning('There are no tracks in the selected area!');
            }
            else {
              this.trajectory_dataSet = new mapv.DataSet(res.data.trajectory);

              this.trajectoryLayer = new mapv.baiduMapLayer(this.map1, this.trajectory_dataSet, this.trajectory_options);

              this.$store.state.mapBrushtrajectory = res.data.trajectory;

              this.path_dataSet = new mapv.DataSet(res.data.time_trajectory);
              this.pathLayer = new mapv.baiduMapLayer(this.map1, this.path_dataSet, this.path_options);

              this.$store.state.mapBrushtimetrajectory = res.data.time_trajectory;

              this.$store.state.mapBrushtrajectoryid = res.data.trajectoryid;

            }
          });
      }
    },
    getRefreshData() {
      let trackData = [];
      let timeData = [];
      for (var i = 0; i < this.$store.state.tsneBrushtrajectoryid.length; i++) {
        for (var j = 0; j < this.$store.state.mapBrushtrajectoryid.length; j++) {
          if (this.$store.state.tsneBrushtrajectoryid[i] === this.$store.state.mapBrushtrajectoryid[j]) {
            trackData.push(this.$store.state.mapBrushtrajectory[j]);
            timeData.push(this.$store.state.mapBrushtimetrajectory[j]);
          }
        }
      }
      this.trajectory_dataSet.set(trackData);
      this.path_dataSet.set(timeData);
    },
    getRefreshPathData() {
      this.pathLayer.destroy();
      this.trajectoryLayer.destroy();

      axios.get(this.base_url + 'pathdeatilInfo?day=' + this.$store.state.selectDay + "&pathid=" + this.$store.state.selectPath + "&trajectory=" + this.$store.state.mapBrushtrajectoryid)
        .then(res => {
          this.trajectory_dataSet = new mapv.DataSet(res.data.trajectory);
          this.trajectoryLayer = new mapv.baiduMapLayer(this.map1, this.trajectory_dataSet, this.trajectory_options);
          this.path_dataSet = new mapv.DataSet(res.data.time_trajectory);
          this.pathLayer = new mapv.baiduMapLayer(this.map1, this.path_dataSet, this.path_options);

        });
    },
    drawVorinor() {
      this.clearAllCircle();
      axios.get(this.base_url + 'vorinfo').then(res => {
        var result = res.data;
        this.vorDataSet = new mapv.DataSet(result);
        this.vorMapLayer = new mapv.baiduMapLayer(this.map1, this.vorDataSet, this.vorOptions);
        var legend = this.vorMapLayer.getLegend();
        legend.style.position = 'absolute';
        legend.style.left = '8px';
        legend.style.top = '85%';
        legend.style.visibility = 'visible';
        legend.setAttribute("id", "FuncAid");
        document.getElementById("map1-view").appendChild(legend);
      });
    },
    clickVor(item) {
      this.clickVorcount = this.clickVorcount + 1;
      var latlon = item.geometry.coordinates;
      var areaColor = '';
      if (this.tempVorDataSet.length == 2) {
        this.tempVorDataSet = [];
      }
      else {
        if (this.clickVorcount % 3 == 1) {
          areaColor = "#D0F7E9";
        }
        else if (this.clickVorcount % 3 == 2) {
          areaColor = "#FFEDC5";
        }
        this.tempVorDataSet.push({
          geometry: {
            type: "Polygon",
            coordinates: latlon
          },
          fillStyle: areaColor
        });
      }
      this.selectVorDataSet.set(this.tempVorDataSet);
      this.selectVorMapLayer = new mapv.baiduMapLayer(this.map1, this.selectVorDataSet, {
        strokeColor: "rgb(126, 140, 220)",
        strokeStyle: 'rgba(55, 55, 250, 0.3)',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        fillOpacity: 1
      });
    },
    getVorTrajectory() {
      var coord_o = this.tempVorDataSet[0].geometry.coordinates[0];
      var coord_d = this.tempVorDataSet[1].geometry.coordinates[0];
      this.clearAllCircle();
      this.selectVorMapLayer = new mapv.baiduMapLayer(this.map1, this.selectVorDataSet, {
        strokeColor: "rgb(126, 140, 220)",
        strokeStyle: 'rgba(55, 55, 250, 0.3)',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        fillOpacity: 1
      });
      axios.get(this.base_url + 'vordata?day=' + this.$store.state.selectDay + "&coord_o=" + coord_o + "&coord_d=" + coord_d)
        .then(res => {
          this.trajectory_dataSet = new mapv.DataSet(res.data.trajectory);
          this.trajectoryLayer = new mapv.baiduMapLayer(this.map1, this.trajectory_dataSet, this.trajectory_options);
          this.$store.state.mapBrushtrajectory = res.data.trajectory;
          this.path_dataSet = new mapv.DataSet(res.data.time_trajectory);
          this.pathLayer = new mapv.baiduMapLayer(this.map1, this.path_dataSet, this.path_options);
          this.$store.state.mapBrushtimetrajectory = res.data.time_trajectory;

          this.$store.state.mapBrushtrajectoryid = res.data.trajectoryid;

        });
    },
    getDetail() {
      this.showDetailModel = true;
    },
    getRoute() {
      this.pathLayer.hide();
      this.trajectoryLayer.hide();
      axios.get(this.base_url + 'criticalroute?cluster=' + this.$store.state.clusterNum)
        .then(res => {

          this.critcal_dataSet = new mapv.DataSet(res.data.trajectory);
          this.critcal_trajectoryLayer = new mapv.baiduMapLayer(this.map1, this.critcal_dataSet, this.critcal_trajectory_options);

          this.critcal_path_dataSet = new mapv.DataSet(res.data.time_trajectory);
          this.critcal_pathLayer = new mapv.baiduMapLayer(this.map1, this.critcal_path_dataSet, this.critcal_path_options);
        });
    },
    getAll() {
      this.critcal_trajectoryLayer.hide();
      this.critcal_pathLayer.hide();

      this.pathLayer.show();
      this.trajectoryLayer.show();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.ivu-card-body {
  padding: 3px;
}

.ivu-input-suffix i {
  line-height: 24px;
}

.ivu-btn {
  padding: 0px 3px;
}

.ivu-input {
  height: 25px;
}

.BMap_cpyCtrl {
  display: none;
}

.anchorBL {
  display: none;
}

.BMap_cpyCtrl {
  display: none;
}

.anchorBL {
  display: none;
}

.ivu-btn-group .ivu-btn-icon-only .ivu-icon {
  font-size: 24px !important;
}

</style>
