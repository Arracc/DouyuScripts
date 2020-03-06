// ==UserScript==
// @name         Douyu全站礼物红包监控
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  try to take over the world!
// @author       You
// @match        https://www.douyu.com/japi/interactnc/web/propredpacket/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant        none
// ==/UserScript==

// {"error":0,"msg":"ok","data":{"list":[{"prid":10,"pric":"https://sta-op.douyucdn.cn/dygev/2019/12/10/29b53d74b6370d80b94b14e4a235c88b.png","rid":7790430,"nn":"苏小妖儿","nrt":2,
// "vsrc":"https://rpic.douyucdn.cn/live-cover/roomCover/cover_update/2019/11/21/e92c8427759f6f1195d268eed97ea561.jpg/dy1","yc":10000,"joinc":2,"cdtime":0,"uname":"gaogaoice","uid":196516865,"uav":"https://apic.douyucdn.cn/upload/avatar_v3/201911/ea25bf372c5e4c34b7ecdc1b08fb0dca_big.jpg","startTime":1576221588,"ptype":2,"status":1,"activityid":1948}]}}

// 礼物红包 X 鱼翅
// A 在 B 直播间送出
// 参与条件：0 1 2 3

// 1.1 增加运行时间，提供运行时间区间外程序待机功能
// 1.2 重做计时器, 使用系统时间计时，避免标签页切换至后台时计时任务延迟
// 1.3 调整数据加载逻辑和UI结构

let remainItem = []; //剩余需要刷新开始倒计时的项
let noLimit = [];
let fansLimit = [];
let noLimitLength = 0;
let fansLimitLength = 0;
let notificationFlag = false; //是否需要通知，在每个获取数据周期展示数据后
let powerFlag = true; //开关状态
let notifyMethod = 'desktop'; //通知方式
let lastActivityId = ''; //上次通知的活动ID
let startTime = 9;
let endTime = 2;
let recoverFlag = true; //标记是否恢复运行，用于控制台输出状态
let startCountTime = Date.parse(new Date()); //本轮倒计时开始的时间，即本地时间毫秒值
let currentTime; //本次逻辑判断/更新时间时本地时间毫秒值
let intervalFactor = 20000; //用于计算随机时间的基数，实际间隔在reloaTime ± intervalFactor之内 题外：该变量需前置声明，才能在let actualReloadTime 中使用
let presetReloadTime = 100;
let actualReloadTime = presetReloadTime + getRandomInterval();
let nextReloadTime = 999; //距离下次获取数据时间
let runningTime; //持续运行时间，距上次获取数据后运行时间 即前两者间消耗的时间
let concernedList = ["即将拥有人鱼线的PDD", /**/ "山东棋王弈哥", /**/ "yyfyyf", "Zhou陈尧",  /**/ "旭旭宝宝", "一笑zy", /**/ "呆妹儿小霸王", /**/ "罗马协会", "刘飞儿faye", "若若IRIS",  /**/
"白鲨AyoM", /**/ "As童话话话", "剑灵丶信仰",   /**/ "丶砍你焉用菜刀", "靓旭", "日月轮回888", /**/ "王者之路乌鸦",  /**/ "白菜mm丶", "程心曲",/**/"王羽杉Barbieshy",/**/ "赵贝贝i",/**/ "baby丶贝贝", "开森的Mia",
"女流66", "百里浪丶", "主播秋山澪丶", "狐狸酱大魔王", "老皮历险记", "龚建ZSMJ",
"睡懵的小七", "DNF黑一阿旭", "一阵雨不是一阵奶", "轻语丶619", "陈死狗cnh",];

let fansBadgeList = ["Dy花老湿", "炸毛张", "落地成狗狗", "雷婷丶", "长沙乡村敢死队", "峰峰三号333", "南曼玉", "秀秀呢", "主播杨树", "小苏菲", "阿冷aleng丶", "雨神丶", "纳豆nado", "一条小团团OvO",
    "TD丶正直博", "不2不叫周淑怡", "寅子", "小深深儿", "妖鹿yolo", "白白的胖胖呀",];

