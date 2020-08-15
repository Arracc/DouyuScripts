// ==UserScript==
// @name         抽奖列表页面
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.douyu.com/japi/weblist/apinc/rec/*
// @require           https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant        none
// ==/UserScript==

//{"error":0,"msg":"操作成功","data":[{"roomId":5324388,"roomName":"15E金币，1管PL深渊出1个SS加1黄金书，光头30E（折现2000鱼翅）","nickname":"DNF枪魂冰子","avatar":"https://apic.douyucdn.cn/upload/avatar_v3/201807/71c33089443b1bd7d872e225731114be_big.jpg","hot":1139708},{"roomId":5532877,"roomName":"100鱼翅","nickname":"华府丶csy影","avatar":"https://apic.douyucdn.cn/upload/avatar_v3/201808/4ef17acd7789b8a9dbfff740931ac41d_big.jpg","hot":223329},{"roomId":746256,"roomName":"终极挑战","nickname":"Prince晋","avatar":"https://apic.douyucdn.cn/upload/avanew/face/201703/23/09/b19baa56b4bf90628e66ee433779ee45_big.jpg","hot":103920},{"roomId":607088,"roomName":"炖鸡包人参","nickname":"中华人参王","avatar":"https://apic.douyucdn.cn/upload/avatar_v3/201911/df2bfd5b21da433e8075b643905b80ed_big.jpg","hot":40057},{"roomId":4874542,"roomName":"5元现金红包","nickname":"汪团长","avatar":"https://apic.douyucdn.cn/upload/avanew/face/201805/0394b252047916e9f3e73298b4c401fb_big.jpg","hot":49807}],"redirectUrl":null,"enMsg":null}

function start() {
    var url = "https://www.douyu.com/";
    var jsonStr = $("pre").text();
    var jsonArr = JSON.parse(jsonStr).data;
    var length = jsonArr.length;

    $("pre").hide();

    console.info(jsonArr);


    if (length == 0) {
        $("title").text("未发现抽奖房间");
        $("body").append("<div>暂无充足数量房间开启抽奖，尝试切换查询数量</div>");
    } else {

        $("title").text("抽奖列表");

        //添加数据展示根节点
        $("body").append("<div class='CodeMirror cm-s-default CodeMirror-wrap read-only'><div style='overflow: hidden; position: relative; width: 3px; height: 0px; top: 244px; left: 280.531px;'><textarea autocorrect='off' autocapitalize='off' spellcheck='false' style='position: absolute; bottom: -1em; padding: 0px; width: 1000px; height: 1em; outline: none;' tabindex='0'></textarea></div><div class='CodeMirror-vscrollbar' cm-not-content='true' style='display: block; bottom: 0px;'><div style='min-width: 1px; height: 1112px;'></div></div><div class='CodeMirror-hscrollbar' cm-not-content='true'><div style='height: 100%; min-height: 1px; width: 0px;'></div></div><div class='CodeMirror-scrollbar-filler' cm-not-content='true'></div><div class='CodeMirror-gutter-filler' cm-not-content='true'></div><div class='CodeMirror-scroll' tabindex='-1'><div class='CodeMirror-sizer' style='margin-left: 51px; margin-bottom: -17px; border-right-width: 13px; min-height: 1112px; padding-right: 17px; padding-bottom: 0px;'><div style='position: relative; top: 0px;'><div class='CodeMirror-lines'><div style='position: relative; outline: none;'><div class='CodeMirror-measure'><div class='CodeMirror-linenumber CodeMirror-gutter-elt'><div>46</div></div></div><div class='CodeMirror-measure'></div><div style='position: relative; z-index: 1;'></div><div class='CodeMirror-cursors' style='visibility: hidden;'><div class='CodeMirror-cursor' style='left: 229.531px; top: 240px; height: 24px;'>&nbsp;</div></div><div id='root' class='CodeMirror-code' style=''></div></div></div></div></div><div style='position: absolute; height: 13px; width: 1px; border-bottom: 0px solid transparent; top: 1112px;'></div><div class='CodeMirror-gutters' style='height: 1125px;'><div class='CodeMirror-gutter CodeMirror-linenumbers' style='width: 29px;'></div><div class='CodeMirror-gutter CodeMirror-foldgutter'></div></div></div></div>");
        jsonArr.forEach((v, i) => {
            // 构建子节点

            //添加子节点
            $("#root").append("<div id='" + i + "'></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>8</div><div class='CodeMirror-gutter-elt' style='left: 29px; width: 21px;'><div class='CodeMirror-foldgutter-open CodeMirror-guttermarker-subtle'></div></div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp;  {</span></pre></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>9</div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp; &nbsp; &nbsp;<span class='cm-property'>'roomId'</span>: <span class='cm-number'><a href='"+url+v.roomId+"'  target='_blank'>"+v.roomId+"</a></span>,</span></pre></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>10</div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp; &nbsp; &nbsp;<span class='cm-property'>'roomName'</span>: <span class='cm-string'>'"+v.roomName+"'</span>,</span></pre></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>11</div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp; &nbsp; &nbsp;<span class='cm-property'>'nickname'</span>: <span class='cm-string'>'"+v.nickname+"'</span>,</span></pre></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>12</div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp; &nbsp; &nbsp;<span class='cm-property'>'avatar'</span>: <span class='cm-string cm-string-link' data-url='"+v.avatar+"'>'"+v.avatar+"'</span>,</span></pre></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>13</div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp; &nbsp; &nbsp;<span class='cm-property'>'hot'</span>: <span class='cm-number'>"+v.hot+"</span></span></pre></div>");
            $('#' + i).append("<div style='position: relative;'><div class='CodeMirror-gutter-wrapper' style='left: -51px;'><div class='CodeMirror-linenumber CodeMirror-gutter-elt' style='left: 0px; width: 21px;'>14</div></div><pre class=' CodeMirror-line '><span style='padding-right: 0.1px;'> &nbsp;  },</span></pre></div>");
            //console.info(v);

        });

    }
}


(function () {
    $(document).ready(function () {
        $("head").append("<title id='title'>列表加载中...</title>");
        $("head").append("<link rel='stylesheet' href='chrome-extension://gbmdgpbipfallnflgajpaliibnhdgobh/assets/viewer.css'>");
        $("head").append("<style type='text/css'>.CodeMirror {font-family: monaco, Consolas, Menlo, Courier, monospace;font-size: 16px;line-height: 1.5em;}</style>");
        $("body").append("<div><span>每页显示数量: </span><span><a href='https://www.douyu.com/japi/weblist/apinc/rec/lottery?num=5&page=1'>5</a>    </span><span><a href='https://www.douyu.com/japi/weblist/apinc/rec/lottery?num=10&page=1'>10</a></span>    <span><a href='https://www.douyu.com/japi/weblist/apinc/rec/lottery?num=15&page=1'>15</a>    </span><span><a href='https://www.douyu.com/japi/weblist/apinc/rec/lottery?num=20&page=1'>20</a></span>刷新<span></span></div>")
        start();
    })
})();