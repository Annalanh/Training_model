const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'ban-can-ho-chung-cu', 0)
}).catch(console.log)
const TYPES = ['ban-can-ho-chung-cu',
  'ban-nha-rieng', 'ban-nha-biet-thu-lien-ke',
  'ban-nha-mat-pho', 'ban-dat-nen-du-an',
  'ban-dat',
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
const PAGES = [127, 313, 43, 106, 81, 133, 2, 2, 5, 63, 25, 26, 11, 29, 9, 8, 1]
const CATEGORY = [1, 2, 3, 4, 5, 5, 7, 8, 22, 12, 13, 14, 15, 16, 17, 18, 22]
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
function getPage(page = 1, type = 'ban-can-ho-chung-cu') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://dothi.net/${type}/p${page}.htm`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('#Form1 > div.wr_page > div.index-page > div > div.content-left > div.for-user.listProduct > ul > li').each((index, item) => {
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
      url: `https://dothi.net${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const lat = remove_text(cutStr(body, '<input type="hidden" name="ctl00$ContentPlaceHolder1$ProductDetail1$hddLatitude" id="hddLatitude" value="', '" />'))
      const lon = remove_text(cutStr(body, ' <input type="hidden" name="ctl00$ContentPlaceHolder1$ProductDetail1$hddLongtitude" id="hddLongtitude" value="', '" />'))
      const title = remove_text($('#Form1 > div.wr_page > div.index-page > div > div.content-left > div.product-detail > h1').text())
      const add = remove_text($('#hddDiadiem').val())
      const price = remove_text($('#ContentPlaceHolder1_ProductDetail1_divprice > span.spanprice').text())
      const area = remove_text($('#ContentPlaceHolder1_ProductDetail1_divprice > span:nth-child(2)').text())
      const housing_type = cutStr(body, '<td><b>Lo?i tin rao</b></td>', '</td>').replace('<td>', '').trim()
      const huongnha = cutStr(body, '<td><b>Hu?ng nhà</b></td>', '</td>').replace('<td>', '').trim()
      const duong_vao = cutStr(body, '<td><b>Ðu?ng vào</b></td>', '</td>').replace('<td>', '').trim()
      const huong_ban_cong = cutStr(body, '<td><b>Hu?ng ban công</b></td>', '</td>').replace('<td>', '').trim()
      const mat_tien = cutStr(body, '<td><b>M?t ti?n</b></td>', '</td>').replace('<td>', '').trim()
      const desc = remove_text($('#Form1 > div.wr_page > div.index-page > div > div.content-left > div.product-detail > div.pd-desc > div').text())
      const noi_that = cutStr(body, '<td><b>N?i th?t</b></td>', '</td>').replace('<td>', '').trim()
      const chieu_dai = ''
      const chieu_ngang = ''
      const juridical = cutStr(body, '<dt>Pháp lý:</dt>', '</dd>').replace('<dd>', '').trim()
      const so_tang = cutStr(body, '<td><b>S? t?ng</b></td>', '</td>').replace('<td>', '').trim()
      const bed = cutStr(body, '<td><b>S? phòng</b></td>', '</td>').replace('<td>', '').trim()
      const so_phong_tam = cutStr(body, '<td><b>S? toilet</b></td>', '</td>').replace('<td>', '').trim()
      const so_phong_khach = ''
      const img = [] 
      $('#myGallery img').each((index,item)=>{img.push($(item).attr('src'))})
      const obj = {
        title: title,
        site: 'dothi',
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