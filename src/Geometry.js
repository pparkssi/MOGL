/**
 * Created by redcamel on 2015-05-05.
 * description
 정점배열과 인덱스 배열을 이용하여 기하구조를 정의함.
 생성자에서 지정된 버퍼 및 정보는 변경불가로 생성 이후는 읽기만 가능함.
 */
var Geometry = (function () {
    //그중에 자신의 4좌표랑 7uv랑 8rgba랑 9노말은 지오메트리거고
    var Geometry, fn;
    Geometry = function Geometry(vertex, index, info) {
        var i, len, t, t2,
            isVertexArrayFloat32 = vertex instanceof Float32Array,
            isIndexArrayUint16 = index instanceof Uint16Array;
        var isNotVertexProperty = function (propertyName) {
            return !Vertex.hasOwnProperty(propertyName);
        };

        if (!(Array.isArray(vertex) || isVertexArrayFloat32)) this.error(0);
        if (!(Array.isArray(index) || isIndexArrayUint16)) this.error(1);
        if (info && !Array.isArray(info)) this.error(3);
        if (Array.isArray(info) && info.some(isNotVertexProperty)) this.error(4);

        /////////////////////////////////////
        t = info ? info.length : 3;
        this._vertexCount = vertex.length / t,
            this._triangleCount = index.length / 3,
            this._vertexShaders = {},
            this._position = [],
            this._normal = [],
            this._uv = [],
            this._color = [],
            this._volume = null,
            this._key = null;

        if (info) {
            i = info.length;
            if (vertex.length % i) this.error(2);
            while (i--) info[info[i]] = i;
//console.log('info : ', info);

            ///////////////////////////////
            //TODO 노말,UV,컬러없을떄 판별
            for (i = 0, len = vertex.length / t; i < len; i++) {
                t2 = t * i,
                    this._position.push(vertex[t2 + info.x], vertex[t2 + info.y], vertex[t2 + info.z]),
                    info.normalX && info.normalY && info.normalZ ? this._normal.push(vertex[t2 + info.normalX], vertex[t2 + info.normalY], vertex[t2 + info.normalZ]) : 0,
                    info.u && info.v ? this._uv.push(vertex[t2 + info.u], vertex[t2 + info.v]) : 0,
                    info.r && info.g && info.b && info.a ? this._color.push(vertex[t2 + info.r], vertex[t2 + info.g], vertex[t2 + info.b], vertex[t2 + info.a]) : 0;
            }
            this._position = new Float32Array(this._position),
                this._uv = new Float32Array(this._uv),
                this._color = new Float32Array(this._color);
        } else this._position = isVertexArrayFloat32 ? vertex : new Float32Array(vertex);

        //TODO Uint32Array을 받아줄것인가! 고민해야됨..
        this._index = isIndexArrayUint16 ? index : new Uint16Array(index);
        if (this._normal.length == 0) this._normal = new Float32Array(calculateNormals(this._position, this._index));
        else this._normal = new Float32Array(this._normal);
        ///////////////////////////////
    };
    var calculateNormals = function calculateNormals(v, i) {
        var x = 0, y = 1, z = 2, j, k, len, mSqt = Math.sqrt, ns = [], v1 = [], v2 = [], n0 = [], n1 = [];
        for (j = 0, len = v.length; j < len; j++) ns[j] = 0.0;
        for (j = 0, len = i.length; j < len; j = j + 3) {
            v1 = [], v2 = [], n0 = [], v1[x] = v[3 * i[j + 1] + x] - v[3 * i[j] + x], v1[y] = v[3 * i[j + 1] + y] - v[3 * i[j] + y], v1[z] = v[3 * i[j + 1] + z] - v[3 * i[j] + z], v2[x] = v[3 * i[j + 2] + x] - v[3 * i[j + 1] + x], v2[y] = v[3 * i[j + 2] + y] - v[3 * i[j + 1] + y], v2[z] = v[3 * i[j + 2] + z] - v[3 * i[j + 1] + z], n0[x] = v1[y] * v2[z] - v1[z] * v2[y], n0[y] = v1[z] * v2[x] - v1[x] * v2[z], n0[z] = v1[x] * v2[y] - v1[y] * v2[x];
            for (k = 0; k < 3; k++) ns[3 * i[j + k] + x] = ns[3 * i[j + k] + x] + n0[x], ns[3 * i[j + k] + y] = ns[3 * i[j + k] + y] + n0[y], ns[3 * i[j + k] + z] = ns[3 * i[j + k] + z] + n0[z];
        }
        for (var i = 0, len = v.length; i < len; i = i + 3) {
            n1 = [], n1[x] = ns[i + x], n1[y] = ns[i + y], n1[z] = ns[i + z];
            var len = mSqt((n1[x] * n1[x]) + (n1[y] * n1[y]) + (n1[z] * n1[z]));
            if (len == 0) len = 0.00001;
            n1[x] = n1[x] / len, n1[y] = n1[y] / len, n1[z] = n1[z] / len, ns[i + x] = n1[x], ns[i + y] = n1[y], ns[i + z] = n1[z];
        }
        return ns;
    };
    fn = Geometry.prototype,
        fn.addVertexShader = function addVertexShader(id) {
            // TODO 마일스톤0.5
            this._vertexShaders[id] = id;
            return this;
        },
        fn.getVertexCount = function getVertexCount() {
            return this._vertexCount;
        },
        fn.getTriangleCount = function getTriangleCount() {
            return this._triangleCount;
        },
        fn.getVolume = function getVolume() {
            if (!this._volume) {
                var minX = 0, minY = 0, minZ = 0, maxX = 0, maxY = 0, maxZ = 0;
                var t0, t1, t2, t = this._position, i = t.length;
                while (i--) {
                    t0 = i * 3, t1 = t0 + 1, t2 = t0 + 2;
                    minX = t[t0] < minX ? t[t0] : minX,
                        maxX = t[t0] > maxX ? t[t0] : maxX,
                        minY = t[t1] < minY ? t[t1] : minY,
                        maxY = t[t1] > maxY ? t[t1] : maxY,
                        minZ = t[t2] < minZ ? t[t2] : minZ,
                        maxZ = t[t2] > maxZ ? t[t2] : maxZ;
                }
                this._volume = [maxX - minX, maxY - minY, maxZ - minZ];
            }
            return this._volume;
        },
        fn.removeVertexShader = function removeVertexShader(id) {
            // TODO 마일스톤0.5
            return delete this._vertexShaders[id], this;
        };
    return MoGL.ext(Geometry, MoGL);
})();