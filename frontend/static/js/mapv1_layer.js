// 轨迹视图
var mapvLayer_tracks;
var mapvLayer_move;
// 路径视图
var mapvLayer_Route;


/**
 * ajax
 * **/

function getMapVData() {
    $.ajax({
        url: "/tracks",
        type: "post",
        data: {},
        success: function(d) {
            showAllTracks(d.data);
            // 添加到全局变量
            gTracksData = d.data;
        }, error: function() {
            alert("访问失败")
        }
    })
}

/**
 * 绘制全部轨迹
 * **/
function showAllTracks(pData) {

    if (typeof mapvLayer_tracks !== 'undefined') {
        mapvLayer_tracks.destroy();
    }
    if (typeof mapvLayer_move !== 'undefined') {
        mapvLayer_move.destroy();
    }
    let trackData = [];
    let timeData = [];
    let current_id = '';

    let t = 0;
    let coordinates = [];
    for (var i = 0; i < pData.length; i++) {
        if (pData[i]['id'] !== current_id || i === (pData.length - 1)) {
            t = 0;
            trackData.push({
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                },
                count: 5
            });
            coordinates = [];
            current_id = pData[i]['id'];
        }
        t+=1;
        coordinates.push([pData[i]['lng'], pData[i]['lat']]);
        timeData.push({
            geometry: {
                type: 'Point',
                coordinates: [pData[i]['lng'], pData[i]['lat']]
            },
            count: i,
            time: t
        });
    }
    var options_tracks = {
        strokeStyle: 'rgba(126, 140, 220, 0.5)',
        coordType: 'bd09ll',
        shadowColor: 'rgba(126, 140, 220, 0.2)',
        shadowBlur: 3,
        lineWidth: 3.0,
        methods: {
            click: function (item) {
                console.log(item);
            }
        },
        draw: 'simple'
    };
    var options_movePoint = {
        fillStyle: 'rgba(255, 255, 255, 0.2)',
        coordType: 'bd09ll',
        // globalCompositeOperation: "lighter",
        size: 1.5,
        draw: 'simple',
        animation: {
            stepsRange: {
                start: 0,
                end: 200
            },
            trails: 3,
            duration: 10,
        },
    };
    var dataSet_tracks = new mapv.DataSet(trackData);
    var dataSet_movePoint = new mapv.DataSet(timeData);

    mapvLayer_tracks = new mapv.baiduMapLayer(map1, dataSet_tracks, options_tracks);
    mapvLayer_move = new mapv.baiduMapLayer(map1, dataSet_movePoint, options_movePoint);


}

/**
 * 绘制一组轨迹
 * **/
function showArrayTracks(brushPointArray, tracksData) {

    if (typeof mapvLayer_tracks !== 'undefined') {
        mapvLayer_tracks.destroy();
    }
    if (typeof mapvLayer_move !== 'undefined') {
        mapvLayer_move.destroy();
    }

    let trackData = [];
    let timeData = [];

    for (var i = 0; i < brushPointArray.length; i++) {
        var coordinates = [];
        for (var j = 1; j < tracksData.length; j++) {
            if (brushPointArray[i] === tracksData[j]['id']) {
                coordinates.push([tracksData[j]['lng'], tracksData[j]['lat']]);
            }
        }
        trackData.push({
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            oid: brushPointArray[i],
            count: 5
        });
    }

    // 样式设置
    var options_tracks = {
        strokeStyle: 'rgba(126, 140, 220, 0.5)',
        coordType: 'bd09ll',
        shadowColor: 'rgba(126, 140, 220, 0.2)',
        shadowBlur: 3,
        lineWidth: 3.0,
        methods: {
            click: function (item) {
                console.log(item);
            }
        },
        draw: 'simple'
    };

    // 为底层轨迹点设置dataSet
    var dataSet_tracks = new mapv.DataSet(trackData);

    // 加载图层
    mapvLayer_tracks = new mapv.baiduMapLayer(map1, dataSet_tracks, options_tracks);
}

/**
 * 绘制路径
 * **/
function showArrayRoute(brushPointArray, tracksData) {

    let trackData = [];

    for (var i = 0; i < brushPointArray.length; i++) {
        var coordinates = [];
        for (var j = 1; j < tracksData.length; j++) {
            if (brushPointArray[i] === tracksData[j]['id']) {
                coordinates.push([tracksData[j]['lng'], tracksData[j]['lat']]);
            }
        }
        trackData.push({
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            oid: brushPointArray[i],
            count: 5
        });
    }

    // 样式设置
    var options_tracks = {
        strokeStyle: gRouteColor[gColorIndex],
        coordType: 'bd09ll',
        shadowBlur: 3,
        lineWidth: 3.0,
        methods: {
            click: function (item) {
                console.log(item);
            }
        },
        draw: 'simple'
    };

    // 为底层轨迹点设置dataSet
    let dataSet_tracks = new mapv.DataSet(trackData);
    // 加载图层
    mapvLayer_Route = new mapv.baiduMapLayer(map1, dataSet_tracks, options_tracks);
}

// function OrignData() {
//     var day='20161101';
//     $.ajax({
//         url: "/origin_data",
//         type: "post",
//         data: {"selectDay": day},
//         success: function(d) {
//             // 访问成功 绘制热力图
//             heatmapOrigin(d);
//         }, error: function() {
//             alert("访问失败")
//         }
//     });
// }

