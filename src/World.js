var World = (function () {
    var getGL, glSetting,glContext, World, fn, rectMatrix = Matrix(), f3 = new Float32Array(3),f4 = new Float32Array(4);
    var canvas, context, makeVBO, makeVNBO, makeIBO, makeUVBO, makeProgram, makeTexture, makeFrameBuffer;
    var baseUpdate,baseShaderUpdate;
	glSetting = {
		alpha: true,
		depth: true,
		stencil:false,
		antialias: true,
		premultipliedAlpha:true,
		preserveDrawingBuffer:false
	},
	getGL = function(canvas){
		var gl, keys, i;
		if(glContext){
			gl = canvas.getContext(glContext, glSetting);
		}else{
			keys = 'experimental-webgl,webgl,webkit-3d,moz-webgl,3d'.split(','), i = keys.length;
			while (i--) {
				if (gl = canvas.getContext(keys[i], glSetting)) {
					glContext = keys[i];
					break;
				}
			}
		}
		return gl;
	};
    var renderList = {}, sceneList = [], cvsList = {},  autoSizer = {}, started ={},gpu={};

    ///////////////////////////////
    // 씬에서 이사온놈들
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    makeVBO = function makeVBO(gpu, geo, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.vbo[geo];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW),
        buffer.name = geo,
        buffer.type = 'VBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.vbo[geo] = buffer,
        console.log('VBO생성', gpu.vbo[geo]);
        return gpu.vbo[geo];
    },
    makeVNBO = function makeVNBO(gpu, geo, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.vnbo[geo];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW),
        buffer.name = geo,
        buffer.type = 'VNBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.vnbo[geo] = buffer,
        console.log('VNBO생성', gpu.vnbo[geo]);
        return gpu.vnbo[geo];
    },
    makeIBO = function makeIBO(gpu, geo, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.ibo[geo];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW),
        buffer.name = geo,
        buffer.type = 'IBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.ibo[geo] = buffer,
        console.log('IBO생성', gpu.ibo[geo]);
        return gpu.ibo[geo];
    },
    makeUVBO = function makeUVBO(gpu, geo, data, stride) {
        var gl, buffer;
        gl = gpu.gl,
        buffer = gpu.uvbo[geo];
        if (buffer) return buffer;
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
        buffer.name = geo,
        buffer.type = 'UVBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        gpu.uvbo[geo] = buffer,
        console.log('UVBO생성', gpu.uvbo[geo]);
        return gpu.uvbo[geo];
    },
    makeProgram = function makeProgram(gpu, name, vSource, fSource) {
        var gl, vShader, fShader, program, i, len, tList;
        gl = gpu.gl,
        vShader = gl.createShader(gl.VERTEX_SHADER),
        fShader = gl.createShader(gl.FRAGMENT_SHADER),
        gl.shaderSource(vShader, vSource.shaderStr),
        gl.compileShader(vShader),
        gl.shaderSource(fShader, fSource.shaderStr),
        gl.compileShader(fShader),

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
        gl.useProgram(program),
        tList = vSource.attributes
        len = tList.length;
        for (i = 0; i < len; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, gpu.vbo['null']),
            gl.enableVertexAttribArray(program[tList[i]] = gl.getAttribLocation(program, tList[i])),
            gl.vertexAttribPointer(program[tList[i]], gpu.vbo['null'].stride, gl.FLOAT, false, 0, 0);
        }
        tList = vSource.uniforms,
        i = tList.length;
        while (i--) {
            program[tList[i]] = gl.getUniformLocation(program, tList[i]);
        }
        tList = fSource.uniforms,
        i = tList.length;
        while (i--) {
            program[tList[i]] = gl.getUniformLocation(program, tList[i]);
        }
        gpu.programs[name] = program;
        return program;
    },
    makeTexture = function makeTexture(gpu, texture) {
        //TODO
        console.log('이걸재련해야됨', texture.img)
        var gl, glTexture;
        gl = gpu.gl,
        glTexture = gl.createTexture(),
        gl.bindTexture(gl.TEXTURE_2D, glTexture),
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR),
        gl.generateMipmap(gl.TEXTURE_2D),
        glTexture.textrue = texture,
        gpu.textures[texture] = glTexture,
        gl.bindTexture(gl.TEXTURE_2D, null);
        return gpu.textures[texture];
    },
    makeFrameBuffer = function makeFrameBuffer(gpu, camera) {
        var gl, texture, fBuffer, rBuffer, tArea, cvs, cvsW, cvsH, pRatio;
        cvs = camera.cvs
        if (!cvs) return
        cvsW = cvs.width,
        cvsH = cvs.height,
        pRatio = window.devicePixelRatio
        if (camera.renderArea) {
            tArea = camera.renderArea
        } else {
            tArea = [0, 0, cvsW, cvsH]
        }

        gl = gpu.gl,
        fBuffer = gl.createFramebuffer(),
        fBuffer.x = tArea[0], fBuffer.y = tArea[1],
        fBuffer.width = tArea[2] * pRatio > cvsW ? cvsW : tArea[2] * pRatio,
        fBuffer.height = tArea[3] * pRatio > cvsH ? cvsH : tArea[3] * pRatio,
        gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer),

        texture = gl.createTexture(),
        gl.bindTexture(gl.TEXTURE_2D, texture),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fBuffer.width, fBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null),

        rBuffer = gl.createRenderbuffer(),
        gl.bindRenderbuffer(gl.RENDERBUFFER, rBuffer),
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fBuffer.width, fBuffer.height),
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0),
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rBuffer),
        gl.bindTexture(gl.TEXTURE_2D, null),
        gl.bindRenderbuffer(gl.RENDERBUFFER, null),
        gl.bindFramebuffer(gl.FRAMEBUFFER, null),
        gpu.framebuffers[camera] = {
            frameBuffer: fBuffer,
            texture: texture
        };
    },
    baseUpdate = function (gpu) {
        // TODO 기초 버퍼들도 씬이 월드에서 등록될떄 해야겠음..
        gpu.vbo['null'] = makeVBO(gpu, 'null', new Float32Array([0.0, 0.0, 0.0]), 3);
        if (!gpu.vbo['_FRAMERECT_']) {
            gpu.vbo['_FRAMERECT_'] = makeVBO(gpu, '_FRAMERECT_', [
                -1.0, 1.0, 0.0,
                1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0
            ], 3),
            gpu.uvbo['_FRAMERECT_'] = makeUVBO(gpu, '_FRAMERECT_', [
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                1.0, 1.0
            ], 2),
            gpu.ibo['_FRAMERECT_'] = makeIBO(gpu, '_FRAMERECT_', [0, 1, 2, 1, 2, 3], 1);
        }

    },
    baseShaderUpdate = function(gpu,scene){
        var vS,fS
        vS = scene.vertexShaders
        fS = scene.fragmentShaders
        //console.log('~~~~~~~~~',vS)
        //console.log('~~~~~~~~~',fS)
        makeProgram(gpu, 'color', vS.colorVertexShader, fS.colorFragmentShader);
        makeProgram(gpu, 'wireFrame', vS.wireFrameVertexShader, fS.wireFrameFragmentShader);
        makeProgram(gpu, 'bitmap', vS.bitmapVertexShader, fS.bitmapFragmentShader);
        makeProgram(gpu, 'bitmapGouraud', vS.bitmapVertexShaderGouraud, fS.bitmapFragmentShaderGouraud);
        makeProgram(gpu, 'colorGouraud', vS.colorVertexShaderGouraud, fS.colorFragmentShaderGouraud);
        makeProgram(gpu, 'colorPhong', vS.colorVertexShaderPhong, fS.colorFragmentShaderPhong);
        makeProgram(gpu, 'toonPhong', vS.toonVertexShaderPhong, fS.toonFragmentShaderPhong);
        makeProgram(gpu, 'bitmapPhong', vS.bitmapVertexShaderPhong, fS.bitmapFragmentShaderPhong);
        makeProgram(gpu, 'bitmapBlind', vS.bitmapVertexShaderBlinn, fS.bitmapFragmentShaderBlinn);
        makeProgram(gpu, 'postBase', vS.postBaseVertexShader, fS.postBaseFragmentShader);
    }
    World = function World(id) {
        if (!id) this.error(0);
        cvsList[this] = document.getElementById(id);
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
        if (!cvsList[this]) this.error(1);
        if (gpu[this].gl = getGL(cvsList[this])) {
            renderList[this] = {},
            sceneList[this] = [],
            autoSizer[this] = null;
        } else {
            this.error(2);
        }
    },
    fn = World.prototype,
    fn.setAutoSize = function setAutoSize( isAutoSize ){
		var canvas, scenes,self;
		if( isAutoSize ){
			if( !this._autoSizer ){
                self = this
				canvas = cvsList[this] ,
				scenes = sceneList[this],
				autoSizer[this] = function(){
					//this._pixelRatio = parseFloat(width)/parseFloat(height) > 1 ? window.devicePixelRatio : 1
					var width, height, pixelRatio, k;
					width = window.innerWidth,
					height = window.innerHeight,
					pixelRatio = window.devicePixelRatio,
					canvas.width = width * pixelRatio,
					canvas.height = height * pixelRatio,
					canvas.style.width = width + 'px',
					canvas.style.height = height + 'px';
                    canvas._autoSize = isAutoSize
                    self._cameraRenderAreaUpdate()
				};
			}
			window.addEventListener( 'resize', autoSizer[this] ),
			window.addEventListener( 'orientationchange', autoSizer[this] );
			autoSizer[this]();
		}else if(autoSizer[this]) {
			window.removeEventListener( 'resize', autoSizer[this] ),
			window.removeEventListener( 'orientationchange', autoSizer[this] );
		}
		return this;
    },
    fn.addScene = function addScene(scene) {
        var tSceneList, i;
        tSceneList = sceneList[this], i = tSceneList.length;
        if (!(scene instanceof Scene )) this.error(1);
        while(i--){
            if (tSceneList[i] == this) this.error(0);
        }
        tSceneList.push(scene)
        var p = gpu[this]
        var updateNewBuffer = function(){
            var k, tList, v, geo
            tList = scene.children
            for (k in tList) {
                v = tList[k]
                geo = v.geometry
                if (geo) {
                    if (!p.vbo[geo]) {
                        p.vbo[geo] = makeVBO(p, geo, geo.position, 3),
                        p.vnbo[geo] = makeVNBO(p, geo, geo.normal, 3),
                        p.uvbo[geo] = makeUVBO(p, geo, geo.uv, 2),
                        p.ibo[geo] = makeIBO(p, geo, geo.index, 1);
                    }
                }
            }
        }
        baseUpdate(p)
        baseShaderUpdate(p,scene)
        updateNewBuffer()
        this._cameraRenderAreaUpdate()
        //scene등록시 현재 갖고 있는 모든 카메라 중 visible이 카메라 전부 등록
        //이후부터는 scene에 카메라의 변화가 생기면 자신의 world에게 알려야함
        return this;
    },
    fn._cameraRenderAreaUpdate = function(){
        var p, p2, k, k2;
        p = sceneList[this]
        for (k in p) {
            p2 = p[k].cameras
            for(k2 in p2){
                var camera, tRenderArea, cvs;
                camera = p2[k2],
                cvs = camera.cvs = cvsList[this]
                if(!cvs) return
                tRenderArea = camera.renderArea;
                if (tRenderArea) {
                    var wRatio = tRenderArea[2] / cvs.width;
                    var hRatio = tRenderArea[3] / cvs.height;
                    camera.setRenderArea(tRenderArea[0], tRenderArea[1], cvs.width * wRatio, cvs.height * hRatio);
                }
                camera.resetProjectionMatrix()
                //TODO 렌더러 반영하겠금 고쳐야겠고..
                // 헉!! 프레임 버퍼가 카메라에 종속되있어!!!!!!
                makeFrameBuffer(gpu[this],camera);
            }

        }
    }
    fn.getScene = function getScene(sceneID) {
        var i, tSceneList;
        tSceneList = sceneList[this],
        i = tSceneList.length;
        if (typeof sceneID === 'undefined') return null;
        while (i--) {
            if (tSceneList[i].id == sceneID) {
                return tSceneList[i];
            }
        }
        return null;
    },
    fn.getRenderer = function(isRequestAnimationFrame){
        var p,self;
        p=renderList[this];
        if (!p) {
            // 없으니까 생성
            p = {}
        }
        self = this;
        if (isRequestAnimationFrame) {
            if (p[1]) return p[1]
            else {
                return p[1] = function (currentTime) {
                    self.render(currentTime);
                    started[this] = requestAnimationFrame(p[1]);
                }
            }
        } else {
            if (p[0]) return p[0]
            else{
                p[0] = function (currentTime) {
                    self.render(currentTime)
                }
                return p[0]
            }
        }
    },
    fn.start = function start(){
        started[this] = requestAnimationFrame(this.getRenderer(1));
        return this;
    },
    fn.stop = function stop(){
        cancelAnimationFrame(started[this])
        return this;
    },
    fn.removeScene = function removeScene(sceneID) {
        var i, tSceneList;
        tSceneList = sceneList[this],
        i = tSceneList.length;
        if( typeof sceneID === 'undefined' ) return null;
        while(i--){
            if(tSceneList[i].id == sceneID){
                tSceneList.splice(i,1)
                console.log(sceneList)
                return this
            }
        }
        this.error('0')
    },
    fn.render = function render(currentTime) {
        var i, j, k,len=0;
        var scene,tSceneList,cameraList,camera,gl,children,cvs;
        var tItem, tMaterial, tProgram, tVBO, tVNBO, tUVBO, tIBO, tFrameBuffer, tDiffuseList,tCulling;
        var pVBO, pVNBO, pUVBO, pIBO, pDiffuse,pProgram,pCulling;
        var tGPU
        cvs = cvsList[this],
        tSceneList = sceneList[this],
        tGPU = gpu[this]
        gl = tGPU.gl;
        i = tSceneList.length
        this.dispatch(World.renderBefore,currentTime)
        while(i--){
            //console.log(k,'의 활성화된 카메라를 순환돌면서 먼짓을 해야함...')
            scene = tSceneList[i]
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            //Scene 업데이트 사항 반영
            j = scene.updateList.mesh.length
            while(j--){
                // 버퍼 업데이트
                var updateItem, geo;
                updateItem = scene.updateList.mesh[i]
                geo = updateItem.geometry
                if (geo) {
                    if (!tGPU.vbo[geo]) {
                        tGPU.vbo[geo] = makeVBO(tGPU, geo, geo.position, 3),
                        tGPU.vnbo[geo] = makeVNBO(tGPU, geo, geo.normal, 3),
                        tGPU.uvbo[geo] = makeUVBO(tGPU, geo, geo.uv, 2),
                        tGPU.ibo[geo] = makeIBO(tGPU, geo, geo.index, 1);
                    }
                }
            }
            j = scene.updateList.material.length
            while(j--){
                makeTexture(tGPU,scene.updateList.material[i])
            }
            scene.updateList.mesh.length= 0
            scene.updateList.material.length= 0
            //////////////////////////////////////////////////////////////////////////////////////////////////////
            cameraList = scene.cameras
            for (k in cameraList) len++
            for (k in cameraList) {
                camera = cameraList[k]
                if(camera.visible){
                    if(len > 1) {
                        tFrameBuffer = scene._glFREAMBUFFERs[camera].frameBuffer;
                        gl.bindFramebuffer( gl.FRAMEBUFFER,tFrameBuffer);
                        gl.viewport(0,0, tFrameBuffer.width, tFrameBuffer.height);
                    }else{
                        gl.viewport(0, 0, cvs.width, cvs.height);
                    }
                    children = scene.children;
                    gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS);
                    gl.enable(gl.BLEND)
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
                    var color = camera.backgroundColor
                    gl.clearColor(color[0],color[1],color[2],color[3]);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    for(k in tGPU.programs){
                        tProgram = tGPU.programs[k];
                        gl.useProgram(tProgram);
                        camera.cvs = cvs
                        gl.uniformMatrix4fv(tProgram.uPixelMatrix,false,camera.projectionMatrix.raw);
                        gl.uniformMatrix4fv(tProgram.uCameraMatrix,false,camera.matrix.raw);
                    }
                    tItem = tMaterial = tProgram = tVBO = tIBO = null;
                    for (k in children) {
                        tItem = children[k],
                        tVBO = tGPU.vbo[tItem.geometry],
                        tVNBO = tGPU.vnbo[tItem.geometry],
                        tUVBO = tGPU.uvbo[tItem.geometry],
                        tIBO = tGPU.ibo[tItem.geometry],
                        tMaterial = tItem.material,
                        //tDiffuseList = tMaterial.diffuse;

                        tCulling = tItem.culling
                        if(tCulling != pCulling){
                            if(tCulling == Mesh.cullingNone) gl.disable(gl.CULL_FACE)
                            else if(tCulling == Mesh.cullingBack) gl.enable(gl.CULL_FACE),gl.frontFace (gl.CCW)
                            else if(tCulling == Mesh.cullingFront) gl.enable(gl.CULL_FACE),gl.frontFace (gl.CW)
                        }

                        var dLite = [0,-1,-1], useNormalBuffer = 0,useTexture = 0;

                        // 쉐이딩 결정
                        switch(tMaterial.shading){
                            case  Shading.none :
                             tProgram=tGPU.programs['color'];
                            break
                            case  Shading.phong :
                                if(tMaterial.diffuse){
                                    tProgram=tGPU.programs['bitmapPhong'];
                                    //console.log('들어왔다!')
                                    useTexture =1
                                } else {
                                    tProgram=tGPU.programs['colorPhong'];
                                }
                                useNormalBuffer = 1;
                            break
                        }
                        // 쉐이딩 변경시 캐쉬 삭제
                        if(pProgram != tProgram) pProgram = null ,pVBO = null, pVNBO = null, pUVBO = null, pIBO = null, pDiffuse = null;

                        // 정보 밀어넣기
                        gl.useProgram(tProgram);
                        if(useNormalBuffer){
                            tVNBO != pVNBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVNBO) : 0,
                            tVNBO != pVNBO ? gl.vertexAttribPointer(tProgram.aVertexNormal, tVNBO.stride, gl.FLOAT, false, 0, 0) : 0;
                            gl.uniform3fv(tProgram.uDLite, dLite);
                            gl.uniform1f(tProgram.uLambert,tMaterial.lambert);
                        }

                        tVBO!=pVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVBO) : 0,
                        tVBO!=pVBO ? gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                        f4[0] = tMaterial.color[0]
                        f4[1] = tMaterial.color[1]
                        f4[2] = tMaterial.color[2]
                        f4[3] = tMaterial.color[3]
                        gl.uniform4fv(tProgram.uColor, f4);

                        // 텍스쳐 세팅
                        if(useTexture){
                            tUVBO != pUVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) : 0,
                            tUVBO != pUVBO ? gl.vertexAttribPointer(tProgram.aUV, tUVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                            gl.activeTexture(gl.TEXTURE0);
                            if(tMaterial.diffuse[0]){
                                var textureObj = tMaterial.diffuse[tMaterial.diffuse.length-1].tex
                                if(textureObj.isLoaded){
                                    textureObj = tGPU.textures[textureObj];
                                    textureObj != pDiffuse ? gl.bindTexture(gl.TEXTURE_2D, textureObj) : 0;
                                    gl.uniform1i(tProgram.uSampler, 0);
                                }
                            }
                        }
                        f3[0] = tItem.rotateX,f3[1] = tItem.rotateY,f3[2] = tItem.rotateZ;
                        gl.uniform3fv(tProgram.uRotate, f3),

                        f3[0] = tItem.x,f3[1] = tItem.y,f3[2] = tItem.z,
                        gl.uniform3fv(tProgram.uPosition, f3),

                        f3[0] = tItem.scaleX,f3[1] = tItem.scaleY,f3[2] = tItem.scaleZ,
                        gl.uniform3fv(tProgram.uScale, f3),

                        tIBO != pIBO ? gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO) : 0;
                        gl.drawElements(gl.TRIANGLES, tIBO.numItem, gl.UNSIGNED_SHORT, 0)
                        // 와이어프레임 그리기
                        if(tMaterial.wireFrame) {
                            gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LEQUAL);
                            tProgram = tGPU.programs['wireFrame'],
                                gl.useProgram(tProgram),
                                tVBO != pVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVBO) : 0,
                                tVBO != pVBO ? gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                                f3[0] = tItem.rotateX, f3[1] = tItem.rotateY, f3[2] = tItem.rotateZ,
                                gl.uniform3fv(tProgram.uRotate, f3),
                                f3[0] = tItem.x, f3[1] = tItem.y, f3[2] = tItem.z,
                                gl.uniform3fv(tProgram.uPosition, f3),
                                f3[0] = tItem.scaleX, f3[1] = tItem.scaleY, f3[2] = tItem.scaleZ,
                                gl.uniform3fv(tProgram.uScale, f3),
                                f4[0] = tMaterial.wireFrameColor[0]
                                f4[1] = tMaterial.wireFrameColor[1]
                                f4[2] = tMaterial.wireFrameColor[2]
                                f4[3] = tMaterial.wireFrameColor[3]
                                gl.uniform4fv(tProgram.uColor, f4),
                                gl.drawElements(gl.LINES, tIBO.numItem, gl.UNSIGNED_SHORT, 0);
                            gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS);
                        }

                        pProgram = tProgram ,pVBO = tVBO, pVNBO = useNormalBuffer ? tVNBO : null, pUVBO = tUVBO, pIBO = tIBO, pCulling=tCulling,pDiffuse = textureObj;
                    }
                    //gl.bindTexture(gl.TEXTURE_2D, scene._glFREAMBUFFERs[camera.uuid].texture);
                    //gl.bindTexture(gl.TEXTURE_2D, null);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
            }
        }
        // TODO 아래는 아직 다 못옮겨씀
        // 프레임버퍼를 모아서 찍어!!!
        if(len > 1){
            gl.viewport(0, 0, cvs.width, cvs.height);
            gl.clearColor(0, 0, 0, 1);
            //gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LEQUAL)
            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            tVBO = tGPU.vbo['_FRAMERECT_'],
            tUVBO = tGPU.uvbo['_FRAMERECT_'],
            tIBO = tGPU.ibo['_FRAMERECT_'],
            tProgram = tGPU.programs['postProcess'];
            if (!tVBO) return;
            gl.useProgram(tProgram);
            gl.uniformMatrix4fv(tProgram.uPixelMatrix, false, [
                2 / cvs.clientWidth, 0, 0, 0,
                0, -2 / cvs.clientHeight, 0, 0,
                0, 0, 0, 0,
                -1, 1, 0, 1
            ]);
            gl.bindBuffer(gl.ARRAY_BUFFER, tVBO),
            gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0),
            gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO),
            gl.vertexAttribPointer(tProgram.aUV, tUVBO.stride, gl.FLOAT, false, 0, 0),
            gl.uniform3fv(tProgram.uRotate, [0, 0, 0]);
            gl.uniformMatrix4fv(tProgram.uCameraMatrix, false, rectMatrix._rawData);
            for (k in tSceneList) {
                scene = tSceneList[k]
                cameraList = scene._cameras
                for (k in cameraList) {
                    camera = cameraList[k]
                    if (camera._visible) {
                        tFrameBuffer = scene._glFREAMBUFFERs[camera.uuid].frameBuffer;
                        gl.uniform1i (tProgram.uFXAA,camera._antialias)
                        if(camera._antialias){
                            if(camera._renderArea) gl.uniform2fv(tProgram.uTexelSize,[1/tFrameBuffer.width,1/tFrameBuffer.height])
                            else gl.uniform2fv(tProgram.uTexelSize,[1/cvs.width,1/cvs.height])
                        }
                        f3[0] = tFrameBuffer.x + tFrameBuffer.width / 2 / window.devicePixelRatio, f3[1] = tFrameBuffer.y + tFrameBuffer.height / 2 / window.devicePixelRatio , f3[2] = 0;
                        gl.uniform3fv(tProgram.uPosition, f3),
                        f3[0] = tFrameBuffer.width / 2 / window.devicePixelRatio, f3[1] = tFrameBuffer.height / 2/window.devicePixelRatio, f3[2] = 1,
                        gl.uniform3fv(tProgram.uScale, f3),
                        gl.activeTexture(gl.TEXTURE0),
                        gl.bindTexture(gl.TEXTURE_2D, scene._glFREAMBUFFERs[camera.uuid].texture),
                        gl.uniform1i(tProgram.uSampler, 0),
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO),
                        gl.drawElements(gl.TRIANGLES, tIBO.numItem, gl.UNSIGNED_SHORT, 0);
                    }
                }
            }
        }
        this.dispatch(World.renderAfter,currentTime)
        //gl.finish();
    }
    World.renderBefore = 'WORLD_RENDER_BEFORE',
    World.renderAfter = 'WORLD_RENDER_AFTER'
    return MoGL.ext(World);
})();
console.log(Object.isExtensible(World))