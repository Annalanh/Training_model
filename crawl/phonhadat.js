const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 3281, list_type[3], 3)
}).catch(console.log)

function run(db, page, type, index) {
  console.log(`running ${page} - ${type} - ${index}`)
  getPage(page, type).then(data => {
    data.forEach(de => {
      getDetails(de).then(ts => {
        ts.category = CategoryId[index]
        db.collection(`data`).insert(ts)
      }).catch(console.log)
    })
    if (index < 15) {
      setTimeout(() => {
        if (page < pageIn[index]) {
          run(db, page + 1, list_type[index], index)
        } else {
          page = 0;
          index = index + 1;
          run(db, page + 1, list_type[index], index)
        }
        //run(db, page + 1, type)
      }, 10 * 1000)
    }
  }).catch(console.log)
}

const list_type = [
  "ban-can-ho-chung-cu",
  "ban-nha-rieng",
  "ban-nha-biet-thu-lien-ke",
  "ban-nha-mat-pho",
  "ban-dat-nen-du-an",
  "ban-dat",
  "ban-trang-trai-khu-nghi-duong",
  "ban-kho-nha-xuong",
  "ban-loai-bat-dong-san-khac",
  "cho-thue-can-ho-chung-cu",
  "cho-thue-nha-rieng",

  "cho-thue-nha-tro-phong-tro",
  "cho-thue-van-phong",
  "cho-thue-cua-hang-ki-ot",
  "cho-thue-kho-nha-xuong-dat",


];
const CategoryId = [
  1,
  2,
  3,
  4,
  5,
  5,
  7,
  8,
  22,
  12,
  13,
  15,
  16,
  17,
  18


]
const pageIn = [
  936,
  7557,
  478,

  9588,
  519,
  1406,
  12,
  14,
  33,
  669,
  245,
  37,
  250,
  40,
  42

]
function getPage(page = 1, type = "ban-can-ho-chung-cu") {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://phonhadat.net/${type}/p${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.2.644956238.1580894309; _gid=GA1.2.53586117.1580894309; _fbp=fb.1.1580894309433.311100208; ASP.NET_SessionId=riitcd1skginegzqwi1ztbmy; __atuvc=39%7C6; __atuvs=5e3bb9107991b52b00d'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const list = []
      $('#Form1 > div.bg_wr > div.wrapper > div > div.cl_right > div > div.productlist > div.listbox > div.item').each((index, item) => {
        const a = $(item).find('a')[0]
        list.push($(a).attr('href'))
      })
      resolve(list)
    }).catch(err => {
      reject(err)
    })
  })
}
const remove_text = (text) => {
  return text.replace(/\\r\n()/g, ' ').trim();
};
//getDetails('/ban-nha-biet-thu-lien-ke-duong-yen-the-phuong-2-22/chinh-chu-ban-nha-biet-sieu-thu-219m2-tai-809-yen-the-p-2-tan-binh-gia-31-ty-pr12180196.htm')
function getDetails(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://phonhadat.net${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '_ga=GA1.2.644956238.1580894309; _gid=GA1.2.53586117.1580894309; _fbp=fb.1.1580894309433.311100208; ASP.NET_SessionId=riitcd1skginegzqwi1ztbmy; __atuvc=39%7C6; __atuvs=5e3bb9107991b52b00d'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const title = remove_text($('div.detail_top > h1').text())
      const add = $('#hddDiadiem').val()
      const price = remove_text($('div.box_area > div').text().split('Diện tích:').pop())
      const area = remove_text($('div.detail_top > div.box_area > div').text().split('Diện tích')[0].split(':').pop())
      const huongnha = remove_text(cutStr(body, '<td>Hướng nhà</td>', '</td>').replace(/<td>/, '')).replace(/KXĐ/, '')
      //const phaply=($(item).find('div.wrapper > div.product > div.float-in > div.product-item > div.container > div.md-8 > div > div.overview > div > div:nth-child(1) > div:nth-child(2)').text())
      const desc = remove_text($('div.detail_top > div.info > div').text())
      const duong_vao = remove_text(cutStr(body, '<td>Đường vào</td>', '</td>').replace(/<td>/, '').trim())
      const so_tang = remove_text(cutStr(body, '<td>Số tầng</td>', '</td>').replace(/<td>/, '').trim())
      const bed = remove_text(cutStr(body, '<td>Số phòng</td>', '</td>').replace(/<td>/, '').trim())
      const toilet = remove_text(cutStr(body, '<td>Số toilet</td>', '</td>').replace(/<td>/, '').trim())
      const lat = $('#hddLatitude').val()
      const lon = $('#hddLongtitude').val()
      const mat_tien = cutStr(body, '<td>Mặt tiền</td>', '</td>').replace(/<td>/, '').trim()
      const house_project = ''
      const housing_type = ''
      const site = 'phonhadat.net'
      const phaply = ''
      const category = ''
      const huong_ban_cong = ''
      const num_living = ''
      const noi_that = ''
      const chieu_dai = ''
      const chieu_ngang = ''
      const toa_nha = ''
      const list_img = []

      $('#myGallery li').each((index, item) => {
        list_img.push($(item).find('img').attr('src'))
      })
      const obj = {
        title: title,
        category: parseInt(category),
        site: site,
        link: link,
        address: add,
        price: price,
        area: parseFloat(area),
        description: desc,
        house_type: housing_type,
        house_direc: huongnha,
        house_balcony: huong_ban_cong,
        house_project: house_project,
        facade: parseFloat(mat_tien),
        road_house: parseFloat(duong_vao),
        lon: parseFloat((lon)),
        lat: parseFloat((lat)),
        num_floor: parseInt(so_tang),
        num_bed: parseInt(bed),
        num_bath: parseInt(toilet),
        num_living: parseInt(num_living),
        furniture: noi_that,
        juridical: phaply,
        width: parseFloat(chieu_ngang),
        length: parseFloat(chieu_dai),
        the_building: toa_nha,
        list_img: list_img
      };

      resolve(obj)

    }).catch(err => {
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