/**
 * Created by redcamel on 2015-05-05.
 */
var Material = (function () {
    var textures, shading, diffuse, normal, specular, diffuseWrap, specularNormal, color, wireFrame, count, scene, texType,
        Material, fn;
    
    //private
    textures = {},
    shading = {},
    diffuse = {},
    normal = {},
    specular = {},
    diffuseWrap = {},
    specularNormal = {},
    color = {},
    wireFrame = {},
    count = {},
    scene = {},
    texType = {
        diffuse:diffuse,
        specular:specular,
        diffuseWrap:diffuseWrap,
        normal:normal,
        specularNormal:specularNormal
    },
    //shared private
    $setPrivate('Material', {
    }),
    
    Material = function Material() {
        textures[this] = {},
        shading[this] = {type: 'none', lambert: 1},
        diffuse[this] = [],
        normal[this] = [],
        specular[this] = [],
        diffuseWrap[this] = [],
        specularNormal[this] = [],
        wireFrame[this] = 0,
        scene[this] = null,
        color[this] = $color(arguments).slice(0);
        /*
        this._rw = Math.random(),
        this._gw = Math.random(),
        this._bw = Math.random(),
        */
    },
    fn = Material.prototype,
    fn.prop = {
        count:$getter(count, false, 0),
        backgroundColor:{
            get:(function(){
                var a = [];
                return function backgroundColorGet() {
                    var p = color[this];
                    a[0] = p.r, a[1] = p.g, a[2] = p.b, a[3] = p.a
                    return a;
                };
            })(),
            set:function backgroundColorSet(v) {
                v = $color(v);
                color.r = v[0], color.g = v[1], color.b = v[2], color.a = v[3];
           }
        },
    }
    fn.addTexture = function addTexture(type, texture/*,index,blendMode*/) {
        var p;
        if (!texType[type]) this.error(0);
        if (!(texture instanceof Texture)) this.error(1);
        p = texType[type][this];
        if (p[texture]) this.error(2);
        p[texture] = 1;
        texture = {tex:texture};
        if (arguments.length > 3) {
            texture.blendMode = arguments[3];
        }
        if (arguments.length > 2 && arguments[2] !== false) {
            p.splice(arguments[2], 0, texture);
        }else{
            p[p.length] = texture;
        }
        return this;
    },
    fn.removeTexture = function removeTexture(textureID){ 
        var t = this._textures[textureID];
        if(!t) return this;
        var type = this._textures[textureID].type;
        var typeList = this['_' + type].__indexList;
        var i = typeList.length;
        while (i--) {
            if (typeList[i].id == textureID) {
                typeList.splice(i, 1);
                break;
            }
        }
        delete this._textures[textureID];
        console.log('확인', this['_' + type]);
        return this;
    },
    fn.setWireFrame = function setWireFrame(isVisible){ 
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
        return this;
    },
    fn.setShading = function setShading(type){ 
        type.apply(this);
        return this;
    },
    fn.setLambert = function setShading(rate){ 
        this._shading.lambert = rate;
        return this;
    };
    return MoGL.ext(Material, MoGL);
})();