// 桌面通知组件
function desktopNotify(str) {
    // window.onload = function () {
    suportNotify();
    // }

    //判断浏览器是否支持Web Notifications API
    function suportNotify() {
        if (window.Notification) {
            // 支持
            console.log("支持" + "Web Notifications API");
            //如果支持Web Notifications API，再判断浏览器是否支持弹出实例
            showMess();
        } else {
            // 不支持
            alert("不支持 Web Notifications API");
        }
    }
    //判断浏览器是否支持弹出实例
    function showMess() {
        setTimeout(function () {
            console.log('1：' + Notification.permission);
            //如果支持window.Notification 并且 许可不是拒绝状态
            if (window.Notification && Notification.permission !== "denied") {
                //Notification.requestPermission这是一个静态方法，作用就是让浏览器出现是否允许通知的提示
                Notification.requestPermission(function (status) {
                    console.log('2: ' + status);
                    //如果状态是同意
                    if (status === "granted") {
                        var m = new Notification('收到信息', {
                            body: str,　　//消息体内容
                            //icon:"images/img1.jpg"　　//消息图片
                        });
                        m.onclick = function () {//点击当前消息提示框后，跳转到当前页面
                            window.focus();
                        }
                    } else {
                        alert('当前浏览器不支持弹出消息')
                    }
                });
            }
        }, 1000)
    }
}

// TG通知组件
function TGNotify(str) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://api.telegram.org/bot1021196428:AAGAjECHuqehhU4Ccpn2EAemNzZGNdFiqj4/sendMessage?chat_id=-1001419288479&text=" + str, true);
    xmlhttp.send();
}

// 计算随机数组件
function getRandomInterval() {
    let sign = Math.random() > 0.5 ? 1 : -1;
    let interval = Math.random() * intervalFactor * sign; //生成正负随机数
    // console.info("生成的随机时间是：" + interval / 1000 + "秒");
    return Math.round(interval / 1000);
}

// 阻塞等待组件
function sleep(time) {
    return new Promise(function (resolve, reject) {
        runningTime = runningTime + time / 1000;
        setTimeout(resolve, time);
    })
}

// 计时器
function getRunningTime() {
    // currentTime = Date.parse(new Date());
    return ((Date.parse(new Date())) - startCountTime) / 1000;
}

// 切换运行开关
switchPower = function (obj) {
    let btn = obj.innerText;
    if (btn == "桌面通知" || btn == "TG通知" || btn == "停止") {
        if (btn == "桌面通知") {
            console.info("切换开关为桌面通知");
            powerFlag = true;
            notifyMethod = "desktop";
        } else if (btn == "TG通知") {
            console.info("切换开关为TG通知");
            powerFlag = true;
            notifyMethod = "TG";
        } else if (btn == "停止") {
            console.info("切换开关为停止");
            powerFlag = false;
        }
        document.querySelector("span#powerStatus").innerText = btn;
    }
}

// 修改运行时间
modifyRunTime = function () {
    startTime = parseInt(document.querySelector("input#startTime").value);
    endTime = parseInt(document.querySelector("input#endTime").value);
    document.querySelector("span#startTimeSpan").innerText = startTime;
    document.querySelector("span#endTimeSpan").innerText = endTime;
    //修改运行时间后重新判定recoverFlag
}

// 修改刷新时间
modifyReloadTime = function () {
    let newReloadTime = document.querySelector("input#newReloadTime").value;
    if (presetReloadTime != newReloadTime) {
        presetReloadTime = parseInt(newReloadTime);
        actualReloadTime = parseInt(newReloadTime) + getRandomInterval();
        document.querySelector("span#presetReloadTime").innerText = newReloadTime;
        document.querySelector("span#actualReloadTime").innerText = actualReloadTime;
        actualReloadTime = 0;
    }
}

// 刷新
reload = function () {
    actualReloadTime = 0;
}

