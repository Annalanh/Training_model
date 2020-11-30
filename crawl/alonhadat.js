const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'nha-dat/can-ban/nha-mat-tien', 0)
}).catch(console.log)
const TYPES = ['nha-dat/can-ban/nha-mat-tien',
  'nha-dat/can-ban/nha-trong-hem', 'nha-dat/can-ban/biet-thu-nha-lien-ke',
  'nha-dat/can-ban/can-ho-chung-cu', 'nha-dat/can-ban/van-phong',
  'nha-dat/can-ban/dat-tho-cu-dat-o',
  'nha-dat/can-ban/dat-nen-lien-ke-dat-du-an',
  'nha-dat/can-ban/dat-nong-lam-nghiep',
  'nha-dat/can-ban/trang-trai',
  'nha-dat/can-ban/mat-bang',
  'nha-dat/can-ban/phong-tro-nha-tro',
  'nha-dat/can-ban/nha-hang-khach-san',
  'nha-dat/can-ban/shop-kiot-quan',
  'nha-dat/can-ban/kho-xuong',
  'nha-dat/can-ban/cac-loai-khac',
  'nha-dat/cho-thue/nha-mat-tien',
  'nha-dat/cho-thue/nha-trong-hem', 'nha-dat/cho-thue/biet-thu-nha-lien-ke',
  'nha-dat/cho-thue/can-ho-chung-cu', 'nha-dat/cho-thue/van-phong',
  'nha-dat/cho-thue/dat-tho-cu-dat-o',
  'nha-dat/cho-thue/dat-nen-lien-ke-dat-du-an',
  'nha-dat/cho-thue/dat-nong-lam-nghiep',
  'nha-dat/cho-thue/trang-trai',
  'nha-dat/cho-thue/mat-bang',
  'nha-dat/cho-thue/phong-tro-nha-tro',
  'nha-dat/cho-thue/nha-hang-khach-san',
  'nha-dat/cho-thue/shop-kiot-quan',
  'nha-dat/cho-thue/kho-xuong',
  'nha-dat/cho-thue/cac-loai-khac'
]
const PAGES = [3900, 4053, 501, 330, 14, 2297, 984, 129, 10, 13, 159, 106, 11, 28, 7, 721, 251, 81, 575, 322, 10, 3, 2, 1, 62, 177, 34, 23, 169, 1]
const CATEGORY = [4, 33, 3, 1, 24, 30, 5, 25, 7, 28, 11, 9, 10, 8, 22, 14, 34, 21, 12, 16, 31, 32, 26, 27, 29, 15, 19, 17, 18, 22]
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
    }, 3 * 1000)
  }).catch(console.log)
}
// getPage().then(r => {
//   console.log(r)
// })
function getPage(page = 1, type = 'nha-dat/can-ban/nha-mat-tien') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://alonhadat.com.vn/${type}/trang--${page}.html`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.content-item').each((index, item) => {
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
      url: `https://alonhadat.com.vn${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      // const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
      // const arr = latlon.split(',')
      // if (arr.length < 2) {
      //     arr.push('')
      // }
      const lat = $('#left > div.property > div.image-tab > span.view-map').attr('lat')
      const lon = $('#left > div.property > div.image-tab > span.view-map').attr('lng')
      const title = remove_text($('#left > div.property > div.title > h1').text())
      const add = remove_text($('#left > div.property > div.address > span.value').text())
      const price = remove_text($('#left > div.property > div.moreinfor > span.price > span.value').text())
      const area = remove_text($('#left > div.property > div.moreinfor > span.square > span.value').text())
      const housing_type = cutStr(body, '<td>Lo?i BDS</td>', '</td>').replace('<td>', '').trim()

      // b = cutStr(body, 'Hu?ng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      const huongnha = cutStr(body, '<td>Hu?ng</td>', '</td>').replace('<td>', '').trim()
      const duong_vao = cutStr(body, '<td>Ðu?ng tru?c nhà</td>', '</td>').replace('<td>', '').trim()
      // c = cutStr(body, 'S? t?ng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('#left > div.property > div.detail.text-content').text())
      const noi_that = ''
      const so_phong_khach = ''
      const so_phong_tam = ''
      const chieu_dai = cutStr(body, '<td>Chi?u dài</td>', '</td>').replace('<td>', '').trim()
      const chieu_rong = cutStr(body, '<td>Chi?u ngang</td>', '</td>').replace('<td>', '').trim()
      const juridical = cutStr(body, '<td>Pháp lý</td>', '</td>').replace('<td>', '').trim()
      const so_tang = cutStr(body, '<td>S? l?u</td>', '</td>').replace('<td>', '').trim()
      const bed = cutStr(body, '<td>S? phòng ng?</td>', '</td>').replace('<td>', '').trim()
      const img = [] 
      $('.image-list span img').each((index,item)=>{img.push('https://alonhadat.com.vn'+$(item).attr('src'))})
      const obj = {
        title: title,
        site: 'alonhadat',
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
        list_img : img
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