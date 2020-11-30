const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 1, 'nha-dat-bat-dong-san/can-ban/nha-mat-tien', 0)
}).catch(console.log)
const TYPES = ['nha-dat-bat-dong-san/can-ban/nha-mat-tien',
    'nha-dat-bat-dong-san/can-ban/biet-thu-lien-ke', 'nha-dat-bat-dong-san/can-ban/dat-tho-cu-so-do',
    'nha-dat-bat-dong-san/can-ban/dat-nen-du-an-phan-lo', 'nha-dat-bat-dong-san/can-ban/nha-trong-ngo-hem',
    'nha-dat-bat-dong-san/can-ban/nha-chung-cu-tap-the',
    'nha-dat-bat-dong-san/can-ban/dat-dau-gia-dich-vu',
    'nha-dat-bat-dong-san/can-ban/nha-nghi-phong-tro',
    'nha-dat-bat-dong-san/can-ban/van-phong',
    'nha-dat-bat-dong-san/can-ban/kho-xuong',
    'nha-dat-bat-dong-san/can-ban/nha-hang-khach-san',
    'nha-dat-bat-dong-san/can-ban/cua-hang-shop-kiot-quan',
    'nha-dat-bat-dong-san/can-ban/trang-trai-nha-vuon',
    'nha-dat-bat-dong-san/can-ban/mat-bang-co-ha-tang',
    'nha-dat-bat-dong-san/can-ban/dat-nong-lam-nghiep',
    'nha-dat-bat-dong-san/can-ban/cac-loai-khac',
    'nha-dat-bat-dong-san/cho-thue/nha-mat-tien',
    'nha-dat-bat-dong-san/cho-thue/biet-thu-lien-ke', 'nha-dat-bat-dong-san/cho-thue/dat-tho-cu-so-do',
    'nha-dat-bat-dong-san/cho-thue/dat-nen-du-an-phan-lo', 'nha-dat-bat-dong-san/cho-thue/nha-trong-ngo-hem',
    'nha-dat-bat-dong-san/cho-thue/nha-chung-cu-tap-the',
    'nha-dat-bat-dong-san/cho-thue/dat-dau-gia-dich-vu',
    'nha-dat-bat-dong-san/cho-thue/nha-nghi-phong-tro',
    'nha-dat-bat-dong-san/cho-thue/van-phong',
    'nha-dat-bat-dong-san/cho-thue/kho-xuong',
    'nha-dat-bat-dong-san/cho-thue/nha-hang-khach-san',
    'nha-dat-bat-dong-san/cho-thue/cua-hang-shop-kiot-quan',
    'nha-dat-bat-dong-san/cho-thue/trang-trai-nha-vuon',
    'nha-dat-bat-dong-san/cho-thue/mat-bang-co-ha-tang',
    'nha-dat-bat-dong-san/cho-thue/dat-nong-lam-nghiep',
    'nha-dat-bat-dong-san/cho-thue/cac-loai-khac'
]
const PAGES = [1291, 227, 1026, 246, 2316, 431, 13, 11, 4, 11, 9, 3, 20, 3, 21, 50, 88, 11, 2, 6, 82, 108, 1, 26, 53, 20, 3, 6, 83, 4, 1, 4]
const CATEGORY = [4, 3, 30, 5, 33, 1, 22, 11, 24, 8, 9, 10, 7, 28, 25, 22, 14, 21, 31, 32, 34, 12, 22, 15, 16, 18, 19, 17, 27, 29, 26, 22]
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
function getPage(page = 1, type = 'nha-dat-bat-dong-san/can-ban/nha-mat-tien') {
    return new Promise((resolve, reject) => {
        rp({
            url: `http://timmuanhadat.com.vn/${type}/trang--${page}.html`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'ASP.NET_SessionId=t1sckkaendspn0rkbg5325mm; _ga=GA1.3.1498764291.1583122535; _gid=GA1.3.535544171.1583122535; __atuvc=2%7C10; __atuvs=5e5cc99301bc99cc000; _gat=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.content-items .item').each((index, item) => {
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
            url: `http://timmuanhadat.com.vn${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'ASP.NET_SessionId=t1sckkaendspn0rkbg5325mm; _ga=GA1.3.1498764291.1583122535; _gid=GA1.3.535544171.1583122535; __atuvc=6%7C10; __atuvs=5e5cc99301bc99cc004'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const title = remove_text($('#right > div.property > div.title').text())
            const add = remove_text($('#right > div.property > div.contact > div > span.value').text())
            const price = remove_text($('#right > div.property > div.moreinfor > span.price > span.value').text())
            const area = remove_text($('#right > div.property > div.moreinfor > span.square > span.value').text().replace('m2', ''))
            const housing_type = cutStr(body, '<td>Loại tin</td><td>', '</td>') + cutStr(body, '<td>Loại BDS</td><td>', '</td>')
            const huongnha = cutStr(body, '<td>Hướng</td><td>', '</td>') == '_' ? '' : cutStr(body, '<td>Hướng</td><td>', '</td>')
            const phap_ly = cutStr(body, '<td>Pháp lý</td><td>', '</td>')
            const so_tang = cutStr(body, '<td>Số lầu</td><td>', '</td>')
            const bed = cutStr(body, '<td>Số phòng ngủ</td><td>', '</td>')
            const duong_vao = ''
            const huong_ban_cong = ''
            const lat = ''
            const lon = ''
            const mat_tien = cutStr(body, '<td>Lộ giới</td><td>', '</td>').replace('m', '')
            const desc = remove_text($('#right > div.property > div.detail.text-content').text())
            const noi_that = ''
            const so_phong_khach = ''
            const so_phong_tam = ''
            const chieu_dai = cutStr(body, '<td>Chiều dài</td><td>', '</td>').replace('m', '')
            const chieu_rong = cutStr(body, '<td>Chiều ngang</td><td>', '</td>').replace('m', '')
            const list_img = []
            $('.image-list ul li img').each((index, item) => { list_img.push('http://timmuanhadat.com.vn' + $(item).attr('src')) })
            const obj = {
                title: title,
                site: 'timmuanhadat',
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
