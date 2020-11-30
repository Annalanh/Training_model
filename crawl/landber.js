const rp = require(`request-promise`)
const request = require(`request`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, list_id[0], list_type[0], 1, 0)
}).catch(console.log)
function run(db,id, type,page, index) {
    console.log(`running ${page} - ${CategoryId[index]} - ${index} - ${id}`)
    getID(id , type,page).then(data => {
      data.forEach(de => {
        getDetail(de).then(ts => {
          ts.category=CategoryId[index]
          db.collection(`data`).insert(ts)
        }).catch(console.log)
      })
      if(index < list_type.length){
      setTimeout(() => {
        if(page<pageIn[index]){
            run(db,list_id[index],list_type[index],page+1,index)
        }else{
          page=0;
          index+=1
                    run(db,list_id[index],list_type[index],page+1,index)

        }
        //run(db, page + 1, type)
      }, 6 * 1000)
      }
    }).catch(console.log)
  }
  
const list_type = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    1,
    2,
    3,
    4,
    5,
    6,
    7

]
const list_id = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1


];
const CategoryId = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    12,
    13,
    14,
    15,
    16,
    17,
    18


]
const pageIn = [
    279,
    736,
    138,

    404,
    6,
    186,
    3,
    3,
    273,
    130,
    161,
    65,
    158,
    25,
    48,

]
getID(0, 1, 1)
function getID(id, type, page) {
    return new Promise((resolve, reject) => {
        request({
            'method': 'POST',
            'url': 'https://landber.com/api/v2/find',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "loaiTin": id, "loaiNhaDat": [type], "pageNo": page, "viewport": { "northeast": { "lat": 21.385027, "lon": 106.0198859 }, "southwest": { "lat": 20.562323, "lon": 105.2854659 } }, "diaChinh": { "fullName": "HÃ  Ná»™i", "tinhKhongDau": "HN" }, "limit": 30 })
        }, (error, header, body) => {
            if (error) {
                reject(error)
            } else {
                var test = JSON.parse(body);
                const listID = test.list.map(ad => ad.adsID)
                resolve(listID)
            }
        })
    })
}
getDetail('Ads_00_611086')
function getDetail(id) {
    return new Promise((resolve, reject) => {
        request({
            'method': 'POST',
            'url': 'https://landber.com/api/detail',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "adsID": id })
        }, (error, header, body) => {
            if (error) {
                reject(error)
            } else {
                var test = JSON.parse(body);
                const ad = test.ads
                const title = ad.title
                const add = ad.place.diaChi
                const price = ad.giaFmt
                const area = ad.dienTich
                const desc = ad.chiTiet.replace('\n', '')
                const huongnha = ''
                const housing_type = ad.loaiNhaDatFmt
                const duong_vao = ''
                const so_tang = ad.soTang
                const bed = ad.soPhongNgu
                const phaply = ''
                const link = ad.adsID
                //const mat_tien=remove_text(cutStr(body,'<td><b>MÃ¡ÂºÂ·t tiÃ¡Â»Ân</b></td>','</td>')).replace(/<td>/,'').trim()
                const toilet = ad.soPhongTam
                const mat_tien = ''
                const lat = ad.place.geo.lat
                const lon = ad.place.geo.lon
                const site = 'landber.com'
                const list_img = ad.image.images
                const category = ''
                const huong_ban_cong = ''
                const house_project = ''
                const num_living = ''
                const noi_that = ''
                const chieu_dai = ''
                const chieu_ngang = ''
                const toa_nha = ''
                const obj = {
                    title: title,
                    category: parseInt(category),
                    site: site,
                    link: link,
                    address: add,
                    price: price,
                    area: parseFloat(area),
                    description: desc,
                    house_type: housing_type,
                    house_direc: huongnha,
                    house_balcony: huong_ban_cong,
                    house_project: house_project,
                    facade: parseFloat(mat_tien),
                    road_house: parseFloat(duong_vao),
                    lon: parseFloat(lon),
                    lat: parseFloat(lat),
                    num_floor: parseInt(so_tang),
                    num_bed: parseInt(bed),
                    num_bath: parseInt(toilet),
                    num_living: parseInt(num_living),
                    furniture: noi_that,
                    juridical: phaply,
                    width: parseFloat(chieu_ngang),
                    length: parseFloat(chieu_dai),
                    the_building: toa_nha,
                    list_img: list_img
                };
                resolve(obj)
            }
        })
    })
}

