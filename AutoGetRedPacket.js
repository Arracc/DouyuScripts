// ==UserScript==
// @name         自动抢红包
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://www.douyu.com/0*
// @include      https://www.douyu.com/1*
// @include      https://www.douyu.com/2*
// @include      https://www.douyu.com/3*
// @include      https://www.douyu.com/4*
// @include      https://www.douyu.com/5*
// @include      https://www.douyu.com/6*
// @include      https://www.douyu.com/7*
// @include      https://www.douyu.com/8*
// @include      https://www.douyu.com/9*
// @include      https://www.douyu.com/topic/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant        none
// ==/UserScript==

/* <div class="RedEnvelopInfo-circleTxt"><div class="RedEnvelopVC"><div class="RedEnvelopInfo-time">34s</div><div class="RedEnvelopInfo-txt">后可抢</div></div></div>
<div class="RedEnvelopInfo-circleTxt"><div class="RedEnvelopVC"><div class="RedEnvelopInfo-qiang">抢</div></div></div> */
// https://www.douyu.com/japi/interactnc/web/propredpacket/grab_prp
// cookie: loginrefer=pt_m12n42990812; smidV2=201911261821432cf988230e4cc68fbbc1201c008cc76200671e2859c971450; UM_distinctid=16eb0fd8fb95bb-0409b0ea00beec-2393f61-1fa400-16eb0fd8fba9ec; acf_did=7f1c14f09707fca33460ff4a00071501; dy_did=7f1c14f09707fca33460ff4a00071501; acf_devid=f2306889e6c313d2138ed716803f0fe5; Hm_lvt_e99aee90ec1b2106afe7ec3b199020a7=1578754504; CNZZDATA1278051049=1209600993-1574925925-https%253A%252F%252Fwww.douyu.com%252F%7C1578751932; acf_auth=8d58nZZQiFa7cJSNrl3o%2BFLaI1Hf0ew5KVEPPYQWLr%2BMwy6lvkhl9eulkAY%2BPM24BZes0xyfESEGcy6OYDmD%2FRBuNzd1Ys71mLLMmg8anZimlnK4g8OD7XhPSmvr; dy_auth=6061dNR6LOXWbagBaIHdsYQJFaRPhnBhw3BkxaEVH%2FCOB8nWt0rpefJgfM8uefFfIhA93nobIfKZRhudqcEZAqvDLPhAU0pdi%2FSSqehCYKCs2GzNa2OcdOJT51sU; wan_auth37wan=3714f387a056vmBoo6vic277txTFL63CyNgyfwpYxhed5MgnLGwxIkR3nepGSVDtVj50K0zejKKZ0SDjxG%2B%2Fyn1QlzKQUyX80516fajMt54aEyGj; acf_uid=3573868; acf_username=auto_y3PpibN8Yf; acf_nickname=%E6%9A%AE%E5%85%89rrrr; acf_own_room=0; acf_groupid=1; acf_phonestatus=1; acf_ct=0; acf_ltkid=62680259; acf_biz=1; acf_stk=e96088b4ca663753; CNZZDATA1278115154=713581962-1576683540-https%253A%252F%252Fwww.douyu.com%252F%7C1579181010; acf_avatar=//apic.douyucdn.cn/upload/avanew/face/201707/10/19/5e6a3bfde6f408428b3ce35482d4b4a5_; PHPSESSID=lhq01lmfmucu9n834ibjsgldm3; acf_ccn=921bbd9ccaa13773fed594ae52a286a8
// {"error":0,"msg":"ok","data":{"activityid":13714,"isSuc":2}}
// fetch("https://www.douyu.com/japi/interactnc/web/propredpacket/grab_prp", {"credentials":"include","headers":{"accept":"application/json, text/plain, */*","accept-language":"zh-CN,zh;q=0.9","cache-control":"no-cache","content-type":"application/x-www-form-urlencoded","pragma":"no-cache","sec-fetch-mode":"cors","sec-fetch-site":"same-origin","x-requested-with":"XMLHttpRequest"},"referrer":"https://www.douyu.com/7714031","referrerPolicy":"no-referrer-when-downgrade","body":"activityid=13714&ctn=921bbd9ccaa13773fed594ae52a286a8","method":"POST","mode":"cors"});
// formdata activityid: 13715 ctn: 921bbd9ccaa13773fed594ae52a286a8


{/* <div class="RedEnvelopInfo-circleTxt"><div class="RedEnvelopVC"><div class="RedEnvelopInfo-time">39s</div><div class="RedEnvelopInfo-txt">后可抢</div></div></div> */}
{/* <div class="RedEnvelopInfo-circleTxt"><div class="RedEnvelopVC"><div class="RedEnvelopInfo-qiang">抢</div></div></div> */}

// 同步等待方法
function sleep(time) {
     return new Promise(function (resolve, reject) {
        setTimeout(resolve,time);
    })
}

