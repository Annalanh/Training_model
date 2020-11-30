const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 1, 'raovat-c3/ban-biet-thu-trong-du-an', 0)
}).catch(console.log)
const TYPES = [
    'raovat-c3/ban-biet-thu-trong-du-an',
    'raovat-c5/ban-dat-nen-du-an',
    'raovat-c6/ban-can-ho-chung-cu',
    'raovat-c8/ban-nha-rieng',
    'raovat-c9/ban-nha-mat-pho',
    'raovat-c10/ban-nha-phan-lo',
    'raovat-c11/ban-dat',
    'raovat-c13/ban-kho-nha-xuong',
    'raovat-c14/ban-khach-san-nha-nghi',
    'raovat-c15/ban-mat-bang-cua-hang',
    'raovat-c4/cho-thue-van-phong',
    'raovat-c16/cho-thue-nha-mat-pho',
    'raovat-c17/cho-thue-nha-rieng',
    'raovat-c18/cho-thue-can-ho-chung-cu',
    'raovat-c19/cho-thue-biet-thu',
    'raovat-c20/cho-thue-cua-hang-kiot',
    'raovat-c21/cho-thue-nha-tro',
    'raovat-c23/cho-thue-kho-nha-xuong',
    'raovat-c24/cho-thue-dat',
    'raovat-c25/cho-thue-khach-san-nha-nghi',
]
const PAGES = [5, 10, 14, 30, 17, 1, 18, 1, 1, 2, 3, 3, 6, 6, 1, 2, 3, 2, 1, 1]
const CATEGORY = [3, 5, 1, 2, 4, 23, 30, 8, 9, 28, 16, 14, 13, 12, 21, 17, 15, , 18, 31, 19]
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
function getPage(page = 1, type = 'raovat-c3/ban-biet-thu-trong-du-an') {
    return new Promise((resolve, reject) => {
        rp({
            url: `http://123nhadat.vn/${type}/${page}/-1/0/0`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'sid=osopmig91mflbqo2rui2qihga3; HstCfa1632839=1581860089132; HstCmu1632839=1581860089132; HstCnv1632839=1; HstCns1632839=1; adpopup_thelegen109=1581860089; __gads=ID=db1b9541bf71ba69:T=1581860091:S=ALNI_MaE1YiFCeBM_8eu6Vphc5ugzUEmmA; __utma=66602353.939366663.1581860091.1581860091.1581860091.1; __utmc=66602353; __utmz=66602353.1581860091.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __asc=5b58d4d91704e3577f5f383138b; __auc=5b58d4d91704e3577f5f383138b; __tawkuuid=e::123nhadat.vn::p3Od9vw7gjFDVfXtQOcy7ZA5ySQsbZ97JShqFMAxh5n7YtEoivOVCGC8gPgk8IJ/::2; __dtsu=6D0015818600946563585824AF788CB2; __utmt=1; HstCla1632839=1581860750540; HstPn1632839=10; HstPt1632839=10; __utmb=66602353.10.10.1581860091; TawkConnectionTime=0'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.box_nhadatban').each((index, item) => {
                const a = $(item).find('a')[0]
                if (a) {
                    links.push($(a).attr('href'))
                }
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
                cookie: 'sid=osopmig91mflbqo2rui2qihga3; HstCfa1632839=1581860089132; HstCmu1632839=1581860089132; HstCnv1632839=1; HstCns1632839=1; adpopup_thelegen109=1581860089; __gads=ID=db1b9541bf71ba69:T=1581860091:S=ALNI_MaE1YiFCeBM_8eu6Vphc5ugzUEmmA; __utma=66602353.939366663.1581860091.1581860091.1581860091.1; __utmc=66602353; __utmz=66602353.1581860091.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __asc=5b58d4d91704e3577f5f383138b; __auc=5b58d4d91704e3577f5f383138b; __tawkuuid=e::123nhadat.vn::p3Od9vw7gjFDVfXtQOcy7ZA5ySQsbZ97JShqFMAxh5n7YtEoivOVCGC8gPgk8IJ/::2; __dtsu=6D0015818600946563585824AF788CB2; __utmt=1; HstCla1632839=1581860750540; HstPn1632839=10; HstPt1632839=10; __utmb=66602353.10.10.1581860091; TawkConnectionTime=0'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const title = remove_text(cutStr(body, '<h1 class="tieude_nhadat">', '</h1>').trim())
            const add = remove_text(cutStr(body, 'Địa chỉ của bất động sản', '</div>').replace(';', '').trim())
            const price = remove_text(cutStr(body, '<li><label>Giá:</label><span><b class="camcam">', '</b>').trim())
            const area = remove_text(cutStr(body, '<li><label>Diện tích:</label><span><b class="camcam">', '</b>').replace('m&sup2;', '').trim())
            const housing_type = ''
            const huongnha = remove_text(cutStr(body, '<li>Hướng nhà', '</li>').replace(';', '').trim())
            const duong_vao = ''
            const phap_ly = remove_text(cutStr(body, '<li>Pháp lý', '</li>').replace(';', '').trim())
            arr = []
            $('.thongsonha li').each((index, item) => {
                arr[index] = $(item).text()
            })
            so_tang = ''
            bed = ''
            so_phong_tam = ''
            arr.forEach(ele => {
                if (ele.indexOf('tầng') > -1) {
                    so_tang = ele.replace('tầng', '')
                }
                if (ele.indexOf('phòng') > -1) {
                    bed = ele.replace('phòng', '').trim()
                    bed = ele.replace('ngủ', '').trim()
                }
                if (ele.indexOf('vệ') > -1) {
                    so_phong_tam = ele.replace('nhà', '').trim()
                    so_phong_tam = so_phong_tam.replace('vệ', '').trim()
                    so_phong_tam = so_phong_tam.replace('sinh', '').trim()
                }
            });
            const huong_ban_cong = ''
            b = cutStr(body, 'LatLng(', ')').trim()
            c = b.split(',')[0]
            d = b.split(',')[1]
            e = c.substring(1, c.length - 1);
            g = d.substring(1, d.length - 1);
            const lat = e
            const lon = g
            const mat_tien = remove_text(cutStr(body, '<li>Đường trước nhà:', 'm</li>').trim())
            const desc = $('.detail_khungxam p').text().trim()
            const noi_that = ''
            const so_phong_khach = ''
            const chieu_dai = ''
            const chieu_rong = ''
            const list_img = []
            $('.amazingslider-slides li span').each((index, item) => {
                list_img.push($(item).attr('href'))
            })
            const obj = {
                title: title,
                site: '123nhadat',
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
