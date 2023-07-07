<template>
  <div id="app">
    <Row type="flex" justify="start" :gutter="2">

      <i-col style="width: 20%;">
        <overview></overview>
        <parameter></parameter>
      </i-col>
      <i-col style="width: 60%;">
        <mapview></mapview>
        <rankview></rankview>
      </i-col>
      <i-col style="width: 20%;">
        <tsneview></tsneview>
        <vmspview></vmspview>
      </i-col>
    </Row>

  </div>
</template>

<script>
import parameter from './components/Parameter.vue'
import mapview from './components/Mapview.vue'
import rankview from './components/Rankview.vue'
import tsneview from './components/tSNE.vue'
import vmspview from './components/Vmspview.vue'
import overview from './components/overView.vue'
import detailview from './components/Detailview.vue'
import Row from '../node_modules/iview/src/components/grid/row.vue'
import ICol from '../node_modules/iview/src/components/grid/col.vue'

export default {
  name: 'App',
  components: {
    parameter,
    mapview,
    rankview,
    tsneview,
    vmspview,
    overview,
    detailview
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.ivu-card-head {
  padding: 0px 0px;
}

html, body, #app {
  height: 100%;
}
</style>
