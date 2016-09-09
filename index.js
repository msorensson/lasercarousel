'use strict';
/* global window */
require('classlist-polyfill');
var debounce = require('lodash/debounce');
var assign = require('lodash/assign');

function LaserCarousel(el, opts) {
    var self = this;

    self.el = el.children[0];

    self.opts = {
        itemWidth: '100px',
        namespace: '',
        initialSlide: 0,
        itemNavigation: true,
        currentItemSpacing: 1,
        touch: true,
        speed: 300,
        dots: true,
        arrows: true,
        asForDots: false,
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
            items = self.el.getElementsByClassName(self.opts.namespace + 'carousel__item'),
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
            itemWidth = self.items[0] && self.items[0].el.offsetWidth || 0;

        self.currentX = -idx * itemWidth;
        self.track.style.transform = 'translate3d(' + self.currentX + 'px, 0 ,0)';
    },

    addTrack: function() {
        var self = this,
            i,
            items = self.items;

        self.track = document.createElement('div');
        self.track.classList.add(self.opts.namespace + 'carousel__track');
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
        self.carouselNavigation.classList.add(self.opts.namespace + 'carousel__navigation');
        self.el.appendChild(self.carouselNavigation);

        for (var i = 0; i < self.items.length; i++) {
            html += '<li class="' + self.opts.namespace + 'carousel__navigation-item"><a role="button" href="#" class="' + self.opts.namespace + 'carousel__navigation-button">' + (i + 1) + '</a></li>\n';
        }

        self.carouselNavigation.innerHTML = html;
    },

    addArrows: function() {
        var self = this,
            html = '';

        self.arrowLeft = document.createElement('button');
        self.arrowRight = document.createElement('button');

        self.arrowLeft.classList.add(self.opts.namespace + 'carousel__arrow');
        self.arrowLeft.classList.add(self.opts.namespace + 'carousel__arrow--left');

        self.arrowRight.classList.add(self.opts.namespace + 'carousel__arrow');
        self.arrowRight.classList.add(self.opts.namespace + 'carousel__arrow--right');

        self.el.appendChild(self.arrowLeft);
        self.el.appendChild(self.arrowRight);

        self.arrowLeft.addEventListener('click', self.previous.bind(this));
        self.arrowRight.addEventListener('click', self.next.bind(this));
    },

    setCurrent: function(idx) {
        var self = this,
            items,
            current;

        if (self.currentItem) {
            self.currentItem.classList.remove(self.opts.namespace + 'carousel__item--current');
        }

        self.currentItem = self.items[idx] && self.items[idx].el;

        if (!self.items[idx]) {
            return;
        }

        if (self.currentItem) {
            self.currentItemIdx = idx;
            self.currentItem.classList.add(self.opts.namespace + 'carousel__item--current');
        }

        if (self.carouselNavigation) {
            current = self.carouselNavigation.getElementsByClassName(self.opts.namespace + 'carousel__navigation-item--current')[0];

            if (current) {
                current.classList.remove(self.opts.namespace + 'carousel__navigation-item--current');
            }

            items = self.carouselNavigation.getElementsByClassName(self.opts.namespace + 'carousel__navigation-item');

            if (items[idx]) {
                items[idx].classList.add(self.opts.namespace + 'carousel__navigation-item--current');
            }
        }

        if (idx !== 0 || idx !== self.items.length - 1) {
            self.el.parentNode.classList.remove('carousel--at-end');
            self.el.parentNode.classList.remove('carousel--at-start');
        }

        if (idx === 0) {
            self.el.parentNode.classList.remove('carousel--at-end');
            self.el.parentNode.classList.add('carousel--at-start');
        }

        if (idx === self.items.length - 1) {
            self.el.parentNode.classList.remove('carousel--at-start');
            self.el.parentNode.classList.add('carousel--at-end');
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
        var items = (self.opts.asForDots) ? self.opts.asForDots : self.el.getElementsByClassName(self.opts.namespace + 'carousel__navigation-item');

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

            if (self.opts.itemNavigation) {
                attachClickHandler(self.items[i].el, i);
            }
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

        if (self.opts.dots && !self.opts.asForDots) {
            self.addDots();
        }

        if (self.opts.arrows) {
            self.addArrows();
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
