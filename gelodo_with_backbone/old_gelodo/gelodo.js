/*
 * gelodo.js
 * 
 * Version : 0.1.0
 * Author : y-uno
 *
 * Copyright 2012 Vector Inc.
 */

;(function( window, $ ){
"use strict";

var _ = window._,
	$LAB = window.$LAB,
	gset = window.GelodoPlatformSettings,
	support = {
		transform3d : ( 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix() ),
		touch : ( 'ontouchstart' in window ),
		storage : ( 'localStorage' in window )
	},
	touch = {
		start : (support.touch) ? 'touchstart' : 'mousedown',
		end : (support.touch) ? 'touchend' : 'mouseup',
		move : (support.touch) ? 'touchmove' : 'mousemove',
		tap : (support.touch) ? 'touchend' : 'click'
	};

var Gelodo = function( conf ){
	return ( this instanceof Gelodo )
		? this.init( conf )
		: new Gelodo( conf );
}

Gelodo.fn = {
	init : function init( conf ){
		var _self = this;

		var device = _self.device = {
			screen_width : screen.width,
			screen_height : screen.height,
			pixel_ratio : window.devicePixelRatio,
			flash_player : getFlashPlayer()
		};

		device.real_width = device.screen_width * device.pixel_ratio;
		device.real_height = device.screen_height * device.pixel_ratio;
		
		function getFlashPlayer(){
			var fp = navigator.mimeTypes['application/x-shockwave-flash'] || void 0;

			if( fp === void 0 ){
				return void 0;
			}

			return fp.enabledPlugin.description;
		}

		_self.config = _.extend({
			name_space : 'gelodo',
			storage_prefix : 'GLD_STORAGE',
			wrapping_selector : '.ui_container',
			timer : 100
		}, conf);

		_self.platform = gset.platform;

		_self.gadget = gset.gadget;
		
		_self.support = support;

		_self.touch = touch;
	},



	// Gelodo.prototype にメソッドを追加する
	// Add method to Gelodo.prototype
	//  @dependence : underscore
	//  @args
	//   source : Adding object
	addMethod : function addMethod( source ){
		var proto = ( this instanceof Gelodo ) ?
			window.gelodo.__proto__ :
			this.prototype;

		_.extend( proto, source );

		return this;
	},



	// 指定したURLに一致する処理を実行
	// @dependence : none
	// @args
	//  path : URLのパス部分にマッチする正規表現
	//  func : pathに一致する処理
	// @via : URL dispatcher
	//        http://tech.kayac.com/archive/javascript-url-dispatcher.html
	dispatcher : function dispatcher( path, func ){
		var dispatcher = this.dispatcher;
		dispatcher.path_func = dispatcher.path_func || []
			if ( func ) {
				return dispatcher.path_func.push( [path, func] );
			};
		var path_func = dispatcher.path_func;
		for( var i = 0, l = path_func.length; i < l; ++i ) {
			var func = path_func[i];
			var match = path.match( func[0] );
			match && func[1]( match );
		};
	},



	// DOMのdataに格納されたパラメータをクエリの形にして返す
	//  @dependence : none
	//  @args
	//   query_obj  : 格納されたパラメータ JSON型文字列
	//   option     : data以外に追加したいパラメータ Object
	//                省略可能
	//   enc        : 返す値をURLエンコードするかどうか Boolean
	//                デフォルトはエンコードする
	//  @return : 処理されたURL
	getQueryToData : function getQueryToData( query_obj, option, enc ){
		if( typeof option !== 'object' ){
			enc = option;
			option = {};
		}

		if( enc === void 0 ){
			enc = true;
		}

		var query_ary = [];
		query_obj = JSON.parse( query_obj );
		for( data in query_obj ){
			query_ary.push( data + '=' + query_obj[data] );
		}

		if( !$.isEmptyObject( option ) ){
			for( opt in option ){
				query_ary.push( opt + '=' + option[opt] );
			}
		}

		return enc
			? encodeURIComponent( '?' + query_ary.join( '&' ) )
			: '?' + query_ary.join( '&' );
	},



	// 引数で渡した配列の中に含まれるAudioデータを取得する
	//  @dependence : jQuery or zepto
	//  @args
	//   voice_arr  : Audioデータのファイル名が格納された配列
	//  @return : AudioElement(ios)/SWFElement(Android)/false
	/*
	getAudio : function getAudio( voice_arr ){
		if( isAndroid4 ){
			return null;
		}

		var voice = null;

		voice = _.find( voice_arr, function( v ){
			return v !== '';
		});

		if( voice !== null ){
			if(isIOS){
				return new Audio(g.gadget.origin + '/js_test/getmp3.php?voiceid=' + voice);
			}else{
				$body.append( '<div id="vSwfArea">' );
				$LAB.script( '/webbin/js/lib/swfobject.js' ).wait(function(){
					var swf  = '/webbin/swf/voice_play.js',
						opt  = {'allowScriptAccess' : 'always', 'wmode' : 'transparent'},
						attr = {},
						now  = ( Date.now ) ? Date.now() : new Date();
						flash_vars = '&voiceid=' + voice + '&' + now;

					swfobject.embedSWF(
						g.setURL( swf ) + flash_vars,
						'vSwfArea',
						1, 1, '10.0.0',
						false, false, opt, attr
					);

					(function checkSwf(){
						if( $( '#vSwfArea' )[0].status ){
							return $( '#vSwfArea' )[0];
						}

						setTimeout(checkSwf, 100);
					})();
				});
			}
		}

		return null;
	},
	*/



	// アドレスバーを隠す
	// @dependence : none
	hideAddressBar : function hideAddressBar(){
		var _self = this;
		setTimeout(function(){
			_self.scrollTo( 0, 1 );
		}, 100);
	},



	// dom/console にログを残す
	// @dependence : jquery or zepto, underscore
	// @args : ログの内容
	//         引数の最後が文字列'HIDDEN'ならdom上に載せない
	//  @return : none
	log : (function log(){
		function debugInDom(){
			var msg = Array.prototype.slice.call( arguments ),
				hidden = ( _.last( msg ) === 'HIDDEN' );

			msg = hidden ? _.initial( msg ).join() : msg.join();

			if( gset.gadget.is_sandbox && !hidden ){
				var $msg_box = $( '#jsDebug' ),
					$msg_article = $msg_box.children( 'p' );

				if( $msg_box.length === 0 ){
					$( 'body' ).append( '<div id="jsDebug"></div>' );
					$msg_box.css({
						position : 'absolute',
						top : 0,
						left : 0,
						width : '100%',
						height : 'auto',
						boxsizing : 'border-box',
						background : 'rgba(0,0,0,0.5)',
						zindex : '1000'
					});
				}
				var old_msg = $msg_article.first().contents().filter(function(){
					return this.nodetype === node.text_node
				}).text();

				if( msg+'' === old_msg ){
					var $c_elm = $msg_article.last().children( 'span' ),
						count = $c_elm.data( 'debug-count' ) * 1 + 1;
					$c_elm.data( 'debug-count', count ).text( count );
				}else{
					$msg_box.append([
						'<p style="padding:15px 5px;color:white;font-size:14px;">',
						msg,
						'<span style="float:right;" data-debug-count="0">0</span></p>'
					].join(''));
				}

				if($msg_article.length > 3){
					$msg_article.first().remove();
				}
			}

			return msg;
		}
		if (!Function.prototype.bind) {
			Function.prototype.bind = function (oThis) {
				if (typeof this !== "function") {
					throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
				}
				var aArgs = Array.prototype.slice.call(arguments, 1), 
				fToBind = this, 
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(this instanceof fNOP
							? this
							: oThis || window,
							aArgs.concat(Array.prototype.slice.call(arguments)));
				};
				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();
				return fBound;
			};
		}
		if( 'console' in window ){
			return console.log.bind( console );
		}else{
			return function(){
				var text = Array.prototype.join.apply(arguments, [', ']);
				alert( text );
			}
		}

	})(),



	// scrollToのwrapper
	// @dependence : touch.js(GREE)
	// @args
	//  x : x座標
	//  y : y座標 省略可
	// @return : none
	scrollTo : function scrollTo(x, y){
		var _self = this;
		var win = window;
		var greeband = 23;
		x = x || 0;
		y = y || 0;

		if( y === void 0 ){
			y = x;
		}

		if( _self.platform === 'gree' && 'greepf' in window){
			greepf.requestScrollTo( x, y + greeband );
			return ;
		}

		win.scrollTo( x, y );

		return ;
	},



	// Date.nowのエイリアス
	// @return {Number} 現在時刻を数値で返す
	now : function now() {
		return Date.now ? Date.now() : ( +new Date );
	},



	// pathをgadgetサーバーを通すURLに変換する
	// GelodoPlatformSettings.setURLのエイリアス
	// (gelodo.preset.js l.26~31に記載)
	//  @dependence : none
	//  @args 
	//   path : 変換するパス。ルート相対で渡す
	//  @return : 変換されたURL
	setURL : gset.setURL,



	// UserAgentの判別結果を$.osに格納する(jQueryの場合)
	// gelodo.ua.test(str) でOSのバージョン判別を行う
	// gelodo.ua.description でUAを返す
	// @dependence : jQuery or Zepto
	// @args .test()
	//  needle : チェックする文字列
	// @return : {test : test(), description}
	ua : (function(){
		var obj = {}
		var des = obj.description = navigator.userAgent;
		var test = obj.test = function test(needle){
			var _self = '';
			if(typeof needle == 'string'){
				return des.indexOf(needle) !== -1;
			}else if($.isArray(needle)){
				for(var i=0; i<needle.length; i++){
					if(test(needle[i])){
						return true;
					}
				}
				return false;
			}
		}

		if($.os === void 0){
			$.os = {
				iphone : test('iPhone'),
				ipad : test('iPad'),
				ipod : test('iPod'),
				android : test('Android')
			};
			$.os.ios = $.os.iphone || $.os.ipad || $.os.ipod;
		}

		$.os.ios5 = ($.os.ios && test('OS 5_'));
		$.os.android4 = test('Android 4');
		return obj;
	})(),



	end : 'end'
}

Gelodo.prototype = Gelodo.fn;

Gelodo.addMethod = Gelodo.prototype.addMethod;

window.Gelodo = Gelodo;
})( window, window.Zepto || window.jQuery );
