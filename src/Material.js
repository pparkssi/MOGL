/**
 * Created by redcamel on 2015-05-05.
 */
var Material = (function () {
    var Material, fn;
    var hex, hex_s;
    hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, hex_s = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i;
    Material = function Material() {
        this._textures = {},
        this._shading = {type: 'none', lambert: 1},
        this._diffuse = {__indexList: []},
        this._normal = {__indexList: []},
        this._specular = {__indexList: []},
        this._diffuseWrap = {__indexList: []},
        this._specularNormal = {__indexList: []},
        this._r = 1, this._rw = Math.random(),
        this._g = 1, this._gw = Math.random(),
        this._b = 1, this._bw = Math.random(),
        this._a = 1,
        this._wireFrame = 0,
        this._count = 0,
        this._scene = null,
        this._key = null,
        this.setBackgroundColor.apply(this, arguments);
    },
    fn = Material.prototype,
    fn.addTexture = function addTexture(type,textureID/*,index,blendMode*/) { MoGL.isAlive(this);
        var t = this._scene;
        if (t && !t._textures[textureID]) MoGL.error('Material', 'addTexture', 0);
        if (this._textures[textureID]) MoGL.error('Material', 'addTexture', 1);
        this._textures[textureID] = {id: textureID, type: type};
        var result;
        console.log('type :', '_' + type);
        console.log('확인', this['_' + type],this['_' + type].__indexList.length);
        //배열화
        if (arguments[2] !=undefined) {
            var idx = arguments[2] >this['_' + type].__indexList.length ? this['_' + type].__indexList.length : arguments[2]
            result = this['_' + type].__indexList.splice(idx, 0, {id: textureID, blendMode: arguments[3]});
        }
        else result = this['_' + type].__indexList.push({id: textureID, blendMode: arguments[3]});
        return this;
    },
    fn.getRefCount = function getRefCount(){ MoGL.isAlive(this);
        return this._count;
    },
    fn.removeTexture = function removeTexture(textureID){ MoGL.isAlive(this);
        var t = this._textures[textureID];
        if(!t) return this;
        var type = this._textures[textureID].type;
        var typeList = this['_' + type].__indexList;
        var i = typeList.length;
        while (i--) {
            if (typeList[i].id == textureID) {
                typeList.splice(i, 1);
                break
            }
        }
        delete this._textures[textureID];
        console.log('확인', this['_' + type]);
        return this;
    },
    //    fn.removeTexture = function removeTexture(type,textureID){ MoGL.isAlive(this);
    //        console.log('지울텍스쳐',type,textureID)
    //        console.log(this)
    //        var typeList = this['_' + type].__indexList
    //        var i = typeList.length
    //        while (i--) {
    //            if (typeList[i].id == textureID) {
    //                typeList.splice(i, 1)
    //                break
    //            }
    //        }
    //        delete this._textures[textureID]
    //        console.log('확인', this['_' + type])
    //        return this
    //    },
    fn.setBackgroundColor = function setBackgroundColor(){ MoGL.isAlive(this);
        var t0 = arguments[0], t1, ta;
        if (arguments.length == 1) {
            if (t0.length > 7) ta = +t0.substr(7), t0 = t0.substr(0, 7);
            if (t0.charAt(0) == '#') {
                if (t1 = hex.exec(t0)) {
                    this._r = parseInt(t1[1], 16) / 255,
                    this._g = parseInt(t1[2], 16) / 255,
                    this._b = parseInt(t1[3], 16) / 255;
                } else {
                    t1 = hex_s.exec(t0),
                    this._r = parseInt(t1[1] + t1[1], 16) / 255,
                    this._g = parseInt(t1[2] + t1[2], 16) / 255,
                    this._b = parseInt(t1[3] + t1[3], 16) / 255;
                }
                this._a = ta  ? ta > 1 ? 1 : ta : 1;
            }
        } else {
            this._r = arguments[0] || Math.random(),
            this._g = arguments[1] || Math.random(),
            this._b = arguments[2] || Math.random(),
            this._a = arguments[3] == undefined ?  1 : arguments[3]
        }
    },
    fn.setWireFrame = function setWireFrame(isVisible){ MoGL.isAlive(this);
        this._wireFrame = isVisible;
        var t0 = arguments[1], t1, ta;
        if (arguments.length == 2) {
            if (t0.length > 7) ta = +t0.substr(7), t0 = t0.substr(0, 7);
            if (t1 = hex.exec(t0)) {
                this._rw = parseInt(t1[1], 16) / 255,
                this._gw = parseInt(t1[2], 16) / 255,
                this._bw = parseInt(t1[3], 16) / 255;
            } else {
                t1 = hex_s.exec(t0),
                this._rw = parseInt(t1[1] + t1[1], 16) / 255,
                this._gw = parseInt(t1[2] + t1[2], 16) / 255,
                this._bw = parseInt(t1[3] + t1[3], 16) / 255;
            }
        }
    },
    fn.setShading = function setShading(type){ MoGL.isAlive(this);
        type.apply(this);
    },
    fn.setLambert = function setShading(rate){ MoGL.isAlive(this);
        this._shading.lambert = rate;
    };
    return MoGL.ext(Material, MoGL);
})();