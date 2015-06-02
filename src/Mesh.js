var Mesh = (function () {
    var geometry, material, scene, parent, culling,
        Mesh, fn;
    
    //private
    geometry = {},
    material = {},
    scene = {},
    parent = {},
    culling = {};
    //공용상수정의 - 꼭노출할것만 골라낼것
    $setPrivate('Mesh', {
        /*
        parent:parent
        */
    });
    
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
    Object.defineProperty( fn, 'parent', {
        get:$method(function parentGet() {
            return parent[this] || null;
        })
    }),
    Object.defineProperty( fn, 'culling', {
        get:$method(function cullingGet() {
            return culling[this] || Mesh.cullingNone;
        }),
        set:$method(function cullingSet(v) {
            if (Mesh[v]) {
                culling[this] = v;
            } else {
                this.error(0);
            }
        })
    }),
    Object.defineProperty( fn, 'geometry', {
        get:$method(function geometryGet() {
            return geometry[this] || null;
        }),
        set:$method(function geometrySet(v) {
            if (v instanceof Geometry) {
                geometry[this] = v;
            } else {
                this.error(0);
            }
        })
    }),
    Object.defineProperty( fn, 'material', {
        get:$method(function materialGet() {
            return material[this] || null;
        }),
        set:$method(function materialSet(v) {
            if (v instanceof Material) {
                material[this] = v;
            } else {
                this.error(0);
            }
        })
    }),
    (function(){
        var key = 'cullingNone,cullingFront,cullingBack'.split(','), i = key.length;
        while (i--) Mesh[key[i]] = key[i];
    })();
    return MoGL.ext(Mesh, Matrix);
})();