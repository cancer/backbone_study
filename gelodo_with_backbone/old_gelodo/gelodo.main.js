// gelodo.mypage.js 
;(function(){
	"use strict";
	var g = window.Gelodo();
	var dispatch_arry = ['mypage'];
	g.dispatcher(dispatch_arry.join('|'), function(){
		$(function(){
			var preventTouchMove = function(){
				$(document).bind(g.touch.move, function(e){
					e.preventDefault();
					e.stopPropagation();
				});
				g.scrollTo( 0, 1 );
			}

			var modalClose = function(target, trigger){
				target.hide();
				trigger.removeClass('active');
				$(document).unbind(g.touch.move);
			}

			// notice overlay
			var $jsNoticeIcon = $("#jsNoticeIcon");
			var $jsNoticeBox = $("#jsNoticeBox");

			$jsNoticeIcon.click(function(e){
				e.preventDefault();
				e.stopPropagation();
				var $self = $(this);

				if($self.hasClass('active')){
					modalClose($jsNoticeBox.css('height', '260px'), $self);
					return ;
				}

				$self.addClass('active')
				$jsNoticeBox.css('height', '100%').show();

			preventTouchMove();
			});

			//$jsNoticeBox.click(function(e){
			//	e.preventDefault();
			//	e.stopPropagation();

			//	if(e.currentTarget.id === "jsNoticeBox"
			//		&& $jsNoticeIcon.hasClass('active')){
			//		
			//		modalClose($jsNoticeBox, $jsNoticeIcon);
			//		return ;
			//	}
			//});
		});
	});
})();

