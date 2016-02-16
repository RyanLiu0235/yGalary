/**
 * yGalary
 * liucheng
 */

;
(function($) {
    $.fn.yGalary = function(opts) {
        return new Ygalary(this, opts);
    }

    var Ygalary = function(galary, opts) {
        var param = Ygalary.param;
        param.$galary = $(galary),
            param.$galaryContainer = param.$galary.find('.galary_container'),
            param.$picItem = param.$galaryContainer.find('.item'),
            param.w = $(window).width(),
            param.curIndex = param.startIndex,
            param.pageWidth = param.w * 220 / 750,
            param.pageOuterWidth = param.pageWidth + param.w * 45 / 750,
            param.pageLength = param.$picItem.length;

        this.init();
    }


    Ygalary.prototype.init = function() {
        this.styleInit();

        var param = Ygalary.param,
            $this = this,
            $galary = param.$galary;

        $galary.on('touchstart', $this.start).on('touchmove', $this.move).on('touchend touchcancel', $this.end);
    }


    /**
     * 初始化样式
     */
    Ygalary.prototype.styleInit = function() {
        var param = Ygalary.param,
            $galaryContainer = param.$galaryContainer,
            $picItem = param.$picItem,
            startIndex = param.startIndex,
            pageLength = param.pageLength,
            pageOuterWidth = param.pageOuterWidth,
            pageWidth = param.pageWidth;

        $picItem.width(pageWidth);
        for (var i = pageLength - 1; i >= 0; i--) {
            $picItem.eq(i).css('left', i * pageOuterWidth);
        }
        $galaryContainer.width(pageLength * pageOuterWidth).css({
            '-webkit-transform': 'translate3d(' + (1 - startIndex) * pageOuterWidth + 'px, 0, 0)',
            'transform': 'translate3d(' + (1 - startIndex) * pageOuterWidth + 'px, 0, 0)'
        });

        // 中间的page放大显示
        $picItem.eq(startIndex).css({
            '-webkit-transform': 'perspective(200px) translate3d(0, 50px, 80px)',
            'transform': 'perspective(200px) translate3d(0, 50px, 80px)'

        })
    }

    /**
     * 参数
     */
    Ygalary.param = {
        $galary: null,
        $galaryContainer: null,
        $picItem: null,
        w: undefined,
        pageWidth: undefined,
        pageOuterWidth: undefined,
        pageLength: undefined,
        isAnimating: false, // 是否正在滑动
        startIndex: 2, // 每一次滑动时候的起始index，并非第一次滑动时候的
        startPos: undefined,
        curPos: undefined,
        curIndex: undefined, // 当前放大页的index
        pageOuterWidth: undefined,
        isForward: null, // 是否前滑
        isEdge: false, // 是否滑到了边界
        extraMove: 0, // 滑动距离除以每页的宽度之后剩余的滑动距离
        level: 0
    }

    /**
     * touch事件触发方法
     */
    Ygalary.prototype.start = function(e) {
        e.stopPropagation();
        if (Ygalary.param.isAnimating || Ygalary.param.isEdge) return;

        var param = Ygalary.param;
        var touch = window.Zepto ? e.changedTouches[0] : e.originalEvent.touches[0];
        param.startPos = param.curPos = touch.pageX;
    }

    Ygalary.prototype.move = function(e) {
        e.preventDefault();
        if (Ygalary.param.isAnimating || Ygalary.param.isEdge) return;

        var param = Ygalary.param,
            startPos = param.startPos,
            $galaryContainer = param.$galaryContainer;
        var touch = window.Zepto ? e.changedTouches[0] : e.originalEvent.touches[0];
        param.isForward = touch.pageX > param.curPos;
        param.curPos = touch.pageX;

        var distance = param.curPos - startPos;
        slide(distance);
    }

    Ygalary.prototype.end = function(e) {
        var param = Ygalary.param,
            $galaryContainer = param.$galaryContainer,
            $picItem = param.$picItem,
            startPos = param.startPos,
            curPos = param.curPos,
            pageWidth = param.pageWidth,
            pageOuterWidth = param.pageOuterWidth,
            pageLength = param.pageLength,
            curPos = param.curPos,
            startPos = param.startPos,
            extraMove = param.extraMove,
            isForward = param.isForward,
            curIndex = param.curIndex;

        var finalMove = extraMove <= 30 ? pageOuterWidth * (param.curIndex - 1) : (isForward ? pageOuterWidth * (--param.curIndex - 1) : pageOuterWidth * (++param.curIndex - 1));

        $galaryContainer.addClass('transition').css({
            '-webkit-transform': 'translate3d(' + (-finalMove) + 'px, 0, 0)',
            'transform': 'translate3d(' + (-finalMove) + 'px, 0, 0)'
        });
        $picItem.addClass('transition');
        picMove(-finalMove, param);


        $galaryContainer.one(transitionEnd, function() {
            $galaryContainer.removeClass('transition');
            $picItem.removeClass('transition');

            // 数据置零
            param.startIndex = param.curIndex;
            param.startPos = param.curPos = param.level = param.extraMove = 0;
            param.isAnimating = param.isEdge = false;
        }).emulateTransitionEnd(250); // 手动触发transitionend事件
    }


    /**
     * 滑动函数
     * @param  distance  滑动距离
     */
    function slide(distance) {
        var param = Ygalary.param,
            $galaryContainer = param.$galaryContainer,
            $picItem = param.$picItem,
            pageWidth = param.pageWidth,
            pageOuterWidth = param.pageOuterWidth,
            pageLength = param.pageLength,
            startIndex = param.startIndex,
            curIndex = param.curIndex;

        var _level = ~~(distance / pageOuterWidth);
        param.extraMove = Math.abs(distance % pageOuterWidth);
        if (param.level === _level) {
            param.curIndex = curIndex;
        } else {
            param.curIndex = param.level > _level ? curIndex + 1 : curIndex - 1;
        }

        // 第一页无法往左滑动，最后一页无法往右滑动
        if ((param.curIndex === 0 && param.isForward) || (param.curIndex === pageLength - 1 && !param.isForward)) {
            return param.isEdge = true;
        } else {
            param.isEdge = false;
            $galaryContainer.css({
                '-webkit-transform': 'translate3d(' + ((1 - startIndex) * pageOuterWidth + distance) + 'px, 0, 0)',
                'transform': 'translate3d(' + ((1 - startIndex) * pageOuterWidth + distance) + 'px, 0, 0)'
            });

            var containerOffset = (1 - startIndex) * pageOuterWidth + distance;
            picMove(containerOffset, param);

            param.level = _level;
        }
    }

    /**
     * 每一页的移动轨迹方程
     * containerOffset 为当前container的偏移距离
     */
    function picMove(containerOffset, param) {
        var $picItem = param.$picItem,
            pageWidth = param.pageWidth,
            pageOuterWidth = param.pageOuterWidth,
            w = param.w,
            pageLength = param.pageLength;


        var itemOffset = {};
        for (var i = pageLength - 1; i >= 0; i--) {
            itemOffset[i] = pageOuterWidth * i + containerOffset;

            if (itemOffset[i] <= (w - pageWidth) && itemOffset[i] >= 0) {
                var percentage = 2 * itemOffset[i] / (w - pageWidth);
                $picItem.eq(i).css({
                    '-webkit-transform': 'perspective(200px) translate3d(0, ' + 50 * (itemOffset[i] > pageOuterWidth ? (2 - percentage) : percentage) + 'px, ' + 80 * (itemOffset[i] > pageOuterWidth ? (2 - percentage) : percentage) + 'px)',
                    'transform': 'perspective(200px) translate3d(0, ' + 50 * (itemOffset[i] > pageOuterWidth ? (2 - percentage) : percentage) + 'px, ' + 80 * (itemOffset[i] > pageOuterWidth ? (2 - percentage) : percentage) + 'px)'
                });
            }
        }
    }


    /**
     * transitionend事件兼容方法
     */
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el = this;

        $(this).one('webkitTransitionEnd', function() {
            called = true;
        });
        var callback = function() {
            if (!called) $($el).trigger('webkitTransitionEnd');
        };
        setTimeout(callback, duration);
    };

    var transitionEnd = (function() {
        var doc = window.document;
        var element = doc.body || doc.documentElement;
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (element.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }
    })();


})(window.Zepto || window.jQuery)
