/**
 * Created by redcamel on 2015-05-08.
 */
// TODO 기본으로 버텍스좌표, 노말좌표 정도까지는 알아야되는겐가?
var Primitive = (function () {
    var mS = Math.sin, mC = Math.cos, PI = Math.PI, RADIAN = PI / 180, mSqt = Math.sqrt
    return {
        cube: function cube(/*splitX:int, splitY:int, splitZ:int*/) {
            // TODO 내장된 Geometry. 각 정육면체 구조를 생성함.
            // TODO ?splitX:int, splitY:int, splitZ:int - 각 면당 분할할 수. 생략시 1로 지정됨.
            // TODO scene.addChild( 'cube1', new Mesh( Primitive.cube( 2, 3, 1 ), new Material() );
            var result
            return result // TODO  어떤 지오메트리를 넘겨주는군
        },
        geodesic: function geodesic(/*split*/) {
            // TODO 내장된 Geometry. 극점에서 폴리곤이 몰리지 않도록 Geodesic 형태로 생성되는 구의 구조.
            // TODO ?split:int - 쪼개질 다각형의 갯수. 생략하거나 30이하의 값이 오면 30이 됨.
            // TODO scene.addChild( 'geo0', new Mesh( Primitive.geodesic(30), new Material() );
            var result
            return result
        },
        line: function line(x1, y1, z1, x2, y2, z2 /*,width:number*/) {
            // TODO 내장된 Geometry. 두 점을 지나는 직선.
            // TODO x1:number, y1, z1, x2, y2, z2 - 직선이 지나갈 두점(x1, y1, z1 에서 x2, y2, z2)
            // TODO ?width:number - 직선의 두께. 생략하면 1.
            // TODO scene.addChild( 'l', new Mesh( Primitive.line( 0,0,0, 10,10,10, 2 ), new Material() );
            var result
            return result
        },
        plane: function plane(/*splitX:int, splitY:int*/) {
            //TODO 이걸 계산해서 넘겨야 되는군
            var vs, is
            vs = [
                1.0, 1.0, 0.0,// 0.0, 0.0,
                -1.0, 1.0, 0.0, //1.0, 0.0,
                1.0, -1.0, 0.0, //0.0, 1.0,
                -1.0, -1.0, 0.0//, //1.0, 1.0
            ]
            is = [0, 1, 2, 1, 2, 3]


            var result = new Geometry(vs, is, [Vertex.x, Vertex.y, Vertex.z])
            result._key = 'plane_' + ( arguments[0] || 1) + '_' + (arguments[1] || 1)
            return result
        },
        point: function point(/*width:number*/) {
            // TODO 내장된 Geometry. 하나의 점을 나타내는 구조.
            // TODO ?width:number - 점의 지름. 생략하면 1.
            // TODO scene.addChild( 'p', new Mesh( Primitive.point(5), new Material() );
            var result
            return result
        },
        sphere: function sphere(/*split:int*/) {
            // TODO 헉!! 노말도 계산해서 넘겨야되!!!
            var vertices = [];
            var indices = [];

            var latitudeBands = 8;
            var longitudeBands = 8;
            var radius = 1.0;

            for (var latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
                var theta = latNumber * Math.PI / latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var longNumber = 0; longNumber <= longitudeBands; ++ longNumber) {
                    var phi = longNumber * 2 * Math.PI / longitudeBands;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - longNumber / longitudeBands;
                    var v = 1 - latNumber / latitudeBands;
                    vertices.push(radius * x, radius * y, radius * z,u, v);
                }
            }

            for (latNumber = 0; latNumber < latitudeBands; ++latNumber) {
                for (longNumber = 0; longNumber < longitudeBands; ++ longNumber) {
                    var first = latNumber * (longitudeBands + 1) + longNumber;
                    var second = first + longitudeBands + 1;
                    indices.push(second, first, first + 1, second + 1, second, first + 1);
                }
            }

            var result = new Geometry(vertices, indices, [Vertex.x, Vertex.y, Vertex.z, Vertex.u, Vertex.v])
            result._key = 'sphere_' + ( arguments[0] || 1)
            return result
        },
        skybox: function skybox(/*splitX:int, splitY:int, splitZ:int*/) {
            // TODO 내장된 Geometry. 큐브형태의 구조로 각 평면이 내부를 바라보도록 되어있음.
            // TODO ?splitX:int, splitY:int, splitZ:int - 각 면당 분할할 수. 생략시 1로 지정됨.
            // TODO scene.addChild( 'box', new Mesh( Primitive.skybox( 5, 5, 5 ), new Material() );
            var result
            return result
        },
        polygon: function polygon(n, radius) {
            if (n < 3) MoGL.error('Primitive', 'polygon', 0);
            var perAngle = Math.PI*2/(n-1)
            var vs = [0,0,0,0.5,0.5],is = [],i
            for(i =0; i<n; i++){
                vs.push(mS(perAngle*i),mC(perAngle*i),0,  -mS(perAngle*i)/2+0.5,-mC(perAngle*i)/2+0.5)
            }
            for (i = 0; i < n-1; i++) {
                is.push(0, i + 1, i  + 2)
            }
            var result = new Geometry(vs, is, [Vertex.x, Vertex.y, Vertex.z, Vertex.u, Vertex.v]);
            result._key = 'polygon_' + (arguments[0] || 1);
            return result;
        }
    }
})();
