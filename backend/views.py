from django.http import HttpResponse, JsonResponse
import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry.point import Point
from coord_convert.transform import bd2wgs, wgs2bd
import subprocess
import sys
from sklearn import svm
from functools import cmp_to_key
import math
import shapely.geometry
from tqdm import tqdm
from sklearn.preprocessing import MinMaxScaler
from backend.read_data import get_day_info_data
from io import StringIO
from sklearn.cluster import AgglomerativeClustering
from sklearn import metrics
from sklearn.manifold import MDS


# Get the trajectory data of the brushed area.
def getBrushData(request):
    day = request.GET['day']
    olng = float(request.GET['olng'])
    olat = float(request.GET['olat'])
    olng, olat = bd2wgs(olng, olat)
    dlng = float(request.GET['dlng'])
    dlat = float(request.GET['dlat'])
    dlng, dlat = bd2wgs(dlng, dlat)
    radius = float(request.GET['radius'])

    df = get_day_info_data(day)
    degree = radius / 110000
    o_start = Point(olng, olat)
    d_end = Point(dlng, dlat)
    circle_start = o_start.buffer(degree)  # Radius(Degree)
    circle_end = d_end.buffer(degree)

    # Trajectory of origin--geopandas dataframe
    gdf_start = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df['出发经度'], df['出发纬度']))
    gdf_end = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df['到达经度'], df['到达维度']))
    del df

    # Filtering the trajectory within the circle
    gdf_within = gdf_start[gdf_start.geometry.within(circle_start) & gdf_end.geometry.within(circle_end)]
    del gdf_end
    del gdf_start

    trajectory = []
    time_trajectory = []
    trajectoryid = list(gdf_within['轨迹ID'].values)
    for i, item in enumerate(gdf_within['轨迹点序列(百度)']):
        points = item[11:-1].split(",")
        coordinates = []  # Latitude and longitude coordinates
        for k, p in enumerate(points):
            lng, lat = p.split(" ")
            time_trajectory.append({
                'id': trajectoryid[i],
                'geometry': {
                    'coordinates': [lng, lat],
                    'type': 'Point'
                },
                'count': 1,
                'time': k
            })
            coordinates.append([lng, lat])
        trajectory.append({
            'id': trajectoryid[i],
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            }
        })
    ret_roles = {'trajectory': trajectory, 'time_trajectory': time_trajectory, 'trajectoryid': trajectoryid}
    return JsonResponse(ret_roles)

# Get the similarity matrix through k-gram
# roadSeqList：Road Sequences
# k：The size of the sliding window
def getSimilarityByKGram(roadSeqList, k):
    seq_length = len(roadSeqList)
    kgramList = [None] * seq_length
    # Step1：the sequence is sliced according to the sliding window k
    for index, item in enumerate(roadSeqList):
        klist = np.arange(0, k) + np.arange(0, item.shape[0] - k + 1)[:, None]
        kgramList[index] = item[klist]

    # Step2：calculate the similarity between two sequences
    similarity_matrix = np.zeros((seq_length, seq_length))
    for si in tqdm(range(seq_length)):
        for sj in range(seq_length):
            if si == sj:
                similarity_matrix[si][sj] = 1.0
            else:
                if kgramList[si].shape[0] == 0 or kgramList[sj].shape[0] == 0:
                    similarity_matrix[si][sj] = 0.0
                else:
                    arr1 = np.unique(kgramList[si], axis=0)
                    arr2 = np.unique(kgramList[sj], axis=0)
                    tempU = np.unique(np.concatenate((arr1, arr2), axis=0), axis=0)

                    c1 = np.zeros(tempU.shape[0])
                    c2 = np.zeros(tempU.shape[0])
                    for idx in range(tempU.shape[0]):
                        count1 = np.where((kgramList[si] == tempU[idx]).all(axis=1))
                        count2 = np.where((kgramList[sj] == tempU[idx]).all(axis=1))
                        c1[idx] = count1[0].shape[0]
                        c2[idx] = count2[0].shape[0]

                    c1 = c1 / arr1.shape[0]
                    c2 = c2 / arr2.shape[0]

                    fenzi = np.dot(c1, c2)
                    fenmu = np.sqrt(np.sum(np.square(c1))) * np.sqrt(np.sum(np.square(c2)))
                    c = fenzi / fenmu
                    if c > 1:
                        c = 1
                    result = 1 - (np.arccos(c) * 2 / np.pi)
                    similarity_matrix[si][sj] = round(result, 3)
    return similarity_matrix  # Return the similarity matrix of the sequence

