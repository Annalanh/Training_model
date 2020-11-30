const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 1, 'ban-can-ho-chung-cu', 0)
}).catch(console.log)
const TYPES = [
    'ban-can-ho-chung-cu',
    'ban-nha-rieng-nha-hem',
    'ban-nha-biet-thu-lien-ke',
    'ban-nha-mat-pho-mat-tien',
    'ban-nha-nghi-khach-san-nha-hang',
    'ban-dat-nen-du-an',
    'ban-dat-tho-cu',
    'ban-trang-trai-khu-nghi-duong',
    'ban-kho-nha-xuong',
    'cho-thue-can-ho-chung-cu',
    'cho-thue-nha-rieng-nha-hem',
    'cho-thue-nha-mat-pho-mat-tien',
    'cho-thue-van-phong',
    'cho-thue-biet-thu',
    'cho-thue-nha-tro-phong-tro',
    'cho-thue-mat-bang-cua-hang-ki-ot',
    'cho-thue-kho-nha-xuong-dat'

]
const PAGES = [7,16,3,7,1,6,1,1,1,1,1,1,2,1,1,1,2]
const CATEGORY = [1,2,3,4,9,5,30,7,8,12,13,14,16,21,15,17,18]
function run(db, page, type, index) {
    console.log(`running ${page}-${type}`)
    getPage(page, type).then(links => {
        links.forEach((link) => {
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
function getPage(page = 1, type = 'ban-can-ho-chung-cu') {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://thongkenhadat.com/${type}/page-${page}}.html`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'PHPSESSID=h37hsd5fcmjl69g9uon87nhkj0; _jsuid=2668041729; _ga=GA1.2.140711254.1579074849; wf_toomaketer_sub32786=1; _gid=GA1.2.1257220207.1583286623; heatmaps_g2g_101239430=no; _first_pageview=1; _gat=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.style1').each((index, item) => {
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
                cookie: 'PHPSESSID=h37hsd5fcmjl69g9uon87nhkj0; _jsuid=2668041729; _ga=GA1.2.140711254.1579074849; wf_toomaketer_sub32786=1; _gid=GA1.2.1257220207.1583286623; heatmaps_g2g_101239430=no; _first_pageview=1'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const title = remove_text($('.span-title').text())
            const add = remove_text($('.span-info').text().replace('Vị trí:','').trim())
            const price = remove_text(cutStr(body,'<span>Giá:','</span>'))
            const area = remove_text(cutStr(body,'Diện tích:','m<sup>'))
            const housing_type = ''
            const huongnha = remove_text(cutStr(body,'Hướng BĐS</span><span class="span-2">','</span>'))
            const phap_ly = ''
            const so_tang = remove_text(cutStr(body,'Số tầng</span><span class="span-2">','</span>'))
            const bed = remove_text(cutStr(body,'Số phòng</span><span class="span-2">','</span>'))
            const duong_vao = remove_text(cutStr(body,'Đường trước nhà</span><span class="span-2">','</span>'))
            const huong_ban_cong = remove_text(cutStr(body,'Hướng ban công</span><span class="span-2">','</span>'))
            const lat = cutStr(body,'LatLng(',')').split(',')[0]
            const lon = cutStr(body,'LatLng(',')').split(',')[1]
            const mat_tien = remove_text(cutStr(body,'Mặt tiền</span><span class="span-2">','</span>'))
            const desc = remove_text($('body > div.mm-page.mm-slideout > div.body-wrapper.callpage--post_type-catproduct_detail > div.neo_banner > div.body-content > div.body_left > div > div.div-mota').text())
            const noi_that = remove_text(cutStr(body,'Nội thất</span><span class="span-2">','</span>'))
            const so_phong_khach = ''
            const so_phong_tam = remove_text(cutStr(body,'Số toilet</span><span class="span-2">','</span>'))
            const chieu_dai = ''
            const chieu_rong = ''
            const list_img = []
            $('.fancybox').each((index, item) => { list_img.push($(item).attr('href')) })
            const obj = {
                title: title,
                site: 'thongkenhadat',
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
