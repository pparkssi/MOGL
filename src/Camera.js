/**
 * Created by redcamel on 2015-05-05.
 * description
 */
var Camera = (function () {
    var Camera, fn, A4, F3, PERPI;
    var hex, hex_s;
    A4=[], PERPI=Math.PI / 180,
    F3 = new Float32Array(3),
    hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
    hex_s = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i;
    Camera = function Camera() {
        this._cvs=null,
        this._renderArea = null,
        this._geometry = new Geometry([], []),
        this._material = new Material(),
        this._r = 0,
        this._g = 0,
        this._b = 0,
        this._a = 1,
        this._fov = 55,
        this._near = 0.1,
        this._far = 1000000,
        this._visible=1,
        this._filters ={},
        this._fog = null,
        this._antialias = false,
        this._pixelMatrix = Matrix(),
        this.z =10,
        this._mode = '3d'
        this.lookAt(0,0,0);

    },
    Camera.resize = 'RESIZE'
    fn = Camera.prototype,
    fn.getBackgroundColor = function getBackgroundColor(){
        return A4[0] = this._r, A4[1] = this._g, A4[2] = this._b, A4[3] = this._a, A4;
    },
    fn.getClipPlane = function getClipPlane(){
        return [this._near,this._far];
    },
    fn.getFilters = function getFilters(){
        var result = [],t = this._filters;
        for(var k in t) result.push(k);
        return result;
    },
    fn.getFog = function getFog(){
        return this._fog ? true : false;
    },
    fn.getFOV = function getFOV(){
        return this._fov;
    },
    fn.resetProjectionMatrix = function resetProjectionMatrix(){
        var tMatrix, tArea;
        tMatrix = this._pixelMatrix,
        tArea = this._renderArea,
        tMatrix.matIdentity()
        if(this._mode == '2d'){
            tMatrix._rawData[0] = 2 / tArea[2]
            tMatrix._rawData[5] = -2 / tArea[3]
            tMatrix._rawData[10] = 0
            tMatrix._rawData[12] = -1
            tMatrix._rawData[13] = 1
        }else {
            if(tArea) tMatrix.matPerspective(this._fov, tArea[2]/tArea[3], this._near, this._far);
            else tMatrix.matPerspective(this._fov, this._cvs.width/this._cvs.height, this._near, this._far);
        }
        return this;
    },
    fn.getRenderArea = function getRenderArea(){
        return this._renderArea;
    },
    fn.getAntialias = function getAntialias(){
        return this._antialias ? true : false;
    },
    fn.getVisible = function getVisible(){
        return this._visible ? true : false;
    },
    fn.setBackgroundColor = Material.prototype.setBackgroundColor,
    fn.setClipPlane = function setClipPlane(near,far){
        this._near = near, this._far = far;
        return this;
    },
    fn.setFog = function setFog(color,near,far){
        var t0 = color, t1, result;
        if (t0 !=false && t0.charAt(0) == '#') {
            result= {};
            if (t1 = hex.exec(t0)) {
                result.r = parseInt(t1[1], 16) / 255,
                result.g = parseInt(t1[2], 16) / 255,
                result.b = parseInt(t1[3], 16) / 255;

            } else {
                t1 = hex_s.exec(t0),
                result.r = parseInt(t1[1] + t1[1], 16) / 255,
                result.g = parseInt(t1[2] + t1[2], 16) / 255,
                result.b = parseInt(t1[3] + t1[3], 16) / 255;
            }
            result.a = 1,
            result.near = near,
            result.far = far,
            this._fog = result;
        } else if (!t0) this._fog = null;
        return this;
    },
    fn.setFOV = function setFOV(){
        if (arguments.length == 1) this._fov = arguments[0];
        else this._fov = Math.ceil(2 * Math.atan(Math.tan(arguments[2] * PERPI / 2) * (arguments[1] / arguments[0])) * (180 / Math.PI));
        return this;
    },
    fn.setOthogonal = function setOthogonal(){
        this._mode = '2d';
        return this;
    },
    fn.setPerspective = function setPerspective(){
        this._mode = '3d';
        return this;
    },
    fn.setRenderArea = function setRenderArea(x,y,w,h){
        var tw, th;
        tw = this._cvs.width,
        th = this._cvs.height,
        //console.log(typeof x == 'string' ? tw * x.replace('%', '') : x);
        this._renderArea = [
            typeof x == 'string' ? tw * x.replace('%', '') * 0.01 : x,
            typeof y == 'string' ? th * y.replace('%', '') * 0.01 : y,
            typeof w == 'string' ? tw * w.replace('%', '') * 0.01 : w,
            typeof h == 'string' ? th * h.replace('%', '') * 0.01 : h,
        ];
        return this;
    },
    fn.setAntialias = function setAntialias(isAntialias){
        this._antialias = isAntialias;
        return this;
    },
    fn.setVisible = function setVisible(value){
        this._visible = value;
        return this;
    },
    fn.setFilter = function setFilter(filter/*,needIe*/){
        var result;
        if(arguments[1]) result = arguments[1];
        else {
            switch (filter) {
                case Filter.anaglyph :
                    result = {
                        offsetL: 0.008,
                        offsetR: 0.008,
                        gIntensity: 0.7,
                        bIntensity: 0.7
                    };
                    break;
                case Filter.bevel :
                    result = {
                        distance: 4.0,
                        angle: 45,
                        highlightColor: '#FFF',
                        highlightAlpha: 1.0,
                        shadowColor: '#000',
                        shadowAlpha: 1.0,
                        blurX: 4.0,
                        blurY: 4.0,
                        strength: 1,
                        quality: 1,
                        type: "inner",
                        knockout: false
                    };
                    break;
                case Filter.bloom :
                    result = {
                        threshold: 0.3,
                        sourceSaturation: 1.0,
                        bloomSaturation: 1.3,
                        sourceIntensity: 1.0,
                        bloomIntensity: 1.0
                    };
                    break;
                case Filter.blur :
                    result = {
                        blurX: 4.0,
                        blurY: 4.0,
                        quality: 1
                    };
                    break;
                case Filter.colorMatrix :
                    result = {};
                    break;
                case Filter.convolution :
                    result = {
                        matrixX: 0,
                        matrixY: 0,
                        matrix: null,
                        divisor: 1.0,
                        bias: 0.0,
                        preserveAlpha: true,
                        clamp: true,
                        color: 0,
                        alpha: 0.0
                    };
                    break;
                case Filter.displacementMap :
                    result = {
                        mapTextureID: null,
                        mapPoint: null,
                        componentX: 0,
                        componentY: 0,
                        scaleX: 0.0,
                        scaleY: 0.0,
                        mode: "wrap",
                        color: 0,
                        alpha: 0.0
                    };
                    break;
                case Filter.fxaa :
                    result = {};
                    break;
                case Filter.glow :
                    result = {
                        color: '#F00',
                        alpha: 1.0,
                        blurX: 6.0,
                        blurY: 6.0,
                        strength: 2,
                        quality: 1,
                        inner: false,
                        knockout: false
                    };
                    break;
                case Filter.invert :
                    result = {};
                    break;
                case Filter.mono :
                    result = {};
                    break;
                case Filter.sepia :
                    result = {};
                    break;
                case Filter.shadow :
                    result = {
                        distance: 4.0,
                        angle: 45,
                        color: 0,
                        alpha: 1.0,
                        blurX: 4.0,
                        blurY: 4.0,
                        strength: 1.0,
                        quality: 1,
                        inner: false,
                        knockout: false,
                        hideObject: false
                    };
                    break;
            }
        }
        this._filters[filter] = result;
        return this;
    },
    fn.removeFilter = function removeFilter(filter){
        delete this._filters[filter];
        return this;
    }
    return MoGL.ext(Camera, Mesh);
})();