// 复制房间地址
copyUrl = function (obj) {
    const url = obj.href;
    navigator.clipboard.writeText(url);
}

// 保存关注名单
saveConcernList = function(){
    let list = document.querySelector('input#concernedList').value.split(',');
    localStorage.setItem('concernedList',JSON.stringify(list));

}

// 判断逻辑
async function judge() {
    let currentHours;
    let sleepTime;
    let fn;
    currentTime = new Date().toLocaleString();
    currentHours = new Date().getHours();
    if ((startTime < endTime && (startTime < endTime && currentHours >= startTime && currentHours < endTime)) || (startTime > endTime && (currentHours >= startTime || currentHours < endTime))
        || (currentHours == startTime && currentHours == endTime)) { //判定运行时间区间 开始时间和结束时间在一天内,简单判定;结束时间在第二天,仅用结束时间判定
        if (recoverFlag) {
            recoverFlag = !recoverFlag;
            console.info(currentTime + ", 开始运行");
        }
        runningTime = getRunningTime();
        nextReloadTime = actualReloadTime - runningTime;
        if (nextReloadTime > 0) { //判定距离刷新时间 无论运行与否，在本轮数据刷新周期内，都会完成本地倒计时更新
            document.querySelector("span#nextReloadTime").innerText = nextReloadTime;
            if (remainItem.length > 0) { // 更新倒计时
                // console.info("更新倒计时，当前持续时间为：" + runningTime + "秒");
                sleepTime = 1000;
                fn = modifyTime;
            } else { // 没有待更新倒计时，等待时间结束请求新数据
                // console.info("没有待更新倒计时，当前持续时间为：" + runningTime + "秒");
                sleepTime = 1000;
                fn = judge;
            }
        } else {
            if (powerFlag) {
                console.info(currentTime + "，持续时间为：" + runningTime + "，预设刷新时间为：" + actualReloadTime + "，即将刷新");
                // 重置全局参数
                noLimit = [];
                fansLimit = [];
                noLimitLength = 0;
                fansLimitLength = 0;
                remainItem = []; //清空全局倒计时剩余项
                notificationFlag = false;
                // 重新计算实际刷新时间
                actualReloadTime = presetReloadTime + getRandomInterval();
                document.querySelector("span#actualReloadTime").innerText = actualReloadTime;
                // 清空上次挂载的节点
                document.querySelector("div#noLimitList").innerHTML = '<div><font style="font-weight:bold;">无限制：</font></div>';
                document.querySelector("div#fansLimitList").innerHTML = '<div><font style="font-weight:bold;">粉丝团限制：</font></div>';
                // 获取数据
                sleepTime = 0;
                fn = getDate;
            } else {
                // 停止自动刷新，维持监听
                // console.info("停止刷新，当前持续时间为：" + runningTime + "秒");
                sleepTime = 1000;
                fn = judge;
            }
        }
    } else {
        if (!recoverFlag) {
            recoverFlag = !recoverFlag;
            console.info(currentTime + ", 超出运行时间区间, 暂停运行");
        } else {
            if (nextReloadTime == 0) { //最后一次倒计时结束，挂起刷新倒计时时间
                nextReloadTime = 999;
            }
            console.info("不在运行时间区间，等待启动");
        }
        sleepTime = 60000;
        fn = judge;
    }

    await sleep(sleepTime);
    setTimeout(fn, 0); // setTimeout把下一次轮询放入任务队列，judge函数结束，主线程重新调用任务队列中的函数，避免一直递归栈内存溢出

    // 同步等待  后注：这是async await的错误用法。await必须用在async函数上下文中，await需要接收promise对象，promise对象中需要声明执行结果resolve(返回值)或reject，下例中从主线程移除fn放入异步队列，立即返回resolve，await阻塞解除，失去同步等待效果
    // async function asyncWait(fn, time) {
    //     await new Promise(function (resolve, reject) {
    //         runningTime = runningTime + time / 1000;
    //         setTimeout(fn, time);
    //         resolve(0);
    //     })

    // }
    // async function sleep(time) { await需要用在调用函数之前，才能把主线程阻塞，否则setTimeout不会立即生效，原因不详
    //     await new Promise(function (resolve, reject) {
    //         runningTime = runningTime + time / 1000;
    //         setTimeout(resolve, time);
    //     })
    // }

    // function sleep(time) { 
    //     return new Promise(function (resolve, reject) {
    //         runningTime = runningTime + time / 1000;
    //         setTimeout(resolve, time);
    //     })
    // }
}

