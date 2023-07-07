// 轨迹视图
var mapvLayer_road;
var mapvLayer_text;


/**
 * 绘制道路模式
 * **/
function showPatternRoad(roadId) {
    if (typeof mapvLayer_road !== 'undefined') {
        mapvLayer_road.destroy();
    }
    if (typeof mapvLayer_text !== 'undefined') {
        mapvLayer_text.destroy();
    }

    // roadId = roadId.sort(sortNum);

    let roadData = [];
    let textData = [];

    $.getJSON("../static/data/roads_data.json", function (data){
        for (let item of data) {
            console.log(item['id']);

            // 判断当前道路id是否是为模式中的道路
            if (roadId.indexOf(item['id']) > -1) {
                // 添加一整条道路
                let coordinates = [];
                for (let coord of item['coordinates']) {
                    coordinates.push([coord[0], coord[1]]);
                }
                roadData.push({
                    geometry: {
                        type: 'LineString',
                        coordinates: coordinates
                    },
                    count: 1,
                    strokeStyle: '#F56C6C',
                });
                textData.push({
                    geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(item['coordinates'][0][0]), parseFloat(item['coordinates'][0][1])]
                    },
                    text: item['id'],
                });
            }
        }

        let dataSet = new mapv.DataSet(roadData);
        let textDataSet = new mapv.DataSet(textData);

        let options = {
            lineWidth: 4,
            methods: { // 一些事件回调函数
            },
            draw: 'simple'
        };

        let text_options = {
            draw: 'text',
            avoid: true,
            size: 12,
            font: '18px Arial',
            fillStyle: 'grey',
            textBaseline: 'middle',
            textAlign: 'center',
        };

        mapvLayer_road = new mapv.baiduMapLayer(map1, dataSet, options);
        mapvLayer_text = new mapv.baiduMapLayer(map1, textDataSet, text_options);
    });
}


/**
 * 根据道路序列模式绘制轨迹
 * **/
function chooseTracksByPattern(tracks, pattern, brushed) {

    // 遍历轨迹点 提取道路
    let aRoads = [];
    let aId = [];
    // 当前id
    let sCurrentId = '';
    let temp = [];
    for (let item of tracks) {
        // 先判断轨迹点是否在t-SNE刷选的区域内
        if (brushed.indexOf(item["id"]) !== -1) {
            if (sCurrentId === item["id"]) {
                // 如果temp中未存储道路
                if (temp.indexOf(String(item["road"])) === -1) {
                    temp.push(String(item["road"]));
                }
            } else {
                // 当前id更改则存储上一条id的 id值 与 道路序列
                // 第一条id 不存储
                if (temp.length !== 0) {
                    aRoads.push(temp);
                    aId.push(sCurrentId);
                }
                temp = [];
                sCurrentId = item["id"];
            }
        }
    }
    // 存储最后一组轨迹
    if (temp !== []) {
        aRoads.push(temp);
        aId.push(sCurrentId);
    } else {
        console.log('数据为空');
    }

    // 返回满足条件的轨迹id
    let aRes = [];

    // 判断轨迹是否符合选中模式
    for (let i in aId) {
        if (allIn(pattern, aRoads[i])) {
            aRes.push(aId[i]);
        }
    }

    // 绘制符合模式的轨迹
    showArrayRoute(aRes, gTracksData);

    // 向gRouteTable中添加数据
    getFeature(aRes, gTracksData);
}

/**
 * 判断A数组是否包含于B数组
 * param A {array} 较小的数组
 * param B {array} 较大的数组
 * return: {boolean}
 * **/
function allIn(A, B) {
    let t = A.filter(function(val){return B.indexOf(val)>-1});
    return (t.length === A.length);
}