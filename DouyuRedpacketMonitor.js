// ==UserScript==
// @name         Douyu全站礼物红包监控
// @namespace    http://tampermonkey.net/
// @version      1.7.0
// @description  try to take over the world!
// @author       You
// @match        https://www.douyu.com/japi/interactnc/web/propredpacket/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant        none
// ==/UserScript==

// 1.1.0 增加运行时间，提供运行时间区间外程序待机功能
// 1.2.0 重做计时器, 使用系统时间计时，避免标签页切换至后台时计时任务延迟
// 1.3.0 调整数据加载逻辑和UI结构
// 1.4.0 为标题内容筛选有用信息，标题倒计时同步粉丝团限制项只显示可参与活动的时间，不可参与的活动无需关注
// 1.5.0 修复获取数据失败后没有正常轮询及回归的问题；新增网络故障通知
// 1.6.0 新增红包历史记录功能，记录周期为当月（500鱼翅以上）
// 1.7.0 新增在线获取粉丝徽章名单功能，无法在线获取时（无痕模式）则从本地获取，首次使用且无法在线获取时需要手动提交名单保存
// 1.8.0 替换异步请求方式，隐藏COOKIE，合并在线/离线/匿名模式；整合自动抢红包功能，当月所有红包信息，礼物处理方式将被记录。

let loginState; //登陆状态
let remainItem = new Map();
let noLimit = [];
let fansLimit = [];
let fansLimitAvailable = [];
let notificationFlag = false; //通知标记，在每个获取数据周期展示数据后
let switchFlag = true; //开关标记
let notifyMethod = 'desktop'; //通知方式
let notifyAmount = 500;
let notifiedActivityIds = []; //所有已通知的活动ID
let syncActivityId = ''; //本周期内更新时间时可以参与且需要同步到标题的粉丝团活动的活动ID
let telegramBotToken = ''; //TG Bot Token
let startTime = 9;
let endTime = 1;
let powerFlag = true; //运行状态标记，用于控制台输出状态 true:正在运行 false:暂停运行
let startCountTime = Date.parse(new Date()); //本轮倒计时开始的时间，即本地时间毫秒值
let currentTime; //本次逻辑判断/更新时间时本地时间毫秒值
let intervalFactor = 20000; //用于计算随机时间的基数，实际间隔在reloaTime ± intervalFactor之内 题外：该变量需前置声明，才能在let actualReloadTime 中使用
let presetReloadTime = 100;
let actualReloadTime = 999;
let nextReloadTime = 999; //距离下次获取数据时间
let runningTime = 0; //持续运行时间，距上次获取数据后运行时间 即前两者间消耗的时间
let interruptionFlag = false; //网络故障标记
let retryTimes = 0; //故障重连次数
let offsetTime = 2000; //系统时间修正

let followListInited = false;
let fansBadgeListInited = false;
let followList = [];
let fansBadgeList = [];
let records = '';

//登录状态和cookie可用性检查
function loginStateCheck() {
    let cookies = decodeURIComponent(document.cookie);
    if (cookies.indexOf('acf_uid') == -1) {
        loginState = false;
    } else {
        loginState = true;
    }
}

//数据初始化
function initData() {
    telegramBotToken = (localTelegramBotToken = localStorage.getItem('telegramBotToken')) == null ? '' : localTelegramBotToken;

    // presetReloadTime = loginState ? 300 : 100;
    actualReloadTime = presetReloadTime + getRandomInterval();

    // 初始化关注名单，要获取分页
    // if (loginState) {
    //     let totalPage = 1;
    //     let n = 0; //处理响应次数
    //     let xhr = new XMLHttpRequest();
    //     xhr.open('GET', 'https://www.douyu.com/room/follow', true);
    //     xhr.send();
    //     xhr.onreadystatechange = function () {
    //         if (xhr.readyState == 4 && xhr.status == 200) {
    //             let response = xhr.responseText;
    //             let htmlElement = document.createElement('div');
    //             htmlElement.innerHTML = response;
    //             let nodes = htmlElement.getElementsByTagName('span');
    //             for (let node of nodes) {
    //                 if (node.getAttribute('class') == 'username') {
    //                     followList.push(node.innerText);
    //                 } else if (node.getAttribute('id') == 'totalRecords') {
    //                     // 获取页码
    //                     totalPage = node.innerText.replace(/[^0-9]/ig, "");
    //                 }
    //             }
    //             n += 1;
    //             // 多页
    //             if (totalPage > 1) {
    //                 for (let page = 2; page <= totalPage; page++) {
    //                     let xhr = new XMLHttpRequest();
    //                     xhr.open('GET', 'https://www.douyu.com/room/follow?page=' + page, true);
    //                     xhr.send();
    //                     xhr.onreadystatechange = function () {
    //                         if (xhr.readyState == 4 && xhr.status == 200) {
    //                             let response = xhr.responseText;
    //                             let htmlElement = document.createElement('div');
    //                             htmlElement.innerHTML = response;
    //                             let nodes = htmlElement.getElementsByTagName('span');
    //                             for (let node of nodes) {
    //                                 if (node.getAttribute('class') == 'username') {
    //                                     followList.push(node.innerText);
    //                                 }
    //                             }
    //                             n += 1;
    //                             if (n == totalPage) {
    //                                 localStorage.setItem('followList', JSON.stringify(followList));
    //                                 followListInited = true;
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             if (n == totalPage) {
    //                 localStorage.setItem('followList', JSON.stringify(followList));
    //                 followListInited = true;
    //             }
    //         }
    //     }
    // } else {
    //     followList = (localFollowList = JSON.parse(localStorage.getItem('followList'))) == null ? [] : localFollowList;
    //     followListInited = true;
    // }

    followList = (localFollowList = JSON.parse(localStorage.getItem('followList'))) == null ? [] : localFollowList;
    followListInited = true;

    //初始化粉丝徽章名单，每次启动先在线获取名单，获取不到则读取本地，本地读取不到则为空
    if (loginState) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://www.douyu.com/member/cp/getFansBadgeList', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let response = xhr.responseText;
                let htmlElement = document.createElement('div');
                htmlElement.innerHTML = response;
                let nodes = htmlElement.getElementsByTagName('a');
                for (let node of nodes) {
                    if (node.getAttribute('class') == 'anchor--name') {
                        fansBadgeList.push(node.innerText);
                    }
                }
                localStorage.setItem('fansBadgeList', JSON.stringify(fansBadgeList));
                fansBadgeListInited = true;
            }
        }
    } else {
        fansBadgeList = ((loacalFansBadgeList = JSON.parse(localStorage.getItem('fansBadgeList'))) == null ? [] : loacalFansBadgeList);
        fansBadgeListInited = true;
    }

    //初始化历史记录数据
    records = loadRecords();

    //当月初无记录，清空之前记录
    if (records == '') {
        let month = (month_ = new Date().getMonth() + 1) == 1 ? 13 : month_;
        for (let i = 1; i < month; i++) {
            localStorage.removeItem(("0" + i).slice(-2) + '.records')
        }
    }
}

