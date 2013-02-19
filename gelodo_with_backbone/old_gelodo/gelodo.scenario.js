// gelodo.scenarioview.js 
;(function( window, _ ){
"use strict";

var $window = $( window ),
	isIOS = $.os.ios,
	isAndroid = $.os.android,
	_container = {},
	sequence = 0,
	flag = true,
	alert_hp = 'albumregist.php',
	NO_AUDIO = 'no audio';

Gelodo.addMethod({
	// @dependence jQuery or zepto, underscore
	// @args
	//  requesturl : シナリオのURL
	//  type       : 返り値の指定 json/jsonp
	//  $trigger   : 再生のトリガーになる要素
	scenarioView : function scenarioView( requesturl, type, $trigger ){
		var _self = this;
		var $body = $('body');
		var audio = null;
		var $modal = _container.$modal = this.loadingWindow();
		_container.$trigger = $trigger;
		$modal.height( $body.height() );
		getScenarioJSON.call( _self, requesturl, type )
		.next(function( data ){
			_container.scenario_data = data;
			_self.getAudio( data.voice )
			.next(function( audio ){
				_container.audio = audio;
				createStage.apply(_self);
				if( isIOS || audio === NO_AUDIO ){
					_self._extInterface.loadComplete.apply(_self);
				}
			})
			.error(function (e) {
				console.log(e);
			});
		})
		.error(function(e){
			console.log(e);
		});
	},
	getAudio : function getAudio( voice_arr ){
		var _self = this;
		var $body = $('body');
		var deferred = new Deferred();
		var cid;
		var voice = void 0;
		var voice_flag = ''+_container.scenario_data.voice_flag;
		voice = _.find( voice_arr, function( v ){
			return v !== '';
		});
		if(voice_flag !== '1' || voice === void 0 || $.os.android4){
			cid = setTimeout(function(){
				clearTimeout(cid);
				deferred.call(NO_AUDIO);
				return;
			},0);
		}else{
			if(isIOS){
				cid = setTimeout(function(){
					clearTimeout(cid);
					var path = _self.gadget.getmp3_path + '?voiceid=' + voice;
					deferred.call(new Audio(path));
				},0);
			}else{
				$body.append( '<div id="jsSwfArea"></div>' );
				$LAB.script('/webbin/js/lib/swfobject.js').wait(function(){
					var swf  = _self.gadget.origin + '/webbin/swf/event_view.swf',
					opt  = {'allowScriptAccess' : 'always', 'wmode' : 'transparent'},
					attr = {},
					flash_vars = '?voiceid=' + voice + '&' + _self.now();
				swfobject.embedSWF(
					_self.setURL(swf) + flash_vars,
					'jsSwfArea', 1, 1, '10.0.0', false, false, opt, attr
					);
				(function checkSwf(){
					if( $( '#jsSwfArea' )[0].status ){
						deferred.call( $( '#jsSwfArea' )[0] );
						return;
					}else{
						setTimeout(checkSwf, 100);
					}
				}());
				});
			}
		}
		return deferred;
	},
	_extInterface : {
		loadComplete : function loadComplete(){
			var _self = this;
			var $body = $('body');
			var data = _container.scenario_data;
			var audio = _container.audio;
			var $draw_area = _container.$draw_area;
			var loading = _container.$modal.children( '.js_modal_loading' );
			var play_btn = $('<a class="js_modal_loading" href="#" ontouchstart="">再生開始</a>');
			var images = [];
			_.each(data.image, function(value,key){
				images.push(value);
			});
			// preload
			Deferred.loop( images.length, function(i){
				var img = new Image();
				img.onload = function(){
					return img;
				}
				img.src = images[i];
			});
			play_btn.bind(_self.touch.tap, function(e){
				e.preventDefault();
				if( isIOS && audio !== NO_AUDIO ){
					audio.load();
				}
				ready.apply(_self);
			});
			var reflow = $body.offset().left;
			$draw_area.bind( _self.touch.tap, function(){
				play.apply(_self);
			});
			loading.after(play_btn).hide();
		},
		error : function error(msg) {
			// msg {String} "undefined voice_id || undefined getmp3_path"
		},
		soundComplete : function soundComplete(){
			var _self = this;
			_container.$play_icon.hide();
			_container.$draw_area.on( _self.touch.tap, play );
			flag = true;
			sequence++;
		}
	}
});
function eventCanceler(e) {
	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.preventDefault){ e.preventDefault(); };
	if (e.stopPropagation){ e.stopPropagation(); };
}
function createStage(){
	var _self = this;
	var $body = $('body');
	var $draw_area = _container.$draw_area = $( [
		'<div id="jsScenarioPlayer" class="portrait" style="display:none;">',
		'<div class="ui_modal"></div>',
		'</div>'
		].join('') );

	$draw_area.html([
		'<div id="jsDrawContainer">',
			'<canvas id="jsDrawArea" width="640" height="640" style="zoom:0.5;"></canvas>',
			'<div id="jsTextArea">',
				'<div id="jsVoiceIcon"></div>',
				'<div id="jsNameBody"></div>',
				'<div id="jsMessageBody"></div>',
			'</div>',
		'</div>'
	].join(''));

	$(document).on('touchstart',function( e ){
		eventCanceler(e);
		_self.scrollTo(0, 0);
	});
	$draw_area.doubleTap(function( e ){
		eventCanceler(e);
		_self.scrollTo(0, 0);
	});
	$body.append( $draw_area );

	_container.$draw_container = $( '#jsDrawContainer' );
	_container.$name_body      = $( '#jsNameBody' );
	_container.$message_body   = $( '#jsMessageBody' );
	_container.$play_icon      = $( '#jsVoiceIcon' );

	var canvas = document.getElementById( 'jsDrawArea' );
	_container.context = (function checkCanvas(){
		if(canvas && canvas.getContext){
			return canvas.getContext( '2d' );
		}
		setTimeout(checkCanvas, 100);
	}());
}

/**
 * $.ajaxJSONPを改造している
 * @param {String} request jsonのURL
 * @@param {St} type "json","jsonp"
 */
function getScenarioJSON( requesturl, type ){
	var _self = this;
	var Gelodo = _self;
	var errorCount = 0;
	var deferred = new Deferred;
	type = type || 'json';
	if (type === 'json'){
		$.getJSON( Gelodo.setURL( requesturl ), function( data ){
			_success (data, deferred);
			return false;
		});
	}else{
		var json_xhr;
		var request_done = false;
		var callback_name = 'V_JSONDATA';
		// TODO:entagと処理分ける
		// TODO:"V_JSONDATA"とcallbackNameのどちらも受け入れるようにする
		if(Gelodo.platform === 'entag'){
			if(window[callback_name]){
				window[callback_name] = function(){};
			}
			window[callback_name] = function(data){
				request_done = true;
				_success(data, deferred);
			};
		}

		json_xhr = $.ajaxJSONP({
			'url' : requesturl += '&callback=?',
			'timeout' : 20000,
			'success' : function (data) {
				_success(data, deferred);
			},
			'complete' : function (data) {},
			'error' : function (xhr, hoge) {
				if(request_done){
					return;
				}
				_error(xhr, 'abort : '+requesturl);
				deferred.fail('abort');
			}
		});

	}
	return deferred;
	// success & error
	function _success (data, deferred){
		var status = data.status;
		
		if(data.error){
			_error(data, 'syntax error : '+requesturl);
			deferred.fail('syntax error');
			return;
		}
		if( status === 200 ||  status === 'OK' ){
			deferred.call( data );
		}else if( status === 202 ){
			//パラ・チケ不足系のエラーはこっちに来る
			if(data.url.indexOf(location.host) !== -1){
				location.href = data.url;
				return ;
			}

			location.href = Gelodo.setURL( data.url );
		}else if( status === 404 ){
			if(data.url.indexOf(location.host) !== -1){
				location.href = alert_hp;
				return ;
			}

			location.href = Gelodo.setURL( alert_hp );
		}else{
			_error(data, 'not found : '+requesturl);
			deferred.fail('not found');
		}
		return;
	};
	function _error (xhr, msg) {
		if(errorCount>0){
			return;
		}
		var data = data || {};
		var home_url = ''
			
		if(Gelodo.platform === 'gree'){
			if(Gelodo.gadget.is_sandbox){
				home_url = 'http://pf-sb.gree.jp/' + Gelodo.gadget.appid;
			}else{
				home_url = 'http://pf.gree.jp/' + Gelodo.gadget.appid;
			}
		}else{
			home_url = Gelodo.setURL('/index.php');
		}
		alert('セッションエラーが発生しました。\n「OK」を押してTOPページへ戻ってください');
		$('#jsModalWindow').remove();
		_container.$trigger.css( {
			'-webkit-pointer-events' :  'auto',
			'pointer-events' : 'auto'
		} );
		++errorCount;
		top.location.href = home_url;
	};
}

function ready(){
	var _self = this;
	var $body = $('body');
	var audio = _container.audio;
	if( isIOS && audio !== NO_AUDIO ){
		audio.pause();
		if(audio.currentTime){
			audio.currentTime = 0;
		}
	}

	//Gelodo.pageSlide( _container.$draw_area );
	_container.$draw_area.css({
		'display' : 'block',
		'left' : '0'
	});
	_container.$draw_container.css('opacity', '0');
	$body.width( '100%' );
	$body.bind( _self.touch.move, function(e){
		e.preventDefault();
		e.stopPropagation();
	});
	setTimeout(function () {
		_container.$draw_container.animate({
			'opacity' : '1'
		}, '700', 'ease-in', function(){
			_self.modalClose();
		});
		play.apply(_self);
	},500);
}

function play(){
	var _self = this;
	if( !flag ){
		return ;
	}
	var scenario = _container.scenario_data;
	if( scenario.text.length <= sequence ){
		_container.$draw_container.animate({
			'opacity' : '0'
		}, '500', 'ease-out', function(){
			location.href = scenario.url;
			_container.$draw_area.unbind( _self.touch.tap );
		});
		return ;
	}
	var data = {
		'who'   : scenario.who[sequence],
		'voice' : scenario.voice[sequence],
		'msg'   : scenario.text[sequence],
		'bg'    : scenario.back[sequence],
		'ch'  : scenario.person[sequence]
	};

	data.bg_img = ( data.bg !== '' ) ? scenario.image[data.bg] : null;
	data.ch_img = ( data.ch !== '' ) ? scenario.image[data.ch] : null;
	draw.call( _self, data );
}

/**
 * canvasに描画する
 * @param {Object} conf 連想配列（ctx,src,width,height） 
 * @return ctx;
 */
function _drawImage(conf) {
	conf = conf || {};
	if(conf.src){
		conf.width = conf.width || 640;
		conf.height = conf.height || 640;
		var img = new Image();
		img.src = conf.src;
		conf.ctx.drawImage( img, 0, 0, conf.width, conf.height );
	}else{
		conf.ctx.clearRect();
	}
	return conf.ctx;
};

function draw( data ){
	var _self = this;
	var ctx = _container.context,
		$draw_area = _container.$draw_area,
		$name_body = _container.$name_body,
		$message_body = _container.$message_body,
		$play_icon = _container.$play_icon,
		audio = _container.audio;
	_drawImage({ 'ctx' : ctx });
	(function () {
		if( data.bg_img === null){
			return;
		}
		_drawImage({
			'ctx' : ctx,
			'src' : data.bg_img
		});
	}());
	(function () {
		if( data.ch_img === null){
			ctx.clearRect();
			return;
		}
		_drawImage({
			'ctx' : ctx,
			'src' : data.ch_img
		});
	}());
	if( data.who === '' ){
		$name_body.hide();
	}else{
		if($name_body.css( 'display' ) === 'none'){
			$name_body.show();
		}
		$name_body.text( data.who );
	}
	$message_body.text( data.msg );
	if( data.voice === '' ){
		setTimeout(function(){
			sequence++;
			flag = true;
		}, 300);
	}else{
		$draw_area.off( _self.touch.tap );
		$play_icon.show();
		if( audio === void 0 || audio === NO_AUDIO ){
			_self._extInterface.soundComplete.apply(_self);
			return;
		}
		if( !isIOS ){
			audio.voicePlay();
			return;
		}
		audio.play();
		$(audio).bind( 'play', function(){
			var _audio = this;
			(function soundCheck(){
				if( _audio.ended ){
					_self._extInterface.soundComplete.apply(_self);
					return ;
				}
				setTimeout(soundCheck, 100);
			})();
		});
	}
}

})( window, window._ );
