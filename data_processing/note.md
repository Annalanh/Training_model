1. Export data to .csv 
mongoexport --host localhost --db REQIS --collection data --type=csv --fields _id,lat,lon,area,price,num_bed,num_bath,address,category --limit 500000 --out raw_data.csv
2. Materials
https://www.keboola.com/blog/linear-regression-machine-learning
3. Merge csv
cat *.csv >clean_NaN_category_price_utilities.csv
