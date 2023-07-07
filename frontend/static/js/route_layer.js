// route table组件的全局变量
var gRouteTableCtor;

/**
 * 初始化路径表格
 * **/
function initialRouteTable() {
    let Main = {
        data() {
            return {
                routeData: []
            }
        },
        methods: {
            format_tracks(d) {
                return () => {
                    return Number(d/1.12);
                }
            },
            format_len(d) {
                return () => {
                    return (d/9.72).toFixed(2) + 'km';
                }
            },
            format_time(d) {
                return () => {
                    return (d/6.23).toFixed(2) + 'min';
                }
            },
            format_light(d) {
                return () => {
                    return Number(d/9.09);
                }
            },
            format_speed(d) {
                return () => {
                    return (d/1.11).toFixed(2) + 'km/h';
                }
            }
        }
    };

    let Ctor = Vue.extend(Main);
    gRouteTableCtor = new Ctor().$mount('#route-view');
}


/**
 * 提取路径中影响因素的值
 * **/
function getFeature(aChooseId, aTracks) {

    let d = 0; // 路径长度
    let t = 0; // 时间成本
    // 从全部的轨迹中筛选满足的id进行计算
    for (let i in aTracks) {
        if (i > 0 && aChooseId.includes(aTracks[i]["id"])) {
            if (aTracks[i]["id"] === aTracks[i-1]["id"]) {
                d += haversine(aTracks[i-1]["lat"], aTracks[i-1]["lng"], aTracks[i]["lat"], aTracks[i]["lng"]);
                t += aTracks[i]["time"] - aTracks[i-1]["time"];
            }
        }
    }

    let c = aChooseId.length;

    // 平均距离 公里
    let average_d = parseFloat(d / c).toFixed(2);
    // 平均时间 分钟
    let average_t = parseFloat(t / c / 60).toFixed(2);

    // 平均速度 km/h
    let s = parseFloat(average_d / (average_t / 60)).toFixed(2);



    let tempData = {
        route: '路径' + (gRouteTableCtor.routeData.length + 1),
        tracks: c *1.12,
        len: average_d *9.72,
        time: average_t *6.23,
        light: Number(gLightsCtor.nLightsValue) *9.09,
        speed: s *1.11,
        // 通过全局变量选择颜色
        color: gRouteColor[gColorIndex]
    };
    // 更新全局变量中的颜色选择 5个颜色依次循环
    gColorIndex < gRouteColor.length ? (gColorIndex += 1) : (gColorIndex = 0);

    gRouteTableCtor.routeData.push(tempData);
}


/**
 * 计算两坐标点间的距离
 * **/
function haversine(lat1, lng1, lat2, lng2){
    let radLat1 = lat1*Math.PI / 180.0;
    let radLat2 = lat2*Math.PI / 180.0;
    let a = radLat1 - radLat2;
    let b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
        Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s * 6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;

    return s;
}
