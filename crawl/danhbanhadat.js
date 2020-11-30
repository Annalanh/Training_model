const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'ban-nha-mat-tien.chtml', 0)
}).catch(console.log)
const TYPES = ['ban-nha-mat-tien.chtml',
  'ban-nha-hem.chtml', 'ban-can-ho-chung-cu.chtml',
  'ban-dat.chtml', 'ban-dat-nen-du-an.chtml',
  'ban-biet-thu-lien-ke-phan-lo.chtml',
  'ban-kho-nha-xuong.chtml',
  'ban-nha-dat-khac.chtml',
  'cho-thue-can-ho-chung-cu.chtml',
  'cho-thue-nha-hem.chtml',
  'cho-thue-nha-mat-tien.chtml',
  'cho-thue-phong-tro.chtml',
  'cho-thue-van-phong.chtml',
  'cho-thue-cua-hang-ki-ot.chtml',
  'cho-thue-kho-nha-xuong-dat.chtml',
  'cho-thue-bat-dong-san-khac.chtml',
]
const PAGES = [29, 32, 19, 59, 21, 4, 1, 2, 10, 2, 18, 1, 2, 1, 5, 1]
const CATEGORY = [4, 2, 1, 6, 5, 3, 8, 22, 12, 13, 14, 15, 16, 17, 18, 22]
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
          }, 25 * 1000)
      }
  }).catch(console.log)
}
// getPage().then(r => {
//   console.log(r)
// })
function getPage(page = 1, type = 'ban-nha-mat-tien') {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://danhbanhadat.vn/${type}.chtml?page=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
        cookie: 'RnetProductCookiePrevious=6481377; ASP.NET_SessionId=nqcrbky4lwcosjboo4rzv1b3'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.p-title').each((index, item) => {
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
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://danhbanhadat.vn${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'ASP.NET_SessionId=nqcrbky4lwcosjboo4rzv1b3; RnetProductCookiePrevious=6478292'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const title = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > h1').text())
      const add = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pro-dt > table > tbody > tr > td:nth-child(1) > ul > li:nth-child(1) > div.it_r').text())
      const price = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pinfo > span:nth-child(1)').text().replace('/tổng','').trim())
      const area =  remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pinfo > span:nth-child(3)').text())
      const housing_type = ''
      const huongnha = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pro-dt > table > tbody > tr > td:nth-child(1) > ul > li:nth-child(4) > div.it_r').text())
      const duong_vao = ''
      const huong_ban_cong = ''
      const mat_tien = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pro-dt > table > tbody > tr > td:nth-child(1) > ul > li:nth-child(2) > div.it_r').text())
      const desc = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pct').text())
      const noi_that = ''
      const chieu_dai = ''
      const chieu_ngang = ''
      const juridical = ''
      const so_tang = remove_text($('body > div.main > div.main-content > div.body-left > div > div.pro-detail > div.pro-dt > table > tbody > tr > td:nth-child(1) > ul > li:nth-child(3) > div.it_r').text())
      const bed = ''
      const img = [] 
      $('#galleria a').each((index,item)=>{img.push($(item).attr('href'))})
   
      const obj = {
        title: title,
        site: 'danhbanhadat',
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