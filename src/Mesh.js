var Mesh = (function () {
    var geometry, material, scene, culling,
        Mesh, fn;
    
    //private
    geometry = {},
    material = {},
    scene = {},
    culling = {};
    //shared private
    $setPrivate('Mesh', {
    }),
    
    Mesh = function Mesh(geometry, material) {
        if (geometry) {
            if (geometry instanceof Geometry) {
                geometry[this] = geometry;
            } else {
                this.error(0);
            }
        }
        if (material) {
            if (material instanceof Material) {
                material[this] = material;
            } else {
                 this.error(1);
            }
        }
        culling[this] = Mesh.cullingNone;
    },
    fn = Mesh.prototype,
    fn.prop = {
        culling:{
            get:$getter(culling, false, Mesh.cullingNone),
            set:function cullingSet(v) {
                if (Mesh[v]) {
                    culling[this] = v;
                } else {
                    this.error(0);
                }
            }
        },
        geometry:{
            get:$getter(geometry),
            set:function geometrySet(v) {
                if (v instanceof Geometry) {
                    geometry[this] = v;
                } else {
                    this.error(0);
                }
            }
        },
        material:{
            get:$getter(material),
            set:function materialSet(v) {
                if (v instanceof Material) {
                    material[this] = v;
                } else {
                    this.error(0);
                }
            }
        }
    },
    (function(){
        var key = 'cullingNone,cullingFront,cullingBack'.split(','), i = key.length;
        while (i--) Mesh[key[i]] = key[i];
    })();
    return MoGL.ext(Mesh, Matrix);
})();