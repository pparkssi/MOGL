/**
 * Created by redcamel on 2015-05-22.
 */
var ObitController = (function () {
    var ObitController, fn,self,MAT1;
    var HD_down, HD_move, HD_up,HD_down2, HD_move2, HD_up2;
       MAT1 = Matrix.create(),
    HD_down = function HD_down(e){
        self._mouseInfo.downed = 1
        self._mouseInfo.startX = e.screenX,
        self._mouseInfo.startY = e.screenY
        self._mouseInfo.dx = 0,
        self._mouseInfo.dy = 0
        e.preventDefault()
    },
    HD_move= function HD_move(e){
        if(self._mouseInfo.downed){
            self._mouseInfo.dx = self._mouseInfo.startX-e.screenX
            self._mouseInfo.dy = self._mouseInfo.startY-e.screenY
        }
        self._mouseInfo.startX = e.screenX,
        self._mouseInfo.startY = e.screenY
        e.preventDefault()
    },
    HD_up = function HD_up(e){
        self._mouseInfo.downed = 0
        e.preventDefault()
    },
   HD_down2 = function HD_down(e){
       self._mouseInfo.downed = 1
       self._mouseInfo.startX = e.changedTouches[0].screenX,
           self._mouseInfo.startY = e.changedTouches[0].screenY
       self._mouseInfo.dx = 0,
           self._mouseInfo.dy = 0
       e.preventDefault()
   },
   HD_move2= function HD_move(e){
       if(self._mouseInfo.downed){
           self._mouseInfo.dx = self._mouseInfo.startX-e.changedTouches[0].screenX
           self._mouseInfo.dy = self._mouseInfo.startY-e.changedTouches[0].screenY
       }
       self._mouseInfo.startX = e.changedTouches[0].screenX,
           self._mouseInfo.startY = e.changedTouches[0].screenY
       e.preventDefault()
   },
   HD_up2 = function HD_up(e){
       self._mouseInfo.downed = 0
       e.preventDefault()
   },
    ObitController = function ObitController(camera) {
        if(!(camera instanceof Camera)) MoGL.error('ObitController','contructor',0)
        this._camera = camera
        this._camera.x = 0.1
        this._camera.y = 0.1
        this._camera.z = 0.1
        this._speed = 500
        this._smoothDelay = 0.1
        this._distance = 50
        this._desirePosition=this._camera.getPosition()
        this._pan = 0.01
        this._tilt = 0.01

        this._mouseInfo = {
            downed: 0,
            dx : 0,
            dy : 0,
            startX : 0,
            startY : 0
        }

        self = this

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            document.body.addEventListener('touchstart',HD_down2,false)
            document.body.addEventListener('touchmove',HD_move2,false)
            document.body.addEventListener('touchend',HD_up2,false)
        }else{
            document.body.addEventListener('mousedown',HD_down,false)
            document.body.addEventListener('mousemove',HD_move,false)
            document.body.addEventListener('mouseup',HD_up,false)
        }


    },
    fn = ObitController.prototype,
    fn.setSpeed = function setSpeed(value){
        this._speed = value
    },
    fn.setSmoothDelay = function setSmoothDelay(value){
        this._smoothDelay = value > 0.5 ? 0.5 : value
    },
    fn.getSpeed = function getSpeed(){
         return this._speed
    },
    fn.getSmoothDelay = function getSmoothDelay(){
        return this._smoothDelay
    },
    fn.update = function update(){
        this._pan+= this._mouseInfo.dx / window.innerWidth * this._speed * Math.PI/180,
        this._tilt  += this._mouseInfo.dy / window.innerHeight/2* this._speed  * Math.PI/180,
        this._camera.x += (-Math.sin(this._pan )*this._distance - this._camera.x)*this._smoothDelay,
        this._camera.y += (Math.sin(this._tilt )*this._distance +Math.cos(this._tilt )*this._distance- this._camera.y)*this._smoothDelay,
        this._camera.z += (Math.cos(this._pan )*this._distance- this._camera.z)*this._smoothDelay,
        this._camera.lookAt(0,0,0),
        this._mouseInfo.dx = 0,
        this._mouseInfo.dy = 0
    }
    return MoGL.ext(ObitController, MoGL);
})();