// gelodo.ui.js 
;(function(){
	"use strict";
	var g = window.Gelodo();
	g.dispatcher('/', function(){
		/**
		 * $.fn.fakeActive for Android
		 * @param {string} using addClass||removeClass
		 */
		;(function($){
			$.extend($.fn, {
				fakeActive: function(active_class){
					var that = $(this);
					if( $.os.android ){
						active_class = active_class || 'active';
						that.off('fake_active');
						that.on('touchstart.fake_active',function (e) {
							$(this).addClass(active_class);
						});
						that.on('touchend.fake_active',function (e) {
							$(this).removeClass(active_class);
						});
					}
					if( $.os.ios ){
						that.on('ontouchstart.fake_active', function(){});
					}
					return this;
				}
			})
		})(window.Zepto || window.jQuery);
		// menu overlay
		$(function(){
			var preventTouchMove = function(){
				$(document).bind(g.touch.move, function(e){
					e.preventDefault();
					e.stopPropagation();
				});
				g.scrollTo( 0, 1 );
			};
			var modalClose = function(target, trigger){
				target.hide();
				trigger.removeClass('active');
				$(document).unbind(g.touch.move);
			};
			var $jsMenuBoxTrigger = $('#jsMenuBoxTrigger');
			var $jsMenuClose = $('#jsMenuClose');
			var $jsGlobalNav = $('#jsGlobalNav');
			var content_wrapper = $('#content_wrapper');
			var bodyHeight = {
				old : content_wrapper.height(),
			tmp : 2000
			}

			$('#jsGlobalNav a').fakeActive();
			$('[class*="btn"]').fakeActive();
			$('[class*="lnk_"]').fakeActive();

			$jsMenuBoxTrigger.click(function(e){
				e.preventDefault();
				e.stopPropagation();
				$(this).addClass('active');
				$jsGlobalNav.show();
				preventTouchMove();
				content_wrapper.height(bodyHeight.tmp);
			});
			$jsMenuClose.click(function(e){
				e.preventDefault();
				e.stopPropagation();
				modalClose($jsGlobalNav, $jsMenuBoxTrigger);
				content_wrapper.height(bodyHeight.old);
			});
			//(function(){
			//	var menuToggle = $('#jsMenuToggle');
			//	var globalNav = $('#jsGlobalNav');
			//	menuToggle.click(function(e){
			//		e.preventDefault();
			//		var that = $(this);
			//		that.toggleClass('show');
			//		var nav_status = that.hasClass('show') ? 'block' : 'none' ;
			//		globalNav.css('display', nav_status);
			//	});
			//}());
		});
	});
	g.dispatcher('/|module|mypage', function(){
		$(function(){
			(function rotationBanner() {
				var $banner = $('#jsRotationBanner');
				if($banner.length === 0){
					return;
				}
				/**
				 * rotationTicker
				 * @param {Object} param.txt,param.url
				 */
				var rotationTicker = {};
				rotationTicker.txtarea = $('#jsRotationBannerText a');
				rotationTicker.set = function (param) {
					param = param || {};
					rotationTicker.txtarea.attr('href', param.url);
					rotationTicker.txtarea.text(param.txt);
				};
				/**
				 * rotationBanner
				 */
				var flipsnap = Flipsnap($banner[0], {
					distance: 320
				});
				var $next = $("#jsRotationBannerNext").click(function(e) {
					e.preventDefault();
					flipsnap.toNext();
				});
				var $prev = $("#jsRotationBannerPrev").click(function(e) {
					e.preventDefault();
					flipsnap.toPrev();
				});
				//
				// バナーの数を見てポインターを作る
				//
				var pointerParent = $('#jsRotationBannerPointer');
				var pointers = '';
				$banner.find('.ui_rotation_item').each(function(i,elm){
					if(i===0){
						pointers += '<li class="current" ';
					}else{
						pointers += '<li ';
					}
					pointers += 'data-point="'+(i)+'"><a href="#">'+(i+1)+'</a></li>';
				});
				pointerParent.html(pointers);
				var $pointer = $('#jsRotationBannerPointer li').click(function (e) {
					e.preventDefault();
					var p = $(this).attr('data-point')|0;
					flipsnap.moveToPoint(p);
				});
				// $.each($pointer,function(i,elm){
				// 	$(elm).attr('data-point',''+i);
				// });
				flipsnap.element.addEventListener('fsmoveend', function(e) {
					// pointer
					var old_pointer = $pointer.filter('.current');
					var new_pointer = $pointer.eq(flipsnap.currentPoint)
					old_pointer.removeClass('current');
				new_pointer.addClass('current');
				// ticker
				var li_current = $banner.children().eq(flipsnap.currentPoint).find('a');
				rotationTicker.set({
					txt : li_current.attr('data-txt'),
					url : li_current.attr('href')
				});
				}, false);
				// init
				var first_link = $banner.children().eq(0).find('a');
				rotationTicker.set({
					txt : first_link.attr('data-txt'),
					url : first_link.attr('href')
				});
			})();
		});
	});

	var char_select_arry = [
		"charchange.php",
		"event_mypage.php"
	];

	g.dispatcher( char_select_arry.join('|'), function(){
		$(function(){
			var $jsCharSelect = $('#jsCharSelect');
			var $jsSelectPrev = $('#jsSelectPrev');
			var $jsSelectNext = $('#jsSelectNext');
			var $jsSelectContainer = $('#jsSelectContainer');
			var $jsCharacterView = $('#jsCharacterView');
			var $select_item = $('#jsSelectContainer').children('.ui_select_item');

			var duration = 0;
			var item_view_amount = 4;
			var item_amount = $select_item.length;
			var item_width = $jsSelectContainer.width() / item_amount;
			var timer = 100;

			function carousel_move(){
				$jsSelectContainer.animate({
					width : item_width * duration * -1
				}, timer);
			}

			$jsSelectContainer.css('-webkit-transform3d');

			$jsSelectPrev.click(function(e){
				e.preventDefault();
				e.stopPropagation();

				if(duration <= 0){
					return ;
				}

				duration--;
				carousel_move();
			});

			$jsSelectNext.click(function(e){
				e.preventDefault();
				e.stopPropagation();

				if(duration >= (item_amount - item_view_amount)){
					return ;
				}

				duration++;
				carousel_move();
			});

			$select_item.each(function(){
				var $self = $(this);
				$self.children('.js_select_item').click(function(e){
					e.preventDefault();
					e.stopPropagation();

					if($(this).hasClass('current')){
						return ;
					}

					var $current_select = $jsSelectContainer.children('.current');
					var $current_view = $jsCharacterView.find('.current');
					$current_select.removeClass('current');
					$current_view.removeClass('current');

					var tar_num = $self.index() + 1;
					var tar_selector = '.char_num_' + tar_num;
					var $target = $jsCharacterView.find('.char_num_' + tar_num);

					$target.addClass('current');
					$self.addClass('current');
				});
			})
		});
	});

})();

