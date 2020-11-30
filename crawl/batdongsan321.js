const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 403, '?demand=5&s=&category=123&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0', 1)
}).catch(console.log)
const TYPES = ['?demand=5&s=&category=122&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=123&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=135&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=131&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=130&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=129&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=128&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=127&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=126&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=5&s=&category=136&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=123&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=135&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=134&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=133&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=132&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=131&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=129&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=127&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0',
  '?demand=6&s=&category=136&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0'
]
const PAGES = [128, 541, 1, 128, 1253, 476, 1254 , 1317, 528, 43, 117, 93, 82, 76, 23, 18, 1, 102, 11]
const CATEGORY = [3, 1, 4, 8, 7, 5, 6, 2, 4, 22, 12, 14, 17, 16, 15, 18, 32, 13, 22]
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
          }, 100 * 1000)
      }
  }).catch(console.log)
}
// getPage().then(r => {
//   console.log(r)
// })
function getPage(page = 1, type = '?demand=5&s=&category=122&province=0&district=0&select-area-min=&select-area-max=&min_price=0&max_price=0') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://batdongsan321.com/page/${page}/${type}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'PHPSESSID=ju6ug47841r88j08nbn7ls4uo3; js_session1=302fd8c6ae8900c6-2e5e4e433dbea55c8da0ee63-54bcfc57b1e773138a841a417bd919df0cfbe757c9960d66bef15562'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.float-re').each((index, item) => {
        const a = $(item).find('a')[0]
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
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'PHPSESSID=ju6ug47841r88j08nbn7ls4uo3; js_session1=302fd8c6ae8900c6-2e5e4e433dbea55c8da0ee63-54bcfc57b1e773138a841a417bd919df0cfbe757c9960d66bef15562'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      // const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
      // const arr = latlon.split(',')
      // if (arr.length < 2) {
      //     arr.push('')
      // }
      const img = []
      $('.item a img').each((index, item)=>{
        img.push($(item).attr("src"))
      })
      const lat = remove_text(cutStr(body, '"latitude":"', '",'))
      const lon = remove_text(cutStr(body, '"longitude":"', '"},'))
      const title = remove_text($('#main > div > div > section.re > h1').text())
      const add = remove_text(cutStr(body, '<i class="ion-ios-location"></i>', '</div>')).trim()
      const price = cutStr(body, '<div class="re-price">Giá: <strong>', '</div>').replace('</strong>','').trim()
      const area = remove_text(cutStr(body, '<li><i class="ion-home"></i>Diện tích: ', '<sup>2</sup></li>').trim())
      const housing_type = ''

      // b = cutStr(body, 'Hướng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      const huongnha = cutStr(body, '<li><i class="ion-android-compass"></i>Hướng:', '</li>').trim()
      const duong_vao = cutStr(body, '<li><i class="ion-arrow-swap"></i>Lộ giới:', '</li>').trim()
      // c = cutStr(body, 'Số tầng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = cutStr(body, '<li><i class="ion-arrow-resize"></i>Mặt tiền:', '</li>').trim()
      const desc = remove_text($('#main > div > div > section.re > div.re-block > div.re-content').text())
      const noi_that = ''
      const chieu_dai = cutStr(body, '<li>Chiều dài:', '</li>').trim()
      const chieu_ngang = cutStr(body, '<li>Chiều ngang:', '</li>').trim()
      const juridical = cutStr(body, '<dt>Pháp lý:</dt>', '</dd>').replace('<dd>', '').trim()
      const so_tang = cutStr(body, '<li><i class="ion-social-buffer"></i>Số tầng:', '</li>').trim()
      const bed = cutStr(body, '<li><i class="ion-chatbubble-working"></i>Số phòng ngủ:', '</li>').trim()
      const so_phong_tam = cutStr(body, '<li><i class="ion-ios-body"></i>Số toilet:', '</li>').trim()
      const so_phong_khach = ''
      
      const obj = {
        title: title,
        site: 'batdongsan321',
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