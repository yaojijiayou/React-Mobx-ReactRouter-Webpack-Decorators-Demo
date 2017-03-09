(function(window, document, Math) {
    var utils = (function() {
        var me = {};
        var _elementStyle = document.createElement('div').style;
        var _vendor = (function() {
            var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
            var transform;
            var i = 0;
            var l = vendors.length;
            for (; i < l; i++) {
                transform = vendors[i] + 'ransform';
                if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1)
            }
            return false
        })();

        function _prefixStyle(style) {
            if (_vendor === false) return false;
            if (_vendor === '') return style;
            return _vendor + style.charAt(0).toUpperCase() + style.substr(1)
        }
        me.getTime = Date.now ||
        function getTime() {
            return new Date().getTime()
        };
        me.addEvent = function(el, type, fn, capture) {
            if (el[0]) el = el[0];
            el.addEventListener(type, fn, !! capture)
        };
        me.removeEvent = function(el, type, fn, capture) {
            if (el[0]) el = el[0];
            el.removeEventListener(type, fn, !! capture)
        };
        me.momentum = function(current, start, time, lowerMargin, wrapperSize) {
            var distance = current - start,
                speed = Math.abs(distance) / time,
                destination, duration, deceleration = 0.0006;
            destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
            duration = speed / deceleration;
            if (destination < lowerMargin) {
                destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
                distance = Math.abs(destination - current);
                duration = distance / speed
            } else if (destination > 0) {
                destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                distance = Math.abs(current) + destination;
                duration = distance / speed
            }
            return {
                destination: Math.round(destination),
                duration: duration
            }
        };
        $.extend(me, {
            hasTouch: 'ontouchstart' in window
        });
        me.tap = function(e, eventName) {
            var ev = document.createEvent('Event');
            ev.initEvent(eventName, true, true);
            ev.pageX = e.pageX;
            ev.pageY = e.pageY;
            e.target.dispatchEvent(ev)
        };
        me.click = function(e) {
            var target = e.target,
                ev;
            if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent('click', true, true, e.view, 1, target.screenX, target.screenY, target.clientX, target.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
                ev._constructed = true;
                target.dispatchEvent(ev)
            }
        };
        $.extend(me.style = {}, {
            transform: _prefixStyle('transform'),
            transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
            transitionDuration: _prefixStyle('transitionDuration'),
            transitionDelay: _prefixStyle('transitionDelay'),
            transformOrigin: _prefixStyle('transformOrigin')
        });
        $.extend(me.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,
            mousedown: 2,
            mousemove: 2,
            mouseup: 2
        });
        $.extend(me.ease = {}, {
            quadratic: {
                style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fn: function(k) {
                    return k * (2 - k)
                }
            },
            circular: {
                style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
                fn: function(k) {
                    return Math.sqrt(1 - (--k * k))
                }
            },
            back: {
                style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fn: function(k) {
                    var b = 4;
                    return (k = k - 1) * k * ((b + 1) * k + b) + 1
                }
            },
            bounce: {
                style: '',
                fn: function(k) {
                    if ((k /= 1) < (1 / 2.75)) {
                        return 7.5625 * k * k
                    } else if (k < (2 / 2.75)) {
                        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75
                    } else if (k < (2.5 / 2.75)) {
                        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375
                    } else {
                        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375
                    }
                }
            },
            elastic: {
                style: '',
                fn: function(k) {
                    var f = 0.22,
                        e = 0.4;
                    if (k === 0) {
                        return 0
                    }
                    if (k == 1) {
                        return 1
                    }
                    return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1)
                }
            }
        });
        return me
    })();

    function IScroll(opts) {
        this.wrapper = typeof opts.wrapper == 'string' ? $(opts.wrapper) : opts.wrapper;
        this.scroller = typeof opts.scroller == 'string' ? $(opts.scroller) : opts.scroller;
        if (!opts.wrapper[0] || !opts.scroller[0]) throw 'param error';
        this.wrapper = this.wrapper[0];
        this.scroller = this.scroller[0];
        this.scrollerStyle = this.scroller.style;
        this.options = {
            setp: false,
            scrollbars: true,
            startY: 0,
            bounceTime: 600,
            bounceEasing: utils.ease.circular,
            bounce: true,
            bindToWrapper: true,
            resizePolling: 60,
            startX: 0,
            startY: 0
        };
        this.hintChangeThreshold = parseInt($('html').attr('data-dpr') || 1)*16*3;
        for (var i in opts) {
            this.options[i] = opts[i]
        }
        this.translateZ = ' translateZ(0)';
        this.x = 0;
        this.y = 0;
        this._events = {};
        this._init();
        this.refresh();
        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();
        this.mark = 1;
    };
    IScroll.prototype = {
        _init: function() {
            this._initEvents();
            if (this.options.scrollbars) {
                this._initIndicator()
            }
        },
        refresh: function() {
            var rf = this.wrapper.offsetHeight;
            this.wrapperHeight = this.wrapper.clientHeight;
            this.scrollerHeight = this.scroller.offsetHeight;
            this.maxScrollY = this.wrapperHeight - this.scrollerHeight;
            this.endTime = 0;
            this._execEvent('refresh');
            this.resetPosition()
        },
        _initEvents: function(remove) {
            var eventType = remove ? utils.removeEvent : utils.addEvent;
            var target = this.options.bindToWrapper ? this.wrapper : window;
            eventType(window, 'orientationchange', this);
            eventType(window, 'resize', this);
            if (this.options.click) {
                eventType(this.wrapper, 'click', this, true)
            }
            if (utils.hasTouch) {
                eventType(this.wrapper, 'touchstart', this);
                eventType(target, 'touchmove', this);
                eventType(target, 'touchcancel', this);
                eventType(target, 'touchend', this)
            } else {
                eventType(this.wrapper, 'mousedown', this);
                eventType(target, 'mousemove', this);
                eventType(target, 'mousecancel', this);
                eventType(target, 'mouseup', this)
            }
            eventType(this.scroller, 'transitionend', this);
            eventType(this.scroller, 'webkitTransitionEnd', this);
            eventType(this.scroller, 'oTransitionEnd', this);
            eventType(this.scroller, 'MSTransitionEnd', this)
        },
        _start: function(e) {
            if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
                return
            }
            var point = e.touches ? e.touches[0] : e,
                pos;
            this.initiated = utils.eventType[e.type];
            this.moved = false;
            this.distY = 0;
            this._transitionTime();
            this.startTime = utils.getTime();
            if (this.isInTransition) {
                this.isInTransition = false;
                pos = this.getComputedPosition();
                var _x = Math.round(pos.x);
                var _y = Math.round(pos.y);
                if (_y < 0 && _y > this.maxScrollY && this.options.adjustXY) {
                    _y = this.options.adjustXY.call(this, _x, _y).y
                }
                this._translate(_x, _y);
                this._execEvent('scrollEnd')
            }
            this.startX = this.x;
            this.startY = this.y;
            this.absStartX = this.x;
            this.absStartY = this.y;
            this.pointX = point.pageX;
            this.pointY = point.pageY;
            this._execEvent('beforeScrollStart')
        },
        _move: function(e) {
            if(document.body.scrollTop != 0) return;
            if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                return
            }
            // e.preventDefault();
            var point = e.touches ? e.touches[0] : e,
                deltaX = point.pageX - this.pointX,
                deltaY = point.pageY - this.pointY,
                timestamp = utils.getTime(),
                newX, newY, absDistX, absDistY;
            this.pointX = point.pageX;
            this.pointY = point.pageY;
            this.distX += deltaX;
            this.distY += deltaY;
            absDistX = Math.abs(this.distX);
            absDistY = Math.abs(this.distY);
            if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
                return
            }
            newY = this.y + deltaY;
            console.log()
            // if(newY<0){
            //     return;
            // }
            // else{
                e.preventDefault();
            // }

            if (newY > 0 || newY < this.maxScrollY) {
                newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY
            }
            if (!this.moved) {
                this._execEvent('scrollStart')
            }
            this.moved = true;
            var el = document.activeElement;
            if (el.nodeName.toLowerCase() == 'input') {
                el.blur();
                this.disable();
                setTimeout($.proxy(function() {
                    this.enable()
                }, this), 250);
                return
            }
            console.log(newY);
            
            this._translate(0, newY, true);
            if (timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y
            }
            this._scrollMove()
        },
        silieUpDown: function() {
            this.mark = 1;
            var y = this.y;
            if (!this.hasVerticalScroll || y > 0) {
                this._execEvent('slideMoveEnd')
            } else if (y < this.maxScrollY) {
                this._execEvent('slideMoveEnd')
            }
        },
        _silieScroll: function() {
            this._execEvent('silieScroll')
        },
        _end: function(e) {
            this._execEvent('scrollEnd');
            $('#circleLoading').circleProgress('value', 0);
            if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                return
            }
            if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                e.preventDefault()
            }
            var point = e.changedTouches ? e.changedTouches[0] : e,
                momentumX, momentumY, duration = utils.getTime() - this.startTime,
                newX = Math.round(this.x),
                newY = Math.round(this.y),
                distanceX = Math.abs(newX - this.startX),
                distanceY = Math.abs(newY - this.startY),
                time = 0,
                easing = '';
            this.isInTransition = 0;
            this.initiated = 0;
            this.endTime = utils.getTime();
            this.silieUpDown();
            if (this.resetPosition(this.options.bounceTime)) {
                return
            }
            this.scrollTo(newX, newY);
            if (!this.moved) {
                if (this.options.tap) {
                    utils.tap(e, this.options.tap)
                }
                if (this.options.click) {
                    utils.click(e)
                }
                this._execEvent('scrollCancel');
                return
            }
            if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
                this._execEvent('flick');
                return
            }
            if (duration < 300) {
                momentumY = utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0);
                newY = momentumY.destination;
                time = Math.max(momentumY.duration);
                this.isInTransition = 1
            }
            if (this.options.snap) {
                var snap = this._nearestSnap(newX, newY);
                this.currentPage = snap;
                time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(newX - snap.x), 1000), Math.min(Math.abs(newY - snap.y), 1000)), 300);
                newX = snap.x;
                newY = snap.y;
                this.directionX = 0;
                this.directionY = 0;
                easing = this.options.bounceEasing
            }
            if (newY != this.y) {
                if (newY > 0 || newY < this.maxScrollY) {
                    easing = utils.ease.quadratic
                }
                this.scrollTo(newX, newY, time, easing);
                return
            }
            this._execEvent('scrollEnd')
        },
        _resize: function() {
            var that = this;
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(function() {
                that.refresh()
            }, this.options.resizePolling)
        },
        _transitionTimingFunction: function(easing) {
            this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
            this.indicator && this.indicator.transitionTimingFunction(easing)
        },
        _transitionTime: function(time) {
            time = time || 0;
            this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';
            this.indicator && this.indicator.transitionTime(time);
        },
        getComputedPosition: function() {
            var matrix = window.getComputedStyle(this.scroller, null),
                x, y;
            matrix = matrix[utils.style.transform].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
            return {
                x: x,
                y: y
            }
        },
        _initIndicator: function() {
            var el = createDefaultScrollbar();
            this.wrapper.appendChild(el);
            this.indicator = new Indicator(this, {
                el: el
            });
            this.on('scrollEnd', function() {
                this.indicator.fade()
            });
            var scope = this;
            this.on('scrollCancel', function() {
                scope.indicator.fade()
            });
            this.on('scrollStart', function() {
                scope.indicator.fade(1)
            });
            this.on('beforeScrollStart', function() {
                scope.indicator.fade(1, true)
            });
            this.on('refresh', function() {
                scope.indicator.refresh()
            })
        },
        _translate: function(x, y, isStep) {
            if (this.options.setp && !isStep) {
                var flag2 = y > 0 ? 1 : -1;
                var top = Math.abs(y);
                var mod = top % this.options.setp;
                top = (parseInt(top / this.options.setp) * this.options.setp + (mod > (this.options.setp / 2) ? this.options.setp : 0)) * flag2;
                y = top
            }
            this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
            this.x = x;
            this.y = y;
            this._perform(y);
            this._silieScroll();
            if (this.options.scrollbars) {
                this.indicator.updatePosition()
            }
        },
        resetPosition: function(time) {
            var x = this.x,
                y = this.y;
            time = time || 0;
            if (this.y > 0) {
                y = 0
            } else if (this.y < this.maxScrollY) {
                y = this.maxScrollY
            }
            if (y == this.y) {
                return false
            }
            this.scrollTo(x, y, time, this.options.bounceEasing);
            return true
        },
        scrollTo: function(x, y, time, easing) {
            if (this.options.adjustXY) {
                y = this.options.adjustXY.call(this, x, y).y
            }
            if (this.options.checkSelected) {
                y = this.options.checkSelected.call(this, x, y).y
            }
            easing = easing || utils.ease.circular;
            if (time != undefined || easing.style) {
                /*if(y <= 0){
                    this._perform(y);
                    this._silieScroll();
                }*/
                this._transitionTimingFunction(easing.style);
                this._transitionTime(time);
                this._translate(x, y)
            }
        },
        disable: function() {
            this.enabled = false
        },
        enable: function() {
            this.enabled = true
        },
        on: function(type, fn) {
            if (!this._events[type]) {
                this._events[type] = []
            }
            this._events[type].push(fn)
        },
        _execEvent: function(type) {
            if (!this._events[type]) {
                return
            }
            var i = 0,
                l = this._events[type].length;
            if (!l) {
                return
            }
            for (; i < l; i++) {
                this._events[type][i].call(this)
            }
        },
        destroy: function() {
            this._initEvents(true);
            this._execEvent('destroy');
            this.indicator && this.indicator.destroy();
            console.log('destroy')
        },
        _transitionEnd: function(e) {
            if (e.target != this.scroller || !this.isInTransition) {
                return
            }
            this._transitionTime();
            if (!this.resetPosition(this.options.bounceTime)) {
                this.isInTransition = false;
                this._execEvent('scrollEnd')
            }
        },
        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'mouseup':
                case 'touchcancel':
                case 'mousecancel':
                    this._end(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this._resize();
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    this._transitionEnd(e);
                    break;
                case 'click':
                    if (!e._constructed) {
                        e.preventDefault();
                        e.stopPropagation()
                    }
                    break
            }
        },
        _perform: function(y) {
            this.wrapper.setAttribute('transZ', y);
            var wrapperChild = this.wrapper.querySelector('.ul-list');
            if (wrapperChild) {
                var getFill = wrapperChild.querySelectorAll('.fill-height').length / 2,
                    getAllChild = wrapperChild.childNodes,
                    getHeight = getAllChild[0].offsetHeight,
                    maxY = this.maxScrollY,
                    getLiNum;
                for (var i = 0; i < getAllChild.length; i++) {
                    var getClassName = getAllChild[i].className;
                    getAllChild[i].className = getClassName.replace('active', "")
                }
                if (y >= 0) {
                    getLiNum = getFill
                } else if (maxY >= y) {
                    var getScrollHeight = Math.abs(this.wrapperHeight - this.scrollerHeight);
                    getLiNum = Math.round(getScrollHeight / getHeight) + getFill
                } else {
                    var getScrollHeight = Math.abs(y);
                    getLiNum = Math.round(getScrollHeight / getHeight) + getFill
                }
                getAllChild[getLiNum].setAttribute("class", getAllChild[getLiNum].className + ' active')
            }
        },
        _scrollMove: function() {
            var y = this.y,
                maxY = this.maxScrollY - y;
            var setTop = this.scroller.querySelector('.scroll-roller-top');
            var dataDpr = parseInt($('html').attr('data-dpr')) || 1;
            var height =  dataDpr*16*3;
            if (setTop && setTop.innerHTML) {
                if(parseInt(y/(10*dataDpr))>this.mark){
                    this.mark = parseInt(y/(10*dataDpr));
                    $('#circleLoading').circleProgress('value', y/height);
                }
                // if (y > this.hintChangeThreshold ) {
                //     setTop.innerHTML = '释放开始刷新'
                // } else {
                //     setTop.innerHTML = '下拉刷新'
                // }

            };
            var setDown = this.scroller.querySelector('.scroll-roller-down');
            // if (setDown && setDown.innerHTML) {
            //     if (maxY >= this.hintChangeThreshold ) {
            //         setDown.innerHTML = '释放开始加载'
            //     } else {
            //         setDown.innerHTML = '上拉加载'
            //     }
            // }
        }
    };

    function createDefaultScrollbar() {
        var scrollbar = document.createElement('div'),
            indicator = document.createElement('div');
        scrollbar.style.cssText = 'position:absolute;z-index:9999';
        scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
        scrollbar.style.cssText += ';overflow:hidden';
        indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
        indicator.style.width = '100%';
        scrollbar.appendChild(indicator);
        return scrollbar
    }
    function Indicator(scroller, opts) {
        this.wrapper = typeof opts.el == 'string' ? document.querySelector(opts.el) : opts.el;
        this.indicator = this.wrapper.children[0];
        this.wrapperStyle = this.wrapper.style;
        this.indicatorStyle = this.indicator.style;
        this.scroller = scroller;
        this.sizeRatioY = 1;
        this.maxPosY = 0;
        this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
        this.wrapperStyle[utils.style.transitionDuration] = '0ms'
    }
    Indicator.prototype = {
        transitionTime: function(time) {
            time = time || 0;
            this.indicatorStyle[utils.style.transitionDuration] = time + 'ms'
        },
        transitionTimingFunction: function(easing) {
            this.indicatorStyle[utils.style.transitionTimingFunction] = easing
        },
        refresh: function() {
            this.transitionTime();
            var r = this.wrapper.offsetHeight;
            this.wrapperHeight = this.wrapper.clientHeight;
            this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
            this.indicatorStyle.height = this.indicatorHeight + 'px';
            this.maxPosY = this.wrapperHeight - this.indicatorHeight;
            this.sizeRatioY = (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
            this.updatePosition()
        },
        destroy: function() {
            this.wrapper.remove()
        },
        updatePosition: function() {
            var y = Math.round(this.sizeRatioY * this.scroller.y) || 0;
            this.y = y;
            this.indicatorStyle[utils.style.transform] = 'translate(0px,' + y + 'px)' + this.scroller.translateZ
        },
        fade: function(val, hold) {
            if (hold && !this.visible) {
                return
            }
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
            var time = val ? 250 : 500,
                delay = val ? 0 : 300;
            val = val ? '1' : '0';
            this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';
            this.fadeTimeout = setTimeout($.proxy(function(val) {
                this.wrapperStyle.opacity = val;
                this.visible = +val
            }, this), delay)
        }
    };
    IScroll.utils = utils;
    if (typeof module != 'undefined' && module.exports) {
        module.exports = IScroll
    } else {
        window.IScroll = IScroll
    }
})(window, document, Math);