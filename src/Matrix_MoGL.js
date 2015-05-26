var Matrix = (function () {
    var Matrix, fn;
    var GLMAT_EPSILON = 0.000001;
    var temp = new Float32Array(16)
    var SQRT = Math.sqrt, SIN = Math.sin, COS = Math.cos, ABS = Math.abs;
    Matrix = function Matrix() {
        this.matIdentity()
    }
    fn = Matrix.prototype,
        /*
         return this
         */
        fn.matIdentity = function matIdentity() {
            this[0] = 1, this[1] = 0, this[2] = 0, this[3] = 0, this[4] = 0, this[5] = 1, this[6] = 0, this[7] = 0, this[8] = 0, this[9] = 0, this[10] = 1, this[11] = 0, this[12] = 0, this[13] = 0, this[14] = 0, this[15] = 1;
            return this;
        },
        /*
         행렬의 rawData를 기반으로 새로운 행렬 생성
         return Matrix
         */
        fn.matClone = function matClone() {
            var a, out;
            a = this,
            out = new Matrix(),
            out[0] = a[0], out[1] = a[1], out[2] = a[2], out[3] = a[3], out[4] = a[4], out[5] = a[5], out[6] = a[6], out[7] = a[7], out[8] = a[8], out[9] = a[9], out[10] = a[10], out[11] = a[11], out[12] = a[12], out[13] = a[13], out[14] = a[14], out[15] = a[15]
            return out;
        },
        /*
         행렬의 모든 rawData를 대상 객체에 복사
         return this
         */
        fn.matCopy = function matCopy(t) {
            var a = this;
            t[0] = a[0], t[1] = a[1], t[2] = a[2], t[3] = a[3], t[4] = a[4], t[5] = a[5], t[6] = a[6], t[7] = a[7], t[8] = a[8], t[9] = a[9], t[10] = a[10], t[11] = a[11], t[12] = a[12], t[13] = a[13], t[14] = a[14], t[15] = a[15];
            return this;
        },
        /*
         현재 행렬을 반전된 행렬로 변환
         return this
         */
        fn.matInvert = function matInvert() {
            var a = this;
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32,
            // Calculate the determinant
                det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
            if (!det) return null
            det = 1.0 / det, temp[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det, temp[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det, temp[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det, temp[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det, temp[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det, temp[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det, temp[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det, temp[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det, temp[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det, temp[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det, temp[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det, temp[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det, temp[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det, temp[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det, temp[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det, temp[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
            this.matCopy(temp)
            return this;
        },
        /*
         현재 행렬과 입력된 행렬의 곱
         return this
         */
        fn.matMultiply = function matMultiply(t) {
            var a = this
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
            var a = this;
            a[12] = a[0] * x + a[4] * y + a[8] * z + a[12], a[13] = a[1] * x + a[5] * y + a[9] * z + a[13], a[14] = a[2] * x + a[6] * y + a[10] * z + a[14], a[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
            return this;
        },
        /*
         x,y,z축으로 확대
         return this
         */
        fn.matScale = function matScale(x, y, z) {
            var a = this;
            a[0] = a[0] * x, a[1] = a[1] * x, a[2] = a[2] * x, a[3] = a[3] * x, a[4] = a[4] * y, a[5] = a[5] * y, a[6] = a[6] * y, a[7] = a[7] * y, a[8] = a[8] * z, a[9] = a[9] * z, a[10] = a[10] * z, a[11] = a[11] * z, a[12] = a[12], a[13] = a[13], a[14] = a[14], a[15] = a[15];
            return this
        },
        /*
         x축기준 회전
         */
        fn.matRotateX = function matRotateX(rad) {
            var a = this, s = SIN(rad), c = COS(rad), a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            a[4] = a10 * c + a20 * s, a[5] = a11 * c + a21 * s, a[6] = a12 * c + a22 * s, a[7] = a13 * c + a23 * s, a[8] = a20 * c - a10 * s, a[9] = a21 * c - a11 * s, a[10] = a22 * c - a12 * s, a[11] = a23 * c - a13 * s;
            return this;
        },
        /*
         y축기준 회전
         */
        fn.matRotateY = function matRotateY(rad) {
            var a = this, s = SIN(rad), c = COS(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
            a[0] = a00 * c - a20 * s, a[1] = a01 * c - a21 * s, a[2] = a02 * c - a22 * s, a[3] = a03 * c - a23 * s, a[8] = a00 * s + a20 * c, a[9] = a01 * s + a21 * c, a[10] = a02 * s + a22 * c, a[11] = a03 * s + a23 * c;
            return this;
        },
        /*
         Z축기준 회전
         */
        fn.matRotateZ = function matRotateZ(rad) {
            var a = this, s = SIN(rad), c = COS(rad), a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
            a[0] = a00 * c + a10 * s, a[1] = a01 * c + a11 * s, a[2] = a02 * c + a12 * s, a[3] = a03 * c + a13 * s, a[4] = a10 * c - a00 * s, a[5] = a11 * c - a01 * s, a[6] = a12 * c - a02 * s, a[7] = a13 * c - a03 * s;
            return this;
        },
        /*
         axis를 기준으로 한 증분회전
         */
        fn.matRotate = function matRotate(rad, axis) {
            var a = this
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
            var f = this;
            var h = b - a, i = d - c, j = g - e;
            f[0] = e * 2 / h, f[1] = 0, f[2] = 0, f[3] = 0, f[4] = 0, f[5] = e * 2 / i, f[6] = 0, f[7] = 0, f[8] = (b + a) / h, f[9] = (d + c) / i, f[10] = -(g + e) / j, f[11] = -1, f[12] = 0, f[13] = 0, f[14] = -(g * e * 2) / j, f[15] = 0
            return this
        },
        /*
         퍼스펙티브 행렬반환
         */
        fn.matPerspective = function matPerspective(fov, aspect, near, far, out) {
            fov = near * Math.tan(fov * Math.PI / 360),
            aspect = fov * aspect,
            this._frustum(-aspect, aspect, -fov, fov, near, far, out)
            return this
        },
        fn.matStr = function matStr() {
            var a = this
            return 'Matrix(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' +
                a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
        };
    return MoGL.ext(Matrix, MoGL);
})();