// 计时组件
function modifyTime() {
    let activityId;
    let title;
    let timeA = '';
    let timeB = '';

    // 仍在倒计时的项逐个更新时间
    remainItem.forEach((v, i) => {
        activityId = v; //记录当前remainItem数组项的内容，即该项的活动ID
        runningTime = getRunningTime(); //judge()有经过sleep定时刷新，所以在更新单项倒计时时重新获取用掉的时间
        let lastTime = parseInt(document.querySelector('input#cdTime' + activityId).value);
        let cdTime = lastTime - runningTime;
        if (cdTime <= 0) {
            cdTime = '已开始';
            let j = remainItem.indexOf(activityId); //在remainItem数组中找到该项，移除
            remainItem.splice(j, 1);
        }
        document.querySelector("span#cdTime" + activityId).innerText = cdTime; //更新列表中该项的时间值

        //如果更新的是第一项，则同步时间到标题
        if (noLimitLength > 0 && activityId == noLimit[0].activityid) {
            timeA = '(' + cdTime + ')';
        } else if (fansLimitLength > 0 && activityId == fansLimit[0].activityid) {
            timeB = '(' + cdTime + ')';
        }
        if (noLimitLength > 0 && timeA == '') {
            timeA = '(已开始)';
        }
        if (fansLimitLength > 0 && timeB == '') {
            timeB = '(已开始)';
        }
        title = '无:' + noLimitLength + timeA + ' | 粉:' + fansLimitLength + timeB;
    });
    if (title != undefined) {
        document.title = title;
    }

    judge(); // 每次更新后先进入判断逻辑，否则需要在当前函数加入刷新时间判定
}

// 请求数据组件
function getDate() {
    $.ajax({
        url: "https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=501761",
        type: "GET",
        dataType: "json",
        success: function (data) {
            startCountTime = Date.parse(new Date());
            start(data); // 获取到数据再调用start()，如果在start()中发起异步请求，需要面对异步获取数据不及时，同步主线程卡死的问题
        },
        error: async function () {
            console.info('请求程序异常，10秒后重试');
            await sleep(10000);
            getDate();
        }
    });
}

