/**
 * Created by redcamel on 2015-05-05.
 */
'use strict'
var Scene = (function () {
    var canvas, context, makeVBO, makeVNBO, makeIBO, makeUVBO, makeProgram, vertexShaderParser, fragmentShaderParser, makeTexture, makeFrameBuffer,
        children, cameras, textures, materials, geometrys, vertexShaders, fragmentShaders, gpu, cvs,
        Scene, fn, fnProp;
    //lib
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    makeVBO = function makeVBO(gpu,geometry, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.vbo[geometry];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW),
        buffer.name = geometry,
        buffer.type = 'VBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.vbo[geometry] = buffer,
        console.log('VBO생성', gpu.vbo[geometry]);
        return gpu.vbo[geometry];
    },
    makeVNBO = function makeVNBO(gpu, geometry, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.vnbo[geometry];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW),
        buffer.name = geometry,
        buffer.type = 'VNBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.vnbo[geometry] = buffer,
        console.log('VNBO생성', gpu.vnbo[geometry]);
        return gpu.vnbo[geometry];
    },
    makeIBO = function makeIBO(gpu, geometry, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.ibo[geometry];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW),
        buffer.name = geometry,
        buffer.type = 'IBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.ibo[geometry] = buffer,
        console.log('IBO생성', gpu.ibo[geometry]);
        return gpu.ibo[geometry];
    },
    makeUVBO = function makeUVBO(gpu, geometry, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.uvbo[geometry];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
        buffer.name = geometry,
        buffer.type = 'UVBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.uvbo[geometry] = buffer,
        console.log('UVBO생성', gpu.uvbo[geometry]);
        return gpu.uvbo[geometry];
    },
    makeProgram = function makeProgram(gpu, name, vSource, fSource) {
        var gl, vShader, fShader, program, i,len,temp;
        gl = gpu.gl,
        vShader = vertexShaderParser(gpu,vSource.code),
        fShader = fragmentShaderParser(gpu,fSource.code),
        program = gl.createProgram(),
        gl.attachShader(program, vShader),
        gl.attachShader(program, fShader),
        gl.linkProgram(program),
        vShader.name = vSource.id,
        fShader.name = fSource.id,
        program.name = name;
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('프로그램 쉐이더 초기화 실패!' + this);
        }
        gl.useProgram(program);
        temp = vShader.attributes
        for (i = 0, len = temp.length; i < len; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, gpu.vbo['null']),
            gl.enableVertexAttribArray(program[temp[i]] = gl.getAttribLocation(program, temp[i])),
            gl.vertexAttribPointer(program[temp[i]], gpu.vbo['null'].stride, gl.FLOAT, false, 0, 0);
        }
        temp = vShader.uniforms
        i = temp.length;
        while (i--) {
            program[temp[i]] = gl.getUniformLocation(program, temp[i]);
        }
        temp = fShader.uniforms
        i = temp.length;
        while (i--) {
            program[temp[i]] = gl.getUniformLocation(program, temp[i]);
        }
        gpu.programs[name] = program;
        return program;
    },
    vertexShaderParser = function vertexShaderParser(gpu, source) {
        var gl, temp, i, resultStr, shader;
        gl = gpu.gl,
        shader = gl.createShader(gl.VERTEX_SHADER),
        shader.uniforms = [],
        shader.attributes = [],
        resultStr = "",
        temp = source.attributes,
        i = temp.length;
        while (i--) {
            resultStr += 'attribute ' + temp[i] + ';\n',
            shader.attributes.push(temp[i].split(' ')[1]);
        }
        temp = source.uniforms,
        i = temp.length;
        while (i--) {
            resultStr += 'uniform ' + temp[i] + ';\n',
            shader.uniforms.push(temp[i].split(' ')[1]);
        }
        temp = source.varyings,
        i = temp.length;
        while (i--) {
            resultStr += 'varying ' + temp[i] + ';\n';
        }
        resultStr += VertexShader.baseFunction,
        resultStr += 'void main(void){\n',
        resultStr += source.main + ';\n',
        resultStr += '}\n',
        //console.log(resultStr),
        gl.shaderSource(shader, resultStr),
        gl.compileShader(shader);
        return shader;
    },
    fragmentShaderParser = function fragmentShaderParser(gpu, source) {
        var gl, resultStr, i, temp, shader;
        gl = gpu.gl,
        shader = gl.createShader(gl.FRAGMENT_SHADER),
        shader.uniforms = [],
        resultStr = "";
        if (source.precision) {
            resultStr += 'precision ' + source.precision + ';\n';
        }
        else {
            resultStr += 'precision mediump float;\n';
        }
        temp = source.uniforms,
        i = temp.length;
        while (i--) {
            resultStr += 'uniform ' + temp[i] + ';\n',
            shader.uniforms.push(temp[i].split(' ')[1]);
        }
        temp = source.varyings,
        i = temp.length;
        while (i--) {
            resultStr += 'varying ' + temp[i] + ';\n';
        }
        resultStr += 'void main(void){\n',
        resultStr += source.main + ';\n',
        resultStr += '}\n',
        //console.log(resultStr),
        gl.shaderSource(shader, resultStr),
        gl.compileShader(shader);
        return shader;
    },
    makeTexture = function makeTexture(gpu, id, image/*,resizeType*/) {
        //TODO
        var texture
        return texture;
    },
    makeFrameBuffer = function makeFrameBuffer(gpu, camera) {
        var gl, texture, framebuffer, renderbuffer, tArea,cvs,cvsW,cvsH,pRatio;
        cvs = cvs[this],
        cvsW = cvs.width,
        cvsH= cvs.height,
        pRatio = window.devicePixelRatio
        if (camera.renderArea) {
            tArea = camera.renderArea
        } else {
            tArea = [0, 0, cvsW, cvsH]
        }

        gl = gpu.gl,
        framebuffer = gl.createFramebuffer(),
        framebuffer.x = tArea[0], framebuffer.y = tArea[1],
        framebuffer.width = tArea[2] * pRatio > cvsW ? cvsW : tArea[2] * pRatio,
        framebuffer.height = tArea[3] * pRatio > cvsH ? cvsH : tArea[3] * pRatio,
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer),
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height),
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0),
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer),
        gl.bindTexture(gl.TEXTURE_2D, null),
        gl.bindRenderbuffer(gl.RENDERBUFFER, null),
        gl.bindFramebuffer(gl.FRAMEBUFFER, null),
        gpu.framebuffers[camera] = {
            frameBuffer: framebuffer,
            texture: texture
        };
    },
    //private
    children = {},
    cameras = {},
    textures = {},
    materials = {},
    geometrys = {},
    vertexShaders = {},
    fragmentShaders = {},
    gpu = {},
    //shared private
    $setPrivate('Scene', {
    }),
    Scene = function Scene() {
        // for JS
        children[this] = {},
        cameras[this] = {},
        textures[this] = {},
        materials[this] = {},
        geometrys[this] = {},
        vertexShaders[this] = {},
        fragmentShaders[this] = {},
        // for GPU
        gpu[this] = {
            gl: null,
            vbo: {},
            vnbo: {},
            uvbo: {},
            ibo: {},
            programs: {},
            textures: {},
            framebuffers: {}
        }
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
        gl: {
            get: function glGet() {
                return gpu[this].gl
            },
            set: function glSet(v) {
                gpu[this].gl = v
            }
        },
        gpu : {
            get : $getter(gpu)
        },
        cameras: {get: $getter(cameras)},
        children : {
            get : $getter(children)
        },
        programs: {
            get: function programsGet() {
                return gpu[this].programs
            }
        }
    },
    fn._baseUpdate = function () {
        gpu[this].vbo['null'] = makeVBO(gpu[this], 'null', new Float32Array([0.0, 0.0, 0.0]), 3);
        if (!gpu[this].vbo['_FRAMERECT_']) {
            gpu[this].vbo['_FRAMERECT_'] = makeVBO(gpu[this], '_FRAMERECT_', [
                -1.0, 1.0, 0.0,
                1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0
            ], 3),
            gpu[this].uvbo['_FRAMERECT_'] = makeUVBO(gpu[this], '_FRAMERECT_', [
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                1.0, 1.0
            ], 2),
            gpu[this].ibo['_FRAMERECT_'] = makeIBO(gpu[this], '_FRAMERECT_', [0, 1, 2, 1, 2, 3], 1);
        }
        this._cameraUpdate()
        makeProgram(gpu[this], 'color', Shader.colorVertexShader, Shader.colorFragmentShader);
        makeProgram(gpu[this], 'wire', Shader.wireFrameVertexShader, Shader.wireFrameFragmentShader);
        makeProgram(gpu[this], 'bitmap', Shader.bitmapVertexShader, Shader.bitmapFragmentShader);
        makeProgram(gpu[this], 'bitmapGouraud', Shader.bitmapVertexShaderGouraud, Shader.bitmapFragmentShaderGouraud);
        makeProgram(gpu[this], 'colorGouraud', Shader.colorVertexShaderGouraud, Shader.colorFragmentShaderGouraud);
        makeProgram(gpu[this], 'colorPhong', Shader.colorVertexShaderPhong, Shader.colorFragmentShaderPhong);
        makeProgram(gpu[this], 'toonPhong', Shader.toonVertexShaderPhong, Shader.toonFragmentShaderPhong);
        makeProgram(gpu[this], 'bitmapPhong', Shader.bitmapVertexShaderPhong, Shader.bitmapFragmentShaderPhong);
        makeProgram(gpu[this], 'bitmapBlind', Shader.bitmapVertexShaderBlinn, Shader.bitmapFragmentShaderBlinn);
        makeProgram(gpu[this], 'postBase', Shader.postBaseVertexShader, Shader.postBaseFragmentShader);

        console.log('////////////////////////////////////////////'),
        console.log('Scene 업데이트'),
        console.log('gpu[this].vbo :', gpu[this].vbo),
        console.log('gpu[this].vnbo :', gpu[this].vnbo),
        console.log('gpu[this].ibo :', gpu[this].ibo),
        console.log('gpu[this].programs :', gpu[this].programs),
        console.log('geometrys[this] :', geometrys[this]),
        console.log('materials[this] :', materials[this]),
        console.log('textures[this] :', textures[this]),
        console.log('vertexShaders[this] :', vertexShaders[this]),
        console.log('fragmentShaders[this] :', fragmentShaders[this]),
        console.log('gpu[this].framebuffers :', gpu[this].framebuffers)
        //console.log('////////////////////////////////////////////'),
    },
    fn._cameraUpdate = function(){
        var p, k;
        p = cameras[this]
        for (k in p) {
            var camera, tRenderArea, tCVS;
            camera = p[k],
            tCVS = camera.cvs = cvs[this],
            tRenderArea = camera._renderArea;
            if (tRenderArea) {
                var wRatio = tRenderArea[2] / tCVS.width;
                var hRatio = tRenderArea[3] / tCVS.height;
                camera.setRenderArea(tRenderArea[0], tRenderArea[1], tCVS.width * wRatio, tCVS.height * hRatio);
            }
            camera.resetProjectionMatrix(),
            makeFrameBuffer(gpu[this],camera);
        }
    }
    fn.addMesh = function(v){
        var p = children[this],  geo;
        if (p[v]) this.error(0);
        if (!(v instanceof Mesh)) this.error(1);
        p[v] = v;
        v.scene = this
        //gpu
        p = gpu[this],
        geo = v.geometry
        if (geo) {
            if (!p.vbo[geo]) {
                p.vbo[geo] = makeVBO(p, geo, geo.position, 3),
                p.vnbo[geo] = makeVNBO(p, geo, geo.normal, 3),
                p.uvbo[geo] = makeUVBO(p, geo, geo.uv, 2),
                p.ibo[geo] = makeIBO(p, geo, geo.index, 1);
            }
        }
        return this;
    },
    fn.addCamera = function(v){
        var p = cameras[this];
        if (p[v]) this.error(0);
        if (!(v instanceof Camera)) this.error(1);
        p[v] = v;
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
        var p = materials[this];
        if (p[v]) this.error(0);
        if (!(v instanceof Material)) this.error(1);
        p[v] = v,
        v.scene = this;
        return this;
    },
    fn.addTexture = function addTexture(texture/*,resizeType*/) {
        var p = textures[this];
        if (p[id]) this.error(0);
        if (checkDraft(image)) this.error(1);
        function checkDraft(target) {
            if (target instanceof HTMLImageElement) return 0;
            if (target instanceof HTMLCanvasElement) return 0;
            if (target instanceof HTMLVideoElement) return 0;
            if (target instanceof ImageData) return 0;
            if (target['substring'] && target.substring(0, 10) == 'data:image' && target.indexOf('base64') > -1) return 0; // base64문자열 - urlData형식으로 지정된 base64문자열
            if (typeof target == 'string') return 0;
            // TODO 블랍은 어카지 -__;;;;;;;;;;;;;;;;;;;;;;;;실제 이미지를 포함하고 있는 Blob객체.
            return 1;
        }

        if (textures[id]) textures[id].webglTexture = makeTexture(this, id, image);
        else {
            textures[id] = {count: 0, last: 0, webglTexture: null, resizeType: arguments[2] || null},
                textures[id].webglTexture = makeTexture(this, id, image, arguments[2]);
            //console.log(textures),
            //console.log(id, image)
        }
        return this;
    },
    fn.addFragmentShader = function addFragmentShader(shader) {
        var p = fragmentShaders[this];
        if (p[shader.id]) this.error(0);
        p[shader.id] = shader;
        return this
    },
    fn.addVertexShader = function addVertexShader(shader) {
        console.log(Shader.colorFragmentShader)
        var p = vertexShaders[this];
        if (p[shader.id]) this.error(0);
        p[shader.id] = shader;
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