//读取记录
function loadRecords() {
    return (records_ = localStorage.getItem(("0" + (new Date().getMonth() + 1)).slice(-2) + '.records')) == null ? '' : records_;
}

function initControlPanel() {
    //添加标题
    // ocument.getElementsByTagName('head')[0].append('<title id="title">列表加载中...</title>'); 添加的是字符串文本
    let titleElement = document.createElement('title');
    titleElement.id = 'title';
    titleElement.innerHTML = '列表加载中...';
    document.getElementsByTagName('head')[0].appendChild(titleElement);

    //添加控制栏
    let controlModuleElement = document.createElement('div');
    controlModuleElement.id = 'controlModule';
    let html = '';
    html += '<div style="height:25px;"><span>TelegramBot令牌：<input id="telegramBotToken" value=' + telegramBotToken + '></input></span>&nbsp;<a href="javascript:void(0)" onclick="setTelegramBotToken()" style="text-decoration:none;">确定</a>&nbsp;<span>(如不清楚TelegramBot用法请不要使用TG通知)</span></div>';
    html += '<div style="height:25px;"><span>登录状态：' + (loginState ? '在线' : '离线/匿名') + '</span></div>';
    html += '<div style="height:25px;"><span style="display:inline-block;width:180px;">运行状态：<span id="powerStatus" style="width:200px">桌面通知</span></span><span>开关：</span><a href="javascript:void(0)" onclick="switchPower(this)" style="text-decoration:none;">桌面通知</a>&nbsp;<a href="javascript:void(0)" onclick="switchPower(this)" style="text-decoration:none;">TG通知</a>&nbsp;|&nbsp;<a href="javascript:void(0)" onclick="switchPower(this)" style="text-decoration:none;">停止</a></div>';
    html += '<div style="height:25px;"><span style="display:inline-block;width:180px;">运行时间：<span id="startTimeSpan">' + startTime + '</span>点&nbsp;-&nbsp;<span id="endTimeSpan">' + endTime + '</span>点</span><span>设置：</span><input id="startTime" style="width:50px;">&nbsp;-&nbsp;<input id="endTime" style="width:50px;">&nbsp;<a href="javascript:void(0)" onclick="setRunTime()" style="text-decoration:none;">确定</a></div>';
    html += '<div style="height:25px;"><span style="display:inline-block;width:180px;">通知金额：<span id="notifyAmount">' + notifyAmount + '</span></span><span>设置：</span><a href="javascript:void(0)" onclick="switchNotifyAmount(this)" style="text-decoration:none;">100</a>&nbsp;<a href="javascript:void(0)" onclick="switchNotifyAmount(this)" style="text-decoration:none;">500</a>&nbsp;<a href="javascript:void(0)" onclick="switchNotifyAmount(this)" style="text-decoration:none;">2000</a></div>';
    html += '<div style="height:25px;"><span style="display:inline-block;width:180px;">预设刷新时间：<span id="presetReloadTime">' + presetReloadTime + '</span>秒</span><span>设置：</span><span><input id="newReloadTime" type="text" style="width:50px;"/>&nbsp;秒</span>&nbsp;<a href="javascript:void(0)" onclick="setReloadTime()" style="text-decoration:none;">确定</a></div>';
    html += '<div style="height:25px;"><span style="display:inline-block;width:370px;;">实际刷新时间：<span id="actualReloadTime">' + actualReloadTime + '</span>秒，距离下次刷新时间：<span id="nextReloadTime">' + nextReloadTime + '</span>秒</span><a href="javascript:void(0)" onclick="reload()" style="text-decoration:none;">立即刷新</a></div>';
    html += '<div style="height:25px;"><span style="display:inline-block;width:180px;">系统时间修正：<span id="offsetTime">' + offsetTime + '</span>秒</span><span>设置：</span><span><input id="offsetTime" type="text" style="width:50px;"/>&nbsp;秒</span>&nbsp;<a href="javascript:void(0)" onclick="setOffsetTime()" style="text-decoration:none;">确定</a></div>';
    html += '<div style="height:25px;"><span>关注名单：</span><input id="followList" value="' + followList + '" style="width:600px;">&nbsp;&nbsp;<a href="javascript:void(0)" onclick="saveFollowList()" style="text-decoration:none;">保存</a>&nbsp;<span>(使用英文逗号,分隔)</span></div>';
    html += '<div style="height:25px;"><span>粉丝徽章名单：</span><input id="fansBadgeList" value="' + fansBadgeList + '" style="width:600px;">&nbsp;&nbsp;<a href="javascript:void(0)" onclick="saveFansBadgeList()" style="text-decoration:none;">保存</a>&nbsp;<span>(使用英文逗号,分隔)</span></div>';
    html += '<div>===========================================================</div>';
    controlModuleElement.innerHTML = html;
    document.querySelector('body').appendChild(controlModuleElement);
}

