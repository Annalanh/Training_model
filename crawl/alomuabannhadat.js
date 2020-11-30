const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'nha-ban/ban-nha-pho', 0)
}).catch(console.log)
const TYPES = ['nha-ban/ban-nha-pho',
  'nha-ban/ban-nha-rieng', 'nha-ban/ban-nha-biet-thu-lien-ke',
  'nha-ban/ban-can-ho-chung-cu', 'nha-ban/ban-van-phong',
  'nha-ban/ban-nha-hang-khach-san',
  'nha-ban/ban-kho-nha-xuong',
  'nha-ban/ban-phong-tro',
  'dat-ban/dat-du-an-quy-hoach',
  'dat-ban/dat-nong-lam-nghiep',
  'dat-ban/dat-nen-dat-o-dat-tho-cu',
  'cho-thue/nha-pho',
  'cho-thue/nha-rieng',
  'cho-thue/biet-thu',
  'cho-thue/can-ho-chung-cu',
  'cho-thue/van-phong',
  'cho-thue/mat-bang',
  'cho-thue/nha-hang-khach-san',
  'cho-thue/nha-kho-xuong',
  'cho-thue/phong-tro'
]
const PAGES = [500, 500, 500, 500, 26, 67, 29, 159, 500, 156, 500, 500, 210, 103, 464, 260, 121, 14, 87, 233]
const CATEGORY = [4, 2, 3, 1, 24, 9, 8, 11, 5, 25, 30, 14, 13, 21, 12, 16, 29, 19, 18, 15]
function run(db, page, type, index) {
  console.log(`running ${page}-${type}`)
  getPage(page, type).then(links => {
      links.forEach((link, index1) => {
          setTimeout(() => {
              getDetail(link).then(result => {
                  result.category = CATEGORY[index]
                  db.collection(`data`).insert(result)
              }).catch(getDetail(link))
          }, index1 * 2000)
      })
      if (index < PAGES.length) {
          setTimeout(() => {
              if (page < PAGES[index]) {
                  run(db, page + 1, TYPES[index], index)
              }
              else {
                  page = 0;
                  index = index + 1
                  run(db, page + 1, TYPES[index], index)
              }
          }, 10 * 1000)
      }
  }).catch(console.log)
}
function getPage(page = 1, type = 'nha-ban/ban-nha-pho') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://alomuabannhadat.vn/${type}/page-${page}/`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
        cookie: '_ga=GA1.2.1448120794.1579058828; _gid=GA1.2.67718886.1583308917; _gat_gtag_UA_126740076_1=1; XSRF-TOKEN=eyJpdiI6IlBZbU9zbUpBNE1zbVZhZVFDcXdkZUE9PSIsInZhbHVlIjoiN0lJVlNZXC90cG9Gc0hVNGZMblEzcFg2SXRNampQcUw0K1VMNGVneVdqcUFEVUttcE9MTTRBZXJ0V2lTc01GbkhcLzZPVzFcL1QwU3RuWDdGekd5Zlh2emc9PSIsIm1hYyI6IjY4MzRkYzdlODFlYjkxNzQyOTBkYWI0ZDdmZDQxZjhlYTJhMjQ1NTAwNGFmOTY4MGRkMDliYzBkZmM5NjM4NzYifQ%3D%3D; laravel_session=eyJpdiI6IndvRnduYU9BVVh2RmlrSmZrd05WelE9PSIsInZhbHVlIjoiWGNJWDRLUFlRNnZPS2ljOTBqXC9SZHNwQ1VibGhaNEVYUlh1SFJnTGZSZ0FRajk1QytWMnlpMFloZlY5UkxMdWRGUDdNU0V0MEZEblV0RXFGOTIzMDBBPT0iLCJtYWMiOiJlYTMxNDBiMzgwZGYzMGRkNGNkYjRkNjFlZDAzYWU2OWNiMjUzOTQzNWZmOGU1Y2I2Y2NhZGU4NzBiNGE3NDhkIn0%3D; giatriSearch=eyJpdiI6Ik5WMzNNcThiTzhJdEpBQXJ5UjhQbXc9PSIsInZhbHVlIjoicjEycmFKTnFFTWpGdGtnSXVydmhQdz09IiwibWFjIjoiZDdlMzdkYzUyMjE2M2MzOTQzMTdjM2E1OGY4ZDJlMmQ5Y2Q5NDc0YTFhOWFiMWM5MGZlYTFmZDRlZTA0ZTc0ZiJ9'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.info').each((index, item) => {
        const a = $(item).find('a')
        links.push($(a).attr('href'))
      })
      resolve(links)
    }).catch(error => {
      reject(error)
    })
  })
}

