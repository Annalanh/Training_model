const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 5951, list_type[0], 0)
}).catch(console.log)

function run(db, page, type, index) {
    console.log(`${page} - ${type} + ${index}`)
    getPage(page, type).then(data => {
        data.forEach(de => {
            getDetail(de).then(id => {
                id.category = CategoryId[index]
                db.collection(`data`).insert(id)
            }).catch(console.log)
        })
        setTimeout(() => {
            if (page <= pageIn[index]) {
                run(db, page + 1, list_type[index], index)
            } else {
                page = 0
                index += 1
                run(db, page + 1, list_type[index], index)
            }
        }, 7 * 1000)
    }).catch(console.log)
}

const list_type = [
    
    "can-ban",
    "can-ban/nha-rieng",
    "can-ban/chung-cu",
    "can-ban/biet-thu-lien-ke",
    "can-ban/van-phong-mat-bang",
    "can-ban/khach-san-phong-tro",
    "can-ban/trang-trai-khu-nghi-duong",
    "can-ban/kho-xuong-san-xuat",
    "rao-vat/can-ban/dat-nong-lam-nghiep",
    "cho-thue",
    "cho-thue/nha-rieng",
    "cho-thue/dat-nen-phan-lo",
    "cho-thue/biet-thu-lien-ke",
    "cho-thue/van-phong-mat-bang",
    "cho-thue/khach-san-phong-tro",
    "cho-thue/trang-trai-khu-nghi-duong",
    "cho-thue/kho-xuong-san-xuat",
    "cho-thue/dat-nong-lam-nghiep"




];
const CategoryId = [
    4,
    2,
    1,
    3,
    28,
    9,
    7,
    8,
    25,
    14,
    13,
    29,
    21,
    16,
    19,
    27,
    18,
    26,

]
const pageIn = [
    6650,
    1320,
    120,
    115,
    36,
    121,
    7,
    16,
    162,
    595,
    127,
    8,
    9,
    112,
    37,
    7,
    14,
    1

]

function getPage(page = 1, type = 'can-ban/dat-o-tho-cu') {
    return new Promise((resolve, reject) => {
        rp({
            url: `http://datnenphomoi.com.vn/rao-vat/${type}/trang--${page}.html`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const list = []
            $('#ctl00_content_sale_content .item').each((index, item) => {
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
    return text.replace(/\\n()/g, ' ').trim();
};
getDetail('/nha-ban-1-tret-2-lau-duong-dinh-duc-thien-100m2-gia-1-6-ty-shr-527523.html')
function getDetail(id) {
    return new Promise((resolve, reject) => {
        rp({
            url: `http://datnenphomoi.com.vn${id}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)

            const title = remove_text($('#right > div.property > div.title > h1').text())
            const add = remove_text($('#right > div.property > div.add > span.value').text())
            const price = remove_text($('#right > div.property > div.moreinfor > span.price > span.value').text()).trim()
            const area = remove_text($('#right > div.property > div.moreinfor > span.square > span.value').text()).replace(/m/, '').trim()
            const lat = ''
            const lon = ''
            const site = 'datnenphomoi.com.vn'
            const link = site + id
            const huongnha = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(1) > td:nth-child(4)').text()).replace(/_/, '').trim()
            let direc = (a) => {
                if (a == "Không xác định" || a == "_") {
                    return ''
                } else {
                    return a
                }
            }
            const toilet = ''
            const bed = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(5) > td:nth-child(4)').text()).trim()

            const phaply = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(3) > td:nth-child(4)').text()).trim()
            const desc = remove_text($('#right > div.property > div.detail.text-content').text()).replace(/\n/, '').trim()
            const housing_type = ''
            const huong_ban_cong = ''
            const house_project = ''
            const mat_tien = ''
            const duong_vao = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(2) > td:nth-child(4)').text()).replace(/m/, '').trim()
            const so_tang = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(4) > td:nth-child(4)').text()).trim()

            const num_living = ''
            const noi_that = ''
            const category = ''
            const chieu_dai = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(5) > td:nth-child(2)').text()).replace(/m/, '').trim()
            const chieu_ngang = remove_text($('#right > div.property > div.moreinfor1 > div.infor > table > tbody > tr:nth-child(4) > td:nth-child(2)').text()).replace(/m/, '').trim()
            const toa_nha = ''

            const list_img = []
            const list_img1 = []

            $('.images .limage').each((index, item) => {
                list_img.push('http://datnenphomoi.com.vn' + $(item).attr('src'))

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
                house_direc: direc(huongnha),
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

        }).then(err => {
            reject(err)

        })
    })
}