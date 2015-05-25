# VertexShaderFunctions

**description**

버텍스 쉐이더에서 사용할 수있는 기본 함수 문자열을 제공. 

1. VertexShader.baseFunction : 기본 매트릭스 함수를 제공.
  - mat4 positionMTX(vec3 t){...} vec3을 입력하면 4x4 포지션 매트릭스를 반환
  - mat4 scaleMTX(vec3 t){...} vec3을 입력하면 4x4 스케일 매트릭스를 반환
  - mat4 rotationMTX(vec3 t){...} vec3을 입력하면 4x4 회전 매트릭스를 반환
