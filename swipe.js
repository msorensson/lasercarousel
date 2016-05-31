'use strict';
module.exports = function() {
    var self = this,
        pressed = false,
        lastY = 0,
        startX = 0,
        lastX = 0,
        threshold = 4;

    function tap(e) {
        pressed = true;
        startX = self.currentX;
        lastX = getPositionX(e),
        lastY = getPositionY(e);

        self.track.style.transitionProperty = 'none';
    }

    function drag(e) {
        var x,
            y,
            deltaX,
            deltaY;

        if (pressed) {
            self.dragging = true;
            x = getPositionX(e);
            y = getPositionY(e);
            deltaX = lastX - x;
            deltaY = lastY - y;

            if (deltaX > threshold || deltaX < -threshold) {
                lastX = x;
                scroll(-deltaX);
                e.preventDefault();
            }
        }
    }

    function release(e) {
        var direction = getDirection(startX, self.currentX),
            distance = getDistance(startX, self.currentX);

        if (!pressed) {
            return;
        }

        pressed = false;
        setTimeout(function() {
            self.dragging = false;
        }, 300);

        self.applyTrackTransition();

        if (distance > self.el.offsetWidth / 2) {
            if (direction === 'right') {
                self.next();
            } else {
                self.previous();
            }
        } else {
            self.goto(self.currentItemIdx);
        }
    }

    function getDistance(start, current) {
        return Math.abs(start - current);
    }

    function getDirection(start, current) {
        return (Math.abs(start) - Math.abs(current) > 0) ? 'left' : 'right';
    }

    function getPositionX(e) {
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientX;
        }

        return e.clientX;
    }

    function getPositionY(e) {
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientY;
        }

        return e.clientY;
    }

    function scroll(delta) {
        self.currentX = self.currentX + delta;

        self.track.style.transform = 'translate3d(' + self.currentX + 'px, 0, 0)';
    }

    self.el.addEventListener('mousedown', tap);
    self.el.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', release);

    self.el.addEventListener('touchstart', tap);
    self.el.addEventListener('touchmove', drag);
    document.addEventListener('touchend', release);
};