//加载关注名单
async function initfollowList() {
    if (!followListInited) {
        await sleep(500);
        initfollowList();
    } else {
        document.querySelector('input#followList').value = String(followList);
    }
}

//加载粉丝牌名单
async function initFansBadgeList() {
    if (!fansBadgeListInited) {
        await sleep(500);
        initFansBadgeList();
    } else {
        document.querySelector('input#fansBadgeList').value = String(fansBadgeList);
    }
}

//周日清空荧光棒提醒
function initDayTips() {
    let dayTipsElement = document.createElement('div');
    dayTipsElement.innerHTML = '<div><font color="red">今天是星期天，记得清空荧光棒</font></div>';
    dayTipsElement.innerHTML += '<div>===========================================================</div>';
    document.querySelector('body').appendChild(dayTipsElement);
}

//初始化活动项目模块
function initActivityModule() {
    let activityModuleElement = document.createElement('div');
    activityModuleElement.id = 'activityModule';
    let noLimitListElement = document.createElement('div');
    noLimitListElement.id = 'noLimitList';
    noLimitListElement.innerHTML = '<div><font style="font-weight:bold;">无限制：</font></div>';
    let separatorElement1 = document.createElement('div');
    separatorElement1.innerHTML = '===========================================================';
    let fansLimitListElement = document.createElement('div');
    fansLimitListElement.id = 'fansLimitList';
    fansLimitListElement.innerHTML += '<div><font style="font-weight:bold;">粉丝团：</font></div>';
    let separatorElement2 = document.createElement('div');
    separatorElement2.innerHTML = '===========================================================';
    activityModuleElement.appendChild(noLimitListElement);
    activityModuleElement.appendChild(separatorElement1);
    activityModuleElement.appendChild(fansLimitListElement);
    activityModuleElement.appendChild(separatorElement2);
    document.querySelector('body').appendChild(activityModuleElement);
}

//初始化记录列表
function initRecordModule() {
    let recordModuleElement = document.createElement('div');
    recordModuleElement.id = 'recordModule';
    recordModuleElement.innerHTML = '<div><font style="font-weight:bold;">本月记录&nbsp;<a href="javascript:void(0)" id="recordShowBtn" onclick="switchRecordDisplay(this)" style="text-decoration:none;">显示</a>：</font></div>';
    document.querySelector('body').appendChild(recordModuleElement);

    let recordListElement = document.createElement('div');
    recordListElement.id = 'recordList';
    recordListElement.style.display = 'none';
    recordListElement.innerHTML = records;
    document.querySelector('div#recordModule').appendChild(recordListElement);
}

//按键函数
//设置TelegramBot Token
setTelegramBotToken = function () {
    telegramBotToken = document.querySelector('input#telegramBotToken').value;
    localStorage.setItem('telegramBotToken', telegramBotToken);
}

//切换运行开关
switchPower = function (obj) {
    let btn = obj.innerText;
    if (btn == '桌面通知' || btn == 'TG通知' || btn == '停止') {
        if (btn == '桌面通知') {
            switchFlag = true;
            notifyMethod = 'desktop';
            console.info('切换开关为桌面通知');
        } else if (btn == 'TG通知') {
            switchFlag = true;
            notifyMethod = 'TG';
            console.info('切换开关为TG通知');
        } else if (btn == '停止') {
            switchFlag = false;
            console.info('切换开关为停止');
        }
        document.querySelector("span#powerStatus").innerText = btn;
    }
}

//设置运行时间
setRunTime = function () {
    startTime = parseInt(document.querySelector("input#startTime").value);
    endTime = parseInt(document.querySelector("input#endTime").value);
    document.querySelector("span#startTimeSpan").innerText = startTime;
    document.querySelector("span#endTimeSpan").innerText = endTime;
    console.log('设置运行时间为：' + startTime + ' - ' + endTime);
    //修改运行时间后重新判定powerFlag
}

//设置通知金额
switchNotifyAmount = function (obj) {
    notifyAmount = Number(obj.innerText);
    document.querySelector('span#notifyAmount').innerText = notifyAmount;
    console.log('设置通知金额为：' + notifyAmount)
}

//设置刷新时间
setReloadTime = function () {
    let newReloadTime = document.querySelector("input#newReloadTime").value;
    if (presetReloadTime != newReloadTime) {
        presetReloadTime = parseInt(newReloadTime);
        actualReloadTime = parseInt(newReloadTime) + getRandomInterval();
        document.querySelector("span#presetReloadTime").innerText = newReloadTime;
        document.querySelector("span#actualReloadTime").innerText = actualReloadTime;
        actualReloadTime = 0;
        console.log('设置刷新时间：' + newReloadTime)
    }
}

//设置补偿时间
setOffsetTime = function(){
    let newOffsetTime = document.querySelector("input#newOffsetTime").value;
    offsetTime = newOffsetTime;
    document.querySelector("span#offsetTime").innerText = newOffsetTime;
    console.log('设置补偿时间：' + newOffsetTime)
}

//保存关注名单
saveFollowList = function () {
    let list = document.querySelector('input#followList').value.split(',');
    localStorage.setItem('followList', JSON.stringify(list));
}

//读取关注名单


//保存粉丝徽章名单
saveFansBadgeList = function () {
    let list = document.querySelector('input#fansBadgeList').value.split(',');
    localStorage.setItem('fansBadgeList', JSON.stringify(list));
}

//刷新
reload = function () {
    actualReloadTime = 0;
}

//复制房间地址
copyUrl = function (obj) {
    const url = obj.href;
    navigator.clipboard.writeText(url);
}

//显示/隐藏历史记录
switchRecordDisplay = function (btn) {
    let btnText = btn.innerHTML;
    if (btnText == '显示') {
        document.querySelector('div#recordList').style.display = 'block';
        document.querySelector('a#recordShowBtn').innerHTML = '隐藏';
    } else if (btnText == '隐藏') {
        document.querySelector('div#recordList').style.display = 'none';
        document.querySelector('a#recordShowBtn').innerHTML = '显示';
    }
}

