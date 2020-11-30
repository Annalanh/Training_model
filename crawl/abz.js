const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require('mongodb')
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 1, list_type[0],list_lh[0], 0)
}).catch(console.log)

function run(db, page, type,lh, index) {
    console.log(`${page} - ${type} - ${index} - ${lh}`)
    getPage(page, type,lh).then(data => {
        data.forEach(de => {
            getDetail(de).then(id => {
                id.category = CategoryId[index]
                db.collection(`data`).insert(id)
            }).catch(console.log)
        })
        if (index < 15) {
            setTimeout(() => {
                if (page <= pageIn[index]) {
                    run(db, page + 1, list_type[index],list_lh[index], index)
                } else {
                    page = 0
                    index += 1
                    page = 0
                    run(db, page + 1, list_type[index],list_lh[index], index)
                }
            }, 6 * 1000)
        }

    }).catch(console.log)
}

const list_type = [


    "ban-can-ho-chung-cu",
    "ban-nha-biet-thu-lien-ke",
    "ban-nha-mat-pho",
    "ban-nha-rieng",
    "ban-dat-nen-du-an",
    "ban-dat",
    "ban-trang-trai-khu-nghi-duong",
    "ban-kho-nha-xuong",
    "cho-thue-can-ho-chung-cu",
    "cho-thue-nha-rieng",
    "cho-thue-nha-mat-pho",
    "cho-thue-nha-tro-phong-tro",
    "cho-thue-van-phong",
    "cho-thue-cua-hang-ki-ot",
    "cho-thue-kho-nha-xuong-dat",





];
const list_lh =[
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-ban",
    "nha-dat-cho-thue",
    "nha-dat-cho-thue",
    "nha-dat-cho-thue",
    "nha-dat-cho-thue",
    "nha-dat-cho-thue",
    "nha-dat-cho-thue",
    "nha-dat-cho-thue",

]
const CategoryId = [
    1,
    3,
    4,
    2,
    5,
    6,
    7,
    8,
    12,
    13,
    14,
    15,
    16,
    17,
    18,


]
const pageIn = [
    609,
    147,
    353,
    1104,
    562,
    920,
    11,
    9,
    152,
    48,
    69,
    14,
    37,
    14,
    16,

]

function getPage(page = 1, type = 'ban-can-ho-chung-cu', lh = 'nha-dat-ban') {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://abz.vn/danh-sach/${type}/loai-hinh:${lh}-page${page}.html`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const list = []
            $('.item-nhadat').each((index, item) => {
                let a = $(item).find('a')[0]
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
getDetail('https://abz.vn/ban-nha-quan-10-6x10m-4-tang-dep-chi-hon-10-ty-o-ngay-p106201.html')
function getDetail(link) {
    return new Promise((resolve, reject) => {
        rp({
            url: `${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)

            const title = remove_text($('div.box-border.bg-white > h1').text())
            const add = $('#fix-body > div:nth-child(6) > div > div > div > div.primary.fll > div.box-border.bg-white > div.product_base.clearfix > ul:nth-child(2) > li > a').text()
            const price = (cutStr(body, 'Giá :</span>', '</span>').replace(/<span class="value-attr">/, '')).trim()



            const area = (cutStr(body, 'Diện tích :</span>', '</span>').replace(/<span class="value-attr">/, '')).trim()
            const lat = $('#latitude').val()
            const lon = $('#longitude').val()
            const site = 'abz.vn'
            const huongnha = ''

            const toilet = (cutStr(body, 'Số toilet :</span>', '</span>').replace(/<span class="value-attr2">/, '')).trim()
            const bed = (cutStr(body, '<span class="label-attr">Số phòng ngủ :</span>', '</span>').replace(/<span class="value-attr2">/, '')).trim()

            const phaply = ''
            const getdesc = $('.item-code-des .ct-pr-sum:not(.box-tag.clearfix)').text()
            const desc = remove_text(getdesc.slice(0, getdesc.indexOf('Tìm kiếm theo từ khóa:')))
            const housing_type = ''
            const huong_ban_cong = ''
            const house_project = ''
            const mat_tien = ''
            const duong_vao = ''
            const so_tang = (cutStr(body, 'Tầng :</span>', '</span>').replace(/<span class="value-attr2">/, '')).trim()

            const num_living = ''
            const noi_that = ''
            const category = ''
            const chieu_dai = ''
            const chieu_ngang = ''
            const toa_nha = ''

            const list_img = []


            $('.box-slide-detail  .fotorama img').each((index, item) => {
                list_img.push($(item).attr('src'))
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