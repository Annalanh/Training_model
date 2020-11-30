const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 367, 'nha-dat-ban/dat-du-an-quy-hoach', 6)
}).catch(console.log)
const TYPES = ['nha-dat-ban/ban-nha-pho',
  'nha-dat-ban/ban-nha-rieng', 'nha-dat-ban/ban-nha-biet-thu-lien-ke',
  'nha-dat-ban/ban-can-ho-chung-cu', 'nha-dat-ban/ban-nha-hang-khach-san',
  'nha-dat-ban/ban-kho-nha-xuong',
  'nha-dat-ban/dat-du-an-quy-hoach',
  'nha-dat-ban/dat-nong-lam-nghiep',
  'nha-dat-ban/dat-nen-dat-o-dat-tho-cu',
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
const PAGES = [500, 500, 500, 500, 58, 40, 500, 210, 500, 500, 222, 38, 430, 355, 108, 19, 68, 51]
const CATEGORY = [4, 2, 3, 1, 9, 8, 5, 25, 30, 14, 13, 21, 12, 16, 29, 19, 18, 15]
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
function getPage(page = 1, type = 'nha-dat-ban/ban-nha-pho') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://nhadat.cafeland.vn/${type}/page-${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('#properties-search > div.wrap-property> div.property').each((index, item) => {
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
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      // const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
      // const arr = latlon.split(',')
      // if (arr.length < 2) {
      //     arr.push('')
      // }
      const img = []
      $('#property-gallery a').each((index, item)=>{
        img.push($(item).attr("href"))
      })
      const lat = remove_text(cutStr(body, '"latitude":"', '",'))
      const lon = remove_text(cutStr(body, '"longitude":"', '"},'))
      const title = remove_text($('#property-detail > header > h1').text())
      const add = remove_text(cutStr(body, '<dt>V? trí:</dt>', '</dd>')).replace('<dd>', '').trim()
      const price = remove_text($('#property-detail > header > figure > span:nth-child(2) > b').text())
      const area = remove_text($('#property-detail > header > figure > span:nth-child(3) > b').text())
      const housing_type = cutStr(body, '<li>Lo?i d?a ?c:', '</li>').trim()

      // b = cutStr(body, 'Hu?ng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      const huongnha = cutStr(body, '<li>Hu?ng xây d?ng:', '</li>').trim()
      const duong_vao = cutStr(body, '<li>Ðu?ng tru?c nhà:', '</li>').trim()
      // c = cutStr(body, 'S? t?ng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('#description > p').text())
      const noi_that = ''
      const chieu_dai = cutStr(body, '<li>Chi?u dài:', '</li>').trim()
      const chieu_ngang = cutStr(body, '<li>Chi?u ngang:', '</li>').trim()
      const juridical = cutStr(body, '<dt>Pháp lý:</dt>', '</dd>').replace('<dd>', '').trim()
      const so_tang = cutStr(body, '<li>S? l?u:', '</li>').trim()
      const bed = cutStr(body, '<li>S? phòng ng?:', '</li>').trim()
      const so_phong_tam = cutStr(body, '<li>S? phòng v? sinh:', '</li>').trim()
      const so_phong_khach = cutStr(body, '<li>S? phòng khách:', '</li>').trim()
      
      const obj = {
        title: title,
        site: 'nhadat.cafeland',
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