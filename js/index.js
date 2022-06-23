/*!
 * Create By 黑魔法科技有限公司
 * https://www.heymofa.com
 *
 * Date: 2018-02-03T18:59Z
 */
(function() {
    if (location.hostname == 'www.kejidalong.com') {
        location.href = 'http://www.cropedit.com'
    }
    var router = window.util.getRouter()
    if (router == 'joinus') {
        var hid = util.getParams().id || 'ce'
        if (hid && hdlist[hid]) {
            var hd = util.render('hiredetail', {
                data: hdlist[hid],
                id: hid
            })
            $('#hdetail').html(hd);
        }
    } else if (router == 'biotech') {
        var hid = util.getParams().id || '2020.06'
        if (hid && newsList[hid]) {
            var hd = util.render('news', {
                data: newsList[hid].list,
                id: hid
            })
            $('#news').html(hd);
        }
    } else if (router === 'events') {
        const list = [{
            title: '公司团建真人CS鏖战',
            time: '2020-06-05'
        }, {
            title: '8月坝上草原之旅',
            time: '2020-08-21'
        }, {
            title: '欢聚一堂、共度佳节',
            time: '2020-09-25'
        }, {
            title: '中国农业科学院生物技术研究所专家访问公司',
            time: '2021-01-14'
        }, {
            title: '中国国际文化交流中心杨宏卫主任一行',
            time: '2021-03-12'
        }, {
            title: '张生学博士获评“2020 年度最佳颖泰人”荣誉称号',
            time: '2021'
        }, {
            title: '葛玉君获评“华邦之星”荣誉称号',
            time: '2021'
        }, {
            title: '绿色创业汇牛从领导一行莅临科稷达隆考察调研',
            time: '2021-04-14'
        }, {
            title: '春光正好 下地干活',
            time: '2021-04-16'
        }, {
            title: '中国科学院微生物研究所吴家和研究员莅临科稷达隆',
            time: '2021-05-12'
        }, {
            title: '科稷达隆众志成城共筑防疫战线',
            time: '2021-07-28'
        }, {
            title: '科稷达隆顺利通过知识产权管理体系认证现场审核',
            time: '2021-07'
        }, {
            title: '颖泰生物:布局种业赛道 引领未来发展',
            time: '2021-10'
        }, {
            title: '金融、产业各界人士齐聚科稷达隆，共话合作与发展',
            time: '2021-11'
        }, {
            title: '知识讲堂:转基因知识介绍',
            time: '2021-12'
        }, {
            title: '颖泰生物:耐除草剂棉花、水稻和玉米三项生物技术产品获得环境释放批文',
            time: '2022-01'
        }]
        let hid = util.getParams().id || list.length
        loadNav(list, hid)
        let hd = util.render('events/' + hid, {
            id: hid
        })
        $('.event-template').html(hd)
    }

    function loadNav(list, index) {
        let hd = util.render('events/nav', {
            list: list,
            index: index
        })
        $('#job-list').html(hd)
    }

    var pathname = location.pathname + location.search

    var t = util.render('header2', {
        router: router,
        changeLanguage: 'http://www.cropedit.com' + pathname
    });
    $('#header').html(t);

    $(document).on('click', '.close-foggy', function() {
        $('.foggy').hide()
    })

    var footer = util.render('footer')
    $('#footer').html(footer)
})()