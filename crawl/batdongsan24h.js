const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 4, 'ban-can-ho-chung-cu-tai-viet-nam-s32111', 1)
}).catch(console.log)
const TYPES = ['ban-can-ho-chung-cu-tai-viet-nam-s32111',
    'ban-nha-tai-viet-nam-s51122', 'ban-nha-tai-viet-nam-s51122',
    'ban-nha-tai-viet-nam-s51122', 'ban-dat-nen-phan-lo-tai-viet-nam-s35225',
    'ban-dat-mat-tien-tai-viet-nam-s1223994',
    'ban-nha-vuon-trang-trai-tai-viet-nam-s2020510',
    'ban-condotel-resort-tai-viet-nam-s820408',
    'ban-kho-nha-xuong-tai-viet-nam-s2191519',
    'cho-thue-can-ho-chung-cu-tai-viet-nam-s37452',
    'cho-thue-nha-tai-viet-nam-s38215',
    'cho-thue-nha-mat-pho-tai-viet-nam-s43556',
    'cho-thue-phong-tro-homestay-tai-viet-nam-s447448',
    'cho-thue-phong-nghi-khach-san-tai-viet-nam-s2349968',
    'cho-thue-van-phong-tai-viet-nam-s49596',
    'cho-thue-cua-hang-kiot-tai-viet-nam-s582542',
    'cho-thue-dat-rieng-kho-xuong-tai-viet-nam-s41267'
]
const PAGES = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
const CATEGORY = [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 19, 16, 17, 18]
function run(db, page, type, index) {
    console.log(`running ${page}-${type}`)
    getPage(page, type).then(links => {
        links.forEach(link => {
            getDetail(link).then(result => {
                result.category = CATEGORY[index]
                db.collection(`data`).insert(result)
            }).catch(getDetail(link))
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
            }, 10 * 1000)
        }
    }).catch(console.log)
}
function getPage(page = 1, type = 'ban-can-ho-chung-cu-tai-viet-nam-s32111') {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://batdongsan24h.com.vn/${type}/-1/-1/-1?page=${page}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('div.item-re-list').each((index, item) => {
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
            url: `https://batdongsan24h.com.vn${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: '_ga=GA1.3.1598354452.1581480976; _gid=GA1.3.2021764887.1581480976; _gat_gtag_UA_78379112_1=1; __zi=2000.SSZzejyD6jy_Zl2jp1eKtsh9-UsTGH7VVyYsxybVNz5dYkhzmq5DatMS-FATIadSFPxu-910Jj1ublxqtKL3s72L_l4oC0.1; fpsend=146433'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const latlon = cutStr(body, '<iframe width="100%" height="100%" frameborder="0" style="border: 0" src="https://www.google.com/maps/embed/v1/place?q=', '&amp;key=AIzaSyAJLtWW8ZhCgkTybJnsIUxo9NFM7DB5Ztw&amp;zoom=15" allowfullscreen=""></iframe>')
            const arr = latlon.split(',')
            if (arr.length < 2) {
                arr.push('')
            }
            const title = remove_text($('#center-body > h1').text())
            const add = remove_text($('#center-body > div.pm-content-detail > table > tbody > tr > td:nth-child(1) > div > div.left-detail > div:nth-child(2) > div.pull-right').text())
            const price = remove_text(cutStr(body, 'Giá: <span>', '</span>').replace('&#225;', 'á'))
            const area = remove_text(cutStr(body, 'Diện tích:', 'm2</span>').replace('<span>', '').trim())
            const housing_type = remove_text($('#center-body > div.pm-content-detail > table > tbody > tr > td:nth-child(1) > div > div.left-detail > div:nth-child(4) > div.pull-right').text())
            b = cutStr(body, 'Hướng nhà', '<div class="clearfix" style="background: #ededed; padding-left: 10px;">').trim()
            d = cutStr(b, '<div class="pull-right">', '</div>').trim()
            d = d.replace('&#244;', 'ô')
            d = d.replace('&#226;', 'â')
            const huongnha = d
            const duong_vao = ''
            c = cutStr(body, 'Số tầng', '<div class="clearfix" style="padding-left: 10px;">').trim()
            d = cutStr(c, '<div class="pull-right">', 'tầng').trim()
            const so_tang = d
            const bed = ''
            const huong_ban_cong = ''
            const lat = arr[0]
            const lon = arr[1]
            const mat_tien = ''
            const desc = cutStr(body, '<div itemprop="description">', '</p>').replace('<br />', '')
            const noi_that = ''
            const so_phong_khach = ''
            const so_phong_tam = ''
            const chieu_dai = ''
            const chieu_rong = ''
            const list_img = []
            $('.galleria a').each((index, item) => {
                list_img.push($(item).attr('href'))
            })
            const obj = {
                title: title,
                site: 'batdongsan24h',
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
                juridical: '',
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
