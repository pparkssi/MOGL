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
        var tSceneList, i,uuid;
        tSceneList = sceneList[this], i = tSceneList.length;
        if (!(scene instanceof Scene )) this.error(1);
        uuid = scene.uuid
        while(i--){
            if (tSceneList[i].uuid == uuid) this.error(0);
        }
        tSceneList.push(scene),
        scene._gl = glList[this],
        scene._cvs = cvsList[this];
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
        var uuid = this.toString(), self;
        if (!renderList[uuid]) {
            // 없으니까 생성
            renderList[uuid] = {}
        }
        self = this;
        if (isRequestAnimationFrame) {
            if (renderList[uuid][1]) return renderList[uuid][1]
            else {
                return renderList[uuid][1] = function (currentTime) {
                    self.render(currentTime);
                    started[uuid] = requestAnimationFrame(renderList[uuid][1]);
                }
            }
        } else {
            if (renderList[uuid][0]) return renderList[uuid][0]
            else{
                renderList[uuid][0] = function (currentTime) {
                    self.render(currentTime)
                }
                return renderList[uuid][0]
            }
        }
    },
    fn.start = function start(){
        var uuid = this.toString();
        started[uuid] = requestAnimationFrame(this.getRenderer(1));
        return this;
    },
    fn.stop = function stop(){
        var uuid = this.toString();
        cancelAnimationFrame(started[uuid])
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
        cvs = cvsList[this],
        tSceneList = sceneList[this],
        i = tSceneList.length
        this.dispatch(World.renderBefore,currentTime)
        while(i--){
            //console.log(k,'의 활성화된 카메라를 순환돌면서 먼짓을 해야함...')
            scene = tSceneList[i]
            if (scene._update) scene.update();
            cameraList = scene._cameras
            for (k in cameraList) len++
            for (k in cameraList) {
                camera = cameraList[k]
                if(camera._visible){
                    gl = scene._gl;
                    if(len > 1) {
                        tFrameBuffer = scene._glFREAMBUFFERs[camera.uuid].frameBuffer;
                        gl.bindFramebuffer( gl.FRAMEBUFFER,tFrameBuffer);
                        gl.viewport(0,0, tFrameBuffer.width, tFrameBuffer.height);
                    }else{
                        gl.viewport(0, 0, cvs.width, cvs.height);
                    }
                    children = scene._children;
                    gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS);
                    gl.enable(gl.BLEND)
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
                    gl.clearColor(camera._r, camera._g, camera._b, camera._a);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    for(k in scene._glPROGRAMs){
                        tProgram = scene._glPROGRAMs[k];
                        gl.useProgram(tProgram);
                        gl.uniformMatrix4fv(tProgram.uPixelMatrix,false,camera._pixelMatrix._rawData);
                        gl.uniformMatrix4fv(tProgram.uCameraMatrix,false,camera.getMatrix()._rawData);
                    }
                    tItem = tMaterial = tProgram = tVBO = tIBO = null;
                    for (k in children) {
                        tItem = children[k],
                        tVBO = scene._glVBOs[tItem._geometry._key],
                        tVNBO = scene._glVNBOs[tItem._geometry._key],
                        tUVBO = scene._glUVBOs[tItem._geometry._key],
                        tIBO = scene._glIBOs[tItem._geometry._key],
                        tMaterial = tItem._material,
                        tDiffuseList = tMaterial._diffuse;
                        tCulling = tItem._culling
                        if(tCulling != pCulling){
                            if(tCulling == Mesh.cullingNone) gl.disable(gl.CULL_FACE)
                            else if(tCulling == Mesh.cullingBack) gl.enable(gl.CULL_FACE),gl.frontFace (gl.CCW)
                            else if(tCulling == Mesh.cullingFront) gl.enable(gl.CULL_FACE),gl.frontFace (gl.CW)
                        }
                        var dLite = [0,-1,-1], useNormalBuffer = 0;
                        if(tDiffuseList.__indexList.length == 0){
                            if(tMaterial._shading.type == 'none'){
                                tProgram=scene._glPROGRAMs['color'];
                                gl.useProgram(tProgram);
                            }
                            else if(tMaterial._shading.type == 'toon'){
                                tProgram = scene._glPROGRAMs['colorToon'];
                                gl.useProgram(tProgram);
                                useNormalBuffer = 1;
                            }
                            else if(tMaterial._shading.type=='gouraud'){
                                tProgram = scene._glPROGRAMs['colorGouraud'];
                                gl.useProgram(tProgram);
                                useNormalBuffer = 1;
                            }
                            else if(tMaterial._shading.type=='phong'){
                                tProgram=scene._glPROGRAMs['colorPhong'];
                                gl.useProgram(tProgram);
                                useNormalBuffer = 1;
                            }
                            if(pProgram != tProgram) pProgram = null ,pVBO = null, pVNBO = null, pUVBO = null, pIBO = null, pDiffuse = null,pCulling=null;

                            if(useNormalBuffer){
                                tVNBO != pVNBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVNBO) : 0,
                                tVNBO != pVNBO ? gl.vertexAttribPointer(tProgram.aVertexNormal, tVNBO.stride, gl.FLOAT, false, 0, 0) : 0;
                                gl.uniform3fv(tProgram.uDLite, dLite);
                                gl.uniform1f(tProgram.uLambert,tMaterial._shading.lambert);
                            }
                            tVBO!=pVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVBO) : 0,
                            tVBO!=pVBO ? gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                            f4[0] = tMaterial._r,f4[1] = tMaterial._g,f4[2] = tMaterial._b,f4[3] = tMaterial._a,
                            gl.uniform4fv(tProgram.uColor, f4);
                        }else{
                            if(tMaterial._shading.type == 'none'){
                                tProgram=scene._glPROGRAMs['bitmap'],
                                gl.useProgram(tProgram);
                            }else if(tMaterial._shading.type == 'flat'){
                            }else if(tMaterial._shading.type == 'gouraud'){
                                tProgram=scene._glPROGRAMs['bitmapGouraud'];
                                gl.useProgram(tProgram);
                                useNormalBuffer = 1;
                            }else if(tMaterial._shading.type == 'phong'){
                                tProgram=scene._glPROGRAMs['bitmapPhong'];
                                gl.useProgram(tProgram);
                                useNormalBuffer = 1;
                            }else if(tMaterial._shading.type == 'blinn'){
                                tProgram=scene._glPROGRAMs['bitmapBlinn'];
                                gl.useProgram(tProgram);
                                useNormalBuffer = 1;
                            }
                            if(pProgram != tProgram) pProgram = null ,pVBO = null, pVNBO = null, pUVBO = null, pIBO = null, pDiffuse = null;

                            if(useNormalBuffer){
                                tVNBO!=pVNBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVNBO) : 0,
                                tVNBO!=pVNBO ? gl.vertexAttribPointer(tProgram.aVertexNormal, tVNBO.stride, gl.FLOAT, false, 0, 0) : 0;
                                gl.uniform3fv(tProgram.uDLite, dLite);
                                gl.uniform1f(tProgram.uLambert,tMaterial._shading.lambert);
                            }
                            tVBO != pVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVBO) : 0,
                            tVBO != pVBO ? gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0) : 0;
                            tUVBO != pUVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) : 0,
                            tUVBO != pUVBO ? gl.vertexAttribPointer(tProgram.aUV, tUVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                            gl.activeTexture(gl.TEXTURE0);
                            var textureObj = scene._glTEXTUREs[tDiffuseList.__indexList[0].id];
                            if(textureObj.loaded){
                                textureObj != pDiffuse ? gl.bindTexture(gl.TEXTURE_2D, textureObj) : 0;
                                gl.uniform1i(tProgram.uSampler, 0);
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
                        if(tMaterial._wireFrame) {
                            gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LEQUAL);
                            tProgram = scene._glPROGRAMs['wireFrame'],
                                gl.useProgram(tProgram),
                                tVBO != pVBO ? gl.bindBuffer(gl.ARRAY_BUFFER, tVBO) : 0,
                                tVBO != pVBO ? gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0) : 0,
                                f3[0] = tItem.rotateX, f3[1] = tItem.rotateY, f3[2] = tItem.rotateZ,
                                gl.uniform3fv(tProgram.uRotate, f3),
                                f3[0] = tItem.x, f3[1] = tItem.y, f3[2] = tItem.z,
                                gl.uniform3fv(tProgram.uPosition, f3),
                                f3[0] = tItem.scaleX, f3[1] = tItem.scaleY, f3[2] = tItem.scaleZ,
                                gl.uniform3fv(tProgram.uScale, f3),
                                f4[0] = tMaterial._rw, f4[1] = tMaterial._gw, f4[2] = tMaterial._bw,f4[3] = 1,
                                gl.uniform4fv(tProgram.uColor, f4),
                                gl.drawElements(gl.LINES, tIBO.numItem, gl.UNSIGNED_SHORT, 0);
                            gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS);
                        }

                        pProgram = tProgram ,pVBO = tVBO, pVNBO = useNormalBuffer ? tVNBO : null, pUVBO = tUVBO, pIBO = tIBO, pDiffuse = textureObj,pCulling=tCulling;
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
            tVBO = scene._glVBOs['_FRAMERECT_'],
            tUVBO = scene._glUVBOs['_FRAMERECT_'],
            tIBO = scene._glIBOs['_FRAMERECT_'],
            tProgram = scene._glPROGRAMs['postProcess'];
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