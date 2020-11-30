const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/REQIS`).then(db => {
    run(db, 1, list_id[0], total_row[0], list_type[0],0)
}).catch(console.log)

function run(db, page, id, totalrow, type, index) {
    console.log(`running ${page} - ${type} -  ${index}`)
    
        getPage(page, id, totalrow, type).then(data => {
            data.forEach(de => {
                getDetail(de).then(id => {
                    id.category = CategoryId[index]
                    db.collection(`data`).insert(id)
                }).catch(console.log)
            })
            if (index < list_type.length) {
            setTimeout(() => {
                //run(db,page+1,id,totalrow,type)
                if (page <= pageIn[index]) {
                    run(db, page + 1, list_id[index], total_row[index], list_type[index], index)
                } else {
                    page = 0
                    index += 1
                    run(db, page + 1, list_id[index], total_row[index], list_type[index], index)
                }
            }, 6 * 1000)
            }
        }).catch(console.log)
   
}
const list_type = [
    "ban-can-ho-chung-cu",
    "ban-shophouse",
    "ban-nha-biet-thu-lien-ke",
    "ban-nha-mat-pho",
    "ban-dat-nen-du-an",
    "ban-dat-tho-cu",
    "ban-condotel",
    "ban-officetel",
    "ban-nha-trong-ngo-tren-3m",
    "ban-phong-tro-nha-tro",
    "ban-dat-dich-vu-dat-den-bu",
    "ban-dat-trang-trai",
    "ban-khach-san-nha-hang-resort",
    "ban-mat-bang-nha-xuong",
    "ban-van-phong-trung-tam-tm",
    "nha-dat-chinh-chu-cho-thue",
    "cho-thue-can-ho-chung-cu",
    "cho-thue-shophouse",
    "cho-thue-nha-biet-thu-lien-ke",
    "cho-thue-nha-mat-pho",
    "cho-thue-dat-nen-du-an",
    "cho-thue-dat-tho-cu",
    "cho-thue-officetel",
    "cho-thue-nha-trong-ngo-tren-3m",
    "cho-thue-phong-tro-nha-tro",
    "cho-thue-dat-trang-trai",
    "cho-thue-khach-san-nha-hang-resort",
    "cho-thue-mat-bang-nha-xuong-kho-bai",
    "cho-thue-van-phong-tai-trung-tam-thuong-mai"
];
const CategoryId = [
    1, 4, 3, 4, 5, 30, 35, 35, 33, 11, 5, 25, 9, 28, 24, 2, 12, 14, 21, 14, 32, 31, 12, 34, 15, 27, 19, 29, 20
]
const pageIn = [
    2302, 219, 1390, 2832, 1276, 6698, 34, 14, 3469, 262, 56, 206, 69, 121, 62, 163, 535, 22, 55, 275, 8, 33, 11, 126, 86, 1, 27, 411, 388
]

const list_id = [
    303354, 1088736, 311706, 295500, 301158, 296232, 1127635, 1408829, 296953, 297607, 297608, 309498, 324272, 297385, 296984, 1325367, 646190, 1090567, 646192, 646206, 646188, 646193, 1409168, 646176, 646196, 646203, 646201, 646195, 646202

]
const total_row = [
    2301, 218, 1389, 2831, 1275, 6697, 33, 13, 3468, 261, 55, 205, 68, 120, 61, 162, 534, 21, 54, 274, 7, 32, 10, 125, 85, 0, 26, 410, 387

]
function getPage(page = 1, idlink, totalrow, type) {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://nhadat24h.net/ajax/XPRO._2014Index,XPRO.ashx?_method=search2019&_session=rw`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
                cookie: 'SessionGUID=f86e4c55-6411-40f5-9c7c-91560cb6aefd; idCitySelected=0; idCityChoise=5; _ga=GA1.2.627399473.1581317129; _gid=GA1.2.1201869414.1581317129; ASP.NET_SessionId=mg5lfye2ndqwqfkyojzc21ew; _gat=1',
                Referer: `https://nhadat24h.net/${type}`,
                Accept: '*/*',
                'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'Content-Type': 'text/plain;charset=UTF-8'
            },
            method: "POST",
            body: `_GetIPAddress=\r\n_id_tt=0\r\n_id_q=0\r\n_id_kv=0\r\n_id_ln=1\r\n_id_hn=0\r\n_fromTD=\r\n_toDT=\r\n_dvDT=1\r\n_fromG=\r\n_dvGfrom=10\r\n_toG=\r\n_dvGto=10000\r\n_keyWord=\r\n_ID_LT=1\r\n_orderby=1\r\n_id_u=0\r\n_yesVIP=1\r\n_NguonTin=0\r\n_Matin=0\r\n_PageIndex=${page}\r\n_offerYear=12\r\n_IDLink=${idlink}\r\n_TotallRow=${totalrow}`
        }).then(body => {

            const $ = cheerio.load(body)
            const list = []
            $('div.dv-item').each((index, item) => {
                const a = $(item).find('a')[0]
                list.push($(a).attr('href'))
            })
            $('div.dv-item-vip').each((index, item) => {
                const a = $(item).find('a')[0]
                list.push($(a).attr('href'))
            })

            //console.log(list)
            resolve(list)
        }).catch(err => {
            reject(err)
        })
    })
}
//getDetail('/ban-chung-cu-dao-trinh-nhat/ban-can-ho-thu-duc-nhan-ut1-50trcan-chi-tu-36trm2-ID3692328')
function getDetail(link) {
    return new Promise((resolve, reject) => {
        rp({
            url: `https://nhadat24h.net${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
                cookie: 'SessionGUID=f86e4c55-6411-40f5-9c7c-91560cb6aefd; idCitySelected=0; idCityChoise=5; _ga=GA1.2.627399473.1581317129; _gid=GA1.2.1201869414.1581317129; ASP.NET_SessionId=mg5lfye2ndqwqfkyojzc21ew; _gat=1',

            }
        }).then(body => {
            const $ = cheerio.load(body)
            const title = remove_text($('#txtcontenttieudetin').text())
            const add = remove_text($('#ContentPlaceHolder1_ctl00_lbTinhThanh').text())
            const price = $('#ContentPlaceHolder1_ctl00_lbGiaTien').text()
            const area = $('#ContentPlaceHolder1_ctl00_lbDienTich').text()
            const desc = remove_text($('#ContentPlaceHolder1_ctl00_divContent').text()).trim()
            const huongnha = ($('#ContentPlaceHolder1_ctl00_lbHuong').text()).replace(/.../, '')
            const housing_type = remove_text($('#ContentPlaceHolder1_ctl00_lbLoaiBDS').text())
            const duong_vao = cutStr(body, '<td class="col1">Đường vào</td><td>', '</td>')

            const so_tang = cutStr(body, '<td class="col1">Số tầng</td><td>', '</td>')
            const bed = cutStr(body, '<td>Phòng Ngủ:', ',')
            const phaply = remove_text(cutStr(body, '</span><span data-cy="legal-document-value" class="font-semibold"><span>', '</span>'))

            //const mat_tien=remove_text(cutStr(body,'<td><b>Máº·t tiá»n</b></td>','</td>')).replace(/<td>/,'').trim()
            const toilet = cutStr(body, 'Phòng WC:', '</td>')
            const mat_tien = cutStr(body, '<td class="col1">Mặt tiền</td><td>', '</td>')
            const lat = $('#txtLAT').val()
            const lon = $('#txtLON').val()
            const site = 'nhadat24h.net'
            const list_img = []
            $('.swipebox').each((index,item)=>{
                list_img.push('https://nhadat24h.net'+$(item).attr('href'))
            })
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
const remove_text = (text) => {
    return text.replace(/\\n/g, ' ').trim();
}