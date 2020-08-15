// ==UserScript==
// @name         Get Douyu Red Envelope - modify
// @namespace    http://tampermonkey.net/
// @version      2020.08.04.01
// @description  自动获取Douyu红包
// @author       cc
// @match			*://*.douyu.com/0*
// @match			*://*.douyu.com/1*
// @match			*://*.douyu.com/2*
// @match			*://*.douyu.com/3*
// @match			*://*.douyu.com/4*
// @match			*://*.douyu.com/5*
// @match			*://*.douyu.com/6*
// @match			*://*.douyu.com/7*
// @match			*://*.douyu.com/8*
// @match			*://*.douyu.com/9*
// @match			*://*.douyu.com/topic/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function init_Function(){
    initStyles();
    init_Get_Setting();
    init_Red_Envelope();
    init_Update();
}

function init_Update(){
    check_Update();
}

function init_Get_Setting(){
    get_my_Follow_Room();
    get_init_Red_Envelopes_Gifts(rid);
}

function init_Red_Envelope(){
    init_Red_Envelope_Html();
    init_Get_Red_Envelope();
    init_Red_Envelope_Set();
}

function initStyles() {
	let style = document.createElement("style");
	style.appendChild(document.createTextNode(`
        input[id=red_envelope_function]{visibility:hidden;}.red_envelope_checkbox{width:34px;height:18px;background:#333;display:inline-block;vertical-align:middle;border-radius:50px;position:relative;}.red_envelope_checkbox:before{content:'';position:absolute;top:8px;left:8px;height:2px;width:18px;background:#111;}.red_envelope_checkbox label{display:block;width:16px;height:16px;border-radius:50%;-webkit-transition:all .5s ease;-moz-transition:all .5s ease;-o-transition:all .5s ease;-ms-transition:all .5s ease;transition:all .5s ease;cursor:pointer;position:absolute;top:1px;z-index:1;left:1px;background:#ddd;}.red_envelope_checkbox input[type=checkbox]:checked + label{left:17px;background:#26ca28;}/*    Notice.css*/.noticejs-top{top:0;width:100%!important}.noticejs-top .item{border-radius:0!important;margin:0!important}.noticejs-topRight{top:10px;right:10px}.noticejs-topLeft{top:10px;left:10px}.noticejs-topCenter{top:10px;left:50%;transform:translate(-50%)}.noticejs-middleLeft,.noticejs-middleRight{right:10px;top:50%;transform:translateY(-50%)}.noticejs-middleLeft{left:10px}.noticejs-middleCenter{top:50%;left:50%;transform:translate(-50%,-50%)}.noticejs-bottom{bottom:0;width:100%!important}.noticejs-bottom .item{border-radius:0!important;margin:0!important}.noticejs-bottomRight{bottom:10px;right:10px}.noticejs-bottomLeft{bottom:10px;left:10px}.noticejs-bottomCenter{bottom:10px;left:50%;transform:translate(-50%)}.noticejs{font-family:Helvetica Neue,Helvetica,Arial,sans-serif}.noticejs .item{margin:0 0 10px;border-radius:3px;overflow:hidden}.noticejs .item .close{float:right;font-size:18px;font-weight:700;line-height:1;color:#fff;text-shadow:0 1px 0 #fff;opacity:1;margin-right:7px}.noticejs .item .close:hover{opacity:.5;color:#000}.noticejs .item a{color:#fff;border-bottom:1px dashed #fff}.noticejs .item a,.noticejs .item a:hover{text-decoration:none}.noticejs .success{background-color:#64ce83}.noticejs .success .noticejs-heading{background-color:#3da95c;color:#fff;padding:10px}.noticejs .success .noticejs-body{color:#fff;padding:10px}.noticejs .success .noticejs-body:hover{visibility:visible!important}.noticejs .success .noticejs-content{visibility:visible}.noticejs .info{background-color:#3ea2ff}.noticejs .info .noticejs-heading{background-color:#067cea;color:#fff;padding:10px}.noticejs .info .noticejs-body{color:#fff;padding:10px}.noticejs .info .noticejs-body:hover{visibility:visible!important}.noticejs .info .noticejs-content{visibility:visible}.noticejs .warning{background-color:#ff7f48}.noticejs .warning .noticejs-heading{background-color:#f44e06;color:#fff;padding:10px}.noticejs .warning .noticejs-body{color:#fff;padding:10px}.noticejs .warning .noticejs-body:hover{visibility:visible!important}.noticejs .warning .noticejs-content{visibility:visible}.noticejs .error{background-color:#e74c3c}.noticejs .error .noticejs-heading{background-color:#ba2c1d;color:#fff;padding:10px}.noticejs .error .noticejs-body{color:#fff;padding:10px}.noticejs .error .noticejs-body:hover{visibility:visible!important}.noticejs .error .noticejs-content{visibility:visible}.noticejs .progressbar{width:100%}.noticejs .progressbar .bar{width:1%;height:30px;background-color:#4caf50}.noticejs .success .noticejs-progressbar{width:100%;background-color:#64ce83;margin-top:-1px}.noticejs .success .noticejs-progressbar .noticejs-bar{width:100%;height:5px;background:#3da95c}.noticejs .info .noticejs-progressbar{width:100%;background-color:#3ea2ff;margin-top:-1px}.noticejs .info .noticejs-progressbar .noticejs-bar{width:100%;height:5px;background:#067cea}.noticejs .warning .noticejs-progressbar{width:100%;background-color:#ff7f48;margin-top:-1px}.noticejs .warning .noticejs-progressbar .noticejs-bar{width:100%;height:5px;background:#f44e06}.noticejs .error .noticejs-progressbar{width:100%;background-color:#e74c3c;margin-top:-1px}.noticejs .error .noticejs-progressbar .noticejs-bar{width:100%;height:5px;background:#ba2c1d}@keyframes noticejs-fadeOut{0%{opacity:1}to{opacity:0}}.noticejs-fadeOut{animation-name:noticejs-fadeOut}@keyframes noticejs-modal-in{to{opacity:.3}}@keyframes noticejs-modal-out{to{opacity:0}}.noticejs-rtl .noticejs-heading{direction:rtl}.noticejs-rtl .close{float:left!important;margin-left:7px;margin-right:0!important}.noticejs-rtl .noticejs-content{direction:rtl}.noticejs{position:fixed;z-index:10050;width:320px}.noticejs ::-webkit-scrollbar{width:8px}.noticejs ::-webkit-scrollbar-button{width:8px;height:5px}.noticejs ::-webkit-scrollbar-track{border-radius:10px}.noticejs ::-webkit-scrollbar-thumb{background:hsla(0,0%,100%,.5);border-radius:10px}.noticejs ::-webkit-scrollbar-thumb:hover{background:#fff}.noticejs-modal{position:fixed;width:100%;height:100%;background-color:#000;z-index:10000;opacity:.3;left:0;top:0}.noticejs-modal-open{opacity:0;animation:noticejs-modal-in .3s ease-out}.noticejs-modal-close{animation:noticejs-modal-out .3s ease-out;animation-fill-mode:forwards}
`));
	document.head.appendChild(style);
}

