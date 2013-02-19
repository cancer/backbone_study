/*
 * gelodo.js
 * 
 * Version : 0.1.0
 * Author : y-uno
 *
 * Copyright 2012 Vector Inc.
 */
;(function(window, undefined){
"use strict";
	var location = window.location,
		$LAB = window.$LAB,
		platform = checkPlatform(location.host),//location.host.indexOf( 'mbga' ) !== -1 ? 'dena' : 'gree',
		gadget = {},
		is_sandbox = location.host.indexOf('sb') !== -1;

	/********************************
	 * conf
	********************************/
	var conf = {
		_domain : 'ikemen.love-k.jp',
		_develop : 'test2-' + platform,
		_public : platform
	};
	

	function checkPlatform(host){
		var _platform = '';
		switch(true){
			case /mbga/.test(host)  : _platform = 'dena'  ;break;
			case /gree/.test(host)  : _platform = 'gree'  ;break;
			case /entag/.test(host) : _platform = 'entag' ;break;
		}
		return _platform;
	}


	// pathはルート相対で渡す
	function setURL( path ){
		// G*** はガジェット通さない
		if( platform === 'gree' ){ return path; }

		// en*** はHTMLならガジェット通す
		// それ以外(リソース系)はガジェット通さない
		if( platform === 'entag' ){
			var no_gadget = ['.php', '.html'];
			var subdomain = (gadget.is_sandbox) ? conf._develop : conf._public;
			for(var i=0; i<no_gadget.length; i++){
				if(i === no_gadget.length-1){
					return '//'+ subdomain +'.'+conf._domain+path;
				}

				if(path.indexOf(no_gadget[i]) === -1){
					continue;
				}else{
					// en***は'appid/?url=～'になってるとエラーになる
					return location.origin + '/application/' + gadget.appid + '?url=' + encodeURIComponent( gadget.origin + path );
					break;
				}
			}
		}

		// ガジェット通して表示する
		return location.origin + '/' + gadget.appid + '/?url=' + encodeURIComponent( gadget.origin + path );
	}


	({
		dena : function(){
			gadget.url = location.search
				? decodeURIComponent( location.search ).match( /url=(.*)$/i )[1]
				: void 0;
			gadget.host = gadget.url 
				? gadget.url.match( /http:\/\/(.*?)\// )[1]
				: ( is_sandbox ? conf._develop : conf._public ) + '.' + conf._domain;
			gadget.appid = location.pathname.replace( '/', '' );
		},
		gree : function(){
			gadget.url = location.href;
			gadget.host = location.host;
			gadget.appid = window.name.split( '_' )[1];
			gadget.is_sandbox = /test/.test(gadget.host);
		},
		entag : function(){
			// TODO
			gadget.is_sandbox = /sb-osp/.test(location.host);
			//gadget.url = location.href;
			gadget.url = location.search
				? decodeURIComponent( location.search ).match( /url=(.*)$/i )[1]
				: void 0;
			gadget.host = ( (gadget.is_sandbox) ? conf._develop : conf._public ) + '.' + conf._domain;
			gadget.appid = location.href.match(/application\/(\d*)/ )[1];
		}
	})[platform]();

	gadget.origin = 'http://' + gadget.host;
	gadget.pathname = gadget.url 
		? gadget.url.replace( gadget.origin, '/' )
		: '/index.php';
	gadget.getmp3_path = gadget.origin + '/getmp3.php';
	var date = (Date.now) ? Date.now() : new Date();

	window.GelodoPlatformSettings = {
		platform : platform,
		gadget : gadget,
		setURL : setURL
	};

})(window);

