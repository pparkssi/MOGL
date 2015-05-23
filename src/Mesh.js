/**
 * Created by redcamel on 2015-05-04.
 * description
 기하구조와 재질을 포함할 수 있는 하나의 렌더링 단위인 Mesh를 생성함.
 Mesh는 장면 내에 아핀변환에 대응하는 행렬정보를 갖음. 이에 따라 비가시객체인 Camera 등도 Mesh를 상속하게 됨.
 id를 인자로 지정하면 Scene에 addChild하는 순간 id를 바인딩하며 실패하면 등록되지 않음.
 객체를 인자로 지정하면 Scene에 addChild하는 순간 Mesh내부의 Geometry나 Material이 임의의 id로 자동등록되며, shader Id가 존재하지 않으면 예외가 발생함( addChild 참조 )
 */
var Mesh = (function () {
    var SQRT = Math.sqrt, ATAN2 = Math.atan2, ASIN = Math.asin, COS = Math.cos, PIH = Math.PI * 0.5, PERPI = 180 / Math.PI
    var Mesh, fn;
    var F3, F3_2;
    F3 = new Float32Array(3), F3_2 = new Float32Array(3),
    Mesh = function Mesh(geometry, material) {
        // TODO 어디까지 허용할건가..
        if (geometry && !(typeof geometry == 'string' || geometry instanceof Geometry  )) MoGL.error('Mesh', 'contructor', 0)
        if (material && !(typeof material == 'string' || material instanceof Material  )) MoGL.error('Mesh', 'contructor', 1)
        this._geometry = geometry,
        this._material = material,
        this._scene = null,
        this._parent = null,
        this._matrix = Matrix.create()
        this.rotateX = 0, this.rotateY = 0, this.rotateZ = 0,
        this.scaleX = 1, this.scaleY = 1, this.scaleZ = 1,
        this.x = 0, this.y = 0, this.z = 0
    },
    fn = Mesh.prototype,
    fn.getGeometry = function getGeometry() { MoGL.isAlive(this);
        return this._scene ? this._geometry : null
    },
    fn.getMaterial = function getMaterial() { MoGL.isAlive(this);
        return this._scene ? this._material : null
    },
    fn.getMatrix = function getMatrix() { MoGL.isAlive(this);
        Matrix.identity(this._matrix)
        F3[0] = this.scaleX, F3[1] = this.scaleY, F3[2] = this.scaleZ
        Matrix.scale(this._matrix, this._matrix, F3)
        Matrix.rotateX(this._matrix, this._matrix, this.rotateX)
        Matrix.rotateY(this._matrix, this._matrix, this.rotateY)
        Matrix.rotateZ(this._matrix, this._matrix, this.rotateZ)
        F3[0] = this.x, F3[1] = this.y, F3[2] = this.z
        Matrix.translate(this._matrix, this._matrix, F3)
        return this._matrix
    },
    fn.getParent = function getParent() { MoGL.isAlive(this);
        return this._parent ? this._parent : null
    },
    fn.getPosition = function getPosition() { MoGL.isAlive(this);
        return F3[0] = this.x, F3[1] = this.y, F3[2] = this.z, F3
    },
    fn.getRotate = function getRotate() { MoGL.isAlive(this);
        return F3[0] = this.rotateX, F3[1] = this.rotateY, F3[2] = this.rotateZ, F3
    },
    fn.getScale = function getScale() { MoGL.isAlive(this);
        return F3[0] = this.scaleX, F3[1] = this.scaleY, F3[2] = this.scaleZ, F3
    },
    ///////////////////////////////////////////////////
    // set
    fn.setGeometry = function setGeometry(geometry) { MoGL.isAlive(this);
        if (!(geometry instanceof Geometry || typeof geometry == 'string')) MoGL.error('Mesh', 'setGeometry', 0)
        if (this._scene) {
            if (this._geometry = typeof geometry == 'string') this._geometry = this._scene._geometrys[geometry]
            else this._geometry = geometry
            this._geometry._key = this._geometry._key || geometry
        }
        else this._geometry = geometry
        return this
    },
    fn.setMaterial = function setMaterial(material) { MoGL.isAlive(this);
        if (!(material instanceof Material || typeof material == 'string')) MoGL.error('Mesh', 'setMaterial', 0)
        if (this._scene) {
            if (this._material = typeof material == 'string') this._material = this._scene._materials[material]
            else this._material = material
            this._material._key = this._material._key || material
        }
        else this._material = material
        return this
    },
    fn.lookAt = function looAt(x,y,z){MoGL.isAlive(this);
        Matrix.identity(this._matrix),
        F3[0] = this.x, F3[1] = this.y, F3[2] = this.z,
        F3_2[0] = x, F3_2[1] = y, F3_2[2] = z,
        Matrix.lookAt(this._matrix, F3, F3_2, [0, 1, 0]),
        Matrix.translate(this._matrix, this._matrix, F3)

        var d = this._matrix;
        var d11 = d[0], d12 = d[1], d13 = d[2], d21 = d[4], d22 = d[5], d23 = d[6], d31 = d[8], d32 = d[9], d33 = d[10];
        var radianX, radianY, radianZ;
        var md31 = -d31;

        if (md31 <= -1) radianY = -Math.PI * 0.5;
        else if (1 <= md31) radianY = Math.PI * 0.5;
        else radianY = Math.asin(md31);
        var cosY = Math.cos(radianY);
        if (cosY <= 0.001) radianZ = 0, radianX = Math.atan2(-d23, d22)
        else radianZ = Math.atan2(d21, d11), radianX = Math.atan2(d32, d33)
        this.rotateX = radianX,
        this.rotateY = radianY
        this.rotateZ = radianZ
        //var dx = x - this.x;
        //var dy = y - this.y;
        //var dz = z - this.z;
        //this.rotationX = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) - Math.PI / 2;
        //this.rotationY = 0;
        //this.rotationZ = -Math.atan2(dx, dy);
    },
    fn.setPosition = function setPosition() { MoGL.isAlive(this);
        var len, arg0;
        len = arguments.length, arg0 = arguments[0];
        if (len == 1 && arg0 instanceof Array) this.x = arg0[0], this.y = arg0[1], this.z = arg0[2];
        else if (len > 2) this.x = arguments[0], this.y = arguments[1], this.z = arguments[2];
        else this.x = 0, this.y = 0, this.z = 0;
        return this;
    },
    fn.setRotate = function setRotate() { MoGL.isAlive(this);
        var len, arg0;
        len = arguments.length, arg0 = arguments[0];
        if (len == 1 && arg0 instanceof Array) this.rotateX = arg0[0], this.rotateY = arg0[1], this.rotateZ = arg0[2];
        else if (len > 2) this.rotateX = arguments[0], this.rotateY = arguments[1], this.rotateZ = arguments[2];
        else this.rotateX = 0, this.rotateY = 0, this.rotateZ = 0;
        return this;
    },
    fn.setScale = function setScale() { MoGL.isAlive(this);
        var len, arg0;
        len = arguments.length, arg0 = arguments[0];
        if (len == 1 && arg0 instanceof Array) this.scaleX = arg0[0], this.scaleY = arg0[1], this.scaleZ = arg0[2];
        else if (len > 2) this.scaleX = arguments[0], this.scaleY = arguments[1], this.scaleZ = arguments[2];
        else this.scaleX = 1, this.scaleY = 1, this.scaleZ = 1;
        return this;
    }
    return MoGL.ext(Mesh, MoGL);
})();