/**
 * Created by redcamel on 2015-05-22.
 */
var FreeController = (function () {
    var FreeController, fn,MAT1,MAT2;
    MAT1 = Matrix.create(), MAT2 = Matrix.create(),
    FreeController = function FreeController(camera) {
        if(!(camera instanceof Camera)) MoGL.error('FreeController','contructor',0)
        this._camera = camera
        this._displacement = [0,0,0]
        this._speed = 1
        this._smoothDelay = 0.1
        this._desirePosition=this._camera.getPosition()
    },
    fn = FreeController.prototype,
    fn.autoBindKey = function(){
        //TODO 기본 조작키를 세팅하자..c
    }
    fn.bindKey = function(){
        //TODO 전후좌우 로테이션등의 키를 바인딩할수있게 개선
    },
    fn.setSpeed = function setSpeed(value){
        this._speed = value
    },
    fn.setSmoothDelay = function setSmoothDelay(value){
        this._smoothDelay = value
    },
    fn.getSpeed = function getSpeed(){
         return this._speed
    },
    fn.getSmoothDelay = function getSmoothDelay(){
        return this._smoothDelay
    },
    fn.update = function update(){
        var forward = false, back = false, up = false, down = false, left = false, right = false;
        var updateRotateX,updateRotateY,updateRotateZ,speed;
        var downKey,tCamera;
        updateRotateX = updateRotateY = updateRotateZ = 0,
        downKey = KeyBoard.downed,
        tCamera = this._camera
        if (downKey[KeyBoard.A]) left = true
        if (downKey[KeyBoard.D]) right = true
        if (downKey[KeyBoard.R]) up = true
        if (downKey[KeyBoard.F]) down = true
        if (downKey[KeyBoard.W]) forward = true
        if (downKey[KeyBoard.S]) back = true

        if (downKey[KeyBoard.Q]) updateRotateY = 0.01 * this._speed
        if (downKey[KeyBoard.E]) updateRotateY = -0.01 * this._speed
        if (downKey[KeyBoard.T]) updateRotateX = 0.01 * this._speed
        if (downKey[KeyBoard.G]) updateRotateX = -0.01 * this._speed

        speed = this._speed
        this._displacement[0] = right ? -speed : (left ? speed : 0),
        this._displacement[1] = up ? -speed : (down ? speed : 0),
        this._displacement[2] = forward ? -speed : (back ? speed : 0)

        Matrix.identity(MAT1),
        Matrix.translate(MAT1, MAT1, this._displacement),
        Matrix.identity(MAT2),
        Matrix.rotateZ(MAT2, MAT2, tCamera.rotateZ),
        Matrix.rotateY(MAT2, MAT2, tCamera.rotateY),
        Matrix.rotateX(MAT2, MAT2, tCamera.rotateX),
        Matrix.multiply(MAT1, MAT2, MAT1),

        this._desirePosition[0]+=MAT1[12]
        this._desirePosition[1]+=MAT1[13]
        this._desirePosition[2]+=MAT1[14]

        tCamera.x += (this._desirePosition[0] - tCamera.x)*this._smoothDelay,
        tCamera.y += (this._desirePosition[1] - tCamera.y)*this._smoothDelay,
        tCamera.z += (this._desirePosition[2] - tCamera.z)*this._smoothDelay,
        tCamera.rotateX += updateRotateX,
        tCamera.rotateY += updateRotateY ,
        this._displacement[0]=0,
        this._displacement[1]=0,
        this._displacement[2]=0,
        updateRotateX = 0,
        updateRotateY = 0
    }
    return MoGL.ext(FreeController, MoGL);
})();
