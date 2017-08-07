# iSlider
*iSlider is expected to be used in mobile terminal.*

`iSlider` simulates the sliding behavior ``in mobile terminal``.It's lightweight but can meet your demand to deal with the touch,scroll,swipe and etc.
Based on iSlider,lots of UI can be implemented.Enjoy~ -_-"
## Basic Usage
1. Refer to the demo:

  ```sh
  $ pwd 
  /path/iSlider
  $ npm install
  $ grunt default
  ```
  *demo can be seen in `demo` folder*

2. Get compressed file:

  ```sh
  $ grunt dist
  ```
  *new compressed file can be found in 'dist' folder*

3. Steps to init:

  1. inlude js file to your page

     ```html
     <head>
       <script type="text/javascript" src="../dist/iSlider.min.js"></script>
     </head>
     ```

  2. basic html structure

     ```html
     <div id="your_container" class="container">
        <div class="wrap">your content</div>
     </div>
     ```

 3. basic stylesheet

     ```css
      .container{
        position: relative; 
        width: 360px;
        height: 640px;
        overflow: hidden;
      }
      .wrap{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }
     ```

  4. init an iSlider component

    ```javascript
    var oSlider = new ISlider('#your_container', settings);
    ```


## Deep Dive
### settings:

*after init one iSlider component like:*

```javascript
var oSlider = new ISlider('#your_container', settings);
```
*settings should be a JSON object like `{direction: 'y'}`*

```javascript
var settings = {
    /**
     * value:'x' or 'y', set the direction to slide in the viewport,default is 'y'.
     */
    direction: value
    /**
     * value:true or false, whether to use the default scrolling of the browser in the opposite direction.
     */
    oppositeSlide: value
    /**
     * value:true or false, whether to lock the other direction. 
     * only one direction is available for all of the iSlider components.
     * that means if one direction was locked,other iSlider components won't be scrollable in the opposite direction.
     */
    lockTheOtherDirection: value
    /**
     * value:0 or other number, the initial 'x' position of the slider.
     */
    startX: value
    /**
     * value:0 or other number, the initial 'x' position of the slider.  
     */
    startY: value
}
```

### apis:

*some api is available after init a oSlider object:*<br>

```javascript
oSlider.goWithTouchStart = function (x, y){
	some code here;
}
```
`goWithTouchStart` will be executed when the touch start event emitted.<br>
`x` and `y` is the position of the slider which will be passed in when executed.<br><br>



```javascript
oSlider.goWithTouchMove = function (x, y){
	some code here;
}
```
`goWithTouchMove` is like the usage above,but executed when the touch move event emitted.<br><br>



```javascript
oSlider.goWithTouchEnd = function (x, y, inertia){
	some code here;
}
```
`goWithTouchEnd` is like the usage above,but executed when the touch end event emitted.<br>
additional: the parameter `inertia` is the destination position of the inertia.and if there's no inertia,`null` will be its value.<br><br>



```javascript
oSlider.moveTo(x, y);
```
move to the specific destination.this's just a 'translate' and no animation.<br>
'x','y' are the destination position.<br><br>



```javascript
oSlider.animateTo(startPos, rightPos, duration, curve);
```
animate to the specific destination.<br>
`startPos` the start position of this animation.<br>
`rightPos` the destination position.<br>
`duration` the duration is optional(milliseconds),there's a default value.<br>
`curve` the animation curve object is optional,there's a default value.Other value is expected from `Math.tween`.<br><br>



```javascript
oSlider.resize();
```
'slider' will recalculate the width and height of viewport and if its position is not right it will adjust to get a right position.<br><br>



```javascript
oSlider.updateRightPosition();
```
adjust the postion of 'slider' to the right one.you know,'slider' may be out of boundary in some situations.<br><br>



```javascript
oSlider.stopInertia();
```
stop to amend for right position automatically.and stop 'inertia'.that means the slider will stop after touch move and no functions will be executed after touch end fired.<br><br>



```javascript
oSlider.stopInertia();
```
resume to amend right position automatically.and resume 'inertia' effect.<br><br>



**only part of the api is detailed here.other can be referred to the notation in source code.**<br>

## License
iSlider is licensed under the MIT license. (http://opensource.org/licenses/MIT)

## Issues
Any issues pls submit in github or contact me by mail(tony7leek@gmail.com).