function start(data) {
    runningTime = 0;
    let path = "https://www.douyu.com/";
    let title;
    let notificationBody;
    let jsonObj;
    let jsonArr;
    let length;
    //获取JSON数据列表数组形式
    if (data === undefined) {
        jsonObj = JSON.parse(document.querySelector("pre").innerText);
        document.querySelector("pre").style.display = "none";
    } else {
        jsonObj = data;
    }
    jsonArr = jsonObj.data.list;
    length = jsonArr.length;
    //console.info(jsonArr);

    // if (length == 0) {
    //     document.title = "未发现红包";
    //     let activityElement = document.createElement('div');
    //     activityElement.innerHTML = '<div>暂无直播间开启礼物红包</div>';
    //     document.querySelector('div#activityList').appendChild(activityElement);
    // } else {
    //     // 重新排序，无限制房间在前
    //     let noLimit = [];
    //     let fansLimit = [];
    //     jsonArr.forEach((v, i) => {
    //         if (v.joinc == 0 || v.joinc == 1) {
    //             noLimit.push(jsonArr[i]);
    //         } else {
    //             fansLimit.push(jsonArr[i]);
    //         };
    //     });
    //     // 统计数量
    //     noLimitLength = noLimit.length;
    //     fansLimitLength = fansLimit.length;
    //     // 合并两项成新数组
    //     if (noLimitLength != 0) {
    //         jsonArr = noLimit.concat(fansLimit);
    //     }; // else全部都是fansLimit
    //     if (noLimitLength > 0) {
    //         title = "无:" + noLimitLength + "(" + (noLimit[0].cdtime == 0 ? "已开始" : noLimit[0].cdtime) + ") | 粉:" + fansLimitLength;

    //     } else {
    //         title = "无:" + noLimitLength + " | 粉:" + fansLimitLength;
    //     }
    //     // 修改标题显示数量
    //     document.title = title;
    //     // 挂载数据
    //     jsonArr.forEach((v, i) => {
    //         // 构建子节点
    //         let joinc; //参与条件
    //         let status; //开始状态
    //         let nrt;
    //         let prid; //鱼翅金额
    //         let yc = v.yc / 100; //鱼翅
    //         let nn = v.nn; //名字
    //         let uname = v.uname; //用户名
    //         let cdtime = v.cdtime; //剩余时间
    //         let url = path + v.rid; //房间地址
    //         let activityid = v.activityid; //活动ID

    //         // 判定开始时间
    //         let remainTime = cdtime;
    //         if (remainTime == 0) {
    //             //console.info("这里没PUSH：" + i + "剩余时间是：" + v.cdtime);
    //             remainTime = "已开始";
    //         } else {
    //             //console.info("这里PUSH: " + i + "剩余时间是：" + v.cdtime);
    //             remainItem.push(i);
    //         };

    //         // 判定参与条件
    //         switch (v.joinc) {
    //             case 0:
    //                 joinc = "全部水友";
    //                 break;
    //             case 1:
    //                 joinc = "关注";
    //                 break;
    //             case 2:
    //                 joinc = "粉丝团";
    //                 break;
    //             case 3:
    //                 joinc = "关注 + 粉丝团";
    //                 break;
    //         };

    //         // 添加子节点
    //         let activityElement = document.createElement('div');
    //         activityElement.id = i;
    //         let html = '';
    //         if (i == 0 && noLimitLength == 0) {
    //             // html += '<div>======================== <font style="font-weight:bold;">无限制</font> =========================</div>';
    //             // html += '<div>暂无无限制领取的礼物红包</div>';
    //             html += '<div><font style="font-weight:bold;">无限制：暂无</font></div>';
    //             // html += '<div>======================= <font style="font-weight:bold;">粉丝团限制</font> =======================</div>';
    //             html += '<div>======================================================</div>';
    //             html += '<div><font style="font-weight:bold;">粉丝团限制：</font></div>';
    //         } else if (i == 0 && noLimit.length > 0) {
    //             // html += '<div>======================== <font style="font-weight:bold;">无限制</font> =========================</div>';
    //             html += '<div><font style="font-weight:bold;">无限制：</font></div>';
    //         } else if (i == length - fansLimit.length) {
    //             // html += '<div>======================= <font style="font-weight:bold;">粉丝团限制</font> =======================</div>';
    //             html += '<div>======================================================</div>';
    //             html += '<div><font style="font-weight:bold;">粉丝团限制：</font></div>';
    //         } else {
    //             html += '<div>---------------------------------------------';
    //         }
    //         // 红包金额判定
    //         if ((yc == 500 || yc == 2000) && ((fansBadgeList.indexOf(nn) == -1 && (joinc == '全部水友' || joinc == '关注')) || fansBadgeList.indexOf(nn) > -1)) {
    //             html += '<div><span>礼物红包 <font style="color:red;">' + yc + '</font> 鱼翅<span></div>';
    //             if (!notificationFlag && activityid != lastActivityId) {
    //                 notificationFlag = true;
    //                 notificationBody = '发现&nbsp;' + yc + '&nbsp;鱼翅的房间，房间是&nbsp;' + nn + '，距离开始时间还有&nbsp;' + cdtime + '&nbsp;秒';
    //                 lastActivityId = activityid;
    //             }
    //         } else {
    //             html += '<div><span>礼物红包&nbsp;' + yc + '&nbsp;鱼翅<span></div>';
    //         };
    //         // 收礼人判定
    //         if ((concernedList.indexOf(nn) > -1 && (joinc == '全部水友' || joinc == '关注')) || fansBadgeList.indexOf(nn) > -1) {
    //             html += '</div><span>' + uname + '在 <font style="color:red">' + nn + '</font> 直播间送出<span></div>';
    //             if (!notificationFlag && activityid != lastActivityId) {
    //                 notificationFlag = true;
    //                 notificationBody = '发现关注名单&nbsp;' + nn + ' ，距离开始时间还有&nbsp;' + cdtime + '&nbsp;秒';
    //                 lastActivityId = activityid;
    //             }
    //         } else {
    //             html += '</div><span>' + uname + '&nbsp;在&nbsp;' + nn + '&nbsp;直播间送出<span></div>';
    //         }
    //         html += '<div><span>参与条件:&nbsp;' + joinc + '</div>';
    //         html += '<div><span>开始倒计时:&nbsp;' + '</span>' + '<span id="remainTime' + i + '">' + remainTime + '</span>' + '&nbsp;&nbsp;' + '<span><a href="' + url + '&nbsp;target="_blank">'
    //             + '抢' + '</a></span>' + '&nbsp;&nbsp;' + '<span><a href="' + url + '"' + '&nbsp;onclick="copyUrl(this);return false;">' + "复制" + '</a></span></div>';
    //         html += '<div><input id="cdTime' + i + '"value="' + cdtime + '"hidden/></div>';
    //         if (i == length - 1 && fansLimitLength == 0) {
    //             // html += '<div>======================= <font style="font-weight:bold;">粉丝团限制</font> =======================</div>';
    //             // html += '<div>暂无粉丝团限制领取的礼物红包</div>';
    //             html += '<div>======================================================</div>';
    //             html += '<div><font style="font-weight:bold;">粉丝团限制：暂无</font></div>';
    //         }
    //         activityElement.innerHTML = html;
    //         document.querySelector('div#activityList').appendChild(activityElement);
    //     });
    // }

    // 挂载数据
    jsonArr.forEach((v, i) => {
        // 构建子节点
        let joinc; //参与条件
        let status; //开始状态
        let nrt;
        let prid; //鱼翅金额
        let yc = v.yc / 100; //鱼翅
        let nn = v.nn; //名字
        let uname = v.uname; //用户名
        let cdTime = v.cdtime; //剩余时间
        let url = path + v.rid; //房间地址
        let activityId = v.activityid; //活动ID

        // 判定参与条件
        switch (v.joinc) {
            case 0:
                joinc = '全部水友';
                break;
            case 1:
                joinc = '关注';
                break;
            case 2:
                joinc = '粉丝团';
                break;
            case 3:
                joinc = '关注 + 粉丝团';
                break;
        };

        // 判定开始时间
        if (cdTime == 0) {
            cdTime = '已开始';
        } else {
            //console.info("这里PUSH: " + i + "剩余时间是：" + v.cdtime);
            // remainItem.push(i); //存入的是在json数组中的索引，在每一项的div中记为id 
            remainItem.push(activityId); //改为记录该项活动ID
        };

        // 添加子节点
        let activityElement = document.createElement('div');
        activityElement.id = activityId;
        let html = '';
        // 红包金额判定
        if ((yc == 500 || yc == 2000) && ((fansBadgeList.indexOf(nn) == -1 && (joinc == '全部水友' || joinc == '关注')) || fansBadgeList.indexOf(nn) > -1)) {
            html += '<div><span>礼物红包 <font style="color:red;">' + yc + '</font> 鱼翅<span></div>';
            if (!notificationFlag && activityId != lastActivityId) {
                notificationFlag = true;
                notificationBody = '发现 ' + yc + ' 鱼翅的房间，房间是 ' + nn + '，距离开始时间还有 ' + cdTime + ' 秒';
                lastActivityId = activityId;
            }
        } else {
            html += '<div><span>礼物红包&nbsp;' + yc + '&nbsp;鱼翅<span></div>';
        };
        // 收礼人判定
        if ((concernedList.indexOf(nn) > -1 && (joinc == '全部水友' || joinc == '关注')) || fansBadgeList.indexOf(nn) > -1) {
            html += '</div><span>' + uname + '在 <font style="color:red">' + nn + '</font> 直播间送出<span></div>';
            if (!notificationFlag && activityId != lastActivityId) {
                notificationFlag = true;
                notificationBody = '发现关注名单 ' + nn + ' ，距离开始时间还有 ' + cdTime + ' 秒';
                lastActivityId = activityId;
            }
        } else {
            html += '</div><span>' + uname + '&nbsp;在&nbsp;' + nn + '&nbsp;直播间送出<span></div>';
        }
        html += '<div><span>参与条件：' + joinc + '</div>';
        html += '<div><span>开始倒计时：' + '</span>' + '<span id="cdTime' + activityId + '">' + cdTime + '</span>' + '&nbsp;&nbsp;' + '<span><a href="' + url + '&nbsp;target="_blank">'
            + '抢' + '</a></span>' + '&nbsp;&nbsp;' + '<span><a href="' + url + '"' + ' onclick="copyUrl(this);return false;">' + "复制" + '</a></span></div>';
        html += '<div><input id="cdTime' + activityId + '" value="' + cdTime + '" hidden/></div>';
        html += '<br/>';
        activityElement.innerHTML = html;
        if (joinc == '全部水友' || joinc == '关注') {
            document.querySelector('div#noLimitList').appendChild(activityElement);
            noLimit.push(v);
            noLimitLength = noLimit.length;
        } else {
            document.querySelector('div#fansLimitList').appendChild(activityElement);
            fansLimit.push(v);
            fansLimitLength = fansLimit.length;
        }
    });

    // 修改标题显示数量
    if (noLimitLength == 0 && fansLimitLength == 0) {
        document.querySelector('div#noLimitList').innerHTML = '<div><font style="font-weight:bold;">无限制：暂无</font></div>';
        document.querySelector('div#fansLimitList').innerHTML = '<div><font style="font-weight:bold;">粉丝团限制：暂无</font></div>';
        title = '未发现红包';
    } else if (noLimitLength == 0 && fansLimitLength != 0) {
        document.querySelector('div#noLimitList').innerHTML = '<div><font style="font-weight:bold;">无限制：暂无</font></div>';
        title = '无:0 | 粉:' + fansLimitLength + '(' + (fansLimit[0].cdtime == 0 ? '已开始' : fansLimit[0].cdtime) + ')';
    } else if (noLimitLength != 0 && fansLimitLength == 0) {
        document.querySelector('div#fansLimitList').innerHTML = '<div><font style="font-weight:bold;">粉丝团限制：暂无</font></div>';
        title = '无:' + noLimitLength + '(' + (noLimit[0].cdtime == 0 ? '已开始' : noLimit[0].cdtime) + ') | 粉：0)';
    } else {
        title = '无:' + noLimitLength + '(' + (noLimit[0].cdtime == 0 ? '已开始' : noLimit[0].cdtime) + ') | 粉:'
            + fansLimitLength + '(' + (fansLimit[0].cdtime == 0 ? '已开始' : fansLimit[0].cdtime) + ')';
    }
    document.title = title;

    // 检查通知标识
    if (notificationFlag) { // 判断是否有通知事件
        if (notifyMethod == 'desktop') {
            desktopNotify(notificationBody);
        } else if (notifyMethod == 'TG') {
            TGNotify(notificationBody);
        }
    }

    judge(); //完成一次加载，重新判断
}