(function() {
    'use strict';
    init();
})();

function init(){
    let intID = setInterval(() => {
        if (typeof(document.getElementsByClassName("BackpackButton")[0]) != "undefined") {
            setTimeout(() => {
                init_Function();
            }, 1500)
            clearInterval(intID);
        }
    }, 1000);
}

var url = document.getElementsByTagName('html')[0].innerHTML;
var urlLen = ("$ROOM.room_id =").length;
var ridPos = url.indexOf('$ROOM.room_id =');
var rid = url.substring(ridPos + urlLen, url.indexOf(';', ridPos + urlLen));
rid = rid.trim();
url = null;
urlLen = null;
ridPos = null;

var curVersion = "2020.08.04.01"
function check_Update() {
	fetch('https://greasyfork.org/zh-CN/scripts/407385',{
		method: 'GET',
		mode: 'cors',
		cache: 'no-store',
		credentials: 'omit',
	}).then(res => {
		return res.text();
	}).then(txt => {
		txt = (new DOMParser()).parseFromString(txt, 'text/html');
		let v = txt.getElementsByClassName("script-show-version")[1];
		if(v != undefined){
			if (v.innerText != curVersion) {
				update_Script(true);
			}
		}
	}).catch(err => {
		console.error('请求失败', err);
	})
}

function update_Script(x){
    let update_message = "";
    update_message += '<a href="https://greasyfork.org/zh-CN/scripts/407385" style="font-size:13px;" target="_blank">【更新】新版本已发布，点击立即我更新插件！</a>';
    if(x == true){
        showMessage(update_message, "warning");
    }
}

function setCookie(cookiename, value){
	let exp = new Date();
	exp.setTime(exp.getTime() + 3*60*60*1000);
	document.cookie = cookiename + "="+ escape (value) + "; path=/; expires=" + exp.toGMTString();
}

function getCookie(cookie_name){
	var allcookies = document.cookie;
	var cookie_pos = allcookies.indexOf(cookie_name);
	// 如果找到了索引，就代表cookie存在，
	// 反之，就说明不存在。
	if (cookie_pos != -1){
	// 把cookie_pos放在值的开始，只要给值加1即可。
		cookie_pos += cookie_name.length + 1;
		var cookie_end = allcookies.indexOf(";", cookie_pos);
		if (cookie_end == -1){
			cookie_end = allcookies.length;
		}
	var value = encodeURIComponent(allcookies.substring(cookie_pos, cookie_end));
	}
	return value;
}

