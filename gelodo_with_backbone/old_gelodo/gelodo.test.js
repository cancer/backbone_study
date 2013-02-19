// gelodo.dom.js 
;(function( window ){
	var isios = $.os.ios;
	var $window = $( window );
	var $document = $( document );

Gelodo.addMethod({
	// モーダルウィンドウを表示する
	// @dependence : jQuery or zepto
	// @args
	//  $content     : モーダルウィンドウの中に表示するコンテンツ
	//                 text or jQueryオブジェクト
	//  class_name   : 中に表示するコンテンツにクラスをつける
	//                 $content が text だった時のみ有効
	//                 省略可能
	//  cancel_flag  : コンテンツの外をクリックしたときにモーダルウィンドウを閉じるかどうか
	//                 true/false で指定。デフォルトは true
	//                 省略可能
	//  callback     : ウィンドウを閉じたときに実行する関数 function
	//                 cancel_flag が true の時のみ指定可
	//                 $(this) に $content が渡される(textだった場合はjQueryObject化して渡す)
	//                 省略可能
	modalWindow : function( $content, class_name, cancel_flag, callback ){
		var _self = this;
		var $body = $( 'body' );
		var $modal = $('#jsModalWindow');
		var name_space = _self.config.name_space;
		if($modal.length){
			$modal.remove();
		}
		$modal = $( '<div id="jsModalWindow"><div class="ui_modal"></div></div>' ).appendTo( $body );
		$modal = $modal.children( '.ui_modal' );
		$.fn.bindTap = function( handler, lightning ){
			var EVENT_TYPE = ( _self.support.touch ) ? 'touchend' : 'click';
			if( lightning === void 0 ){
				lightning = false;
			}
			
			return this.each(function(){
				var $self = $( this );
				var event_type = lightning ? EVENT_TYPE + '.' + name_space : 'click.' + name_space;
				return $self.bind( event_type, handler );
			});
		};
		
		if( typeof class_name == 'boolean' ){
			cancel_flag = class_name;
			class_name = '';
		}else if( $.isFunction( class_name ) ){
			callback = class_name;
			cancel_flag = true;
			class_name = '';
		}
		
		if( !$.isFunction( callback ) ){
			callback = $.noop;
		}

		$modal.data( 'pageYOffset', document.pageYOffset );
		_self.scrollTo( 0, 1 );

		cancel_flag = ( cancel_flag === false ) ? cancel_flag : true;
		
		if( typeof $content == 'string' ){
			$content = $( '<p>' + $content + '</p>' ).addClass( class_name );
		}
		
		$modal.append( $content );
		
		$( document ).bind( _self.touch.move, function( e ){
			e.preventDefault();
			e.stopPropagation();
		});

		$modal.height( $body.height() ).bindTap(function( e ){
			if( e.target.id == $modal[0].id && cancel_flag ){
				callback.apply( $content );
				_self.modalClose();
			}
		});
		
		var position = function(){
			var orientation = ( $( window ).data( 'orientation' ) === 0 ) ? 'portrait' : 'landscape';
			return {
				top: _self.device.innerHeight[orientation]/2,
				left: _self.device.innerWidth[orientation]/2
			};
		};
		
		$content.css({
			top : function(){
				return position().top - $( this ).outerHeight()/2;
			},
			left : function(){
				return position().left - $( this ).outerWidth()/2;
			}
		});

		return $modal;
	},



	// 「通信中」画面を表示する
	// Gelodo.modalWindow の非同期通信用ショートカット
	loadingWindow : function(){
		return this.modalWindow( '通信中', 'js_modal_loading', false );
	},



	// Yes/No の確認画面を表示する
	// Gelodo.modalWindow の確認画面用ショートカット
	// @dependence : jQuery or zepto
	// @args
	//  msg     : 文言
	//  href    : はい」を選択したときの遷移先
	//            省略可能(省略した場合は'#')
	//  choices : 選択肢の文言
	// 配列で指定。デフォルトは「いいえ」「はい」
	modalConfirm : function( msg, href, btn_text ){
		var _self = this;
		if( $.isArray( href ) ){
			btn_text = href;
			href = '#';
		}else if( href === void 0 ){
			href = '#';
		}
		if( btn_text === void 0 ){
			btn_text = ['いいえ', 'はい'];
		}
		$(document).delegate( '#jsCancel', 'click', function(e){
			e.preventDefault();
			_self.modalClose();
		});
		return this.modalWindow([
			msg,'<br>',
			'<a id="jsCancel" href="#">',btn_text[0],'</a>',
			'<a id="jsSubmit" href="',href,'">',btn_text[1],'</a>'
		].join( '' ), 'v_confirm');
	},



	// Gelodo.modalWindow のエラー画面用ショートカット
	// @dependence : jQuery or zepto
	// @args
	//  msg     : 文言
	//  href    : 「わかりました」を選択したときの遷移先
	//           省略可能(省略した場合はそのまま閉じる)
	//  btn_text : ボタンの文言
	//           text デフォルトは「わかりました」
	modalError : function( msg, href, btn_text ){
		var btn_id = 'jsSubmit';
		var _self = this;
		if( href !== void 0 ){
			if(href.indexOf( 'http:' ) === -1){
				btn_text = href;
				href = '#';
			}
		}else{
			href = '#';
		}
		if( btn_text === void 0 ){
			btn_text = 'わかりました';
		}
		if( href === '#' ){
			btn_id = 'jsCancel';
		}
		$(document).delegate( '#'+btn_id, 'click', function( e ){
			e.preventDefault();
			e.stopPropagation();
			_self.modalClose();
		});
		return this.modalWindow([
			msg,'<br>',
			'<a id="',btn_id,'" href="',href,'">',btn_text,'</a>'
		].join( '' ), 'v_error');
	},



	// モーダルウィンドウを閉じる
	// id : モーダルウィンドウのID。デフォルトは"#jsModalWindow"
	modalClose : function( id ){
		var _self = this;
		if(id || id === void 0 ){
			id = '#jsModalWindow';
		}
		var scroll_offset = $( id ).attr( 'data-pageYOffset' ) * 1;
		$document.unbind( _self.touch.move );
		$( id ).remove();
		this.scrollTo(0, scroll_offset);
	},



	// スライドで要素の表示切替を行う
	// @dependence : jQuery or zepto, underscore
	// @args
	//  $next   : 切り替えた先の要素 jQueryObject
	//  $prev   : 切り替える前の要素 Object
	//            要素そのもの($prev.body)と戻るためのボタン($prev.btn)を指定
	//            省略可能。$prev.btn を省略した場合戻る処理無し、$prev.body はデフォルトで $('#vWrapper')
	// callback : 切り替え後に実行する関数。省略可能
	pageSlide : function( $next, $prev, callback ){
		var _self = this;
		if( _self.platform === 'dena' ){
			$( '#mbga_footer_pf' ).hide();
		}

		var $prev_default = {
			body : $( _self.config.wrapping_selector ),
			btn  : null
		};
		
		if( $.isFunction( $prev ) ){
			callback = $prev;
			$prev = $prev_default;
		}else if( $prev === void 0 ){
			callback = function(){};
			$prev = $prev_default;
		}else{
			$prev = $.extend( $prev_default, $prev );
			if( !$.isFunction( callback ) ){
				callback = function(){};
			}
		}
		
		_.each( [$next, $prev.body], function( $elm ){
			$elm.attr( 'style', '-webkit-transform: translate3d("0,0,0")' );
		});
		$prev.body.animate({
			left: "-110%"
		}, 300, 'swing', function(){
			callback.apply( this, arguments );
			$( this ).hide();
			$next.show();
			_self.hideAddressBar();

			if( $prev.btn != null ){
			$prev.btn.live( 'click.' + name_space, function( e ){
				e.preventDefault();
				_self.hideAddressBar();
				$next.hide();
				$prev.body.show().animate({
					left: 0
				}, 300, 'swing' );
				$mobage.show();
			});
			}
		});
	},



	// 一般的なSWFの描画を行う
	//  iOSはjj.js、Androidはswfobject.jsにて描画する
	//  HTML側にて上記2ファイル読み込むこと
	// @dependence jQuery or zepto, jj or reel(ios), swfobject(android)
	// @args
	//  url : 対象SWFのurl
	embedSWF : function( url ){
        //reel path http://aimg.gree.jp/js/reel/Reel-0.5.js
		var _self = this;
		var draw_area_id = 'jsDrawArea';
		var $draw_area = $( '#' + draw_area_id );

		if( isios ){
			if( _self.platform === 'dena' ){
				var jj = new JumpinJack( url, $draw_area[0], { scale : 1.33, fullScreen : true, lightning : "5" } );
				setTimeout(function(){
					if( $draw_area.children( 'canvas' ).length === 0 ) setTimeout( arguments.callee, 100 );
					else{
						_self.orientationChange(function(){
							if( $( window ).data( 'orientation' ) * 1 === 90 ){
								setTimeout(function(){
									var zoom = window.innerHeight / 320;
									$draw_area.css( 'zoom', zoom + ' !important' );
								}, 100 );
							}else{
								$draw_area.css( 'zoom', '1 !important' );
							}
						});
					}
				}, 100 );
			}else{
				//LAB.js使わない
				return ;
				window.$LAB
				.script( 'http://aimg.gree.jp/js/reel/Reel-0.5.js' )
				.wait(function(){
					Reel.quality = 0.8;
					var s = new Swiff(url, 'ajax');
					var container = $draw_area[0];
					var swf_size = (window.innerWidth < 480 ? window.innerWidth : 268) + 'px';
					//s.setContainer(container, swf_size, swf_size);
					s.setContainer(container);
					s.setOnLoad(function(){
						//var reel_elem = container.getElementsByClassName('reel');
						this.play();
						(function checkPlay(){
							if(container.innerHTML === ''){ setTimeout(checkPlay, 100); }
							var reel_elem = document.querySelector('.reel_SWIFFMAINFILE');
							var boxStyle = container.style;
							var zoom_ratio = (window.innerWidth) < 480 ? 320/240 : 268/240;
							boxStyle.display = 'block';
							/*
							   boxStyle.width = window.innerWidth;
							   boxStyle.height = window.innerWidth;
							   */
							boxStyle.webkitTransformOrigin = '50% 0';
							boxStyle.webkitTransform = 'scale(' + zoom_ratio + ', ' + zoom_ratio + ')';
							boxStyle.verticalAlign = 'middle';
							boxStyle.margin = '0 auto';
						})();
					});
					s.setEventRouteTable([
						{mc:['/:-'], touch:{x:0, y:0, width:320, height:320}, keyCode:13}
					]);
				});
			}
		}else{
			//swfobject.js使わない
			return ;
			(function checkPlay(){
				if( !window.swfobject ) setTimeout( arguments.callee, 100);
				else{
					var innerWidth = _self.device.real_width;
					var innerHeight = _self.device.real_height;
					var size = function(){
						return ( $( window ).data( 'orientation' ) * 1 === 0 ) ? innerWidth.portrait : innerHeight.landscape;
					};

					swfobject.embedSWF( url, draw_area_id, size(), size(), '10.0.0' );
					/*
					$draw_area.css({
						position : 'absolute',
						top: 0,
						left: 0
					});
					*/
				}
			}, 100 );
		}
	}
});
})( window );
