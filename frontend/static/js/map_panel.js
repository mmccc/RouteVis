var mapvLayer_Origin;

/**
 * 控制OD热力图转换的视图
 * **/
function originControl() {
    var day='20161101';
    $.ajax({
        url: "/origin_data",
        type: "post",
        data: {"selectDay": day},
        success: function(d) {
            // 访问成功 绘制热力图
            heatmapOrigin(d);
        }, error: function() {
            alert("访问失败")
        }
    });
}

/**
 * 绘制起始点热力图
 * **/
function heatmapOrigin(item){
    // 样式设置
    var options = {
            size: 13,
            gradient: {
                0.25: "rgb(0,0,255)",
                0.55: "rgb(0,255,0)",
                0.85: "yellow",
                1.0: "rgb(255,0,0)"
            },
            max: 100,
            draw: 'heatmap'
        };


    // 为底层轨迹点设置dataSet
    var dataSet = new mapv.DataSet(item.data);
    // 加载图层
    mapvLayer_Origin = new mapv.baiduMapLayer(map1, dataSet, options);

}

function destinationControl() {
    mapvLayer_Origin.destroy();
    mapvLayer_Origin = {};
}

/**
 * 控制交通信号灯添加视图
 * **/
function trafficLightsControl() {
    let target = document.getElementById('light-panel');

    if (target.style.display == "block"){
        target.style.display="none";
    } else {
        target.style.display="block";
    }
}