# Get the travel pattern by vertical maximum sequence pattern mining
def getVmsp(request):
    clusterNum = request.GET['clusterNum']
    sup = str(float(request.GET['sup']) / 100)
    filename = './backend/static/clusterInfo.csv'
    subprocess.call(
        ["python", "./backend/process_vmsp.py", filename, clusterNum, sup])

    with open('./backend/static/vmsp.json', 'r') as fp:
        ret_roles = fp.read()
    fp.close()

    return HttpResponse(ret_roles)

# Data normalization
def maxminnorm(array):
    maxcols = array.max(axis=0)
    mincols = array.min(axis=0)
    data_shape = array.shape
    data_rows = data_shape[0]
    data_cols = data_shape[1]
    t = np.empty((data_rows, data_cols))
    for i in range(data_cols):
        t[:, i] = (array[:, i] - mincols[i]) / (maxcols[i] - mincols[i])
    return t

# Get the weight of influencing factors
def getRankpath(request):
    clusterNum = request.GET['clusterNum']
    filename = './backend/static/clusterInfo.csv'
    df = pd.read_csv(filename, engine='python', encoding='utf-8')
    attributeList = ['出发时段', '时长(秒)', '道路熟悉', '通过道路数', '距离(米)', '拥堵程度']
    attributeList_en = ['Departure', 'Cost', 'Familiarity', 'Signal', 'Distance', 'Congestion']

    rank_rawdata = np.zeros((int(clusterNum[1:]), len(attributeList)))
    num_traj = np.zeros(int(clusterNum[1:]))
    for idx, item in df.groupby(clusterNum):
        data = item[attributeList].mean()
        rank_rawdata[idx] = data.values
        num_traj[idx] = item.shape[0]

    rank_data = maxminnorm(rank_rawdata)

    # Constructing the training set
    X = []
    Y = []
    for i in range(rank_data.shape[0]):
        for j in range(rank_data.shape[0]):
            if i == j:
                continue
            if num_traj[i] == num_traj[j]:
                if i < j:
                    y_t = 1
                else:
                    y_t = -1
            else:
                y_t = np.sign(num_traj[i] - num_traj[j])  # Default: ranked by number of trajectories
                if y_t != 1:
                    y_t = -1

            X.append(rank_data[i] - rank_data[j])
            Y.append(y_t)

    X_train = X
    Y_train = Y
    rank_svm = svm.LinearSVC().fit(X_train, Y_train)  # Training model
    aucRate = rank_svm.score(X_train, Y_train)
    print("aucRate：%d" % aucRate)
    totalWeight = rank_svm.coef_[0]
    totalW = []
    for i in range(len(totalWeight)):
        totalW.append({
            'attributeName': attributeList_en[i],
            'value': round(totalWeight[i], 2)
        })

    rankImportance = []
    temp_res = sorted(enumerate(rank_data),
                      key=cmp_to_key(lambda x, y: np.dot(y[1], totalWeight) - np.dot(x[1], totalWeight)))
    cluster_num = []
    routeRaw = []
    for i in range(len(temp_res)):
        t_temp = list(temp_res[i][1] * totalWeight)
        max_importance = max(map(abs, t_temp))
        raw_temp = []
        for j in range(len(totalWeight)):
            rankImportance.append({
                'RouteId': 'Route' + str(temp_res[i][0] + 1),
                'rank': i,
                'attrname': attributeList_en[j],
                'value': round(t_temp[j] / max_importance, 2)
            })
            raw_temp.append({
                'name': attributeList_en[j],
                'value': temp_res[i][1][j]
            })
        routeRaw.append({
            'name': 'Route' + str(temp_res[i][0] + 1),
            'value': 0.8,
            'children': raw_temp
        })
        cluster_num.append(temp_res[i][0])

    line_data = []
    tra_res = df[attributeList].copy()
    if tra_res.shape[0] != 0:
        tra_res[tra_res.columns.values.tolist()] = MinMaxScaler().fit_transform(
            tra_res[tra_res.columns.values.tolist()])

    for j in range(len(attributeList)):
        df[attributeList[j]] = tra_res[attributeList[j]]

    routeNum = []
    for idx, item in df.groupby(clusterNum):
        line_temp = []
        for tralist in item.iterrows():
            traj_temp = []
            ttra_temp = list(tralist[1][attributeList]) * totalWeight
            maxtra_importance = max(map(abs, ttra_temp))
            for j in range(len(attributeList)):
                traj_temp.append({
                    'attr': attributeList_en[j],
                    'val': tralist[1][attributeList[j]] * totalWeight[j] / maxtra_importance,
                })
            line_temp.append(traj_temp)
        line_data.append({
            'RouteId': 'Route' + str(idx + 1),
            "value": line_temp
        })
        routeNum.append({
            'RouteId': 'Route' + str(idx + 1),
            "value": item.shape[0]
        })

    new_line_data = []
    new_routeNum = []
    for itx in cluster_num:
        new_line_data.append(line_data[itx])
        new_routeNum.append(routeNum[itx])

    ret_roles = {'totalWeight': totalW, 'rankImportance': rankImportance, 'line_data': new_line_data,
                 'routeNum': new_routeNum,
                 'routeRaw': routeRaw}
    return JsonResponse(ret_roles)

