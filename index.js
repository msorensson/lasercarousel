'use strict';
/* global window */
var debounce = require('lodash/debounce');
var assign = require('lodash/assign');

function LaserCarousel(el, opts) {
    var self = this;

    self.el = el.children[0];

    self.opts = {
        itemWidth: '100px',
        initialSlide: 0,
        itemNavigation: true,
        currentItemSpacing: 1,
        touch: true,
        speed: 300,
        dots: true
    };

    assign(self.opts, opts);

    self.currentItemIdx = self.opts.initialSlide;

    self.items = [];
    self.storeItems();
    self.itemCount = self.items.length;

    self.currentX = 0;
    self.trackWidth = 0;
    self.dragging = false;

    self.settings = {};
    self.initialised = false;

    self.initialize();
}

LaserCarousel.prototype = {
    swipe: require('./swipe'),

    storeItems: function() {
        var self = this,
            items = self.el.getElementsByClassName('lasercarousel__item'),
            i = items.length - 1;

        for (i; i >= 0; i--) {
            self.items[i] = {};
            self.items[i].el = items[i].cloneNode(true);
            self.el.removeChild(items[i]);
        }
    },

    applyTrackTransition: function() {
        var self = this;
        self.track.style.transitionProperty = 'transform';
        self.track.style.transitionDuration = self.opts.speed + 'ms';
    },

    panToCurrent: function() {
        var self = this,
            idx = self.currentItemIdx,
            itemWidth = self.el.offsetWidth;

        self.currentX = -idx * itemWidth;
        self.track.style.transform = 'translate3d(' + self.currentX + 'px, 0 ,0)';
    },

    addTrack: function() {
        var self = this,
            i,
            items = self.items;

        self.track = document.createElement('div');
        self.track.classList.add('lasercarousel__track');
        self.el.insertBefore(self.track, self.el.firstChild);

        for (i = 0; i < self.items.length; i++) {
            self.track.appendChild(self.items[i].el);
        }
    },

    setTrackWidth: function() {
        var self = this;
        var itemWidth = self.el.offsetWidth;
        itemWidth = parseInt(itemWidth);

        self.trackWidth = itemWidth * self.items.length;
        self.track.style.width = self.trackWidth + 'px';
    },

    addDots: function() {
        var self = this,
            html = '';

        self.carouselNavigation = document.createElement('ul');
        self.carouselNavigation.classList.add('lasercarousel__navigation');
        self.el.appendChild(self.carouselNavigation);

        for (var i = 0; i < self.items.length; i++) {
            html += '<li class="lasercarousel__navigation-item"><a role="button" href="#" class="lasercarousel__navigation-button">' + (i + 1) + '</a></li>\n';
        }

        self.carouselNavigation.innerHTML = html;
    },

    setCurrent: function(idx) {
        var self = this,
            items,
            current;

        if (self.currentItem) {
            self.currentItem.classList.remove('carousel__item--current');
        }

        self.currentItem = self.items[idx].el;

        if (self.currentItem) {
            self.currentItemIdx = idx;
            self.currentItem.classList.add('carousel__item--current');
        }

        if (self.carouselNavigation) {
            current = self.carouselNavigation.getElementsByClassName('lasercarousel__navigation-item--current')[0];

            if (current) {
                current.classList.remove('lasercarousel__navigation-item--current');
            }

            items = self.carouselNavigation.getElementsByClassName('lasercarousel__navigation-item');

            if (items[idx]) {
                items[idx].classList.add('lasercarousel__navigation-item--current');
            }
        }
    },

    positionItems: function() {
        var self = this;
        var idx = 0;
        var current;
        var isCurrent = false;

        for (var i = 0; i < self.items.length; i++) {
            current = self.items[i].el;
            isCurrent = false;

            if (self.currentItem && current === self.currentItem) {
                isCurrent = true;
                idx = idx + self.opts.currentItemSpacing;
            }

            current.style.width = self.el.offsetWidth + 'px';
            current.style.transform = 'translate3d(' + (i * 100) + '%, 0%, 0)';
            current.style.display = 'block';
        }
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
        var items = self.el.getElementsByClassName('lasercarousel__navigation-item');

        var attachClickHandler = function(el, idx) {
            el.addEventListener('click', function(e) {
                if (!self.dragging) {
                    self.goto(idx);
                }

                e.preventDefault();
            });
        };

        for (var i = 0; i < items.length; i++) {
            attachClickHandler(items[i], i);
        }
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
            wWidth = window.offsetWidth,
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

        self.setTrackWidth();
        self.setCurrent(self.currentItemIdx);
        self.positionItems();

        self.panToCurrent();
        self.applyTrackTransition();
    },

    initialize: function() {
        var self = this;

        self.addTrack();

        window.addEventListener('resize', debounce(self.start.bind(self), 300));

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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = LaserCarousel;
} else {
    window.LaserCarousel = LaserCarousel;
}