function getCCN() {
	let ret = getCookie("acf_ccn");
	if (ret == null) {
		setCookie("acf_ccn", "1");
		ret = "1";
	}
	return ret;
}

function getUid() {
	let ret = getCookie("acf_uid");
	if (ret == null) {
		setCookie("acf_uid", "1");
		ret = "1";
	}
	return ret;
}

function getNickname() {
	let ret = getCookie("acf_nickname");
	if (ret == null) {
		setCookie("acf_nickname", "1");
		ret = "1";
	}
	return ret;
}

function showMessage(msg, type) {
	// type: success[green] error[red] warning[orange] info[blue]
	new NoticeJs({
		text: msg,
		type: type,
		position: 'bottomRight',
	}).show();
}

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

//验证粉丝牌
async function verifyFans(room_id, level) {
	let ret = false;
	let doc = await fetch('https://www.douyu.com/member/cp/getFansBadgeList',{
		method: 'GET',
		mode: 'no-cors',
		cache: 'default',
		credentials: 'include',
	}).then(res => {
		return res.text();
	}).catch(err => {
		console.log("请求失败!", err);
	})
	doc = (new DOMParser()).parseFromString(doc, 'text/html');
	let a = doc.getElementsByClassName("fans-badge-list")[0].lastElementChild;
	let n = a.children.length;
	for (let i = 0; i < n; i++) {
		let rid = a.children[i].getAttribute("data-fans-room");
		let rlv = a.children[i].getAttribute("data-fans-level");
		if (rid == room_id && rlv >= level) {
			ret = true;
			break;
		} else {
			ret = false;
		}
	}
	return ret;
}

// 获取背包内所有礼物信息(json)，传给回调函数
function get_Bag_Gifts(room_id, callback) {
    fetch('https://www.douyu.com/japi/prop/backpack/web/v1?rid=' + room_id, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'include',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
    }).then(result => {
        return result.json();
    }).then(ret => {
        callback(ret);
    }).catch(err => {
        console.log("请求失败!", err)
    })
}

//初始化关注列表
var my_Follow_Room = [];
function get_my_Follow_Room(){
    fetch('https://www.douyu.com/wgapi/livenc/liveweb/follow/list',{
        method: 'GET',
        mode: 'no-cors',
        cache: 'default',
        credentials: 'include',
    }).then(res => {
        return res.json();
    }).then(ret => {
        if(ret.error == 0){
            let follow_list_length = ret.data.list.length;
            for(let i = 0;i<follow_list_length;i++){
                my_Follow_Room.push(ret.data.list[i].room_id);
            }
        }
        console.log(my_Follow_Room);
    }).catch(err => {
        console.log("请求失败!", err);
    })
}

//初始化背包红包礼物
var red_Envelopes_Gifts = {"办卡":0 , "666":0, "大气":0, "飞机":0, "火箭":0};
function get_init_Red_Envelopes_Gifts(rid){
	get_Bag_Gifts(rid, (ret) => {
	let gift_list_num = ret.data.list.length;
		if (gift_list_num > 0) {
			for (let i = 0; i < gift_list_num; i++) {
				let gift_id = ret.data.list[i].id;
				let gift_count = ret.data.list[i].count;
				if(gift_id == 974){
					red_Envelopes_Gifts["办卡"] += gift_count;
				}else if(gift_id == 978){
					red_Envelopes_Gifts["666"] += gift_count;
				}else if(gift_id == 975){
					red_Envelopes_Gifts["大气"] += gift_count;
				}else if(gift_id == 979){
					red_Envelopes_Gifts["飞机"] += gift_count;
				}else if(gift_id == 981){
					red_Envelopes_Gifts["火箭"] += gift_count;
				}
            }
        }
        console.log("初始化背包红包礼物：" + JSON.stringify(red_Envelopes_Gifts));
	});
}

// function check_user(){
//     verifyFans("5189167", 13).then(r => { //仅记录，无须修改
//         new Promise(resolve => {
//             GM_xmlhttpRequest({
//                 method: "POST",
//                 url: "http://api.bluanr.cn/dyapi/check",
//                 data: 'uid='+getUid()+'&nickname='+getNickname()+'&is_fans='+r,
//                 responseType: "json",
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 },
//                 onload: function(response) {
//                     let ret = response.response;
//                     if(ret.msg == "error"){
//                         var prompt = confirm(`
// 声明
// 1.本作者提供的脚本可能存在有不完善之处，如果在使用中如发现BUG，请及时提交与作者(邮箱：262325005@qq.com)，本作者将尽力修改完善之。
// 2.该脚本是完全开源且免费提供给大家，请勿用于商业用途或是不合法用途。
// 3.该脚本会收集所需要的用户信息，此举为了帮助开发者改进程序为您提供更好的体验，并不会对账户安全造成威胁。
// 同意请“确认”，不同意请“取消”。
// `);
//                         if(prompt == false){
//                             delete_user();
//                             clearInterval(red_Envelope_Status);
//                             document.getElementById("red_envelope_function").checked = false;
//                             showMessage("【警告】请同意声明信息！", "error");
//                         }
//                     }
//                 }
//             });
//         });
//     });
// }

