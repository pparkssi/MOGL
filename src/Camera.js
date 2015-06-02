/**
 * Created by redcamel on 2015-05-05.
 * description
 */
var Camera = (function () {
    var PERPIR, value, getter,
        prop,
        Camera, fn;

    //lib
    PERPIR = PI / 180 * .5,
    
    
    //private
    prop = {},
    
    Camera = function Camera() {
        Object.seal(prop[this] = {
            cvs:null,
            renderArea:null,
            geometry:new Geometry([], []),
            material:new Material(),
            r:0,
            g:0,
            b:0,
            a:1,
            fov:55,
            near:0.1,
            far:1000000,
            visible:1,
            filters:{},
            fog:false,
            fogColor:null,
            fogNear:0,
            fogFar:0,
            antialias:false,
            pixelMatrix:Matrix(),
            mode:CAmera.perspective
        }),
        this.z =10,
        this.lookAt(0,0,0);
    },
    fn = Camera.prototype,
    value = (function(){
        var value = {};
        return function(key){
            value.get = $method(function() {
                return prop[this][key];
            }),
            value.set = $method(function(v) {
                prop[this][key] = v;
            });
            return value;
        };
    })(),
    Object.defineProperty( fn, 'clipPlaneNear', value('near')),
    Object.defineProperty( fn, 'clipPlaneFar', value('far')),
    Object.defineProperty( fn, 'visible', value('visible')),
    Object.defineProperty( fn, 'antialias', value('antialias')),
    
    getter = function(key){
        return $method(function() {
            return prop[this][key];
        });
    },
    Object.defineProperty( fn, 'fogColor', {
        get:getter('fogColor'),
        set:$method(function fogColorSet(v){
            var p = prop[this];
            p.fogColor = $color(v).slice(0),
            p.fog = true;
        })
    }),
    Object.defineProperty( fn, 'fogNear', {
        get:getter('fogNear'),
        set:$method(function fogNearSet(v){
            var p = prop[this];
            p.fogNear = v,
            p.fog = true;
        })
    }),
    Object.defineProperty( fn, 'fogFar', {
        get:getter('fogFar'),
        set:$method(function fogFarSet(v){
            var p = prop[this];
            p.fogFar = v,
            p.fog = true;
        })
    }),
    Object.defineProperty( fn, 'fov', {
        get:getter('fov'),
        set:$method(function fovSet(v){
            var p = prop[this];
            if (typeof v == 'number') {
                p.fov = v;
            } else if ('0' in v && '1' in v) {
                p.fov = CEIL(2 * ATAN(TAN(arguments[2] * PERPIR) * (v[1] / v[0])) * PERPI);
            }
        })
    }),
    Object.defineProperty( fn, 'backgroundColor', {
        get:$method((function(){
            var a = [];
            return function backgroundColorGet() {
                var p = prop[this];
                a[0] = p.r, a[1] = p.g, a[2] = p.b, a[3] = p.a
                return a;
            };
        })()),
        set:$method(function backgroundColorSet(v) {
            var p = prop[this];
            v = $color(v);
            p.r = v[0], p.g = v[1], p.b = v[2], p.a = v[3];
        })
    }),
    Object.defineProperty( fn, 'fog', {
        get:$method(function fogGet(){
            return prop[this].fog ? true : false;
        })
    }),
    Object.defineProperty( fn, 'mode', {
        get:getter('mode'),
        set:$method(function modeSet(v) {
            if (Camera[v]) {
                prop[this].mode = v;
            } else {
                this.error(0);
            }
        })
    }),
    fn.getRenderArea = function getRenderArea(){
        return this._renderArea;
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
    /*마일스톤0.5
    fn.getFilters = function getFilters(){
        var result = [],t = this._filters;
        for(var k in t) result.push(k);
        return result;
    },
    fn.setFilter = function setFilter(filter,needIe){
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
    },
    */
    (function(){
        var key = 'resize,othogonal,perspective'.split(','), i = key.length;
        while (i--) Camera[key[i]] = key[i];
    })();
    return MoGL.ext(Camera, Matrix);
})();

