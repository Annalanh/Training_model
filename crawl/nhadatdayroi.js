const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
  run(db, 1, 'nha-dat-ban/dat-mat-tien-duong', 0)
}).catch(console.log)
const TYPES = ['nha-dat-ban/dat-mat-tien-duong',
  'nha-dat-ban/dat-nong-nghiep-cay-hang-nam-lau-nam', 'nha-dat-ban/nha-trong-hem',
  'nha-dat-ban/can-ho-cao-cap', 'nha-dat-ban/nha-hang-khach-san',
  'nha-dat-ban/nha-tro-phong-tro',
  'nha-dat-ban/ban-bds-khac',
  'nha-dat-ban/dat-tho-cu-dat-o',
  'nha-dat-ban/can-ho-chung-cu',
  'nha-dat-ban/nha-tam',
  'nha-dat-ban/ban-villa-biet-thu',
  'nha-dat-ban/xuong-nha-kho',
  'nha-dat-ban/dat-ray-dat-vuon',
  'nha-dat-ban/dat-du-an-phan-lo',
  'nha-dat-ban/nha-pho-mat-tien',
  'nha-dat-ban/nha-du-an',
  'nha-dat-ban/toa-nha-cao-oc', 'nha-dat-ban/cua-hang-ki-ot',
  'nha-dat-ban/can-sang-nhuong',
  'nha-dat-cho-thue/cho-thue-nha-du-an',
  'nha-dat-cho-thue/cho-thue-can-ho-chung-cu',
  'nha-dat-cho-thue/cho-thue-nha-xuong-kho',
  'nha-dat-cho-thue/cho-thue-nha-tro-phong-tro',
  'nha-dat-cho-thue/cho-thue-dat-tho-cu-mat-tien-hem',
  'nha-dat-cho-thue/can-sang-nhuong',
  'nha-dat-cho-thue/cho-thue-nha-pho-mat-tien',
  'nha-dat-cho-thue/cho-thue-nha-tam',
  'nha-dat-cho-thue/cho-thue-villa-biet-thu',
  'nha-dat-cho-thue/cho-thue-cua-hang-ki-ot',
  'nha-dat-cho-thue/cho-thue-dat-vuon-nong-nghiep',
  'nha-dat-cho-thue/cho-thue-bat-dong-san-khac',
  'nha-dat-cho-thue/cho-thue-nha-trong-hem',
  'nha-dat-cho-thue/cho-thue-van-phong',
  'nha-dat-cho-thue/cho-thue-nha-hang-khach-san',
  'nha-dat-cho-thue/cho-thue-toa-nha-cao-oc',
  'nha-dat-cho-thue/cho-thue-dat-ray-trang-trai'
]
const PAGES = [42, 9, 84, 9, 1, 2, 2, 84, 37, 1, 13, 1, 1, 34, 84, 2, 0, 1, 0, 1, 55, 13, 10, 3, 0, 50, 0, 4, 6, 1, 3, 26, 16, 4, 1, 1]
const CATEGORY = [6, 25, 33, 2, 9, 11, 22, 30, 12, 22, 3, 8, 22, 22, 4, 22, 1, 10, 22, 22, 12, 18, 15, 31, 22, 14, 22, 21, 17, 26, 22, 34, 16, 19, 22, 27]
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
function getPage(page = 1, type = 'nha-dat-ban/dat-mat-tien-duong') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://nhadatdayroi.com/tin-dang/${type}/0/0/0/0/0/p=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'ACCOUNT_CHOOSER=AFx_qI4XjVd8O9vS7NI8apz0ioLkHSYdz_Fmm62TQpR5DbUsKAdayPkD97F2ap2Ng1C2n3sYl2PL5mhK7BypRL7KDHkjs1-pfuFWUnG-hwl4f-NA9mACLJleckWRKiZtAcVcuohHaLu1fSNZNMD2r4R4fjmI-T3rSKR71kbxMugxugaLrqbyCiHQk78b7JdZB5J0Mmn1k6Kveya7EKONzjJH_DMKXmTNaqJ9L9nJqCvfdgTDGROWu6XXFbd7RfwKfoODxY59GV9HENDwIIDlNyj2yPRwyJNjPwWgFZlZ0MtsGQUwWaolLkY; OGPC=19015603-1:; OGP=-19015603:; LSOLH=|_SVI_Ch9ZN2xUX19kdnJQTVRZRGdUZ0hZY0IwdldUQVVYQmhjEOG0rPbJ3-cCGA4iP01BRURIZl9xa3VaTkZJUWR2QmRYcDNCSHJLX1BWUjdHM2ZqOTkxNDZIbG1Jejdta0xWVXl0ekhxNkp1MHVQQQ_:|26369726:cdcf; SID=uQf9yfOx3o7W58EeTd9oXnyFIZ02A072P_g1e55dlQueWRlBRYwB_FMrrNj43wRDkXdAZg.; __Secure-3PSID=uQf9yfOx3o7W58EeTd9oXnyFIZ02A072P_g1e55dlQueWRlBoSOpyzA_1EVmKOXrEBI4Ag.; LSID=lso|o.mail.google.com|o.smartlock.google.com|s.VN|s.blogger|s.youtube|ss|wise|youtube:uQf9yYBBFPfuS0xlaskBp0CNo84eIhaUbgoUW-Dm4xymuzO8pDC7V6ix7vCFQZAVXG-mpw.; __Host-3PLSID=lso|o.mail.google.com|o.smartlock.google.com|s.VN|s.blogger|s.youtube|ss|wise|youtube:uQf9yYBBFPfuS0xlaskBp0CNo84eIhaUbgoUW-Dm4xymuzO8-gJCagavFQ_2gh99hV1F-g.; HSID=AO_4LRIAKm6x6vGou; SSID=AI5LVaXGEUNPdW9z3; APISID=of3llerLBrjCM3LJ/AVaQyeSGgCDqMLHC6; SAPISID=VWB9ZAESqPw8swRH/ANFkhwdv0znLTQJlx; __Secure-HSID=AO_4LRIAKm6x6vGou; __Secure-SSID=AI5LVaXGEUNPdW9z3; __Secure-APISID=of3llerLBrjCM3LJ/AVaQyeSGgCDqMLHC6; __Secure-3PAPISID=VWB9ZAESqPw8swRH/ANFkhwdv0znLTQJlx; GAPS=1:MCKDmOulJGF_656vHoesXqERaWBRHMc91-qCO9MmvvWt_FvpFlu7OhBVXn7v788Imc0wlKwAAgf_jZ_ci5liq5i9cNWI-A:XAgahkl9a0j_144i; NID=200=VVFPm2bxQxF1Eie2FIxJrys5cO7PHyqabWmjSzqTWsmjBPaRQ-_0Vc8Pps_tnGXYnaBIXSOG6NFyjxVOrreW8IhlAy17omCVdd_cgJxu7PNqlMMATc6E3YpSmCNLZMa6ls42Ud_CHOEyRi1rTN6Ege5mC6avq0fWe6bHFEdL5ZH00SQXqBw8-5-1WNCidAvb3vySNDso3LCpwxeuUlqzYWFXH_Ddnb83fER-PI51z9K6S1nq1d0P2fV6ZcoY7qgLPWu1trGXBW9C_j5vIOw; 1P_JAR=2020-3-12-10; SIDCC=AJi4QfGCz_bzFabri1NNLoxuIX500bMSskRtfYzKOTU-QQAcn4KoJ2zVDkQ5NAYfZ3S10VXo2Ec'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const links = []
      $('.lst-item').each((index, item) => {
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
//getDetail('https://nhadatdayroi.com/tin-dang/ban-gap-nha-mtkd-nguyen-ba-tong-tan-binh-4x10m-4-tang-chi-57-ty-0932678040-nam-tb-124846.html')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://nhadatdayroi.com/${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: 'ACCOUNT_CHOOSER=AFx_qI4XjVd8O9vS7NI8apz0ioLkHSYdz_Fmm62TQpR5DbUsKAdayPkD97F2ap2Ng1C2n3sYl2PL5mhK7BypRL7KDHkjs1-pfuFWUnG-hwl4f-NA9mACLJleckWRKiZtAcVcuohHaLu1fSNZNMD2r4R4fjmI-T3rSKR71kbxMugxugaLrqbyCiHQk78b7JdZB5J0Mmn1k6Kveya7EKONzjJH_DMKXmTNaqJ9L9nJqCvfdgTDGROWu6XXFbd7RfwKfoODxY59GV9HENDwIIDlNyj2yPRwyJNjPwWgFZlZ0MtsGQUwWaolLkY; OGPC=19015603-1:; OGP=-19015603:; LSOLH=|_SVI_Ch9ZN2xUX19kdnJQTVRZRGdUZ0hZY0IwdldUQVVYQmhjEOG0rPbJ3-cCGA4iP01BRURIZl9xa3VaTkZJUWR2QmRYcDNCSHJLX1BWUjdHM2ZqOTkxNDZIbG1Jejdta0xWVXl0ekhxNkp1MHVQQQ_:|26369726:cdcf; SID=uQf9yfOx3o7W58EeTd9oXnyFIZ02A072P_g1e55dlQueWRlBRYwB_FMrrNj43wRDkXdAZg.; __Secure-3PSID=uQf9yfOx3o7W58EeTd9oXnyFIZ02A072P_g1e55dlQueWRlBoSOpyzA_1EVmKOXrEBI4Ag.; LSID=lso|o.mail.google.com|o.smartlock.google.com|s.VN|s.blogger|s.youtube|ss|wise|youtube:uQf9yYBBFPfuS0xlaskBp0CNo84eIhaUbgoUW-Dm4xymuzO8pDC7V6ix7vCFQZAVXG-mpw.; __Host-3PLSID=lso|o.mail.google.com|o.smartlock.google.com|s.VN|s.blogger|s.youtube|ss|wise|youtube:uQf9yYBBFPfuS0xlaskBp0CNo84eIhaUbgoUW-Dm4xymuzO8-gJCagavFQ_2gh99hV1F-g.; HSID=AO_4LRIAKm6x6vGou; SSID=AI5LVaXGEUNPdW9z3; APISID=of3llerLBrjCM3LJ/AVaQyeSGgCDqMLHC6; SAPISID=VWB9ZAESqPw8swRH/ANFkhwdv0znLTQJlx; __Secure-HSID=AO_4LRIAKm6x6vGou; __Secure-SSID=AI5LVaXGEUNPdW9z3; __Secure-APISID=of3llerLBrjCM3LJ/AVaQyeSGgCDqMLHC6; __Secure-3PAPISID=VWB9ZAESqPw8swRH/ANFkhwdv0znLTQJlx; GAPS=1:MCKDmOulJGF_656vHoesXqERaWBRHMc91-qCO9MmvvWt_FvpFlu7OhBVXn7v788Imc0wlKwAAgf_jZ_ci5liq5i9cNWI-A:XAgahkl9a0j_144i; NID=200=VVFPm2bxQxF1Eie2FIxJrys5cO7PHyqabWmjSzqTWsmjBPaRQ-_0Vc8Pps_tnGXYnaBIXSOG6NFyjxVOrreW8IhlAy17omCVdd_cgJxu7PNqlMMATc6E3YpSmCNLZMa6ls42Ud_CHOEyRi1rTN6Ege5mC6avq0fWe6bHFEdL5ZH00SQXqBw8-5-1WNCidAvb3vySNDso3LCpwxeuUlqzYWFXH_Ddnb83fER-PI51z9K6S1nq1d0P2fV6ZcoY7qgLPWu1trGXBW9C_j5vIOw; 1P_JAR=2020-3-12-10; SIDCC=AJi4QfGCz_bzFabri1NNLoxuIX500bMSskRtfYzKOTU-QQAcn4KoJ2zVDkQ5NAYfZ3S10VXo2Ec'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      // const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
      // const arr = latlon.split(',')
      // if (arr.length < 2) {
      //     arr.push('')
      // }
      const lat = cutStr(body, 'var location = {lat:', ',').trim()
      const lon = cutStr(body, 'lng:', '};').trim()
      const title = remove_text($('.news-detail h3').text())
      const add = cutStr(body, '<label>Địa chỉ:</label>', '</div>').trim()
      const price = cutStr(body, '<label>Giá:</label>', '</div>').trim()
      const area = cutStr(body, '<label>Diện tích:</label>', '</div>').trim()
      const housing_type = cutStr(body, '<td>Loại BDS</td>', '</td>').replace('<td>', '').trim()

      // b = cutStr(body, 'Hướng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
      // d = cutStr(b, '<div class="pull-right">', '</div>').trim()
      // d = d.replace('&#244;', 'ô')
      // d = d.replace('&#226;', 'â')
      const huongnha = cutStr(body, '<label>Hướng nhà:</label>', '</div>').trim()
      const duong_vao = cutStr(body, '<label>Đường vào lộ giới:</label>', '</div>').trim()
      // c = cutStr(body, 'Số tầng', '<div class="clearfix" style="padding-left: 10px;">').trim()
      const huong_ban_cong = ''
      const mat_tien = cutStr(body, '<label>Đường trước mặt:</label>', '</div>').trim()
      const desc = remove_text($('.wrap-article').text())
      const noi_that = ''
      const so_phong_khach = ''
      const so_phong_tam = cutStr(body, '<label>Số toilet:</label>', '</div>').trim()
      const chieu_dai = cutStr(body, '<label>Chiều dài:</label>', '</div>').trim()
      const b=parseFloat(chieu_dai)
      const chieu_rong = cutStr(body, '<label>Chiều rộng:</label>', '</div>').trim()
      const c=parseFloat(chieu_rong)
      const juridical = cutStr(body, '<td>Pháp lý</td>', '</td>').replace('<td>', '').trim()
      const so_tang = cutStr(body, '<label>Số tầng:</label>', '</div>').trim()
      const bed = cutStr(body, '<label>Số phòng:</label>', '</div>').trim()
      const img = [] 
      $('.slick2 a').each((index,item)=>{img.push('https://nhadatdayroi.com/'+$(item).attr('href'))})
      const obj = {
        title: title,
        site: 'nhadatdayroi',
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
        width: testnull(b),
        length: testnull(c),
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