function initControlPanel() {
    // 添加标题
    // document.getElementsByTagName('head')[0].append('<title id="title">列表加载中...</title>'); 添加的是字符串文本
    let titleElement = document.createElement('title');
    titleElement.id = 'title';
    titleElement.innerHTML = '列表加载中...';
    document.getElementsByTagName('head')[0].appendChild(titleElement);

    // 添加控制栏
    let controlBarElement = document.createElement('div');
    controlBarElement.id = 'controlBar';
    let html = '';
    html += '<div id="control_bar"></div>';
    html += '<div><span>开关：</span><button onclick="switchPower(this)">桌面通知</button>&nbsp;<button onclick="switchPower(this)">TG通知</button>&nbsp;<button onclick="switchPower(this)">停止</button></div>';
    html += '<div><span>当前运行状态：<span id="powerStatus">桌面通知</span></span></div>';
    html += '<div><span>当前运行时间：<span id="startTimeSpan">' + startTime + '</span>&nbsp;-&nbsp;<span id="endTimeSpan">' + endTime
        + '</span></span>,&nbsp;<span>设置运行时间:</span>&nbsp;<input id="startTime" style="width:50px;">&nbsp;-&nbsp;<input id="endTime" style="width:50px;">&nbsp;<button onclick="modifyRunTime()">确定</button></div>';
    html += '<div><span>设置刷新时间：</span><span><input id="newReloadTime" type="text" style="width:50px;"/>&nbsp;秒</span>&nbsp;<button onclick="modifyReloadTime()">确定</button>&nbsp;<button onclick="reload()">刷新</button></div>';
    html += '<div><span>预设刷新时间：<span id="presetReloadTime">' + presetReloadTime + '</span>秒，</span><span>实际刷新时间：<span id="actualReloadTime">'
        + actualReloadTime + '</span>秒，<span>下次刷新时间：<span id="nextReloadTime">' + nextReloadTime + '</span>秒</div>';
    html += '<div><span>关注名单：</span><input id="concernedList" value="' + concernedList + '" style="width:600px;">&nbsp;&nbsp;<button onclick="saveConcernList()">确定</button></dive>(使用英文标点逗号,分开)';
    html += '<div><span>粉丝团名单：</span><input id="fansBadgeList" value="' + fansBadgeList + '" style="width:600px;">&nbsp;&nbsp;<button>确定</button>';
    html += '<div>======================================================</div>';
    controlBarElement.innerHTML = html;
    document.querySelector('body').appendChild(controlBarElement);
}

