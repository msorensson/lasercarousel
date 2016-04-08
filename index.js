'use strict';
/* global window */
var $ = require('jquery');
var $window = $(window);
var debounce = require('lodash/debounce');

function LaserCarousel(el, opts) {
    var self = this;

    self.$el = $(el);
    self.opts = opts;
    self.currentItemIdx = self.opts.initialSlide;

    self.$items = $('.carousel__item', self.$el);
    self.itemCount = self.$items.length;

    self.currentX = 0;
    self.trackWidth = 0;
    self.dragging = false;
    self.settings = {};

    self.initialised = false;

    self.initialize();
}

LaserCarousel.prototype = {
    swipe: require('./swipe'),

    applyTrackTransition: function() {
        var self = this;

        self.$carouselTrack.css({
            'transition-property': 'transform',
            'transition-duration': self.settings.speed + 'ms'
        });
    },

    panToCurrent: function() {
        var self = this,
            idx = self.currentItemIdx + 1;

        self.currentX = -(idx + self.settings.currentItemSpacing) * self.settings.itemWidth + (self.settings.itemWidth / 2);

        self.$carouselTrack.css({
            transform: 'translate3d(' + self.currentX + 'px, 0 ,0)'
        });
    },

    addTrack: function() {
        var self = this;
        $('.carousel__item', self.$el).wrapAll('<div class="carousel__track" />');
        self.$carouselTrack = $('.carousel__track', self.$el);
    },

    setTrackWidth: function() {
        var self = this;
        self.trackWidth = self.settings.itemWidth * (self.itemCount + (self.settings.currentItemSpacing * 2));
        self.$carouselTrack.width(self.trackWidth);
    },

    addDots: function() {
        var self = this,
            html = '';

        self.$carouselNavigation = $('<ul class="carousel__navigation" />');

        for (var i = 0; i < self.itemCount; i++) {
            html += '<li class="carousel__navigation-item"><a href="#" class="carousel__navigation-button">' + i + 1 + '</a></li>\n';
        }

        self.$carouselNavigation.html(html);

        self.$el.append(self.$carouselNavigation);
    },

    setCurrent: function(idx) {
        var self = this;

        if (self.$currentItem) {
            self.$currentItem.removeClass('carousel__item--current');
        }

        self.$currentItem = $('.carousel__item', self.$el).eq(idx);

        if (self.$currentItem) {
            self.currentItemIdx = idx;
            self.$currentItem.addClass('carousel__item--current');
        }

        if (self.$carouselNavigation) {
            $('.carousel__navigation-item--current', self.$carouselNavigation)
                .removeClass('carousel__navigation-item--current');

            $('.carousel__navigation-item', self.$carouselNavigation)
                .eq(idx)
                .addClass('carousel__navigation-item--current');
        }
    },

    positionItems: function() {
        var self = this;
        var idx = 0;

        self.$items.each(function() {
            var $this = $(this);
            var isCurrent = false;

            if (self.$currentItem && $this[0] === self.$currentItem[0]) {
                isCurrent = true;
                idx = idx + self.settings.currentItemSpacing;
            }

            $this.css({
                transform: 'translate3d(' + idx * 100 + '%, -50%, 0)'
            });

            if (isCurrent) {
                idx = idx + self.settings.currentItemSpacing;
            }

            idx++;
        });
    },

    goto: function(idx) {
        var self = this;
        self.setCurrent(idx);
        self.positionItems();
        self.panToCurrent();
    },

    next: function() {
        var self = this;

        if (self.currentItemIdx + 1 <= self.itemCount - 1 ) {
            self.goto(self.currentItemIdx + 1);
        } else {
            self.goto(self.currentItemIdx);
        }
    },

    previous: function() {
        var self = this;

        if (self.currentItemIdx - 1 >= 0) {
            self.goto(self.currentItemIdx - 1);
        } else {
            self.goto(self.currentItemIdx);
        }
    },

    attachNavigationHandler: function() {
        var self = this;
        var selector = '.carousel__navigation-item';

        if (self.opts.itemNavigation) {
            selector += ', .carousel__item';
        }

        $(selector, self.$el).on('click', function(e) {
            var idx = $(e.currentTarget).index();

            if (!self.dragging) {
                self.goto(idx);
            }

            e.preventDefault();
        });
    },

    settingsFromBreakpoint: function(breakpoint) {
        var self = this;

        self.settings.itemWidth = breakpoint.itemWidth || self.opts.itemWidth;
        self.settings.initialSlide = breakpoint.initialSlide || self.opts.initialSlide;
        self.settings.currentItemSpacing = breakpoint.currentItemSpacing || self.opts.currentItemSpacing;
        self.settings.speed = breakpoint.speed || self.opts.speed;
    },

    settingsByScreenSize: function() {
        var self = this,
            wWidth = $window.width(),
            breakpointToUse = false;

        // Reset to defaults.
        self.settings.itemWidth = self.opts.itemWidth;
        self.settings.initialSlide = self.opts.initialSlide;
        self.settings.currentItemSpacing = self.opts.currentItemSpacing;
        self.settings.speed = self.opts.speed;

        if (self.opts.responsive) {
            for (var key in self.opts.responsive) {
                if (wWidth > key) {
                    breakpointToUse = key;
                }
            }
        }

        if (breakpointToUse) {
            self.settingsFromBreakpoint(self.opts.responsive[breakpointToUse]);
        }
    },

    start: function() {
        var self = this;

        self.settingsByScreenSize();
        self.setTrackWidth();
        self.setCurrent(self.currentItemIdx);
        self.positionItems();

        self.panToCurrent();
        self.applyTrackTransition();
    },

    initialize: function() {
        var self = this;

        self.addTrack();

        $window.on('resize', debounce($.proxy(self.start, self), 300));

        if (self.opts.dots) {
            self.addDots();
        }

        if (self.opts.touch) {
            self.swipe();
        }

        self.start();

        self.attachNavigationHandler();
    }
};

$.fn.laserCarousel = function(options) {
    var opts = $.extend({}, $.fn.laserCarousel.defaults, options);

    return this.each(function() {
        var laserCarousel = new LaserCarousel(this, opts);
    });
};

$.fn.laserCarousel.defaults = {
    itemWidth: 130,
    initialSlide: 0,
    itemNavigation: true,
    currentItemSpacing: 1,
    touch: true,
    speed: 300,
    dots: true
};
