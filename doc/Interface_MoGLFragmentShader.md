# MoGL Fragment Shader Interface

**description**
MoGL에 사용될 Fragment Shader의 기본 구조체 가이드

## 기본구조체

```javascript
var fragmentShader = {
	precision: 'mediump float', 
	uniforms: [],
	varyings: [],
	function: [],
	main: []
}
```

**precision**
  - 프레그먼트 쉐이더에서 사용할 기본 정밀도를 선언.
  - ''로 선언시 기본 mediup float으로 선언.

**uniforms**
  - Fragment Shader에 사용될 uniform 선언
  - 'Type uniformName'
  - uniformName의 첫글자는 소문자 'u'로 시작한다.
```
  uniforms: ["vec3 uColor", "sampler2D uTexture"]
```

**varyings**
  - Fragment Shader에 사용될 varying 선언 (Vertex Shader에 입력한 Shader와 동일하게 선언)
  - 'Type varyingName'
  - varyingName 첫글자는 소문자 'v'로 시작한다.
```
  varyings: ["vec3 vColor"]
```

**function**
  - Fragment Shader에 사용될 쉐이더용 함수를 설정
  - FragmentShader([FragmentFunctions](FragmentFunctions.md))에 선언된 함수목록을 참조(0.2 버전까지는 지원하지 않음)
```
  function: []
```

**main**
  - Fragment Shader의 Main함수 선언
  - 위 선언된	attributes, uniforms,varyings,function을 활용하여 main 함수를 작성
```
  main: ['
    gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t))
  ']
```