function initActivityList() {
    let activityListElement = document.createElement('div');
    activityListElement.id = 'activityList';
    let noLimitListElement = document.createElement('div');
    noLimitListElement.id = 'noLimitList';
    noLimitListElement.innerHTML = '<div><font style="font-weight:bold;">无限制：</font></div>';
    let fansLimitListElement = document.createElement('div');
    fansLimitListElement.id = 'fansLimitList';
    fansLimitListElement.innerHTML = '<div><font style="font-weight:bold;">粉丝团限制：</font></div>';
    let separatorElement = document.createElement('div');
    separatorElement.innerHTML = '======================================================';
    activityListElement.appendChild(noLimitListElement);
    activityListElement.appendChild(separatorElement);
    activityListElement.appendChild(fansLimitListElement);
    document.querySelector('body').appendChild(activityListElement);
}

function initConcernedList(){
    concernedList = JSON.parse(localStorage.getItem('concernedList'));
    concernedList = concernedList == null ? [] : concernedList;
    document.querySelector('input#concernedList').value = concernedList;
}

function initFansBadgeList(){
    fansBadgeList = JSON.parse(localStorage.getItem('fansBadgeList'));
    fansBadgeList = fansBadgeList == null ? [] : fansBadgeList;
    document.querySelector('input#fansBadgeList').value = fansBadgeList;
}

(function () {
    $(document).ready(function () {
        initControlPanel();
        initActivityList();
        // initConcernedList();
        // initFansBadgeList();
        start();
    })
})();