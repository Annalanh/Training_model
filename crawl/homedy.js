const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db=>{
  run(db,1998,list_type[1],1)
}).catch(console.log)

function run(db, page, type,index) {
  console.log(`running ${page} - ${type} - ${index} `)
  getPage(page, type).then(data => {
    data.forEach(de => {
      getDetail(de).then(ts => {
        ts.category=CategoryId[index]
        db.collection(`data`).insert(ts)
      }).catch(console.log)
    })
    if(index < list_type.length){
	setTimeout(() => {
      if(page<pageIn[index]){
        run(db,page +1,list_type[index],index)
      }else{
        page=0;
        index = index+1;
        run(db,page +1,list_type[index],index)
      }
      //run(db, page + 1, type)
    }, 5 * 1000)
	}
  }).catch(console.log)
}


//2627
const list_type =[
  "ban-can-ho-chung-cu",
  "ban-nha-rieng",
  "ban-nha-mat-pho-shophouse",
  "ban-nha-pho-thuong-mai-shophouse",
  "ban-nha-biet-thu-lien-ke",
  "ban-dat",
  "ban-dat-nen-du-an",
  "ban-bat-dong-san-khac",
  "cho-thue-can-ho-chung-cu",
  "cho-thue-can-ho-dich-vu",
  "cho-thue-nha-rieng",
  "cho-thue-nha-mat-pho",
  "cho-thue-nha-pho-thuong-mai-shophouse",
  "cho-thue-nha-biet-thu-lien-ke",
  "cho-thue-nha-tro-phong-tro",
  "cho-thue-van-phong",
  "cho-thue-cua-hang-mat-bang-ban-le",
  "cho-thue-dat-nha-xuong-kho-bai",
  "cho-thue-bat-dong-san-khac"
];
const CategoryId=[
  1,2,4,23,3,6,5,22,12,15,13,14,20,21,15,16,17,18,22
]
const pageIn=[533,2017,196,68,100,995,180,4,519,54,392,55,4,8,72,39,22,26,4]

function getPage(page = 1, type = 'ban-can-ho-ha-noi') {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://homedy.com/${type}?src=mega_menu&p=${page}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        cookie: '.AspNetCore.Antiforgery.qKMI6Lrj50Q=CfDJ8JvZxDW6_EZOgGfiF4zLJojkLZ8JiyW0Zz-kvnqh0ypuvVKTUdWJ9vISC27mHfoTtkjIm2NxdRg-iZbGn1cZbuudZdL6gLjrPCLkiNtMLQA2CPsXH_qfmHH1EALX8gtogQfTxilUkJwQSlcnwDPyEy4; __cfduid=decd5456d4b070bbe3ac13d3dfc1e7b2f1580832658; _ga=GA1.2.1674747762.1580832658; _gid=GA1.2.219802536.1580832658; Visitor_Returning=true; mepuzzConfig=%7B%22app_id%22%3A%22Ewk9gEP4lY%22%2C%22app_domain%22%3A%22homedy.com%22%2C%22app_status%22%3A10%2C%22public_key%22%3Anull%2C%22not_ask_allow_in_day%22%3A0%2C%22notif_wellcome%22%3A%7B%22status%22%3A0%2C%22data%22%3A%7B%22title%22%3A%22%22%2C%22body%22%3A%22%22%2C%22icon%22%3A%22%22%2C%22image%22%3A%22%22%2C%22url%22%3A%22%22%7D%7D%7D; _fbp=fb.1.1580832659126.987242166; option_search=1; userId=605e3bc7-09a5-42c0-eeb8-8d9d8ff42c8e; UserIdHomedyShare=605e3bc7-09a5-42c0-eeb8-8d9d8ff42c8e; G_ENABLED_IDPS=google; __zi=3000.SSZzejyD4D4cZ_6qd0iRnIh0lAdI1GE6TjAsji174P1ca-dmm4LKssMIuF_92LJMQjhd_CeAKTSrCZW.1; fpsend=146373; CheckUserCookie=tr:1192558ty:2; eventStaticArray=%5B%22User_tuong_tac%22%2C%22Khach_dinh_roi_web%22%2C%22Visitor_Returning%22%2C%22Xem_du_an_can_ho%22%2C%22Xem_can_ho%22%2C%22Xem_mua_ban_can_ho%22%2C%22ha_noi%22%2C%22Xem_mua_ban_nha_rieng%22%5D; GCLB=CKTw_Nvvvsft-AE; _gat=1; Personalize={"Filter":{"TypeId":1,"CategoryId":57,"CityId":1,"DistrictId":0,"MinPrice":0,"MaxPrice":0,"MinAcreage":50,"MaxAcreage":70},"LastAccessTime":"04/02/2020 23:18:28","ProductIds":[1192558],"ProjectIds":[4776],"Version":3}'
      }
    }).then(body => {
      const $ = cheerio.load(body)
      const list = []
      $('.product-item').each((index, item) => {
        const a = $(item).find('a')[0]
        list.push($(a).attr('href'))

      })
      resolve(list)
    }).catch(error => {
      reject(error)
    })
  })

}