// async function check() {
//     let redPacketBubbleObj = document.querySelector("div.PropRedEnvelopeIcon-bubble");
//     if(redPacketBubbleObj != undefined){
//         console.info("有红包");
//         document.querySelector("div.PropRedEnvelopeIcon-cont").click(); //打开红包面板
//         if(document.querySelector("div.RedEnvelopPrompt-txt1") != undefined){
//             document.querySelector("div.RedEnvelop-close").click(); //已抢 关闭
//         }else{
//             let giftInfoElement = document.querySelector("div.RedEnvelopInfo-circleProgress"); //获取 抢 元素，此时单一活动
//             // console.info(giftInfoElement);
//             if (giftInfoElement != null) {
//                 // console.info("开始监控");
//                 start();
//             } else {
//                 console.info("无待抢红包或已抢完");
//                 await sleep(1000);
//                 setTimeout(check,0);
//             }
//         }
//     }else{
//         console.info("无待抢红包");
//         await sleep(1000);
//         setTimeout(check,0);
//     }
// }

async function check() {
    // let redPacketBubbleObj = document.querySelector("div.PropRedEnvelopeIcon-bubble");
    // if(redPacketBubbleObj != undefined){
    //     console.info("有红包");
    //     document.querySelector("div.PropRedEnvelopeIcon-cont").click();
    //     if(document.querySelector("div.RedEnvelopPrompt-txt1") != undefined){
    //         document.querySelector("div.RedEnvelop-close").click();
    //     }
    // } 打开一次列表就会发起一次请求 待解决

    // 判定打开的是否是本房间所有红包列表
    // let activityListElement = document.querySelector("div[style='position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; overflow: scroll; margin-right: -17px; margin-bottom: -17px;']");
    // if(activityListElement != undefined && activityListElement.childNodes.length != 0){
    //     let activityEntrenceElement = document.querySelector("div.RedEnvelopList-btn");
    //     if(activityEntrenceElement != undefined){
    //         activityEntrenceElement.click(); //是则打开第一个红包详情
    //     }
    // } 如果第一项是粉丝团 待解决
    let giftInfoElement = document.querySelector("div.RedEnvelopInfo-circleProgress"); //找到 抢 元素
    console.info(giftInfoElement);
    if (giftInfoElement) {
        // console.info("开始监控");
        start();
    } else {
        console.info("无待抢红包或已抢完");
        await sleep(1000);
        setTimeout(check,0);
    }
}

async function start() {
    let sleepTime = 1000;
    let fn = check;
    // 获取参与条件
    // let condition = $("div.RedEnvelopInfo-req").clone().children().remove().end().text();
    // let conditionObj = document.querySelector("div.RedEnvelopInfo-req");
    let condition;
    let status;
    try {
        condition = document.querySelector("div.RedEnvelopInfo-req").firstChild.nodeValue;
        status = document.querySelector("div.RedEnvelopInfo-reqlight").innerText;
    } catch (err) {

    }
    // if (conditionObj != null) { //如果切换红包页面，会造成元素丢失，获取子节点报错，需要重新进入等待判断；使用JQuery时可以通过$().length = 0 直接判断
    //     condition = conditionObj.firstChild.nodeValue;
    // }
    // console.info("获取到的参与条件是：" + condition);
    // let status = $("div.RedEnvelopInfo-reqlight").text();
    // let statusObj = document.querySelector("div.RedEnvelopInfo-reqlight");
    // if (statusObj != null) {
    //     status = statusObj.innerText;
    // }
    // console.info("获取到的条件状态是：" + status);
    // 判断可参与状态
    if (condition == undefined || status == undefined) { //未打开抢红包页面 未获取到参与条件
        // 默认
    } else if (condition == "关注主播即可参与抢红包" && status == "您未达成参与条件") { //参与条件是关注，未关注
        console.info("请提前关注");
        // $("span.Title-followText").click(); //自动关注有风险
        // 默认
    } else if ((condition == "关注主播并加入粉丝团即可参与抢红包" || condition == "加入粉丝团即可参与抢红包") && status == "您未达成参与条件") {  // 未加入粉丝团
        console.info("不符合参与条件"); //不处理
        // 默认
    } else if (status == "已达成参与条件") {
        // 符合参与条件
        let timeElement = document.querySelector("div.RedEnvelopInfo-time");
        // console.info(timeElement);
        if (timeElement == null) { //倒计时消失，已开始
            console.info("点击 抢");
            document.querySelector("div.RedEnvelopInfo-qiang").click();
            sleepTime = 100; //抢完后判断
        } else {
            let time = document.querySelector("div.RedEnvelopInfo-time").firstChild.nodeValue;
            console.info("剩余时间：" + time);
            if (time == 1) {
                sleepTime = 100; //快速刷新
            } else {
                sleepTime = 500; //正常刷新
            }
            fn = start;
        }
    }
    await sleep(sleepTime);
    setTimeout(fn,0);
}

(function () {
    $(document).ready(function () {
        check();
    })
})();