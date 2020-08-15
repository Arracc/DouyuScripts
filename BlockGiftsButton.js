// ==UserScript==
// @name         屏蔽礼物栏
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

function blockGift1() {
    let element = document.querySelector("div.ToolbarGiftArea-GiftBox");
    if (element) {
        // console.info("标签已加载，屏蔽");
        // 屏蔽右侧礼物栏
        element.parentNode.style.display = "none";
    } else {
        // console.info("标签未加载")
        setTimeout(blockGift1, 1000);
    }
}

function blockGift2() {
    let element = document.querySelector("div.TaskIcon");
    if (element) {
        //console.info("标签已加载，屏蔽");
        // 左侧任务大厅
        document.querySelector("div.TaskIcon").style.display = "none";
        // 鱼塘
        document.querySelector("div.PlayerToolbar-FishpondTreasure").style.display = "none";
        // 推广
        document.querySelector("div[data-flag='']").style.display = "none";
        // 右侧活动
        // $("div.TurntableLottery").parent().parent().attr("style", "display: none;");
        // $("div[data-flag='']").hide(); 活动已结束
        // $("div.TurntableLottery").hide();
        // $("div.RomanticDateComponent").hide();
        // $("div.BattleShipEnter").hide();
        document.querySelector("div[style='display: inline-block; position: absolute; right: 0px; top: 0px;']").style.display = "none";
        // 竞猜福袋
        document.querySelector("div.GuessReturnYwFdSlider").style.display = "none";
    } else {
        //console.info("标签未加载")
        setTimeout(blockGift2, 1000);
    }
}

function modifyChatTips() {
    let element = document.querySelector("div.ChatSend");
    if (element) {
        // console.info("标签已加载，屏蔽");
        document.querySelector("textarea.ChatSend-txt").setAttribute("placeholder", "谨言");
    } else {
        // console.info("标签未加载")
        setTimeout(modifyChatTips, 1000);
    }
}

// function getRoomId() {
//     let str = $($("a.Title-anchorName")[0]).attr("href");
//     let roomId = str.substring(str.indexOf("=") + 1).replace(",", "");
//     return roomId;
// }

function blockRoomLevel() {
    if (document.querySelector("div.RoomLevelDetail-level")) {
        document.querySelector("div[data-flag='room_level']").style.display = "none";
    } else {
        setTimeout(blockRoomLevel, 1000);
    }
}

(function () {
    $(document).ready(function () {
        blockGift1();
        blockGift2();
        modifyChatTips();
        blockRoomLevel();
    })
})();