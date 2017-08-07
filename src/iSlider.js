/* iSlider v1.3.0 ~ (c) 2015-2099 Tony Lee (李 凯) ~ http://tonylee.pw */

;(function (window, undefined){
    var document = window.document;
    var oPlainDiv = document.createElement('div');
    var kits, engines;
    var ENVS = {}, THRESHOLD = {};
    var BROWSER_VENDORS = ['webkit', 'moz', 'ms', 'o'];
    var currentDirection;
    /**
     * get current time
     * @type {*|Function}
     */
    Date.now = Date.now || function () { return new Date().getTime() };

    /**
     * extend the curve fn
     * @type {{Quad, Quart}}
     */
    window.Math.tween = (function () {
        return {
            Quad: {
                easeIn: {
                    bezier: 'cubic-bezier(0.79, 0.02, 1, 1.02)',
                    fn: function(t, b, c, d) {
                        return c * (t /= d) * t + b;
                    }
                },
                easeOut: {
                    bezier: 'cubic-bezier(0, 0, 0.3, 0.97)',
                    fn: function(t, b, c, d) {
                        return -c *(t /= d)*(t-2) + b;
                    }
                }
            },
            Quart: {
                easeIn: {
                    bezier: 'cubic-bezier(1, 0.03, 1, 1)',
                    fn: function(t, b, c, d) {
                        return c * (t /= d) * t * t*t + b;
                    }
                },
                easeOut: {
                    bezier: 'cubic-bezier(0, 0, 0, 1)',
                    fn: function(t, b, c, d) {
                        return -c * ((t = t/d - 1) * t * t*t - 1) + b;
                    }
                }
            }
        }
    })();

    /**
     * key thresholds.
     * @type {{hz: number, fingerFreeTime: number, fingerTicSpace: number, coefficient: number, boundaryMire: number, amendTime: number}}
     */
    THRESHOLD = {
        hz            : 1000 / 60,
        fingerFreeTime: 300,
        fingerTicSpace: 10,
        coefficient   : 0.0006,
        boundaryMire  : 3,
        amendTime     : 400
    };

    /**
     * engine of every frame.
     * @type {{FPS: (*|Function)}}
     */
    engines = {
        FPS: window.requestAnimationFrame       ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame	||
             window.oRequestAnimationFrame		||
             window.msRequestAnimationFrame		||
            function (callback) {
                window.setTimeout(callback, THRESHOLD.hz);
            }
    };

    /**
     * useful fn
     * @type {{detectCssSupport: Function, setCompatibleProperty: Function, getStyle: Function, getTranslate: Function, extend: Function, addEve: Function, removeEve: Function, getElement: Function}}
     */
    kits = {
        /**
         * detect whether the css property is supported by known browser vendors,
         * such as 'transform' isn't well supported by android phone 'Meizu'.
         * @param {string} prop Property which gonna be tested.(no prefix)
         * @returns {boolean}
         */
        detectCssSupport: function (prop) {
            var isSupport    = false,
                i            = 0,
                vendorsNum   = BROWSER_VENDORS.length,
                decorateProp = null;

            prop && (prop = prop.toLowerCase());

            if(typeof this.getStyle(oPlainDiv, prop) === 'string'){
                isSupport = true;
            } else {
                for( ; i < vendorsNum; i++){
                    decorateProp = ['-', BROWSER_VENDORS[i], '-', prop].join('');
                    if(typeof this.getStyle(oPlainDiv, decorateProp) === 'string'){
                        isSupport = true;
                        break;
                    }
                }
            }

            return isSupport;
        },
        /**
         * according to the vendors,set the styles of element with a compatible property and value.
         * @param eleStyle {object} reference of the element style
         * @param prop {string} property
         * @param value {string} value
         * @returns {kits} chaining
         */
        setCompatibleProperty: function (eleStyle, prop, value) {
            var value = typeof value === 'string' ? value : value.join(' '),
                i     = 0,
                len   = BROWSER_VENDORS.length;
            for( ; i < len; i++){
                eleStyle.setProperty(['-', BROWSER_VENDORS[i], '-', prop].join(''), value);
            }
            eleStyle.setProperty(prop, value);
        },
        /**
         * get computed style.
         * @param {object} ele Html DOM Element
         * @param {string} prop The css property which will be calculated
         * @returns {string} Css value will be returned.
         */
        getStyle: function (ele, prop) {
           return window.getComputedStyle(ele, null).getPropertyValue(prop);
        },
        /**
         * get computed transform style.
         * @param ele dom element
         * @returns {{x: Number, y: Number}}
         */
        getTranslate: function (ele) {
            var transform = kits.getStyle(ele, 'transform'),
                i         = 0,
                len       = BROWSER_VENDORS.length,
                splits;
            //compatible workaround: some of the android browsers should get the 'webkit' property instead of the normal one.
            if(!transform) {
                for( ; i < len; i++) {
                    var transform = kits.getStyle(ele, ['-', BROWSER_VENDORS[i], '-', 'transform'].join(''));
                    if(transform) {
                        break;
                    }
                }
            }
            //split and get the 'translate'.
            splits = transform.split(', ');
            return {
                x: parseInt(splits[4]),
                y: parseInt(splits[5])
            }
        },
        /**
         * extend object to target object, array isn't expected.
         * @param target {object}
         * @param source {object} this will be extended to target
         * @returns {*}
         */
        extend: function (target, source) {
            if(source && typeof source === 'object') {
                for(var k in source){
                    target[k] = source[k];
                }
            }
            return target;
        },
        /**
         * register event
         * @param ele {object} DOM element
         * @param eve {string} event name
         * @param eveFn {function} event function
         * @param capture {boolean} capture or not
         * @returns {kits} chaining
         */
        addEve: function (ele, eve, eveFn, capture) {
            ele.addEventListener(eve, eveFn, !!capture);
            return this;
        },
        /**
         * remove event
         * @param ele {object} DOM element
         * @param eve {string} event name
         * @param eveFn {function} event function
         * @param capture {boolean} capture or not
         * @returns {kits} chaining
         */
        removeEve: function (ele, eve, eveFn, capture) {
            ele.removeEventListener(eve, eveFn, !!capture);
            return this;
        },
        /**
         * get DOM element
         * @param ele {string|object} string or element
         * @returns {*}
         */
        getElement: function (ele) {
            return typeof ele === 'string' ? document.querySelector(ele) : ele;
        }
    };

    /**
     * whether support the following property.
     * @type {boolean}
     */
    ENVS.supportTouch = 'ontouchstart' in window;
    ENVS.supportCssMove = kits.detectCssSupport('transform') && kits.detectCssSupport('transition');

    function ISlider(ele, settings){
        this.sliding = false;
        this.translating = false;
        this.frameFlag = 0;
        this.oViewport = kits.getElement(ele);
        this.oSlider = this.oViewport.children[0];
        this.sliderStyle = this.oSlider.style;

        /**
         * set settings
         * @type {{direction: string, oppositeSlide: boolean, lockTheOtherDirection: boolean, startX: number, startY: number}}
         */
        this.settings = {
            /**
             * the direction you want to use.
             */
            direction: 'y',
            /**
             * whether to use the default scrolling of the browser in the opposite direction.
             */
            oppositeSlide: false,
            /**
             * whether to lock the other direction.
             * only one direction is available for all of the iSlider components.
             * that means if one direction was locked,other iSlider components won't be scrollable in the opposite direction.
             */
            lockTheOtherDirection: false,
            /**
             * original position to init.
             */
            startX   : 0,
            startY   : 0
        };
        kits.extend(this.settings, settings || {});

        this.goWithTouchStart = this.goWithTouchMove = this.goWithTouchEnd = null;

        this.moveTo(this.settings.startX, this.settings.startY);
        this.direction = this.settings.direction;

        this.init();
    }
    ISlider.prototype = {
        INFO:{
            VERSION: 'v1.3.0',
            AUTHOR : 'http://tonylee.pw'
        },
        contructor: ISlider,
        init: function () {
            if(!ENVS.supportTouch) return;
            //init view port
            this.measureViewport();
            //add event handler
            this.register();
        },
        register: function (cancel) {
            var eveHandler = cancel ? kits.removeEve : kits.addEve;
            eveHandler(this.oViewport, 'touchstart', this);
            eveHandler(window, 'touchmove', this);
            eveHandler(window, 'touchend', this);
            eveHandler(window, 'touchcancel', this);

            eveHandler(this.oSlider, 'webkitTransitionEnd', this);
            eveHandler(this.oSlider, 'oTransitionEnd', this);
            eveHandler(this.oSlider, 'MSTransitionEnd', this);
            eveHandler(this.oSlider, 'transitionend', this);

            eveHandler(window, 'resize', this);
            eveHandler(window, 'orientationchange', this);
        },
        breakInit: function () {
            this.register(true);
        },
        handleEvent: function (eve) {
          switch (eve.type) {
              case 'touchstart':
                  this.touchstart(eve);
                  break;
              case 'touchmove':
                  this.touchmove(eve);
                  break;
              case 'touchend':
              case 'touchcancel':
                  this.touchend(eve);
                  break;
              case 'transitionend':
              case 'webkitTransitionEnd':
              case 'oTransitionEnd':
              case 'MSTransitionEnd':
                  this.transitionend(eve);
                  break;
              case 'resize':
              case 'orientationchange':
                  this.resize(eve);
                  break;
          }
        },
        touchstart: function (eve) {
            this.preventDefault = false;
            this.sliding = true;
            /**
             * stop moving via change translate or changing the frame flag.
             */
            if(ENVS.supportCssMove) {
                //when translating
                if(this.translating) {
                    var translate = kits.getTranslate(this.oSlider);
                    this.translating = false;
                    this.moveTo(translate.x, translate.y);
                }
                //reset transition
                this.setTransition();
            } else {
                this.brake();
            }

            var touch = eve.touches[0],
                now   = Date.now(),
                posX  = touch.pageX,
                posY  = touch.pageY;

            this.latestTime = now;
            this.refX = this.curX;
            this.refY = this.curY;

            this.startX = posX;
            this.startY = posY;

            this.startCurX = this.curX;
            this.startCurY = this.curY;

            this.distX = 0;
            this.distY = 0;

            /**
             * the fn which will be going with the touch start event.
             */
            this.goWithTouchStart && this.goWithTouchStart(this.curX, this.curY);

        },
        touchmove: function (eve) {
            var touch, now, posX, posY,
                destX, destY,
                sliderWidth, sliderHeight,
                absDistX, absDistY,
                distFloor;

            if(this.sliding === false) return;

            touch = eve.touches[0];
            now = Date.now();
            posX = touch.pageX;
            posY = touch.pageY;
            this.distX = posX - this.startX;
            this.distY = posY - this.startY;

            /**
             * when set opposite slide as 'true'
             * then we will judge the first touch move direction and lock the other direction until the next touch start.
             */
            if(this.settings.oppositeSlide && !this.preventDefault) {
                absDistX = Math.abs(this.distX);
                absDistY = Math.abs(this.distY);
                if((absDistX > absDistY && this.direction === 'x') || (absDistX < absDistY && this.direction === 'y')) {
                    this.preventDefault = true;
                }
            }
            /**
             * by default,we gonna prevent default behavior if you mark it open in settings,we'll make it more flexibly.
             */
            if(!this.settings.oppositeSlide || this.preventDefault) {
                eve.preventDefault();
            }

            /**
             * only the distance is long enough,we'll response the moving.
             */
            var isWeeX = Math.abs(this.distX) < THRESHOLD.fingerTicSpace,
                isWeeY = Math.abs(this.distY) < THRESHOLD.fingerTicSpace;
            if(now - this.lastTime > THRESHOLD.fingerFreeTime && isWeeX && isWeeY) return;

            /**
             * whether to lock the other direction.
             */
            if(this.settings.lockTheOtherDirection) {
                /**
                 * record the first direction of the current touch move operation.
                 */
                if(!currentDirection) currentDirection = (!isWeeX && this.direction === 'x') ? 'x' : (!isWeeY && this.direction === 'y') ? 'y' : null;

                /**
                 * if the opposite direction has been locked and isn't consistent with its direction, return.
                 */
                if(currentDirection !== this.direction) return;
            }

            /**
             * calculate the position after moving.
             */
            destX = this.startCurX + this.distX;
            destY = this.startCurY + this.distY;
            if(this.direction === 'x') {
                sliderWidth = kits.getStyle(this.oSlider, 'width');
                distFloor = parseFloat(sliderWidth) - this.portWidth;
                destY = this.curY;
                //if distFloor is less than 0,consider it as 0.
                destX = this.evaluateBoundaryMire(destX, distFloor < 0 ? 0 : distFloor);
            } else {
                sliderHeight = kits.getStyle(this.oSlider, 'height');
                distFloor = parseFloat(sliderHeight) - this.portHeight;
                destX = this.curX;
                destY = this.evaluateBoundaryMire(destY, distFloor < 0 ? 0 : distFloor);
            }
            this.moveTo(destX, destY);

            /**
             * update the valid interval of the moving.
             */
            if(now - this.latestTime > THRESHOLD.fingerFreeTime) {
                this.latestTime = now;
                this.refX = this.curX;
                this.refY = this.curY;
            }

            /**
             * the fn which will be going with the move event.
             */
            this.goWithTouchMove && this.goWithTouchMove(this.curX, this.curY);
        },
        touchend: function (eve) {
            var now, evaluateInfo;

            /**
             * whether a valid touch end event or not.
             */
            if(this.sliding === false) {
                return;
            } else {
                this.sliding = false;
            }
            /**
             * whether to lock the other direction.
             */
            if(this.settings.lockTheOtherDirection) {
                /**
                 * if the opposite direction has been locked and isn't consistent with its direction, return.
                 */
                if(currentDirection !== null && currentDirection !== this.direction) return;
                /**
                 * release current direction flag.
                 * @type {null}
                 */
                currentDirection = null;
            }

            now = Date.now();
            evaluateInfo = this.evaluateRightPos();
            this.lastTime = now;

            //evaluate inertia distance
            if(!evaluateInfo.isWrongPos && (now - this.latestTime < THRESHOLD.fingerFreeTime)) {
                this.evaluateInertia(evaluateInfo.startPos, evaluateInfo.refPos, evaluateInfo.distPort, evaluateInfo.distFloor);
            } else {
                this.clearInertia();
            }

            /**
             * the fn which will be going with the end event.
             */
            this.goWithTouchEnd && this.goWithTouchEnd(this.curX, this.curY, this.inertia);

            /**
             * simulate the inertia.
             */
            this.simulateInertia(evaluateInfo.startPos, evaluateInfo.rightPos);
        },
        /**
         * transition end.
         * @param {object} eve DOM event
         */
        transitionend: function (eve) {
            var rigthPos;

            if(eve.target != this.oSlider || !this.translating) return;

            rigthPos = this.evaluateRightPos();

            /**
             * if slider has a wrong position,back to the right,
             * else mark the 'translating' state ended.
             */
            if(rigthPos.isWrongPos && !this.nonInertia) {
                this.translate(THRESHOLD.amendTime, Math.tween.Quad.easeOut.bezier, rigthPos.rightPos)
            } else {
                this.translating = false;
            }
        },
        resize: function () {
            this.measureViewport();
            this.updateRightPosition();
        },
        /**
         * remeasure the view port,for the measurement of the view port maybe changed,if necessary.
         */
        measureViewport: function () {
            this.portWidth = parseFloat(kits.getStyle(this.oViewport, 'width'));
            this.portHeight = parseFloat(kits.getStyle(this.oViewport, 'height'));
        },
        /**
         * move the slider to the right position,if it has a wrong position.
         */
        updateRightPosition: function () {
            var evaluateInfo = this.evaluateRightPos();
            this.simulateInertia(evaluateInfo.startPos, evaluateInfo.rightPos);
        },
        brake: function () {
            this.frameFlag++;
        },
        continue: function () {
            return ++this.frameFlag;
        },
        clearInertia: function () {
            this.inertia = null;
            this.period = null;
            this.curve = null;
        },
        /**
         * stop and clear up the inertia.
         * if the inertia is prevented,the slider won't move back to the original right position as well.
         */
        stopInertia: function () {
            this.clearInertia();
            this.nonInertia = true;
        },
        /**
         * resume inertia.
         */
        resumeInertia: function () {
            this.nonInertia = false;
        },
        /**
         * move to the specific destination and there's no transition.
         * @param {number} destX
         * @param {number} destY
         */
        moveTo: function (destX, destY) {
            if(ENVS.supportCssMove) {
                this.updateTranslate(destX, destY);
            } else {
                this.sliderStyle.top = destY + 'px';
                this.sliderStyle.left = destX + 'px';
            }
            this.curX = destX;
            this.curY = destY;
        },
        /**
         * move to the specific destination with transition or animation.
         * @param {number} startPos
         * @param {number} rightPos
         * @param {number} duration milliseconds
         * @param {object} animate curve fn / cubic bezier
         */
        animateTo: function (startPos, rightPos, duration, curve) {
            duration = duration || (THRESHOLD.amendTime / 2);
            curve = curve || Math.tween.Quad.easeIn;
            this.frame(this.continue(), Date.now(), startPos, rightPos, duration, curve);
        },
        /**
         * if the slider is out of boundary,it will also enter the 'mire'(means it will be slow down to tell the user
         * it has reach to the boundary).
         * @param {number} pos current position
         * @param {number} floorPos extremity where the slider can reach
         * @returns {*}
         */
        evaluateBoundaryMire: function (pos, floorPos) {
            var out = pos;
            if(pos > 0) {
                out = pos / THRESHOLD.boundaryMire;
            }
            else if(pos < -floorPos) {
                out = -floorPos + (pos + floorPos) / THRESHOLD.boundaryMire;
            }
            return out;
        },
        /**
         * evaluate whether the position of the slider is out of boundary or not.
         * @returns {{isWrongPos: boolean, distPort: *, distFloor: *, startPos: *, refPos: *, rightPos: *}}
         */
        evaluateRightPos: function () {
            var isWrongPos = true,
                distLeft, distTop, distPort, distFloor,
                startPos, refPos, rightPos;

            if(this.direction === 'x') {
                distLeft  = parseFloat(kits.getStyle(this.oSlider, 'width'));
                distPort  = this.portWidth;
                distFloor = distLeft - distPort;
                startPos  = this.curX;
                refPos    = this.refX;
                //the width of slider is less than the width of viewport.
                if(distFloor < 0) {
                    isWrongPos = this.curX !== 0;
                    distFloor = 0;
                    rightPos = 0;
                }
                //left overflow
                else if(this.curX > 0) {
                    rightPos = 0;
                }
                //right overflow
                else if(this.curX < -distFloor) {
                    rightPos = -distFloor;
                }
                //no abnormality
                else {
                    isWrongPos = false;
                    rightPos = this.curX;
                }
            } else {
                distTop   = parseFloat(kits.getStyle(this.oSlider, 'height'));
                distPort  = this.portHeight;
                distFloor = distTop - distPort;
                startPos  = this.curY;
                refPos    = this.refY;
                //the height of slider is less than the height of viewport.
                if(distFloor < 0) {
                    isWrongPos = this.curY !== 0;
                    distFloor = 0;
                    rightPos = 0;
                }
                //top overflow
                else if(this.curY > 0) {
                    rightPos = 0;
                }
                //bottom overflow
                else if(this.curY < -distFloor) {
                    rightPos = -distFloor;
                }
                //no abnormality
                else {
                    isWrongPos = false;
                    rightPos = this.curY;
                }
            }
            return {
                isWrongPos   : isWrongPos,
                distPort     : distPort,
                distFloor    : distFloor,
                startPos     : startPos,
                refPos       : refPos,
                rightPos     : rightPos
            };
        },
        /**
         * calculate the inertia.
         * @param {number} startPos start position
         * @param {number} refPos the latest reference position
         * @param {number} distPort the length of the view port
         * @param {number} distFloor the extremity where the slider can reach
         */
        evaluateInertia: function (startPos, refPos, distPort, distFloor) {
            var distance  = startPos - refPos,
                duration  = this.lastTime - this.latestTime,
                distPerMs = Math.abs(distance / duration),
                direction = distance < 0 ? -1 : 1,
                inertia   = startPos + (distPerMs * distPerMs) / (2 * THRESHOLD.coefficient) * direction,
                period    = distPerMs / THRESHOLD.coefficient,
                curve     = Math.tween.Quad.easeOut;

            if(inertia > 0) {
                inertia  = distPort / 2.5 * ( distPerMs / 8 );
                distance = Math.abs(startPos) + inertia;
                period   = distance / distPerMs;
            }
            else if(inertia < -distFloor) {
                inertia  = -distFloor - ( distPort / 2.5 * ( distPerMs / 8 ) );
                distance = Math.abs(inertia - startPos);
                period   = distance / distPerMs;
            } else {
                curve = Math.tween.Quart.easeOut;
            }
            this.inertia = inertia;
            this.period  = period;
            this.curve   = curve;
        },
        /**
         * simulate the inertial and judge whether it's necessary to move back to the original right position.
         * @param {number} startPos start position
         * @param {number} rightPos the original right position
         */
        simulateInertia: function (startPos, rightPos) {
            var _this, inertia, period, curve, now;

            if(this.nonInertia) return;

            _this   = this;
            inertia = this.inertia;
            period  = this.period;
            curve   = this.curve;
            now     = Date.now();

            /**
             * has inertia to simulate
             */
            if(typeof inertia === 'number') {
                this.clearInertia();
                this.frame(this.continue(), now, startPos, inertia, period, curve, function () {
                    var evaluateInfo = _this.evaluateRightPos(),
                        now          = Date.now();
                    _this.frame(_this.continue(), now, evaluateInfo.startPos, evaluateInfo.rightPos, THRESHOLD.amendTime, Math.tween.Quad.easeOut);
                });
            }
            /**
             * no inertia,but the current position may be wrong,so amend that.
             */
            else {
                this.frame(this.continue(), now, startPos, rightPos, THRESHOLD.amendTime, Math.tween.Quad.easeOut);
            }
        },
        /**
         * the function which drives every frame.
         * @param {number} flag the ID of every frame sets
         * @param {number} startTime the time when start the current animation
         * @param {number} startPos the position where start the current animation
         * @param {number} destPos destination
         * @param {number} duration duration
         * @param {object} tween moving curve
         * @param {object} callback
         */
        frame: function (flag, startTime, startPos, destPos, duration, tween, callback) {
            var _this, now, progress, pos;

            /**
             * framing by transform.
             */
            if(ENVS.supportCssMove) {
                if(startPos !== destPos) {
                    this.translating = true;
                    this.translate(duration, tween, destPos);
                }
                return;
            }

            /**
             * if frame flag is changed, this frame will be ignored.
             */
            if(this.frameFlag !== flag) return;

            /**
             * complete these frames.
             */
            if(startPos === destPos) {
                callback && callback();
                return;
            }

            _this = this;
            now = Date.now();
            progress = now - startTime;

            if(progress > duration ) progress = duration;
            pos = Math.round(tween.fn(progress, startPos, destPos - startPos, duration));

            if(this.direction === 'x') {
                this.moveTo(pos, this.curY);
            } else {
                this.moveTo(this.curX, pos);
            }

            if(progress === duration) {
                this.brake();
                callback && callback();
                return;
            }

            //recursive frame
            engines.FPS.call(window, function () {
                _this.frame(flag, startTime, startPos, destPos, duration, tween, callback);
            });
        },
        /**
         * set specific transition style.
         * @param {string|array} val
         * @returns {ISlider}
         */
        setTransition: function (val) {
            var value = val || ['all', '0s', Math.tween.Quad.easeOut.bezier, '0s'];
            kits.setCompatibleProperty(this.sliderStyle, 'transition', value);
            return this;
        },
        /**
         * set the translate style.
         * @param {number} x
         * @param {number} y
         * @returns {ISlider}
         */
        updateTranslate: function (x, y) {
            var value = ['translate(', x, 'px, ', y, 'px)'].join('');
            kits.setCompatibleProperty(this.sliderStyle, 'transform', value);
            return this;
        },
        /**
         * translate to somewhere with the specific duration and curve.
         * @param {number} duration unit: millisecond
         * @param {string} curve 'cubic-bezier'
         * @param {number} destPos destination position
         */
        translate: function (duration, curve, destPos) {
            var pos = {};
            duration = duration / 1000 + 's';
            this.setTransition(['all', duration, curve.bezier, '0s']);
            if(this.direction === 'x') {
                pos.x = destPos, pos.y = this.curY;
            } else {
                pos.x = this.curX, pos.y = destPos;
            }
            // update translate style
            this.updateTranslate(pos.x, pos.y);
            //update current position
            this.curX = pos.x;
            this.curY = pos.y;
        }
    };

    window.ISlider === undefined && (window.ISlider = ISlider);

})(window);