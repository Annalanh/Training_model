const rp = require(`request-promise`)
const cheerio = require(`cheerio`)
const { MongoClient } = require(`mongodb`)
MongoClient.connect(`mongodb://127.0.0.1/BDS1`).then(db => {
    run(db, 2,'ban-nha-rieng')
}).catch(console.log)
function run(db,page,type){
    console.log(`running ${page}`)
    getPage(page,type).then(links=>{
        links.forEach(link => {
            getDetail(link).then(result=>{
                db.collection(`abc`).insert(result)
            }).catch(console.log)
        })
        setTimeout(()=>{
            run(db,page+1,type)
        },6*1000)
    }).catch(console.log)
}

function getPage(page=2, type='ban-nha-rieng') {
    return new Promise((resolve, reject) => {
        rp({
            url: `http://batdongsan.vn/giao-dich/${type}/pageindex-${page}.html`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'ASP.NET_SessionId=erwi34f2bokdcc4haocfcovh; _ga=GA1.2.212544303.1580913896; _gid=GA1.2.590322362.1580913896; __tawkuuid=e::batdongsan.vn::gFs9/fz1yvf7aM55Pa4JvKZpvuZ8g39JXqrc3uBitOZ6TcndwazwKgzU9Hn7ToTm::2; __gads=ID=06c9dc31e6808e53:T=1580913974:S=ALNI_MbcX6Nr95FY9tpGXubvE3xQZdPT7A; TawkConnectionTime=0'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const links = []
            $('.Product_List ').each((index, item) => {
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
            url: `http://batdongsan.vn${link}`,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                cookie: 'ASP.NET_SessionId=erwi34f2bokdcc4haocfcovh; _ga=GA1.2.212544303.1580913896; _gid=GA1.2.590322362.1580913896; __tawkuuid=e::batdongsan.vn::gFs9/fz1yvf7aM55Pa4JvKZpvuZ8g39JXqrc3uBitOZ6TcndwazwKgzU9Hn7ToTm::2; __gads=ID=06c9dc31e6808e53:T=1580913974:S=ALNI_MbcX6Nr95FY9tpGXubvE3xQZdPT7A; _gat=1; TawkConnectionTime=0'
            }
        }).then(body => {
            const $ = cheerio.load(body)
            const arr = []

            $('#gioithieu').each(function (index) {
                const ti = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.Product_List.detail-warp-product > div > div.P_Title1.hidden-xs > h1').text())
                const add = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div:nth-child(5) > span').text())
                const price = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div:nth-child(6) > span > span').text())
                const area = cutStr(body,"<span class='product-area'>","</span>")
                const news_type = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div:nth-child(2) > span > a').text())
                const huongnha = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.huongnha.showattr3 > span.attributevalue').text())
                const hourse_proj = ''
                const long = ''
                const lat = ''
                const toilet = ''
		const des = remove_text($(item).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Gioithieu.col-md-7.col-md-pull-5').text())
                const duongvao = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.duongvaom.showattr2 > span.attributevalue').text())
                const mattien = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.mattienm.showattr1 > span.attributevalue').text())
                const sotang = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.sotang.showattr5 > span.attributevalue').text())
                const huongbc = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.huongbancong.showattr4 > span.attributevalue').text())
                const phaply = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.phaply.showattr10 > span.attributevalue').text())
                const bed = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.sophongngu.showattr6 > span.attributevalue').text())
                const bath = remove_text($(this).find('#Home1_ctl33_viewdetailproduct > div > div.row > div.PD_Thongso.col-md-5.col-md-push-7 > div > div.details-warp-item-attribute > ul > li.sophongtam.showattr7 > span.attributevalue').text())
                const noithat = remove_text($(this).find('.itemvalue').text())
                const obj = {
                    title: ti,
                    address: add,
                    price: price,
                    area: area.replace('m²',''),
                    description: des,
                    housing_type: news_type,
                    huong_nha: huongnha,
                    hourse_project: hourse_proj,
                    can_goc: '',
                    so_tang: sotang,
                    mat_tien: mattien,
                    duong_vao: duongvao,
                    longitude: long,
                    latitude: lat,
                    bedroom: bed,
                    bathroom: bath,
                    toilet: toilet,
                    huong_ban_cong: huongbc,
                    noi_that: noithat,
                    quy_mo: '',
                    phaply: phaply,
                    chieu_ngang: '',
                    chieu_dai: ''
                };
                resolve(obj)
            })
        }).catch(error => {
            reject(error)
        })
    })
}
function cutStr(str, start, end){
  const startPos = str.indexOf(start);
  if(startPos >= 0){
      let temp = str.slice(startPos + start.length);
      return temp.slice(0, temp.indexOf(end));
  } else 
      return '';
}