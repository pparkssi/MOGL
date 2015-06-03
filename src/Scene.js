/**
 * Created by redcamel on 2015-05-05.
 */
'use strict'
var Scene = (function () {
    var canvas, context, makeVBO, makeVNBO, makeIBO, makeUVBO, makeProgram, vertexShaderParser, fragmentShaderParser, makeTexture, makeFrameBuffer,
        children, camera, textures, materials, geometrys, vertexShaders, fragmentShaders, gpu, cvs,
        Scene, fn;
    //lib
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    makeVBO = function makeVBO(name, data, stride) {
        var gl, buffer;
        gl = gpu[this].gl,
        buffer = gpu[this].vbos[name];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
            buffer.name = name,
            buffer.type = 'VBO',
            buffer.data = data,
            buffer.stride = stride,
            buffer.numItem = data.length / stride,
            gpu[this].vbos[name] = buffer,
            console.log('VBO생성', gpu[this].vbos[name]);
        return gpu[this].vbos[name];
    },
        makeVNBO = function makeVNBO(name, data, stride) {
            var gl, buffer;
            gl = gpu[this].gl,
                buffer = gpu[this].vnbos[name];
            if (buffer) return buffer;
            buffer = gl.createBuffer(),
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
                buffer.name = name,
                buffer.type = 'VNBO',
                buffer.data = data,
                buffer.stride = stride,
                buffer.numItem = data.length / stride,
                gpu[this].vnbos[name] = buffer,
                console.log('VNBO생성', gpu[this].vnbos[name]);
            return gpu[this].vnbos[name];
        },

        makeIBO = function makeIBO(name, data, stride) {
            var gl, buffer;
            gl = gpu[this].gl,
                buffer = gpu[this].ibos[name];
            if (buffer) return buffer;
            buffer = gl.createBuffer(),
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer),
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW),
                buffer.name = name,
                buffer.type = 'IBO',
                buffer.data = data,
                buffer.stride = stride,
                buffer.numItem = data.length / stride,
                gpu[this].ibos[name] = buffer,
                console.log('IBO생성', gpu[this].ibos[name]);
            return gpu[this].ibos[name];
        },
        makeUVBO = function makeUVBO(name, data, stride) {
            var gl, buffer;
            gl = gpu[this].gl, buffer = gpu[this].uvbos[name];
            if (buffer) return buffer;
            buffer = gl.createBuffer(),
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
                buffer.name = name,
                buffer.type = 'UVBO',
                buffer.data = data,
                buffer.stride = stride,
                buffer.numItem = data.length / stride,
                gpu[this].uvbos[name] = buffer,
                console.log('UVBO생성', gpu[this].uvbos[name]);
            return gpu[this].uvbos[name];
        },
        makeProgram = function makeProgram(name) {
            var gl, vShader, fShader, program, i;
            gl = gpu[this].gl,
                vShader = vertexShaderParser(gpu[this].vertexShaders[name]),
                fShader = fragmentShaderParser(gpu[this].fragmentShaders[name]),
                program = gl.createProgram(),
                gl.attachShader(program, vShader),
                gl.attachShader(program, fShader),
                gl.linkProgram(program),
                vShader.name = name + '_vertex', fShader.name = name + '_fragment', program.name = name;
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('프로그램 쉐이더 초기화 실패!' + this);
            gl.useProgram(program);
            for (i = 0; i < vShader.attributes.length; i++) {
                gl.bindBuffer(gl.ARRAY_BUFFER, gpu[this].vbos['null']),
                    gl.enableVertexAttribArray(program[vShader.attributes[i]] = gl.getAttribLocation(program, vShader.attributes[i])),
                    gl.vertexAttribPointer(program[vShader.attributes[i]], gpu[this].vbos['null'].stride, gl.FLOAT, false, 0, 0);
            }
            i = vShader.uniforms.length;
            while (i--) {
                program[vShader.uniforms[i]] = gl.getUniformLocation(program, vShader.uniforms[i]);
            }
            i = fShader.uniforms.length;
            while (i--) {
                program[fShader.uniforms[i]] = gl.getUniformLocation(program, fShader.uniforms[i]);
            }
            gpu[this].programs[name] = program;
            //console.log(vShader)
            //console.log(fShader)
            //console.log(program)
            return program;
        }, vertexShaderParser = function vertexShaderParser(source) {
        var gl, t0, i, resultStr, shader;
        gl = gpu[this].gl,
            shader = gl.createShader(gl.VERTEX_SHADER),
            shader.uniforms = [],
            shader.attributes = [],
            resultStr = "",
            t0 = source.attributes, i = t0.length;
        while (i--) {
            resultStr += 'attribute ' + t0[i] + ';\n',
                shader.attributes.push(t0[i].split(' ')[1]);
        }
        t0 = source.uniforms, i = t0.length;
        while (i--) {
            resultStr += 'uniform ' + t0[i] + ';\n',
                shader.uniforms.push(t0[i].split(' ')[1]);
        }
        t0 = source.varyings, i = t0.length;
        while (i--) {
            resultStr += 'varying ' + t0[i] + ';\n';
        }
        resultStr += VertexShader.baseFunction,
            resultStr += 'void main(void){\n',
            resultStr += source.main + ';\n',
            resultStr += '}\n',
            //console.log(resultStr),
            gl.shaderSource(shader, resultStr),
            gl.compileShader(shader);
        return shader;
    }, fragmentShaderParser = function fragmentShaderParser(source) {
        var gl, resultStr, i, t0, shader;
        gl = gpu[this].gl,
            shader = gl.createShader(gl.FRAGMENT_SHADER),
            shader.uniforms = [],
            resultStr = "";
        if (source.precision) resultStr += 'precision ' + source.precision + ';\n';
        else resultStr += 'precision mediump float;\n';
        t0 = source.uniforms, i = t0.length;
        while (i--) {
            resultStr += 'uniform ' + t0[i] + ';\n',
                shader.uniforms.push(t0[i].split(' ')[1]);
        }
        t0 = source.varyings, i = t0.length;
        while (i--) {
            resultStr += 'varying ' + t0[i] + ';\n';
        }
        resultStr += 'void main(void){\n',
            resultStr += source.main + ';\n',
            resultStr += '}\n',
            //console.log(resultStr),
            gl.shaderSource(shader, resultStr),
            gl.compileShader(shader);
        return shader;
    },
        makeTexture = function makeTexture(id, image/*,resizeType*/) {
            var gl, texture;
            var img, img2, tw, th;
            gl = gpu[this].gl, texture = gpu[this].textures[id];
            if (texture) return texture;
            texture = gl.createTexture();
            img = new Image(), img2 = new Image(),
                tw = 1, th = 1;

            ///////////////////////////////////
            // 타입구분
            if (image instanceof ImageData) img.src = image.data;
            else if (image instanceof HTMLCanvasElement) img.src = image.toDataURL();
            else if (image instanceof HTMLImageElement) img.src = image.src;
            else if (image['substring'] && image.substring(0, 10) == 'data:image' && image.indexOf('base64') > -1) img.src = image; //base64문자열 - urlData형식으로 지정된 base64문자열
            else if (typeof image == 'string') img.src = image;
            //TODO 일단 이미지만
            //TODO 비디오 처리
            ///////////////////////////////////

            var resize = arguments[3] || Texture.zoomOut;
            img.onload = function () {
                var dw, dh;
                while (img.width > tw) tw *= 2;
                while (img.height > th) th *= 2;
                if (resize == Texture.zoomOut) {
                    if (img.width < tw) tw /= 2;
                    if (img.height < th) th /= 2;
                } else if (resize == Texture.zoomIn) {
                }
                dw = tw, dh = th,
                    canvas.width = tw,
                    canvas.height = th,
                    context.clearRect(0, 0, tw, th);
                if (resize == Texture.crop) {
                    if (img.width < tw) dw = tw / 2;
                    if (img.height < th) dh = th / 2;
                    context.drawImage(img, 0, 0, tw, th, 0, 0, dw, dh);
                } else if (resize == Texture.addSpace) context.drawImage(img, 0, 0, tw, th, 0, 0, tw, th);
                else context.drawImage(img, 0, 0, dw, dh);
                console.log(resize, '텍스쳐크기 자동변환', img.width, img.height, '--->', dw, dh),
                    console.log(canvas.toDataURL()),
                    img2.src = canvas.toDataURL();
            };

            texture.img = img2;
            texture.img.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, texture),
                    //TODO 다변화 대응해야됨

                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
                texture.loaded = 1;
            };
            texture.originalData = image,
                gpu[this].textures[id] = texture,
                gl.bindTexture(gl.TEXTURE_2D, null);
            return texture;
        },
        makeFrameBuffer = function makeFrameBuffer(camera) {
            var gl, framebuffer, texture, renderbuffer;
            gl = gpu[this].gl,
                framebuffer = gl.createFramebuffer(),
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
            var tArea = camera._renderArea ? camera._renderArea : [0, 0, cvs[this].width, cvs[this].height]
            framebuffer.x = tArea[0], framebuffer.y = tArea[1],
                framebuffer.width = tArea[2] * window.devicePixelRatio > cvs[this].width ? cvs[this].width : tArea[2] * window.devicePixelRatio,
                framebuffer.height = tArea[3] * window.devicePixelRatio > cvs[this].height ? cvs[this].height : tArea[3] * window.devicePixelRatio;

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
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gpu[this].framebuffers[camera.uuid] = {
                frameBuffer: framebuffer,
                texture: texture
            };
        };
    //private
    children = {},
        camera = {},
        textures = {},
        materials = {},
        geometrys = {},
        gpu = {},
        //shared private
        $setPrivate('Scene', {}),
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
                    vbos: {},
                    vnbos: {},
                    uvbos: {},
                    ibos: {},
                    programs: {},
                    textures: {},
                    framebuffers: {}
                }

            this.addVertexShader(Shader.colorVertexShader),
                this.addFragmentShader(Shader.colorFragmentShader),
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
    /////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////
    fn = Scene.prototype,
        fn.update = function update() {
            var p, k, checks, tVBOs, child, geo;
            p = gpu[this],
                tVBOs = p.vbos,
                //for GPU
                child = children[this];
            for (k in child) {
                geo = child[k].geometry;
                if (geo) {
                    if (!tVBOs[geo]) {
                        tVBOs[geo] = makeVBO(geo.position, 3),
                            p.VNBOs[geo] = makeVNBO(geo.normal, 3),
                            p.UVBOs[geo] = makeUVBO(geo.uv, 2),
                            p.IBOs[geo] = makeIBO(geo.index, 1);
                    }
                }
            }

            for (k in this._cameras) {
                var camera, tRenderArea, tCVS;
                camera = this._cameras[k],
                    tCVS = camera._cvs = this._cvs,
                    tRenderArea = camera._renderArea;
                if (tRenderArea) {
                    var wRatio = tRenderArea[2] / tCVS.width;
                    var hRatio = tRenderArea[3] / tCVS.height;
                    camera.setRenderArea(tRenderArea[0], tRenderArea[1], tCVS.width * wRatio, tCVS.height * hRatio);
                }
                camera.resetProjectionMatrix(),
                    makeFrameBuffer(this, camera);
            }
            checks = this._vertexShaders;
            for (k in checks) makeProgram(this, k);
            //console.log('////////////////////////////////////////////'),
            //console.log('Scene 업데이트'),
            //console.log('tVBOs :', tVBOs),
            //console.log('gpu[this].vnbos :', gpu[this].vnbos),
            //console.log('gpu[this].ibos :', gpu[this].ibos),
            //console.log('this._glPROGRAMs :', this._glPROGRAMs),
            //console.log('geometrys[this] :', geometrys[this]),
            //console.log('this._materials :', this._materials),
            //console.log('this._textures :', this._textures),
            //console.log('this._vertexShaders :', this._vertexShaders),
            //console.log('this._fragmentShaders :', this._fragmentShaders),
            console.log('this._glFREAMBUFFERs :', this._glFREAMBUFFERs),
                //console.log('////////////////////////////////////////////'),
                this._update = 0;
        },
        fn.addChild = function addChild(id, mesh) {  // isAlive는 함수선언 줄에 바로 같이 씁니다.
            var k, checks, tMaterial;
            if (children[this][id]) this.error(0);
            if (!(mesh instanceof Mesh )) this.error(1);
            mesh._scene = this,
                mesh._parent = this,
                mesh.setGeometry(mesh.geometry),
                mesh.setMaterial(mesh._material),
                tMaterial = mesh._material,
                tMaterial._count++,
                checks = mesh.geometry._vertexShaders;
            for (k in checks) {
                if (typeof checks[k] == 'string') {
                    if (!this._vertexShaders[checks[k]]) this.error(2);
                }
            }
            checks = tMaterial._fragmentShaders;
            for (k in checks) {
                if (typeof checks[k] == 'string') {
                    if (!this._fragmentShaders[checks[k]]) this.error(3);
                }
            }
            checks = tMaterial._textures;
            for (k in checks)
                if (typeof checks[k] == 'string')
                    if (!this._textures[checks[k]]) this.error(4);
                    else {
                        //console.log(tMaterial._textures),
                        //console.log(checks[k]),
                        tMaterial._textures[checks[k]] = this._textures[checks[k]];
                    }
            if (mesh instanceof Camera) this._cameras[id] = mesh, mesh._cvs = this._cvs;
            else children[this][id] = mesh;
            this._update = 1;
            return this;
        },
        fn.addGeometry = function (id, geometry) {
            var checks, k, tVShader;
            checks = geometry._vertexShaders,
                tVShader = this._vertexShaders;
            if (geometrys[this][id]) this.error(0);
            if (!(geometry instanceof Geometry)) this.error(1);
            for (k in checks) if (typeof checks[k] == 'string') if (!tVShader[checks[k]]) this.error(2);
            geometrys[this][id] = geometry;
            return this;
        },
        fn.addMaterial = function (id, material) {
            var materials, textures, fShaders, checks, k;
            materials = this._materials,
                textures = this._textures,
                fShaders = this._fragmentShaders;
            if (materials[id]) this.error(0);
            if (!(material instanceof Material)) this.error(1);
            checks = material._fragmentShaders;
            for (k in checks) {
                if (typeof checks[k] == 'string') {
                    if (!fShaders[checks[k]]) this.error(2);
                }
            }
            checks = material._textures;
            for (k in checks) {
                if (typeof checks[k] == 'string') {
                    if (!textures[checks[k]]) {
                        this.error(3);
                    }
                }
            }
            materials[id] = material,
                materials[id]._scene = this;
            return this;
        },
        fn.addTexture = function addTexture(id, image/*,resizeType*/) {
            var textures = this._textures;
            if (textures[id]) this.error(0);
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
        fn.addFragmentShader = function addFragmentShader(id, shaderStr) {
            if (this._fragmentShaders[id]) this.error(0);
            // TODO'Scene.addVertexShader:1' - MoGL 표준 인터페이스를 준수하지 않는 vertex shader를 등록하려할 때.
            // TODO 마일스톤0.2
            this._fragmentShaders[id] = shaderStr;
            return this;
        },
        fn.addVertexShader = function addVertexShader(id, shaderStr) {
            if (this._vertexShaders[id]) this.error(0);
            // TODO'Scene.addVertexShader:1' - MoGL 표준 인터페이스를 준수하지 않는 vertex shader를 등록하려할 때.
            // TODO 마일스톤0.2
            this._vertexShaders[id] = shaderStr;
            return this;
        },
        ///////////////////////////////////////////////////////////////////////////
        // Get
        fn.getChild = function getChild(id) {
            var t = children[this][id];
            t = t ? t : this._cameras[id];
            return t ? t : null;
        },
        fn.getGeometry = function getGeometry(id) {
            var t = geometrys[this][id];
            return t ? t : null;
        },
        fn.getMaterial = function getMaterial(id) {
            var t = this._materials[id];
            return t ? t : null;
        },
        fn.getTexture = function getTexture(id) {
            var t = this._textures[id];
            return t ? t : null;
        },
        fn.getFragmentShader = function (id) {
            // TODO 마일스톤0.5
            return this._fragmentShaders[id];
        },
        fn.getVertexShader = function (id) {
            // TODO 마일스톤0.5
            return this._vertexShaders[id];
        },
        ///////////////////////////////////////////////////////////////////////////
        // Remove
        fn.removeChild = function removeChild(id) {
            return children[this][id] ? (children[this][id]._material._count--, children[this][id]._scene = null, children[this][id]._parent = null, delete children[this][id], true) : false;
        },
        fn.removeGeometry = function removeGeometry(id) {
            return geometrys[this][id] ? (delete geometrys[this][id], true) : false;
        },
        fn.removeMaterial = function removeMaterial(id) {
            return this._materials[id] ? (delete this._materials[id], true) : false;
        },
        fn.removeTexture = function removeTexture(id) {
            return this._textures[id] ? (delete this._textures[id], true) : false;
        },
        fn.removeFragmentShader = function removeFragmentShader() {
            // TODO 마일스톤0.5
            return this;
        },
        fn.removeVertexShader = function VertexShader() {
            // TODO 마일스톤0.5
            return this;
        }
    return MoGL.ext(Scene, MoGL);
})();