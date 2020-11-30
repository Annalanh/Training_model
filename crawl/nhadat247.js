const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'rao-vat/can-ban/nha-pho', 0)
}).catch(console.log)
const TYPES = ['rao-vat/can-ban/nha-pho',
  'rao-vat/can-ban/nha-rieng', 'rao-vat/can-ban/biet-thu-lien-ke',
  'rao-vat/can-ban/chung-cu', 'rao-vat/can-ban/nha-hang-khach-san',
  'rao-vat/can-ban/van-phong',
  'rao-vat/can-ban/phong-tro',
  'rao-vat/can-ban/trang-trai-khu-nghi-duong',
  'rao-vat/can-ban/mat-bang-cua-hang',
  'rao-vat/can-ban/dat-nen-phan-lo',
  'rao-vat/can-ban/dat-nong-lam-nghiep',
  'rao-vat/can-ban/cac-loai-khac',
  'rao-vat/cho-thue/nha-pho',
  'rao-vat/cho-thue/nha-rieng',
  'rao-vat/cho-thue/biet-thu-lien-ke',
  'rao-vat/cho-thue/chung-cu',
  'rao-vat/cho-thue/nha-hang-khach-san',
  'rao-vat/cho-thue/van-phong',
  'rao-vat/cho-thue/phong-tro',
  'rao-vat/cho-thue/trang-trai-khu-nghi-duong',
  'rao-vat/cho-thue/mat-bang-cua-hang',
  'rao-vat/cho-thue/dat-nen-phan-lo',
  'rao-vat/cho-thue/dat-nong-lam-nghiep',
  'rao-vat/cho-thue/cac-loai-khac'
]
const PAGES = [1825, 5078, 365, 794, 25, 8, 16, 14, 55, 530, 169, 42, 176, 143, 19, 263, 8, 122, 45, 1, 128, 2, 1, 11]
const CATEGORY = [4, 2, 3, 1, 9, 24, 11, 7, 28, 5, 25, 22, 14, 13, 21, 12, 19, 16, 15, 27, 29, 32, 26, 22]
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
function getPage(page = 1, type = 'can-ban-nha-pho') {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://nhadatviet247.net/${type}/trang--${page}.html`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.item').each((index, item) => {
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
//  getDetail('/mat-pho-ho-dac-di-dong-da-138m2-x-4t-mt-6-6m-1274636.html')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://nhadatviet247.net${link}`,
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
      //const lat = remove_text(cutStr(body,'"latitude":"','",'))
      //const lon = remove_text(cutStr(body,'"longitude":"','"},'))
      const title = remove_text($('#right > div.property > div.title > h1').text())
      const add = remove_text($('#right > div.property > div.add > span.value').text())
      const price = remove_text($('#right > div.property > div.moreinfor > span.price > span.value').text())
      const area =  remove_text($('#right > div.property > div.moreinfor > span.square > span.value').text())
      const housing_type = cutStr(body, '<td>Loại BDS</td>','</td>').replace('<td>','').trim()

      // b = cutStr(body, 'Hướng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      const huongnha = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(1) > td:nth-child(4)').text())
      const duong_vao = cutStr(body,'<td>Lộ giới</td>','</td>').replace('<td>','').trim()
      // c = cutStr(body, 'Số tầng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('#right > div.property > div.detail.text-content').text())
      const noi_that = ''
      const chieu_dai = cutStr(body,'<td>Chiều dài</td>','m</td>').replace('<td>','').trim()
      const chieu_ngang = cutStr(body,'<td>Chiều ngang</td>','m</td>').replace('<td>','').trim()
      const juridical = cutStr(body,'<td>Pháp lý</td>','</td>').replace('<td>','').trim()
      const so_tang = cutStr(body,'<td>Số lầu</td>','</td>').replace('<td>','').trim()
      const bed = cutStr(body,'<td>Số phòng ngủ</td>','</td>').replace('<td>','').trim()
      const img = [] 
      $('.image-list img').each((index,item)=>{img.push('http://nhadatviet247.net'+$(item).attr('src'))})
      //const so_phong_tam = cutStr(body, '<li>Số phòng vệ sinh:','</li>').trim()
      //const so_phong_khach = cutStr(body, '<li>Số phòng khách:','</li>').trim()
      const obj = {
        title: title,
        site: 'nhadatviet247',
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
        lon: '',
        lat: '',
        num_bed: parseInt(bed),
        num_bath: '',
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