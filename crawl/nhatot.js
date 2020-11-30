const request = require(`request`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db,1,list_type[0],type_text[0],0)
}).catch(console.log)

function run(db, page, id_type,type,index) {
    console.log(`running ${page} - ${type} - ${index} - ${id_type} - ${CategoryId[index]}`)
    getPage(page,type,id_type).then(data => {
      data.forEach(de => {
        getAd(de).then(ts => {
          ts.category=CategoryId[index]
          db.collection(`data`).insert(ts)
        }).catch(console.log)
      })
      if(index < 9){
        setTimeout(() => {
            if(page<pageIn[index]){
                run(db,page +1,list_type[index],type_text[index],index)
            }else{
              page=0;
              index = index+1;
              run(db,page +1,list_type[index],type_text[index],index)
            }
            //run(db, page + 1, type)
          }, 6 * 1000)
      }
    }).catch(console.log)
  }
const type_text=[

    "s,k",
    "s,k",
    "s,k",
    "s,k",
    "u,h",
    "u,h",
    "u,h",
    "u,h",
    "u,h",

]
const list_type = [

    1010,
    1020,
    1040,
    1030,
    1010,
    1020,
    1040,
    1030,
    1050




];
const CategoryId = [
    1,
    2,
    5,
    24,
    12,
    13,
    32,
    16,
    15


]
const pageIn = [
    1335,
    7229,
    5878,
  
    332,
    2119,
    2902,
    96,
    1868,
    1605


]
function getPage(page = 2,type='s,k',id_type=1010) {
    return new Promise((resolve, reject) => {
        request({
            url: `https://gateway.chotot.com/v1/public/ad-listing?cg=${id_type}&limit=20&o=20&st=${type}&page=${page}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                cookie: '__cfduid=db9d045f54fb7e58575b7de17d742539c1579054908; rVisitor=0; AB_test_key=new; ctfp=0d8b5ac5-cb0e-4f42-95f5-6c3a1986b82a; _ga=GA1.2.2081569582.1579054909; _gid=GA1.2.70123230.1579054909; ab.storage.deviceId.3f482ca8-a60e-4fbf-8f13-cec3acdede1a=%7B%22g%22%3A%22f0f63ea3-9712-d877-d09d-0d6e123a14ab%22%2C%22c%22%3A1579054909389%2C%22l%22%3A1579054909389%7D; __gads=ID=370f0a95940feaa2:T=1579054910:S=ALNI_MZXOP4zlONf6tfRGhv3VTtrpsq-5Q; saveSearchTooltip=true; __zi=2000.SSZzejyD6zOadl6-dXeRpoZHlAFG50EDTCEslS9M4PjbpEYsnHfSasNFxhx17HUJOCsgliGT69LWmgon.1; fpsend=146208; saveAdTooltip=true; ab.storage.userId.3f482ca8-a60e-4fbf-8f13-cec3acdede1a=%7B%22g%22%3A%22none%22%2C%22c%22%3A1579055247654%2C%22l%22%3A1579055247654%7D; ab.storage.sessionId.3f482ca8-a60e-4fbf-8f13-cec3acdede1a=%7B%22g%22%3A%22ac649900-5f5d-2627-e905-de34aa30fc38%22%2C%22e%22%3A1579057072704%2C%22c%22%3A1579055247655%2C%22l%22%3A1579055272704%7D'
            }, json: true
        }, (error, header, body) => {
            if (error) {
                reject(error)
            } else {
                if (body.ads) {
                    const listID = body.ads.map(ad => ad.list_id)
                  
                    resolve(listID)
                } else {
                    console.log(body)
                    reject()
                }
            }
        })
    })
}
function getAd(adid) {
    return new Promise((resolve, reject) => {
        request({
            url: `https://gateway.chotot.com/v1/public/ad-listing/${adid}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: '__cfduid=db9d045f54fb7e58575b7de17d742539c1579054908; rVisitor=0; AB_test_key=new; ctfp=0d8b5ac5-cb0e-4f42-95f5-6c3a1986b82a; _ga=GA1.2.2081569582.1579054909; _gid=GA1.2.70123230.1579054909; ab.storage.deviceId.3f482ca8-a60e-4fbf-8f13-cec3acdede1a=%7B%22g%22%3A%22f0f63ea3-9712-d877-d09d-0d6e123a14ab%22%2C%22c%22%3A1579054909389%2C%22l%22%3A1579054909389%7D; __gads=ID=370f0a95940feaa2:T=1579054910:S=ALNI_MZXOP4zlONf6tfRGhv3VTtrpsq-5Q; saveSearchTooltip=true; __zi=2000.SSZzejyD6zOadl6-dXeRpoZHlAFG50EDTCEslS9M4PjbpEYsnHfSasNFxhx17HUJOCsgliGT69LWmgon.1; fpsend=146208; saveAdTooltip=true; ab.storage.userId.3f482ca8-a60e-4fbf-8f13-cec3acdede1a=%7B%22g%22%3A%22none%22%2C%22c%22%3A1579055247654%2C%22l%22%3A1579055247654%7D; ab.storage.sessionId.3f482ca8-a60e-4fbf-8f13-cec3acdede1a=%7B%22g%22%3A%22ac649900-5f5d-2627-e905-de34aa30fc38%22%2C%22e%22%3A1579057072704%2C%22c%22%3A1579055247655%2C%22l%22%3A1579055272704%7D'
            }, json: true
        }, (error, header, body1) => {
            if (error) {
                reject(error)
            } else {

                const c = body1.ad
                let aaa = body1.parameters
                function test1(tes) {
                    let cd = aaa.find(el => el.id === tes)
                    if (cd == null) {
                        return ""
                    } else {
                        return cd['value']
                    }
                }
                function check(cd) {
                    if (cd == null) {
                        return ""
                    } else {
                        return cd
                    }
                }
                const title = check(c.subject)
                const add = test1('address').replace(/\n/, '')
                const price = check(c.price)
                const area = check(c.size)
                const desc = check(c.body)
                const huongnha = test1('direction')
                const housing_type = test1('apartment_type')
                const duong_vao = ''
                const so_tang = check(c.floors)
                const bed = check(c.rooms)
                const phaply = test1('property_legal_document')
                const link = check(c.list_id)
                const toilet = check(c.toilets)
                const mat_tien = ''
                const lat = ''
                const lon = ''
                const site = 'nha.chotot.com'
                const list_img = check(c.images)
                const category = ''
                const huong_ban_cong = ''
                const house_project = ''
                const num_living = ''
                const noi_that = ''
                const chieu_dai = ''
                const chieu_ngang = ''
                const toa_nha = ''
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
                    lon: parseFloat(lon),
                    lat: parseFloat(lat),
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
            }
        })
    })
}