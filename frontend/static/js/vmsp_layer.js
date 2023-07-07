// pattern table组件的全局变量
var gPatternTableCtor;

/**
 * 初始化表格
 * **/
function initialPatternTable() {

    let oVmspTable = {

        methods: {
            showChoosePattern(rows) {
                let aChooseRoads = [];
                for (let i of rows) {
                    aChooseRoads.push(i['name']);
                }
                showPatternRoad(aChooseRoads);
            },
            deleteRow(index, rows) {
                rows.splice(index, 1);
            },
            chooseRow(rows) {
                let aChooseRoads = [];
                for (let i of rows) {
                    aChooseRoads.push(i['name']);
                }
                chooseTracksByPattern(gTracksData, aChooseRoads, gBrushedId);
            },
            clickTag(name) {
                console.log(name);
                showPatternRoad([name]);
            }
        },

        data() {
            return {
                tableData: [],
                tags: []
            }
        }
    };

    // 使用Vue挂载到界面
    let Ctor = Vue.extend(oVmspTable);
    gPatternTableCtor = new Ctor().$mount('#vmsp-table');
}

/**
 * 展示经过VMSP算法挖掘到的道路序列模式
 * **/
function showVmspTable(pData) {

    let tempData = [];
    let aRoads = [];
    let t1 = [];
    let t2 = [];

    // 蓝色 主要道路
    let oRoadsTypeDic = {
        'primary': '', 'trunk': '', 'link': '', 'primary_link': '', 'road': '', 'path': '', 'trunk_link': '',
        'Residential': 'success', 'construction': 'success', 'cycleway': 'success', 'living_street': 'success',
        'secondary': 'warning', 'tertiary_link': 'warning', 'tertiary': 'warning',
        'motorway_link': 'danger', 'motorway': 'danger',
        'unclassified': 'info', 'Footway': 'info', 'Service': 'info', 'Track': 'info', 'secondary_link': 'info', 'steps': 'info', 'no': 'info', 'pedestrian': 'info'
    };

    $.getJSON("../static/data/roads_data.json", function (roads){
        let oTypeDic = {};
        for (let road of roads) {
            oTypeDic[road['id']] = oRoadsTypeDic[road['highway']]
        }

        // 数据处理 这里i作为序号
        for (let i=0; i<pData.length; i++) {
            t1 = [];
            t2 = pData[i]["roads"].split(',');
            for (let item of t2) {
                t1.push({ name: item, type: oTypeDic[item]});
            }
            aRoads.push(t1);

            tempData.push({
                index: i+1,
                sup: pData[i]["sup"]
            })
        }

        gPatternTableCtor.tableData = tempData;
        gPatternTableCtor.tags = aRoads.reverse();
    });
}