// function delete_user(){
//     new Promise(resolve => {
//         GM_xmlhttpRequest({
//             method: "POST",
//             url: "http://api.bluanr.cn/dyapi/delete",
//             data: 'uid='+getUid(),
//             responseType: "json",
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             onload: function(response) {
//                 let ret = response.response;
//                 if(ret.msg == "error"){
//                     delete_user();
//                 }
//             }
//         });
//     })
// }

// function insert_gift_log(gid, reid, time, nn){
//         new Promise(resolve => {
//         GM_xmlhttpRequest({
//             method: "POST",
//             url: "http://api.bluanr.cn/dyapi/insert_log",
//             data: 'uid='+getUid()+'&gid='+gid+'&rid='+reid+'&gift_time='+time+'&nn='+nn,
//             responseType: "json",
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             onload: function(response) {
//                 let ret = response.response;
//                 if(ret.msg != "success"){
//                     insert_gift_log(gid,reid,time, nn);
//                 }
//             }
//         });
//     })
// }

//抢红包按钮
function init_Red_Envelope_Html(){
    let html = "";
    let a = document.createElement("div");
    html += `<section>
  	             <div class="red_envelope_checkbox" style="margin-bottom: 2px;">
  		             <input type="checkbox" value="1" id="red_envelope_function" />
	  	             <label for="red_envelope_function"></label>
  	             </div>
  	             <span id="red_envelope_text">自动全站抢红包</span>
                 <a href="http://api.bluanr.cn/dyapi/query_log?uid=${getUid()}" id="red_envelope_query" style="display:none;" target="_blank">查询</a>
            </section>`;
    a.innerHTML = html;
    let b = document.getElementsByClassName("PlayerToolbar-Wealth")[0];
    let c = document.getElementById("ex-point");
    if(c == undefined){
        a.style = `float: left;line-height: 30px;`;
        b.insertBefore(a, b.childNodes[0]);
    }else{
        a.style = `float: left;line-height: 30px;margin-left: 8px;`;
        b.insertBefore(a, b.childNodes[2]);
    }
}

// 抢红包初始化设置
function init_Red_Envelope_Set() {
    let ret = localStorage.getItem("Save_Get_Red_Envelope_Status");
	if (ret != null) {
        let retJson = JSON.parse(ret);
        if (retJson.is_Get_Red_Envelope == true) {
            // verifyFans("5189167", 13).then(r => {
            //     if (r == true) {
                    document.getElementById("red_envelope_function").click();
            //     } else {
            //         let data = {
            //             is_Get_Red_Envelope: false
            //         }
            //         localStorage.setItem("Save_Get_Red_Envelope_Status", JSON.stringify(data));
            //         showMessage("本功能需拥有13级歆崽粉丝牌(5189167)才可使用", "error");
            //     }
            // })
        }
	}
}

//保存抢红包状态
function save_Get_Red_Envelope_Status() {
	let is_Get_Red_Envelope = document.getElementById("red_envelope_function").checked;
	let data = {
		is_Get_Red_Envelope: is_Get_Red_Envelope
	}
	localStorage.setItem("Save_Get_Red_Envelope_Status", JSON.stringify(data));
}

let red_Envelope_Status;
let red_Envelope_Arr = [];
//监听抢红包按钮
function init_Get_Red_Envelope() {
    document.getElementById("red_envelope_function").addEventListener("click", function() {
        // 去掉粉丝牌验证和上报用户信息
        // verifyFans("5189167", 13).then(r => {
            // if (r == true) {
                // check_user();
                let ischecked = document.getElementById("red_envelope_function").checked;
                let a = document.getElementById("red_envelope_text");
                let b = document.getElementById("red_envelope_query");
                if (ischecked == true) {
                    // 开始自动抢红包
                    a.style = "display:none;"
                    b.style = "display:inline-block;"
                    red_Envelope_Status = setInterval(() => {
                        get_All_Red_Envelope_List(rid);
                    }, 1100);
                } else{
                    // 停止自动抢红包
                    a.style = "display:inline-block;"
                    b.style = "display:none;"
                    clearInterval(red_Envelope_Status);
                }
                save_Get_Red_Envelope_Status();
            // } else {
            //     document.getElementById("red_envelope_function").checked = false;
            //     showMessage("本功能需拥有13级歆崽粉丝牌(5189167)才可使用", "error");
            // }
        // })
	});
}


//监听全站红包
function get_All_Red_Envelope_List(room_id) {
    fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=" + room_id, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'include',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    }).then(res => {
        return res.json();
    }).then(ret => {
        if (ret.data.list.length > 0) {
            add_To_Get_Red_Envelope_List(ret);
        }
    }).catch(err => {
        console.log("请求失败!", err);
    })
}

