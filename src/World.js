/**
 * Created by redcamel on 2015-05-05.
 * description
 * World는 MoGL의 기본 시작객체로 내부에 다수의 Scene을 소유할 수 있으며,
 * 실제 렌더링되는 대상임. 또한 World의 인스턴스는 rendering함수 그 자체이기도 함.
 * 메서드체이닝을 위해 대부분의 함수는 자신을 반환함.
 */
var World = (function () {
    var World, fn, rectMatrix = Matrix(), f3 = new Float32Array(3),f4 = new Float32Array(4);
    World = function World(id) {
        var keys, i,ext,self = this;
        if (!id) this.error( 0);
        this._cvs = document.getElementById(id);
        if (!this._cvs) this.error(1);

        this.setViewport()
        window.addEventListener('resize',function(){
            self.setViewport()

        })

        this._renderList = [],
        this._sceneList = {},
        this.LOOP = {},

        keys = 'experimental-webgl,webgl,webkit-3d,moz-webgl,3d'.split(','), i = keys.length;
        while (i--) if (this._gl = this._cvs.getContext(keys[i], {
                alpha: true,
                depth: true,
                stencil:false,
                antialias: true,
                premultipliedAlpha:true,
                preserveDrawingBuffer:false
            })) break;
        ext = this._gl.getExtension("OES_element_index_uint");
        if (!ext) alert('no! OES_element_index_uint');
        console.log(this._gl ? id + ' : MoGL 초기화 성공!' : console.log(id + ' : MoGL 초기화 실패!!'));
    },
    fn = World.prototype,
    fn.setViewport = function(){
        //this._pixelRatio = parseFloat(width)/parseFloat(height) > 1 ? window.devicePixelRatio : 1
        var self = this;
        var width = window.innerWidth;
        var height = window.innerHeight;
        this._pixelRatio = window.devicePixelRatio;
        this._cvs.width = width * this._pixelRatio;
        this._cvs.height = height * this._pixelRatio;
        this._cvs.style.width = width + 'px';
        this._cvs.style.height = height + 'px';
        for(var k in self._sceneList) {
            self._sceneList[k]._update = 1
        }
    },
    fn.render = function render() {
        var i, k, len, tList = this._renderList;
        var scene,camera,gl,children;
        var tItem, tMaterial, tProgram, tVBO, tVNBO, tUVBO, tIBO, tFrameBuffer, tDiffuseList;
        var pVBO, pVNBO, pUVBO, pIBO, pDiffuse,pProgram;
        for (k in this.LOOP)  this.LOOP[k]()
        for (i = 0, len = tList.length; i < len; i++) {
            //console.log(tList[i],'렌더')
            if (tList[i].scene._update) tList[i].scene.update();
            //console.log('카메라렌더',tList[i].sceneID,tList[i].cameraID, '실제 Scene : ',tList[i].scene)
            scene = tList[i].scene,
            camera = scene.getChild(tList[i].cameraID);
            if(camera._visible){
                gl = scene._gl;
                if(len > 1) {
                    tFrameBuffer = scene._glFREAMBUFFERs[camera.uuid].frameBuffer;
                    gl.bindFramebuffer( gl.FRAMEBUFFER,tFrameBuffer);
                    //TODO 뷰포트가 아닌....이게...프레임에 어떻게 그릴껀지로 가야함..
                    gl.viewport(0,0, tFrameBuffer.width, tFrameBuffer.height);
                }else{
                    gl.viewport(0, 0, this._cvs.width, this._cvs.height);
                }
                children = scene._children;
                gl.clearColor(camera._r, camera._g, camera._b, camera._a);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS);
                //gl.enable(gl.CULL_FACE),gl.frontFace (gl.CCW)
                gl.enable(gl.BLEND)
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
                for(k in scene._glPROGRAMs){
                    tProgram = scene._glPROGRAMs[k];
                    gl.useProgram(tProgram);
                    gl.uniformMatrix4fv(tProgram.uPixelMatrix,false,camera._pixelMatrix._rowData);
                    gl.uniformMatrix4fv(tProgram.uCameraMatrix,false,camera.getMatrix()._rowData);
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
                    var dLite = [0,-0.5,-1], useNormalBuffer = 0;
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
                        if(pProgram != tProgram) pProgram = null ,pVBO = null, pVNBO = null, pUVBO = null, pIBO = null, pDiffuse = null;

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

                    pProgram = tProgram ,pVBO = tVBO, pVNBO = useNormalBuffer ? tVNBO : null, pUVBO = tUVBO, pIBO = tIBO, pDiffuse = textureObj;
                }
                //gl.bindTexture(gl.TEXTURE_2D, scene._glFREAMBUFFERs[camera.uuid].texture);
                //gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
        }
        ////
        // 프레임버퍼를 모아서 찍어!!!
        if(len > 1){
            gl.viewport(0, 0, this._cvs.width, this._cvs.height);
            gl.clearColor(0, 0, 0, 1);
            //gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LEQUAL)
            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            tVBO = scene._glVBOs['_FRAMERECT_'],
            tUVBO = scene._glUVBOs['_FRAMERECT_'],
            tIBO = scene._glIBOs['_FRAMERECT_'],
            tProgram = scene._glPROGRAMs['bitmap'];
            if (!tVBO) return;
            gl.useProgram(tProgram);
            gl.uniformMatrix4fv(tProgram.uPixelMatrix, false, [
                2 / this._cvs.clientWidth, 0, 0, 0,
                0, -2 / this._cvs.clientHeight, 0, 0,
                0, 0, 0, 0,
                -1, 1, 0, 1

            ]);
            gl.bindBuffer(gl.ARRAY_BUFFER, tVBO),
            gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.stride, gl.FLOAT, false, 0, 0),
            gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO),
            gl.vertexAttribPointer(tProgram.aUV, tUVBO.stride, gl.FLOAT, false, 0, 0),
            gl.uniform3fv(tProgram.uRotate, [0, 0, 0]);
            gl.uniformMatrix4fv(tProgram.uCameraMatrix, false, rectMatrix._rowData);
            for (i = 0, len = tList.length; i < len; i++) {
                scene = tList[i].scene,
                camera = scene.getChild(tList[i].cameraID)
                if (camera._visible) {
                    tFrameBuffer = scene._glFREAMBUFFERs[camera.uuid].frameBuffer;
                    f3[0] = tFrameBuffer.x + tFrameBuffer.width / 2, f3[1] = tFrameBuffer.y + tFrameBuffer.height / 2 , f3[2] = 0;
                    gl.uniform3fv(tProgram.uPosition, f3),
                    f3[0] = tFrameBuffer.width / 2, f3[1] = tFrameBuffer.height / 2, f3[2] = 1,
                    gl.uniform3fv(tProgram.uScale, f3),
                    gl.activeTexture(gl.TEXTURE0),
                    gl.bindTexture(gl.TEXTURE_2D, scene._glFREAMBUFFERs[camera.uuid].texture),
                    gl.uniform1i(tProgram.uSampler, 0),
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO),
                    gl.drawElements(gl.TRIANGLES, tIBO.numItem, gl.UNSIGNED_SHORT, 0);
                }
            }
        }
        //gl.finish();
    },
    fn.addRender = function addRender(sceneID, cameraID, index) { 
        var uuid, tScene, tList,
            i,len,temp;
        uuid = sceneID + '_' + cameraID,
        tScene = this._sceneList[sceneID],
        tList = this._renderList;
        for (i = 0, len = tList.length; i < len; i++) if (tList[i].uuid == uuid) this.error(0);
        if (!tScene) this.error(1);
        else if (!tScene.isAlive) this.error(1);
        if (tScene) {
            if (!tScene.getChild(cameraID)) this.error(2);
            else if (!tScene.getChild(cameraID).isAlive) this.error(2);
        }
        temp = {
            uuid: uuid,
            sceneID: sceneID,
            cameraID: cameraID,
            scene: tScene,
            camera: tScene.getChild(cameraID)
        };
        tScene._update = 1;
        if (index) tList[index] = temp;
        else tList.push(temp);
        return this;
    },
    fn.addScene = function addScene(sceneID, scene) { 
        if (this._sceneList[sceneID]) this.error(0);
        if (!(scene instanceof Scene )) this.error(1);
        this._sceneList[sceneID] = scene, scene._gl = this._gl, scene._cvs = this._cvs;
        return this;
    },
    fn.getScene = function getScene(sceneID) { 
        if( typeof sceneID === 'undefined' ) this.error(0);
        return this._sceneList[sceneID] ? this._sceneList[sceneID] : null;
    },
    fn.removeRender = function removeRender(sceneID, cameraID) { 
        var tList = this._renderList, i, len;
        var sTest = 0, cTest = 0;
        if (!this._sceneList[sceneID])  this.error(0);
        if (!this._sceneList[sceneID]._cameras[cameraID]) console.log('2222222222222222222222222'), this.error(1);
        for (i = 0, len = tList.length; i < len; i++) {
            if (tList[i].uuid.indexOf(sceneID) > -1) sTest = 1;
            if (tList[i].uuid.indexOf(cameraID) > -1) cTest = 1;
        }
        if (!sTest)  this.error(2);
        if (!cTest)  this.error(3);
        for (i = 0, len = tList.length; i < len; i++) if (tList[i] && tList[i].uuid == sceneID + '_' + cameraID) tList.splice(i, 1);
        return this;
    },
    fn.removeScene = function removeScene(sceneID) { 
        this._sceneList[sceneID] ? 0 : this.error(0),
        this._sceneList[sceneID]._gl = this._gl,
        delete this._sceneList[sceneID];
        return this;
    };
    return MoGL.ext(World, MoGL);
})();