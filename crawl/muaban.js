const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 1, 'biet-thu-villa-penthouse-toan-quoc-l0-c3205', 0)
}).catch(console.log)
const TYPES = [
    'biet-thu-villa-penthouse-toan-quoc-l0-c3205',
    'nha-hem-ngo-toan-quoc-l0-c3202',
    'nha-mat-tien-toan-quoc-l0-c3201',
    'ban-can-ho-chung-cu-tap-the-toan-quoc-l0-c38',
    'dat-du-an-khu-dan-cu-toan-quoc-l0-c3101',
    'dat-nong-nghiep-kho-bai-toan-quoc-l0-c3103',
    'dat-tho-cu-toan-quoc-l0-c3102',
    'biet-thu-villa-toan-quoc-l0-c3409',
    'can-ho-chung-cu-tap-the-toan-quoc-l0-c3402',
    'dat-kho-xuong-toan-quoc-l0-c3406',
    'khach-san-can-ho-dich-vu-toan-quoc-l0-c3404',
    'mat-bang-cua-hang-shop-toan-quoc-l0-c3403',
    'nha-hem-ngo-toan-quoc-l0-c3407',
    'nha-mat-tien-toan-quoc-l0-c3401',
    'nha-tro-phong-tro-toan-quoc-l0-c3405',
    'van-phong-toan-quoc-l0-c3408'
]
const PAGES = [200,200,200,200,200,103,200,33,200,81,38,112,200,200,200,112]
const CATEGORY = [2,33,6,1,5,25,30,21,12,18,19,17,34,14,15,16]
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
        }, 5 * 1000)
    }).catch(console.log)
}
function getPage(page = 1, type = 'biet-thu-villa-penthouse-toan-quoc-l0-c3205') {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://muaban.net/${type}?cp=${page}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: '__cfduid=d877efbdcdbb3e1e98b0a80c22edbb2cb1580913879; MBNClientId=3e165fbc-d2fe-4e8c-aa96-bc2931974b57; _gcl_au=1.1.1319727799.1580913864; _ga=GA1.2.1067435758.1580913864; _fbp=fb.1.1580913863979.1129567107; __gads=ID=76c2b08247e64c12:T=1580916939:S=ALNI_MYk42nHcYUd7oU0epBx11ZSbHWltg; __zi=2000.SSZzejyD5SigYF6va04HqIRAjhtU3mcJUjYyeynD6uLer-Aeo09LXMpGuw3E1XgDRzclgCe84unkrwUY.1; _gid=GA1.2.995199129.1581004685; ins-gaSSId=606675d7-1719-4fa8-a465-cb2d6cb49773_1581004686; mbv_cookie_detail=58165594,58133529; ins-product-id=58165594; fpsend=146389; _dc_gtm_UA-732298-1=1; insdrSV=23'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.list-item-container').each((index, item) => {
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
            url: `${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const title = remove_text(cutStr(body, '<h1 class="title">', '</h1>').trim())
            const add = remove_text(cutStr(body, '<div class="tech-item__long-value" style="float:left">', '</div>').trim())
            const price = remove_text(cutStr(body, '<div class="price-container__value">', '</div>').trim())
            b = parseFloat(cutStr(body, 'Diện tích đất:</div>', 'm²</div>').replace('<div class="tech-item__value">', '').trim())
            if (!b) {
                area = cutStr(body, 'Diện tích sử dụng:</div>', 'm²</div>').replace('<div class="tech-item__value">', '').trim()
            }
            else {
                area = cutStr(body, 'Diện tích đất:</div>', 'm²</div>').replace('<div class="tech-item__value">', '').trim()
            }
            const housing_type = ''
            const huongnha = remove_text(cutStr(body, 'Hướng:</div>', '</div>').replace('<div class="tech-item__value">', '').trim())
            const duong_vao = ''
            const phap_ly = remove_text(cutStr(body, 'Pháp lý:</div>', '</div>').replace('<div class="tech-item__value">', '').trim())
            const so_tang = remove_text(cutStr(body, 'Tầng/Lầu:</div>', '</div>').replace('<div class="tech-item__value">', '').trim())
            const bed = remove_text(cutStr(body, 'Phòng ngủ:</div>', '</div>').replace('<div class="tech-item__value">', '').trim())
            const huong_ban_cong = ''
            const lat = ''
            const lon = ''
            const mat_tien = ''
            const desc = remove_text($('.body-container').text())
            const noi_that = ''
            const so_phong_khach = ''
            const so_phong_tam = remove_text(cutStr(body, 'Phòng tắm:</div>', '</div>').replace('<div class="tech-item__value">', '').trim())
            const chieu_dai = ''
            const chieu_rong = ''
            const list_img = []
            $('.image__slides img').each((index,item)=>{list_img.push($(item).attr('src'))})
            const obj = {
                title: title,
                site: 'muaban',
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
                juridical: phap_ly,
                width: parseFloat(chieu_dai),
                length: parseFloat(chieu_rong),
                the_building: '',
                list_img : list_img
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
