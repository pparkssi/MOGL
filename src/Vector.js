/**
 * Created by redcamel on 2015-05-30.
 */
var Vector = (function () {
    var Vector, fn;
    $setPrivate('Vector', {}),
    Vector = function Vector(x, y, z) {
        if (x instanceof Float32Array || Array.isArray(x)) {
            this.x = x[0], this.y = x[1], this.z = x[2]
        }
        else if (x == undefined) {
            this.x = this.y = this.z = 0
        } else {
            this.x = x, this.y = y, this.z = z
        }
    },
    fn = Vector.prototype,
    /*
     현재 Vector 객체의 x, y 및 z 요소 값에 대상 객체의 x,y,z값을 더합니다.
     */
    fn.add = function add(v) {
        var a = this;
        a.x += v.x, a.y += v.y, a.z += v.z;
        return this;
    },
    /*
     현재 Vector 객체의 x, y 및 z 요소 값에 인자 x,y,z값을 더합니다.
     */
    fn.addXYZ = function addXYZ(x, y, z) {
        var a = this;
        a.x += (x || 0), a.y += (y || 0), a.z += (z || 0);
        return this;
    },
    /*
     현재 Vector 객체의 x, y 및 z 요소 값을 다른 Vector 객체의 x, y 및 z 요소 값에서 뺍니다.
     */
    fn.subtract = function subtract(v) {
        var a = this;

        a.x -= v.x, a.y -= v.y, a.z -= v.z;
        return this;
    },
    /*
     현재 Vector 객체의 x, y 및 z 요소 값을 다른 인자 x, y ,z 요소 값에서 뺍니다.
     */
    fn.subtractXYZ = function subtractXYZ(x, y, z) {
        var a = this;
        a.x -= (x || 0), a.y -= (y || 0), a.z -= (z || 0);
        return this;
    },
    /*
     현재 Vector 객체의 크기를 스칼라 값만큼 조절합니다.
     */
    fn.scaleBy = function scaleBy(s) {
        var a = this;
        a.x *= s, a.y *= s, a.z *= s;
        return this;
    },
    /*
     현재 벡터와 대상 벡터 객체 사이의 거리를 반환합니다.
     */
    fn.distance = function distance(v) {
        var a = this;

        var x = v.x - a.x, y = v.y - a.y, z = v.z - a.z;
        return SQRT(x * x + y * y + z * z);
    },
    /*
     현재 Vector 객체를 역수로 설정합니다.
     */
    fn.negate = function negate() {
        var a = this;
        a.x = -a.x, a.y = -a.y, a.z = -a.z;
        return this;
    },
    /*
     현재 Vector의 단위벡터화된 길이입니다.
     */
    fn.normalize = function normalize() {
        var a = this;
        var x = a.x, y = a.y, z = a.z;
        var len = x * x + y * y + z * z;
        if (len > 0) len = 1 / SQRT(len), a.x *= len, a.y *= len, a.z *= len;
        return this;
    },
    /*
     내적값 반환
     */
    fn.dot = function (v) {
        var a = this;
        return a.x * v.x + a.y * v.y + a.z * v.z;
    },
    /*
     두벡터에 수직인 벡터를 반환
     */
    fn.cross = function (v) {
        var a = this, out = new Float32Array([0, 0, 0]);
        var ax = a.x, ay = a.y, az = a.z, bx = v.x, by = v.y, bz = v.z;
        out.x = ay * bz - az * by, out.y = az * bx - ax * bz, out.z = ax * by - ay * bx;
        return new Vector(out.x,out.y,out.z);
    };
    return MoGL.ext(Vector);
})();