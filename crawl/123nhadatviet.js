const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'can-ban-nha-pho', 0)
}).catch(console.log)
const TYPES = ['can-ban-nha-pho',
  'can-ban-nha-rieng', 'can-ban-biet-thu-lien-ke',
  'can-ban-chung-cu', 'can-ban-nha-hang-khach-san',
  'can-ban-van-phong',
  'can-ban-phong-tro',
  'can-ban-trang-trai-khu-nghi-duong',
  'can-ban-mat-bang-cua-hang',
  'can-ban-dat-nen-phan-lo',
  'can-ban-dat-nong-lam-nghiep',
  'can-ban-cac-loai-khac',
  'cho-thue-nha-pho',
  'cho-thue-nha-rieng',
  'cho-thue-biet-thu-lien-ke',
  'cho-thue-chung-cu',
  'cho-thue-nha-hang-khach-san',
  'cho-thue-van-phong',
  'cho-thue-phong-tro',
  'cho-thue-trang-trai-khu-nghi-duong',
  'cho-thue-mat-bang-cua-hang',
  'cho-thue-dat-nen-phan-lo',
  'cho-thue-dat-nong-lam-nghiep',
  'cho-thue-cac-loai-khac'
]
const PAGES = [1044, 2832, 147, 212, 18, 6, 17, 6, 17, 849, 48, 84, 48, 44, 6, 59, 2, 43, 15, 1, 20, 2, 1, 3]
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
      url: `http://123nhadatviet.net/${type}/p${page}.htm`,
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
// getDetail('/nha-mtkd-nguyen-cuu-dam-p-tsn-q-tan-phu-dt-4x20m-gia-12-3-ty-thuong-luong-1396749.html')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://123nhadatviet.net${link}`,
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
      const title = remove_text($('#left > div.property > div.title > h1').text())
      const add = remove_text($('#left > div.property > div.contact > div.address > span.value').text())
      const price = remove_text($('#left > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(7) > td.price').text())
      const area = cutStr(body, '<td>Di?n tích</td>','</td>').replace('<td>','').trim()
      const housing_type = cutStr(body, '<td>Lo?i BDS</td>','</td>').replace('<td>','').trim()

      // b = cutStr(body, 'Hu?ng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      const huongnha = cutStr(body, '<td>Hu?ng</td>','</td>').replace('<td>','').trim()
      const duong_vao = cutStr(body, '<td>L? gi?i</td>','</td>').replace('<td>','').trim()
      // c = cutStr(body, 'S? t?ng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('#left > div.property > div.detail.text-content').text())
      const noi_that = ''
      const chieu_dai = cutStr(body, '<td>Chi?u dài</td>','</td>').replace('<td>','').trim()
      const chieu_ngang = cutStr(body, '<td>Chi?u ngang</td>','</td>').replace('<td>','').trim()
      const juridical = cutStr(body, '<td>Pháp lý</td>','</td>').replace('<td>','').trim()
      const so_tang = cutStr(body, '<td>S? l?u</td>','</td>').replace('<td>','').trim()
      const bed = cutStr(body, '<td>S? phòng ng?</td>','</td>').replace('<td>','').trim()
      //const so_phong_tam = cutStr(body, '<li>S? phòng v? sinh:','</li>').trim()
      //const so_phong_khach = cutStr(body, '<li>S? phòng khách:','</li>').trim()
      const img = [] 
      $('.image-list ul li img').each((index,item)=>{img.push('http://123nhadatviet.net'+$(item).attr('src'))})
      const obj = {
        title: title,
        site: '123nhadatviet',
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