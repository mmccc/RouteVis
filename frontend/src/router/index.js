import Vue from 'vue'
import Router from 'vue-router'
import Parameter from '@/components/Parameter'
import Mapview from '@/components/Mapview'
import Rank from '@/components/Rankview'
import tSNE from '@/components/tSNE'
import Vmsp from '@/components/Vmspview'
import Overview from '@/components/overView'
import Detailview from '@/components/Detailview'



Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'parameter',
      component: Parameter
    },
    {
      path: '/',
      name: 'mapview',
      component: Mapview
    },
    {
      path: '/',
      name: 'rankview',
      component: Rank
    },
    {
      path: '/',
      name: 'tsneview',
      component: tSNE
    },
    {
      path: '/',
      name: 'vmspview',
      component: Vmsp
    },
    {
      path: '/',
      name: 'overview',
      component: Overview
    },
    {
      path: '/',
      name: 'detailview',
      component: Detailview
    }
  ]
});
