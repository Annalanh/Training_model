const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'ban-can-ho-chung-cu', 0)
}).catch(console.log)
const TYPES = ['ban-can-ho-chung-cu',
  'ban-nha-rieng-nha-hem', 'ban-nha-biet-thu-lien-ke',
  'ban-nha-mat-pho-mat-tien', 'ban-nha-nghi-khach-san-nha-hang',
  'ban-dat-nen-du-an',
  'ban-dat-tho-cu',
  'ban-trang-trai-khu-nghi-duong',
  'ban-kho-nha-xuong',
  'ban-loai-bat-dong-san-khac',
  'cho-thue-can-ho-chung-cu',
  'cho-thue-nha-rieng-nha-hem',
  'cho-thue-nha-mat-pho-mat-tien',
  'cho-thue-van-phong',
  'cho-thue-biet-thu',
  'cho-thue-nha-tro-phong-tro',
  'cho-thue-mat-bang-cua-hang-ki-ot',
  'cho-thue-kho-nha-xuong-dat'
]
const PAGES = [7, 20, 3, 7, 1, 6, 10 , 2, 1, 1, 1, 1, 2, 2, 1, , 1, 1, 2]
const CATEGORY = [1, 2, 3, 4, 9, 5, 30, 7, 8, 22, 12, 13, 14, 16, 21, 15, 17, 18]
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
          }, 3 * 1000)
      }
  }).catch(console.log)
}
// getPage().then(r => {
//   console.log(r)
// })
function getPage(page = 1, type = 'ban-can-ho-chung-cu') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://thongkenhadat.com/${type}/page-${page}.html`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'wf_toomaketer_sub32786=1; PHPSESSID=om6iurl5k79bojlmlnktm5hle6'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.wrapper-news> ul>li').each((index, item) => {
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
        cookie: 'wf_toomaketer_sub32786=1; PHPSESSID=om6iurl5k79bojlmlnktm5hle6'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      // const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
      // const arr = latlon.split(',')
      // if (arr.length < 2) {
      //     arr.push('')
      // }
      const img = []
      $('.slick-item img').each((index, item)=>{
        img.push($(item).attr("src"))
      })
      const lat = ''
      const lon = ''
      const title = cutStr(body, ' <h1 class="span-title" >', '</h1>').trim()
      const add = remove_text($('p.span-info').text().replace('Vị trí:',''))
      const price = remove_text(cutStr(body, '<p class="div-price-in"><span>Giá:', '</span>'))
      const area = remove_text(cutStr(body, '<span class="span-3">Diện tích: ', 'm<sup>2</sup></span>').trim())
      const housing_type = ''

      const huongnha = cutStr(body, '<span class="span-1">Hướng BĐS</span><span class="span-2">', '</span>')
      const duong_vao = cutStr(body, '<span class="span-1">Đường trước nhà</span><span class="span-2">', '</span>').trim()
      const huong_ban_cong = cutStr(body, '<span class="span-1">Hướng ban công</span><span class="span-2">', '</span>')
      const mat_tien = cutStr(body, '<span class="span-1">Mặt tiền</span><span class="span-2">', '</span>').trim()
      const desc = cutStr(body, '<div class="div-mota" style="margin-top: 5px;">', ' </div>').replace('<br/>','')
      const noi_that = cutStr(body, '<span class="span-1">Nội thất</span><span class="span-2">', '</span>').trim()
      const chieu_dai = ''
      const chieu_ngang = ''
      const juridical = ''
      const so_tang = cutStr(body, '<span class="span-1">Số tầng</span><span class="span-2">', '</span>').trim()
      const bed = cutStr(body, '<span class="span-1">Số phòng</span><span class="span-2">', '</span>').trim()
      const so_phong_tam = cutStr(body, '<span class="span-1">Số toilet</span><span class="span-2">', '</span>').trim()
      const so_phong_khach = ''
      
      const obj = {
        title: title,
        site: 'thongkenhadat',
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