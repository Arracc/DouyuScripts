// ==UserScript==
// @name         礼物红包查询页面
// @namespace    http://tampermonkey.net/
// @version      0.1
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


//  https://www.douyu.com/japi/interactnc/web/propredpacket/grab_prp  

// 剩余需要刷新的项
let remainItem = [];
let noLimitLength;
let fansLimitLength;
let notificationFlag = false;
let notificationSendedFlag = false;
let switchFlag = false;
let powerStatus;
let reloadTime = 120;
let actualReloadTime;
let intervalFactor = 20000; // 用于计算随机时间的基数
let nowTime;
let startTime;
let concernedList = ["阿冷aleng丶", "即将拥有人鱼线的PDD",
    "女流66", "寅子", "超级小桀", "波波菜呀", "盖世猪猪丶", "百里浪丶", "主播秋山澪丶", "狐狸酱大魔王",
    "yyfyyf", "Zhou陈尧",
    "旭旭宝宝", "一阵雨不是一阵奶", "一笑zy",
    "As童话话话", "雨神丶", "剑灵丶信仰",
    "呆妹儿小霸王", "一条小团团OvO", "轻语丶619",
    "白菜mm丶", "程心曲", "睡懵的小七",
    "秀秀呢", "乔妹eve", "王筱沫丶", "小深深儿", "米儿啊i",
    "橙味沙士", "王羽杉Barbieshy", "纳豆nado", "菠萝赛东",];