// gelodo.script.js 
;(function(){
	"use strict";

	var g = window.Gelodo();
	var REEL_PATH = 'http://aimg.gree.jp/js/reel/Reel-0.8.js';
	var getmp3_path = g.gadget.origin + '/battle_sound.php';

	// Play scenario 
	// TODO:gelodo.path_name がおかしいのを直す
	var player_arry = [
	'.'
	];
g.dispatcher( player_arry.join( '|' ), function(){
	var dispatch = arguments[0][0];
	$(function(){
		var $scenarioview_selector = $( '.view_scenario' );
		if( 
			dispatch === '/?'
			&& !$( '.ui_container' ).hasClass( 'is_tutorial' )
			&& $scenarioview_selector.length === 0
		  ){
			  return ;
		  }
		console.debug('scenarioview is binded.');
		$scenarioview_selector.css('pointer-events','auto');
		$scenarioview_selector.click(function( e ){
			e.preventDefault();
			e.stopPropagation();

			var $self = $( this );
			var requesturl = $self.attr( 'href' );
			var type = 'jsonp';
			$self.css( {
				'-webkit-pointer-events' : 'none',
				'pointer-events' : 'none'
			} );
			if($self.closest('#jsGlobalNav').length > 0){
				$('#jsGlobalNav').hide();
			}

			g.scrollTo(0, 1);
			g.scenarioView( requesturl, type, $self);
		});
	});
});
// man:32951
g.dispatcher('/|index.php|gacha|guide', function(){
	$(function(){
		if(!$.os.ios){
			return false;
		}
		$('#self_introduction').click(function (e) {
			e.preventDefault();
			var that = $(this);
			that.blur();
			window.prompt(that.attr('data-msg'), that.attr('value'));
		});
	});
});
// インラインFlashを書き出す記述
g.dispatcher('/|index.php|gacha|guide', function(){
	$(function(){
		//platform依存のライブラリを使うかどうかのフラグ
		//とりあえずベタ書きしとく
		var use_reel = false;
		var use_jj = false;

		var container_id = 'swfcontainer';
		var $object = $('object#' + container_id);

		//とりあえずAndroid4未満はFlashPlayerで
		if($.os.android && !$.os.android4){
			if(!g.device.flash_player){
				// 代替コンテンツの表示
				$object.hide();
				$('#jsAlternateContents').show();
				return;
			}
			return;
		}

		var $swfcon = $('<div/>').insertAfter($object);
		$swfcon.attr('id', container_id).css({
			'width' : '320px',
			'height' : '320px'
		});

		if($object.length > 0){
			//greeでAndroid4以上ならReelを使う
			if(use_reel){
				if(window.Swiff){
					$object.remove();
					var swf_path = $object.attr('data');
					Reel.quality = 0.8;
					var s = new Swiff(swf_path, 'ajax');
					var container = document.getElementById( container_id );
					s.setContainer(container, '320px', '320px');
					s.setEventRouteTable([
							{mc:['/:-'], touch:{x:0, y:0, width:320, height:320}, keyCode:13}
							]);
					s.setOnLoad(function(){
						this.play();
					});
				}
				return;
			}

			//iPhoneとAndroid4以降はswiffy
			if(window.swiffyobject){
				var json = window.swiffyobject;
				var nexturl = $object.attr('data-nexturl') || "";
				nexturl = g.setURL('/' + nexturl);
				console.debug(nexturl);
					$object.remove();
				var stage = new swiffy.Stage($swfcon[0], swiffyobject);
				if(nexturl !== ""){
					stage.setFlashVars("_URL_=" + nexturl);
					console.debug(stage);
				}
				stage.start();
				$swfcon.children(':first-child').css('background-color','#ffcee6');
				return;
			}
		}
	});
});

})();


;(function(){
	var g = window.Gelodo();

	g.dispatcher( g.gadget.pathname );

	g.hideAddressBar();
})();
