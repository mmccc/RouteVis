import os
import pandas as pd

# 数据DataFrame, 日期(天)
_df, _day = None, None
base_path = "./backend/static/data/"

def get_day_info_data(day):
    # 全局对象
    global _df, _day

    if day != _day:
        #
        _day = day
        path = os.path.join(base_path, f'{_day}.csv')
        _df = pd.read_csv(path, encoding='utf-8')

    return _df
