// 创建Map实例
var map1 = new BMap.Map("map1-view", {
    enableMapClick: false
});

// 初始化地图,设置中心点坐标和地图级别
map1.centerAndZoom(new BMap.Point(104.07447,30.664519), 11);//104.040847,30.466655
map1.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放


var point_o = new BMap.Point(104.077457, 30.493639);//104.077457, 30.493639
var point_d = new BMap.Point(104.021888, 30.455853);//104.021888, 30.455853

var circle_o = new BMap.Circle(point_o,500,{fillColor:"rgb(158, 188, 113)", strokeColor:"rgb(126, 140, 220)", strokeWeight: 4 ,fillOpacity: 0.6, strokeOpacity: 0.8,enableEditing:false});
var circle_d = new BMap.Circle(point_d,500,{fillColor:"rgb(209, 176, 113)", strokeColor:"rgb(126, 140, 220)", strokeWeight: 4 ,fillOpacity: 0.6, strokeOpacity: 0.8,enableEditing:false});

/** 起点区域点击事件 **/
circle_o.addEventListener("click", function () {
    //getMapVData()
    OrignData()
});
map1.addOverlay(circle_o);
map1.addOverlay(circle_d);


// 地图自定义样式
map1.setMapStyle({
    styleJson: [{
        'featureType': 'water',
        'elementType': 'all',
        'stylers': {
            'color': '#d6ecf0'
        }
    }, {
        'featureType': 'land',
        'elementType': 'all',
        'stylers': {
            'color': '#f9f9f0'
        }
    }, {
        'featureType': 'green',
        'elementType': 'all',
        'stylers': {
            'visibility': 'on',
            'color': '#e5f2df'
        }
    }, {
        'featureType': 'railway',
        'elementType': 'all',
        'stylers': {
            'visibility': 'off'
        }
    }, {
        'featureType': 'highway',
        'elementType': 'all',
        'stylers': {
            'visibility': 'on',
            'color': '#fffee0'
        }
    }, {
        "featureType": "highway",
        "elementType": "geometry.stroke",
        "stylers": {
            'visibility': 'on',
            "color": "#dddddd"
        }
    }, {
        'featureType': 'arterial',
        'elementType': 'geometry.fill',
        'stylers': {
            'color': '#ffffff'
        }
    }, {
        'featureType': 'arterial',
        'elementType': 'geometry.stroke',
        'stylers': {
            'color': '#dddddd'
        }
    }, {
        'featureType': 'road',
        'elementType': 'labels.text.fill',
        'stylers': {
            'color': '#6c6969'
        }
    }, {
        'featureType': 'poi',
        'elementType': 'all',
        'stylers': {
            'visibility': 'on'
        }
    }, {
        'featureType': 'subway',
        'elementType': 'all',
        'stylers': {
            'visibility': 'off'
        }
    }, {
        'featureType': 'manmade',
        'elementType': 'all',
        'stylers': {
            'visibility': 'off',
            'color': '#bcd2b3'
        }
    }, {
        'featureType': 'local',
        'elementType': 'all',
        'stylers': {
            'visibility': 'off'
        }
    }, {
        'featureType': 'building',
        'elementType': 'all',
        'stylers': {
            'visibility': 'off'
        }
    }, {
        'featureType': 'label',
        'elementType': 'labels.text.fill',
        'stylers': {
            'color': '#6c6969'
        }
    }]
});