//添加到抢红包队列
function add_To_Get_Red_Envelope_List(ret){
    for (let i = 0; i < ret.data.list.length; i++) {
        let joinc = ret.data.list[i].joinc;
        let red_packet_rid = ret.data.list[i].rid;
        let nn = ret.data.list[i].nn;
        let rpid = ret.data.list[i].activityid;
        let offset = red_Envelope_Arr.indexOf(rpid);
        let startTime = ret.data.list[i].startTime;
        let to = Number(startTime) - Math.round(new Date().getTime()/1000);
        to = 1000 * to - 2000;
        if (offset == -1) {
            red_Envelope_Arr.push(ret.data.list[i].activityid);
            if(joinc == 0){
                add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
            }else if(joinc == 1){
                if(my_Follow_Room.indexOf(red_packet_rid)<0){
                    my_Follow_Room.push(ret.data.list[i].rid);
                    let add_follow = new XMLHttpRequest();
                    add_follow.open('POST', 'https://www.douyu.com/wgapi/livenc/liveweb/follow/add', true);
                    add_follow.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                    add_follow.send('rid=' + red_packet_rid + '&ctn=' + getCCN());
                    add_follow.onreadystatechange = function () {
                        if (add_follow.readyState == 4 && add_follow.status == 200) {
                            if(JSON.parse(add_follow.responseText).error == 0){
                                console.log("【关注】==>" + red_packet_rid);
                                check_Follow_Room(red_packet_rid,to);
                            }
                        }};
                }
                add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
            }else if(joinc == 2){
                verifyFans(red_packet_rid, 1).then(r => {
                    if(r==true){
                        add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
                    }
                })
            }else if(joinc == 3){
                verifyFans(red_packet_rid, 1).then(r => {
                    if(r==true){
                        if(my_Follow_Room.indexOf(red_packet_rid)<0){
                            my_Follow_Room.push(ret.data.list[i].rid);
                            let add_follow = new XMLHttpRequest();
                            add_follow.open('POST', 'https://www.douyu.com/wgapi/livenc/liveweb/follow/add', true);
                            add_follow.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                            add_follow.send('rid=' + red_packet_rid + '&ctn=' + getCCN());
                            add_follow.onreadystatechange = function () {
                                if (add_follow.readyState == 4 && add_follow.status == 200) {
                                    if(JSON.parse(add_follow.responseText).error == 0){
                                        console.log("【关注】==>" + red_packet_rid);
                                        check_Follow_Room(red_packet_rid,to);
                                    }
                                }};
                        }
                        add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
                    }
                })
            }
        }
    }
}

function add_Get_Red_Envelope(rpid, reid, to, nn){
    if (to > 0) {
        setTimeout(() => {
            get_Red_Envelope(rpid);
            get_Red_Envelope(rpid);
            get_Red_Envelope(rpid);
            showMessage("【礼物红包】抢红包执行完毕！", "success");
            choose_Gift(reid, nn);
        }, to);
    } else {
        get_Red_Envelope(rpid);
        get_Red_Envelope(rpid);
        get_Red_Envelope(rpid);
        showMessage("【礼物红包】抢红包执行完毕！", "success");
        choose_Gift(reid, nn);
    }
}

//抢红包
function get_Red_Envelope(rpid) {
    fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/grab_prp", {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'include',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'activityid=' + rpid + '&ctn=' + getCCN()
    }).then(res => {
        return res.json();
    }).then((ret) =>{
        if (ret.data.isSuc == 2) {
            get_Red_Envelope(rpid);
        }
    })
}


