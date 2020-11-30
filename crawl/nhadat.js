const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 2029, 'ban-dat-du-an', 9)
}).catch(console.log)
const TYPES = ['ban-nha-pho',
  'ban-nha-nguyen-can',
  'ban-biet-thu',
  'ban-can-ho-cao-cap',
  'ban-chung-cu',
  'ban-van-phong',
  'ban-cua-hang',
  'ban-sap-quay',
  'ban-dat-tho-cu',
  'ban-dat-du-an',
  'ban-dat-nong-nghiep',
  'ban-dat-trang-trai',
  'ban-nha-kho',
  'ban-nha-xuong',
  'ban-nha-tro',
  'ban-khach-san',
  'cho-thue-nha-pho',
  'cho-thue-nha-nguyen-can',
  'cho-thue-biet-thu',
  'cho-thue-can-ho-cao-cap',
  'cho-thue-chung-cu',
  'cho-thue-van-phong',
  'cho-thue-cua-hang',
  'cho-thue-sap-quay',
  'cho-thue-dat-tho-cu',
  'cho-thue-dat-du-an',
  'cho-thue-dat-nong-nghiep',
  'cho-thue-dat-trang-trai',
  'cho-thue-nha-kho',
  'cho-thue-nha-xuong',
  'cho-thue-nha-tro',
  'cho-thue-khach-san'
]
const PAGES = [4927, 7123, 1455, 3148, 1311, 107, 873, 207, 5228, 4100, 87, 171, 36, 512, 570, 390, 7001, 6085, 1133, 9778, 5272, 3879, 2260, 96, 266, 12, 3, 4, 270, 1241, 2169, 75]
const CATEGORY = [4, 2, 3, 2, 1, 24, 10, 10, 30, 5, 25, 7, 8, 8, 11, 9, 14, 13, 21, 13, 12, 16, 17, 17, 31, 32, 26, 27, 18, 18, 15, 19]
function run(db, page, type, index) {
  console.log(`running ${page}-${type}`)
  getPage(page, type).then(links => {
    links.forEach(link => {
      getDetail(link).then(result => {
        result.category = CATEGORY[index]
        db.collection(`data`).insert(result)
      }).catch(getDetail(link))
    })
    setTimeout(() => {
      if (page < PAGES[index]) {
        run(db, page + 1, TYPES[index], index)
      }
      else {
        page = 0;
        index = index + 1
        run(db, page + 1, TYPES[index], index)
      }
    }, 5 * 1000)
  }).catch(console.log)
}
// getPage().then(r => {
//   console.log(r)
// })
function getPage(page = 1, type = 'ban-nha-pho') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://www.nhadat.net/${type}?page=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
        cookie: 'PHPSESSID=aj8hjniu97vg3s9fhl4v0uv6c7'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.media').each((index, item) => {
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
//  getDetail('/mat-pho-ho-dac-di-dong-da-138m2-x-4t-mt-6-6m-1274636.html')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://www.nhadat.net${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'PHPSESSID=aj8hjniu97vg3s9fhl4v0uv6c7'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      // const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
      // const arr = latlon.split(',')
      // if (arr.length < 2) {
      //     arr.push('')
      // }
      const lat = $('#default_lat').val()
      const lon = $('#default_lng').val()
      const title = remove_text($('body > div.detail_housing.sell-housing > div > div.housing-wrapper > div > div.col-xs-9.housing-left > div.title-lg > div.pull-left > h1').text())
      const add = remove_text($('body > div.detail_housing.sell-housing > div > div.housing-wrapper > div > div.col-xs-9.housing-left > div.title-lg > div.pull-left > div > a').text())
      const price = remove_text($('body > div.detail_housing.sell-housing > div > div.housing-wrapper > div > div.col-xs-9.housing-left > div.title-lg > div.area_price.pull-right.text-right > p:nth-child(1) > span.price_top').text())
      const area = remove_text($('body > div.detail_housing.sell-housing > div > div.housing-wrapper > div > div.col-xs-9.housing-left > div.title-lg > div.area_price.pull-right.text-right > p:nth-child(1) > span.area_top').text())
      const arr = [] 
      $('.clearfix').each((index, item) => {
        arr[index] = $(item).text()
      })
      so_tang = ''
      bed = ''
      so_phong_tam = ''
      juridical = ''
      huongnha =''
      duong_vao =''

      arr.forEach(ele => {
        if (ele.indexOf('tầng') > -1) {
          so_tang = ele.replace('tầng', '').trim()
          so_tang = so_tang.replace('Số', '').trim()
        }
        if (ele.indexOf('phòng') > -1) {
          bed = ele.replace('phòng', '').trim()
          bed = bed.replace('ngủ', '').trim()
          bed = bed.replace('Số', '').trim()  
        }
        if (ele.indexOf('vệ') > -1) { 
          so_phong_tam = ele.replace('vệ', '').trim()
          so_phong_tam = so_phong_tam.replace('Nhà', '').trim()
          so_phong_tam = so_phong_tam.replace('sinh', '').trim()
        }
        if (ele.indexOf('lý') > -1) {
          juridical = ele.replace('lý', '').trim()
          juridical = juridical.replace('Pháp', '').trim()
        }
        if (ele.indexOf('Hướng') > -1) {
          huongnha = ele.replace('Hướng', '') 
        }
        if (ele.indexOf('trước') > -1) {
          duong_vao = ele.replace('trước', '').trim()
          duong_vao = duong_vao.replace('Đường', '').trim()
          duong_vao = duong_vao.replace('nhà', '').trim()
        }
      });
      const housing_type = ''

      // b = cutStr(body, 'Hướng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      
      
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('body > div.detail_housing.sell-housing > div > div.housing-wrapper > div > div.col-xs-9.housing-left > div.housing_detail > div.swptext > div > p').text())
      const noi_that = ''
      const chieu_dai = ''
      const chieu_ngang = ''
      const img = []
      $('.slides img').each((index, item) => { img.push($(item).attr('src')) })
      //const so_phong_tam = cutStr(body, '<li>Số phòng vệ sinh:','</li>').trim()
      //const so_phong_khach = cutStr(body, '<li>Số phòng khách:','</li>').trim()
      const obj = {
        title: title,
        site: 'nhadat',
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
        lon: lon,
        lat: lat,
        num_bed: parseInt(bed),
        num_bath: so_phong_tam,
        num_living: '',
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