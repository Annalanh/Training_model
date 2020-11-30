const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, list_type[0], 0)
}).catch(console.log)

function run(db, page, type, index) {
  console.log(`running ${page} - ${type} - ${index}`)
  getPage(page, type).then(data => {
    data.forEach(de => {
      getDetail(de).then(ts => {
        ts.category = CategoryId[index]
        db.collection(`data`).insert(ts)
      }).catch(console.log)
    })
    if(index < 17){
      setTimeout(() => {
        if (page < pageIn[index]) {
          run(db, page + 1, list_type[index], index)
        } else {
          page = 0;
          index = index + 1;
          run(db, page + 1, list_type[index], index)
        }
        //run(db, page + 1, type)
      }, 6 * 1000)
    }
  }).catch(console.log)
}

getPage(1, 'mua-ban-chung-cu')

function getPage(page = 1, type = 'Mua-Ban-nha-dat-c15') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://ancu.me/${type}/t${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const list = []
      $('li.clr.not_impress').each((index, item) => {
        const a = $(item).find('a')[0]
        list.push($(a).attr('href'))
      })
      resolve(list)
    }).catch(err => {
      reject(err)
    })
  })
}
const list_type = [
  "mua-ban-chung-cu",
  "mua-ban-biet-thu-lien-ke",
  "mua-ban-nha-rieng",
  "mua-ban-nha-pho",
  "mua-ban-dat",
  "mua-ban-dat-nen",
  "mua-ban-kho-nha-xuong",
  "mua-ban-trang-trai",
  "mua-ban-nha-tro-phong-tro",
  "cho-thue-chung-cu",
  "cho-thue-nha-rieng",
  "cho-thue-nha-pho",
  "cho-thue-nha-tro-phong-tro",
  "cho-thue-cua-hang",
  "cho-thue-van-phong",
  "cho-thue-kho-nha-xuong",
  "cho-thue-dat",

];
const CategoryId = [
  1,
  3,
  2,
  4,
  6,
  5,
  8,
  7,
  11,
  12,
  13,
  14,
  15,
  17,
  16,
  18,
  32,

]
const pageIn = [
  8850,
  1430,
  9700,

  4550,
  7850,
  4770,
  47,
  22,
  35,
  3180,
  851,
  1111,
  249,
  215,
  721,
  171,
  9,
]
const remove_text = (text) => {
  return text.replace(/\\n/g, ' ').trim();
};
//getDetail('https://ancu.me/ban-gap-300m2-dat-10x30m-tho-cu-so-rieng-mat-tien-cho-khu-do-thi-my-phuoc-3-ad1511326.html')
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
      const title = remove_text($('body > div:nth-child(8) > div > div.main-col > article > h1').text())
      const add = remove_text($('body > div:nth-child(8) > div > div.main-col > article > ul.info-list > li:nth-child(2) > strong').text().trim()).replace(/Địa chỉ:/, '')
      const price = $('body > div:nth-child(8) > div > div.main-col > article > ul.info-list > li:nth-child(1) > span:nth-child(2)').text()
      const area = $('body > div:nth-child(8) > div > div.main-col > article > ul.info-list > li:nth-child(1) > span:nth-child(4)').text()
      const house_project = $('#info-table > tbody > tr:nth-child(10) > td:nth-child(2) > a').text()
      const housing_type = $('#info-table > tbody > tr:nth-child(2) > td:nth-child(2)').text()

      const lat = remove_text(cutStr(body, 'estate_lat =', ';'))
      const lon = remove_text(cutStr(body, 'estate_lon = ', ';'))


      const desc = remove_text($('div.content.paragraph').text().trim().replace(/\\n/, ''))


      const site = 'ancu.me'
      const huongnha = ''
      const phaply = ''
      const category = ''
      const huong_ban_cong = ''
      const toilet = ''
      const bed = ''
      const so_tang = ''
      const duong_vao = ''
      const mat_tien = ''

      const num_living = ''
      const noi_that = ''

      const chieu_dai = ''
      const chieu_ngang = ''
      const toa_nha = ''
      const list_img = []

      $('.slider-for a').each((index, item) => {
        list_img.push($(item).attr('href'))
      })
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
        lon: parseFloat((lon)),
        lat: parseFloat((lat)),
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

    }).then(err => {
      reject(err)

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