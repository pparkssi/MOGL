/**
 * Created by redcamel on 2015-05-05.
 */
'use strict'
var Scene = (function () {
    var vertexShaderParser, fragmentShaderParser,
        children, cameras, textures, materials, geometrys, vertexShaders, fragmentShaders, cvsList,
        Scene, fn, fnProp;
    //lib

    // TODO 이놈은 등록하기 전에 코드만 가지게 변경
    vertexShaderParser = function vertexShaderParser(source) {
        var temp, i, resultStr;
        var code =  source.code
        var resultObject ={} ;
            resultObject.uniforms = [],
            resultObject.attributes = [],
            resultStr = "",
            temp = code.attributes,
            i = temp.length;
        while (i--) {
            resultStr += 'attribute ' + temp[i] + ';\n',
            resultObject.attributes.push(temp[i].split(' ')[1]);
        }
        temp = code.uniforms,
            i = temp.length;
        while (i--) {
            resultStr += 'uniform ' + temp[i] + ';\n',
            resultObject.uniforms.push(temp[i].split(' ')[1]);
        }
        temp = code.varyings,
            i = temp.length;
        while (i--) {
            resultStr += 'varying ' + temp[i] + ';\n';
        }
        resultStr += VertexShader.baseFunction,
        resultStr += 'void main(void){\n',
        resultStr += code.main + ';\n',
        resultStr += '}\n'
        resultObject.id = source.id
        resultObject.shaderStr = resultStr

        //var gl, temp, i, resultStr, shader;
        //gl = gpu.gl,
        //shader = gl.createShader(gl.VERTEX_SHADER),
        //shader.uniforms = [],
        //shader.attributes = [],
        //resultStr = "",
        //temp = source.attributes,
        //i = temp.length;
        //while (i--) {
        //    resultStr += 'attribute ' + temp[i] + ';\n',
        //    shader.attributes.push(temp[i].split(' ')[1]);
        //}
        //temp = source.uniforms,
        //i = temp.length;
        //while (i--) {
        //    resultStr += 'uniform ' + temp[i] + ';\n',
        //    shader.uniforms.push(temp[i].split(' ')[1]);
        //}
        //temp = source.varyings,
        //i = temp.length;
        //while (i--) {
        //    resultStr += 'varying ' + temp[i] + ';\n';
        //}
        //resultStr += VertexShader.baseFunction,
        //resultStr += 'void main(void){\n',
        //resultStr += source.main + ';\n',
        //resultStr += '}\n',
        ////console.log(resultStr),
        //gl.shaderSource(shader, resultStr),
        //gl.compileShader(shader);
        return resultObject;
    },
    fragmentShaderParser = function fragmentShaderParser(source) {
        var resultStr, i, temp, resultObject;
        var code =  source.code
        resultObject = {}
        resultObject.uniforms = [],
        resultStr = "";
        if (code.precision) {
            resultStr += 'precision ' + code.precision + ';\n';
        }
        else {
            resultStr += 'precision mediump float;\n';
        }
        temp = code.uniforms,
            i = temp.length;
        while (i--) {
            resultStr += 'uniform ' + temp[i] + ';\n',
            resultObject.uniforms.push(temp[i].split(' ')[1]);
        }
        temp = code.varyings,
            i = temp.length;
        while (i--) {
            resultStr += 'varying ' + temp[i] + ';\n';
        }
        resultStr += 'void main(void){\n',
        resultStr += code.main + ';\n',
        resultStr += '}\n'
        resultObject.id = source.id
        resultObject.shaderStr = resultStr
        //console.log(resultStr)

        //var gl, resultStr, i, temp, shader;
        //gl = gpu.gl,
        //shader = gl.createShader(gl.FRAGMENT_SHADER),
        //shader.uniforms = [],
        //resultStr = "";
        //if (source.precision) {
        //    resultStr += 'precision ' + source.precision + ';\n';
        //}
        //else {
        //    resultStr += 'precision mediump float;\n';
        //}
        //temp = source.uniforms,
        //i = temp.length;
        //while (i--) {
        //    resultStr += 'uniform ' + temp[i] + ';\n',
        //    shader.uniforms.push(temp[i].split(' ')[1]);
        //}
        //temp = source.varyings,
        //i = temp.length;
        //while (i--) {
        //    resultStr += 'varying ' + temp[i] + ';\n';
        //}
        //resultStr += 'void main(void){\n',
        //resultStr += source.main + ';\n',
        //resultStr += '}\n',
        ////console.log(resultStr),
        //gl.shaderSource(shader, resultStr),
        //gl.compileShader(shader);
        return resultObject;
    },

    //private
    cvsList = {},
    children = {},
    cameras = {},
    textures = {},
    materials = {},
    geometrys = {},
    vertexShaders = {},
    fragmentShaders = {},
    //shared private
    $setPrivate('Scene', {
    }),
    Scene = function Scene() {
        // for JS
        cvsList[this] = null,
        children[this] = {},
        cameras[this] = {},
        textures[this] = {},
        materials[this] = {},
        geometrys[this] = {},
        vertexShaders[this] = {},
        fragmentShaders[this] = {},

        this.addVertexShader(Shader.colorVertexShader),
        this.addFragmentShader(Shader.colorFragmentShader)
        this.addVertexShader(Shader.wireFrameVertexShader),
        this.addFragmentShader(Shader.wireFrameFragmentShader),
        this.addVertexShader(Shader.bitmapVertexShader),
        this.addFragmentShader(Shader.bitmapFragmentShader),
        this.addVertexShader(Shader.bitmapVertexShaderGouraud),
        this.addFragmentShader(Shader.bitmapFragmentShaderGouraud),
        this.addVertexShader(Shader.colorVertexShaderGouraud),
        this.addFragmentShader(Shader.colorFragmentShaderGouraud),
        this.addVertexShader(Shader.colorVertexShaderPhong),
        this.addFragmentShader(Shader.colorFragmentShaderPhong),
        this.addVertexShader(Shader.toonVertexShaderPhong),
        this.addFragmentShader(Shader.toonFragmentShaderPhong),
        this.addVertexShader(Shader.bitmapVertexShaderPhong),
        this.addFragmentShader(Shader.bitmapFragmentShaderPhong),
        this.addVertexShader(Shader.bitmapVertexShaderBlinn),
        this.addFragmentShader(Shader.bitmapFragmentShaderBlinn),
        this.addVertexShader(Shader.postBaseVertexShader),
        this.addFragmentShader(Shader.postBaseFragmentShader);

    };

    fn = Scene.prototype,
    fnProp = {
        cvs : {
            get : $getter(cvsList),
            set : $setter(cvsList)
        },
        vertexShaders : { get : $getter(vertexShaders)},
        fragmentShaders : { get : $getter(fragmentShaders)},
        cameras: {get: $getter(cameras)},
        children : {
            get : $getter(children)
        }
    },
    fn.cameraUpdate = function(){
        var p, k;
        p = cameras[this]
        for (k in p) {
            var camera, tRenderArea, cvs;
            camera = p[k],
            cvs = camera.cvs = cvsList[this]
            if(!cvs) return
            tRenderArea = camera.renderArea;
            if (tRenderArea) {
                var wRatio = tRenderArea[2] / cvs.width;
                var hRatio = tRenderArea[3] / cvs.height;
                camera.setRenderArea(tRenderArea[0], tRenderArea[1], cvs.width * wRatio, cvs.height * hRatio);
            }
            camera.resetProjectionMatrix()
                //TODO 고쳐
            //makeFrameBuffer(gpu[this],camera);
        }
    }
    fn.addMesh = function(v){
        var p = children[this], geo,mat;
        if (p[v]) this.error(0);
        if (!(v instanceof Mesh)) this.error(1);
        p[v] = v;
        v.scene = this
        //TODO 고쳐
        //gpu
        //p = gpu[this],
        //geo = v.geometry
        //if (geo) {
        //    if (!p.vbo[geo]) {
        //        p.vbo[geo] = makeVBO(p, geo, geo.position, 3),
        //        p.vnbo[geo] = makeVNBO(p, geo, geo.normal, 3),
        //        p.uvbo[geo] = makeUVBO(p, geo, geo.uv, 2),
        //        p.ibo[geo] = makeIBO(p, geo, geo.index, 1);
        //    }
        //}

        mat = v.material
        mat.addEventListener(Material.changed,function(){
            var t= this.diffuse
            if(t){
                var i = t.length
                while(i--){
                    console.log('로딩체크',t[i].tex.isLoaded)
                    if(t[i].tex.isLoaded){
                        //TODO 고쳐
                        //makeTexture(p,t[i].tex)
                    }
                }
            }
        })
        mat.dispatch(Material.changed,mat)
        return this;
    },
    fn.addCamera = function(v){
        var p = cameras[this];
        if (p[v]) this.error(0);
        if (!(v instanceof Camera)) this.error(1);
        p[v] = v;
        v.cvs = cvsList[this]
        this.cameraUpdate()
        return this;
    },
    fn.addChild = function addChild(v) {
        if(v instanceof Mesh)  this.addMesh(v)
        else if(v instanceof Camera)  this.addCamera(v)
        else this.error(0)
        return this;
    },
    fn.addGeometry = function (v) {
        var p = geometrys[this];
        if (p[v]) this.error(0);
        if (!(v instanceof Geometry)) this.error(1);
        p[v] = v;
        return this;
    },
    fn.addMaterial = function (v) {
        var p = materials[this],self,i;
        if (p[v]) this.error(0);
        if (!(v instanceof Material)) this.error(1);
        p[v] = v,
        v.scene = this;
        return this;
    },
    fn.addTexture = function addTexture(texture/*,resizeType*/) {
        //TODO
        return this;
    },
    fn.addFragmentShader = function addFragmentShader(shader) {
        var p = fragmentShaders[this];
        if (p[shader.id]) this.error(0);
        p[shader.id] = fragmentShaderParser(shader);;
        //console.log( p[shader.id] )
        return this
    },
    fn.addVertexShader = function addVertexShader(shader) {
        var p = vertexShaders[this];
        if (p[shader.id]) this.error(0);
        p[shader.id] = vertexShaderParser(shader);
        //console.log( p[shader.id] )
        return this
    },
    ///////////////////////////////////////////////////////////////////////////
    // Get
    fn.getMesh = function (id) {
        var p = children[this],k;
        for(k in p){
            if(p[k].id == id){
                return p[k]
            }
        }
        return null
    },
    fn.getCamera = function (id) {
        var p = cameras[this],k;
        for(k in p){
            if(p[k].id == id){
                return p[k]
            }
        }
        return null
    },
    fn.getChild = function (id) {
        var t;
        if(t = this.getMesh(id)) return t
        if(t = this.getCamera(id)) return t
        return null
    },
    fn.getGeometry = function (id) {
        var p = geometrys[this],k;
        for(k in p){
            if(p[k].id == id){
                return p[k]
            }
        }
        return null
    },
    fn.getMaterial = function (id) {
        var p = materials[this],k;
        for(k in p){
            if(p[k].id == id){
                return p[k]
            }
        }
        return null
    },
    fn.getTexture = function (id) {
        var p = textures[this],k;
        for(k in p){
            if(p[k].id == id){
                return p[k]
            }
        }
        return null
    },
    //fn.getFragmentShader = function (id) {
    //    // TODO 마일스톤0.5
    //    return this._fragmentShaders[id];
    //},
    //fn.getVertexShader = function (id) {
    //    // TODO 마일스톤0.5
    //    return this._vertexShaders[id];
    //},
    ///////////////////////////////////////////////////////////////////////////
    // Remove
    fn.removeChild = function removeChild(id) {
        var p, k, result;
        p = children[this],
        result = false
        for (k in p) {
            if (p[k].id == id) {
                p[k].scene = null,
                delete p[k],
                result = true
            }
        }
        return result;
    },
    fn.removeGeometry = function removeGeometry(id) {
        var p, k, result;
        p = geometrys[this],
        result = false
        for (k in p) {
            if (p[k].id == id) {
                delete p[k],
                result = true
            }
        }
        return result;
    },
    fn.removeMaterial = function removeMaterial(id) {
        var p, k, result;
        p = materials[this],
            result = false
        for (k in p) {
            if (p[k].id == id) {
                delete p[k],
                result = true
            }
        }
        return result;
    },
    fn.removeTexture = function removeTexture(id) {
        var p, result;
        p = textures[this],
        result = false
        if(p[id] ){
            delete p[id],
            result = true
        }
        return result;
    }
    //fn.removeFragmentShader = function removeFragmentShader() {
    //    // TODO 마일스톤0.5
    //    return this;
    //},
    //fn.removeVertexShader = function VertexShader() {
    //    // TODO 마일스톤0.5
    //    return this;
    //}
    return MoGL.ext(Scene, MoGL,fnProp);
})();