const remove_text = (text) => {
  return text.replace(/\\n\&nbsp;/g, '').trim();
};
//getDetail('/ban-can-office-tel-republic-cong-hoa-50m2-tang-6-gia-239ty-alo-0908982299-xem-nha-es1209508?src=home_box_product')
function getDetail(link) {
  return new Promise((resolve, reject) => {
    rp({
      url: `https://homedy.com/${link}`,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
        cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
      }
    }).then(body => {
        const $ = cheerio.load(body)
        const site ='homedy.com'
        const title = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.col-sm-12 > div > div > div.col-sm-8 > h1').text())
        const add = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.col-sm-12 > div > div > div.col-sm-8 > div.address').text())
        const price = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.col-sm-12 > div > div > div.col-sm-4 > div.product-detail > div:nth-child(1) > div.cell.cell-right').text())
        const area = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.col-sm-12 > div > div > div.col-sm-4 > div.product-detail > div:nth-child(2) > div.cell.cell-right').text())
        const huongnha = (cutStr(body, "Name: 'Hướng nhà', Value: '", "'}"))
        const huong_ban_cong = (cutStr(body, "Name: 'Hướng ban công', Value: '", "'}"))
        const so_tang = (cutStr(body, "{Name: 'Số tầng', Value: '", "'}"))
        const house_project=''
        //const phaply=remove_text($(item).find('div.wrapper > div.product > div.float-in > div.product-item > div.container > div.md-8 > div > div.overview > div > div:nth-child(1) > div:nth-child(2)').text())
        const phaply = cutStr(body, "Name: 'Tình trạng pháp lý', Value: '", "'}")
        const category=''
        const desc = remove_text($('body').find('#readmore').text())
        const housing_type = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.container > div.md-8 > div > div.product-project > div > div > div > div.project-detail-text > div.name > a').text())
        const toilet = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.col-sm-12 > div > div > div.col-sm-8 > ul > li:nth-child(2)').text())
        const bed = remove_text($('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.col-sm-12 > div > div > div.col-sm-8 > ul > li:nth-child(1)').text())
        const lat = $('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.container > div.md-8 > div > div.location_reviews > div > a').attr('href')
        const lon = $('body').find('div.wrapper > div.product > div.float-in > div.product-item > div.container > div.md-8 > div > div.location_reviews > div > a').attr('href')
        const duong_vao = (cutStr(body, "{Name: 'Đường vào', Value: '", "'}"))
        const mat_tien = (cutStr(body, "{Name: 'Mặt tiền', Value: '", "'}"))
        const b = (lat) => {
          if (lat == null) {
            return ''
          } else {
            return lat.split('&')[0].split('?latitude=').pop()
          }
        }
        const c = (lon) => {
          if (lon == null) {
            return ''
          } else {
            return lon.split('longitude=').pop()
          }
        }
        const num_living=''
        const noi_that =''

        const chieu_dai=''
        const chieu_ngang =''
        const toa_nha =''
        const list_img=[]
        list_img.push($('.image-default a').attr('href'))
        $('.animate-box').each((index,item)=>{
          list_img.push($(item).find('a').attr('href'))
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
          lon: parseFloat(c(lon)),
          lat: parseFloat(b(lat)),
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
      
    }).catch(error => {
      reject(error)
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