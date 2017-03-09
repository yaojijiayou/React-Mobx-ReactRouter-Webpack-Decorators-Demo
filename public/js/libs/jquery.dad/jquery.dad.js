

(function ($) {
  'use strict';
  var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

  $.fn.dad = function (opts) {
    var _this = this;
    var pressTimer;//长按事件settimeout返回的handler

    var defaults = {
      target: '>div',
      draggable: false,
      placeholder: '',
      callback: false,
      containerClass: 'dad-container',
      childrenClass: 'dads-children',
      cloneClass: 'dads-children-clone',
      active: true,
    };

    var options = $.extend({}, defaults, opts);

    $(this).each(function () {
      var active = options.active;
      var $daddy = $(this);
      var childrenClass = options.childrenClass;
      var cloneClass = options.cloneClass;
      var jQclass = '.' + childrenClass;
      var $target = $daddy.find(options.target);
      var placeholder = options.placeholder;
      var callback = options.callback;
      var dragClass = 'dad-draggable-area';
      var holderClass = 'dads-children-placeholder';

      // HANDLE MOUSE
      var mouse = {
        x: 0,
        y: 0,
        target: false,
        clone: false,
        placeholder: false,
        cloneoffset: {
          x: 0,
          y: 0,
        },
        updatePosition: function (e) {
          this.x = e.pageX;
          this.y = e.pageY;
        },

        move: function (e) {
          this.updatePosition(e);
          if (this.clone !== false && _this.target !== false) {
            this.clone.css({
              left: this.x - this.cloneoffset.x,
              top: this.y - this.cloneoffset.y,
            });
          }
        },
      };

      var touchStartX=0,
      touchStartY=0;

      $(window).on('mousemove touchmove', function (e) {
        if(g_ObservableAppState.getState() != APP_STATE_ENUM.editable) return;
        var ev = e;

        if (mouse.clone !== false && mouse.target !== false) e.preventDefault();

        if (supportsTouch && e.type == 'touchmove') {
          ev = e.originalEvent.touches[0];
          var mouseTarget = document.elementFromPoint(ev.clientX, ev.clientY);

          $(mouseTarget).trigger('touchenter');
        }

        mouse.move(ev);
      });

      $daddy.addClass(options.containerClass);

      if (!$daddy.hasClass('dad-active') && active === true) {
        $daddy.addClass('dad-active');
      };

      // DEFAULT DROPPING
      $daddy.on('DOMNodeInserted', function (e) {
        var $thisTarget = $(e.target);
        if (!$thisTarget.hasClass(childrenClass) && !$thisTarget.hasClass(holderClass)) {
          $thisTarget.addClass(childrenClass);
        }
      });

      // ORDER ELEMENTS
      var order = 1;
      $target.addClass(childrenClass).each(function () {
        if ($(this).data('dad-id') == undefined) {
          $(this).attr('data-dad-id', order);
        }

        $(this).attr('data-dad-position', order);
        order++;
      });

      // CREATE REORDER FUNCTION
      function updatePosition(e) {
        var order = 1;
        e.find(jQclass).each(function () {
          $(this).attr('data-dad-position', order);
          order++;
        });
      }

      // END EVENT
      function dadEnd() {
        if (mouse.target != false &&  mouse.clone != false) {
          if (callback != false) {
            callback(mouse.target);
          }

          var appear = mouse.target;
          var desappear = mouse.clone;
          var holder = mouse.placeholder;
          var bLeft = 0;
          var bTop = 0;

          // Maybe we will use this in the future
          //Math.floor(parseFloat($daddy.css('border-left-width')));
          //Math.floor(parseFloat($daddy.css('border-top-width')));
          if ($.contains($daddy[0], mouse.target[0])) {
            mouse.clone.animate({
              top: mouse.target.offset().top - $daddy.offset().top - bTop,
              left: mouse.target.offset().left - $daddy.offset().left - bLeft,
            }, 300, function () {
              appear.css({
                visibility: 'visible',
              }).removeClass('active');
              desappear.remove();
            });
          } else {
            mouse.clone.fadeOut(300, function () {
              desappear.remove();
            });
          }

          holder.remove();
          mouse.clone = false;
          mouse.placeholder = false;
          mouse.target = false;
          updatePosition($daddy);
        }

        $('html, body').removeClass('dad-noSelect');
      }

      // UPDATE EVENT
      function dadUpdate(obj) {
        if (mouse.target !== false && mouse.clone !== false) {
          var $origin = $('<span style="display:none"></span>');
          var $newplace = $('<span style="display:none"></span>');

          if (obj.prevAll().hasClass('active')) {
            obj.after($newplace);
          } else {
            obj.before($newplace);
          }

          mouse.target.before($origin);
          $newplace.before(mouse.target);

          // UPDATE PLACEHOLDER
          mouse.placeholder.css({
            top: mouse.target.offset().top - $daddy.offset().top,
            left: mouse.target.offset().left - $daddy.offset().left,
            width: mouse.target.outerWidth() - 10,
            height: mouse.target.outerHeight() - 10,
          });

          $origin.remove();
          $newplace.remove();
        }
      }

      // GRABBING EVENT
      var jq = (options.draggable !== false) ? options.draggable : jQclass;
      // $daddy.find(jq).addClass(dragClass);

      $daddy.on('touchstart', jq, function (e) {

        var _touch = e.originalEvent.changedTouches[0];
            touchStartX = _touch.clientX;
            touchStartY = _touch.clientY;


        pressTimer = setTimeout(function() {
            //长按生效后触发的回调
            var t_state = g_ObservableAppState.getState();
            if(t_state == APP_STATE_ENUM.uneditable){
               $(".app-container-mirror").empty().append($(".app-container-in-use").children().clone());
               g_ObservableAppState.setState(APP_STATE_ENUM.editable);
            }
                

            if(t_state == APP_STATE_ENUM.editable){
                  //拖拽的准备
                  if (e.type == 'touchstart') {
                    mouse.updatePosition(e.originalEvent.touches[0]);
                  }

                  if (mouse.target == false && active == true && (e.which == 1 || e.type == 'touchstart')) {
                    var $self = $(this);

                    // GET TARGET
                    if (options.draggable !== false) {
                      mouse.target = $daddy.find(jQclass).has(this);
                    } else {
                      mouse.target = $self;
                    }

                    // ADD CLONE
                    mouse.clone = mouse.target.clone();
                    mouse.target.css({ visibility: 'hidden' }).addClass('active');
                    mouse.clone.addClass(cloneClass);
                    $daddy.append(mouse.clone);

                    // ADD PLACEHOLDER
                    var $placeholder = $('<div></div>');
                    mouse.placeholder = $placeholder;
                    mouse.placeholder.addClass(holderClass);
                    mouse.placeholder.css({
                      top: mouse.target.offset().top - $daddy.offset().top,
                      left: mouse.target.offset().left - $daddy.offset().left,
                      width: mouse.target.outerWidth() - 10,
                      height: mouse.target.outerHeight() - 10,
                      lineHeight: mouse.target.height() - 18 + 'px',
                      textAlign: 'center',
                    }).text(placeholder);

                    $daddy.append(mouse.placeholder);

                    // GET OFFSET FOR CLONE
                    var bLeft = Math.floor(parseFloat($daddy.css('border-left-width')));
                    var bTop = Math.floor(parseFloat($daddy.css('border-top-width')));
                    var difx = mouse.x - mouse.target.offset().left + $daddy.offset().left + bLeft;
                    var dify = mouse.y - mouse.target.offset().top + $daddy.offset().top + bTop;
                    mouse.cloneoffset.x = difx;
                    mouse.cloneoffset.y = dify;

                    // REMOVE THE CHILDREN DAD CLASS AND SET THE POSITION ON SCREEN
                    mouse.clone.removeClass(childrenClass).css({
                      position: 'absolute',
                      top: mouse.y - mouse.cloneoffset.y,
                      left: mouse.x - mouse.cloneoffset.x,
                    });

                    // UNABLE THE TEXT SELECTION AND SET THE GRAB CURSOR
                    $('html,body').addClass('dad-noSelect');
                  }
                  console.log(g_ObservableAppState.getState());
            }
            
        }.bind(this),800);
        // return false;
      }).on("touchend",function(e){

          var _touch = e.originalEvent.changedTouches[0];

          var xdiff = _touch.clientX - touchStartX;
          var ydiff = _touch.clientY - touchStartY;
          var distance = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
          
          dadEnd();
          clearTimeout(pressTimer);
          if(g_ObservableAppState.getState()==APP_STATE_ENUM.uneditable && distance<=30){
              
              var $btn = $(e.target).parents(".app-wrap").find(".btn");
              if("maintaining"== $btn.attr("status")) return;
              
              var appId = $btn.attr("app-id");
              //跳转到对应app
              Util.jumpToApp(appId,g_cityCode,g_cityName);
          }
          
      });

      $daddy.on('mouseenter touchenter', jQclass, function () {
        dadUpdate($(this));
      });
    });

    return this;
  };
})(jQuery);
