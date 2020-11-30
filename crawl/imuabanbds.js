const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'ban-dat', 0)
}).catch(console.log)
const TYPES = ['ban-dat',
    'ban-nha-rieng', 'ban-dat-nen-du-an',
    'ban-can-ho-chung-cu-cao-cap', 'ban-nha-biet-thu-lien-ke',
    'ban-trang-trai-khu-nghi-duong',
    'ban-kho-nha-xuong',
    'ban-loai-bat-dong-san-khac',
    'cho-thue-can-ho-chung-cu',
    'cho-thue-nha-rieng',
    'cho-thue-nha-mat-pho',
    'cho-thue-nha-tro-phong-tro',
    'cho-thue-van-phong',
    'cho-thue-cua-hang-ki-ot',
    'cho-thue-kho-nha-xuong-dat',
    'cho-thue-loai-bat-dong-san-khac'
]
const PAGES = [97, 137, 42, 61, 18, 2, 1, 358, 10, 4, 7, 4, 4, 2, 358, 1]
const CATEGORY = [30, 2, 5, 1, 3, 7, 8, 22, 12, 13, 14, 15, 16, 17, 18, 22]
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
          }, 50 * 1000)
      }
  }).catch(console.log)
}
// getPage().then(r => {
//   console.log(r)
// })

function getPage(page = 1, type = 'ban-dat') {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://imuabanbds.vn/${type}/${page}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'PHPSESSID=n64f1osku9ipqeeavpvce4qhq6'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.bdsItem').each((index, item) => {
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
            url: `https://imuabanbds.vn${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'PHPSESSID=n64f1osku9ipqeeavpvce4qhq6'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const x = $('.bdsProDetail>div>form:nth-child(1) > input[type=submit]:nth-child(7)').val()
            const y = $('.bdsProDetail>div>form:nth-child(2) > input[type=submit]:nth-child(5)').val()
            const z = $('.bdsProDetail>div>form:nth-child(3) > input[type=submit]:nth-child(4)').val()


            const add = x + ',' + y + ',' + z
            d = cutStr(body, 'google.maps.LatLng(', ')')

            const lat = d.split(',')[0]
            const lon = d.split(',')[1]
            const title = remove_text($('.HomeTitle > h1').text())
            const price = cutStr(body, '<li><label>- Giá</label>: <span>', '</span></li>').replace('<td>', '').trim()
            const area = cutStr(body, ' <li><label>- Di?n tích</label>:', 'm<sup>2</sup').replace('<td>', '').trim()
            const housing_type = ''
            const huongnha = cutStr(body, ' <li><label>- Hu?ng</label>:', '</li>').trim()
            const duong_vao = cutStr(body, '<li><label>- Ðu?ng</label>:', 'm</li>').replace('<td>', '').trim()
            // c = cutStr(body, 'S? t?ng', '<div class="clearfix" style="padding-left: 10px;">').trim()
            const huong_ban_cong = ''
            const mat_tien = ''
            const desc = remove_text($('#mm-0 > div:nth-child(5) > div.ColCenter > div.ContentPagePadd > div.DetailC.DetailProperty').text())
            const noi_that = ''
            const so_phong_khach = ''
            const so_phong_tam = ''
            const chieu_dai = ''
            const chieu_rong = ''
            const juridical = ''
            const so_tang = ''
            const bed = ''
            const img = []
            $('.amazingslider-slides img').each((index, item) => { img.push('https://imuabanbds.vn' + $(item).attr('src')) })
            const obj = {
                title: title,
                site: 'imuabanbds',
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
                width: parseFloat(chieu_rong),
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