// ==UserScript==
// @name         屏蔽房间
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.douyu.com/g_TVgame
// @require           https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant        none
// ==/UserScript==

var blockGames = ["","","",]; //游戏名
var blockRoomIds = ["","",""]; //房间ID，以/+id格式
var count = 0;


function block(roomId) {
    let element = "a[href='" + roomId + "']";
    let $room = $(element);
    let temp = $room.parent().parent();
    $room.parent().parent().empty();
    temp.hide();
}

function startBlock() {
    for (let i in blockRoomIds) {
        let roomId = blockRoomIds[i];
        block(roomId);
    }
}

function checkReload() {
    let reloadedFlag = false;
    // 检查是否已经重新加载
    for (let i in blockRoomIds) {
        let roomId = blockRoomIds[i];
        let element = "a[href='" + roomId + "']";
        let $room = $(element);
        if ($room.length != 0) {
            reloadedFlag = true;
            break;
        }
    }
    if (reloadedFlag) {
        // 已经加载，去屏蔽
        startBlock();
    } else {
        // 没有加载，再次检查
        setTimeout(checkReload, 1000);
    }
}

(function () {
    $(document).ready(function () {
        // 根据游戏名补充房间号
        for (let i in blockGames) {
            let $gameRooms = $("span.DyListCover-zone:contains('" + blockGames[i] + "')");
            $gameRooms.each(function (i, e) {
                let roomId = $(e).parent().parent().parent().attr("href");
                blockRoomIds.push(roomId);
            })
        }
        // 开始屏蔽
        startBlock();
        checkReload();
    })
})();