// 桌面通知组件
function notify(str) {
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

// 计算随机数组件
function getRandomInterval() {
    let sign = Math.random() > 0.5 ? 1 : -1;
    let interval = Math.random() * intervalFactor * sign; // 生成正负随机数
    console.info("生成的随机时间是：" + interval / 1000 + "秒");
    return Math.round(interval / 1000);
}

// 运行开关
switchPower = function (e) {
    let btn = $(e).text();
    if (btn == "开始" || btn == "停止") {
        if (btn == "开始") {
            console.info("切换开关为运行");
            switchFlag = true;
        } else if (btn == "停止") {
            console.info("切换开关为停止");
            switchFlag = false;
        }
        powerStatus = btn;
        $("span#powerStatus").text(powerStatus);
    }
}

// 修改刷新时间
modifyReloadTime = function () {
    let newReloadTime = $("input#newReloadTime").val();
    if (reloadTime != newReloadTime) {
        reloadTime = parseInt(newReloadTime);
        actualReloadTime = parseInt(newReloadTime) + getRandomInterval();
        $("span#reloadTime").text(newReloadTime);
        $("span#actualReloadTime").text(actualReloadTime);
        nowTime = 999;
    }
}

// 判断逻辑
function judge() {
    if (actualReloadTime - nowTime > 0) { // 无论运行与否，在本轮数据刷新周期内，都要完成本地倒计时更新
        // 更新倒计时
        if (remainItem.length > 0) {
            console.info("更新倒计时，当前持续时间为：" + nowTime + "秒");
            asyncWait(modifyTime);
        } else {
            // 没有待更新倒计时，等待时间结束请求新数据
            console.info("没有待更新倒计时，当前持续时间为：" + nowTime + "秒");
            asyncWait(judge);
        }
    } else {
        if (switchFlag) {
            console.info("当前持续时间为：" + nowTime + "，预设刷新时间为：" + actualReloadTime + "，即将刷新");
            // 重置全局参数
            remainItem = []; //清空全局倒计时剩余项
            notificationFlag = false;
            notificationSendedFlag = false;
            notificationBody = "";
            // 重新计算实际刷新时间
            actualReloadTime = reloadTime + getRandomInterval();
            $("span#actualReloadTime").text(actualReloadTime);
            // 清空上次挂载的节点
            $("div#root").empty();
            getDate();
        } else {
            // 停止自动刷新，维持监听
            console.info("停止刷新，当前持续时间为：" + nowTime + "秒");
            asyncWait(judge);
        }
    }

    // 加入同步等待方法
    async function asyncWait(func) {
        await new Promise(function (resolve, reject) {
            nowTime = nowTime + 1;
            setTimeout(func, 1000);
            resolve(0);
        })
    }
}

// 计算剩余时间组件
function getRemainTime(time) {
    // 从服务器传回的开始时间与本地时间有误差
    // var nowTime = (new Date().getTime() / 1000)-400;
    // console.info("nowTime" + nowTime);
    // console.info("startTime" + startTime);
    // console.info("计算" + (nowTime - startTime));
    // var remainTime = 180 - (nowTime - startTime);
    // 使用cdtime递减计算
    let newRemainTime = time - 1;
    return newRemainTime;
}

// 刷新时间组件
function modifyTime() {
    let arrayIndex;
    // console.info("剩余：" + remainItem.length);
    // 仍在倒计时的项逐个更新时间
    for (let i in remainItem) {
        // 记录remainItem数组中索引i对应的项，即原数组中的索引值，用于按位置更新列表时间
        arrayIndex = remainItem[i];

        // 获取目前开始倒计时字段值
        let remainTime = parseInt($("#time" + arrayIndex).text());
        // console.info("当前位置:" + remainItem[i] + ", 获取到remaintime: " + remainTime);
        let newTime = getRemainTime(remainTime);
        // console.info("当前位置:" + remainItem[i] + ",获取到newtime:" + newTime);

        if (newTime <= 0) {
            // 如果已开始，替换剩余时间值
            newTime = "已开始";
            // 在remainItem数组中找到索引i对应的项，移除
            let j = remainItem.indexOf(arrayIndex);
            // console.info("移除原数组索引号：" + arrayIndex);
            remainItem.splice(j, 1);
        };

        // 更新时间值
        $("#time" + arrayIndex).text(newTime);

        // 如果更新的是无限制第一项，则同步时间到标题
        if (arrayIndex == 0 && noLimitLength > 0) {
            $("title").text("无:" + noLimitLength + "(" + newTime + ") | 粉:" + fansLimitLength);
        }
    };

    // 没有需要更新的时间，停止循环
    // if (remainItem.length > 0) {
    //     setTimeout(modifyTime, 1000);
    // }

    judge(); // 先进入判断逻辑，否则需要在当前函数加入刷新时间判定
}

// 请求数据
function getDate() {
    $.ajax({
        url: "https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=501761",
        type: "GET",
        dataType: "json",
        success: function (data) {
            start(data);
        }
    });
}

function start(ajaxData) {
    nowTime = 0;
    let url = "https://www.douyu.com/";
    let title;
    let notificationBody;
    let jsonStr;
    let jsonArr;
    let length;
    console.info("ajax:" + ajaxData)
    //获取JSON列表数组形式
    if (ajaxData != undefined) {
        jsonArr = ajaxData.data.list;
        length = jsonArr.length;
        console.info("NotFirstTime");
    } else {
        jsonStr = $("pre").text();
        jsonArr = JSON.parse(jsonStr).data.list;
        length = jsonArr.length;
        $("pre").hide();
        console.info("FirstTime");
    }
    console.info(jsonArr);
    $("pre").hide();

    if (length == 0) {
        $("title").text("未发现红包");
        $("div#root").append("<div>暂无直播间开启礼物红包</div>");
    } else {
        // 重新排序，无限制房间在前
        let noLimit = [];
        let fansLimit = [];
        jsonArr.forEach((v, i) => {
            if (v.joinc == 0 || v.joinc == 1) {
                noLimit.push(jsonArr[i]);
            } else {
                fansLimit.push(jsonArr[i]);
            };
        });
        // 统计数量
        noLimitLength = noLimit.length;
        fansLimitLength = fansLimit.length;
        // 合并两项成新数组
        if (noLimitLength != 0) {
            jsonArr = noLimit.concat(fansLimit);
        };
        if (noLimitLength > 0) {
            title = "无:" + noLimitLength + "(" + (noLimit[0].cdtime == 0 ? "已开始" : noLimit[0].cdtime) + ") | 粉:" + fansLimitLength;

        } else {
            title = "无:" + noLimitLength + " | 粉:" + fansLimitLength;
        }
        // 修改标题显示数量
        $("title").text(title);
        // 挂载数据
        jsonArr.forEach((v, i) => {
            // 构建子节点
            let joinc; // 参与条件
            let status; //开始状态
            let nrt;
            let prid; //鱼翅金额
            let yc = v.yc / 100; //鱼翅
            let nn = v.nn; // 名字

            // 判定开始时间
            let remainTime = v.cdtime;
            //remainTime = v.cdtime == 0 ? "已开始" : v.cdtime;
            if (remainTime == 0) {
                //console.info("这里没PUSH：" + i + "剩余时间是：" + v.cdtime);
                remainTime = "已开始";
            } else {
                //console.info("这里PUSH: " + i + "剩余时间是：" + v.cdtime);
                remainItem.push(i);
            };

            // 判定参与条件
            switch (v.joinc) {
                case 0:
                    joinc = "全部水友";
                    break;
                case 1:
                    joinc = "关注";
                    break;
                case 2:
                    joinc = "粉丝团";
                    break;
                case 3:
                    joinc = "关注 + 粉丝团";
                    break;
            };

            // 判定参与状态
            // switch (v.nrt) {
            //     case 0:
            //         nrt = "抢";
            //         break;
            //     case 1:
            //         nrt = "已抢";
            //         break;
            // };

            //添加子节点
            $("#root").append("<div id='" + i + "'></div>");
            if (i == 0 && noLimitLength == 0) {
                $('#' + i).append("<div>======================== 无限制 =========================</div>");
                $('#' + i).append("<div>暂无无限制领取的礼物红包</div>");
                $('#' + i).append("<div>======================= 粉丝团限制 =======================</div>");
            } else if (i == 0 && noLimit.length > 0) {
                $('#' + i).append("<div>======================== 无限制 =========================</div>");
            } else if (i == length - fansLimit.length) {
                $('#' + i).append("<div>======================= 粉丝团限制 =======================</div>");
            } else {
                $('#' + i).append("<div>---------------------------------------------");
            }

            if ((yc == 500 || yc == 2000) && (v.joinc == 0 || v.joinc == 1)) {
                $('#' + i).append("<div><span>礼物红包 <font color='red'>" + yc + "</font> 鱼翅<span></div>");
                if (!notificationFlag) {
                    notificationFlag = true;
                    notificationBody = "发现 " + yc + " 鱼翅的房间";
                }
            } else {
                $('#' + i).append("<div><span>礼物红包 " + yc + " 鱼翅<span></div>");
            };
            if (concernedList.indexOf(nn) > -1) {
                $('#' + i).append("</div><span>" + v.uname + " 在 <font color='red'>" + nn + "</font> 直播间送出<span></div>");
                if (!notificationFlag) {
                    notificationFlag = true;
                    notificationBody = "发现关注名单 " + nn;
                }
            } else {
                $('#' + i).append("</div><span>" + v.uname + " 在 " + nn + " 直播间送出<span></div>");
            }
            $('#' + i).append("<div><span>参与条件：" + joinc + "</div>");
            $('#' + i).append("<div><span>开始倒计时：</span>" + "<span id='time" + i + "'>" + remainTime + "</span> <span><a href=" + url + v.rid + " target='_blank'>" + "抢" + "</a></span></div>");
            $('#' + i).append("<div><span id='startTime" + i + "' hidden>" + v.startTime + "</div>");
            $('#' + i).append("<div><span>nrt: " + v.nrt + " prid: " + v.prid + " ptype: " + v.ptype + " status: " + v.status + "</div>")

            if (i == length - 1 && fansLimitLength == 0) {
                $('#' + i).append("<div>======================= 粉丝团限制 =======================</div>");
                $('#' + i).append("<div>暂无粉丝团限制领取的礼物红包</div>");
            }
        });
    }

    // 检查桌面通知标识
    if (notificationFlag) { // 判断是否需要通知
        if (!notificationSendedFlag) { // 判断是否已发送通知
            notify(notificationBody);
            notificationSendedFlag = true;
        }
    }

    judge(); //完成一次加载，重新判断
}

function init() {
    $("head").append("<title id='title'>列表加载中...</title>");
    // 添加控制栏
    actualReloadTime = reloadTime + getRandomInterval();
    $("body").append("<div id='control_bar'></div>");
    $("div#control_bar").append("<div><button onclick='switchPower(this)'>开始</button>  <button onclick='switchPower(this)'>停止</button></div>");
    $("div#control_bar").append("<span>设置刷新时间</span><span><input id='newReloadTime' type='text' style='width:50px;'/>秒</span><button onclick='modifyReloadTime()'>确定</button>");
    $("div#control_bar").append("<div><span>预设刷新时间: <span id='reloadTime'>" + reloadTime + "</span>秒，<span>实际刷新时间: <span id='actualReloadTime'>" + actualReloadTime + "</span>秒，当前运行状态: <span id='powerStatus'>停止</span></div>");
    // 添加数据展示根节点
    $("body").append("<div id='root'></div>");
}

(function () {
    $(document).ready(function () {
        init();
        start();
    })
})();