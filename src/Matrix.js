var Matrix = (function () {
    var Matrix, fn;
    var GLMAT_EPSILON = 0.000001;
    var temp = new Float32Array(16)
    var SQRT = Math.sqrt, SIN = Math.sin, COS = Math.cos, ABS = Math.abs;
    var vec3 = {};
    Matrix = function Matrix() {
        this._rowData = new Float32Array(16)
        this.matIdentity()
    }
    vec3.add = function add(out, a, b) {
        return out[0] = a[0] + b[0], out[1] = a[1] + b[1], out[2] = a[2] + b[2], out;
    },
    vec3.subtract = function subtract(out, a, b) {
        return out[0] = a[0] - b[0], out[1] = a[1] - b[1], out[2] = a[2] - b[2], out;
    },
    vec3.scaleBy = function scaleBy(out, a, b) {
        return out[0] = a[0] * b, out[1] = a[1] * b, out[2] = a[2] * b, out;
    },
    vec3.distance = function distance(a, b) {
        var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
        return SQRT(x * x + y * y + z * z);
    },
    vec3.negate = function negate(out, a) {
        return out[0] = -a[0], out[1] = -a[1], out[2] = -a[2], out;
    },
    /*
         단위벡터화
     */
    vec3.normalize = function normalize(out, a) {
        var x = a[0], y = a[1], z = a[2];
        var len = x * x + y * y + z * z;
        if (len > 0) len = 1 / SQRT(len), out[0] = a[0] * len, out[1] = a[1] * len, out[2] = a[2] * len;
        return out;
    },
    /*
        내적
     */
    vec3.dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },
    /*
        두벡터에 수직인 벡터
     */
    vec3.cross = function(out, a, b) {
        var ax = a[0], ay = a[1], az = a[2],bx = b[0], by = b[1], bz = b[2];
        return out[0] = ay * bz - az * by, out[1] = az * bx - ax * bz, out[2] = ax * by - ay * bx, out;
    },
    fn = Matrix.prototype,
    fn.vecAdd = vec3.add,
    fn.vecSubtract = vec3.subtract,
    fn.vecScaleBy = vec3.scaleBy,
    fn.vecDistance = vec3.distance,
    fn.vecNegate = vec3.negate,
    fn.vecNormalize = vec3.normalize,
    fn.vecDot = vec3.dot,
    fn.vecCross = vec3.cross,
    /*
     return this
     */
    fn.matIdentity = function matIdentity() {
        var a = this._rowData
        a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = 1, a[6] = 0, a[7] = 0, a[8] = 0, a[9] = 0, a[10] = 1, a[11] = 0, a[12] = 0, a[13] = 0, a[14] = 0, a[15] = 1;
        return this;
    },
    /*
     행렬의 rawData를 기반으로 새로운 행렬 생성
     return Matrix
     */
    fn.matClone = function matClone() {
        var a, b,out;
        a = this._rowData,
        out = new Matrix(),
        b = out._rowData
        b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], b[6] = a[6], b[7] = a[7], b[8] = a[8], b[9] = a[9], b[10] = a[10], b[11] = a[11], b[12] = a[12], b[13] = a[13], b[14] = a[14], b[15] = a[15]
        return out;
    },
    /*
     행렬의 모든 rawData를 대상 객체에 복사
     return this
     */
    fn.matCopy = function matCopy(t) {
        var a = this._rowData;
        t = t._rowData
        t[0] = a[0], t[1] = a[1], t[2] = a[2], t[3] = a[3], t[4] = a[4], t[5] = a[5], t[6] = a[6], t[7] = a[7], t[8] = a[8], t[9] = a[9], t[10] = a[10], t[11] = a[11], t[12] = a[12], t[13] = a[13], t[14] = a[14], t[15] = a[15];
        return this;
    },
    /*
     현재 행렬을 반전
     return this
     */
    fn.matInvert = function matInvert() {
        //TODO 이건문제가좀 있군?
        console.log('matInvert는 점검이 필요함')
        return this;
    },
    /*
     현재 행렬을 전치
     return this
     */
    fn.matTranspose = function matTranspose(t) {
        console.log('matTranspose는 점검이 필요함')
         return this;
    };
    /*
     현재 행렬과 입력된 행렬의 곱
     return this
     */
    fn.matMultiply = function matMultiply(t) {
        var a = this._rowData;
        t= t._rowData
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        var b0 = t[0], b1 = t[1], b2 = t[2], b3 = t[3];
        a[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, a[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, a[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, a[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
        b0 = t[4], b1 = t[5], b2 = t[6], b3 = t[7],
        a[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, a[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, a[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, a[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
        b0 = t[8], b1 = t[9], b2 = t[10], b3 = t[11],
        a[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, a[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, a[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, a[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33,
        b0 = t[12], b1 = t[13], b2 = t[14], b3 = t[15],
        a[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, a[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, a[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, a[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return this;
    },
    /*
     x,y,z축으로 평행이동
     return this
     */
    fn.matTranslate = function matTranslate(x, y, z) {
        var a = this._rowData;;
        a[12] = a[0] * x + a[4] * y + a[8] * z + a[12], a[13] = a[1] * x + a[5] * y + a[9] * z + a[13], a[14] = a[2] * x + a[6] * y + a[10] * z + a[14], a[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        return this;
    },
    /*
     x,y,z축으로 확대
     return this
     */
    fn.matScale = function matScale(x, y, z) {
        var a = this._rowData;;
        a[0] = a[0] * x, a[1] = a[1] * x, a[2] = a[2] * x, a[3] = a[3] * x, a[4] = a[4] * y, a[5] = a[5] * y, a[6] = a[6] * y, a[7] = a[7] * y, a[8] = a[8] * z, a[9] = a[9] * z, a[10] = a[10] * z, a[11] = a[11] * z, a[12] = a[12], a[13] = a[13], a[14] = a[14], a[15] = a[15];
        return this
    },
    /*
     x축기준 회전
     return this
     */
    fn.matRotateX = function matRotateX(rad) {
        var a = this._rowData, s = SIN(rad), c = COS(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        a[4] = a10 * c + a20 * s, a[5] = a11 * c + a21 * s, a[6] = a12 * c + a22 * s, a[7] = a13 * c + a23 * s, a[8] = a20 * c - a10 * s, a[9] = a21 * c - a11 * s, a[10] = a22 * c - a12 * s, a[11] = a23 * c - a13 * s;
        return this;
    },
    /*
     y축기준 회전
     return this
     */
    fn.matRotateY = function matRotateY(rad) {
        var a = this._rowData, s = SIN(rad), c = COS(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        a[0] = a00 * c - a20 * s, a[1] = a01 * c - a21 * s, a[2] = a02 * c - a22 * s, a[3] = a03 * c - a23 * s, a[8] = a00 * s + a20 * c, a[9] = a01 * s + a21 * c, a[10] = a02 * s + a22 * c, a[11] = a03 * s + a23 * c;
        return this;
    },
    /*
     Z축기준 회전
     return this
     */
    fn.matRotateZ = function matRotateZ(rad) {
        var a = this._rowData, s = SIN(rad), c = COS(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        a[0] = a00 * c + a10 * s, a[1] = a01 * c + a11 * s, a[2] = a02 * c + a12 * s, a[3] = a03 * c + a13 * s, a[4] = a10 * c - a00 * s, a[5] = a11 * c - a01 * s, a[6] = a12 * c - a02 * s, a[7] = a13 * c - a03 * s;
        return this;
    },
    /*
     axis를 기준으로 한 증분회전
     return this
     */
    fn.matRotate = function matRotate(rad, axis) {
        var a = this._rowData;
        var x = axis[0], y = axis[1], z = axis[2], len = SQRT(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
        if (ABS(len) < GLMAT_EPSILON) { return null; }
        len = 1 / len, x *= len, y *= len, z *= len,
        s = SIN(rad), c = COS(rad), t = 1 - c,
        a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s, b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s, b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c,
        a[0] = a00 * b00 + a10 * b01 + a20 * b02, a[1] = a01 * b00 + a11 * b01 + a21 * b02, a[2] = a02 * b00 + a12 * b01 + a22 * b02, a[3] = a03 * b00 + a13 * b01 + a23 * b02, a[4] = a00 * b10 + a10 * b11 + a20 * b12, a[5] = a01 * b10 + a11 * b11 + a21 * b12, a[6] = a02 * b10 + a12 * b11 + a22 * b12, a[7] = a03 * b10 + a13 * b11 + a23 * b12, a[8] = a00 * b20 + a10 * b21 + a20 * b22, a[9] = a01 * b20 + a11 * b21 + a21 * b22, a[10] = a02 * b20 + a12 * b21 + a22 * b22, a[11] = a03 * b20 + a13 * b21 + a23 * b22
        if (a !== a) a[12] = a[12], a[13] = a[13], a[14] = a[14], a[15] = a[15];
        return this
    },
    fn._frustum = function _frustum(a, b, c, d, e, g) {
        var f = this._rowData;
        var h = b - a, i = d - c, j = g - e;
        f[0] = e * 2 / h, f[1] = 0, f[2] = 0, f[3] = 0, f[4] = 0, f[5] = e * 2 / i, f[6] = 0, f[7] = 0, f[8] = (b + a) / h, f[9] = (d + c) / i, f[10] = -(g + e) / j, f[11] = -1, f[12] = 0, f[13] = 0, f[14] = -(g * e * 2) / j, f[15] = 0
        return this
    },
    /*
     퍼스펙티브 행렬반환
     return this
     */
    fn.matPerspective = function matPerspective(fov, aspect, near, far) {
        fov = near * Math.tan(fov * Math.PI / 360),
        aspect = fov * aspect,
        this._frustum(-aspect, aspect, -fov, fov, near, far)
        return this
    },
    fn.matLookAt = function matLookAt(eye, center, up) {
        var a = this._rowData;
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len, eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
        if (ABS(eyex - centerx) < GLMAT_EPSILON && ABS(eyey - centery) < GLMAT_EPSILON && ABS(eyez - centerz) < GLMAT_EPSILON) return this.matIdentity();
        z0 = eyex - centerx, z1 = eyey - centery, z2 = eyez - centerz, len = 1 / SQRT(z0 * z0 + z1 * z1 + z2 * z2), z0 *= len, z1 *= len, z2 *= len, x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0, len = SQRT(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) x0 = 0, x1 = 0, x2 = 0;
        else len = 1 / len, x0 *= len, x1 *= len, x2 *= len
        y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0, len = SQRT(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) y0 = 0, y1 = 0, y2 = 0;
        else len = 1 / len, y0 *= len, y1 *= len, y2 *= len;
        a[0] = x0, a[1] = y0, a[2] = z0, a[3] = 0,
            a[4] = x1, a[5] = y1, a[6] = z1, a[7] = 0,
            a[8] = x2, a[9] = y2, a[10] = z2, a[11] = 0,
            a[12] = -(x0 * eyex + x1 * eyey + x2 * eyez), a[13] = -(y0 * eyex + y1 * eyey + y2 * eyez), a[14] = -(z0 * eyex + z1 * eyey + z2 * eyez), a[15] = 1;
        return this;
    };
    fn.matStr = function matStr() {
        var a = this._rowData;
        return 'Matrix(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
            a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
            a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' +
            a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
    };
    return MoGL.ext(Matrix, MoGL);
})();
