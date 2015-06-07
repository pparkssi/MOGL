# MoGL Vertex Shader Interface

**description**
MoGL에 사용될 Vertex Shader의 기본 구조체 가이드

## 기본구조체

```javascript
var vertexShader = {
	attributes: [], 
	uniforms: [],
	varyings: [],
	function: [],
	main: []
}
```

**attributes**
  - Vertex Shader에 사용될 attribute 선언
  - 'Type attributeName'
  - attributeName의 첫글자는 소문자 'a'로 시작한다.
```
  attributes: ["vec3 aVertexPosition", "vec3 aVertexNormal"]
```

**uniforms**
  - Vertex Shader에 사용될 uniform 선언
  - 'Type uniformName'
  - uniformName의 첫글자는 소문자 'u'로 시작한다.
```
  uniforms: ["vec3 uPosition", "vec3 uRotation", "vec3 uColor]
```

**varyings**
  - Vertex Shader에 사용될 varying 선언
  - 'Type varyingName'
  - varyingName 첫글자는 소문자 'v'로 시작한다.
```
  varyings: ["vec3 vColor"]
```

**function**
  - Vertex Shader에 사용될 쉐이더용 함수를 설정
  - VertexShader([VertexShaderFunctions](VertexShaderFunctions.md))에 선언된 함수목록을 참조
```
  function: [VertexShader.baseFunction]
```

**main**
  - Vertex Shader의 Main함수 선언
  - 위 선언된	attributes, uniforms,varyings,function을 활용하여 main 함수를 작성
```
  main: ['' +
  'gl_Position = positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
  'vColor = uColor;\n'
  ]
```
