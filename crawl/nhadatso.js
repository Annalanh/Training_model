const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, list_type[0], 0)
}).catch(console.log)

function run(db, page, type, index) {
  console.log(`${page} - ${type} - ${index}`)
  getPage(page, type).then(data => {
    data.forEach(de => {
      getDetail(de).then(id => {
        id.category = CategoryId[index]
        db.collection(`data`).insert(id)
      }).catch(console.log)
    })
    if (index < 25) {
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

  "ban-can-ho-chung-cu",
  "ban-nha-mat-pho",
  "nha-dat-ban-dat",
  "nha-dat-ban-nha-rieng",
  "nha-dat-ban-dat-nen-du-an",
  "nha-dat-ban-trang-trai",
  "nha-dat-ban-biet-thu",
  "nha-dat-ban-kho-nha-xuong",
  "nha-dat-ban-nha-tro",
  "nha-dat-ban-nha-nguyen-can",
  "nha-dat-ban-van-phong",
  "nha-dat-ban-cua-hang",
  "nha-dat-ban-mat-tien",
  "nha-dat-cho-thue-can-ho-chung-cu",
  "nha-dat-cho-thue-biet-thu",
  "nha-dat-cho-thue-nha-mat-pho",
  "nha-dat-cho-thue-nha-rieng",
  "nha-dat-cho-thue-dat",
  "nha-dat-cho-thue-dat-nen-du-an",
  "nha-dat-cho-thue-kho-nha-xuong",
  "nha-dat-cho-thue-nha-tro",
  "nha-dat-cho-thue-nha-nguyen-can",
  "nha-dat-cho-thue-van-phong",
  "nha-dat-cho-thue-cua-hang",
  "nha-dat-cho-thue-mat-tien",




];
const CategoryId = [
  1,
  4,
  5,
  2,
  5,
  7,
  3,
  8,
  11,
  2,
  24,
  10,
  6,
  12,
  21,
  14,
  13,
  31,
  32,
  18,
  15,
  13,
  16,
  17,
  14

]
const pageIn = [
  498,
  498,
  484,

  498,
  446,
  2,
  109,
  7,
  17,
  9,
  3,
  5,
  18,
  116,
  10,
  96,
  44,
  5,
  1,
  8,
  10,
  3,
  51,
  9,
  4,

]

function getPage(page = 1, type = 'nha-dat-ban') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://nhadatso.com/${type}/?p=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const list = []
      $('#crb-choose-show > div.crb_card_item').each((index, item) => {
        const a = $(item).find('a')[1]
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
getDetail('0912868797/ban-nha-gieng-mut-bach-mai-dien-tich-53m2-gia-33-ty-x32kcp')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://nhadatso.com/${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }
    }).then(body => {
      const $ = cheerio.load(body)

      const title = remove_text($('#sticky_block >div .post-content-detail > div.list-detail > h1').text())
      const add = remove_text($('#sticky_block div.post-content-detail > div.post-content-tit > p:nth-child(3)').text())
      const price = remove_text($('#sticky_block .post-content-detail > div.post-content-tit > p:nth-child(2) > b').text()).trim()
      let getinfo = []
      $('#collapseOne > div > div > div.card-block.pl-2.pr-2.post-content-detail > div > div.card-text.text-list.pt-1 > span').each((index, item) => {
        getinfo.push($(item).text())
      })
      const s = (a) => {
        let ad
        getinfo.map(e => {
          if (e.indexOf(a) >= 0) {
            ad = e.toString().match(/\d/g)
          }
        })
        return ad
      }


      const area = cutStr(body, '</span>Diện tích:', '<sup>')
      const lat = ''
      const lon = ''
      const site = 'nhadatso.com'
      const huongnha = ''

      const toilet = s("Toilet")
      const bed = s("Phòng")

      const phaply = ''
      const desc = remove_text($('.text-list p').text())
      const housing_type = ''
      const huong_ban_cong = ''
      const house_project = ''
      const mat_tien = ''
      const duong_vao = ''
      const so_tang = s("Tầng")

      const num_living = ''
      const noi_that = ''
      const category = ''
      const chieu_dai = ''
      const chieu_ngang = ''
      const toa_nha = ''

      const list_img = []


      $('#images > div.main-carousel img').each((index, item) => {
          list_img.push($(item).attr('data-flickity-lazyload'))

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