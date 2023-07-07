<template>
  <div class="parameterpanel" style="margin-top: 2px;">
    <Card style="height:32vh">
      <p slot="title" style="text-align:left; height: 25px; margin-left:15px; margin-top: 2px;">
        <span class="viewTitle">Parameter Panel</span>
      </p>
      <div style="margin-left:18px; margin-top: 5px;">
        <span style="font-weight:bold;">Date:</span>
        <Date-picker v-model="day" @on-change="SelectDay" type="date" placeholder="Select Day"
                     style="width: 200px; margin-left: 15px;"></Date-picker>
      </div>
      <div style="margin-left: 5px; margin-top: 10px;">
        <span style="font-weight:bold;">Radius:</span>
        <Input v-model="circleRadius" @on-change="changeRadius" style="width: 200px; height: 24px; margin-left: 14px;"/>
      </div>

      <div style="margin-left: 5px; margin-top: 10px;">
        <span style="font-weight:bold; margin-left: -223px;">K-gram:</span>
        <Slider v-model="kgram" @on-change="changeK" :min="0" :max="10"
                style="width: 238px; margin-left: 105px; margin-top: -30px; position: absolute;" show-input></Slider>
      </div>

      <div style="margin-left: 5px; margin-top: 10px;">
        <span style="font-weight:bold; margin-left: -246px;">VMSP(sup):</span>
        <Slider v-model="sup" @on-change="changeSup" :tip-format="format"
                style="width: 238px; margin-left: 105px; margin-top: -30px; position: absolute;" show-input></Slider>
      </div>

      <div style="margin-left: 5px; margin-top: 10px;">
        <span style="font-weight:bold; margin-left: -246px;">Configure:</span>
        <Form class="'myform" :model="formItem" :label-width="35" style="margin-top: 8px;">
          <Row>
            <i-col span="12">
              <FormItem label="Departure" style="font-size: 6px;">
                <Input v-model="formItem.DT" style="width: 44px; float: left; margin-left: 25px;"></Input>
                <Button class="addBtn" icon="md-add" @click="addDT()"></Button>
                <Button class="minBtn" icon="md-remove" @click="minusDT()"></Button>
              </FormItem>
              <FormItem label="Cost">
                <Input v-model="formItem.TC"
                       style="width: 44px; float: left; margin-top: 3px; margin-left: 25px;"></Input>
                <Button class="addBtn" icon="md-add"
                        @click="addTC()"></Button>
                <Button class="minBtn" icon="md-remove"
                        @click="minusTC()"></Button>
              </FormItem>
              <FormItem label="Familiarity">
                <Input v-model="formItem.RF" style="width: 44px; float: left; margin-left: 25px;"></Input>
                <Button class="addBtn" icon="md-add"
                        @click="addRF()"></Button>
                <Button class="minBtn" icon="md-remove"
                        @click="minusRF()"></Button>
              </FormItem>
              <FormItem label="Signal">
                <Input v-model="formItem.TL" style="width: 44px; float: left; margin-left: 25px;"></Input>
                <Button class="addBtn" icon="md-add"
                        @click="addTL()"></Button>
                <Button class="minBtn" icon="md-remove"
                        @click="minusTL()"></Button>
              </FormItem>

            </i-col>
            <i-col span="12" style="padding-left: 4px;">
              <FormItem label="Distance" style="margin-left: 2px;">
                <Input v-model="formItem.TrD"
                       style="width: 44px; float: left; margin-top: 3px; margin-left: 25px;"></Input>
                <Button class="addBtn" icon="md-add"
                        @click="addTrD()"></Button>
                <Button class="minBtn" icon="md-remove"
                        @click="minusTrD()"></Button>
              </FormItem>

              <FormItem label="Congestion" style="margin-left: 2px;">
                <Input v-model="formItem.TrC"
                       style="width: 44px; float: left; margin-top: 3px; margin-left: 25px;"></Input>
                <Button class="addBtn" icon="md-add"
                        @click="addTrC()"></Button>
                <Button class="minBtn" icon="md-remove"
                        @click="minusTrC()"></Button>
              </FormItem>
              <Button
                style="height: 30px; width: 80px; position: relative; margin-right: -45px; margin-top: 15px; font-weight: bold;"
                @click="reRank()">Rank
              </Button>
            </i-col>
          </Row>
        </Form>
      </div>


    </Card>
  </div>
