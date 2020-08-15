// ==UserScript==
// @name			斗鱼自动发送弹幕、领取鱼丸、清爽模式、调节画质（改）
// @namespace		http://tampermonkey.net/
// @version			1.3.12
// @icon			http://www.douyutv.com/favicon.ico
// @description		抄袭弹幕、循环弹幕、关键词回复、抽奖弹幕 ________ 关灯模式、清爽模式（显示直播时长，真实人数，去除弹幕标签） ________ 自动签到、领取鱼丸、默认最低（高）画质、禁止滚动弹幕、自动静音 ________ 设置界面功能自动化开启
// @author			H2P
// @compatible		chrome
// @require			https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// @require			https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js
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
// @note			2019.12.04 增加检测火力全开
// ==/UserScript==

(()=>{
	'use strict';

	// 解决 jQuery $ 符号冲突
	var $h2p_j = jQuery.noConflict();

	var BOOL_ok_sendBar = false;		// 自动弹幕模块是否装载完毕
	var BOOL_ok_clear = false;			// 自动清理模块是否装载完毕
	var BOOL_ok_config = false;			// 斗鱼设置模块是否装载完毕
	var BOOL_ok_localS = false;			// localStorage 是否读取完毕

	var BOOL_vue_sendBar= false;		// 自动弹幕模块 Vue 是否构建完毕
	var BOOL_vue_clear	= false;		// 自动清爽模式 Vue 是否构建完毕
	var BOOL_vue_config = false;		// 自动配置模块 Vue 是否构建完毕

	var viewShow_bar	=  false;
	var viewShow_clear	=  false;
	var viewShow_config	=  false;
	var viewShow_script	=  false;

	var isTopic = window.location.href.indexOf('/topic/') > -1;

	const MAX_barList = 120;			// 弹幕列表最多弹幕条数
	const MAX_DYWidth = 1200;

	var userInfo = {
		nickName	: '',				// 昵称
		isAnchorFan : false,			// 是否拥有主播的粉丝牌
	};

	window.roomInfo = {
		id		: '',
		showT	: 0,
		online	: 0,
		kind1	: '',
		kind2	: '',
	}

	var h2p_DYScript_configPre = {};

	// 创建元素样式
	var h2p_DYScript_style_sendBar = document.createElement('style');
	h2p_DYScript_style_sendBar.type = 'text/css';
	h2p_DYScript_style_sendBar.innerHTML = (()=>{/*
		.h2p-div-panel {
			position 		: absolute;
			bottom 			: 1px;
			min-width 		: 335px;
			max-width 		: 335px;
			border 			: none;
			border-radius	: 2px;
			margin 			: 0 0 0 -1px;
			box-shadow		: #c7c7c7 0 -10px 10px 0;
			display			: none;
			z-index 		: 999;
		}
		.h2p-div-inlinepanel {
			min-width 		: 315px;
			max-width 		: 315px;
			padding 		: 10px;
			border-width	: 0 0 1px 0;
			border-radius	: 2px;
			font-family		: WeibeiSC-Bold, STKaiti;
			font-size		: 16px;
			background		: #f5f5f5;
		}
		.h2p-div-inlinetab {
			min-width 		: 335px;
			max-width 		: 335px;
			border-top		: 1px solid #DCDCDC;
			border-radius	: 2px;
			font-family		: WeibeiSC-Bold, STKaiti;
			font-size		: 16px;
			background		: #f5f5f5;
		}
		.h2p-div-layer {
			position	: relative;
			width		: 100%;
			height		: 24px;
		}
		.h2p-div-layer-half {
			position	: absolute;
			width		: 50%;
			height		: 24px;
		}
		.h2p-div-layer-quar {
			position	: absolute;
			width		: 25%;
			height		: 24px;
		}
		.h2p-checkbox-left {
			position	: absolute;
			top			: 0;
			bottom		: 0;
			left		: 0;
			margin		: auto;
		}
		.h2p-input-normal {
			position		: relative;
			height			: 22px;
			padding			: 0px 5px;
			border			: 1px solid #708090;
			border-radius	: 5px;
			font-size		: 13px;
		}
		.h2p-input-disable {
			background		: #DCDCDC;
			cursor			: default;
		}
		.h2p-input-able {
			background		: white;
			cursor			: text;
		}
		.h2p-textarea-loopBarrage {
			width			: 287px;
			height			: 90px;
			padding			: 3px;
			border			: 1px solid #708090;
			border-radius	: 5px;
			margin			: 0 0 0 20px;
			font-size		: 13px;
			resize			: none;
		}
		.h2p-btn-sendBar {
			width			: 100%;
			height			: 100%;
			padding			: 4px 0;
			border			: none;
			border-radius	: 5px;
			margin			: 0;
			font-size		: 13px;
			background		: #00ddbb;
			cursor			: pointer;
		}
		.h2p-div-sign {
			width			: 18px;
			height			: 18px;
			display			: inline-block;
			vertical-align 	: middle;
		}
		.h2p-div-tab {
			width			: 33.3%;
			max-height		: 29px;
			padding			: 2px 0;
			text-align		: center;
			display			: inline-block;
		}
		.h2p-div-tab:hover {
			cursor			: pointer;
			background		: #DDDDDD;
		}
		.h2p-span-sign {
			font-size		: 18px;
			cursor			: pointer;
		}
		.h2p-label-checkbox-left { margin : 0 0 0 20px }
		.h2p-color-font-green { color : #228B22 }
		.h2p-hover-pointer:hover {
			cursor			: pointer;
			background		: #DDDDDD;
		}
		.h2p-bg-close	{ background : #00ddbb }
		.h2p-bg-close:hover{ background : #00ccaa }
		.h2p-bg-open	{ background : #99aaff }
		.h2p-bg-open:hover	{ background : #8899cc }
	*/}).toString().split('/*')[1].split('*/')[0];
	document.head.appendChild(h2p_DYScript_style_sendBar);


	// 整个面板 ===============================================================
	var div_DYScript = $h2p_j('<div id="div-DYScript" class="h2p-div-panel"></div>');

	// 面板底部功能键
	var div_DYScriptTab = ()=>{
		var greyAllTabs = () => {
			$h2p_j('div#div-sendBar').hide();
			$h2p_j('div#div-tab-sendBarrage').css('background', '#f5f5f5');
			$h2p_j('div#div-DYLight').hide();
			$h2p_j('div#div-tab-DYLight').css('background', '#f5f5f5');
			$h2p_j('div#div-config').hide();
			$h2p_j('div#div-tab-config').css('background', '#f5f5f5');
		}

		let div_DYScriptTab = $h2p_j('<div id="div-DYScriptTab" class="h2p-div-inlinetab"></div>');

		// 发弹幕
		let div_tab_barrage = $h2p_j('<div id="div-tab-sendBarrage" class="h2p-div-tab" style="background: #DDDDDD;" title="发弹幕">📢</div>');
		$h2p_j(div_tab_barrage).click(()=>{
			greyAllTabs();
			$h2p_j('div#div-sendBar').show();
			$h2p_j('div#div-tab-sendBarrage').css('background', '#DDDDDD');
			viewShow_bar = true;
			viewShow_clear = false;
			viewShow_config = false;
		});

		// 清爽模式
		let div_tab_light = $h2p_j('<div id="div-tab-DYLight" class="h2p-div-tab" style="width: 33.4%" title="清爽模式">✡️</div>');
		$h2p_j(div_tab_light).click(()=>{
			greyAllTabs();
			$h2p_j('div#div-DYLight').show();
			$h2p_j('div#div-tab-DYLight').css('background', '#DDDDDD');
			viewShow_bar = false;
			viewShow_clear = true;
			viewShow_config = false;
		});

		// 自动化设置
		let div_tab_setting = $h2p_j('<div id="div-tab-config" class="h2p-div-tab" title="自动化设置">⏲️</div>');
		$h2p_j(div_tab_setting).click(()=>{
			greyAllTabs();
			$h2p_j('div#div-config').show();
			$h2p_j('div#div-tab-config').css('background', '#DDDDDD');
			viewShow_bar = false;
			viewShow_clear = false;
			viewShow_config = true;
		});

		$h2p_j(div_DYScriptTab).append( div_tab_barrage );
		$h2p_j(div_DYScriptTab).append( div_tab_light );
		$h2p_j(div_DYScriptTab).append( div_tab_setting );

		return div_DYScriptTab;
	};








// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// 发弹幕
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //








	// 初始化自动发弹幕界面  ===============================================================
	(()=>{
		var str_div_bar = (()=>{/*
			<div id="div-sendBar" class="h2p-div-inlinepanel">
				<!-- 发送弹幕的速度 And 倒计时 -->
				<div class="h2p-div-layer">
					<label>间隔：</label>
					<input id="input-sendBar-speedMin" class="h2p-input-normal" :class="[ isSending ? 'h2p-input-disable' : 'h2p-input-able' ]" style="width: 44px; margin-left: -10px" placeholder=">2000" v-model="speedMin" @keyup="speedCheck" @blur="speedMinStore" :disabled="isSending" />
					<i>~</i>
					<input id="input-sendBar-speedMax" class="h2p-input-normal" :class="[ isSending ? 'h2p-input-disable' : 'h2p-input-able' ]" style="width: 44px;" placeholder=">2000" v-model="speedMax" @keyup="speedCheck" @blur="speedMaxStore" :disabled="isSending" />
					<label>毫秒</label>
					<input id="input-sendBar-timeTotal" class="h2p-input-normal" :class="[ isSending ? 'h2p-input-disable' : 'h2p-input-able' ]" style="width: 44px; margin-left: -10px" placeholder=">2000" v-model="timeTotal" @keyup="speedCheck" @blur="timeTotalStore" :disabled="isSending" />
					<input id="input-CD" class="h2p-input-normal h2p-input-disable" style="position: absolute; right: 0; width: 32px;" v-model="CD_sendBar" disabled/>
				</div>

				<hr style="margin: 3px; border: 1px solid transparent;">

				<!-- 是否发送抄袭弹幕 -->
				<div class="h2p-div-layer" style="height: 22px;">
					<div class="h2p-div-layer-half">
						<input id="input-bar-isCopy" class="h2p-checkbox-left" type="checkbox" :checked="isCopy" @click="change_isCopy" />
						<label class="h2p-label-checkbox-left">发送抄袭弹幕</label>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%">
						<label class="h2p-color-font-green">抄袭间隔：</label>
						<input id="input-copyBar-interval" class="h2p-input-normal" style="position: absolute; width: 65px;" placeholder="默认 0 条" @keyup="copyINVLInput" @blur="copyINVLBlur" v-model="INVL_copy" />
					</div>
				</div>

				<hr style="margin: 3px; border: 1px solid transparent;">

				<!-- 是否发送循环弹幕 -->
				<div class="h2p-div-layer" style="height: 98px;">
					<input id="input-bar-isLoop" class="h2p-checkbox-left" type="checkbox" :checked="isLoop" @click="change_isLoop" />
					<textarea id="input-loopBar-content" class="h2p-textarea-loopBarrage" :class="[ isSending ? 'h2p-input-disable' : 'h2p-input-able' ]" placeholder="循环弹幕" @change="loopBarInput" @blur="loopBarStore" :disabled="isSending"></textarea>
				</div>



				<hr style="margin: 3px; border: 1px solid transparent;">

				<!-- 是否使用关键词自动回复 -->
				<div class="h2p-div-layer">
					<div class="h2p-div-layer-half">
						<input id="input-bar-isKeyReply" class="h2p-checkbox-left" type="checkbox" :checked="isKeyReply" @click="change_isKeyReply" />
						<label class="h2p-label-checkbox-left">关键词回复</label>
						<button class="h2p-hover-pointer" style="width: 26px; border-radius: 50%" title="添加关键词" @click="keyReplyAdd">+</button>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%">
						<select id="select-keyReply" style="width: 100%; height: 24px;" @click="keyReplySelect" @change="keyReplySelect">
							<option v-for="keyReply in keyReplys" :value="keyReply.value">{{ keyReply.key }}</option>
						</select>
					</div>
				</div>
				<hr style="margin: 3px; border: 1px solid transparent;">
				<div class="h2p-div-layer">
					<div class="h2p-div-layer-half">
						<button class="h2p-checkbox-left h2p-hover-pointer" style="border-radius: 50%" title="删除关键词"  @click="keyReplyDel">-</button>
						<input id="input-keyReply-key" class="h2p-input-normal h2p-label-checkbox-left" style="width: 70%;" placeholder="关键词" v-model="key" @keyup="keyReplyStore">
					</div>
					<div class="h2p-div-layer-half" style="left: 50%">
						<input id="input-keyReply-reply" class="h2p-input-normal" style="width: 90%; padding: 0 4.2%;" placeholder="自动回复弹幕" v-model="reply" @keyup="keyReplyStore" />
					</div>
				</div>

				<hr style="margin: 3px; border: 1px solid transparent;">

				<!-- 是否参加弹幕抽奖 -->
				<div class="h2p-div-layer">
					<div class="h2p-div-layer-half">
						<input id="input-bar-isLuckDraw" class="h2p-checkbox-left" type="checkbox" :checked="isLuckDraw" @click="change_isLuckDraw" />
						<label class="h2p-label-checkbox-left">发送抽奖弹幕</label>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%">
						<label class="h2p-color-font-green">抽奖发送：</label>
						<input class="h2p-input-normal h2p-input-disable" style="width: 22px; margin-left: -15px;" v-model="CNT_luckDraw" disabled />
						<i style="margin: 0 -5px">/</i>
						<input class="h2p-input-normal" :class="[ isSending ? 'h2p-input-disable' : 'h2p-input-able' ]" style="width: 22px;" placeholder="默认 2 次" v-model="CNT_luckDrawTotal" @keyup="luckDrawCountInput" @blur="luckDrawCountBlur" :disabled="isSending" />
					</div>
				</div>

				<hr style="margin: 3px; border: 1px solid transparent;">

				<!-- 开启弹幕发送按钮 -->
				<div class="h2p-div-layer">
					<button id="btn-sendBar" class="h2p-btn-sendBar" :class="{'h2p-bg-open':isSending, 'h2p-bg-close':!isSending}" @click="openAutoSendBar">{{ Con_btnSend }}</button>
				</div>
			</div>
		*/}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
		var div_bar = $h2p_j(str_div_bar);

		$h2p_j(div_DYScript).append(div_bar);

		// 检查弹幕面板挂载点（斗鱼弹幕显示区域）是否加载完成
		var check_mountPoint_barPanel = setInterval( ()=>{
			if ( $h2p_j('div.layout-Player-asideMainTop').length > 0 && $h2p_j('div.BarrageSuperLink').length > 0 ) {
				window.clearInterval( check_mountPoint_barPanel );
				check_mountPoint_barPanel = undefined;
				setTimeout( ()=>{ $h2p_j('div.layout-Player-asideMainTop').append( div_DYScript ); }, 2000);
			}
		}, 1000);

		// 检查弹幕图标挂载点（斗鱼弹幕输入框）是否加载完成
		var check_mountPoint_barIcon = setInterval( ()=>{
			if ( $h2p_j('div#div-sendBar').length > 0 ) {
				window.clearInterval( check_mountPoint_barIcon );
				check_mountPoint_barIcon = undefined;
				BOOL_ok_sendBar = true;
			}
		}, 1000);
	})();

	let INVL_barSend= undefined;	// 自动发弹幕
	let INVL_barCD	= undefined;	// 弹幕倒计时

	let speed = 0;					// 弹幕发送间隔时间
	const speedDef	= 6000;			// 弹幕发送默认间隔时间
	let loopBarConTemp = '';		// 循环弹幕临时缓存
	let luckDrawBar	= '';			// 抽奖弹幕内容
	let CD_luckDraw	= 0;			// 弹幕抽奖活动倒计时
	const CNT_luckDrawDef = 2;		// 抽奖弹幕默认发送次数
	let INDEX_keyReply = 0;			// 关键词回复弹幕列表已经检测的位置

	window.vue_sendBar = undefined;
	// 发送弹幕组件构建 Vue
	var INVL_createVue_sendBar = setInterval( ()=>{
		if ( BOOL_ok_sendBar ) {
			vue_sendBar = new Vue({
				el		: '#div-sendBar',
				data	: {
					speedMin	: 2500,
					speedMax	: 3500,
					isCopy		: false,
					isLoop		: false,
					isKeyReply	: false,
					isLuckDraw	: false,
					keyReplys	: [],
					key			: '',
					reply		: '',
					INVL_copy	: 0,				// 抄袭间隔弹幕数目
					CD_sendBar	: 0,				// 弹幕倒计时
					CNT_luckDraw: 0,				// 抽奖弹幕实际发送次数
					CNT_luckDrawTotal: 180,			// 抽奖弹幕总共发送次数
					//count_actuallySended: 0,		// 自定义弹幕已发送次数
					//count_totalSend: 2,			// 自定义弹幕总共发送次数
					timeTotal: 500,					// 发送总时间
					//timeRemain: 0,				// 剩余时间
					Con_btnSend	: '发送',
					isSending	: false,
				},
				computed: {},
				methods	: {
					isStrNone			: (str)=>{ return str == undefined || str.length == 0; },
					change_isCopy		: ()=>{ vue_sendBar.isCopy		= !vue_sendBar.isCopy; },
					change_isLoop		: ()=>{ vue_sendBar.isLoop		= !vue_sendBar.isLoop; },
					change_isKeyReply	: ()=>{ vue_sendBar.isKeyReply	= !vue_sendBar.isKeyReply; },
					change_isLuckDraw	: ()=>{ vue_sendBar.isLuckDraw	= !vue_sendBar.isLuckDraw; },
					lenCheck	: (value, len)=>{
						value = value.replace(/[^\d]/g,'');
						if ( value.length > len ) { value = value.substr(0, len); }
						return value;
					},
					numCheck	: (value, len)=>{
						value = value.replace(/[^\d]/g,'');
						while( value.length > 0 && value[0] == '0' ) { value = value.substr(1, value.length); }
						if ( value.length > len ) { value = value.substr(0, len); }
						return value;
					},
					copyINVLInput	: ()=>{
						vue_sendBar.INVL_copy = vue_sendBar.lenCheck(vue_sendBar.INVL_copy, 3);
					},
					copyINVLBlur	: ()=>{
						vue_sendBar.INVL_copy = vue_sendBar.lenCheck(vue_sendBar.INVL_copy, 3);
						if ( vue_sendBar.INVL_copy.length == 0 ) { vue_sendBar.INVL_copy = 0; }
						h2p_DYScript_config.INVL_copy = parseInt(vue_sendBar.INVL_copy);
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					speedCheck		: (event)=>{
						let value = $h2p_j(event.target).val();
						value = vue_sendBar.lenCheck(value, 6);
						$h2p_j(event.target).val(value)
					},
					speedMinStore	: ()=>{
						vue_sendBar.speedMin = vue_sendBar.numCheck(vue_sendBar.speedMin, 6);
						vue_sendBar.speedMin = parseInt(vue_sendBar.speedMin) ? parseInt(vue_sendBar.speedMin) : speedDef;
						h2p_DYScript_config.speedMin = vue_sendBar.speedMin;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					speedMaxStore	: (event)=>{
						vue_sendBar.speedMax = vue_sendBar.numCheck(vue_sendBar.speedMax, 6);
						vue_sendBar.speedMax = parseInt(vue_sendBar.speedMax) ? parseInt(vue_sendBar.speedMax) : vue_sendBar.speedMin + 1500;
						h2p_DYScript_config.speedMax = vue_sendBar.speedMax > vue_sendBar.speedMin ? vue_sendBar.speedMax : vue_sendBar.speedMin + 1500;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					timeTotalStore	: ()=>{
						vue_sendBar.totalTime = vue_sendBar.numCheck(vue_sendBar.totalTime, 6);
						vue_sendBar.totalTime = parseInt(vue_sendBar.totalTime) ? parseInt(vue_sendBar.totalTime) : speedDef;
						h2p_DYScript_config.totalTime = vue_sendBar.totalTime;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					loopBarInput	: (event)=>{
						loopBarConTemp = $h2p_j(event.target).val();
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					loopBarStore	: ()=>{
						if ( loopBarConTemp.length > 0 ) {
							h2p_DYScript_config.loopBarCon = loopBarConTemp;
							loopBarConTemp = '';
							localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
						}
					},
					keyReplyAdd		: ()=>{
						vue_sendBar.key = '&待定&';
						vue_sendBar.reply = '';
						let keyReply = { 'key' :  vue_sendBar.key, 'value' : vue_sendBar.reply };
						vue_sendBar.keyReplys.push(keyReply);
						h2p_DYScript_config.keyReplys.push(keyReply);
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
						setTimeout(()=>{
							$h2p_j('#select-keyReply > option:last').attr('selected', 'true');
						}, 100);
					},
					keyReplyDel		: ()=>{
						let index = document.getElementById('select-keyReply').selectedIndex;
						Vue.delete(vue_sendBar.keyReplys, index);
						h2p_DYScript_config.keyReplys.splice(index, 1);
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );

						setTimeout(()=>{
							// 关键词和回复全部删除了
							if ( $h2p_j('select#select-keyReply option:selected').length > 0 ) {
								let option = $h2p_j('select#select-keyReply option:selected');
								vue_sendBar.key = option.text();
								vue_sendBar.reply = option.val();
							} else {
								vue_sendBar.key = '';
								vue_sendBar.reply = '';
							}
						}, 100);
					},
					// select 元素选择 option
					keyReplySelect	: ()=>{
						let option = $h2p_j('select#select-keyReply option:selected');
						vue_sendBar.key = option.text();
						vue_sendBar.reply = option.val();
					},
					keyReplyStore	: ()=>{
						let index = document.getElementById('select-keyReply').selectedIndex;
						let keyReply = { 'key' : vue_sendBar.key, 'value' : vue_sendBar.reply };
						Vue.set(vue_sendBar.keyReplys, index, keyReply);
						h2p_DYScript_config.keyReplys.splice(index, 1, keyReply);
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					// 抽奖弹幕输入框输入检测
					luckDrawCountInput	: (event)=>{
						let value = $h2p_j(event.target).val();
						value = vue_sendBar.lenCheck(value, 3);
						vue_sendBar.CNT_luckDrawTotal = parseInt(value) ? parseInt(value) : '';
					},
					// 抽奖弹幕输入框失去焦点
					luckDrawCountBlur	: (event)=>{
						let value = $h2p_j(event.target).val();
						value = vue_sendBar.numCheck(value, 3);
						vue_sendBar.CNT_luckDrawTotal = parseInt(value) ? parseInt(value) : CNT_luckDrawDef;
					},
					sendBar	: ()=>{
						let barrage = '';

						// 优先抽奖弹幕
						if ( vue_sendBar.isLuckDraw && $h2p_j('div.LotteryDrawEnter-desc').length > 0 ){
							// 计算目前倒计时
							let CD_luckDraw_now = $h2p_j('div.LotteryDrawEnter-desc').text().split(':').reduce( (valPrev, val)=>{return parseInt(valPrev) * 60 + parseInt(val);} );

							// 判断是否是新一轮抽奖
							if ( CD_luckDraw_now > CD_luckDraw ) {
								// 清除上一轮抽奖内容
								luckDrawBar = undefined;
								// 新一轮抽奖弹幕
								vue_sendBar.CNT_luckDraw = 0;
								// 显示抽奖内容
								$h2p_j('div.LotteryDrawEnter-enter').click();

								try{
									// 获取抽奖弹幕条件
									let barREQM = $h2p_j('div.ULotteryStart-joinRule').text().split('：')[1];
									const REQMs = ['发弹幕', '发弹幕+关注主播'];
									let r_htmlEle = /(<[\d\w\s\;\:\'\"\,\.\/\?\!\@\#\$\%\^\&\*\(\)\-\_\=\+]+\/*>)/
									// 不是赠送、礼物、福袋、数字、盛典
									let regex = /[\u8d60\u9001\u793c\u7269\u798f\u888b\d\u76db\u5178]+/g;
									if ( barREQM.search(regex) < 0 && ( REQMs.indexOf(barREQM) > -1 || (userInfo.isAnchorFan && barREQM.indexOf('成为粉丝') > -1) ) ) {
										// 一键参与
										$h2p_j('div.ULotteryStart-joinBtn').click();
										// 获取抽奖弹幕内容
										luckDrawBar = $h2p_j('div.ULotteryStart-demandDanmu > span:eq(0)').text();
										luckDrawBar = luckDrawBar.split('：')[1] ? luckDrawBar.split('：')[1] : luckDrawBar.split('：')[0];
										luckDrawBar = luckDrawBar.slice(0, -2);
									}
								} catch (err) { console.log('不是弹幕抽奖'); }
								finally { $h2p_j('span.LotteryContainer-close').click(); }
							}

							barrage = vue_sendBar.CNT_luckDraw < vue_sendBar.CNT_luckDrawTotal ? luckDrawBar : '';
							if ( barrage != undefined && barrage.length > 0 ) { vue_sendBar.CNT_luckDraw++; }
							CD_luckDraw = CD_luckDraw_now;
						}

						// 关键词弹幕回复
						if ( vue_sendBar.isStrNone(barrage) && vue_sendBar.isKeyReply  ) {
							let bars = $h2p_j('ul#js-barrage-list > li');
							if ( bars.length > MAX_barList ) {
								let surplusNum = bars.length - MAX_barList;
								$h2p_j('#js-barrage-list > li:lt(' + surplusNum + ')').toggle();
								INDEX_keyReply = INDEX_keyReply > surplusNum ? INDEX_keyReply - surplusNum : 0;
								bars = $h2p_j('ul#js-barrage-list > li');
							}
							for ( let i = INDEX_keyReply; i < bars.length; i++ ) {
								INDEX_keyReply++;
								let ele = bars[i];
								let bar_check = $h2p_j(ele).find('span[class^="Barrage-content"]').text().replace(/\s/g, '');
								let nickName = $h2p_j(ele).find('span[class^="Barrage-nickName"]').attr('title');
								let keys = [];
								let keyReplys = vue_sendBar.keyReplys;
								for ( let i = 0; i < keyReplys.length; i++ ){
									let keyReply = keyReplys[i];
									if ( keyReply.key != undefined && keyReply.key.length > 0 && keyReply.key != '&待定&' ) { keys.push(keyReply.key); }
								}
								let index = ((bar_check) => {
									for ( let j = 0; j < keys.length; j++ ) {
										// 不回复自己的弹幕
										if ( bar_check.indexOf(keys[j]) > -1 && nickName != userInfo.nickName ) { return j; }
									}
									return -1;
								})(bar_check);
								barrage = index > -1 && index < keyReplys.length ? keyReplys[index].value : '';
								if ( !vue_sendBar.isStrNone(barrage) ) break;
							}
						}


						// 循环发送抄袭弹幕
						if ( vue_sendBar.isStrNone(barrage) && ( ( vue_sendBar.isCopy && !vue_sendBar.isLoop ) || ( vue_sendBar.isCopy && vue_sendBar.isLoop && Math.random() > 0.5 ) ) ) {
							if ( $h2p_j('span.Barrage-content').length > 0 ) {
								let barListLen = $h2p_j('span.Barrage-content').length;
								let index = barListLen - 1;
								if ( vue_sendBar.INVL_copy < barListLen - 1 ) { index -= vue_sendBar.INVL_copy; }
								else { index -= Math.floor( Math.random * (barListLen - 1) ); }
								barrage = $h2p_j('span.Barrage-content:eq(' + index + ')').text().replace(/\s/g, '');
								barrage = barrage.length > 0 ? barrage : $h2p_j('span.Barrage-content:eq(' + (index + 1) + ')').text().replace(/\s/g, '');
							}
						}

						// 循环发送自定义弹幕
						/*
						if ( vue_sendBar.isStrNone(barrage) && vue_sendBar.isLoop ) {
							let barrageLoop = $h2p_j('textarea#input-loopBar-content').val().split('\n');
							let index = Math.round( Math.random()*barrageLoop.length );
							barrage = barrageLoop[index] ? barrageLoop[index] : barrageLoop[0];
						}

						if ( !vue_sendBar.isStrNone(barrage) ) {
							if ( barrage.indexOf('{showT}') > -1 ) {
								if ( roomInfo.showT > 0 ) {
									let showT = parseInt( (new Date().getTime() / 1000) - roomInfo.showT) / 3600.0;
									let h = parseInt( showT );
									let m = parseInt( ( showT - h ) * 60 );
									let str_showT = h + '小时' + m + '分钟';
									barrage = barrage.replace('{showT}', str_showT);
								} else { barrage = barrage.replace('{showT}', '0'); }
							}
							$h2p_j('textarea.ChatSend-txt').val(barrage);
							if ( $h2p_j('div.ChatSend-button.is-gray').length == 0 ) { $h2p_j('div.ChatSend-button').click(); }
						}

						if ( INVL_barCD == undefined ) { setINVL_barCD(); }

						// 重新计算发送速度
						speed = Math.floor( Math.random() * (vue_sendBar.speedMax - vue_sendBar.speedMin) + vue_sendBar.speedMin );
						// 重新显示倒计时
						vue_sendBar.CD_sendBar = parseInt( speed / 100 ) / 10.0;
						window.clearInterval(INVL_barSend);
						INVL_barSend = setInterval(vue_sendBar.sendBar, speed);
						*/

						//改自定义弹幕，次数控制
						
						if ( vue_sendBar.isStrNone(barrage) && vue_sendBar.isLoop ) {
							let barrageLoop = $h2p_j('textarea#input-loopBar-content').val().split('\n');
							let index = Math.round( Math.random()*barrageLoop.length );
							barrage = barrageLoop[index] ? barrageLoop[index] : barrageLoop[0];
						}

						if ( !vue_sendBar.isStrNone(barrage) ) {
							if ( barrage.indexOf('{showT}') > -1 ) {
								if ( roomInfo.showT > 0 ) {
									let showT = parseInt( (new Date().getTime() / 1000) - roomInfo.showT) / 3600.0;
									let h = parseInt( showT );
									let m = parseInt( ( showT - h ) * 60 );
									let str_showT = h + '小时' + m + '分钟';
									barrage = barrage.replace('{showT}', str_showT);
								} else { barrage = barrage.replace('{showT}', '0'); }
							}
							$h2p_j('textarea.ChatSend-txt').val(barrage);
							if ( $h2p_j('div.ChatSend-button.is-gray').length == 0 ) {
								$h2p_j('div.ChatSend-button').click();
								//实际发送弹幕数+1
								vue_sendBar.CNT_luckDraw++;
							}
						}

						if ( INVL_barCD == undefined ) { setINVL_barCD(); }

						//达到次数停止循环
						if(vue_sendBar.CNT_luckDraw < vue_sendBar.CNT_luckDrawTotal){
							// 重新计算发送速度
							speed = Math.floor( Math.random() * (vue_sendBar.speedMax - vue_sendBar.speedMin) + vue_sendBar.speedMin );
							// 重新显示倒计时
							vue_sendBar.CD_sendBar = parseInt( speed / 100 ) / 10.0;
							window.clearInterval(INVL_barSend);
							INVL_barSend = setInterval(vue_sendBar.sendBar, speed);
						}else{
							//达量停止前才清零
							//vue_sendBar.CNT_luckDraw = 0;
							vue_sendBar.openAutoSendBar();
						}
						

						//改自定义弹幕，时间控制
						/*
						if ( vue_sendBar.isStrNone(barrage) && vue_sendBar.isLoop ) {
							let barrageLoop = $h2p_j('textarea#input-loopBar-content').val().split('\n');
							let index = Math.round( Math.random()*barrageLoop.length );
							barrage = barrageLoop[index] ? barrageLoop[index] : barrageLoop[0];
						}

						if ( !vue_sendBar.isStrNone(barrage) ) {
							if ( barrage.indexOf('{showT}') > -1 ) {
								if ( roomInfo.showT > 0 ) {
									let showT = parseInt( (new Date().getTime() / 1000) - roomInfo.showT) / 3600.0;
									let h = parseInt( showT );
									let m = parseInt( ( showT - h ) * 60 );
									let str_showT = h + '小时' + m + '分钟';
									barrage = barrage.replace('{showT}', str_showT);
								} else { barrage = barrage.replace('{showT}', '0'); }
							}
							$h2p_j('textarea.ChatSend-txt').val(barrage);
							if ( $h2p_j('div.ChatSend-button.is-gray').length == 0 ) {
								$h2p_j('div.ChatSend-button').click();
							}
						}

						// 重新计算剩余时间
						vue_sendBar.timeTotal = vue_sendBar.timeTotal - vue_sendBar.CD_sendBar;

						// 时间判定
						if(vue_sendBar.timeTotal > vue_sendBar.CD_sendBar){
							// 重新计算发送速度
							speed = Math.floor( Math.random() * (vue_sendBar.speedMax - vue_sendBar.speedMin) + vue_sendBar.speedMin );
							// 重新显示倒计时
							vue_sendBar.CD_sendBar = parseInt( speed / 100 ) / 10.0;
							window.clearInterval(INVL_barSend);

							// speed毫秒后循环调用
							INVL_barSend = setInterval(vue_sendBar.sendBar, speed);
						}else{
							vue_sendBar.openAutoSendBar();
						}
						*/
					},

					// 开启发送弹幕
					setINVL_autoSendBar	: ()=>{
						speed = Math.floor( Math.random() * (vue_sendBar.speedMax - vue_sendBar.speedMin) + vue_sendBar.speedMin );
						vue_sendBar.isSending = true;
						vue_sendBar.CNT_luckDraw = 0;

						$h2p_j('#div-tab-sendBarrage').text('🔥');

						INVL_barSend = setInterval(vue_sendBar.sendBar, speed);
					},
					// 停止发送弹幕
					clearINVL_autoSendBar : ()=>{
						window.clearTimeout(INVL_barSend);
						INVL_barSend = undefined;

						vue_sendBar.isSending = false;

						$h2p_j('#div-tab-sendBarrage').text('📢');
					},
					// 开启倒计时
					setINVL_barCD : ()=>{
						if ( vue_sendBar.CD_sendBar <= 0 ) { vue_sendBar.CD_sendBar = parseInt( speed / 100 ) / 10; }
						INVL_barCD = setInterval( ()=>{
							if ( vue_sendBar.CD_sendBar <= 0 ) { vue_sendBar.CD_sendBar = parseInt( speed / 100 ) / 10; }
							vue_sendBar.CD_sendBar = ( vue_sendBar.CD_sendBar * 10 - 1 ) / 10;
						}, 100);
					},
					clearINVL_barCD : ()=>{
						window.clearInterval(INVL_barCD);
						INVL_barCD = undefined;
						vue_sendBar.CD_sendBar = 0;
					},
					// 开始发送弹幕和倒计时
					openAutoSendBar		: ()=>{
						//点击停止和达量停止都清零
						vue_sendBar.CNT_luckDraw = 0;
						vue_sendBar.clearINVL_barCD();
						if ( INVL_barSend == undefined ) {
							vue_sendBar.setINVL_autoSendBar();
							vue_sendBar.setINVL_barCD();
						}
						else { 
							vue_sendBar.clearINVL_autoSendBar(); 
						}
						vue_sendBar.Con_btnSend = vue_sendBar.isSending ? '停止发送' : '发送';
					},
				}
			});

			BOOL_vue_sendBar = true;
			window.clearInterval(INVL_createVue_sendBar);
			INVL_createVue_sendBar = undefined;
		}
	}, 100 );








// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// 清爽模式
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //








	// 创建元素样式
	var h2p_DYScript_style_clear = document.createElement('style');
	h2p_DYScript_style_clear.type = 'text/css';
	h2p_DYScript_style_clear.innerHTML = (()=>{/*
		.h2p-btn-hideAll-back {
			position 		: fixed;
			right			: 0;
			bottom			: 0;
			width			: 55px;
			height			: 55px;
			padding			: 10px;
			border			: none;
			font-size		: 13px;
			background		: transparent;
			cursor			: pointer;
			display			: none;
		}
		.h2p-btn {
			width			: 100%;
			height			: 100%;
			padding			: 4px 0;
			border			: none;
			border-radius	: 5px;
			margin			: 0;
			font-size		: 13px;
			cursor			: pointer;
		}
		.h2p-tag		{}
		.h2p-bg-red1	{ background : #ff8899 }
		.h2p-bg-red1:hover	{ background : #ff5566 }
		.h2p-top-0		{ top : 0!important }
		.h2p-w-96p		{ width : 96%!important }
		.h2p-h-100p 	{ height : 100%!important }
		.h2p-bg-black	{ background : black!important }
		.h2p-padding-15 { padding : 15px!important }
		.h2p-bottom-f-71{ bottom: -71px!important; }
		.h2p-toolBar	{
			height: 70px!important;
			position: absolute!important;
			right: 0!important;
			bottom: -71px!important;
			left: 0!important;
		}
		.h2p-toolBar-Wealth	{
			width: auto!important;
			margin-top: 10px!important;
			margin-right: 10px!important;
		}
	*/}).toString().split('/*')[1].split('*/')[0];
	document.head.appendChild(h2p_DYScript_style_clear);

	// 初始化自动发弹幕界面  ===============================================================
	(()=>{
		var str_div_light = (()=>{/*
			<div id="div-DYLight" class="h2p-div-inlinepanel" style="display: none">
				<hr style="margin: 6px; border: 1px solid transparent;">

				<!-- 导航栏、侧边栏、删除元素 -->
				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isClearHead, 'h2p-bg-close':!isClearHead}" @click="clearHead">导航栏</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isClearInfo, 'h2p-bg-close':!isClearInfo}" style="float: right" @click="clearInfo">信息栏</button>
							</div>
						</div>
					</div>
					<div class="h2p-div-layer-half" style="height: 100%; left: 50%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%; float: right">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isClearAside, 'h2p-bg-close':!isClearAside}" @click="clearAside">侧边栏</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
							</div>
						</div>
					</div>
				</div>

				<hr style="margin: 2px 6px; border: 1px solid transparent;">

				<!-- 信息栏、弹幕栏、礼物栏、鱼吧 -->
				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isClearGift, 'h2p-bg-close':!isClearGift}" @click="clearGift">礼物栏</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isClearBar, 'h2p-bg-close':!isClearBar}" style="float: right" @click="clearBar">弹幕栏</button>
							</div>
						</div>
					</div>
					<div class="h2p-div-layer-half" style="height: 100%; left: 50%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%; float: right">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isClearPlay, 'h2p-bg-close':!isClearPlay}" @click="clearPlay">播放器</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">

							</div>
						</div>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">

				<!-- 删除元素 -->
				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<button class="h2p-btn h2p-w-96p h2p-bg-red1" @click="cleanEle">删除元素</button>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">

				<!-- 清爽模式、关灯模式 -->
				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isHideCM, 'h2p-bg-close':!isHideCM}" @click="hideCM">清爽模式</button>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
						<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isHidePS, 'h2p-bg-close':!isHidePS}" style="float: right" @click="hidePS">关灯模式</button>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">

				<!-- 宽屏模式、网页全屏 -->
				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isHideWS, 'h2p-bg-close':!isHideWS}" @click="hideWS">宽屏模式</button>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
						<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':isHideFS, 'h2p-bg-close':!isHideFS}" style="float: right" @click="hideFS">网页全屏</button>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">
			</div>
		*/}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
		var div_light = $h2p_j(str_div_light);

		$h2p_j(div_DYScript).append(div_light);

		var check_mountPoint_lightIcon = setInterval( ()=>{
			if ( $h2p_j('div#div-DYLight').length > 0 ) {
				window.clearInterval( check_mountPoint_lightIcon );
				check_mountPoint_lightIcon = undefined;
				BOOL_ok_clear = true;
			}
		}, 1000);
	})();

	window.vue_light = undefined;
	// 清爽模式组件构建 Vue
	let startPS = 0;
	let startWS = 0;
	let startFS = 0;
	let waitMin = 3;
	let waitSec = 3;
	var INVL_createEle_onlineAndShowT = setInterval(()=>{
		if ( $h2p_j('div.Title-anchorInfo.clearFix a.Title-anchorHot').length > 0 ) {
			let ele_online = $h2p_j(`
				<div id="div-online-1" class="Title-anchorFriend" title="真实人数">
					<div class="Title-anchorFriendWrapper">
						<i class="Title-anchorFriendNumber">0</i>
					</div>
				</div>
				<a id="a-anchorShowT-1" class="Title-anchorHot" title="直播时长">
					<div class="AnchorFriendCard-avatar is-live" style="height: 19px; border: none; margin-right: 5px"></div>
					<div class="Title-anchorText">0</div>
				</a>
			`);
			$h2p_j('div.Title-anchorInfo.clearFix a.Title-anchorHot').after(ele_online);
			window.clearInterval(INVL_createEle_onlineAndShowT);
		}
	}, 500);
	var INVL_createVue_clear = setInterval( ()=>{
		if ( BOOL_ok_clear ) {
			// 在弹幕栏上添加热度
			if ( $h2p_j('div.layout-Player-announce > div#div-anchorHot').length == 0 ) {
				let ele = $h2p_j(`
					<div id="div-anchorHot" class="AnchorAnnounce h2p-h-100p" style="display: none">
						<a id="a-anchorHot" class="Title-anchorHot" title="直播热度">
							<i class="Title-anchorHotIcon"></i>
							<div class="Title-anchorText">0</div>
						</a>
						<div id="div-online-2" class="Title-anchorFriend" title="真实人数" style="margin: -3px 0 0 0;">
							<div class="Title-anchorFriendWrapper">
								<i class="Title-anchorFriendNumber">0</i>
							</div>
						</div>
						<a id="a-anchorShowT-2" class="Title-anchorHot" title="直播时长">
							<div class="AnchorFriendCard-avatar is-live" style="height: 19px; border: none; margin-right: 5px"></div>
							<div class="Title-anchorText">0</div>
						</a>
					</div>
				`);
				$h2p_j('div.layout-Player-announce').append(ele);

				setTimeout( ()=>{
					let anchorHot = parseInt( $h2p_j('div.Title-anchorInfo.clearFix > a.Title-anchorHot > div.Title-anchorText').text() );
					let str_anchorHot = '';
					if ( anchorHot > 9999 ) { str_anchorHot = parseInt(anchorHot/10000) + 'w'; }
					$h2p_j('a#a-anchorHot > div.Title-anchorText').text(str_anchorHot);
					let start_INVL = new Date().getTime() / 1000;
					let INVL_waitAnchorShowT = setInterval(()=>{
						if ( roomInfo.showT > 0 ) {
							window.clearInterval(INVL_waitAnchorShowT);
							let showT = parseInt( (new Date().getTime() / 1000) - roomInfo.showT) / 3600.0;
							let h = parseInt( showT );
							let m = parseInt( ( showT - h ) * 60 );
							let s = parseInt( (( showT - h ) * 60 - m ) * 60 );
							setInterval(()=>{
								s += 1;
								if ( s >= 60 ) {
									m += 1;
									s = 0;
								}
								if ( m >= 60 ) {
									h += 1;
									m = 0;
								}
								let strShowT = `${h}:`;
								if ( m >= 10 ) { strShowT += m + ':'; }
								else { strShowT += '0' + m + ':'; }
								if ( s >= 10 ) { strShowT += s; }
								else { strShowT += '0' + s; }
								$h2p_j('a#a-anchorShowT-1 > div.Title-anchorText').text(strShowT);
								$h2p_j('a#a-anchorShowT-2 > div.Title-anchorText').text(strShowT);
							}, 1000);
						} else {
							if ( ((new Date().getTime() / 1000) - start_INVL) > 15 ) {
								window.clearInterval(INVL_waitAnchorShowT);
								console.log(`直播间信息 ${JSON.stringify(roomInfo)}`)
							}
						}
					}, 1000);
					setInterval(()=>{
						let anchorHot = parseInt($h2p_j('div.Title-anchorInfo.clearFix > a.Title-anchorHot[href^="//"] > div.Title-anchorText').text());
						let str_anchorHot = '' + anchorHot;
						if ( anchorHot > 9999 ) { str_anchorHot = parseInt(anchorHot/10000) + 'w'; }
						$h2p_j('a#a-anchorHot > div.Title-anchorText').text(str_anchorHot);

						let online = roomInfo.online;
						let str_online = '' + online;
						if ( online > 9999 ) { str_online = parseInt(online/10000) + 'w'; }
						$h2p_j('div#div-online-1 i.Title-anchorFriendNumber').text(str_online);
						$h2p_j('div#div-online-2 i.Title-anchorFriendNumber').text(str_online);
					}, 5000);
				}, 200);
			}

			vue_light = new Vue({
				el		: '#div-DYLight',
				data	: {
					isClearHead	: false,
					isClearAside: false,
					isClearInfo	: false,
					isClearBar	: false,
					isClearGift	: false,
					isClearPlay	: false,
					isCleanEle	: false,
					isHideCM	: false,
					isHidePS	: false,
					isHideWS	: false,
					isHideFS	: false,
					topicBG		: '',
					topicH		: 0,
				},
				methods	: {
					clearHead	: ()=>{
						// 斗鱼 logo、粉丝节、客户端、开播、创世幻神
						let eles = ['a.Header-logo', 'div.HeaderNav', 'div.Header-download-wrap', 'div.Header-broadcast-wrap', 'span.HeaderGif-left', 'span.HeaderGif-right', 'ul.Header-menu > li:eq(1)', 'ul.Header-menu > li:gt(2)'];
						eles.forEach( ele => { $h2p_j(ele).toggle(); } );
						vue_light.isClearHead = !vue_light.isClearHead;
					},
					clearAside	: ()=>{
						$h2p_j('aside#js-aside').toggle();
						vue_light.isClearAside = !vue_light.isClearAside;
					},
					clearInfo	: ()=>{
						$h2p_j('div#js-player-title').css('min-height', 'auto');
						// 头像、名称、成就、他的视频、分享、添加友邻、游戏公会
						let eles = ['div.Title-anchorPic', 'div.Title-headline', 'div.Title-impress.clearFix', 'div.Title-roomOtherTop > a.Title-videoSiteLink', 'div.Title-roomOtherBottom', 'div.Title-addFriend', 'div.Title-columnTag', 'div.SociatyLabel'];
						eles.forEach( ele => { $h2p_j(ele).toggle(); } );
						$h2p_j('div.Title').toggleClass('h2p-h-100p');
						vue_light.isClearInfo = !vue_light.isClearInfo;
					},
					clearBar	: ()=>{
						$h2p_j('div[class="AnchorAnnounce"]').toggle();
						$h2p_j('div.MatchSystemChatRoomEntry').toggle();
						$h2p_j('div.layout-Player-rank').toggle();
						$h2p_j('div#js-player-barrage').toggleClass('h2p-top-0');
						// 弹幕输入框
						$h2p_j('div.Horn4Category').toggle();
						$h2p_j('div.ChatNobleBarrage').toggle();
						$h2p_j('div.BarrageSuperLink').toggle();
						$h2p_j('div#div-anchorHot').toggle();
						// 直播热度和真实人数
						$h2p_j('div.Title-anchorInfo.clearFix a.Title-anchorHot').toggle();
						$h2p_j('div#div-online-1').toggle();
						vue_light.isClearBar = !vue_light.isClearBar;
					},
					clearGift	: ()=>{
						$h2p_j('div.layout-Player-toolbar').toggleClass('h2p-toolBar');
						// 礼物、任务大厅、点击展开、玩游戏豪送、抢位英雄
						let eles = ['div.PlayerToolbar-GiftWrap', 'div.PlayerToolbar-Task', 'div.ExpandWrap', 'div.PlayerToolbar-signCont',];
						eles.forEach( ele => { $h2p_j(ele).toggle(); } );
						setTimeout(()=>{
							let eleHides = ['div.ActivityList > div', 'div.ActivityList > div[data-flag="grab_hero"]']
							eleHides.forEach( ele => { $h2p_j(ele).hide(); } );
							let eleShows = ['div.ActivityList > div[data-flag="anchor_quiz"]', 'div.ActivityList > div[data-flag="room_level"]']
							eleShows.forEach( ele => { $h2p_j(ele).show(); } );
						}, 500);
						// $h2p_j('div.PlayerToolbar').toggleClass('h2p-padding-15');
						$h2p_j('div.PlayerToolbar-Wealth').toggleClass('h2p-toolBar-Wealth');
						$h2p_j('div.layout-Player-asideMain').toggleClass('h2p-bottom-f-71');
						vue_light.isClearGift = !vue_light.isClearGift;
					},
					clearPlay	: ()=>{
						// topic
						if ( !vue_light.isCleanEle ) {
							$h2p_j('video.video-header').toggle();
							$h2p_j('div.bc-wrapper:first').toggle();
							if ( !vue_light.isClearPlay ) {
								let distance = $h2p_j('header#js-header').height() + 10;
								$h2p_j('div.bc-wrapper:eq(1)').css('margin-top', distance + 'px');
							} else {
								$h2p_j('div.bc-wrapper:eq(1)').css('margin-top', '');
							}
						}
						$h2p_j('div.bc-wrapper:gt(1)').toggle();
						$h2p_j('div.MatchSystemGuide').toggle();

						let eles = ['div#js-bottom', 'div.guessGameContainer.is-normalRoom', 'div.ActivityList > div.ActivityItem:gt(0)'];
						eles.forEach( ele => { $h2p_j(ele).toggle(); } );
						$h2p_j('div#js-room-activity').toggle();				// 分区冠军赛

						vue_light.isClearPlay = !vue_light.isClearPlay;
					},
					clearAll	: ()=>{
						if ( !vue_light.isClearHead ) { vue_light.clearHead(); }
						if ( !vue_light.isClearAside ) { vue_light.clearAside(); }
						if ( !vue_light.isClearPlay ) { vue_light.clearPlay(); }
						if ( !vue_light.isClearBar ) { vue_light.clearBar(); }
						if ( !vue_light.isClearInfo ) { vue_light.clearInfo(); }
						if ( !vue_light.isClearGift ) { vue_light.clearGift(); }
					},
					clearCancel	: ()=>{
						if ( vue_light.isClearHead ) { vue_light.clearHead(); }
						if ( vue_light.isClearAside ) { vue_light.clearAside(); }
						if ( vue_light.isClearPlay ) { vue_light.clearPlay(); }
						if ( vue_light.isClearBar ) { vue_light.clearBar(); }
						if ( vue_light.isClearInfo ) { vue_light.clearInfo(); }
						if ( vue_light.isClearGift ) { vue_light.clearGift(); }
					},
					cleanEle: ()=>{
						console.log('删除元素');
						// topic
						if ( !vue_light.isCleanEle ) {
							$h2p_j('video.video-header').remove();
							$h2p_j('div.wm-h5-view').remove();
							setTimeout( ()=>{ $h2p_j('div.bc-wrapper:first').remove(); }, 1000);
						}
						$h2p_j('div.bc-wrapper:gt(1)').remove();
						$h2p_j('div.MatchSystemGuide').remove();
						let distance = $h2p_j('header#js-header').height() + 10;
						$h2p_j('div.bc-wrapper:eq(1)').css({
							'margin-top'		: distance + 'px',
							'background-color'	: '',
							'background-image'	: '',
						});

						let eles = ['div#js-bottom', 'div.guessGameContainer.is-normalRoom', 'div#js-room-activity'];
						eles.forEach( ele => { $h2p_j(ele).remove(); } );

						if ( !vue_light.isClearBar ) { vue_light.clearBar(); }

						vue_light.isCleanEle = true;
					},
					hideCM	: ()=>{
						if ( vue_light.isHidePS ) { vue_light.hidePS(); }
						if ( vue_light.isHideWS ) { vue_light.hideWS(); }
						if ( vue_light.isHideFS ) { vue_light.hideFS(); }

						if ( vue_light.isHideCM ) { vue_light.clearCancel(); }
						else { vue_light.clearAll(); }
						vue_light.isHideCM = !vue_light.isHideCM;
					},
					hidePS		: ()=>{
						if ( vue_light.isHideCM ) { vue_light.hideCM(); }
						if ( vue_light.isHideWS ) { vue_light.hideWS(); }
						if ( vue_light.isHideFS ) { vue_light.hideFS(); }
						vue_light.clearCancel();

						// 背景图片、主播信息、左侧边栏、竞猜、友邻、贵宾弹幕、吃鸡战绩
						let eles = ['div#js-background-holder', 'div.layout-Player-title', 'aside#js-aside', 'div#js-player-guessgame', 'div#js-bottom', 'div.Barrage-topFloater', 'div.PubgInfo'];
						eles.forEach( ele => { $h2p_j(ele).toggle(); } );

						$h2p_j('header#js-header').toggle();					// 导航栏
						$h2p_j('div#js-room-activity').toggle();				// 超级粉丝团
						$h2p_j('a.Barrage-toolbarClear').click();				// 清除弹幕

						$h2p_j('div#js-bottom').toggle();
						$h2p_j('div#js-room-activity').toggle();				// 分区冠军赛

						$h2p_j(document.body).toggleClass('h2p-bg-black');

						if ( !vue_light.isHidePS ) {
							console.log('开启关灯模式');
							vue_light.isHidePS = true;
							vue_light.clearBar();
							vue_light.clearGift();
							vue_light.clearPlay();

							$h2p_j('div.bc-wrapper:eq(1)').css('margin-top', '');
							vue_light.topicH = $h2p_j('div.bc-wrapper:eq(1)').height();
							$h2p_j('div.bc-wrapper:eq(1)').css('height', '100%');

							// 放大弹幕栏
							$h2p_j('div#js-player-barrage').css('top', '0');

							// 适配大屏
							$h2p_j('section.layout-Container').css('padding-top', 0);
							let playWDivH = 2.02;
							let playHT = $h2p_j('html').height() - $h2p_j('header#js-header').height() - 15;
							let playWT = $h2p_j('html').width() - 30;
							let playH = Math.min(playHT, playWT/playWDivH);
							let playW = playH * playWDivH;
							if ( playW > playWT ) {
								playW = playWT;
								playH = playW / playWDivH;
							}
							$h2p_j('.layout-Main').css({
								'padding'	: '0',
								'margin'	: ($h2p_j('header#js-header').height() / 2 + 5) + 'px ' + (($h2p_j('html').width() - playW) / 2) + 'px',
							});
							$h2p_j('div.layout-Player').css({
								'margin'	: 'auto',
								'width'		: playW + 'px',
								'height'	: playH + 'px',
							});
							setTimeout(()=>{
								let h = $h2p_j('div.layout-Player-main').height();
								$h2p_j('div.layout-Player').css({
									'margin'	: (playH - h) / 2 + 'px auto',
									'height'	: h + 'px',
								})
							}, 200);

							setTimeout(()=>{  $h2p_j('div.roomSmallPlayerFloatLayout-closeBtn').click(); }, 500);

							// 恢复正常尺寸画面
							setTimeout(() => {
								$h2p_j('div.wfs-2a8e83').click();
								setTimeout(() => { $h2p_j('div.wfs-exit-180268').click(); }, 50)
							}, 20);
						}
						else {
							console.log('关闭关灯模式');
							vue_light.isHidePS = false;

							// 显示页面背景图片
							if ( !vue_light.isCleanEle ) {
								$h2p_j('video.video-header').show();
								$h2p_j('div.bc-wrapper:first').show();
								$h2p_j('div.bc-wrapper:eq(1)').css('margin-top', '');
							} else {
								let distance = $h2p_j('header#js-header').height() + 10;
								$h2p_j('div.bc-wrapper:eq(1)').css('margin-top', distance + 'px');
							}
							$h2p_j('div.bc-wrapper:eq(1)').css('height', vue_light.topicH);

							// 恢复弹幕栏
							$h2p_j('div#js-player-barrage').css('top', '256px');

							// 适配大屏
							$h2p_j('section.layout-Container').css('padding-top', '');
							$h2p_j('.layout-Main').css({
								'padding'	: '',
								'margin'	: ''
							});
							$h2p_j('div.layout-Player').css({
								'margin'	: '',
								'width'		: '',
								'height'	: '',
							});

							// 恢复正常尺寸画面
							setTimeout(() => {
								$h2p_j('div.wfs-2a8e83').click();
								setTimeout(() => { $h2p_j('div.wfs-exit-180268').click(); }, 50)
							}, 20);
						}
					},
					hideWS		: ()=>{
						if ( vue_light.isHideCM ) { vue_light.hideCM(); }
						if ( vue_light.isHidePS ) { vue_light.hidePS(); }
						if ( vue_light.isHideFS ) { vue_light.hideFS(); }
						vue_light.clearCancel();

						$h2p_j('div#js-room-activity').toggle();				// 分区冠军赛

						setTimeout(()=>{
							let eles = ['div.PlayerToolbar-GiftWrap', 'div.PlayerToolbar-Task'];
							eles.forEach( ele => { $h2p_j(ele).toggle(); } );
							let eleHides = ['div.ActivityList > div', 'div.ActivityList > div[data-flag="grab_hero"']
							eleHides.forEach( ele => { $h2p_j(ele).hide(); } );
							let eleShows = ['div.ActivityList > div[data-flag="anchor_quiz"]', 'div.ActivityList > div[data-flag="room_level"]']
							eleShows.forEach( ele => { $h2p_j(ele).show(); } );
						}, 350);

						if ( !vue_light.isHideWS ) {
							vue_light.isHideWS = true;
							vue_light.clearBar();

							$h2p_j('div.PlayerToolbar-reactGroup').css('display', 'block');

							startWS = new Date().getTime();
							let setINVL_waitWS = setInterval( ()=>{
								if ( $h2p_j('div.wfs-2a8e83').length > 0 ) {
									$h2p_j('div.wfs-2a8e83').click();
									window.clearInterval(setINVL_waitWS);
									setINVL_waitWS = undefined;
								} else if ( (new Date().getTime() - startWS) > waitSec ) {
									window.clearInterval(setINVL_waitWS);
									setINVL_waitWS = undefined;
								}
							}, 200);

							// 放大弹幕栏
							$h2p_j('div#js-player-barrage').css('top', '0');
						}
						else {
							vue_light.isHideWS = false;

							$h2p_j('div.PlayerToolbar-reactGroup').css('display', '');

							startWS = new Date().getTime();
							let setINVL_waitWS = setInterval( ()=>{
								if ( $h2p_j('div.wfs-exit-180268').length > 0 ) {
									$h2p_j('div.wfs-exit-180268').click();
									window.clearInterval(setINVL_waitWS);
									setINVL_waitWS = undefined;
								} else if ( (new Date().getTime() - startWS) > waitSec ) {
									window.clearInterval(setINVL_waitWS);
									setINVL_waitWS = undefined;
								}
							}, 200);

							// 还原弹幕栏
							$h2p_j('div#js-player-barrage').css('top', '256px');
						}
					},
					hideFS		: ()=>{
						if ( vue_light.isHideCM ) { vue_light.hideCM(); }
						if ( vue_light.isHidePS ) { vue_light.hidePS(); }
						if ( vue_light.isHideWS ) { vue_light.hideWS(); }

						$h2p_j('div#js-room-activity').toggle();				// 分区冠军赛

						if ( !vue_light.isHideFS ) {
							vue_light.isHideFS = true;

							startFS = new Date().getTime();
							let setINVL_waitFS = setInterval( ()=>{
								if ( $h2p_j('div.wfs-2a8e83').length > 0 ) {
									$h2p_j('div.wfs-2a8e83').click();
									// 隐藏弹幕框
									setTimeout(() => { $h2p_j('label.layout-Player-asidetoggleButton').click(); }, 200);
									window.clearInterval(setINVL_waitFS);
									setINVL_waitFS = undefined;
								} else if ( (new Date().getTime() - startFS) > waitSec ) {
									window.clearInterval(setINVL_waitFS);
									setINVL_waitFS = undefined;
								}
							}, 200);
						}
						else {
							vue_light.isHideFS = false;

							startFS = new Date().getTime();
							let setINVL_waitFS = setInterval( ()=>{
								if ( $h2p_j('div.wfs-exit-180268').length > 0 ) {
									// 显示弹幕框
									$h2p_j('label.layout-Player-asidetoggleButton').click();
									setTimeout(() => { $h2p_j('div.wfs-exit-180268').click(); }, 200);
									window.clearInterval(setINVL_waitFS);
									setINVL_waitFS = undefined;
								} else if ( (new Date().getTime() - startFS) > waitSec ) {
									window.clearInterval(setINVL_waitFS);
									setINVL_waitFS = undefined;
								}
							}, 200);
						}
					},
				},
			});

			BOOL_vue_clear = true;
			window.clearInterval(INVL_createVue_clear);
			INVL_createVue_clear = undefined;
		}
	}, 100 );

	$h2p_j(document).ready().keydown(function (e) {
		// ESC 按键
		if ( e.which === 27 ) {
			if ( vue_light.isHideCM ) vue_light.hideCM();
			else if ( vue_light.isHidePS ) vue_light.hidePS();
			else if ( vue_light.isHideWS ) vue_light.hideWS();
			else if ( vue_light.isHideFS ) vue_light.hideFS();
		}
		let myKeyCode = { 'a':65, 's':83, 'd':68,  }
		// shift d
		if ( e.shiftKey && e.which == myKeyCode.a ) {
			if ( $h2p_j('span#button-DYScript').length > 0 ) {
				if ( !viewShow_script ) {
					$h2p_j('span#button-DYScript').click();
					$h2p_j('div#div-tab-sendBarrage').click();
				} else {
					if ( viewShow_bar ) { $h2p_j('span#button-DYScript').click(); }
					else { $h2p_j('div#div-tab-sendBarrage').click(); }
				}
			}
		}
		else if ( e.shiftKey && e.which == myKeyCode.s ) {
			if ( $h2p_j('span#button-DYScript').length > 0 ) {
				if ( !viewShow_script ) {
					$h2p_j('span#button-DYScript').click();
					$h2p_j('div#div-tab-DYLight').click();
				} else {
					if ( viewShow_clear ) { $h2p_j('span#button-DYScript').click(); }
					else { $h2p_j('div#div-tab-DYLight').click(); }
				}
			}
		}
		else if ( e.shiftKey && e.which == myKeyCode.d ) {
			if ( $h2p_j('span#button-DYScript').length > 0 ) {
				if ( !viewShow_script ) {
					$h2p_j('span#button-DYScript').click();
					$h2p_j('div#div-tab-config').click();
				} else {
					if ( viewShow_config ) { $h2p_j('span#button-DYScript').click(); }
					else { $h2p_j('div#div-tab-config').click(); }
				}
			}
		}
	});








// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// 自动化设置
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //








	// 自动领取观看鱼丸
	var auto_getFB = () => {
		var INVL_autoGetFB = setInterval(() => {
			// 观看鱼丸元素存在并且有未领取的鱼丸
			if ( $h2p_j('div.FishpondTreasure-num.is-entrance').length > 0 && $h2p_j('div.FishpondTreasure-num.is-entrance').text().length > 0 ) {
				// 打开领取鱼丸界面
				$h2p_j('div.FishpondTreasure-icon').click();

				// 每日活跃、每周活跃
				$h2p_j('span[class^="FTP-btn"]').toArray().forEach( (span) => {
					span.click();
					$h2p_j('div.FTP-singleTask-btn.is-finished').toArray().forEach( ele => ele.click() );
				} );
				// 鱼塘
				$h2p_j('div.FTP-bubble-progressText.is-complete').toArray().forEach( ele => ele.click() );

				$h2p_j('span.FTP-close').click();
			}
		}, 5000);
	};

	// 默认画质
	var auto_showDef = () => {
		let INVL_checkDefIconReady = setInterval( () => {
			if ( $h2p_j('div.rate-5c068c').length > 0 ) {
				window.clearInterval(INVL_checkDefIconReady);
				INVL_checkDefIconReady = undefined;
				if ( h2p_DYScript_config.isShow0 ) {
					$h2p_j('div.tip-e3420a > ul > li:last').click();
				} else if ( h2p_DYScript_config.isShow9 ) {
					$h2p_j('div.tip-e3420a > ul > li:first').click();
				}
			}
		}, 200 );
	}

	// 禁止弹幕
	var auto_hideBar = () => {
		let INVL_checkDefIconReady = setInterval( () => {
			if ( $h2p_j('div[class="showdanmu-42b0ac removed-9d4c42"]').length > 0 ) {
				window.clearInterval(INVL_checkDefIconReady);
			} else if ( $h2p_j('div[class="showdanmu-42b0ac"]').length > 0 ) {
				$h2p_j('div[class="showdanmu-42b0ac"]').click();
				window.clearInterval(INVL_checkDefIconReady);
			}
		}, 200 );
	}

	// 静音
	var auto_hideSound = () => {
		let INVL_checkDefIconReady = setInterval( () => {
			if ( $h2p_j('div[class="volume-silent-3eb726"]').length > 0 ) {
				window.clearInterval(INVL_checkDefIconReady);
			} else if ( $h2p_j('div[class="volume-8e2726"]').length > 0 ) {
				$h2p_j('div[class="volume-8e2726"]').click();
				window.clearInterval(INVL_checkDefIconReady);
			}
		}, 200 );
	}

	// 自动签到
	var auto_signIn = () => {
		let INVL_checkSignInIconReady = setInterval( () => {
			if ( $h2p_j('div.RoomLevelDetail-level.RoomLevelDetail-level--no').length > 0 ) {
				window.clearInterval(INVL_checkSignInIconReady);
				INVL_checkSignInIconReady = undefined;
				$h2p_j('div.RoomLevelDetail-level.RoomLevelDetail-level--no').click();
				setTimeout(()=>{
					// 关闭签到弹出的框
					$h2p_j('div.SSR-D-close').click();
				}, 200);
			}
		}, 200);
	}

	// 检测是否出现 在电脑面前检测
	setInterval( ()=>{ $h2p_j('div.btn2-869c8d').toArray().forEach( ele => ele.click() ); }, 10000 );
	// 检测是否出现 重新加载
	setInterval( ()=>{
		if ( $h2p_j('div.reload-0876b5').css('display') != 'none' ) { $h2p_j('div.reload-0876b5').toArray().forEach( ele => ele.click() );  }
	}, 10000 );

	let config = JSON.parse( localStorage.getItem('h2p-DYScript-configPre') );
	if ( config ) { h2p_DYScript_configPre = config; }

	// 脚本清爽
	(() => {
		if ( h2p_DYScript_configPre && 'isHideSM' in h2p_DYScript_configPre && h2p_DYScript_configPre.isHideSM ) {
			var h2p_style_clean = document.createElement('style');
			h2p_style_clean.type = 'text/css';
			h2p_style_clean.innerHTML = (()=>{/*
				.Header-logo { display : none!important; }
				.DropMenuList-name { display : none!important; }
				.DropMenuList-list { display : none!important; }
				.Game { display : none!important; }
				.Header-broadcast-wrap { display : none!important; }
				.Header-download-wrap { display : none!important; }

				.Title-anchorPic { display : none!important; }
				.Title-headline { display : none!important; }
				.Title-roomOtherBottom { display : none!important; }
				.ComSuperscript { display : none!important; }
				.Title-impress { display : none!important; }
				.Title-addFriend { display : none!important; }
				.SociatyLabel { display : none!important; }
				.Title { height : 100%!important; }
				.layout-Player-title { min-height : 0!important; }

				.MotorcadeEntry-wrapper { display : none!important; }

				.layout-Aside { display: none!important; }
				.ActSuperFansGroup-switchWrap { display: none!important; }
				.ActSuperFansGroup-logo { display: none!important; }
				.ActSuperFansGroup-bar { display: none!important; }

				.layout-Player-rank { display: none!important; }
				.layout-Player-barrage { top : 0!important; }
				.Barrage-noble { display: none!important; }

				.layout-Player-guessgame { display: none!important; }
				.layout-Bottom { display: none!important; }

				.RoomLevel { display: none!important; }
				.Motor { display: none!important; }
				.MatchSystemTeamMedal { display: none!important; }
				.MatchSystemChatRoomEntry { display: none!important; }
				.MatchSystemMedalPanel-container { display: none!important; }
				.BarrageBanner { display: none!important; }
				.Barrage-notice--noble {
					background : transparent!important;
					border : none!important
				}
				.Barrage-topFloater { display: none!important; }

				.PlayerToolbar-signCont { background: transparent!important; }
			*/}).toString().split('/*')[1].split('*/')[0];
			document.head.appendChild(h2p_style_clean);

			var h2p_topic_style_clean = document.createElement('style');
			h2p_topic_style_clean.type = 'text/css';
			h2p_topic_style_clean.innerHTML = (()=>{/*
				.bc-wrapper-2 { display : none!important; }
				.bc-wrapper-3 {
					margin-top		: 78px;
					background-color: transparent!important;
					background-image: none!important;
				}
				.bc-wrapper-4 {
					background-color: transparent!important;
					background-image: none!important;
				}
				.bc-wrapper-6 { display : none!important; }
				.bc-wrapper-10 { display : none!important; }
				.bc-wrapper-11 { display : none!important; }
				.bc-wrapper-12 { display : none!important; }
				.bc-wrapper-13 { display : none!important; }
				.bc-wrapper-14 {
					background-color: transparent!important;
					background-image: none!important;
				}
				.bc-wrapper-15 { display : none!important; }
				.bc-wrapper-16 {
					background-color: transparent!important;
					background-image: none!important;
				}
				.bc-wrapper-17 { display : none!important; }
				.bc-wrapper-18 { display : none!important; }

				.video-header { display : none!important; }
				.wm-h5-view { display : none!important; }
				.wm-h6-view { display : none!important; }
				.wm_footer { display : none!important; }
				.MatchSystemGuide { display : none!important; }

				.ToolbarActivityArea { display : none!important; }
			*/}).toString().split('/*')[1].split('*/')[0];
			document.head.appendChild(h2p_topic_style_clean);

			let INVL_autoCleanEle = setInterval(()=>{
				if ( BOOL_vue_clear ) {
					vue_light.cleanEle();
					window.clearInterval(INVL_autoCleanEle);
				}
			}, 1000);
		}
	})();








// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// 脚本自动化配置界面
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //









	// 初始化配置界面
	(()=>{
		var str_div_config = (()=>{/*
			<div id="div-config" class="h2p-div-inlinepanel" style="display: none">

				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<button class="h2p-btn h2p-w-96p h2p-bg-close">关闭状态</button>
					</div>
					<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
						<button class="h2p-btn h2p-w-96p h2p-bg-open">开启状态</button>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">
				<hr style="margin: 6px -9px; border: 1px solid #DCDCDC;">
				<hr style="margin: 6px; border: 1px solid transparent;">

				<div class="h2p-div-layer" style="height: 27px;">
					<!-- 抄袭弹幕 and 循环弹幕 -->
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isCopy, 'h2p-bg-close':!auto_isCopy}" @click="click_autoCopyBar">抄袭弹幕</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isLoop, 'h2p-bg-close':!auto_isLoop}" style="float: right" @click="click_autoLoopBar">循环弹幕</button>
							</div>
						</div>
					</div>

					<!-- 循环弹幕 and 抽奖弹幕 -->
					<div class="h2p-div-layer-half" style="height: 100%; left: 50%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%; float: right">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isKeyReply, 'h2p-bg-close':!auto_isKeyReply}" @click="click_autoKeyReply">关键词回复</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isLuckDraw, 'h2p-bg-close':!auto_isLuckDraw}" style="float: right" @click="click_autoLuckDraw">抽奖弹幕</button>
							</div>
						</div>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">

				<div class="h2p-div-layer" style="height: 27px;">
					<!-- 清爽模式 and 关灯模式 -->
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHideCM, 'h2p-bg-close':!auto_isHideCM}" @click="click_hideCM">清爽模式</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHidePS, 'h2p-bg-close':!auto_isHidePS}" style="float: right" @click="click_hidePS">关灯模式</button>
							</div>
						</div>
					</div>

					<!-- 宽屏模式 and 网页全屏 -->
					<div class="h2p-div-layer-half" style="height: 100%; left: 50%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%; float: right">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHideWS, 'h2p-bg-close':!auto_isHideWS}" @click="click_hideWS">宽屏模式</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHideFS, 'h2p-bg-close':!auto_isHideFS}" style="float: right" @click="click_hideFS">网页全屏</button>
							</div>
						</div>
					</div>
				</div>
				<hr style="margin: 2px 6px; border: 1px solid transparent;">
				<div class="h2p-div-layer" style="height: 27px;">
					<!-- 脚本清爽 -->
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHideSM, 'h2p-bg-close':!auto_isHideSM}" @click="click_hideSM">脚本清爽</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
							</div>
						</div>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">

				<div class="h2p-div-layer" style="height: 27px;">
					<!-- 画质选项 -->
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isShow0, 'h2p-bg-close':!auto_isShow0}" @click="click_showDef0">最低画质</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isShow9, 'h2p-bg-close':!auto_isShow9}" style="float: right" @click="click_showDef9">最高画质</button>
							</div>
						</div>
					</div>

					<div class="h2p-div-layer-half" style="height: 100%; left: 50%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%; float: right">
							<div class="h2p-div-layer-half" style="height: 100%">
								<!--  -->
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHideBar, 'h2p-bg-close':!auto_isHideBar}" @click="click_hideBar">关闭弹幕</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<!--  -->
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_isHideSound, 'h2p-bg-close':!auto_isHideSound}" @click="click_hideSound">静音</button>
							</div>
						</div>
					</div>
				</div>

				<hr style="margin: 6px; border: 1px solid transparent;">

				<div class="h2p-div-layer" style="height: 27px;">
					<div class="h2p-div-layer-half" style="height: 100%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%">
							<div class="h2p-div-layer-half" style="height: 100%">
								<!-- 是否自动领取鱼丸 -->
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_getFB, 'h2p-bg-close':!auto_getFB}" @click="click_autoGetFB">领取鱼丸</button>
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<!-- 是否自动签到 -->
								<button class="h2p-btn h2p-w-96p" :class="{'h2p-bg-open':auto_signIn, 'h2p-bg-close':!auto_signIn}" style="float: right" @click="click_autoSignIn">签到</button>
							</div>
						</div>
					</div>

					<div class="h2p-div-layer-half" style="height: 100%; left: 50%">
						<div class="h2p-div-layer h2p-w-96p" style="height: 100%; float: right">
							<div class="h2p-div-layer-half" style="height: 100%">
								<!--  -->
							</div>
							<div class="h2p-div-layer-half" style="left: 50%; height: 100%">
								<!--  -->
							</div>
						</div>
					</div>
				</div>
			</div>
		*/}).toString().split('/*')[1].split('*/')[0].replace(/[\n]/g, '');
		var div_config = $h2p_j(str_div_config);

		$h2p_j(div_DYScript).append(div_config);

		var check_mountPoint_configIcon = setInterval( ()=>{
			if ( $h2p_j('div#div-config').length > 0 ) {
				window.clearInterval( check_mountPoint_configIcon );
				check_mountPoint_configIcon = undefined;
				BOOL_ok_config = true;
			}
		}, 1000);
	})();

	window.vue_config = undefined;
	// 发送弹幕组件构建 Vue
	var INVL_createVue_config = setInterval( ()=>{
		if ( BOOL_ok_config ) {
			vue_config = new Vue({
				el		: '#div-config',
				data	: {
					auto_isCopy		: false,
					auto_isLoop		: false,
					auto_isKeyReply	: false,
					auto_isLuckDraw	: false,
					auto_isHide		: false,
					auto_isHideCM	: false,		// clear mode
					auto_isHidePS	: false,
					auto_isHideWS	: false,
					auto_isHideFS	: false,
					auto_isHideSM	: false,		// script mode
					auto_isShow0	: false,		// 最低画质
					auto_isShow9	: false,		// 最高画质
					auto_isHideBar	: false,		// 滚动弹幕
					auto_isHideSound: false,		// 静音
					auto_getFB		: false,		// 自动获取鱼丸（fish ball）
					auto_signIn		: false,
				},
				methods	: {
					click_autoCopyBar	: ()=>{
						vue_config.auto_isCopy = !vue_config.auto_isCopy;
						h2p_DYScript_config.isCopy = vue_config.auto_isCopy;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_autoLoopBar	: ()=>{
						vue_config.auto_isLoop = !vue_config.auto_isLoop;
						h2p_DYScript_config.isLoop = vue_config.auto_isLoop;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_autoKeyReply	: ()=>{
						vue_config.auto_isKeyReply = !vue_config.auto_isKeyReply;
						h2p_DYScript_config.isKeyReply = vue_config.auto_isKeyReply;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_autoLuckDraw	: ()=>{
						vue_config.auto_isLuckDraw = !vue_config.auto_isLuckDraw;
						h2p_DYScript_config.isLuckDraw = vue_config.auto_isLuckDraw;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_autoHideMode	: ()=>{
						vue_config.auto_isHide = !vue_config.auto_isHide;
						vue_config.click_selectHideMode();
					},
					// 选择隐藏模式
					set_hideMode		: ()=>{
						h2p_DYScript_config.isHideCM = vue_config.auto_isHideCM;
						h2p_DYScript_config.isHidePS = vue_config.auto_isHidePS;
						h2p_DYScript_config.isHideWS = vue_config.auto_isHideWS;
						h2p_DYScript_config.isHideFS = vue_config.auto_isHideFS;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_hideCM		: ()=>{
						vue_config.auto_isHideCM = !vue_config.auto_isHideCM;
						vue_config.auto_isHidePS = false;
						vue_config.auto_isHideWS = false;
						vue_config.auto_isHideFS = false;
						vue_config.set_hideMode();
					},
					click_hidePS		: ()=>{
						vue_config.auto_isHideCM = false;
						vue_config.auto_isHidePS = !vue_config.auto_isHidePS;
						vue_config.auto_isHideWS = false;
						vue_config.auto_isHideFS = false;
						vue_config.set_hideMode();
					},
					click_hideWS		: ()=>{
						vue_config.auto_isHideCM = false;
						vue_config.auto_isHidePS = false;
						vue_config.auto_isHideWS = !vue_config.auto_isHideWS;
						vue_config.auto_isHideFS = false;
						vue_config.set_hideMode();
					},
					click_hideFS		: ()=>{
						vue_config.auto_isHideCM = false;
						vue_config.auto_isHidePS = false;
						vue_config.auto_isHideWS = false;
						vue_config.auto_isHideFS = !vue_config.auto_isHideFS;
						vue_config.set_hideMode();
					},
					click_hideSM		: ()=>{
						vue_config.auto_isHideSM = !vue_config.auto_isHideSM;
						h2p_DYScript_configPre.isHideSM = vue_config.auto_isHideSM;
						localStorage.setItem('h2p-DYScript-configPre', JSON.stringify(h2p_DYScript_configPre) );
					},
					// 保存画质设置
					click_setShowDef	: ()=>{
						h2p_DYScript_config.isShow0 = vue_config.auto_isShow0;
						h2p_DYScript_config.isShow9 = vue_config.auto_isShow9;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_showDef0		: ()=>{
						vue_config.auto_isShow0 = !vue_config.auto_isShow0;
						vue_config.auto_isShow9 = false;
						vue_config.click_setShowDef();
					},
					click_showDef9		: ()=>{
						vue_config.auto_isShow0 = false;
						vue_config.auto_isShow9 = !vue_config.auto_isShow9;
						vue_config.click_setShowDef();
					},
					click_hideBar		: ()=>{
						vue_config.auto_isHideBar = !vue_config.auto_isHideBar;
						h2p_DYScript_config.isHideBar = vue_config.auto_isHideBar;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_hideSound		: ()=>{
						vue_config.auto_isHideSound = !vue_config.auto_isHideSound;
						h2p_DYScript_config.isHideSound = vue_config.auto_isHideSound;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_autoGetFB	: ()=>{
						vue_config.auto_getFB = !vue_config.auto_getFB;
						h2p_DYScript_config.getFB = vue_config.auto_getFB;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
					click_autoSignIn: ()=>{
						vue_config.auto_signIn = !vue_config.auto_signIn;
						h2p_DYScript_config.signIn = vue_config.auto_signIn;
						localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
					},
				}
			});

			BOOL_vue_config = true;
			window.clearInterval(INVL_createVue_config);
			INVL_createVue_config = undefined;
		}
	}, 100);

	// 检查弹幕图标挂载点（斗鱼弹幕输入框）是否加载完成
	var check_mountPoint_DYScriptIcon = setInterval( ()=>{
		if ( $h2p_j('div#div-DYScript').length > 0 && $h2p_j('div.BarrageSuperLink').length > 0 ) {
			let div_sign = $h2p_j('<div class="h2p-div-sign" style="margin: -8px 0 0 -3px;" title="斗鱼脚本"></div>');

			let btn_sign = $h2p_j('<span id="button-DYScript" class="h2p-span-sign">🐯</span>');
			$h2p_j(btn_sign).click(()=>{
				$h2p_j('div#div-DYScript').toggle();
				viewShow_script = !viewShow_script;
			});
			$h2p_j(div_sign).append(btn_sign);

			$h2p_j('div.ChatToolBar').append( div_sign );
			window.clearInterval(check_mountPoint_DYScriptIcon);
		}
	}, 500);

	$h2p_j(div_DYScript).append(div_DYScriptTab);








// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// 获取自动化配置
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //








	// 斗鱼功能自动化配置
	var h2p_DYScript_config = undefined;
	var h2p_DYScript_config_def = {
		speedMin	: 6000,
		speedMax	: 7000,
		isCopy		: false,
		INVL_copy	: 0,
		isLoop	 	: false,
		loopBarCon	: '',
		isKeyReply	: false,
		keyReplys	: [],
		isLuckDraw	: false,
		CNT_luckDraw: 2,
		isHideCM 	: false,
		isHidePS 	: false,
		isHideWS	: false,
		isHideFS 	: false,
		isShow0		: false,
		isShow9		: false,
		isHideBar	: false,
		isHideSound	: false,
		getFB		: false,
		signIn		: false,
		showTs		: [],
	};


	(()=>{
		let start_INVL_waitRoomID = new Date().getTime() / 1000;
		let INVL_waitRoomID = setInterval(()=>{
			if ( $h2p_j('a.Title-anchorName').length > 0 && $h2p_j('a.Title-anchorName').attr('href').length > 0 ) {
				roomInfo.id = $h2p_j('a.Title-anchorName').attr('href').split('room_id=')[1];
				window.clearInterval(INVL_waitRoomID);
			} else {
				if ( ((new Date().getTime() / 1000) - start_INVL_waitRoomID) > 15 ) {
					window.clearInterval(INVL_waitRoomID);
					console.log('获取房间 ID 超时')
				}
			}
		}, 500);
		let INVL_getAnchorShowT = setInterval(()=>{
			if ( h2p_DYScript_config ) {
				let showTs = h2p_DYScript_config.showTs;
				let showT = 0;
				let getT = 0;
				let isStore = false;
				let index = 0;
				for ( ; index < showTs.length; index++ ) {
					if ( roomInfo.id == showTs[index].id ) {
						showT = parseInt( showTs[index].showT );
						getT = parseInt( showTs[index].getT );
						isStore = true;
						break;
					}
				}
				let INVL = ((new Date().getTime() / 1000) - getT) / 3600.0;
				if ( INVL < 6 ) {
					roomInfo.showT = showT;
					console.log(`Succeed getting anchor showTime : ${roomInfo.showT}.`);
					window.clearInterval(INVL_getAnchorShowT);
					INVL_getAnchorShowT = undefined;
				} else if ( roomInfo.id.length > 0 ) {
					fetch('https://www.douyu.com/betard/' + roomInfo.id)
						.then(response => response.json())
						.then((res)=>{
							try {
								if ( res ) {
									if ( res.cache_time ) {
										roomInfo.showT = parseInt(res.cache_time);
									} else {
										let r = res.split('"cache_time":')[1];
										let l = r.substr(0, r.indexOf(','));
										roomInfo.showT = parseInt(l);
									}
									console.log(`Succeed getting anchor showTime : ${roomInfo.showT}.`);
									let info = { 'id' : roomInfo.id, 'showT' : roomInfo.showT, "getT" : parseInt( new Date().getTime() / 1000 ) };
									if ( isStore ) { h2p_DYScript_config.showTs.splice(index, 1, info); }
									else { h2p_DYScript_config.showTs.push(info); }
									localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
								} else { console.log('Fail to get anchor showTime.') }
							} catch(e){ console.log('获取播放时间失败。') }
						});

					window.clearInterval(INVL_getAnchorShowT);
					INVL_getAnchorShowT = undefined;
				}
			}
		}, 500);

		let INVL_getOnline = setInterval(()=>{
			if ( roomInfo.online <= 0 ) {
				let urlId = ''
				if ( isTopic ) {
					urlId = window.location.href.split('=').pop();
				} else {
					urlId = window.location.pathname.split('/').pop();
				}
				$h2p_j.ajax({
					// url		: 'https://www.douyu.com/swf_api/h5room/' + urlId,
					url		: 'https://bojianger.com/data/api/common/search.do?keyword=' + urlId,
					success	: (response)=>{
						try {
							if ( response ) {
								console.log(response);
								let data = {}
								if ( 'data' in response ) {
									if ( 'online' in response.data ) {
										roomInfo.online = parseInt(response.data.online);
									}
									else if ( 'anchorVo' in response.data ) {
										roomInfo.online = parseInt(response.data.anchorVo.audience_count);
									}
								} else {
									res = JSON.parse(JSON.stringify(response));
									roomInfo.online = parseInt(res.split('online":')[1].split(',')[0]);
								}
								console.log(`Succeed getting online : ${roomInfo.online}.`);
							} else { console.log('Fail to get online.'); }
						}
						catch(e) {
							console.log(e);
							console.log('获取在线人数失败。');
						}
						finally { window.clearInterval(INVL_getOnline); }
					},
				});
			}
		}, 5000);

		try{
			// 获取本地用户配置
			let configVal = JSON.parse( localStorage.getItem('h2p-DYScript-config') );
			if ( !configVal ) {
				configVal = JSON.parse( localStorage.getItem('h2p-DYScript-setting') );
				localStorage.removeItem('h2p-DYScript-setting');
			}
			h2p_DYScript_config = JSON.parse( JSON.stringify(h2p_DYScript_config_def) );

			for ( let attr in configVal ) {
				if ( attr in h2p_DYScript_config ) {
					h2p_DYScript_config[attr] = configVal[attr];
				}
			}

			if ( 'loopBarrage' in configVal ) { h2p_DYScript_config.isLoop = configVal.loopBarrage; }
			if ( 'loopBarContext' in configVal ) { h2p_DYScript_config.loopBarCon = configVal.loopBarContext; }
			if ( 'copyBarrage' in configVal ) { h2p_DYScript_config.isCopy = configVal.copyBarrage; }
			if ( 'luckDrawBarrage' in configVal ) { h2p_DYScript_config.isLuckDraw = configVal.luckDrawBarrage; }
			if ( 'receiveFishBall' in configVal ) { h2p_DYScript_config.getFB = configVal.receiveFishBall; }
			if ( 'hidePart' in configVal ) { h2p_DYScript_config.isHidePS = configVal.hidePart; }
			if ( 'hideWS' in configVal ) { h2p_DYScript_config.isHideWS = configVal.hideWS; }
			if ( 'hideAll' in configVal ) { h2p_DYScript_config.isHideFS = configVal.hideAll; }

			localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
		} catch (err) {
			// 重置本地配置
			console.log('重置本地配置');
			localStorage.removeItem('h2p-DYScript-config');
			h2p_DYScript_config = h2p_DYScript_config_def;
			localStorage.setItem('h2p-DYScript-config', JSON.stringify(h2p_DYScript_config) );
        }

        // 根据 cookie 获取用户昵称
		let cookies = document.cookie.split(/;\s/g);
		for ( let i = 0; i < cookies.length; i++ ) {
			let cookie = cookies[i];
			let keyVal = cookie.split('=');
			if ( keyVal && keyVal.length == 2 && keyVal[0] == 'acf_nickname' ) {
				userInfo.nickName = keyVal[1];
				break;
			}
		}

		BOOL_ok_localS = true;
	})();

	// 自动获取已有徽章的主播
	var roomOfAnchorFan = [];
	setTimeout( () => {
		$h2p_j('html').append('<div id="FansBadgeList" style="display: none"></div>');
		setTimeout( () => {
			// 获取有粉丝牌的主播房间号
			$h2p_j('div#FansBadgeList').load('/member/cp/getFansBadgeList [class="aui_room_table fans-badge-list"]');
			setTimeout( () => {
				let ele_anchors = $h2p_j('div#FansBadgeList > table > tbody > tr');
				for ( let i = 0; i < ele_anchors.length; i++ ) {
					let ele = ele_anchors[i];
					let anchorURL = $h2p_j(ele).children('td:eq(1)').children('a:eq(0)').attr('href');
					let anchorRoom = anchorURL.split('/').pop();
					roomOfAnchorFan[i] = anchorRoom;
				}
				let anchorRoom= window.location.href.split('/').pop();
				userInfo.isAnchorFan = roomOfAnchorFan.indexOf(anchorRoom) > -1;
				console.log(`有粉丝牌的主播房间号${JSON.stringify(roomOfAnchorFan)}`);
			}, 3000);
		}, 200)
	}, 1000);








// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// 	应用自动化配置
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //









	(()=>{
		// 自动发弹幕自动化设置生效
		var INVL_config_bar_work = setInterval(()=>{
			if ( BOOL_vue_sendBar && BOOL_vue_config && BOOL_ok_localS ) {
				let auto_send = false;
				vue_sendBar.speedMin	= h2p_DYScript_config.speedMin;
				vue_sendBar.speedMax	= h2p_DYScript_config.speedMax;
				if ( h2p_DYScript_config.isCopy ) {
					vue_sendBar.isCopy = true;
					vue_config.auto_isCopy = true;
					auto_send = true;
				}
				if ( h2p_DYScript_config.isLoop ) {
					vue_sendBar.isLoop = true;
					vue_config.auto_isLoop = true;
					auto_send = true;
				}
				if ( h2p_DYScript_config.isKeyReply ) {
					vue_sendBar.isKeyReply = true;
					vue_config.auto_isKeyReply = true;
					auto_send = true;
				}
				if ( h2p_DYScript_config.keyReplys ) {
					for ( let i = 0; i < h2p_DYScript_config.keyReplys.length; i++ ) {
						vue_sendBar.keyReplys.push( h2p_DYScript_config.keyReplys[i] );
					}
				}
				if ( h2p_DYScript_config.isLuckDraw ) {
					vue_sendBar.isLuckDraw = true;
					vue_config.auto_isLuckDraw = true;
					auto_send = true;
				}
				$h2p_j('input#input-copyBar-interval').val(h2p_DYScript_config.INVL_copy);
				$h2p_j('textarea#input-loopBar-content').val(h2p_DYScript_config.loopBarCon);

				if ( auto_send ) { $h2p_j('button#btn-sendBar').click(); }
				window.clearInterval(INVL_config_bar_work);
			}
		}, 500);

		// 清爽模式自动化设置生效
		var INVL_config_clear_work = setInterval(()=>{
			if ( BOOL_vue_clear && BOOL_ok_localS ) {
				if ( h2p_DYScript_config.isHideCM ) {
					vue_config.auto_isHide = true;
					vue_config.auto_isHideCM = true;
					vue_light.hideCM();
					console.log('启动：清爽模式');
				}
				else if ( h2p_DYScript_config.isHidePS ) {
					vue_config.auto_isHide = true;
					vue_config.auto_isHidePS = true;
					vue_light.hidePS();
					console.log('启动：关灯模式');
				}
				else if ( h2p_DYScript_config.isHideWS ) {
					vue_config.auto_isHide = true;
					vue_config.auto_isHideWS = true;
					vue_light.hideWS();
					console.log('启动：宽屏模式');
				}
				else if ( h2p_DYScript_config.isHideFS ) {
					vue_config.auto_isHide = true;
					vue_config.auto_isHideFS = true;
					vue_light.hideFS();
					console.log('启动：网页全屏');
				}
				if ( h2p_DYScript_configPre && 'isHideSM' in h2p_DYScript_configPre &&  h2p_DYScript_configPre.isHideSM ) {
					vue_config.auto_isHideSM = true;
					console.log('启动：脚本清爽');
				}
				window.clearInterval(INVL_config_clear_work);
			}
		}, 500);

		// 最低（高）画质自动化设置生效
		var INVL_config_showDef_work = setInterval(()=>{
			if ( BOOL_vue_config && ( h2p_DYScript_config.isShow0 || h2p_DYScript_config.isShow9 ) ) {
				auto_showDef();
				vue_config.auto_isShow0 = h2p_DYScript_config.isShow0;
				vue_config.auto_isShow9 = h2p_DYScript_config.isShow9;
				console.log('启动：自动' + ( h2p_DYScript_config.isShow0 ? '最低画质' : '最高画质' ) );
				window.clearInterval(INVL_config_showDef_work);
			} else if ( BOOL_vue_config && !h2p_DYScript_config.isShow0 && !h2p_DYScript_config.isShow9 ) {
				console.log('自动画质 启动程序 已关闭');
				window.clearInterval(INVL_config_showDef_work);
			}
		}, 500);

		// 弹幕自动化设置生效
		var INVL_config_showBar_work = setInterval(()=>{
			if ( BOOL_vue_config && h2p_DYScript_config.isHideBar ) {
				auto_hideBar();
				vue_config.auto_isHideBar = true;
				console.log('启动：自动禁止弹幕' );
				window.clearInterval(INVL_config_showBar_work);
			} else if ( BOOL_vue_config && !h2p_DYScript_config.isHideBar ) {
				console.log('自动禁止弹幕 启动程序 已关闭');
				window.clearInterval(INVL_config_showBar_work);
			}
		}, 500);

		// 静音自动化设置生效
		var INVL_config_showSound_work = setInterval(()=>{
			if ( BOOL_vue_config && h2p_DYScript_config.isHideSound ) {
				auto_hideSound();
				vue_config.auto_isHideSound = true;
				console.log('启动：自动静音' );
				window.clearInterval(INVL_config_showSound_work);
			} else if ( BOOL_vue_config && !h2p_DYScript_config.isHideSound ) {
				console.log('自动静音 启动程序 已关闭');
				window.clearInterval(INVL_config_showSound_work);
			}
		}, 500);

		// 领取鱼丸自动化设置生效
		var INVL_config_getFB_work = setInterval(()=>{
			if ( BOOL_vue_config && h2p_DYScript_config.getFB ) {
				auto_getFB();
				vue_config.auto_getFB = true;
				console.log('启动：自动领取观看鱼丸');
				window.clearInterval(INVL_config_getFB_work);
			} else if ( BOOL_vue_config && !h2p_DYScript_config.getFB ) {
				console.log('自动领取观看鱼丸 启动程序 已关闭');
				window.clearInterval(INVL_config_getFB_work);
			}
		}, 500);

		// 签到自动化设置生效
		var INVL_config_signIn_work = setInterval(()=>{
			if ( BOOL_vue_config && h2p_DYScript_config.signIn ) {
				auto_signIn();
				vue_config.auto_signIn = true;
				console.log('启动：自动签到');
				window.clearInterval(INVL_config_signIn_work);
			} else if ( BOOL_vue_config && !h2p_DYScript_config.signIn ) {
				console.log('自动签到 启动程序 已关闭');
				window.clearInterval(INVL_config_signIn_work);
			}
		}, 500);
	})();
})();