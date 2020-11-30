const request = require("request")
const express = require('express')
const csv = require('csv-parser');
const fs = require('fs');
const app = express()
var csvWriter = require('csv-write-stream')
let writer = csvWriter()
writer = csvWriter({ headers: [
    "_id","lat","lon","area","price","num_bed","num_bath","category","hospital", "university", "medical_supply", "pharmacy", "school", "college", "cafe","bus_station","police","bank","marketplace"
]});
writer.pipe(fs.createWriteStream('./utilities/test_out_20171_20200.csv', {flags: 'a'}))

const utilities = [
    { 'name': 'hospital', 'k': 'amenity', 'v': 'hospital' },
    { 'name': 'university', 'k': 'amenity', 'v': 'university' },
    { 'name': 'medical_supply', 'k': 'shop', 'v': 'medical_supply' },
    { 'name': 'pharmacy', 'k': 'amenity', 'v': 'pharmacy' },
    { 'name': 'school', 'k': 'amenity', 'v': 'school' },
    { 'name': 'college', 'k': 'amenity', 'v': 'college' },
    { 'name': 'cafe', 'k': 'amenity', 'v': 'cafe' },
    { 'name': 'bus_station', 'k': 'amenity', 'v': 'bus_station' },
    { 'name': 'police', 'k': 'amenity', 'v': 'police' },
    { 'name': 'bank', 'k': 'amenity', 'v': 'bank' },
    { 'name': 'marketplace', 'k': 'amenity', 'v': 'marketplace' },
]

const data = [];

fs.createReadStream('clean_NaN_category_price.csv')
    .pipe(csv())
    .on('data', (row) => {
        let arr = []
        let utilityCounts = {
            hospital: 0,
            university: 0,
            medical_supply: 0,
            pharmacy: 0,
            school: 0,
            college: 0,
            cafe: 0,
            bus_station: 0,
            police: 0,
            bank: 0,
            marketplace: 0
        }

        utilities.forEach(utility => {
            arr.push(getOneUtility(utility, row.lat, row.lon))
        })

        Promise.all(arr).then((docs) => {

            docs.forEach((doc, index) => {
                utilityCounts[utilities[index].name] = docs[index].length
            })
            Object.keys(utilityCounts).forEach(key => row[key] = utilityCounts[key])

            writer.write(row)

        }).catch((e) => {
            Object.keys(utilityCounts).forEach(key => row.key = utilityCounts[key])
            data.push(row)
        })

    })
    .on('end', () => {
        console.log("read done!")
    });

function getOneUtility(utility, lat, lon) {
    return new Promise((resolve, reject) => {
        request(`https://apis.wemap.asia/we-tools/explore?lat=${lat}&lon=${lon}&k=${utility.k}&v=${utility.v}&d=500&key=vpstPRxkBBTLaZkOaCfAHlqXtCR&type=raw`, (error, header, body) => {
            if (error) {
                reject(error)
            }
            else {
                try {
                    result = JSON.parse(body)
                    resolve(result)
                } catch (e) {
                    reject(e)
                }
            }
        })
    })
}























app.listen(8080)