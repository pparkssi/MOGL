/**
 * Created by redcamel on 2015-05-05.
 */
'use strict'
var Scene = (function () {
	var Scene, fn;
	var textureCVS = document.createElement('canvas');
	var textureCTX = textureCVS.getContext('2d');
	Scene = function Scene() {
		this._update = 0,
		this._cvs = null,
		// for JS
		this._children = {},
		this._cameras = {},
		this._textures = {},
		this._materials = {},
		this._geometrys = {},
		this._vertexShaders = {},
		this._fragmentShaders = {},
		// for GPU
		this._gl = null,
		this._glVBOs = {},
		this._glVNBOs = {},
		this._glUVBOs = {},
		this._glIBOs = {},
		this._glPROGRAMs = {},
		this._glTEXTUREs = {},
		this._glFREAMBUFFERs = {};

		var colorVertexShader = {
			attributes: ['vec3 aVertexPosition'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition', 'vec4 uColor'],
			varyings: ['vec4 vColor'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
			'vColor = uColor;'
			]
		};
		var colorFragmentShader = {
			precision: 'mediump float',
			uniforms: [],
			varyings: ['vec4 vColor'],
			function: [],
			main: ['gl_FragColor =  vColor']
		};

		var wireFrameVertexShader = {
			attributes: ['vec3 aVertexPosition'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition', 'vec4 uColor'],
			varyings: ['vec4 vColor'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
			'vColor = uColor ;'
			]
		};
		var wireFrameFragmentShader = {
			precision: 'mediump float',
			uniforms: [],
			varyings: ['vec4 vColor'],
			function: [],
			main: ['' +
			'gl_FragColor =  vColor;' +
			'']
		};

		var bitmapVertexShader = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'],
			varyings: ['vec2 vUV'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
			'vUV = aUV;'
			]
		};
		var bitmapFragmentShader = {
			precision: 'mediump float',
			uniforms: ['sampler2D uSampler'],
			varyings: ['vec2 vUV'],
			function: [],
			main: ['gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t))']
		};
		var colorVertexShaderGouraud = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV', 'vec3 aVertexNormal'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uDLite','float uLambert','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition','vec4 uColor'],
			varyings: ['vec4 vColor'],
			function: [VertexShader.baseFunction],
			main: ['' +
			' mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);\n' +
			' gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);\n' +
			' vec3 N = normalize(mv * vec4(aVertexNormal, 0.0)).xyz;\n' +
			' vec3 LD = normalize(vec4(uDLite, 0.0)).xyz;\n' +
			' float df = max(0.1,dot(N,-LD)*uLambert);\n' +
			' vColor = uColor*df;'+
			' vColor[3] = uColor[3];'
			]
		};
		var colorFragmentShaderGouraud = {
			precision: 'mediump float',
			uniforms: ['sampler2D uSampler'],
			varyings: ['vec4 vColor'],
			function: [],
			main: ['' +
			'gl_FragColor =  vColor;\n'
			]
		};
		var bitmapVertexShaderGouraud = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV', 'vec3 aVertexNormal'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uDLite','float uLambert','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'],
			varyings: ['vec2 vUV','vec4 vLight'],
			function: [VertexShader.baseFunction],
			main: ['' +
			' mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);\n' +
			' gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);\n' +
			' vec3 N = normalize(mv * vec4(aVertexNormal, 0.0)).xyz;\n' +
			' vec3 LD = normalize(vec4(uDLite, 0.0)).xyz;\n' +
			' float df = max(0.1,dot(N,-LD)*uLambert);\n' +
			' vLight = vec4(1.0,1.0,1.0,1.0)*df;\n' +
			' vLight[3] = 1.0;\n' +
			' vUV = aUV;'
			]
		};
		var bitmapFragmentShaderGouraud = {
			precision: 'mediump float',
			uniforms: ['sampler2D uSampler'],
			varyings: ['vec2 vUV','vec4 vLight'],
			function: [],
			main: ['' +
			'gl_FragColor =  (vLight*texture2D(uSampler, vec2(vUV.s, vUV.t)));\n' +
			'gl_FragColor.a = 1.0;'
			]
		};

		var colorVertexShaderPhong = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV','vec3 aVertexNormal'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition','vec4 uColor'],
			varyings: ['vec3 vNormal', 'vec3 vPosition','vec4 vColor'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);\n' +
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);\n' +
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));\n' +
			'vNormal = vec3(mv * vec4(-aVertexNormal, 0.0));\n' +
			'vColor = uColor;'
			]
		};
		var colorFragmentShaderPhong = {
			precision: 'mediump float',
			uniforms: ['float uLambert', 'vec3 uDLite'],
			varyings: ['vec3 vNormal', 'vec3 vPosition', 'vec4 vColor'],
			function: [],
			main: ['' +
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);\n' +
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);\n' +
			'vec3 specColor = vec3(1.0, 1.0, 1.0);\n' +

			'vec3 normal = normalize(vNormal);\n' +
			'vec3 lightDir = normalize(uDLite);\n' +
			'vec3 reflectDir = reflect(lightDir, normal);\n' +
			'vec3 viewDir = normalize(-vPosition);\n' +

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;\n' +
			'float specular = 0.0;\n' +

			'if(lambertian > 0.0) {\n' +
			'float specAngle = max(dot(reflectDir, viewDir), 0.0);\n' +
			'   specular = pow(specAngle, 4.0);\n' +
			'}\n' +
			'gl_FragColor = vColor*vec4(ambientColor +lambertian*diffuseColor +specular*specColor, 1.0);\n'+
			'gl_FragColor.a = vColor[3];'
			]
		};
		var toonVertexShaderPhong = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV','vec3 aVertexNormal'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition','vec4 uColor'],
			varyings: ['vec3 vNormal', 'vec3 vPosition','vec4 vColor'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);\n' +
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);\n' +
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));\n' +
			'vNormal = normalize(vec3(uCameraMatrix * rotationMTX(uRotate) * vec4(-aVertexNormal, 0.0)));\n' +

			'vColor = uColor;'
			]
		};
		var toonFragmentShaderPhong = {
			precision: 'mediump float',
			uniforms: ['float uLambert', 'vec3 uDLite'],
			varyings: ['vec3 vNormal', 'vec3 vPosition', 'vec4 vColor'],
			function: [],
			main: ['' +
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);\n' +
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);\n' +
			'vec3 specColor = vec3(1.0, 1.0, 1.0);\n' +

			'vec3 normal = normalize(vNormal);\n' +
			'vec3 lightDir = normalize(uDLite);\n' +
			'vec3 reflectDir = reflect(lightDir, normal);\n' +
			'vec3 viewDir = normalize(-vPosition);\n' +

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;\n' +
			'float specular = 0.0;\n' +

			'vec3 src = vColor.rgb;\n'+

			'if(lambertian > 0.0) {\n' +
			'float specAngle = max(dot(reflectDir, viewDir), 0.0);\n' +
			'   specular = pow(specAngle, 4.0);\n' +
			'}\n' +
			'src = src*(ambientColor +lambertian*diffuseColor +specular*specColor);\n' +

			' if(lambertian>0.95-0.5) src.rgb*=0.95;\n' +
			' else if(lambertian>0.4-0.5) src.rgb*=0.5;\n' +
			' else if(lambertian>0.3-0.5) src.rgb*=0.3;\n' +
			' else src.rgb*=0.1;\n' +

			'gl_FragColor.rgb = src.rgb;\n' +
			'gl_FragColor.a = vColor[3];'
			]
		};
		var bitmapVertexShaderPhong = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV','vec3 aVertexNormal'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'],
			varyings: ['vec2 vUV','vec3 vNormal', 'vec3 vPosition'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);\n' +
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);\n' +
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));\n' +
			'vNormal = normalize(vec3( uCameraMatrix * rotationMTX(uRotate) * vec4(-aVertexNormal, 0.0)));\n' +
			'vUV = aUV;'
			]
		};

		var bitmapFragmentShaderPhong = {
			precision: 'mediump float',
			uniforms: ['sampler2D uSampler', 'float uLambert', 'vec3 uDLite'],
			varyings: ['vec2 vUV', 'vec3 vNormal', 'vec3 vPosition'],
			function: [],
			main: ['' +
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);\n' +
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);\n' +
			'vec3 specColor = vec3(1.0, 1.0, 1.0);\n' +

			'vec3 normal = normalize(vNormal);\n' +
			'vec3 lightDir = normalize(uDLite);\n' +
			'vec3 reflectDir = reflect(lightDir, normal);\n' +
			'vec3 viewDir = normalize(-vPosition);\n' +

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;\n' +
			'float specular = 0.0;\n' +

			'if(lambertian > 0.0) {\n' +
			'float specAngle = max(dot(reflectDir, viewDir), 0.1);\n' +
			'   specular = pow(specAngle, 4.0)*uLambert;\n' +
			'}\n' +

			'gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t))*vec4(ambientColor +lambertian*diffuseColor +specular*specColor, 1.0);\n'+
			'gl_FragColor.a = 1.0;'
			]
		};
		var bitmapVertexShaderBlinn = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV','vec3 aVertexNormal'],
			uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'],
			varyings: ['vec2 vUV','vec3 vNormal', 'vec3 vPosition'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'mat4 mv = uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale);\n' +
			'gl_Position = uPixelMatrix*mv*vec4(aVertexPosition, 1.0);\n' +
			'vPosition = vec3(mv * vec4(aVertexPosition, 1.0));\n' +
			'vNormal = normalize(vec3( uCameraMatrix * rotationMTX(uRotate) * vec4(-aVertexNormal, 0.0)));\n' +
			'vUV = aUV;'
			]
		};
		var bitmapFragmentShaderBlinn = {
			precision: 'mediump float',
			uniforms: ['sampler2D uSampler', 'float uLambert', 'vec3 uDLite'],
			varyings: ['vec2 vUV', 'vec3 vNormal', 'vec3 vPosition'],
			function: [],
			main: ['' +
			'vec3 ambientColor = vec3(0.0, 0.0, 0.0);\n' +
			'vec3 diffuseColor = vec3(1.0, 1.0, 1.0);\n' +
			'vec3 specColor = vec3(1.0, 1.0, 1.0);\n' +

			'vec3 normal = normalize(vNormal);\n' +
			'vec3 lightDir = normalize(uDLite);\n' +

			'float lambertian = max(dot(lightDir,normal), 0.1)*uLambert;\n' +
			'float specular = 0.0;\n' +

			'vec3 viewDir = normalize(vPosition);\n' +

			'if(lambertian > 0.0) {\n' +
			'	vec3 halfDir = normalize(lightDir + viewDir);\n' +
			'	float specAngle = max(dot(halfDir, normal), 0.0);\n' +
			'	specular = pow(specAngle, 16.0);\n' +
			'}\n' +
			'gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t))*vec4(ambientColor +lambertian*diffuseColor +specular*specColor, 1.0);\n' +
			'gl_FragColor.a = 1.0;'
			]
		};

		var postBaseVertexShader = {
			attributes: ['vec3 aVertexPosition', 'vec2 aUV'],
			uniforms: ['mat4 uPixelMatrix', 'mat4 uCameraMatrix', 'vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'],
			varyings: ['vec2 vUV'],
			function: [VertexShader.baseFunction],
			main: ['' +
			'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
			'vUV = aUV;'
			]
		};
		var postBaseFragmentShader = {
			precision: 'mediump float',
			uniforms: ['sampler2D uSampler','vec2 uTexelSize','int uFXAA'],
			varyings: ['vec2 vUV'],
			function: [],
			main: ['' +
			'if(uFXAA==1){\n'+
			'float FXAA_REDUCE_MIN = (1.0/128.0);\n' +
			'float FXAA_REDUCE_MUL = (1.0/8.0);\n' +
			'float FXAA_SPAN_MAX = 8.0;\n' +

			'vec4 rgbNW = texture2D(uSampler, (vUV + vec2(-1.0, -1.0) * uTexelSize));\n' +
			'vec4 rgbNE = texture2D(uSampler, (vUV + vec2(1.0, -1.0) * uTexelSize));\n' +
			'vec4 rgbSW = texture2D(uSampler, (vUV + vec2(-1.0, 1.0) * uTexelSize));\n' +
			'vec4 rgbSE = texture2D(uSampler, (vUV + vec2(1.0, 1.0) * uTexelSize));\n' +
			'vec4 rgbM = texture2D(uSampler, vUV);\n' +
			'vec4 luma = vec4(0.299, 0.587, 0.114, 1.0);\n' +
			'float lumaNW = dot(rgbNW, luma);\n' +
			'float lumaNE = dot(rgbNE, luma);\n' +
			'float lumaSW = dot(rgbSW, luma);\n' +
			'float lumaSE = dot(rgbSE, luma);\n' +
			'float lumaM = dot(rgbM, luma);\n' +
			'float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n' +
			'float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n' +

			'vec2 dir = vec2(-((lumaNW + lumaNE) - (lumaSW + lumaSE)), ((lumaNW + lumaSW) - (lumaNE + lumaSE)));\n' +

			'float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),FXAA_REDUCE_MIN);\n' +
			'float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n' +
			'dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n' +
			'max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n' +
			'dir * rcpDirMin)) * uTexelSize;\n' +

			'vec4 rgbA = 0.5 * (' +
			'	texture2D(uSampler, vUV + dir * (1.0 / 3.0 - 0.5))+' +
			'	texture2D(uSampler, vUV + dir * (2.0 / 3.0 - 0.5))' +
			');\n' +

			'vec4 rgbB = rgbA * 0.5 + 0.25 * (texture2D(uSampler, vUV + dir *  -0.5)+texture2D(uSampler, vUV + dir * 0.5));\n' +
			'float lumaB = dot(rgbB, luma);\n' +
			'if ((lumaB < lumaMin) || (lumaB > lumaMax)) {\n' +
			'	gl_FragColor = rgbA;\n' +
			'}\n' +
			'else {\n' +
			'	gl_FragColor = rgbB;\n' +
			'}\n' +
			'}else{\n' +
			'	gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t));' +
			'}' +
			'']
		};

		this.addVertexShader('color', colorVertexShader),
		this.addFragmentShader('color', colorFragmentShader),
		this.addVertexShader('wireFrame', wireFrameVertexShader),
		this.addFragmentShader('wireFrame', wireFrameFragmentShader),
		this.addVertexShader('bitmap', bitmapVertexShader),
		this.addFragmentShader('bitmap', bitmapFragmentShader),
		this.addVertexShader('bitmapGouraud', bitmapVertexShaderGouraud),
		this.addFragmentShader('bitmapGouraud', bitmapFragmentShaderGouraud),
		this.addVertexShader('colorGouraud', colorVertexShaderGouraud),
		this.addFragmentShader('colorGouraud', colorFragmentShaderGouraud),
		this.addVertexShader('colorPhong', colorVertexShaderPhong),
		this.addFragmentShader('colorPhong', colorFragmentShaderPhong);
		this.addVertexShader('colorToon', toonVertexShaderPhong),
		this.addFragmentShader('colorToon', toonFragmentShaderPhong);
		this.addVertexShader('bitmapPhong', bitmapVertexShaderPhong),
		this.addFragmentShader('bitmapPhong', bitmapFragmentShaderPhong);
		this.addVertexShader('bitmapBlinn', bitmapVertexShaderBlinn),
		this.addFragmentShader('bitmapBlinn', bitmapFragmentShaderBlinn);
		this.addVertexShader('postProcess', postBaseVertexShader),
		this.addFragmentShader('postProcess', postBaseFragmentShader);
	};
	/////////////////////////////////////////////////////////////////
	var makeVBO = function makeVBO(self, name, data, stride) {
		var gl, buffer;
		gl = self._gl,
		buffer = self._glVBOs[name];
		if (buffer) return buffer;
		buffer = gl.createBuffer(),
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
		buffer.name = name,
		buffer.type = 'VBO',
		buffer.data = data,
		buffer.stride = stride,
		buffer.numItem = data.length / stride,
		self._glVBOs[name] = buffer,
		console.log('VBO생성', self._glVBOs[name]);
		return self._glVBOs[name];
	};

	var makeVNBO = function makeVNBO(self, name, data, stride) {
		var gl, buffer;
		gl = self._gl,
		buffer = self._glVNBOs[name];
		if (buffer) return buffer;
		buffer = gl.createBuffer(),
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
		buffer.name = name,
		buffer.type = 'VNBO',
		buffer.data = data,
		buffer.stride = stride,
		buffer.numItem = data.length / stride,
		self._glVNBOs[name] = buffer,
		console.log('VNBO생성', self._glVNBOs[name]);
		return self._glVNBOs[name];
	};

	var makeIBO = function makeIBO(self, name, data, stride) {
		var gl, buffer;
		gl = self._gl,
		buffer = self._glIBOs[name];
		if (buffer) return buffer;
		buffer = gl.createBuffer(),
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer),
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW),
		buffer.name = name,
		buffer.type = 'IBO',
		buffer.data = data,
		buffer.stride = stride,
		buffer.numItem = data.length / stride,
		self._glIBOs[name] = buffer,
		console.log('IBO생성', self._glIBOs[name]);
		return self._glIBOs[name];
	};

	var makeUVBO = function makeUVBO(self, name, data, stride) {
		var gl, buffer;
		gl = self._gl, buffer = self._glUVBOs[name];
		if (buffer) return buffer;
		buffer = gl.createBuffer(),
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
		buffer.name = name,
		buffer.type = 'UVBO',
		buffer.data = data,
		buffer.stride = stride,
		buffer.numItem = data.length / stride,
		self._glUVBOs[name] = buffer,
		console.log('UVBO생성', self._glUVBOs[name]);
		return self._glUVBOs[name];
	};

	var makeProgram = function makeProgram(self, name) {
		var gl, vShader, fShader, program, i;
		gl = self._gl,
		vShader = vertexShaderParser(self, self._vertexShaders[name]),
		fShader = fragmentShaderParser(self, self._fragmentShaders[name]),
		program = gl.createProgram(),
		gl.attachShader(program, vShader),
		gl.attachShader(program, fShader),
		gl.linkProgram(program),
		vShader.name = name + '_vertex', fShader.name = name + '_fragment', program.name = name;
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error( '프로그램 쉐이더 초기화 실패!' + self );
		gl.useProgram(program);
		for (i = 0; i < vShader.attributes.length; i++) {
			gl.bindBuffer(gl.ARRAY_BUFFER, self._glVBOs['null']),
			gl.enableVertexAttribArray(program[vShader.attributes[i]] = gl.getAttribLocation(program, vShader.attributes[i])),
			gl.vertexAttribPointer(program[vShader.attributes[i]], self._glVBOs['null'].stride, gl.FLOAT, false, 0, 0);
		}
		i = vShader.uniforms.length;
		while(i--){
			program[vShader.uniforms[i]] = gl.getUniformLocation(program, vShader.uniforms[i]);
		}
		i = fShader.uniforms.length;
		while(i--){
			program[fShader.uniforms[i]] = gl.getUniformLocation(program, fShader.uniforms[i]);
		}
		self._glPROGRAMs[name] = program;
		//console.log(vShader)
		//console.log(fShader)
		//console.log(program)
		return program;
	};

	var vertexShaderParser = function vertexShaderParser(self, source) {
		var gl, t0, i, resultStr, shader;
		gl = self._gl,
		shader = gl.createShader(gl.VERTEX_SHADER),
		shader.uniforms = [],
		shader.attributes = [],
		resultStr = "",
		t0 = source.attributes, i = t0.length;
		while(i--){
			resultStr += 'attribute ' + t0[i] + ';\n',
			shader.attributes.push(t0[i].split(' ')[1]);
		}
		t0 = source.uniforms, i = t0.length;
		while(i--){
			resultStr += 'uniform ' + t0[i] + ';\n',
			shader.uniforms.push(t0[i].split(' ')[1]);
		}
		t0 = source.varyings, i = t0.length;
		while(i--){
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
	};

	var fragmentShaderParser = function fragmentShaderParser(self,source){
		var gl, resultStr, i, t0, shader;
		gl = self._gl,
		shader = gl.createShader(gl.FRAGMENT_SHADER),
		shader.uniforms = [],
		resultStr = "";
		if (source.precision) resultStr += 'precision ' + source.precision + ';\n';
		else resultStr += 'precision mediump float;\n';
		t0 = source.uniforms, i = t0.length;
		while(i--){
			resultStr += 'uniform ' + t0[i] + ';\n',
			shader.uniforms.push(t0[i].split(' ')[1]);
		}
		t0 = source.varyings, i = t0.length;
		while(i--){
			resultStr += 'varying ' + t0[i] + ';\n';
		}
		resultStr += 'void main(void){\n',
		resultStr += source.main + ';\n',
		resultStr += '}\n',
		//console.log(resultStr),
		gl.shaderSource(shader, resultStr),
		gl.compileShader(shader);
		return shader;
	};


	var makeTexture = function makeTexture(self, id, image/*,resizeType*/) {
		var gl, texture;
		var img, img2, tw,th;
		gl = self._gl, texture = self._glTEXTUREs[id];
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
		img.onload = function(){
			var dw, dh;
			while (img.width > tw) tw *= 2;
			while (img.height > th) th *= 2;
			if (resize == Texture.zoomOut) {
				if (img.width < tw) tw /= 2;
				if (img.height < th) th /= 2;
			} else if (resize == Texture.zoomIn) {}
			dw = tw, dh = th,
			textureCVS.width = tw,
			textureCVS.height = th,
			textureCTX.clearRect(0, 0, tw, th);
			if (resize == Texture.crop) {
				if (img.width < tw) dw = tw / 2;
				if (img.height < th) dh = th / 2;
				textureCTX.drawImage(img, 0, 0, tw, th, 0, 0, dw, dh);
			} else if (resize == Texture.addSpace) textureCTX.drawImage(img, 0, 0, tw, th, 0, 0, tw, th);
			else textureCTX.drawImage(img, 0, 0, dw, dh);
			console.log(resize,'텍스쳐크기 자동변환', img.width, img.height, '--->', dw, dh),
			console.log(textureCVS.toDataURL()),
			img2.src = textureCVS.toDataURL();
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
		self._glTEXTUREs[id] = texture,
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	var makeFrameBuffer = function makeFrameBuffer(self, camera){
		var gl, framebuffer, texture, renderbuffer;
		gl = self._gl,
		framebuffer = gl.createFramebuffer(),
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
		var tArea = camera._renderArea ? camera._renderArea : [0, 0, self._cvs.width, self._cvs.height]
		framebuffer.x = tArea[0], framebuffer.y = tArea[1],
		framebuffer.width = tArea[2]*window.devicePixelRatio > self._cvs.width ? self._cvs.width : tArea[2]*window.devicePixelRatio,
		framebuffer.height = tArea[3]*window.devicePixelRatio >self._cvs.height ? self._cvs.height :tArea[3]*window.devicePixelRatio;

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
		self._glFREAMBUFFERs[camera.uuid] = {
			frameBuffer: framebuffer,
			texture: texture
		};
	};
/////////////////////////////////////////////////////////////////
	fn = Scene.prototype,
	fn.update = function update() { 
		var k,checks,tVBOs;
		tVBOs = this._glVBOs;
		tVBOs['null'] = makeVBO(this, 'null', new Float32Array([0.0, 0.0, 0.0]), 3);
		//for GPU
		for (k in this._children) {
			var mesh = this._children[k], _key, geo = mesh._geometry;
			if (geo) {
				_key = geo._key
				if (!this._geometrys[_key]) this.addGeometry(geo._key, geo);
				if (!tVBOs[geo]) {
					tVBOs[_key] = makeVBO(this, _key, geo._position, 3),
					this._glVNBOs[_key] = makeVNBO(this, _key, geo._normal, 3),
					this._glUVBOs[_key] = makeUVBO(this, _key, geo._uv, 2),
					this._glIBOs[_key] = makeIBO(this, _key, geo._index, 1);
				}
			}
		}
		if (!tVBOs['_FRAMERECT_']) {
			tVBOs['_FRAMERECT_'] = makeVBO(this, '_FRAMERECT_', [
				-1.0, 1.0, 0.0,
				1.0, 1.0, 0.0,
				-1.0, -1.0, 0.0,
				1.0, -1.0, 0.0
			], 3),
			this._glUVBOs['_FRAMERECT_'] = makeUVBO(this, '_FRAMERECT_', [
				0.0, 0.0,
				1.0, 0.0,
				0.0, 1.0,
				1.0, 1.0
			], 2),
			this._glIBOs['_FRAMERECT_'] = makeIBO(this, '_FRAMERECT_', [0, 1, 2, 1, 2, 3], 1);
		}
		for (k in this._cameras) {
			var camera, tRenderArea,tCVS;
			camera = this._cameras[k],
			tCVS = camera._cvs = this._cvs,
			tRenderArea = camera._renderArea;
			if (tRenderArea) {
				var wRatio = tRenderArea[2]/tCVS.width;
				var hRatio = tRenderArea[3]/tCVS.height;
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
		//console.log('this._glVNBOs :', this._glVNBOs),
		//console.log('this._glIBOs :', this._glIBOs),
		//console.log('this._glPROGRAMs :', this._glPROGRAMs),
		//console.log('this._geometrys :', this._geometrys),
		//console.log('this._materials :', this._materials),
		//console.log('this._textures :', this._textures),
		//console.log('this._vertexShaders :', this._vertexShaders),
		//console.log('this._fragmentShaders :', this._fragmentShaders),
		console.log('this._glFREAMBUFFERs :', this._glFREAMBUFFERs),
		//console.log('////////////////////////////////////////////'),
		this._update = 0;
	},
	fn.addChild = function addChild(id, mesh) {  // isAlive는 함수선언 줄에 바로 같이 씁니다.
		var k, checks,tMaterial;
		if (this._children[id]) this.error(0);
		if (!(mesh instanceof Mesh )) this.error(1);
		mesh._scene = this,
		mesh._parent = this,
		mesh.setGeometry(mesh._geometry),
		mesh.setMaterial(mesh._material),
		tMaterial =mesh._material,
		tMaterial._count++,
		checks = mesh._geometry._vertexShaders;
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
		else this._children[id] = mesh;
		this._update = 1;
		return this;
	},
	fn.addGeometry = function (id, geometry) {
		var checks, k,tVShader;
		checks = geometry._vertexShaders,
		tVShader = this._vertexShaders;
		if (this._geometrys[id]) this.error(0);
		if (!(geometry instanceof Geometry)) this.error(1);
		for (k in checks) if (typeof checks[k] == 'string') if (!tVShader[checks[k]]) this.error(2);
		this._geometrys[id] = geometry;
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
		var t = this._children[id];
		t = t ? t : this._cameras[id];
		return t ? t : null;
	},
	fn.getGeometry = function getGeometry(id) { 
		var t = this._geometrys[id];
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
		return this._children[id] ? (this._children[id]._material._count--, this._children[id]._scene = null,this._children[id]._parent = null, delete this._children[id], true) : false;
	},
	fn.removeGeometry = function removeGeometry(id) { 
		return this._geometrys[id] ? (delete this._geometrys[id], true) : false;
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