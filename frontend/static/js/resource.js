/**
 * 存放全局变量
 *
 * **/

// 选择OD区域内的轨迹 object类型
var gTracksData = {};

// 刷选出的t-SNE投影视图的轨迹id数组
var gBrushedId = [];

// 依次选择路径颜色
var gRouteColor = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae'];

var gColorIndex = 0;

// 交通信号灯
var gLightsCtor;