# Get the daily statistic information
def getDayInfo(request):
    with open('./backend/static/20230213_nor_dayInfo.json', 'r') as fp:
        ret_roles = fp.read()
    fp.close()
    return HttpResponse(ret_roles)

# Get the traffic function area
def getVorInfo(request):
    with open('./backend/static/20220403_vorInfo.json', 'r') as fp:
        ret_roles = fp.read()
    fp.close()
    return HttpResponse(ret_roles)

# Get the trajectory of the traffic function area
def getVorData(request):
    day = request.GET['day']
    coord_o = request.GET['coord_o']
    coord_d = request.GET['coord_d']
    data = get_day_info_data(day)
    o_temp = [float(i) for i in coord_o.split(",")]
    d_temp = [float(i) for i in coord_d.split(",")]
    o_data = [[np.array(o_temp).reshape(-1, 2).tolist()]]
    d_data = [[np.array(d_temp).reshape(-1, 2).tolist()]]
    poly_shape = []
    poly_shape.append(shapely.geometry.asShape({'type': 'MULTIPOLYGON', 'coordinates': o_data}))
    poly_shape.append(shapely.geometry.asShape({'type': 'MULTIPOLYGON', 'coordinates': d_data}))
    trajectory = []
    time_trajectory = []
    trajectoryid = []
    for index, row in tqdm(data.iterrows()):
        olat, olng = wgs2bd(row['出发经度'], row['出发纬度'])
        dlat, dlng = wgs2bd(row['到达经度'], row['到达维度'])
        opoint = shapely.geometry.Point(olat, olng)
        dpoint = shapely.geometry.Point(dlat, dlng)
        if poly_shape[0].intersects(opoint) and poly_shape[1].intersects(dpoint):
            coordinates = []
            points = row['轨迹点序列(百度)'][11:-1].split(",")
            for idx, point in enumerate(points):
                lng, lat = point.split(" ")
                time_trajectory.append({
                    'id': row['轨迹ID'],
                    'geometry': {
                        'coordinates': [lng, lat],
                        'type': 'Point'
                    },
                    'count': 1,
                    'time': idx
                })
                coordinates.append([lng, lat])
            trajectory.append({
                'id': row['轨迹ID'],
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates
                }
            })
            trajectoryid.append(row['轨迹ID'])
    ret_roles = {'trajectory': trajectory, 'time_trajectory': time_trajectory, 'trajectoryid': trajectoryid}
    return JsonResponse(ret_roles)

