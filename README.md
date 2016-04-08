Lasercarousel
=============

A simple carousel that uses css transforms for horizontal transitions.

Install
----------
Include it in your build as usual. Initiate like this:

$('.my-carousel').laserCarousel(properties);

Properties
----------
**itemWidth:** Width of each item in pixels. Defaults to 130.
**initialSlide:** Which slide to center when the carousel is first loaded. Defaults to 0.
**itemNavigation:** Navigation by clicking on an item. Defaults to true.
**currentItemSpacing:** Spacing on each side of the currently centered slide. Defaults to 1 which means that extra space of itemWidth is added on both sides of the currently centered slide.
**touch:** Navigation by swiping. Defaults to true.
**speed:** Speed of transition in milliseconds. Defaults to 300ms.
**dots:** Add dots under the carousel. Defaults to true.
**responsive:** An object containing mobile first definitions of property override for different screen sizes. Properties that can be overridden are itemWidth, initialSlide, currentItemSpacing and speed.
