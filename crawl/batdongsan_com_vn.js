const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1:27017`).then(db => {
    let db = client.db('test-crawl')
    run(db, 215, 'ban-can-ho-chung-cu', 0)
}).catch(console.log)
const TYPES = [
    'ban-can-ho-chung-cu',
    'ban-nha-rieng',
    'ban-nha-biet-thu-lien-ke',
    'ban-nha-mat-pho',
    'ban-dat-nen-du-an',
    'ban-trang-trai-khu-nghi-duong',
    'ban-kho-nha-xuong',
    'cho-thue-can-ho-chung-cu',
    'cho-thue-nha-rieng',
    'cho-thue-nha-mat-pho',
    'cho-thue-nha-tro-phong-tro',
    'cho-thue-van-phong',
    'cho-thue-cua-hang-ki-ot',
    'cho-thue-kho-nha-xuong-dat'
]
const PAGES = [2794, 2560, 810, 1476, 1465, 22, 37, 1451, 409, 525, 168, 316, 111, 166]
const CATEGORY = [1, 2, 3, 4, 5, 7, 8, 12, 13, 14, 15, 16, 17, 18]
function run(db, page, type, index) {
    console.log(`running ${page}-${type}`)
    getPage(page, type).then(links => {
        links.forEach(link => {
            getDetail(link).then(result => {
                
                result.category = CATEGORY[index]
                db.collection(`data`).insert(result)
            }).catch(getDetail(link))
        })
        if(index < PAGES.length){
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
function getPage(page = 1, type = 'ban-can-ho-chung-cu') {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://batdongsan.com.vn/${type}/p${page}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.search-productItem').each((index, item) => {
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
    return text.replace(/\\n()/g, '').trim();
};
function getDetail(link) {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://batdongsan.com.vn/${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                cookie: 'scs=1; __cfduid=d741e0cb2d1a4ff3c47e6af6ff25a1ef61579056662; usidtb=QbkAQpZjdltbt85lmNSA5BDoNDc1bFby; __auc=ea03628016fa71c8a30a4a503af; _gcl_au=1.1.804706643.1579056663; _fbp=fb.2.1579056663264.283780879; _ga=GA1.3.1104121469.1579056664; __zlcmid=wGiq16STiAbIbn; SERVERID=D; scs=1; ins-gaSSId=d6d702fa-7fb9-4dfb-d0ea-859eb7e68993_1579226282; _gid=GA1.3.688602642.1579226350; sidtb=lLUBuRTNvCbZrdc6eNp05fJcrJucH0j6; ASP.NET_SessionId=cn3mdvjvliyjnmc1m041auuy; __asc=c518ce9016fb139c16fa6c6c8c8; insdrSV=4; _gat_UA-3729099-1=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            list_img = []
            const title = remove_text($('#product-detail > div.pm-title > h1').text())
            const add = remove_text(cutStr(cutStr(body, 'Địa chỉ', '<div style="clear: both">').trim(), '<div class="right">', '</div>').trim())
            b = cutStr(body, 'Giá:</b>', '</strong>').trim()
            b = b.replace('<strong>', '').trim()
            b = b.replace('&nbsp;', '').trim()
            const price = b
            const area = cutStr(body, 'Diện tích:</b>', 'm²</strong>').replace('<strong>', '')
            const housing_type = remove_text(cutStr(cutStr(body, 'Loại tin rao', '<div style="clear: both">').trim(), '<div class="right">', '</div>').trim())
            const huongnha = cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_direction" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '</div>').trim()
            const duong_vao = cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_wardin" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '(m)').trim()
            const phap_ly = ''
            const so_tang = cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_floor" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '(tầng)').trim()
            const bed = remove_text(cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_roomNumber" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '(phòng)').trim())
            const huong_ban_cong = remove_text(cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_balcony" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '</div>').trim())
            const lat = cutStr(body, '<input type="hidden" name="ctl00$LeftMainContent$_productDetail$hdLat" id="hdLat" value="', '" />')
            const lon = cutStr(body, '<input type="hidden" name="ctl00$LeftMainContent$_productDetail$hdLong" id="hdLong" value="', '" />')
            const mat_tien = cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_frontEnd" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '(m)').trim()
            const desc = remove_text($('#product-detail > div.pm-content > div.pm-desc').text())
            const noi_that = cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_interior" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '</div>').trim()
            const so_phong_khach = ''
            const so_phong_tam = remove_text(cutStr(cutStr(body, '<div id="LeftMainContent__productDetail_toilet" class="row">', '<div style="clear: both">').trim(), '<div class="right">', '</div>').trim())
            const chieu_dai = ''
            const chieu_rong = ''
            $('.list-img ul li img').each((index, item) => {
                list_img[index] = $(item).attr('src')
            })
            const img = list_img
            const obj = {
                title: title,
                site: 'batdongsan.com.vn',
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


