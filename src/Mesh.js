/**
 * Created by redcamel on 2015-05-04.
 * description
 기하구조와 재질을 포함할 수 있는 하나의 렌더링 단위인 Mesh를 생성함.
 Mesh는 장면 내에 아핀변환에 대응하는 행렬정보를 갖음. 이에 따라 비가시객체인 Camera 등도 Mesh를 상속하게 됨.
 id를 인자로 지정하면 Scene에 addChild하는 순간 id를 바인딩하며 실패하면 등록되지 않음.
 객체를 인자로 지정하면 Scene에 addChild하는 순간 Mesh내부의 Geometry나 Material이 임의의 id로 자동등록되며, shader Id가 존재하지 않으면 예외가 발생함( addChild 참조 )
 */
var Mesh = (function () {
    var Mesh, fn, f3 = new Float32Array(3);
    var SQRT = Math.sqrt, ATAN2 = Math.atan2, ASIN = Math.asin, COS = Math.cos, PIH = Math.PI * 0.5, PERPI = 180 / Math.PI
    Mesh = function Mesh(geometry, material) {
        // TODO 어디까지 허용할건가..
        if( geometry && !(typeof geometry =='string' || geometry instanceof Geometry  ) ) MoGL.error('Mesh','contructor',0)
        if( material && !(typeof material =='string' || material instanceof Material  ) ) MoGL.error('Mesh','contructor',1)
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
        //console.log('실행되면안됨')
        Matrix.identity(this._matrix)
        f3[0] = this.scaleX,f3[1] = this.scaleY,f3[2] = this.scaleZ
        Matrix.scale(this._matrix,this._matrix,f3)
        Matrix.rotateX(this._matrix,this._matrix,this.rotateX)
        Matrix.rotateY(this._matrix,this._matrix,this.rotateY)
        Matrix.rotateZ(this._matrix,this._matrix,this.rotateZ)
        f3[0] = this.x,f3[1] = this.y,f3[2] = this.z
        Matrix.translate(this._matrix,this._matrix,f3)
        return this._matrix
    },
    fn.getParent = function getParent() { MoGL.isAlive(this);
        return this._parent ? this._parent : null
    },
    fn.getPosition = function getPosition() { MoGL.isAlive(this);
        return f3[0] = this.x, f3[1] = this.y, f3[2] = this.z, f3
    },
    fn.getRotate = function getRotate() { MoGL.isAlive(this);
        return f3[0] = this.rotateX, f3[1] = this.rotateY, f3[2] = this.rotateZ, f3
    },
    fn.getScale = function getScale() { MoGL.isAlive(this);
        return f3[0] = this.scaleX, f3[1] = this.scaleY, f3[2] = this.scaleZ, f3
    },
    ///////////////////////////////////////////////////
    // set
    fn.setGeometry = function setGeometry(geometry) { MoGL.isAlive(this);
        if (!(geometry instanceof Geometry || typeof geometry == 'string')) MoGL.error('Mesh', 'setGeometry', 0)
        if (this._scene) {
            if (this._geometry = typeof geometry == 'string') this._geometry=this._scene._geometrys[geometry]
            else this._geometry = geometry
            this._geometry._key =   this._geometry._key || geometry
        }
        else this._geometry = geometry
        return this
    },
    fn.setMaterial = function setMaterial(material) { MoGL.isAlive(this);
        if (!(material instanceof Material || typeof material == 'string')) MoGL.error('Mesh', 'setMaterial', 0)
        if (this._scene) {
            if (this._material = typeof material == 'string') this._material= this._scene._materials[material]
            else this._material = material
            this._material._key = this._material._key || material
        }
        else this._material = material
        return this
    },

        fn.setPosition = function setPosition() { MoGL.isAlive(this);
            var len = arguments.length, arg0 = arguments[0];
            if(len == 1 && arg0 instanceof Array) this.x = arg0[0], this.y = arg0[1], this.z = arg0[2];
            else if(len > 2) this.x = arguments[0], this.y = arguments[1], this.z = arguments[2];
            else this.x = 0, this.y = 0, this.z = 0;
            return this;
        },
        fn.setRotate = function setRotate() { MoGL.isAlive(this);
            var len = arguments.length, arg0 = arguments[0];
            if(len == 1 && arg0 instanceof Array) this.rotateX = arg0[0], this.rotateY = arg0[1], this.rotateZ = arg0[2];
            else if(len > 2) this.rotateX = arguments[0], this.rotateY = arguments[1], this.rotateZ = arguments[2];
            else this.rotateX = 0, this.rotateY = 0, this.rotateZ = 0;
            return this;
        },
        fn.setScale = function setScale() { MoGL.isAlive(this);
            var len = arguments.length, arg0 = arguments[0];
            if(len == 1 && arg0 instanceof Array) this.scaleX = arg0[0], this.scaleY = arg0[1], this.scaleZ = arg0[2];
            else if(len > 2) this.scaleX = arguments[0], this.scaleY = arguments[1], this.scaleZ = arguments[2];
            else this.scaleX = 1, this.scaleY = 1, this.scaleZ = 1;
            return this;
        }
    return MoGL.ext(Mesh, MoGL);
})();