# Matrix
* parent : 없음
* [Constructor](#constructor)

**field**

**method**
없음

**static**
* [Matrix.create](#create)
* [Matrix.clone](#clone)
* [Matrix.copy](#copy)
* [Matrix.copy](#identity)
* [Matrix.invert](#invert)
* [Matrix.multiply](#multiply)

[top][#]
## Constructor

**description**
행렬연산을 cpu측에서 수행하기 위한 헬퍼객체. 
glMatrix (http://glmatrix.net/) 의 mat4 구현체중 일부를 사용함

**param**
없음.

[top](#)
## create()

**description**
Float32Array 형식의 Mat44를 생성함

**param**
없음.

**sample**
```javascript
var mat4 = Matrix.create()
```

[top](#)
## clone(base:Array or Float32Array)

**description**
Mat44 복제

**param**
1. base : Matrix.create()로 생성된 배열 또는 matrix 형식의 Array or Float32Array

**sample**
```javascript
var mat4 = Matrix.create()
var cloneMat4 = Matrix.clone(mat4)
```

[top](#)
## copy(out,base)

**description**
out 매트릭스의 값을 base의 값으로 복사

**param**
1. out : 복제될 대상
2. base : 복제 소스

**sample**
```javascript
var mat1 = Matrix.create()
var mat2 = Matrix.create()
Matrix.clone(mat1,mat2) // mat2의 값이 mat1으로 복사된다.
```

[top](#)

## identity(target)

**description**
target의 매트릭스 값을 초기화 

**param**
1. target : 초기화 대상 매트릭스

**sample**
```javascript
var mat1 = Matrix.create()
mat1.identity()
// [
//  1,0,0,0,
//  0,1,0,0,
//  0,0,1,0,
//  0,0,0,1
// ]
```

[top](#)
## invert(out,base)

**description**
target의 매트릭스 값을 반전시킨다.

**param**
1. out : 반전된 매트릭스를 반영
2. base : 반전할 매트릭스 ( base값은 변동없음)

**sample**
```javascript
var mat44 = Matrix.create()
var invertMat44 = Matrix.create()
mat1.invert(invertMat44,mat44)

```

[top](#)
## multiply(out,sourceMatrix1,sourceMatrix2)

**description**
sourceMatrix1과 sourceMatrix2의 행렬을 곱한값을 out으로 반영

**param**
1. out : 행렬곱셉을 적용할 대상
2. sourceMatrix1 : 매트릭스1 ( 곱셈후 본인은 변동없음 )
3. sourceMatrix1 : 매트릭스2 ( 곱셈후 본인은 변동없음 )

**sample**
```javascript
var out = Matrix.create()
var sourceMatrix1 = Matrix.create()
var sourceMatrix2 = Matrix.create()
mat1.invert(out, sourceMatrix1, sourceMatrix2)

```

[top](#)

