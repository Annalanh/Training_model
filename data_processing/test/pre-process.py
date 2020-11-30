import pandas as pd
import numpy as np
import requests
from decimal import Decimal
import math

df = pd.read_csv('./raw-data-12.csv', error_bad_lines=False, nrows=1000)


#drop rows missing num_floor, num_bed, num_bath, price, area, category, address
df.dropna(subset=['num_floor','num_bed','num_bath','price','area','category','address'],inplace=True)

#drop rows with rent category
rent_category_ids = [12,13,14,15,16,17,18,19,20,21,22,26,27,31,32,34]
for rent_category_id in rent_category_ids:
    df = df.drop(df[df['category'] == rent_category_id].index)

#utility list 
utilities = [
    { 'name': 'hospital', 'k': 'amenity', 'v': 'hospital' },
    { 'name': 'university', 'k': 'amenity', 'v': 'university' },
    { 'name': 'medical_supply', 'k': 'shop', 'v': 'medical_supply' },
    { 'name': 'pharmacy', 'k': 'amenity', 'v': 'pharmacy' },
    { 'name':  'clinic',  'k':'amenity','v':'clinic'},
    { 'name': 'kindergarten', 'k': 'amenity', 'v': 'childcare' },
    { 'name': 'school', 'k': 'amenity', 'v': 'school' },
    { 'name': 'college', 'k': 'amenity', 'v': 'college' },
    { 'name': 'mall', 'k': 'shop', 'v': 'mall' },
    { 'name': 'supermarket', 'k': 'shop', 'v': 'supermarket' },
    { 'name': 'convenience', 'k': 'amenity', 'v': 'convenience' },
    { 'name': 'cafe', 'k': 'amenity', 'v': 'cafe' },
    { 'name': 'parking', 'k': 'amenity', 'v': 'parking' },
    { 'name': 'bus_station', 'k': 'amenity', 'v': 'bus_station' },
    { 'name': 'police', 'k': 'amenity', 'v': 'police' },
    { 'name': 'bank', 'k': 'amenity', 'v': 'bank' },
    { 'name': 'marketplace', 'k': 'amenity', 'v': 'marketplace' },
]
#length of utility list
n_utilities = len(utilities)
#add utilities column 
for i in range(n_utilities):
    new_col_name = utilities[i]['name']
    df[new_col_name] = pd.Series([], dtype='float64')

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

#fill coordinates
def fill_coordinates(address):
    poi_data = requests.get("https://apis.wemap.asia/geocode-1/search?text={}&key=vpstPRxkBBTLaZkOaCfAHlqXtCR".format(address))
    poi_data_json = poi_data.json()
    poi_data_features = poi_data_json['features']
    if len(poi_data_features) > 0:
        return poi_data_features[0]['geometry']['coordinates']
    else:
        return []

#count utilities
def calculate_utilities(lat, lon):
    counted_utilities = {
        'hospital': 0,
        'university': 0,
        'medical_supply': 0,
        'pharmacy': 0,
        'clinic': 0,
        'kindergarten': 0,
        'school': 0,
        'college': 0,
        'mall': 0, 
        'supermarket': 0,
        'convenience': 0,
        'cafe': 0,
        'parking': 0,
        'bus_station': 0,
        'police': 0,
        'bank': 0,
        'marketplace':0
    }
    for i in range(n_utilities):
        utility = utilities[i]
        utility_name = utility['name']
        api_url = "https://apis.wemap.asia/we-tools/explore?lat={}&lon={}&k={}&v={}&d=1000&key=vpstPRxkBBTLaZkOaCfAHlqXtCR&limit=30&type=raw".format(lat, lon, utility['k'], utility['v'])
        get_utility = requests.get(api_url)
        counted_utilities[utility_name] = len(get_utility.json())
    return counted_utilities

#pre-process data
def pre_process(x):

    #clean price
    x['price'] = clean_price(x['price'], x['area'])
    print(x['_id'])

    #clean coordinates
    if math.isnan(x['lat']) or math.isnan(x['lon']):
        coords = fill_coordinates(x['address'])
        if coords == []:
            x['lon'] = -1
            x['lat'] = -1        
        else:
            x['lon'] = coords[0]
            x['lat'] = coords[1]

    #calculate utilities
    counted_utilities = calculate_utilities(x['lat'], x['lon'])
    for k,v in counted_utilities.items():
        x[k] = v
    return x

#pre process raw data
df = df.apply(pre_process, axis=1)
#drop rows with invalid price
df = df.drop(df[df['price'] == -1].index)
#drop rows with invalid or no lat, lon
df = df.drop(df[df['lon'] == -1].index)
df = df.drop(df[df['lat'] == -1].index)
#export to csv
df.to_csv('./clean-data-12.csv', index=False, encoding = 'utf-8')

