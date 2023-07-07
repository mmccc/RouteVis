import argparse
import pandas as pd
import numpy as np
import subprocess
import json
import os

parser = argparse.ArgumentParser()
parser.add_argument("filename", help="echo the string you use here")
parser.add_argument("clusterNum", help="echo the string you use here")
parser.add_argument("sup", help="echo the string you use here")
args = parser.parse_args()

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)


if __name__ == '__main__':
    df = pd.read_csv(args.filename, engine='python', encoding='utf-8')
    roadlevel = pd.read_csv('./backend/static/vmsp/chengdu_fid_level.csv', index_col=0)
    res = []
    for item in df.groupby(args.clusterNum):
        roadList = []
        trajectory = []
        for row in item[1].iterrows():
            roadList.append(row[1]['道路序列'].replace("[", "").replace("]", "").replace(" ", " -1 ") + str(" -1 -2"))
            traj = row[1]['轨迹点序列(百度)']
            points = traj[11:-1].split(",")
            coordinates = []
            for k, p in enumerate(points):
                lng, lat = p.split(" ")
                coordinates.append([lng, lat])

            trajectory.append({
                'id': row[0],
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates
                }
            })

        input_file = "./backend/static/vmsp/vmsp_intput.txt"
        output_file = "./backend/static/vmsp/vmsp_output.txt"
        file = open(input_file, 'w')
        for i in range(len(roadList)):
            s = str(roadList[i]).replace("'", "") + '\n'
            file.write(s)
        file.close()
        subprocess.call(
            ["java", "-jar", "./backend/static/vmsp/spmf.jar", "run", "VMSP", input_file, output_file, args.sup,
             str(100), str(1)])

        pat = []
        count = 0
        with open(output_file, "r") as f:
            for line in f.readlines():
                resvmsp = line.replace("#SUP: ", "").replace("-1", "")
                resList = np.fromstring(resvmsp, dtype=int, sep=' ')
                res_pat = resList[:-1]
                res_sup = resList[-1]
                levelList = roadlevel.loc[resList[:-1], 'level'].to_list()
                pat.append({
                    'pat': res_pat,
                    'sup': res_sup,
                    'level': levelList
                })

                count += 1

        res.append({
            'name': 'router' + str(item[0] + 1),
            'map0': trajectory,
            'value': count,
            'pattern': pat
        })

    ret_roles = json.dumps(res, ensure_ascii=False, indent=2, cls=NpEncoder)
    with open('./backend/static/vmsp.json', 'w') as fp:
        fp.write(ret_roles)