const remove_text = (text) => {
  return text.replace(/\\n()/g, ' ').trim();
};

function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
        cookie: '_ga=GA1.2.1448120794.1579058828; _gid=GA1.2.67718886.1583308917; XSRF-TOKEN=eyJpdiI6InNVV0ZMeU50bmMzTHVmYnRTcU82YUE9PSIsInZhbHVlIjoiZlF3R2RBRUlKenBvSkZBbXlTRnRZZ0RjTEkycTRtWmNlZXgxcXBPcjc3N0x2eU1lWjVscXhacDJWdmNnMkJvaFlHaTVcL0VDSDZBN2tcL2llV0ZIQ2FGZz09IiwibWFjIjoiMGRjMmQ2Njk3MTAxZGNjODg4NjQwODUxMGY1NmMzNGJiYzFkNTY2YjU0N2RlMWY2MGIwZDg0NWU5OGRkNWRkMCJ9; laravel_session=eyJpdiI6IjYrN3ZyanJwSHo1NVNhYXVxVHJnSXc9PSIsInZhbHVlIjoiS0Z0WHBnXC9DRGFqanZrRTVHRHQ5bE0yUjhVcG40QUZRaFd1dENJbE5mSDRXVWtmOFVIM3dXd003ZmN6THhzbzRySEF6Nkt3MGo0NkZDbXVRZmFHaWlnPT0iLCJtYWMiOiJjZmQ0M2RiMDllMGRhMWZmODg1YmE0MzkyYWViZDRjNDU3ZjhhOGZmNGNhYjYxOTYwYzhjODFhOTY4M2M0MDhlIn0%3D; giatriSearch=eyJpdiI6IlwvQVVEXC9Wb215azRyNmx1SHRhVnkydz09IiwidmFsdWUiOiJZSEZkY0VCZVZ5U0QzNjBEanBOa3VnPT0iLCJtYWMiOiI2MTFiMjU3NWNhM2Q3NzljMGU5M2EzZDcwMWIyZTMwYWY5YTY1NGEwMDEzM2U2NDczNmMwYTcyZWJiNDY5NjI3In0%3D'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const img = []
      $('.property-slide a').each((index, item)=>{
        img.push($(item).attr("href"))
      })
      const lat = remove_text(cutStr(body, '"latitude":"', '",'))
      const lon = remove_text(cutStr(body, '"longitude":"', '"},'))
      const title = remove_text($('#property-detail > header > h1').text())
      const add = remove_text($('#quick-summary > dl > dd:nth-child(6)').text())
      const price = remove_text($('#property-detail > header > figure > span:nth-child(2) > b').text())
      const area = remove_text($('#property-detail > header > figure > span:nth-child(3) > b').text())
      const housing_type = ''
      const huongnha = ''
      const duong_vao = cutStr(body, '<li>Đường trước nhà:', '</li>').trim()
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('#description > p').text())
      const noi_that = ''
      const chieu_dai = cutStr(body, '<li>Chiều dài:', '</li>').trim()
      const chieu_ngang = cutStr(body, '<li>Chiều ngang:', '</li>').trim()
      const juridical = cutStr(body, '<dt>Pháp lý:</dt>', '</dd>').replace('<dd>', '').trim()
      const so_tang = cutStr(body, '<li>Số lầu:', '</li>').trim()
      const bed = cutStr(body, '<li>Số phòng ngủ:', '</li>').trim()
      const so_phong_tam = cutStr(body, '<li>Số phòng vệ sinh:', '</li>').trim()
      const so_phong_khach = cutStr(body, '<li>Số phòng khách:', '</li>').trim()
      
      const obj = {
        title: title,
        site: 'alomuabannhadat',
        link: link,
        address: add,
        price: price,
        area: parseFloat(area),
        description: desc,
        house_type: housing_type,
        house_direc: huongnha,
        house_balcony: huong_ban_cong,
        house_project: '',
        num_floor: parseInt(so_tang),
        facade: parseFloat(mat_tien),
        road_house: parseFloat(duong_vao),
        lon: parseFloat(lon),
        lat: parseFloat(lat),
        num_bed: parseInt(bed),
        num_bath: parseInt(so_phong_tam),
        num_living: parseInt(so_phong_khach),
        furniture: noi_that,
        quy_mo: '',
        juridical: juridical,
        width: parseFloat(chieu_ngang),
        length: parseFloat(chieu_dai),
        the_building: '',
        list_img: img
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