</template>

<script>
import axios from 'axios'
import ICol from "../../node_modules/iview/src/components/grid/col.vue";

export default {
  components: {ICol},
  name: 'parameter',
  data() {
    return {
      base_url: 'http://127.0.0.1:8700/',
      day: '2016-11-01',
      kgram: 4,
      sup: 50,
      circleRadius: 800,
      formItem: {
        DT: '',
        RF: '',
        TL: '',
        TrC: '',
        TrD: '',
        TC: ''
      },
      modifyThreshold: 0.1
    }
  },
  watch: {
    attrWeight() {
      this.formItem.DT = this.$store.state.dt;
      this.formItem.TC = this.$store.state.tc;
      this.formItem.RF = this.$store.state.rf;
      this.formItem.TL = this.$store.state.tl;
      this.formItem.TrD = this.$store.state.trd;
      this.formItem.TrC = this.$store.state.trc;
    }
  },
  computed: {
    attrWeight() {
      return this.$store.state.dt;
    }
  },
  created() {
  },
  mounted() {},
  methods: {
    SelectDay() {
      var date = new Date(this.day);
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      var time = y + '' + m + '' + d;
      this.$store.state.selectDay = time;
    },
    format(val) {
      return val + '%';
    },
    changeRadius() {
      this.$store.state.circleRadius = this.circleRadius;
    },
    changeK() {
      this.$store.state.kgram = this.kgram;
    },
    changeSup() {
      this.$store.state.sup = this.sup;
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
    reRank() {
      var dt = this.$store.state.dt > this.formItem.DT ? 1 : this.$store.state.dt < this.formItem.DT ? -1 : 0;
      var tc = this.$store.state.tc > this.formItem.TC ? 1 : this.$store.state.tc < this.formItem.TC ? -1 : 0;
      var rf = this.$store.state.rf > this.formItem.RF ? 1 : this.$store.state.rf < this.formItem.RF ? -1 : 0;
      var tl = this.$store.state.tl > this.formItem.TL ? 1 : this.$store.state.tl < this.formItem.TL ? -1 : 0;
      var trd = this.$store.state.trd > this.formItem.TrD ? 1 : this.$store.state.trd < this.formItem.TrD ? -1 : 0;
      var trc = this.$store.state.trc > this.formItem.TrC ? 1 : this.$store.state.trc < this.formItem.TrC ? -1 : 0;

      axios.get(this.base_url + 'newrankdata?clusterNum=' + this.$store.state.clusterNum + "&dt=" + dt + "&tc=" + tc + "&rf=" + rf + "&tl=" + tl + "&trd=" + trd + "&trc=" + trc)
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
        });
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.ivu-slider-input .ivu-input-number {
  float: right;
  margin-top: -4px;
  width: 50px;
  margin-right: 30px;
}

.ivu-form-item {
  margin-bottom: -2px !important;
}

.MyformItem .ivu-form-item-label {
  font-size: 12px !important;
  font-weight: bold;
}

.addBtn {
  color: red;
  margin-left: -26px;
  margin-top: -10px;
  border-color: white;
  font-size: 20px;
  width: 24px;
  height: 24px;
  padding: 0px 0px;
  position: relative;
  text-align: center;
}

.minBtn {
  color: green;
  border-color: white;
  font-size: 20px;
  margin-top: 0px;
  width: 24px;
  height: 24px;
  margin-left: 0px;
  padding: 0px 0px;
  position: absolute;
}

.ivu-form-item {
  margin-bottom: 2px !important;
}

.ivu-form .ivu-form-item-label {
  font-size: 12px !important;
  color: black !important;
}
</style>
