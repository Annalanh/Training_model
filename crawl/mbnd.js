
const request = require(`request`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db=>{
  run(db,1,list_type[5],5)
}).catch(console.log)

function run(db, page, type,index) {
  console.log(`running ${page} - ${type} - ${index}`)
  getPage(page, type).then(data => {
    data.forEach(de => {
      getAd(de).then(ts => {
        ts.category=CategoryId[index]
        db.collection(`data`).insert(ts)
      }).catch(console.log)
    })
    if(index<list_type.length){
	setTimeout(() => {
      if(page<pageIn[index]){
        run(db,page +1,list_type[index],index)
      }else{
        page=0;
        index = index+1;
        run(db,page +1,list_type[index],index)
      }
      //run(db, page + 1, type)
    }, 7 * 1000)
	}
  }).catch(console.log)
}

const list_type = [
  "offer_type=sell&category_id=1&category_title=C%C4%83n+h%E1%BB%99",
  "offer_type=sell&category_id=4&category_title=Nh%C3%A0+ph%E1%BB%91+",
  "offer_type=sell&category_id=5&category_title=Bi%E1%BB%87t+th%E1%BB%B1",
  "offer_type=sell&category_id=6&category_title=Nh%C3%A0+ri%C3%AAng",
  "offer_type=sell&category_id=9&category_title=%C4%90%E1%BA%A5t+th%E1%BB%95+c%C6%B0",
  "offer_type=sell&category_id=10&category_title=%C4%90%E1%BA%A5t+n%C3%B4ng+nghi%E1%BB%87p",
  "offer_type=sell&category_id=11&category_title=%C4%90%E1%BA%A5t+c%C3%B4ng+nghi%E1%BB%87p",
  "offer_type=sell&category_id=14&category_title=M%E1%BA%B7t+b%E1%BA%B1ng+v%C4%83n+ph%C3%B2ng",
  "offer_type=sell&category_id=15&category_title=M%E1%BA%B7t+b%E1%BA%B1ng+b%C3%A1n+l%E1%BA%BB+",
  "offer_type=sell&category_id=16&category_title=Kho+x%C6%B0%E1%BB%9Fng",
  "offer_type=rent&category_id=1&category_title=C%C4%83n+h%E1%BB%99",
  "offer_type=rent&category_id=4&category_title=Nh%C3%A0+ph%E1%BB%91+",
  "offer_type=rent&category_id=5&category_title=Bi%E1%BB%87t+th%E1%BB%B1",
  "offer_type=rent&category_id=6&category_title=Nh%C3%A0+ri%C3%AAng",
  "offer_type=rent&category_id=9&category_title=%C4%90%E1%BA%A5t+th%E1%BB%95+c%C6%B0",
  "offer_type=rent&category_id=10&category_title=%C4%90%E1%BA%A5t+n%C3%B4ng+nghi%E1%BB%87p",
  "offer_type=rent&category_id=11&category_title=%C4%90%E1%BA%A5t+c%C3%B4ng+nghi%E1%BB%87p",
  "offer_type=rent&category_id=14&category_title=M%E1%BA%B7t+b%E1%BA%B1ng+v%C4%83n+ph%C3%B2ng",
  "offer_type=rent&category_id=15&category_title=M%E1%BA%B7t+b%E1%BA%B1ng+b%C3%A1n+l%E1%BA%BB+",
  "offer_type=rent&category_id=16&category_title=Kho+x%C6%B0%E1%BB%9Fng"

];
const CategoryId = [
  1,
  4,
  37,
  2,
  30,
  25,
  25,
  28,
  28,
  8,
  12,
  14,
  21,
  13,
  31,
  26,
  26,
  29,
  29,
  18

]
const pageIn = [
  795,
  6074,
  253,
  2162,
  2175,
  77,
  10,
  17,
  11,
  19,
  469,
  703,
  121,
  120,
  10,
  3,
  2,
  92,
  30,
  104


]
//getPage(2, 'offer_type=sell&category_id=3&category_title=Nh%C3%A0')
function getPage(page = 1, type = 'offer_type=sell&category_id=3&category_title=Nh%C3%A0') {
  return new Promise((resolve, reject) => {
    request({
      url: `https://api.muabannhadat.vn/v1/listings?page=${page}&${type}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }, json: true
    }, (error, header, body) => {
      if (error) {
        reject(error)
      } else {
        if (body.data[0]) {
          const listID = body.data.map(ad => ad.id)
          resolve(listID)
          
        }
        else {
          reject()
        }
      }
    })
  })
}

const remove_text = (text) => {
  return text.replace(/\r\n/g, ' ').trim();
};
getAd(9462345)
function getAd(id) {
  return new Promise((resolve, reject) => {
    request({
      url: `https://api.muabannhadat.vn/v1/listings/${id}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }, json: true
    }, (error, header, body) => {
      if (error) {
        reject(error)
      } else {
        const a = body.data
        function getvaluefield(field) {
          let c = myJSON.map(el => el.data.data_properties.field === field)
          return c["value"]
        }
        let aaa = a.data_properties
        function test1(tes) {
          let cd = aaa.find(el => el.field === tes)
          if (cd == null) {
            return ""
          } else {
            return cd['value']
          }
        }
        function test2(tes) {
          let cd1 = aaa.find(el => el.field === tes)
          if (cd1 == null) {
            return ""
          } else {
            return cd1['display_value']
          }
        }
        function getfoor() {
          let flo = aaa.find(el => el.field === "level_count")
          let flo2 = aaa.find(el => el.field === "floor_number")
          if (flo == null && flo2 == null) {
            return ''
          }
          else if (flo == null && flo2 != null) {
            return flo2['value']
          }
          else if (flo != null && flo2 == null) {
            return flo['value']
          } else {
            return ''
          }
        }

        const list_img = []
        for (let i = 0; i < a.images.length; i++) {
          list_img.push(a.images[i].public_medium_url, a.images[i].public_thumbnail_url, a.images[i].public_full_url)
        }
        const title = a.title
        const add = a.address.street_number + ', ' + a.address.street_name + ', ' + a.address.location.title + ', ' + a.address.location.parent.title + ', ' + a.address.location.parent.parent.title
        const price = a.price
        const area = test1("area_value")
        const desc = a.description.replace('\\n', '')
        const huongnha = test2("direction")
        const so_tang = getfoor()
        const bed = test1("bedroom_count")
        const phaply = test2("legal_document")
        const toilet = test1("bathroom_count")
        const toa_nha = test1("block")
        const housing_type = ''
        const duong_vao = test2("alley")
        const lat = test1("latitude")
        const lon = test1("longitude")

        const link = a.path
        const mat_tien = ''
        const site = 'muabannhadat.vn'
        const category = ''
        const huong_ban_cong = ''
        const house_project = ''
        const num_living = ''
        const noi_that = ''

        const chieu_dai = test1("length")
        const chieu_ngang = test1("width")

        const obj = {
          title: title,
          category: parseInt(category),
          site: site,
          link: link,
          address: add.replace('null,', ''),
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

function cutStr(str, start, end) {
  const startPos = str.indexOf(start);
  if (startPos >= 0) {
    let temp = str.slice(startPos + start.length);
    return temp.slice(0, temp.indexOf(end));
  } else
    return '';
}