# Regaining the weights of influencing factors
def getNewRank(request):
    clusterNum = request.GET['clusterNum']
    dt = float(request.GET['dt'])
    tc = float(request.GET['tc'])
    rf = float(request.GET['rf'])
    tl = float(request.GET['tl'])
    trd = float(request.GET['trd'])
    trc = float(request.GET['trc'])

    filename = './backend/static/clusterInfo.csv'
    df = pd.read_csv(filename, engine='python', encoding='utf-8')
    attributeList = ['出发时段', '时长(秒)', '道路熟悉', '通过道路数', '距离(米)', '拥堵程度']
    attributeList_en = ['Departure', 'Cost', 'Familiarity', 'Signal', 'Distance', 'Congestion']

    rank_rawdata = np.zeros((int(clusterNum[1:]), len(attributeList)))
    num_traj = np.zeros(int(clusterNum[1:]))
    for idx, item in df.groupby(clusterNum):
        data = item[attributeList].mean()
        rank_rawdata[idx] = data.values
        num_traj[idx] = item.shape[0]

    rank_data = maxminnorm(rank_rawdata)

    X = []
    Y = []
    y_t = []
    for i in range(rank_data.shape[0]):
        for j in range(rank_data.shape[0]):
            if i == j:
                continue
            if num_traj[i] == num_traj[j]:
                if i < j:
                    y_t = 1
                else:
                    y_t = -1
            else:
                y_t = np.sign(num_traj[i] - num_traj[j])
                if y_t != 1:
                    y_t = -1
            if (rank_data.shape[0] < 5):
                for _ in range(math.ceil(20 / rank_data.shape[0])):
                    X.append(rank_data[i] - rank_data[j])
                    Y.append(y_t)
            else:
                X.append(rank_data[i] - rank_data[j])
                Y.append(y_t)

    for i in range(len(X)):
        X.append([dt, tc, rf, tl, trd, trc])
        Y.append(-1)

    X_train = X
    Y_train = Y

    rank_svm = svm.LinearSVC().fit(X_train, Y_train)
    aucRate = rank_svm.score(X_train, Y_train)
    totalWeight = rank_svm.coef_[0]
    totalW = []
    for i in range(len(totalWeight)):
        totalW.append({
            'attributeName': attributeList_en[i],
            'value': round(totalWeight[i], 2)
        })

    rankImportance = []
    temp_res = sorted(enumerate(rank_data),
                      key=cmp_to_key(lambda x, y: np.dot(y[1], totalWeight) - np.dot(x[1], totalWeight)))

    cluster_num = []
    routeRaw = []
    for i in range(len(temp_res)):
        t_temp = list(temp_res[i][1] * totalWeight)
        max_importance = max(map(abs, t_temp))
        raw_temp = []
        for j in range(len(totalWeight)):
            rankImportance.append({
                'RouteId': 'Route' + str(temp_res[i][0] + 1),
                'rank': i,
                'attrname': attributeList_en[j],
                'value': round(t_temp[j] / max_importance, 2)
            })
            raw_temp.append({
                'name': attributeList_en[j],
                'value': temp_res[i][1][j]
            })
        routeRaw.append({
            'name': 'Route' + str(temp_res[i][0] + 1),
            'value': 0.8,
            'children': raw_temp
        })
        cluster_num.append(temp_res[i][0])

    line_data = []
    tra_res = df[attributeList].copy()
    if tra_res.shape[0] != 0:
        tra_res[tra_res.columns.values.tolist()] = MinMaxScaler().fit_transform(
            tra_res[tra_res.columns.values.tolist()])
    for j in range(len(attributeList)):
        df[attributeList[j]] = tra_res[attributeList[j]]

    routeNum = []
    for idx, item in df.groupby(clusterNum):
        line_temp = []
        for tralist in item.iterrows():
            traj_temp = []
            ttra_temp = list(tralist[1][attributeList]) * totalWeight
            maxtra_importance = max(map(abs, ttra_temp))
            for j in range(len(attributeList)):
                traj_temp.append({
                    'attr': attributeList_en[j],
                    'val': tralist[1][attributeList[j]] * totalWeight[j] / maxtra_importance,
                })
            line_temp.append(traj_temp)
        line_data.append({
            'RouteId': 'Route' + str(idx + 1),
            "value": line_temp
        })
        routeNum.append({
            'RouteId': 'Route' + str(idx + 1),
            "value": item.shape[0]
        })

    new_line_data = []
    new_routeNum = []
    for itx in cluster_num:
        new_line_data.append(line_data[itx])
        new_routeNum.append(routeNum[itx])

    ret_roles = {'totalWeight': totalW, 'rankImportance': rankImportance, 'line_data': new_line_data,
                 'routeNum': new_routeNum,
                 'routeRaw': routeRaw}
    return JsonResponse(ret_roles)

