/**
 * Created by redcamel on 2015-05-05.
 */
var Material = (function () {
    var textureLoaded, texType,
        diffuse, normal, specular, diffuseWrap, specularNormal, 
        shading, lambert, color, wireFrame, wireFrameColor, count, 
        Material, fn, fnProp;
    
    //private
    shading = {},
    lambert = {},
    diffuse = {},
    normal = {},
    specular = {},
    diffuseWrap = {},
    specularNormal = {},
    color = {},
    wireFrame = {},
    wireFrameColor = {},
    count = {},
    scene = {},
    //shared private
    $setPrivate('Material', {
    }),
    //lib
    textureLoaded = function(mat){
        this.removeEventListener(Texture.load, textureLoaded),
        mat.dispatch(Material.changed);
    },
    texType = {
        diffuse:diffuse,
        specular:specular,
        diffuseWrap:diffuseWrap,
        normal:normal,
        specularNormal:specularNormal
    },
    
    Material = function Material() {
        shading[this] = Shading.none,
        lambert[this] = 1,
        diffuse[this] = [],
        normal[this] = [],
        specular[this] = [],
        diffuseWrap[this] = [],
        specularNormal[this] = [],
        color[this] = {r:0,g:0,b:0,a:1}
        if (arguments.length) this.color = $color(arguments.length > 1 ? arguments : arguments[0]),
        wireFrame[this] = false,
        wireFrameColor[this] = [Math.random(), Math.random(), Math.random(), 1];
    },
    fn = Material.prototype,
    fnProp = {
        count:$getter(count, false, 0),
        color:{
            get:(function(){
                var a = [];
                return function colorGet() {
                    var p = color[this];
                    a[0] = p.r, a[1] = p.g, a[2] = p.b, a[3] = p.a
                    return a;
                };
            })(),
            set:function colorSet(v) {
                var p = color[this]
                v = $color(v);
                p.r = v[0], p.g = v[1], p.b = v[2], p.a = v[3];
           }
        },
        wireFrame:$value(wireFrame),
        wireFrameColor:{
            get:(function(){
                var a = [];
                return function wireFrameColorGet() {
                    var p = wireFrameColor[this];
                    a[0] = p.r, a[1] = p.g, a[2] = p.b, a[3] = p.a
                    return a;
                };
            })(),
            set:function colorSet(v) {
                var p = wireFrameColor[this]
                v = $color(v);
                p.r = v[0], p.g = v[1], p.b = v[2], p.a = v[3];
           }
        },
        shading:$value(shading),
        lambert:$value(lambert),
        diffuse:$value(diffuse)
    },
    fn.addTexture = function addTexture(type, texture/*,index,blendMode*/) {
        var p;
        if (!texType[type]) this.error(0);
        if (!(texture instanceof Texture)) this.error(1);
        p = texType[type][this];
        if (p[texture]) this.error(2);
        p[texture] = 1;
        if(!texture.isLoaded) texture.addEventListener(Texture.load, textureLoaded, null, this);
        
        texture = {tex:texture};
        
        if (arguments.length > 3) {
            texture.blendMode = arguments[3];
        }
        if (arguments.length > 2 && typeof arguments[2] !== 'number') {
            p[p.length] = texture;
        }else{
            p.splice(arguments[2], 0, texture);
        }
        this.dispatch(Material.changed);
        return this;
    },
    fn.removeTexture = function removeTexture(type, texture){
        var p, key, i;
        if (texType[type]) {
            p = texType[type][this];
            if (p[texture]) {
                p[texture] = 0;
                i = p.length;
                
                p.splice(p.indexOf(texture), 1);
            }
        } else {
            for (key in texType) {
                p = texType[key][this];
                if (p[texture]) {
                    p[texture] = 0;
                    p.splice(p.indexOf(texture), 1);
                }
            }
        }
        this.dispatch(Material.changed);
        return this;
    },
    Material.changed = 'changed';
    return MoGL.ext(Material, MoGL, fnProp);
})();