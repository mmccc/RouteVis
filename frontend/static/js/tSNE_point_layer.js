
/**
 * 从服务器获取tSNE数据
 * **/
function getTSNEData(k) {
    $.ajax({
        url: "/t_sne",
        type: "post",
        data: {"k_gram": k, "tracks": JSON.stringify(gTracksData)},
        success: function(d) {
            // 访问成功 绘制散点图
            showTSNEChart(d.data);
        }, error: function() {
            alert("访问失败")
        }
    })
}

function getText() {
    console.log("xxxxxxxxxxxx");
}



/**
 * 从服务器获取VMSP数据
 * **/
function getVMSPData() {

    $.ajax({
        url: "/vmsp",
        type: "post",
        data: {"brushed_id": JSON.stringify(gBrushedId), "tracks": JSON.stringify(gTracksData)},
        success: function(d) {
            // 访问成功 返回所有vmsp得到的模式 绘制列表
            showVmspTable(d.data)
        }, error: function() {
            alert("访问失败")
        }
    })
}

function gettestData() {
    console.log("fffffff");
}


/**
 * 处理数据 并绘制散点图
 * **/
function showTSNEChart(pdata) {

    // 根据7个时间段分成不同组
    let pointArray_c1 = [];
    let pointArray_c2 = [];
    let pointArray_c3 = [];
    let pointArray_c4 = [];
    let pointArray_c5 = [];
    let pointArray_c6 = [];
    let pointArray_c7 = [];
    // 分7类存储id
    let idArray_c1 = [];
    let idArray_c2 = [];
    let idArray_c3 = [];
    let idArray_c4 = [];
    let idArray_c5 = [];
    let idArray_c6 = [];
    let idArray_c7 = [];

    for(let i=0; i<pdata.length; i++)
    {
        // 根据时间戳分组
        switch(Number(pdata[i]['o_timestamp'])){
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                pointArray_c1.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c1.push(pdata[i]['id']);
                break;
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
                pointArray_c2.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c2.push(pdata[i]['id']);
                break;
            case 16:
            case 17:
                pointArray_c3.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c3.push(pdata[i]['id']);
                break;
            case 18:
                pointArray_c4.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c4.push(pdata[i]['id']);
                break;
            case 19:
                pointArray_c5.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c5.push(pdata[i]['id']);
                break;
            case 20:
            case 21:
            case 22:
                pointArray_c6.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c6.push(pdata[i]['id']);
                break;
            case 23:
                pointArray_c7.push([pdata[i]['x'], pdata[i]['y']]);
                idArray_c7.push(pdata[i]['id']);
                break;
        }
    }

    // 绘制Echarts图表
    let dom = document.getElementById("point-view");
    let myChart = echarts.init(dom);
    let option = {
        xAxis: {
            axisLabel: {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color: 'rgb(87, 121, 149)'
                }
            },
            axisTick: {
                show: false
            },
            splitLine: {
                // show: false,
                lineStyle: {
                    color: 'rgb(87, 121, 149)',
                    type: 'dotted'
                }
            }
        },
        yAxis: {
            axisLabel: {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color: 'rgb(87, 121, 149)'
                }
            },
            axisTick: {
                show: false
            },
            splitLine: {
                // show: false,
                lineStyle: {
                    color: 'rgb(87, 121, 149)',
                    type: 'dotted'
                }
            }
        },
        grid: {
            left: '18%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
            data: ['0-7','8-15','16-17', '18', '19', '20-22', '23'],
            // left: 'left',
            left: 10,
            orient: 'vertical',
            top: 'center',
            textStyle: {
                color: 'rgb(87, 121, 149)'
            }
        },
        toolbox : {
            top: 10,
            right: 10,
            feature:{
                magicType: {
                    type: ['stack', 'tiled']
                },
                dataView: {}
            }
        },
        brush:{
            toolbox: ['rect', 'polygon', 'keep', 'clear'],
            xAxisIndex: 0,
            throttleType: 'debounce',
            throttleDelay: 300
        },
        series: [
            {
                name: '0-7',
                symbolSize: 8,
                data: pointArray_c1,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'brown'
                    }
                }
            },
            {
                name: '8-15',
                symbolSize: 8,
                data: pointArray_c2,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'green'
                    }
                }
            },
            {
                name: '16-17',
                symbolSize: 8,
                data: pointArray_c3,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'rgb(255, 164, 0)'
                    }
                }
            },
            {
                name: '18',
                symbolSize: 8,
                data: pointArray_c4,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'rgb(248, 108, 20)'
                    }
                }
            },
            {
                name: '19',
                symbolSize: 8,
                data: pointArray_c5,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'red'
                    }
                }
            },
            {
                name: '20-22',
                symbolSize: 8,
                data: pointArray_c6,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'rgb(104, 41, 144)'
                    }
                }
            },
            {
                name: '23',
                symbolSize: 8,
                data: pointArray_c7,
                type: 'scatter',
                itemStyle:{
                    normal:{
                        color: 'rgb(84, 120, 147)'
                    }
                }
            },
        ]
    };

    if (option && typeof option === "object") {
        myChart.setOption(option, true);
        // 刷选
        myChart.on('brushselected', function (params) {
            // 刷选元素
            let brushComponent = params.batch[0];
            // 刷选得到的id数组
            let aBrushedId = [];

            if (brushComponent.length !== 0) {
                for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
                    /*
                    console.log("brushComponent.selected:::: ", sIdx);
                    console.log("selected[sIdx].dataIndex:::: ", brushComponent.selected[sIdx].dataIndex);
                    console.log("selected[sIdx].seriesName::::", brushComponent.selected[sIdx].seriesName);
                    */
                    // selected[sIdx].dataIndex is [index1, index2, ...]
                    for (let j = 0; j < brushComponent.selected[sIdx].dataIndex.length; j++) {
                        switch (brushComponent.selected[sIdx].seriesName) {
                            case '0-7':
                                aBrushedId.push(idArray_c1[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                            case '8-15':
                                aBrushedId.push(idArray_c2[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                            case '16-17':
                                aBrushedId.push(idArray_c3[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                            case '18':
                                aBrushedId.push(idArray_c4[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                            case '19':
                                aBrushedId.push(idArray_c5[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                            case '20-22':
                                aBrushedId.push(idArray_c6[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                            case '23':
                                aBrushedId.push(idArray_c7[brushComponent.selected[sIdx].dataIndex[j]]);
                                break;
                        }
                    }
                }

                // 将刷选的id数组添加到全局变量中
                gBrushedId = aBrushedId;
                showArrayTracks(aBrushedId, gTracksData);

            }
        });
    }
}