# Get details of all trajectories
def getTraDetail(request):
    day = request.GET['day']
    select_trajectory = list(request.GET['trajectory'].split(","))
    df = get_day_info_data(day)
    filterpath = df.set_index('轨迹ID').loc[select_trajectory]
    tra_res_t = filterpath[['出发时段', '时长(秒)', '道路熟悉', '通过道路数', '距离(米)', '拥堵程度']]

    if tra_res_t.shape[0] != 0:
        tra_res_temp = MinMaxScaler().fit_transform(tra_res_t)
    tra_res = pd.DataFrame(tra_res_temp, columns=tra_res_t.columns.values.tolist(),
                           index=filterpath.index.values.tolist())
    timeday = [0] * 24
    res_value = []
    i = 0
    for index, row in tra_res.iterrows():
        idx = index[0:12]
        timeday[filterpath.iloc[i]['出发时刻']] += 1
        res_value.append({
            'id': idx,
            'Attr': 'Origin',
            'value': filterpath.iloc[i]['道路序列'].replace("[", '').replace("]", '').split(' ')[0]
        })
        res_value.append({
            'id': idx,
            'Attr': 'Destination',
            'value': filterpath.iloc[i]['道路序列'].replace("[", '').replace("]", '').split(' ')[-1]
        })
        res_value.append({
            'id': idx,
            'Attr': 'Departure',
            'value': str(row['出发时段'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Cost',
            'value': str(row['时长(秒)'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Familiarity',
            'value': str(row['道路熟悉'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Signal',
            'value': str(row['通过道路数'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Distance',
            'value': str(row['距离(米)'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Congestion',
            'value': str(row['拥堵程度'])
        })
        i += 1
    timeData = []
    for i in range(24):
        timeData.append({
            'name': str(i),
            'value': str(timeday[i])
        })
    avgvalue = []
    avgvalue.append({
        'name': 'Departure',
        'value': '{:.2f}'.format(tra_res_t['出发时段'].mean())
    })
    avgvalue.append({
        'name': 'Familiarity',
        'value': '{:.2f}'.format(tra_res_t['道路熟悉'].mean())
    })
    avgvalue.append({
        'name': 'Cost',
        'value': '{:.2f}'.format(tra_res_t['时长(秒)'].mean())
    })
    avgvalue.append({
        'name': 'Signal',
        'value': '{:.2f}'.format(tra_res_t['通过道路数'].mean())
    })
    avgvalue.append({
        'name': 'Distance',
        'value': '{:.2f}'.format(tra_res_t['距离(米)'].mean())
    })

    avgvalue.append({
        'name': 'Congestion',
        'value': '{:.2f}'.format(tra_res_t['拥堵程度'].mean())
    })
    ret_roles = {'total': filterpath.shape[0], 'timeData': timeData, 'value': res_value, 'avgvalue': avgvalue}
    return JsonResponse(ret_roles)

# Finding the best match for a sequence
def mutipleSequenceAlignment(s1, s2):
    MATCH = 5  # mathc
    MISMATCH = -4  # dismatch
    GAP = -6  # insert gap
    NUM_COLS = len(s1) + 1
    NUM_ROWS = len(s2) + 1
    costs = np.zeros((NUM_ROWS, NUM_COLS))
    val = 0
    for i in range(0, NUM_COLS):
        costs[0][i] = val
        val -= 6
    val = -6
    for j in range(1, NUM_ROWS):
        costs[j][0] = val
        val -= 6
    for y in range(1, NUM_ROWS):
        for x in range(1, NUM_COLS):
            valTop = costs[y - 1][x] + GAP
            valLeft = costs[y][x - 1] + GAP
            valDag = 0
            if s1[x - 1] == s2[y - 1]:
                valDag = costs[y - 1][x - 1] + MATCH
            else:
                valDag = costs[y - 1][x - 1] + MISMATCH
            val = max(valTop, valLeft, valDag)
            costs[y][x] = val
    return costs[NUM_ROWS - 1][NUM_COLS - 1], costs

# Calculating sequence identity
def mutipleSequenceAlignmentScore(x, y, costs, s1, s2):
    MATCH = 5
    MISMATCH = -4
    GAP = -6
    sys.setrecursionlimit(9000000)
    if (x == 0 and y == 0) or (x < 0 or y < 0 or x > len(s1) or y > len(s2)):
        return (0, 0, 0, [], [])

    valTop = float('-inf')
    valLeft = float('-inf')

    if y - 1 >= 0:
        valTop = costs[y - 1][x] + GAP

    if x - 1 >= 0:
        valLeft = costs[y][x - 1] + GAP

    valDag = costs[y - 1][x - 1] if x - 1 >= 0 and y - 1 >= 0 else float('-inf')
    valDag = valDag + (MATCH if s1[x - 1] == s2[y - 1] else MISMATCH)

    if max([valTop, valLeft, valDag]) == valTop:
        match, mismatch, gap, subs1, subs2 = mutipleSequenceAlignmentScore(x, y - 1, costs, s1, s2)
        subs1.append(float('-inf'))
        subs2.append(s2[y - 1])
        return (match, mismatch, gap + 1, subs1, subs2)

    elif max([valTop, valLeft, valDag]) == valLeft:
        match, mismatch, gap, subs1, subs2 = mutipleSequenceAlignmentScore(x - 1, y, costs, s1, s2)
        subs1.append(s1[x - 1])
        subs2.append(float('-inf'))
        return (match, mismatch, gap + 1, subs1, subs2)

    else:
        match, mismatch, gap, subs1, subs2 = mutipleSequenceAlignmentScore(x - 1, y - 1, costs, s1, s2)
        subs1.append(s1[x - 1])
        subs2.append(s2[y - 1])
        if s1[x - 1] == s2[y - 1]:
            return (match + 1, mismatch, gap, subs1, subs2)
        else:
            return (match, mismatch + 1, gap, subs1, subs2)

# Calculating the route clustering and its evaluation results
def getRouteCluster(request):
    day = request.GET['day']
    select_trajectory = list(request.GET['trajectory'].split(","))
    df = get_day_info_data(day)
    filterpath = df.set_index('轨迹ID').loc[select_trajectory]
    kvalue = int(request.GET['kvalue'])
    tempList = filterpath['道路序列'].map(lambda x: x.replace("[", "").replace("]", ""))
    roadSeqList = [np.loadtxt(StringIO(i), delimiter=" ", ndmin=1) for i in tempList]
    filterpath['新道路序列'] = roadSeqList
    hirearchy_input = getSimilarityByKGram(roadSeqList, kvalue)
    posibble_cluster = 11 if len(select_trajectory) >= 11 else len(select_trajectory)
    sc_score = np.zeros(posibble_cluster)
    ch_score = np.zeros(posibble_cluster)
    dbi_score = np.zeros(posibble_cluster)
    mas_score = np.zeros(posibble_cluster)

    for cluster in range(2, posibble_cluster):
        clustering = AgglomerativeClustering(n_clusters=cluster, affinity='euclidean', linkage='average').fit(
            hirearchy_input)
        labels = clustering.labels_
        sc_score[cluster - 2] = metrics.silhouette_score(np.array(hirearchy_input), labels, metric='euclidean')
        ch_score[cluster - 2] = metrics.calinski_harabasz_score(np.array(hirearchy_input), labels)
        dbi_score[cluster - 2] = metrics.davies_bouldin_score(np.array(hirearchy_input), labels)

        filterpath['R' + str(cluster)] = labels
        grouped = filterpath.groupby('R' + str(cluster))
        match, mismatch, gap = 0, 0, 0
        msa_list = np.zeros(cluster)
        for name, group in grouped:
            for i in range(group['新道路序列'].shape[0] - 1):
                for j in range(group['新道路序列'].shape[0]):
                    x = group['新道路序列'][i]
                    y = group['新道路序列'][j]
                    _, costs = mutipleSequenceAlignment(x, y)

                    tempmatch, tempmismatch, tempgap, _, _ = mutipleSequenceAlignmentScore(len(x), len(y), costs, x, y)
                    match += tempmatch
                    mismatch += tempmismatch
                    gap += tempgap
            msa_list[name] = (match / (match + mismatch + gap)) / group.shape[0]
        mas_score[cluster] = msa_list.sum() / cluster

    mas_score = (mas_score - np.min(mas_score)) / (np.max(mas_score) - np.min(mas_score))
    sc_score = (sc_score - np.min(sc_score)) / (np.max(sc_score) - np.min(sc_score))
    ch_score = (ch_score - np.min(ch_score)) / (np.max(ch_score) - np.min(ch_score))
    dbi_score = (dbi_score - np.min(dbi_score)) / (np.max(dbi_score) - np.min(dbi_score))

    # bestCluster = mas_score * 0.3 + sc_score * 0.2 + ch_score * 0.2 + dbi_score * 0.2
    # bestCluster = np.argmax(bestCluster) + 2
    bestCluster = 3
    dff = MDS(n_components=2, random_state=200).fit_transform(hirearchy_input)
    filterpath['x'] = dff[:, 0]
    filterpath['y'] = dff[:, 1]
    filterpath.to_csv('./backend/static/clusterInfo.csv')
    clusterInfo = []
    for idx, row in filterpath.iterrows():
        clusterInfo.append({
            'x': row['x'],
            'y': row['y'],
            'cluster': row['R' + str(bestCluster)],
            'trajectoryId': idx
        })

    clusterPie = []
    num = filterpath.groupby(['R' + str(bestCluster)])['R' + str(bestCluster)].count()
    for i in range(1, bestCluster + 1):
        clusterPie.append({
            'name': 'Route' + str(i),
            'value': str(num[i - 1])
        })
    clusterNum = []
    for cluster in range(2, posibble_cluster):
        clusterNum.append({
            'name': 'SI.',
            'k': str(cluster),
            'value': str(mas_score[cluster - 2])
        })
        clusterNum.append({
            'name': 'SC.',
            'k': str(cluster),
            'value': str(sc_score[cluster - 2])
        })
        clusterNum.append({
            'name': 'CHI.',
            'k': str(cluster),
            'value': str(ch_score[cluster - 2])
        })
        clusterNum.append({
            'name': 'DBI.',
            'k': str(cluster),
            'value': str(dbi_score[cluster - 2])
        })
    ret_roles = {'clusterInfo': clusterInfo, 'clusterPie': clusterPie, 'clusterNum': clusterNum,
                 'bestCluster': str(bestCluster)}
    return JsonResponse(ret_roles)


# Get the best clusters as considered by users
def getRouteClusterbyUser(request):
    bestCluster = request.GET['clusterNum']
    filename = './backend/static/clusterInfo.csv'
    df = pd.read_csv(filename, engine='python', encoding='utf-8')
    clusterInfo = []
    for idx, row in df.iterrows():
        clusterInfo.append({
            'x': row['x'],
            'y': row['y'],
            'cluster': row[str(bestCluster)],
            'trajectoryId': idx
        })
    clusterPie = []
    num = df.groupby([str(bestCluster)])[str(bestCluster)].count()
    for i in range(1, int(bestCluster.split('R')[1]) + 1):
        clusterPie.append({
            'name': 'Route' + str(i),
            'value': str(num[i - 1])
        })
    ret_roles = {'clusterInfo': clusterInfo, 'clusterPie': clusterPie}
    return JsonResponse(ret_roles)

# Get information about each factor of the route
def getRouteDetail(request):
    column = request.GET['cluster']
    route = int(request.GET['route'][5:]) - 1

    data = pd.read_csv('./backend/static/clusterInfo.csv')
    filterpath = data.loc[data[column] == route, :].set_index('轨迹ID')
    tra_res_t = filterpath[['出发时段', '时长(秒)', '道路熟悉', '通过道路数', '距离(米)', '拥堵程度']]
    if tra_res_t.shape[0] != 0:
        tra_res_temp = MinMaxScaler().fit_transform(tra_res_t)

    tra_res = pd.DataFrame(tra_res_temp, columns=tra_res_t.columns.values.tolist(),
                           index=filterpath.index.values.tolist())

    time_day = [0] * 24
    res_value = []
    i = 0
    for index, row in tra_res.iterrows():
        idx = index[0:12]
        time_day[filterpath.iloc[i]['出发时刻']] += 1
        res_value.append({
            'id': idx,
            'Attr': 'Origin',
            'value': filterpath.iloc[i]['道路序列'].replace("[", '').replace("]", '').split(' ')[0]
        })
        res_value.append({
            'id': idx,
            'Attr': 'Destination',
            'value': filterpath.iloc[i]['道路序列'].replace("[", '').replace("]", '').split(' ')[-1]
        })
        res_value.append({
            'id': idx,
            'Attr': 'Departure',
            'value': str(row['出发时段'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Cost',
            'value': str(row['时长(秒)'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Familiarity',
            'value': str(row['道路熟悉'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Signal',
            'value': str(row['通过道路数'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Distance',
            'value': str(row['距离(米)'])
        })
        res_value.append({
            'id': idx,
            'Attr': 'Congestion',
            'value': str(row['拥堵程度'])
        })
        i += 1
    timeData = []
    for i in range(24):
        timeData.append({
            'name': str(i),
            'value': str(time_day[i])
        })

    avgvalue = []
    avgvalue.append({
        'name': 'Departure',
        'value': '{:.2f}'.format(tra_res_t['出发时段'].mean())
    })
    avgvalue.append({
        'name': 'Familiarity',
        'value': '{:.2f}'.format(tra_res_t['道路熟悉'].mean())
    })
    avgvalue.append({
        'name': 'Cost',
        'value': '{:.2f}'.format(tra_res_t['时长(秒)'].mean())
    })
    avgvalue.append({
        'name': 'Signal',
        'value': '{:.2f}'.format(tra_res_t['通过道路数'].mean())
    })
    avgvalue.append({
        'name': 'Distance',
        'value': '{:.2f}'.format(tra_res_t['距离(米)'].mean())
    })
    avgvalue.append({
        'name': 'Congestion',
        'value': '{:.2f}'.format(tra_res_t['拥堵程度'].mean())
    })
    ret_roles = {'total': filterpath.shape[0], 'timeData': timeData, 'value': res_value, 'avgvalue': avgvalue}
    return JsonResponse(ret_roles)

# Get the critical route
def getCritialRoute(request):
    route = request.GET['cluster']
    cluster_data = pd.read_csv('./backend/static/clusterInfo.csv')
    grouped = cluster_data.groupby(route)
    critial_route = pd.DataFrame(columns=cluster_data.columns.values.tolist())
    for name, group in grouped:
        tempmax = 0
        temploc = 0
        for i, x in enumerate(group['新道路序列']):
            for j, y in enumerate(group['新道路序列']):
                if y > x:
                    _, costs = mutipleSequenceAlignment(x, y)
                    tempmatch, tempmismatch, tempgap, _, _ = mutipleSequenceAlignmentScore(len(x), len(y), costs, x, y)
                    as_score = tempmatch / (tempmatch + tempmismatch + tempgap)
                    if as_score > tempmax:
                        tempmax = as_score
                        temploc = i
        critial_route = critial_route.append(group.iloc[temploc])

    colorList = ['rgb(131,64,38,0.7)', 'rgb(230,111,81,0.7)', 'rgb(233,196,107,0.7)', 'rgb(237,221,195,0.7)',
                 'rgb(138,176,125,0.7)', 'rgb(42,157,140,0.7)', 'rgb(40,114,113,0.7)', 'rgb(192,122,146,0.7)',
                 'rgb(226,195,201,0.7)', 'rgb(53,78,135,0.7)']
    trajectory = []
    time_trajectory = []
    trajectoryid = list(critial_route['轨迹ID'].values)
    for i, item in enumerate(critial_route['轨迹点序列(百度)']):
        points = item[11:-1].split(",")
        coordinates = []
        for k, p in enumerate(points):
            lng, lat = p.split(" ")
            time_trajectory.append({
                'id': trajectoryid[i],
                'geometry': {
                    'coordinates': [lng, lat],
                    'type': 'Point'
                },
                'count': 1,
                'time': k
            })
            coordinates.append([lng, lat])
        trajectory.append({
            'id': trajectoryid[i],
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            },
            'strokeStyle': colorList[critial_route.iloc[i][route]],

        })
    ret_roles = {'trajectory': trajectory, 'time_trajectory': time_trajectory, 'trajectoryid': trajectoryid}
    return JsonResponse(ret_roles)
