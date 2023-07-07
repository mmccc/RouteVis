import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectDay: '20161101',
    mapBrushtrajectoryid: '',
    mapBrushtrajectory: '',
    mapBrushtimetrajectory: '',
    tsneBrushtrajectoryid: '',
    selectPath: '',
    vmspSelectPath: '',
    sup: '50',
    kgram: '4',
    circleRadius: 800,
    sankeyNodes: [],
    sankeyLinks: [],
    sankeyNodeID: 0,
    sankeyLinkID: 0,
    reRunCount: 1,
    reRunTimeStamp: [],
    clusterNum: '',
    dt: '',
    tc: '',
    rf: '',
    tl: '',
    trd: '',
    trs: '',
    trc: '',
    rankData: ''
  },
  mutations: {},
  actions: {}
})