//选择赠送背包红包礼物
async function choose_Gift(reid, nn){
    await sleep(10000).then(() =>{
        get_Bag_Gifts(reid, (ret) => {
            let red_Envelopes_Gifts_New = {"办卡":0 , "666":0, "大气":0, "飞机":0, "火箭":0};
            let gift_list_num = ret.data.list.length;
            if (gift_list_num > 0) {
                for (let i = 0; i < gift_list_num; i++) {
                    let gift_id = ret.data.list[i].id;
                    let gift_count = ret.data.list[i].count;
                    if(gift_id == 974){
                        red_Envelopes_Gifts_New["办卡"] += gift_count;
                        if(red_Envelopes_Gifts_New["办卡"] > red_Envelopes_Gifts["办卡"]){
                            console.log("Send【办卡】==>" + reid);
                            send_Gift_Bag(974, 1, reid, nn);
                        }
                    }else if(gift_id == 978){
                        red_Envelopes_Gifts_New["666"] += gift_count;
                        if(red_Envelopes_Gifts_New["666"] > red_Envelopes_Gifts["666"]){
                            console.log("Send【666】==>" + reid);
                            send_Gift_Bag(978, 1, reid, nn);
                        }
                    }else if(gift_id == 975){
                        red_Envelopes_Gifts_New["大气"] += gift_count;
                        if(red_Envelopes_Gifts_New["大气"] > red_Envelopes_Gifts["大气"]){
                            console.log("Send【大气】==>" + reid);
                            send_Gift_Bag(975, 1, reid, nn);
                        }
                    }else if(gift_id == 979){
                        red_Envelopes_Gifts_New["飞机"] += gift_count;
                        if(red_Envelopes_Gifts_New["飞机"] > red_Envelopes_Gifts["飞机"]){
                            let t = new Date().getTime();
                            // insert_gift_log(979, reid, t-10000, nn);
                            console.log("【飞机】来自==>" + reid);
                        }
                    }else if(gift_id == 981){
                        red_Envelopes_Gifts_New["火箭"] += gift_count;
                        if(red_Envelopes_Gifts_New["火箭"] > red_Envelopes_Gifts["火箭"]){
                            let t = new Date().getTime();
                            // insert_gift_log(981, reid, t-10000, nn);
                            console.log("【火箭】来自==>" + reid);
                        }
                    }
                }
                red_Envelopes_Gifts = red_Envelopes_Gifts_New;
            }
        });
    });
}

//赠送背包红包礼物
function send_Gift_Bag(gid, count, reid, nn) {
	// 送背包里的东西
	// gid: 268是荧光棒
	// count: 数量
	// rid: 房间号
	return fetch("https://www.douyu.com/japi/prop/donate/mainsite/v1", {
		method: 'POST',
		mode: 'no-cors',
		credentials: 'include',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		body: 'propId=' + gid + '&propCount=' + count + '&roomId=' + reid + '&bizExt=%7B%22yzxq%22%3A%7B%7D%7D'
	}).then(res => {
		return res.json();
	}).then(ret => {
        let d = new Date();
        let t = d.getTime();
        if(gid == 974){
            if(ret.error == 0){
                // insert_gift_log(gid, reid, t-10000, nn);
                red_Envelopes_Gifts["办卡"] -= 1;
            }
            else{console.log("Send【办卡】失败==>" + reid);}
        }else if(gid == 978){
            if(ret.error == 0){
                // insert_gift_log(gid, reid, t-10000, nn);
                red_Envelopes_Gifts["666"] -= 1;
            }
            else{console.log("Send【666】失败==>" + reid);}
        }else if(gid == 975){
            if(ret.error == 0){
                // insert_gift_log(gid, reid, t-10000, nn);
                red_Envelopes_Gifts["大气"] -= 1;
            }
            else{console.log("Send【大气】失败==>" + reid);}
        }
        console.log(d.getHours()+":"+d.getMinutes()+":"+d.getSeconds() + "当前背包红包礼物：" + JSON.stringify(red_Envelopes_Gifts));
    })
}

function check_Follow_Room(reid,to){
    if(to>0){
        setTimeout(() =>{
            check_Red_Envelope_Room(reid);
        },to+15000);
    }else{
        setTimeout(() =>{
            check_Red_Envelope_Room(reid);
        },15000);
    }
}

async function check_Red_Envelope_Room(reid){
    let red_Envelope_Room_Arr = [];
    await fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=" + rid, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'include',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    }).then(res => {
        return res.json();
    }).then(ret => {
        if (ret.data.list.length > 0) {
            for (let i = 0; i < ret.data.list.length; i++) {
                let red_packet_rid = ret.data.list[i].rid;
                if(red_Envelope_Room_Arr.indexOf(red_packet_rid)<0){
                    red_Envelope_Room_Arr.push(red_packet_rid);
                }
            }
        }
    })
    let room_status = red_Envelope_Room_Arr.indexOf(reid);
    let follow_status = my_Follow_Room.indexOf(reid);
    if(room_status == -1){
        delete my_Follow_Room[follow_status];
        rm_Follow_Room(reid);
    }else{
        setTimeout(() =>{
            check_Red_Envelope_Room(reid);
        },30000);
    }
}


