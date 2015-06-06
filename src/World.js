/**
 * Created by redcamel on 2015-05-05.
 * description
 * World는 MoGL의 기본 시작객체로 내부에 다수의 Scene을 소유할 수 있으며,
 * 실제 렌더링되는 대상임. 또한 World의 인스턴스는 rendering함수 그 자체이기도 함.
 * 메서드체이닝을 위해 대부분의 함수는 자신을 반환함.
 */
var World = (function () {
    var getGL, glSetting,glContext, World, fn, rectMatrix = Matrix(), f3 = new Float32Array(3),f4 = new Float32Array(4);
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
    var renderList = {}, sceneList = [], cvsList = {}, glList = {}, autoSizer = {}, started ={};
    ///////////////////////////////

    World = function World(id) {
        if(!id) this.error(0);
        cvsList[this] = document.getElementById(id);
        if (!cvsList[this]) this.error(1);
        if (glList[this] = getGL(cvsList[this]) ) {
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
						scenes[k]._update = 1
                        scenes[k]._cameraUpdate()
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
        scene.gl = glList[this],
        scene.cvs = cvsList[this],
        scene._baseUpdate()
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
        var gpu
        cvs = cvsList[this],
        tSceneList = sceneList[this],
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
                    gl = scene.gl;
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
                    for(k in scene.programs){
                        tProgram = scene.programs[k];
                        gl.useProgram(tProgram);
                        camera.cvs = cvs
                        gl.uniformMatrix4fv(tProgram.uPixelMatrix,false,camera.projectionMatrix.raw);
                        gl.uniformMatrix4fv(tProgram.uCameraMatrix,false,camera.matrix.raw);
                    }
                    tItem = tMaterial = tProgram = tVBO = tIBO = null;
                    for (k in children) {
                        tItem = children[k],
                        gpu = scene.gpu
                        tVBO = gpu.vbo[tItem.geometry],
                        tVNBO = gpu.vnbo[tItem.geometry],
                        tUVBO = gpu.uvbo[tItem.geometry],
                        tIBO = gpu.ibo[tItem.geometry],
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
                             tProgram=gpu.programs['color'];
                            break
                            case  Shading.phong :
                                if(tMaterial.diffuse){
                                    tProgram=gpu.programs['bitmapPhong'];
                                    console.log('들어왔다!')
                                    //useTexture =1
                                } else {
                                    tProgram=gpu.programs['colorPhong'];
                                    //console.log('컬러퐁')
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
                        //if(useTexture){
                        //    tUVBO != pUVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) : 0,
                        //    tUVBO != pUVBO ? gl.vertexAttribPointer(tProgram.aUV, tUVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                        //    gl.activeTexture(gl.TEXTURE0);
                        //    var textureObj = tMaterial.diffuse[0];
                        //    console.log(textureObj)
                        //    if(textureObj.isLoaded){
                        //        textureObj != pDiffuse ? gl.bindTexture(gl.TEXTURE_2D, textureObj) : 0;
                        //        gl.uniform1i(tProgram.uSampler, 0);
                        //    }
                        //}

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
                            tProgram = gpu.programs['wireFrame'],
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

                        pProgram = tProgram ,pVBO = tVBO, pVNBO = useNormalBuffer ? tVNBO : null, pUVBO = tUVBO, pIBO = tIBO, pCulling=tCulling//,pDiffuse = textureObj;
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
            tVBO = gpu.vbo['_FRAMERECT_'],
            tUVBO = gpu.uvbo['_FRAMERECT_'],
            tIBO = gpu.ibo['_FRAMERECT_'],
            tProgram = gpu.programs['postProcess'];
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