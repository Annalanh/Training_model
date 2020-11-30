const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'nha-mat-duong-c7', 0)
}).catch(console.log)
const TYPES = ['nha-mat-duong-c7',
  'nha-trong-ngo-c8', 'nha-trong-khu-du-an-phan-lo---tai-dinh-cu-c9',
  'nha-vuon---biet-thu-c24', 'can-ho-chung-cu---nha-tap-the--c25',
  'nha-xuong---kho-bai-c27',
  'kiot---cua-hang-c28',
  'dat-tho-cu-c29',
  'nha-mat-duong-c35',
  'nha-trong-cac-khu-du-an-cao-cap-c36',
  'nha-trong-ngo-c37',
]
const PAGES = [12, 62, 2, 1, 1, 1, 1, 9, 6, 1, 2]
const CATEGORY = [4, 33, 22, 3, 1, 8, 10, 30, 14, 22, 34]
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
function getPage(page = 1, type = 'nha-mat-duong-c7') {
  return new Promise((resolve, reject) => {
    rp({
      url: `http://nhadatlamphi.vn/${type}.htm?page=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '__tawkuuid=e::nhadatlamphi.vn::utz9ekpRhNbcLuUEl0SpoGbHjCmi6ighn+ZFtew5sIx13yMbYoW3bszM3jw7676D::2; PHPSESSID=et3j9ik135rg35uqmhlu53j0c3; TawkConnectionTime=0'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.hot').each((index, item) => {
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
      url: `http://nhadatlamphi.vn${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '__tawkuuid=e::nhadatlamphi.vn::utz9ekpRhNbcLuUEl0SpoGbHjCmi6ighn+ZFtew5sIx13yMbYoW3bszM3jw7676D::2; PHPSESSID=et3j9ik135rg35uqmhlu53j0c3; TawkConnectionTime=0'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      d = cutStr(body, 'google.maps.LatLng(', ');').trim()
      const lat = d.split(',')[0]
      const lon = d.split(',')[1]
      const title = cutStr(body, '<title>', '</title>')
      const add = cutStr(body, '<div class="col-xs-12 ibrief"><strong>- Địa chỉ:</strong>', '</div>')
      const price = cutStr(body, '<p>Giá bán: <strong>', '</strong></p>').replace('VND','').trim()
      const area = cutStr(body, '<strong>Diện tích SD:</strong>', 'm2</div>').trim()
      const housing_type = remove_text($('body > div.wrapper.animate > div.container-vina > div > div.col-xs-9.left_land.land_page > div > div > div.land_box > div.brief_land_box.row > div.col-xs-8 > div:nth-child(4) > div:nth-child(2) > a').text())

      const huongnha = cutStr(body, '<strong>Hướng:</strong>', '</div>').trim()
      const duong_vao = ''
      // c = cutStr(body, 'Số tầng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = ''
      const desc = remove_text($('.body > div.wrapper.animate > div.container-vina > div > div.col-xs-9.left_land.land_page > div > div > div.land_box > div:nth-child(5) > div:nth-child(3) > div > div').text())
      const noi_that = ''
      const so_phong_khach = ''
      const so_phong_tam = ''
      const chieu_dai = cutStr(body, '<strong>Chiều dài:</strong>', 'm</div>').trim()
      const chieu_rong = cutStr(body, '<strong>Chiều rộng:</strong>', 'm</div>').trim()
      const juridical = cutStr(body, '<strong>Giấy tờ:</strong> ', '</div>').trim()
      const so_tang = ''
      const bed = ''
      const img = [] 
      $('.imgs_land_box ul img').each((index,item)=>{img.push('http://nhadatlamphi.vn/'+$(item).attr('src'))})
      const obj = {
        title: title,
        site: 'nhadatlamphi',
        link: link,
        address: add,
        price: price,
        area: parseFloat(area),
        description: desc,
        house_type: housing_type,
        house_direc: huongnha,
        house_balcony: huong_ban_cong,
        house_project: '',
        num_floor: testnull(so_tang),
        facade: testnull(mat_tien),
        road_house: testnull(duong_vao),
        lon: parseFloat(lon),
        lat: parseFloat(lat),
        num_bed: testnull(bed),
        num_bath: testnull(so_phong_tam),
        num_living: parseInt(so_phong_khach),
        furniture: noi_that,
        quy_mo: '',
        juridical: juridical,
        width: testnull(chieu_rong),
        length: testnull(chieu_dai),
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
function testnull(e){
  if(e==0 || e=='0'){
      return ''
  }
  else{
      return e
  }
}