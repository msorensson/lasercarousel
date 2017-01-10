'use strict';
function preventClickEventOnRelease(e) {
    e.preventDefault();
}

module.exports = function() {
    var self = this,
        pressed = false,
        lastY = 0,
        startX = 0,
        lastX = 0,
        threshold = 4,
        timer = 0,
        intval,
        snappyTime = 140;

    function loop() {
        if (pressed) {
            requestAnimationFrame(loop);
        }

        self.track.style.transform = 'translate3d(' + self.currentX + 'px, 0, 0)';
    }

    function tap(e) {
        pressed = true;
        startX = self.currentX;
        lastX = getPositionX(e),
        lastY = getPositionY(e);

        timer = 0;
        intval = setInterval(function() {
            timer = timer + 20;
        }, 20);

        requestAnimationFrame(loop);
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
            distance = getDistance(startX, self.currentX),
            itemWidth = self.items[0] && self.items[0].el.offsetWidth || 0,
            itemsToGo = 1;

        var targetItemIdx = self.currentItemIdx;

        self.el.removeEventListener('click', preventClickEventOnRelease);

        if (Math.abs(startX - self.currentX) > 30) {
            self.el.addEventListener('click', preventClickEventOnRelease);
        }

        if (!pressed) {
            return;
        }

        itemsToGo = Math.round(distance / itemWidth);

        if (timer < snappyTime) {
            if (direction === 'right') {
                targetItemIdx++;
            } else {
                targetItemIdx--;
            }
        } else {
            if (direction === 'right') {
                targetItemIdx = targetItemIdx + itemsToGo;
            } else {
                targetItemIdx = targetItemIdx - itemsToGo;
            }
        }

        self.goto(targetItemIdx);

        setTimeout(function() {
            self.dragging = false;
        }, 300);

        self.applyTrackTransition();
        pressed = false;

        clearInterval(intval);
    }

    function getDistance(start, current) {
        return Math.abs(start - current);
    }

    function getDirection(start, current) {
        return (start < current) ? 'left' : 'right';
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

        if (self.currentX > self.el.offsetWidth / 3) {
            self.currentX = self.el.offsetWidth / 3;
        } else if (self.currentX < -Math.abs(self.trackWidth)) {
            self.currentX = -Math.abs(self.trackWidth);
        }
    }

    self.track.addEventListener('mousedown', tap);
    self.track.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', release);

    self.track.addEventListener('touchstart', tap);
    self.track.addEventListener('touchmove', drag);
    document.addEventListener('touchend', release);
};
