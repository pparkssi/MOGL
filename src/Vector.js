/**
 * Created by redcamel on 2015-05-30.
 */
var Vector = (function () {
    var Vector, fn;
    var SQRT = Math.sqrt, SIN = Math.sin, COS = Math.cos, ABS = Math.abs;
    Vector = function Vector(x, y, z) {
        if(x instanceof Float32Array) this._rawData = x;
        else if(Array.isArray(x)) this._rawData = new Float32Array(x);
        else this._rawData = new Float32Array([x || 0, y || 0, z || 0]);
    },
    fn = Vector.prototype,
    /*
     현재 Vector 객체의 x, y 및 z 요소 값에 대상 객체의 x,y,z값을 더합니다.
     */
    fn.add = function add(v) {
        var a = this._rawData;
        v = v._rawData || v;
        a[0] += v[0], a[1] += v[1], a[2] += v[2];
        return this;
    },
    /*
     현재 Vector 객체의 x, y 및 z 요소 값에 인자 x,y,z값을 더합니다.
     */
    fn.addXYZ = function addXYZ(x,y,z) {
        var a = this._rawData;
        a[0] += (x || 0), a[1] += (y || 0), a[2] += (z || 0);
        return this;
    },
    /*
     현재 Vector 객체의 x, y 및 z 요소 값을 다른 Vector 객체의 x, y 및 z 요소 값에서 뺍니다.
     */
    fn.subtract = function subtract(v) {
        var a = this._rawData;
        v = v._rawData || v;
        a[0] -= v[0], a[1] -= v[1], a[2] -= v[2];
        return this;
    },
    /*
     현재 Vector 객체의 x, y 및 z 요소 값을 다른 인자 x, y ,z 요소 값에서 뺍니다.
     */
    fn.subtractXYZ = function subtractXYZ(x,y,z) {
        var a = this._rawData;
        a[0] -= (x || 0), a[1] -= (y || 0), a[2] -= (z || 0);
        return this;
    },
    /*
     현재 Vector 객체의 크기를 스칼라 값만큼 조절합니다.
     */
    fn.scaleBy = function scaleBy(s) {
        var a = this._rawData;
        a[0] *= s, a[1] *= s, a[2] *= s;
        return this;
    },
    /*
     현재 벡터와 대상 벡터 객체 사이의 거리를 반환합니다.
     */
    fn.distance = function distance(v) {
        var a = this._rawData;
        v = v._rawData || v;
        var x = v[0] - a[0], y = v[1] - a[1], z = v[2] - a[2];
        return SQRT(x * x + y * y + z * z);
    },
    /*
     현재 Vector 객체를 역수로 설정합니다.
     */
    fn.negate = function negate() {
        var a = this._rawData;
        a[0] = -a[0], a[1] = -a[1], a[2] = -a[2];
        return this;
    },
    /*
     현재 Vector의 단위벡터화된 길이입니다.
     */
    fn.normalize = function normalize() {
        var a = this._rawData;
        var x = a[0], y = a[1], z = a[2];
        var len = x * x + y * y + z * z;
        if (len > 0) len = 1 / SQRT(len), a[0] *= len, a[1] *= len, a[2] *= len;
        return this;
    },
    /*
     내적값 반환
     */
    fn.dot = function (v) {
        var a = this._rawData;
        v = v._rawData || v;
        return a[0] * v[0] + a[1] * v[1] + a[2] * v[2];
    },
    /*
     두벡터에 수직인 벡터를 반환
     */
    fn.cross = function (v) {
        var a = this._rawData, out = new Float32Array([0, 0, 0]);
        v = v._rawData || v;
        var ax = a[0], ay = a[1], az = a[2], bx = v[0], by = v[1], bz = v[2];
        out[0] = ay * bz - az * by, out[1] = az * bx - ax * bz, out[2] = ax * by - ay * bx;
        return new Vector(out);
    };
    return MoGL.ext(Vector, Mesh);
})();