(function() {
    function parseCookieToObj (str) {
      var obj = {}
      if (str) {
        var t = str.split(';')
        for (var i = t.length - 1; i >= 0; i -= 1) {
          var tmp = t[i].split('=')
          obj[tmp[0].trim()] = tmp[1]
        }
      } else {
        obj = {}
      }
      return obj
    }

    function createCookie (name, value, day) {
      var expires
      if (day) {
        var date = new Date()
        date.setTime(date.getTime() + (day * 24 * 60 * 60 * 1000))
        expires = ';expires=' + date.toGMTString();
      } else {
        expires = ''
      }
      // window.document.cookie = `${name}=${encodeURIComponent(value)}${expires};path=/`
      window.document.cookie = name + '=' + encodeURIComponent(value) + expires + ';path=/';
    }

    function addEnoughSpace (str, leng) {
        if (typeof str !== 'string') {
            return str
        }
        if (str.length < leng) {
            var s = leng - str.length;
            for(var i = 0; i< s; i++) {
                str += '&nbsp;'
            }
            return str;
        }
        return str;
    }

    function amountFilter(num) {
        var num = num + '';
        var temp = num.split('.');
        var data = temp[0];
        var t = data + '';
        var y = t.length % 3;
        var arr = [];
        for(var i = 1; i < Math.ceil(t.length/3); i++) {
            var tmp = t.substr(t.length - 3 * i, 3)
            arr.push(tmp);
        }
        if (y != 0) {
            arr.push(t.substr(0, y))
        } else {
            arr.push(t.substr(0, 3))
        }
        var r = arr.reverse().join(',');
        if (temp[1]) {
            return r + '.' + temp[1];
        }
        return r;
    }

    function readCookie (name) {
      // var nameEQ = `${name}=`
      var nameEQ = name + '=';
      var ca = window.document.cookie.split(';')
      for (var i = 0; i < ca.length; i += 1) {
        var c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
      }
      return null
    }

    function checkLogin() {
        if (readCookie('token')) {
            return true;
        }
        return false;
    }

    function eraseCookie (name) {
      createCookie(name, '', -1)
    }

    function parseJSON2Str (j) {
      var str = ''
      for (var i in j) {
        // str += `${i}=${j[i]}&`
        str += i + '=' + j[i] + '&';
      }
      return str
    }

    function getSplitItem(arr, key) {
        return arr[key];
    }

    function getRouter() {
        var pn = location.pathname;
        var router = getSplitItem(getSplitItem(pn.split('/'), pn.split('/').length - 1).split('.'), 0);
        if (!router) {
            router = 'index'
        }
        return router;
    }

    function isObj(myVar) {
        if (Object.prototype.toString.call(myVar) === '[object Object]') {
            return true
        } else {
            return false
        }
    }

    function isArray(myVar) {
        if (Object.prototype.toString.call(myVar) === '[object Array]') {
            return true
        } else {
            return false
        }
    }

    function isFunc(myVar) {
        if (Object.prototype.toString.call(myVar) === '[object Function]') {
            return true
        } else {
            return false
        }
    }

    function _http(cfg, cb) {
        var token = readCookie('token')
        var userID = readCookie('userID')
        var commonParams = {
          token: token,
          userID: userID
        }
        if (!cfg || !isObj(cfg)) {
            toast('请求参数错误');
        }
        if (!cfg.method) {
            cfg.method = 'POST'
        }
        var baseURI = util.config.baseURI;
        $.ajax({
            type: cfg.method,
            url: baseURI + cfg.url,
            data: parseJSON2Str(_.extend({}, cfg.data, commonParams)),
            success: function (data, status, xhr) {
                var router = getRouter();
                if (data.error.returnCode == 0) {
                    if ($('#imgCode') && $('#imgCode').length) {
                        $('#imgCode').html('')
                    }
                    cb(data);
                } else if (data.error.returnCode == 798) {
                    if (router === 'login') {
                        util.getImgCode('login');   
                    } else if (router === 'signup') {
                        util.getImgCode('register');
                    } else {
                        util.getImgCode('reset_pwd');
                    }
                } else if (data.error.returnCode == 799) {
                    if (router === 'login') {
                        util.getImgCode('login');   
                    } else if (router === 'signup') {
                        util.getImgCode('register');
                    } else {
                        util.getImgCode('reset_pwd');
                    }
                } else if (data.error.returnCode == 10000) {
                    util.logout();
                } else {
                    if ($('#imgCode').length) {
                        $('#imgCode').html('')
                    }
                    util.toast(data.error.returnUserMessage);
                }
            },
            error: function (xhr, type) {
                console.log(xhr, type)
            }
        });
    }

    function loginCbUrl(url) {
        var tmp = url.split('/');
        var t = tmp[tmp.length-1].split('.')[0]
        if ('login' === t || 'signup' === t || 'forget' === t) {
            return false;
        }
        return true;
    }

    function loginProcess(data) {
        var data = data.data;
        createCookie('token',data.token, 7);
        createCookie('userID',data.userID, 7);
        createCookie('userName',data.userName, 7);
        createCookie('authStatus', data.authStatus, 7);
        createCookie('companyName', data.companyName, 7);
        createCookie('department', data.department, 7);
        if (document.referrer && loginCbUrl(document.referrer)) {
            location.href = document.referrer
        } else {
            location.href = '/'
        } 
    }

    function logout() {
        eraseCookie('token');
        eraseCookie('userID');
        eraseCookie('userName');
        eraseCookie('authStatus');
        // 兼容安卓reload时从缓存中获取页面
        var agent = navigator.userAgent;
        var reg = new RegExp('timeStamp=' + '\\d{0,}');  // 正则匹配 time=12342432
        var newUrl = location.href;
        if (location.href.indexOf('timeStamp') > -1) {
            newUrl = newUrl.replace(reg, 'timeStamp=' + (new Date()).getTime());
            location.href = newUrl;
        } else {
            location.href = location.href+'?timeStamp='+((new Date()).getTime());
        }
    }

    

    function dateFilter(d) {
        var t = d * 1000;
        var date = new Date(t);
        return date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日';
    }

    function getDayZero (day) {
        if(day >= 0 && day < 10) {
            day = '0' + day;
        }
        return day;
    }

    function dateFilterMil(d) {
        var t = d * 1000;
        var date = new Date(t);
        return date.getFullYear() + '-' + getDayZero(date.getMonth() + 1) + '-' + getDayZero(date.getDate()) + ' ' + getDayZero(date.getHours()) + ':' + getDayZero(date.getMinutes()) + ':' + getDayZero(date.getSeconds());
    }

    function getParams() {
        var obj = {}
        var s = location.search?location.search.split('?')[1]:'';
        if (s) {
            var arr = s.split('&');
            if (arr.length == 0) {
                return obj;
            }
            for(var i = 0; i < arr.length; i++) {
                var tmp = arr[i].split('=');
                obj[tmp[0]] = tmp[1]
            }
            return obj;
        } else {
            return obj;
        }
    }

    function getDomClass(d) {
        if (d) {
            var ns = d.className;
            var tmp = ns.split(' ');
            var obj = {};
            for (var i = tmp.length - 1; i >= 0; i--) {
                if (tmp[i]) {
                    obj[tmp[i]] = 1;
                }
            }
            return obj;
        }
    }

    var addEvent = (function() {
        if (document.addEventListener) {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                } else {
                    el.addEventListener(type, fn, false);
                }
            };
        } else {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                } else {
                    el.attachEvent('on' + type, function() {
                        return fn.call(el, window.event);
                    });
                }
            };
        }
    })();

    function render(tmpl_name, tmpl_data) {
        if (!render.tmpl_cache) {
            render.tmpl_cache = {};
        }

        if (!render.tmpl_cache[tmpl_name]) {
            var tmpl_dir = '/template';
            var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

            var tmpl_string;
            $.ajax({
                url: tmpl_url,
                method: 'GET',
                dataType: 'html', //** Must add 
                async: false,
                success: function(data) {
                    tmpl_string = data;
                }
            });
            render.tmpl_cache[tmpl_name] = _.template(tmpl_string);
        }

        return render.tmpl_cache[tmpl_name](tmpl_data);
    }

    function toast(msg, s) {
        if (!s) {
            s = 6000;
        }
        var t = this.render('toast', {
            msg: msg
        });
        var div = document.createElement('div');
        div.innerHTML = t;
        document.body.appendChild(div);
        setTimeout(function() {
            document.body.removeChild(div);
        }, s);
    }

    function confirm(title, okcb, cancelcb) {
        if (!title) {
            title = '您确定退出登录吗？';
        }
        var t = this.render('confirm', {
            title: title
        });
        var div = document.createElement('div');
        div.innerHTML = t;
        document.body.appendChild(div);
        div.onclick = function(ev) {
            var ev = ev || window.event;　　　　
            var target = ev.target || ev.srcElement;
            while (target !== div) {
                if (util.getDomClass(target).cancel) {
                    document.body.removeChild(div);
                    if (cancelcb) {
                        cancelcb();
                    }
                    break;
                } else if (util.getDomClass(target).ok) {
                    document.body.removeChild(div);
                    if (okcb) {
                        okcb();
                    }
                    break;
                }
                target = target.parentNode;
            }
        }
    }
    $.fn.visible = function() {
        return this.css('visibility', 'visible');
    };

    $.fn.invisible = function() {
        return this.css('visibility', 'hidden');
    };

    $.fn.visibilityToggle = function() {
        return this.css('visibility', function(i, visibility) {
            return (visibility == 'visible') ? 'hidden' : 'visible';
        });
    };

    // 打开新页面，模拟表单提交，实现post请求（下载文件）
    function postFile (URL, PARAMS) {
        var tempForm = document.createElement('form')
        tempForm.action = window.util.config.baseURI + URL;
        tempForm.target = '_blank';
        tempForm.method = 'post';
        tempForm.style.display = 'none';
        for (var x in PARAMS) {
        var opt = document.createElement('textarea');
        opt.name = x;
        opt.value = PARAMS[x];
        tempForm.appendChild(opt);
        }
        document.body.appendChild(tempForm);
        tempForm.submit();
    }

    function filterTags (tags) {
        if (tags && tags.trim() !== '' && tags.split(',')) {
            // 处理分隔后为空的标签
            tags = tags.split(',')
            var processedTags = []
            var j = 0
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].trim() !== '' && j < 3) {
                    processedTags.push(tags[i])
                    j++
                }
            }
            return processedTags
        } else {
            return []
        }
    }

    function showTime (time) {
        var date = new Date(time)
        var dateArr = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        dateArr = dateArr.join('-')
        return  dateArr
    }

    window.util = {
        config: {
            //baseURIReplace
            testURI: ''
        },
        render: render,
        getSplitItem: getSplitItem,
        getRouter: getRouter,
        getDomClass: getDomClass,
        toast: toast,
        confirm: confirm,
        addEvent: addEvent,
        _http: _http,
        loginProcess: loginProcess,
        logout: logout,
        readCookie: readCookie,
        amountFilter: amountFilter,
        getParams: getParams,
        dateFilter: dateFilter,
        dateFilterMil: dateFilterMil,
        checkLogin: checkLogin,
        postFile: postFile,
        filterTags: filterTags,
        showTime: showTime, 
        addEnoughSpace: addEnoughSpace
    }
})();