//功能组件
//通知组件
function checkNotify(notificationBody) {
    if (notificationFlag) { // 判断是否有通知事件
        if (notifyMethod == 'desktop') {
            desktopNotify(notificationBody);
        } else if (notifyMethod == 'TG') {
            TGNotify(notificationBody);
        }
    }

    // 桌面通知组件
    function desktopNotify(str) {
        // window.onload = function () {
        suportNotify();
        // }

        //判断浏览器是否支持Web Notifications API
        function suportNotify() {
            if (window.Notification) {
                // 支持
                // console.log("支持" + "Web Notifications API");
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
                // console.log('1：' + Notification.permission);
                //如果支持window.Notification 并且 许可不是拒绝状态
                if (window.Notification && Notification.permission !== "denied") {
                    //Notification.requestPermission这是一个静态方法，作用就是让浏览器出现是否允许通知的提示
                    Notification.requestPermission(function (status) {
                        // console.log('2: ' + status);
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
        xmlhttp.open('GET', 'https://api.telegram.org/' + telegramBotToken + '/sendMessage?chat_id=-1001419288479&text=' + str, true);
        xmlhttp.send();
    }
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




// 判断逻辑
async function judge() {
    let currentHours;
    let sleepTime;
    let func;
    currentTime = new Date().toLocaleString();
    currentHours = new Date().getHours();
    if ((startTime < endTime && (startTime < endTime && currentHours >= startTime && currentHours < endTime)) || (startTime > endTime && (currentHours >= startTime || currentHours < endTime))
        || (currentHours == startTime && currentHours == endTime)) { //判定运行时间区间 开始时间和结束时间在一天内,简单判定;结束时间在第二天,仅用结束时间判定
        if (!powerFlag) {
            powerFlag = true;
            console.info(currentTime + ", 开始运行");
        }
        runningTime = getRunningTime();
        nextReloadTime = actualReloadTime - runningTime;
        if (nextReloadTime > 0) { //判定距离刷新时间 无论运行与否，在本轮数据刷新周期内，都会完成本地倒计时更新
            document.querySelector("span#nextReloadTime").innerText = nextReloadTime;
            if (remainItem.size > 0) { // 更新倒计时
                // console.info("更新倒计时，当前持续时间为：" + runningTime + "秒");
                sleepTime = 1000;
                func = modifyTime;
            } else { // 没有待更新倒计时，等待时间结束请求新数据
                // console.info("没有待更新倒计时，当前持续时间为：" + runningTime + "秒");
                sleepTime = 1000;
                func = judge;
            }
        } else {
            if (switchFlag) {
                if (!interruptionFlag) {
                    console.info(currentTime + "，持续时间为：" + runningTime + "，预设刷新时间为：" + actualReloadTime + "，即将刷新");
                }
                // 重置全局参数
                noLimit = [];
                fansLimit = [];
                fansLimitAvailable = [];
                remainItem = new Map(); //清空全局倒计时剩余项
                notificationFlag = false;
                syncActivityId = null;
                // 重新计算实际刷新时间
                actualReloadTime = presetReloadTime + getRandomInterval();
                document.querySelector("span#actualReloadTime").innerText = actualReloadTime;
                // 清空上次挂载的节点
                document.querySelector("div#noLimitList").innerHTML = '<div><font style="font-weight:bold;">无限制：</font></div>';
                document.querySelector("div#fansLimitList").innerHTML = '<div><font style="font-weight:bold;">粉丝团：</font></div>';
                // 获取数据
                sleepTime = 0;
                func = getData;
            } else {
                // 停止自动刷新，维持监听
                // console.info("停止刷新，当前持续时间为：" + runningTime + "秒");
                sleepTime = 1000;
                func = judge;
            }
        }
    } else {
        if (powerFlag) {
            powerFlag = false;
            console.info(currentTime + ", 超出运行时间区间, 暂停运行");
        } else {
            if (nextReloadTime == 0) { //最后一次倒计时结束，挂起刷新倒计时时间
                nextReloadTime = 999;
            }
            console.info("不在运行时间区间，等待启动");
        }
        sleepTime = 60000;
        func = judge;
    }

    await sleep(sleepTime);
    setTimeout(func, 0); // setTimeout把下一次轮询放入任务队列，judge函数结束，主线程重新调用任务队列中的函数，避免一直递归栈内存溢出

    // 同步等待  后注：这是async await的错误用法。await必须用在async函数上下文中，await需要接收promise对象，promise对象中需要声明执行结果resolve(返回值)或reject，下例中从主线程移除func放入异步队列，立即返回resolve，await阻塞解除，失去同步等待效果
    // async function asyncWait(func, time) {
    //     await new Promise(function (resolve, reject) {
    //         runningTime = runningTime + time / 1000;
    //         setTimeout(func, time);
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
    let nn;
    let title;
    let timeA = '';
    let timeB = '';

    // 仍在倒计时的项逐个更新时间
    remainItem.forEach((value, key) => {
        activityId = key; //记录当前remainItem数组项的内容，即该项的活动ID
        nn = value;
        runningTime = getRunningTime(); //judge()有经过sleep定时刷新，所以在更新单项倒计时时重新获取用掉的时间
        let lastTime = parseInt(document.querySelector('input#cdTime' + activityId).value);
        let cdTime = lastTime - runningTime;
        if (cdTime <= 0) {
            cdTime = '已开始';
            remainItem.delete(activityId);
        }
        document.querySelector("span#cdTime" + activityId).innerText = cdTime; //更新列表中该项的时间值

        // 如果更新的是第一项或可参与的粉丝团项，则同步时间到标题
        if (noLimit.length > 0 && activityId == noLimit[0].activityid) { //更新的是无限制的第一项
            timeA = '(' + cdTime + ')';
        } else if (activityId == syncActivityId) {
            timeB = '(' + cdTime + ')';
        }
        // 按顺序更新，第一项更新后timeA timeB ≠ ''，不会进入下面两个if，即使前面进去过，也会被第一项的结果覆盖，后续不再进入，title值固定
        if (noLimit.length > 0 && timeA == '') { //更新的不是无限制的第一项
            timeA = '(已开始)';
        }
        if (fansLimit.length > 0 && timeB == '') { //更新的不是粉丝团的第一项
            timeB = '(不可参与)';
        }
        title = '无:' + noLimit.length + timeA + ' | 粉:' + fansLimit.length + timeB;
    });
    if (title != undefined) {
        document.title = title;
    }

    judge(); //每次更新后先进入判断逻辑，否则需要在当前函数加入刷新时间判定
}

// 请求数据组件
// function getData() {
//     let xhr = new XMLHttpRequest();
//     xhr.open('GET', 'https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=9999', true);
//     xhr.send();
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState == 4 && xhr.status == 200) {
//             let response = xhr.responseText;
//             if (interruptionFlag) {
//                 interruptionFlag = false;
//                 retryTimes = 0;
//             }
//             startCountTime = Date.parse(new Date());
//             let json = JSON.parse(response);
//             // 上传到数据库
//             setTimeout(start(json), 0); // 获取到数据再调用start()，如果在start()中发起异步请求，需要面对异步获取数据不及时，同步主线程卡死的问题
//         }
//     }
//     xhr.onerror = async function () {
//         if (!interruptionFlag) {
//             interruptionFlag = true;
//             console.info('请求程序异常，10秒后重试');
//             checkNotify('请求程序异常，10秒后重试');
//             notificationFlag = true;
//         }
//         retryTimes += 1;
//         document.title = '故障重连中(' + retryTimes + ')';
//         await sleep(10000);
//         setTimeout(judge, 0);
//     }
// }

function getData() {
    fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=" + rid, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'omit',
        referrer: 'https://www.douyu.com/501761',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(res => res.json())
        .then(ret => {
            if (interruptionFlag) {
                interruptionFlag = false;
                retryTimes = 0;
            }
            startCountTime = Date.parse(new Date());
            setTimeout(start(ret), 0);
        }).catch(async (err) => {
            console.log(retryTimes + ':' + err)
            if (!interruptionFlag) {
                interruptionFlag = true;
                console.info('请求程序异常，10秒后重试');
                checkNotify('请求程序异常，10秒后重试');
                notificationFlag = true;
            }
            retryTimes += 1;
            document.title = '故障重连中(' + retryTimes + ')';
            await sleep(10000);
            setTimeout(judge, 0);
        })
}

function start(ret) {
    runningTime = 0;
    let path = "https://www.douyu.com/";
    let title;
    let notificationBody;
    let jsonArr;
    let syncCdTime;
    //获取JSON数据列表数组形式
    if (ret === undefined) {
        ret = JSON.parse(document.querySelector("pre").innerText);
        document.querySelector("pre").style.display = "none";
    } 
    if (ret.data.list.length > 0) {
        setTimeout(add_To_Get_Red_Envelope_List(ret), 0);
    } //添加到自动抢红包
    jsonArr = ret.data.list;

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

        // 判断参与条件
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

        // 判断开始时间
        if (cdTime == 0) {
            cdTime = '已开始';
        } else {
            remainItem.set(activityId, nn);
        };

        // 添加子节点
        let activityElement = document.createElement('div');
        activityElement.id = activityId;
        let html = '';
        // 红包金额判定
        if (yc >= notifyAmount && ((fansBadgeList.indexOf(nn) == -1 && (joinc == '全部水友' || joinc == '关注')) || fansBadgeList.indexOf(nn) > -1)) {
            html += '<div><span>礼物红包 <font style="color:red;">' + yc + '</font> 鱼翅<span></div>';
            if (!notificationFlag && notifiedActivityIds.indexOf(activityId) < 0) {
                notificationFlag = true;
                notificationBody = '发现 ' + yc + ' 鱼翅的房间，房间是 ' + nn + '，距离开始时间还有 ' + cdTime + ' 秒';
                notifiedActivityIds.push(activityId);
            }
        } else {
            html += '<div><span>礼物红包&nbsp;' + yc + '&nbsp;鱼翅<span></div>';
        };
        // 收礼人判定
        if ((followList.indexOf(nn) > -1 && (joinc == '全部水友' || joinc == '关注')) || fansBadgeList.indexOf(nn) > -1) {
            html += '</div><span>' + uname + ' 在 <font style="color:red">' + nn + '</font> 直播间送出<span></div>';
            if (!notificationFlag && notifiedActivityIds.indexOf(activityId) < 0) {
                notificationFlag = true;
                notificationBody = '发现关注名单 ' + nn + ' ，距离开始时间还有 ' + cdTime + ' 秒';
                notifiedActivityIds.push(activityId);
            }
        } else {
            html += '</div><span>' + uname + '&nbsp;在&nbsp;' + nn + '&nbsp;直播间送出<span></div>';
        }
        // 顺便记录所有可参与的粉丝团活动和第一个可参与的需要同步到时间到标题的粉丝团活动ID
        if ((joinc == '粉丝团' || joinc == '关注 + 粉丝团') && fansBadgeList.indexOf(nn) > -1) {
            fansLimitAvailable.push(v);
            if (syncActivityId == null) {
                if (syncCdTime == undefined) {
                    syncCdTime = cdTime; //记录第一个初始加载时可以参与且需要同步到标题的粉丝团活动的剩余时间，已开始/未开始均可
                }
                if (cdTime != '已开始') {
                    syncActivityId = activityId; //记录第一个更新时间时可以参与且需要同步到标题的粉丝团活动的活动ID，只记录未开始
                }
            }
        }
        html += '<div><span>参与条件：' + joinc + '</div>';
        html += '<div><span>开始倒计时：' + '</span>' + '<span id="cdTime' + activityId + '">' + cdTime + '</span>' + '&nbsp;&nbsp;' + '<span><a href="' + url + '" target="_blank" style="text-decoration:none;">' + '点击打开' + '</a></span>' + '&nbsp;&nbsp;' + '<span><a href="' + url + '"' + ' onclick="copyUrl(this);return false;" style="text-decoration:none;">' + "复制地址" + '</a></span></div>';
        html += '<div><span>startTime:' + v.startTime + '</span> <span>本地时间:' + Math.round(new Date().getTime() / 1000) + '</span> <span>本地计时(因本地与服务端时间不同产生误差):' + (v.startTime - Math.round(new Date().getTime() / 1000)) + '</span> <span>服务端计时:' + cdTime + '</span></div>';
        html += '<div><input id="cdTime' + activityId + '" value="' + cdTime + '" hidden/></div>';
        html += '<br/>';
        activityElement.innerHTML = html;
        if (joinc == '全部水友' || joinc == '关注') {
            document.querySelector('div#noLimitList').appendChild(activityElement);
            noLimit.push(v);
        } else {
            document.querySelector('div#fansLimitList').appendChild(activityElement);
            fansLimit.push(v);
        }
    });

    //修改标题显示数量
    if (noLimit.length == 0 && fansLimit.length == 0) {
        document.querySelector('div#noLimitList').innerHTML = '<div><font style="font-weight:bold;">无限制：暂无</font></div>';
        document.querySelector('div#fansLimitList').innerHTML = '<div><font style="font-weight:bold;">粉丝团：暂无</font></div>';
        title = '未发现红包';
    } else if (noLimit.length == 0 && fansLimit.length != 0) {
        document.querySelector('div#noLimitList').innerHTML = '<div><font style="font-weight:bold;">无限制：暂无</font></div>';
        title = '无:0 | 粉:' + fansLimit.length + '(' + (syncCdTime == undefined ? '不可参与' : syncCdTime) + ')';
    } else if (noLimit.length != 0 && fansLimit.length == 0) {
        document.querySelector('div#fansLimitList').innerHTML = '<div><font style="font-weight:bold;">粉丝团：暂无</font></div>';
        title = '无:' + noLimit.length + '(' + (noLimit[0].cdtime == 0 ? '已开始' : noLimit[0].cdtime) + ') | 粉:0)';
    } else {
        title = '无:' + noLimit.length + '(' + (noLimit[0].cdtime == 0 ? '已开始' : noLimit[0].cdtime) + ') | 粉:'
            + fansLimit.length + '(' + (syncCdTime == undefined ? '不可参与' : syncCdTime) + ')';
    }
    document.title = title;

    // 检查通知标识
    checkNotify(notificationBody);

    //完成一次加载，重新判断
    judge();
}

//移植自动抢红包，自动赠送
//初始化背包红包礼物
var red_Envelopes_Gifts = { "办卡": 0, "666": 0, "大气": 0, "飞机": 0, "火箭": 0 };
function get_init_Red_Envelopes_Gifts(rid) {
    get_Bag_Gifts(rid, (ret) => {
        let gift_list_num = ret.data.list.length;
        if (gift_list_num > 0) {
            for (let i = 0; i < gift_list_num; i++) {
                let gift_id = ret.data.list[i].id;
                let gift_count = ret.data.list[i].count;
                if (gift_id == 974) {
                    red_Envelopes_Gifts["办卡"] += gift_count;
                } else if (gift_id == 978) {
                    red_Envelopes_Gifts["666"] += gift_count;
                } else if (gift_id == 975) {
                    red_Envelopes_Gifts["大气"] += gift_count;
                } else if (gift_id == 979) {
                    red_Envelopes_Gifts["飞机"] += gift_count;
                } else if (gift_id == 981) {
                    red_Envelopes_Gifts["火箭"] += gift_count;
                }
            }
        }
        console.log("初始化背包红包礼物：" + JSON.stringify(red_Envelopes_Gifts));
    });
}

// 获取背包内所有礼物信息(json)，传给回调函数
function get_Bag_Gifts(room_id, callback) {
    fetch('https://www.douyu.com/japi/prop/backpack/web/v1?rid=' + room_id, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(result => {
        return result.json();
    }).then(ret => {
        callback(ret);
    }).catch(err => {
        console.log("请求失败!", err)
    })
}

let red_Envelope_Status;
let red_Envelope_Arr = [];
let my_Follow_Room = followList;
// var rid = url.substring(ridPos + urlLen, url.indexOf(';', ridPos + urlLen));
let rid = 501761

//添加到抢红包队列
function add_To_Get_Red_Envelope_List(ret) {
    for (let i = 0; i < ret.data.list.length; i++) {
        let joinc = ret.data.list[i].joinc;
        let red_packet_rid = ret.data.list[i].rid;
        let nn = ret.data.list[i].nn;
        let rpid = ret.data.list[i].activityid;
        let offset = red_Envelope_Arr.indexOf(rpid);
        let startTime = ret.data.list[i].startTime;
        let to = Number(startTime) - Math.round(new Date().getTime() / 1000);
        to = 1000 * to - 6000; //ttt
        if (offset == -1) {
            red_Envelope_Arr.push(ret.data.list[i].activityid);
            if (joinc == 0) {
                add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
            } else if (joinc == 1) {
                if (my_Follow_Room.indexOf(red_packet_rid) < 0) {
                    my_Follow_Room.push(ret.data.list[i].rid);
                    let add_follow = new XMLHttpRequest();
                    add_follow.open('POST', 'https://www.douyu.com/wgapi/livenc/liveweb/follow/add', true);
                    add_follow.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    add_follow.send('rid=' + red_packet_rid + '&ctn=' + getCCN());
                    add_follow.onreadystatechange = function () {
                        if (add_follow.readyState == 4 && add_follow.status == 200) {
                            if (JSON.parse(add_follow.responseText).error == 0) {
                                console.log("【关注】==>" + red_packet_rid);
                                check_Follow_Room(red_packet_rid, to);
                            }
                        }
                    };
                }
                add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
            } else if (joinc == 2) {
                // verifyFans(red_packet_rid, 1).then(r => {
                verifyFans(nn).then(r => {
                    if (r == true) {
                        add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
                    }
                })
            } else if (joinc == 3) {
                // verifyFans(red_packet_rid, 1).then(r => {
                verifyFans(nn).then(r => {
                    if (r == true) {
                        if (my_Follow_Room.indexOf(red_packet_rid) < 0) {
                            my_Follow_Room.push(ret.data.list[i].rid);
                            let add_follow = new XMLHttpRequest();
                            add_follow.open('POST', 'https://www.douyu.com/wgapi/livenc/liveweb/follow/add', true);
                            add_follow.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                            add_follow.send('rid=' + red_packet_rid + '&ctn=' + getCCN());
                            add_follow.onreadystatechange = function () {
                                if (add_follow.readyState == 4 && add_follow.status == 200) {
                                    if (JSON.parse(add_follow.responseText).error == 0) {
                                        console.log("【关注】==>" + red_packet_rid);
                                        check_Follow_Room(red_packet_rid, to);
                                    }
                                }
                            };
                        }
                        add_Get_Red_Envelope(rpid, red_packet_rid, to, nn);
                    }
                })
            }
            makeRecord(ret.data.list[i].startTime,rpid, nn, ret.data.list[i].yc, joinc)
        }
    }
}

//自定义验证粉丝牌
async function verifyFans(nn) {
    let ret = fansBadgeList.indexOf(nn) > -1 ? true : false
    return ret;
}

function add_Get_Red_Envelope(rpid, reid, to, nn) {
    if (to > 0) {
        setTimeout(() => {
            get_Red_Envelope(rpid);
            get_Red_Envelope(rpid);
            get_Red_Envelope(rpid);
            // showMessage("【礼物红包】抢红包执行完毕！", "success");
            console.log('【礼物红包】抢红包执行完毕！');
            choose_Gift(reid, nn, rpid);
        }, to);
    } else {
        get_Red_Envelope(rpid);
        get_Red_Envelope(rpid);
        get_Red_Envelope(rpid);
        // showMessage("【礼物红包】抢红包执行完毕！", "success");
        console.log('【礼物红包】抢红包执行完毕！');
        choose_Gift(reid, nn, rpid);
    }
}

//抢红包
function get_Red_Envelope(rpid) {
    fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/grab_prp", {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'activityid=' + rpid + '&ctn=' + getCCN()
    }).then(res => {
        return res.json();
    }).then((ret) => {
        if (ret.data.isSuc == 2) {
            get_Red_Envelope(rpid);
        }
    })
}


//选择赠送背包红包礼物
async function choose_Gift(reid, nn, rpid) {
    await sleep(10000).then(() => {
        get_Bag_Gifts(reid, (ret) => {
            let red_Envelopes_Gifts_New = { "办卡": 0, "666": 0, "大气": 0, "飞机": 0, "火箭": 0 };
            let gift_list_num = ret.data.list.length;
            if (gift_list_num > 0) {
                for (let i = 0; i < gift_list_num; i++) {
                    let gift_id = ret.data.list[i].id;
                    let gift_count = ret.data.list[i].count;
                    if (gift_id == 974) {
                        red_Envelopes_Gifts_New["办卡"] += gift_count;
                        if (red_Envelopes_Gifts_New["办卡"] > red_Envelopes_Gifts["办卡"]) {
                            if (followList.indexOf(nn) < 0) {
                                console.log("Send【办卡】==>" + reid);
                                send_Gift_Bag(974, 1, reid, nn);
                                updateGiftStatus(rpid, '办卡', 'sended')
                            } else {
                                red_Envelopes_Gifts["办卡"] -= 1;
                                let t = new Date().getTime();
                                // insert_gift_log(979, reid, t-10000, nn);
                                console.log("【办卡】来自==>" + reid);
                                updateGiftStatus(rpid, '办卡', 'keep')
                            }
                        }
                    } else if (gift_id == 978) {
                        red_Envelopes_Gifts_New["666"] += gift_count;
                        if (red_Envelopes_Gifts_New["666"] > red_Envelopes_Gifts["666"]) {
                            console.log("Send【666】==>" + reid);
                            send_Gift_Bag(978, 1, reid, nn);
                        }
                        updateGiftStatus(rpid, '办卡', 'sended')
                    } else if (gift_id == 975) {
                        red_Envelopes_Gifts_New["大气"] += gift_count;
                        if (red_Envelopes_Gifts_New["大气"] > red_Envelopes_Gifts["大气"]) {
                            console.log("Send【大气】==>" + reid);
                            send_Gift_Bag(975, 1, reid, nn);
                        }
                        updateGiftStatus(rpid, '大气', 'sended')
                    } else if (gift_id == 979) {
                        red_Envelopes_Gifts_New["飞机"] += gift_count;
                        if (red_Envelopes_Gifts_New["飞机"] > red_Envelopes_Gifts["飞机"]) {
                            let t = new Date().getTime();
                            // insert_gift_log(979, reid, t-10000, nn);
                            console.log("【飞机】来自==>" + reid);
                        }
                        updateGiftStatus(rpid, '飞机', 'keep')
                    } else if (gift_id == 981) {
                        red_Envelopes_Gifts_New["火箭"] += gift_count;
                        if (red_Envelopes_Gifts_New["火箭"] > red_Envelopes_Gifts["火箭"]) {
                            let t = new Date().getTime();
                            // insert_gift_log(981, reid, t-10000, nn);
                            console.log("【火箭】来自==>" + reid);
                        }
                        updateGiftStatus(rpid, '火箭', 'keep')
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
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'propId=' + gid + '&propCount=' + count + '&roomId=' + reid + '&bizExt=%7B%22yzxq%22%3A%7B%7D%7D'
    }).then(res => {
        return res.json();
    }).then(ret => {
        let d = new Date();
        let t = d.getTime();
        if (gid == 974) {
            if (ret.error == 0) {
                // insert_gift_log(gid, reid, t-10000, nn);
                red_Envelopes_Gifts["办卡"] -= 1;
            }
            else { console.log("Send【办卡】失败==>" + reid); }
        } else if (gid == 978) {
            if (ret.error == 0) {
                // insert_gift_log(gid, reid, t-10000, nn);
                red_Envelopes_Gifts["666"] -= 1;
            }
            else { console.log("Send【666】失败==>" + reid); }
        } else if (gid == 975) {
            if (ret.error == 0) {
                // insert_gift_log(gid, reid, t-10000, nn);
                red_Envelopes_Gifts["大气"] -= 1;
            }
            else { console.log("Send【大气】失败==>" + reid); }
        }
        console.log(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "当前背包红包礼物：" + JSON.stringify(red_Envelopes_Gifts));
    })
}

function check_Follow_Room(reid, to) {
    if (to > 0) {
        setTimeout(() => {
            check_Red_Envelope_Room(reid);
        }, to + 15000);
    } else {
        setTimeout(() => {
            check_Red_Envelope_Room(reid);
        }, 15000);
    }
}

async function check_Red_Envelope_Room(reid) {
    let red_Envelope_Room_Arr = [];
    await fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/getPrpList?type_id=2&room_id=" + rid, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(res => {
        return res.json();
    }).then(ret => {
        if (ret.data.list.length > 0) {
            for (let i = 0; i < ret.data.list.length; i++) {
                let red_packet_rid = ret.data.list[i].rid;
                if (red_Envelope_Room_Arr.indexOf(red_packet_rid) < 0) {
                    red_Envelope_Room_Arr.push(red_packet_rid);
                }
            }
        }
    })
    let room_status = red_Envelope_Room_Arr.indexOf(reid);
    let follow_status = my_Follow_Room.indexOf(reid);
    if (room_status == -1) {
        delete my_Follow_Room[follow_status];
        rm_Follow_Room(reid);
    } else {
        setTimeout(() => {
            check_Red_Envelope_Room(reid);
        }, 30000);
    }
}

function rm_Follow_Room(reid) {
    let rm_follow = new XMLHttpRequest();
    rm_follow.open('POST', 'https://www.douyu.com/wgapi/livenc/liveweb/follow/rm', true);
    rm_follow.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    rm_follow.send('rid=' + reid + '&ctn=' + getCCN());
    rm_follow.onreadystatechange = function () {
        if (rm_follow.readyState == 4 && rm_follow.status == 200) {
            if (JSON.parse(rm_follow.responseText).error == 0) {
                console.log("【取关】==>" + reid);
            }
        }
    };
}

function makeRecord(startTime,rpid, nn, yc, joinc) {
    let date = new Date(startTime * 1000);
    localDate = ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);
    // 参与条件
    switch (joinc) {
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
    let recordElement = document.createElement('div');
    recordElement.id = 'record' + rpid;
    let newRecord = localDate + '&nbsp;&nbsp;&nbsp;&nbsp;' + '<span>' + nn + '</span>' + '&nbsp;&nbsp;&nbsp;&nbsp;' + '<span>' + yc/100 + '</span>' + '&nbsp;&nbsp;&nbsp;&nbsp;'
         + '<span>' + joinc + '</span>' + '&nbsp;&nbsp;&nbsp;&nbsp;' + '<span id="giftstatus'+rpid+'"></span>' + '&nbsp;&nbsp;&nbsp;&nbsp;' + '<span id="sendstatus' + rpid + '"></span>';
    recordElement.innerHTML = newRecord;
    document.querySelector('div#recordList').appendChild(recordElement);

    records = loadRecords();
    records += '<div>' + newRecord + '</div>';
    saveRecords(records);
}

//提交礼物状态
function updateGiftStatus(rpid, gift, sendstatus) {
    document.querySelector('span#giftstatus' + rpid).innerText = gift;
    document.querySelector('span#sendstatus' + rpid).innerText = sendstatus;
    records = document.querySelector('div#recordList').innerHTML;
    saveRecords(records);
}

// 保存记录
function saveRecords(records) {
    let date = new Date();
    localStorage.setItem(("0" + (date.getMonth() + 1)).slice(-2) + '.records', records)
}

function getCCN() {
    let ret = getCookie("acf_ccn");
    if (ret == null) {
        setCookie("acf_ccn", "1");
        ret = "1";
    }
    return ret;
}

function setCookie(cookiename, value) {
    let exp = new Date();
    exp.setTime(exp.getTime() + 3 * 60 * 60 * 1000);
    document.cookie = cookiename + "=" + escape(value) + "; path=/; expires=" + exp.toGMTString();
}

function getCookie(cookie_name) {
    var allcookies = document.cookie;
    var cookie_pos = allcookies.indexOf(cookie_name);
    // 如果找到了索引，就代表cookie存在，
    // 反之，就说明不存在。
    if (cookie_pos != -1) {
        // 把cookie_pos放在值的开始，只要给值加1即可。
        cookie_pos += cookie_name.length + 1;
        var cookie_end = allcookies.indexOf(";", cookie_pos);
        if (cookie_end == -1) {
            cookie_end = allcookies.length;
        }
        var value = encodeURIComponent(allcookies.substring(cookie_pos, cookie_end));
    }
    return value;
}


(function () {
    $(document).ready(function () {
        loginStateCheck();
        initData();
        initControlPanel();
        initfollowList();
        initFansBadgeList();
        new Date().getDay() == '0' ? initDayTips() : null;
        initActivityModule();
        initRecordModule();
        start();
    })
})();