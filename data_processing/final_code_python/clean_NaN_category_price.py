# drop row having NaN values 
# drop row having category not 2
# convert price to xxx.xxx.xxx format 
import pandas as pd
import numpy as np
import requests
from decimal import Decimal
import math

#read raw_data.csv
df = pd.read_csv('./raw_data.csv', error_bad_lines=False)

#drop rows missing num_bed, num_bath, price, area, category, lat, lon
df.dropna(subset=['num_bed','num_bath','price','area','category', 'lat', 'lon'],inplace=True)

#drop rows not category 2
df = df.loc[df['category'] == 2]

#remove '' element 
def remove_empty_ele(arr):
    remove_empty_ele_arr = list(filter(lambda x: x != "", arr))
    return remove_empty_ele_arr

#clean price 
def clean_price(raw_price, area):
    try:
        price_range = False
        if type(raw_price) != str:
            return -1
        elif raw_price == '' or raw_price == ' ' or raw_price.lower() == 'thỏa thuận' or raw_price.lower() == 'thương lượng':
            return -1
        else:
            raw_price = raw_price.strip()
            raw_price_els_colon = raw_price.split(':')
        
        if(raw_price_els_colon[0].lower() == 'giá'):
            raw_price = raw_price_els_colon[1].strip()            

        if("\n" in raw_price):
            raw_price = raw_price.replace("\n", " ")
        if("-" in raw_price):
            raw_price = raw_price.replace("-", " ")
            price_range = True
        
        raw_price_els_space = raw_price.split(' ')
        raw_price_els_space = remove_empty_ele(raw_price_els_space)

        if len(raw_price_els_space) == 1:
            return convert_price_to_decimal(raw_price_els_space[0], '', area)
        else:
            total_price = 0
            if price_range == True:
                n_raw_price_els = len(raw_price_els_space)
                unit = raw_price_els_space[-1]
                for i in range(0, n_raw_price_els):
                    if i != n_raw_price_els - 1:
                        total_price += convert_price_to_decimal(raw_price_els_space[i], unit, area)
                average_price = total_price/2
                return average_price
            else:
                for i in range(0, len(raw_price_els_space)):
                    if i % 2 == 0:
                        total_price += convert_price_to_decimal(raw_price_els_space[i], raw_price_els_space[i + 1], area)
                return total_price
    except:
        return -1

#convert price to decimal 
def convert_price_to_decimal(price, unit, area):
    price = price.replace(',', '.').strip()
    unit = unit.lower().strip()
    decimal_price = 0.0

    if unit == '':
        price = price.replace('.', '')
        decimal_price = Decimal(price)
    elif unit == 'tỷ':
        decimal_price = (Decimal(price)*1000000000)
    elif unit == 'triệu':
        decimal_price = Decimal(price)*1000000
    elif unit == 'nghìn':
        decimal_price = Decimal(price)*1000
    elif unit == 'đ':
        price = price.replace('.', '')
        decimal_price = Decimal(price)
    elif unit == 'triệu/m\u00b2':
        decimal_price = Decimal(price)*1000000*Decimal(area)
    
    return decimal_price

#pre-process data
def pre_process(x):
    #clean price
    x['price'] = clean_price(x['price'], x['area'])
    return x

# #pre process raw data
df = df.apply(pre_process, axis=1)
#drop rows with invalid price
df = df.drop(df[df['price'] == -1].index)

df.to_csv('./clean_NaN_category_price.csv', index=False, encoding = 'utf-8')

