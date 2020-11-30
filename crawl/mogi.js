const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 53, list_type[1], 1)
}).catch(console.log)

function run(db, page, type, index) {
  console.log(`${page} - ${type}- ${index}`)
  getPage(page, type).then(data => {
    data.forEach(de => {
      getDetail(de).then(id => {
        id.category = CategoryId[index]
        db.collection(`data`).insert(id)
      }).catch(console.log)
    })
    if(index < list_type.length){
    setTimeout(() => {
      if (page <= pageIn[index]) {
        run(db, page + 1, list_type[index], index)
      } else {
        page = 0
        index += 1
        page = 0
        run(db, page + 1, list_type[index], index)
      }
    }, 7 * 1000)
   }
  }).catch(console.log)
}

const list_type = [
  "mua-nha-mat-tien-pho",
  "mua-nha-biet-thu-lien-ke",
  "mua-duong-noi-bo",
  "mua-nha-hem-ngo",
  "mua-can-ho-chung-cu",
  "mua-can-ho-tap-the-cu-xa",
  "mua-can-ho-penthouse",
  "mua-can-ho-dich-vu",
  "mua-can-ho-officetel",
  "mua-dat-tho-cu",
  "mua-dat-nen-du-an",
  "mua-dat-nong-nghiep",
  "mua-dat-kho-xuong",
  "mua-mat-bang-cua-hang-shop",
  "thue-nha-mat-tien-pho",
  "thue-nha-biet-thu-lien-ke",
  "thue-duong-noi-bo",
  "thue-nha-hem-ngo",
  "thue-can-ho-chung-cu",
  "thue-can-ho-tap-the-cu-xa",
  "thue-can-ho-penthouse",
  "thue-can-ho-dich-vu",
  "thue-can-ho-officetel",
  "thue-phong-tro-nha-tro",
  "thue-van-phong",
  "thue-mat-bang-cua-hang-shop",
  "thue-nha-xuong-kho-bai-dat"



];
const CategoryId = [
  4,
  3,
  6,
  33,
  1,
  1,
  1,
  1,
  24,
  30,
  5,
  25,
  8,
  28,
  14,
  21,
  14,
  34,
  12,
  12,
  12,
  12,
  16,
  15,
  16,
  29,
  18

]
const pageIn = [
  3469,
  110,
  91,
  1149,
  257,
  19,
  4,
  35,
  5,
  639,
  109,
  14,
  5,
  20,
  3246,
  547,
  131,
  926,
  1993,
  28,
  10,
  403,
  19,
  1911,
  273,
  756,
  193
]
function getPage(page = 1, type = 'mua-nha-dat') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://mogi.vn/${type}?cp=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const list = []
      $('#main > div.property-list > ul > li').each((index, item) => {
        const a = $(item).find('a')[0]
        list.push($(a).attr('href'))
      })

      resolve(list)
    }).catch(err => {
      reject(err)
    })
  })
}

const remove_text = (text) => {
  return text.replace(/\\n()/g, ' ').trim();
};
//getDetail('https://mogi.vn/quan-long-bien/mua-nha-mat-tien-pho/ban-nha-3-tang-mat-duong-ngo-gia-tu-dien-tich-81m2-mt-4m-id20658270')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      $('#main').each((index, item) => {
        const title = remove_text($(item).find('#main > div.prop-intro.clearfix > div.header > h1').text())
        const add = remove_text($(item).find('#main > div.prop-intro.clearfix > div.header > div.address.nowrap').text())
        const price = remove_text($(item).find('#prop-info > ul:nth-child(1) > li:nth-child(1)').text()).replace(/Giá:/, '').trim()
        const area = remove_text($(item).find('#prop-info > ul:nth-child(1) > li:nth-child(2)').text()).replace(/Di?n tích s? d?ng:/, '').trim()
        const lat = $(item).find('#map-cavas > iframe').attr('src')
        const lon = $(item).find('#map-cavas > iframe').attr('src')
        const site = 'mogi.vn'
        const huongnha = remove_text($(item).find('#prop-info > ul:nth-child(2) > li.lastest').text()).replace(/Hu?ng:/, '').trim()
        const a = (area) => {
          if (area == "") {
            const area1 = remove_text($(item).find('#prop-info > ul:nth-child(1) > li:nth-child(3)').text()).replace(/Di?n tích d?t:/, '').trim()
            return area1
          }
          else {
            return area
          }
        }
        const b = (lat) => {
          if (lat == null) {
            return ''
          } else {
            return lat.split(',')[0].split('&q=').pop()
          }
        }
        const c = (lon) => {
          if (lon == null) {
            return ''
          } else {
            return lon.split(',').pop()
          }
        }
        const toilet = remove_text($(item).find('#prop-info > ul:nth-child(2) > li:nth-child(2)').text()).replace(/Nhà t?m:/, '').trim()
        const bed = remove_text($(item).find('#prop-info > ul:nth-child(2) > li:nth-child(1)').text()).replace(/Phòng ng?:/, '').trim()

        const phaply = remove_text($(item).find('#prop-info > ul:nth-child(2) > li:nth-child(3)').text()).replace(/Pháp lý:/, '').trim()
        const desc = remove_text($(item).find('#property-info > div.prop-info-content').text())
        const housing_type = ''
        const huong_ban_cong = ''
        const house_project = ''
        const mat_tien = ''
        const duong_vao = ''
        const so_tang = ''

        const num_living = ''
        const noi_that = ''
        const category = ''
        const chieu_dai = ''
        const chieu_ngang = ''
        const toa_nha = ''

        const list_img = []
        const list_img1 = []
       
        $('.media-item img').each((index,item) => {
          if(($(item).attr('src'))){list_img.push($(item).attr('src'))}
          
        })
        $('.media-item img').each((index,item) => {if(($(item).attr('data-src'))){list_img.push($(item).attr('data-src'))}})
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
          lon: parseFloat(c(lon)),
          lat: parseFloat(b(lat)),
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
        
      })
    }).then(err => {
      reject(err)

    })
  })
}