function rm_Follow_Room(reid){
    let rm_follow = new XMLHttpRequest();
	rm_follow.open('POST', 'https://www.douyu.com/wgapi/livenc/liveweb/follow/rm', true);
	rm_follow.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	rm_follow.send('rid=' + reid + '&ctn=' + getCCN());
	rm_follow.onreadystatechange = function () {
		if (rm_follow.readyState == 4 && rm_follow.status == 200) {
            if(JSON.parse(rm_follow.responseText).error == 0){
                console.log("【取关】==>" + reid);
            }
	}};
}


(function webpackUniversalModuleDefinition(root,factory){if(typeof exports==='object'&&typeof module==='object')module.exports=factory();else if(typeof define==='function'&&define.amd)define("NoticeJs",[],factory);else if(typeof exports==='object')exports["NoticeJs"]=factory();else root["NoticeJs"]=factory()})(typeof self!=='undefined'?self:this,function(){return(function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports}var module=installedModules[moduleId]={i:moduleId,l:false,exports:{}};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.l=true;return module.exports}__webpack_require__.m=modules;__webpack_require__.c=installedModules;__webpack_require__.d=function(exports,name,getter){if(!__webpack_require__.o(exports,name)){Object.defineProperty(exports,name,{configurable:false,enumerable:true,get:getter})}};__webpack_require__.n=function(module){var getter=module&&module.__esModule?function getDefault(){return module['default']}:function getModuleExports(){return module};__webpack_require__.d(getter,'a',getter);return getter};__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)};__webpack_require__.p="dist/";return __webpack_require__(__webpack_require__.s=2)})([(function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var noticeJsModalClassName=exports.noticeJsModalClassName='noticejs-modal';var closeAnimation=exports.closeAnimation='noticejs-fadeOut';var Defaults=exports.Defaults={title:'',text:'',type:'success',position:'topRight',timeout:30,progressBar:true,closeWith:['button'],animation:null,modal:false,scroll:{maxHeight:300,showOnHover:true},rtl:false,callbacks:{beforeShow:[],onShow:[],afterShow:[],onClose:[],afterClose:[],onClick:[],onHover:[],onTemplate:[]}}}),(function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.appendNoticeJs=exports.addListener=exports.CloseItem=exports.AddModal=undefined;exports.getCallback=getCallback;var _api=__webpack_require__(0);var API=_interopRequireWildcard(_api);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}var options=API.Defaults;function getCallback(ref,eventName){if(ref.callbacks.hasOwnProperty(eventName)){ref.callbacks[eventName].forEach(function(cb){if(typeof cb==='function'){cb.apply(ref)}})}}var AddModal=exports.AddModal=function AddModal(){if(document.getElementsByClassName(API.noticeJsModalClassName).length<=0){var element=document.createElement('div');element.classList.add(API.noticeJsModalClassName);element.classList.add('noticejs-modal-open');document.body.appendChild(element);setTimeout(function(){element.className=API.noticeJsModalClassName},200)}};var CloseItem=exports.CloseItem=function CloseItem(item){getCallback(options,'onClose');if(options.animation!==null&&options.animation.close!==null){item.className+=' '+options.animation.close}setTimeout(function(){item.remove()},200);if(options.modal===true&&document.querySelectorAll("[noticejs-modal='true']").length>=1){document.querySelector('.noticejs-modal').className+=' noticejs-modal-close';setTimeout(function(){document.querySelector('.noticejs-modal').remove()},500)}var position='.'+item.closest('.noticejs').className.replace('noticejs','').trim();setTimeout(function(){if(document.querySelectorAll(position+' .item').length<=0){let p=document.querySelector(position);if(p!=null){p.remove()}}},500)};var addListener=exports.addListener=function addListener(item){if(options.closeWith.includes('button')){item.querySelector('.close').addEventListener('click',function(){CloseItem(item)})}if(options.closeWith.includes('click')){item.style.cursor='pointer';item.addEventListener('click',function(e){if(e.target.className!=='close'){getCallback(options,'onClick');CloseItem(item)}})}else{item.addEventListener('click',function(e){if(e.target.className!=='close'){getCallback(options,'onClick')}})}item.addEventListener('mouseover',function(){getCallback(options,'onHover')})};var appendNoticeJs=exports.appendNoticeJs=function appendNoticeJs(noticeJsHeader,noticeJsBody,noticeJsProgressBar){var target_class='.noticejs-'+options.position;var noticeJsItem=document.createElement('div');noticeJsItem.classList.add('item');noticeJsItem.classList.add(options.type);if(options.rtl===true){noticeJsItem.classList.add('noticejs-rtl')}if(noticeJsHeader&&noticeJsHeader!==''){noticeJsItem.appendChild(noticeJsHeader)}noticeJsItem.appendChild(noticeJsBody);if(noticeJsProgressBar&&noticeJsProgressBar!==''){noticeJsItem.appendChild(noticeJsProgressBar)}if(['top','bottom'].includes(options.position)){document.querySelector(target_class).innerHTML=''}if(options.animation!==null&&options.animation.open!==null){noticeJsItem.className+=' '+options.animation.open}if(options.modal===true){noticeJsItem.setAttribute('noticejs-modal','true');AddModal()}addListener(noticeJsItem,options.closeWith);getCallback(options,'beforeShow');getCallback(options,'onShow');document.querySelector(target_class).appendChild(noticeJsItem);getCallback(options,'afterShow');return noticeJsItem}}),(function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();var _noticejs=__webpack_require__(3);var _noticejs2=_interopRequireDefault(_noticejs);var _api=__webpack_require__(0);var API=_interopRequireWildcard(_api);var _components=__webpack_require__(4);var _helpers=__webpack_require__(1);var helper=_interopRequireWildcard(_helpers);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var NoticeJs=function(){function NoticeJs(){var options=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};_classCallCheck(this,NoticeJs);this.options=Object.assign(API.Defaults,options);this.component=new _components.Components();this.on('beforeShow',this.options.callbacks.beforeShow);this.on('onShow',this.options.callbacks.onShow);this.on('afterShow',this.options.callbacks.afterShow);this.on('onClose',this.options.callbacks.onClose);this.on('afterClose',this.options.callbacks.afterClose);this.on('onClick',this.options.callbacks.onClick);this.on('onHover',this.options.callbacks.onHover);return this}_createClass(NoticeJs,[{key:'show',value:function show(){var container=this.component.createContainer();if(document.querySelector('.noticejs-'+this.options.position)===null){document.body.appendChild(container)}var noticeJsHeader=void 0;var noticeJsBody=void 0;var noticeJsProgressBar=void 0;noticeJsHeader=this.component.createHeader(this.options.title,this.options.closeWith);noticeJsBody=this.component.createBody(this.options.text);if(this.options.progressBar===true){noticeJsProgressBar=this.component.createProgressBar()}var noticeJs=helper.appendNoticeJs(noticeJsHeader,noticeJsBody,noticeJsProgressBar);return noticeJs}},{key:'on',value:function on(eventName){var cb=arguments.length>1&&arguments[1]!==undefined?arguments[1]:function(){};if(typeof cb==='function'&&this.options.callbacks.hasOwnProperty(eventName)){this.options.callbacks[eventName].push(cb)}return this}}]);return NoticeJs}();exports.default=NoticeJs;module.exports=exports['default']}),(function(module,exports){}),(function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.Components=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();var _api=__webpack_require__(0);var API=_interopRequireWildcard(_api);var _helpers=__webpack_require__(1);var helper=_interopRequireWildcard(_helpers);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var options=API.Defaults;var Components=exports.Components=function(){function Components(){_classCallCheck(this,Components)}_createClass(Components,[{key:'createContainer',value:function createContainer(){var element_class='noticejs-'+options.position;var element=document.createElement('div');element.classList.add('noticejs');element.classList.add(element_class);return element}},{key:'createHeader',value:function createHeader(){var element=void 0;if(options.title&&options.title!==''){element=document.createElement('div');element.setAttribute('class','noticejs-heading');element.textContent=options.title}if(options.closeWith.includes('button')){var close=document.createElement('div');close.setAttribute('class','close');close.innerHTML='&times;';if(element){element.appendChild(close)}else{element=close}}return element}},{key:'createBody',value:function createBody(){var element=document.createElement('div');element.setAttribute('class','noticejs-body');var content=document.createElement('div');content.setAttribute('class','noticejs-content');content.innerHTML=options.text;element.appendChild(content);if(options.scroll!==null&&options.scroll.maxHeight!==''){element.style.overflowY='auto';element.style.maxHeight=options.scroll.maxHeight+'px';if(options.scroll.showOnHover===true){element.style.visibility='hidden'}}return element}},{key:'createProgressBar',value:function createProgressBar(){var element=document.createElement('div');element.setAttribute('class','noticejs-progressbar');var bar=document.createElement('div');bar.setAttribute('class','noticejs-bar');element.appendChild(bar);if(options.progressBar===true&&typeof options.timeout!=='boolean'&&options.timeout!==false){var frame=function frame(){if(width<=0){clearInterval(id);var item=element.closest('div.item');if(options.animation!==null&&options.animation.close!==null){item.className=item.className.replace(new RegExp('(?:^|\\s)'+options.animation.open+'(?:\\s|$)'),' ');item.className+=' '+options.animation.close;var close_time=parseInt(options.timeout)+500;setTimeout(function(){helper.CloseItem(item)},close_time)}else{helper.CloseItem(item)}}else{width--;bar.style.width=width+'%'}};var width=100;var id=setInterval(frame,options.timeout)}return element}}]);return Components}()})])});

