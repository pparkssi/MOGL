/**
 * Created by redcamel on 2015-05-05.
 * description
 * World는 MoGL의 기본 시작객체로 내부에 다수의 Scene을 소유할 수 있으며,
 * 실제 렌더링되는 대상임. 또한 World의 인스턴스는 rendering함수 그 자체이기도 함.
 * 메서드체이닝을 위해 대부분의 함수는 자신을 반환함.
 */
var World = (function () {
    var getGL, glSetting,glContext, World, fn, rectMatrix = Matrix(), f3 = new Float32Array(3),f4 = new Float32Array(4);
    var canvas, context, makeVBO, makeVNBO, makeIBO, makeUVBO, makeProgram, makeTexture, makeFrameBuffer;
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
    makeVBO = function makeVBO(gpu,geometry, data, stride) {
        var gl, buffer;
        console.log(gpu)
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
            console.log(name, vSource, fSource)
            var gl, vShader, fShader, program, i,len,temp;
            gl = gpu.gl,
                vShader = gl.createShader(gl.VERTEX_SHADER),
                fShader = gl.createShader(gl.FRAGMENT_SHADER),
                gl.shaderSource(vShader, vSource.shaderStr),
                gl.compileShader(vShader);
                gl.shaderSource(fShader, fSource.shaderStr),
                gl.compileShader(fShader);

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
            temp = vSource.attributes
            for (i = 0, len = temp.length; i < len; i++) {
                gl.bindBuffer(gl.ARRAY_BUFFER, gpu.vbo['null']),
                    gl.enableVertexAttribArray(program[temp[i]] = gl.getAttribLocation(program, temp[i])),
                    gl.vertexAttribPointer(program[temp[i]], gpu.vbo['null'].stride, gl.FLOAT, false, 0, 0);
            }
            temp = vSource.uniforms
            i = temp.length;
            while (i--) {
                program[temp[i]] = gl.getUniformLocation(program, temp[i]);
            }
            temp = fSource.uniforms
            i = temp.length;
            while (i--) {
                program[temp[i]] = gl.getUniformLocation(program, temp[i]);
            }
            gpu.programs[name] = program;
            return program;
        },
        makeTexture = function makeTexture(gpu, texture) {
            //TODO
            console.log('이걸재련해야됨',texture.img)
            var gl,webglTexture;
            gl = gpu.gl,
                webglTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, webglTexture),
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img),
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR),
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR),
                gl.generateMipmap(gl.TEXTURE_2D),
                webglTexture.textrue = texture
            gpu.textures[texture] = webglTexture,
                gl.bindTexture(gl.TEXTURE_2D, null);
            return gpu.textures[texture];
        },
        makeFrameBuffer = function makeFrameBuffer(gpu, camera) {
            var gl, texture, framebuffer, renderbuffer, tArea,cvs,cvsW,cvsH,pRatio;
            cvs = camera.cvs
            if(!cvs) return
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
        }

        /////////////////////////////////////

    World = function World(id) {
        if(!id) this.error(0);
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
        if (gpu[this].gl = getGL(cvsList[this]) ) {
            renderList[this] = {},
            sceneList[this] = [],
			autoSizer[this] = null;
		}else{
			this.error(2);
		}
    },
    World.renderBefore ='WORLD_RENDER_BEFORE',
    World.renderAfter = 'WORLD_RENDER_AFTER',
    fn = World.prototype,
    fn.setAutoSize = function setAutoSize( isAutoSize ){
		var canvas, scenes;
		if( isAutoSize ){
			if( !this._autoSizer ){
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
					for(k in scenes) {
                        scenes[k].cameraUpdate()
					}
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
        tSceneList.push(scene),
        scene.cvs = cvsList[this]
        var p = gpu[this]
        var baseUpdate = function () {
            // TODO 기초 버퍼들도 씬이 월드에서 등록될떄 해야겠음..

            p.vbo['null'] = makeVBO(p, 'null', new Float32Array([0.0, 0.0, 0.0]), 3);
            if (!p.vbo['_FRAMERECT_']) {
                p.vbo['_FRAMERECT_'] = makeVBO(p, '_FRAMERECT_', [
                    -1.0, 1.0, 0.0,
                    1.0, 1.0, 0.0,
                    -1.0, -1.0, 0.0,
                    1.0, -1.0, 0.0
                ], 3),
                p.uvbo['_FRAMERECT_'] = makeUVBO(p, '_FRAMERECT_', [
                    0.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    1.0, 1.0
                ], 2),
                p.ibo['_FRAMERECT_'] = makeIBO(p, '_FRAMERECT_', [0, 1, 2, 1, 2, 3], 1);
            }
            scene.cameraUpdate()
            var vS,fS
            vS = scene.vertexShaders
            fS = scene.fragmentShaders

            console.log('~~~~~~~~~',vS)
            console.log('~~~~~~~~~',fS)

            makeProgram(p, 'color', vS.colorVertexShader, fS.colorFragmentShader);
            makeProgram(p, 'wireFrame', vS.wireFrameVertexShader, fS.wireFrameFragmentShader);
            makeProgram(p, 'bitmap', vS.bitmapVertexShader, fS.bitmapFragmentShader);
            makeProgram(p, 'bitmapGouraud', vS.bitmapVertexShaderGouraud, fS.bitmapFragmentShaderGouraud);
            makeProgram(p, 'colorGouraud', vS.colorVertexShaderGouraud, fS.colorFragmentShaderGouraud);
            makeProgram(p, 'colorPhong', vS.colorVertexShaderPhong, fS.colorFragmentShaderPhong);
            makeProgram(p, 'toonPhong', vS.toonVertexShaderPhong, fS.toonFragmentShaderPhong);
            makeProgram(p, 'bitmapPhong', vS.bitmapVertexShaderPhong, fS.bitmapFragmentShaderPhong);
            makeProgram(p, 'bitmapBlind', vS.bitmapVertexShaderBlinn, fS.bitmapFragmentShaderBlinn);
            makeProgram(p, 'postBase', vS.postBaseVertexShader, fS.postBaseFragmentShader);


            //TODO 버퍼도 업로드 해줘야하네 -_-
            var tChild = scene.children

            console.log('!!!!!!!!!',tChild)
            for(var k in tChild){
                var v = tChild[k]
                var geo = v.geometry
                if (geo) {
                    if (!p.vbo[geo]) {
                        p.vbo[geo] = makeVBO(p, geo, geo.position, 3),
                            p.vnbo[geo] = makeVNBO(p, geo, geo.normal, 3),
                            p.uvbo[geo] = makeUVBO(p, geo, geo.uv, 2),
                            p.ibo[geo] = makeIBO(p, geo, geo.index, 1);
                    }
                }
            }
            console.log(p)
        }
        baseUpdate()
        //scene등록시 현재 갖고 있는 모든 카메라 중 visible이 카메라 전부 등록
        //이후부터는 scene에 카메라의 변화가 생기면 자신의 world에게 알려야함
        return this;
    },
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
                        gl.uniform4fv(tProgram.uColor, tMaterial.color);

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
                                gl.uniform4fv(tProgram.uColor, tMaterial.wireFrameColor),
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
        // 프레임버퍼를 모아서 찍어!!!
        // TODO 사이즈가 변경될때 프레임 버퍼에 적용이 되야하는데..
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
		return
        //gl.finish();
    }
    return MoGL.ext(World, MoGL);
})();