#Vector

- parent : [MoGL](MoGL.md)
- [Constructor](#constructor)

**method**

* [add](#add-vectorvector-)
* [addXYZ](#addxyz-xnumber-ynumber-znumber-)
* [subtract](#subtract-vector-)
* [subtractXYZ](#subtractxyz-xnumber-ynumber-znumber-)
* [scaleBy](#scaleby-scalenumber-)
* [distance](#distance-vectorvector-)
* [negate](#negate)
* [normalize](#normalize)
* [dot](#dot-vectorvector-)
* [cross](#cross-vectorvector-)

[top](#)
## Constructor

```javascript
Vector()
Vector( x:number, y:number, z:number )
Vector( arr:Array )
Vector( typedArr:Float32Array )
```

**description**

Vector 연산을...

* Vector의 메서드는 대부분 메서드체이닝을 지원함.

**param**

1. x, y, z : 각각 x, y, z 의 숫자값.
2. array : [x, y, z] 형태의 배열.
3. Floate32Array : [x, y, z] 형태의 Typed Array

**sample**

```javascript
var vector = new Vector( 1, 2, 3 );
var vector = new Vector( [1, 2, 3] );
var vector = new Vector( new Float32Array( [1, 2, 3] ) );
var vector = new Vector();

// 팩토리 함소로도 사용 가능
var vector = Vector( 1, 2, 3 );
```

[top](#)
## add( vector:[Vector](Vector.md) )

**description**

현재 [Vector](Vector.md) 객체의 x, y 및 z 요소 값에 대상 [Vector](Vector.md) 객체의 x, y, z값을 더합니다.

**param**

1. vector:[Vector](Vector.md) - x, y, z 값을 더할 [Vector](Vector.md) 객체

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector1 = Vector( 1, 2, 3 );
var vector2 = Vector( 1, 2, 3 );

vector.add( vector2 );
```

[top](#)
## addXYZ( x:number, y:number, z:number )

**description**

현재 [Vector](Vector.md) 객체의 x, y 및 z 요소 값에 인자 x, y, z값을 더합니다.

**param**

1. x:number - 현재 [Vector](Vector.md) 객체의 x값에 더할 값
2. y:number - 현재 [Vector](Vector.md) 객체의 y값에 더할 값
3. z:number - 현재 [Vector](Vector.md) 객체의 z값에 더할 값

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector = Vector( 1, 2, 3 );

vector.addXYZ( 1, 2, 3 );
```

[top](#)
## subtract( [Vector](Vector.md) )

**description**

현재 [Vector](Vector.md) 객체의 x, y 및 z 요소 값에 대상 [Vector](Vector.md) 객체의 x, y, z값을 뺍니다.

**param**

1 vector:[Vector](Vector.md) - x, y, z 값을 뺄 [Vector](Vector.md) 객체

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector1 = Vector( 1, 2, 3 );
var vector2 = Vector( 2, 3, 4 );

vector1.subtract( vector2 );
```

[top](#)
## subtractXYZ( x:number, y:number, z:number )

**description**

현재 [Vector](Vector.md) 객체의 x, y 및 z 요소 값에 인자 x, y, z값을 뺍니다.

**param**

1. x:number - 현재 [Vector](Vector.md) 객체의 x값에 뺄 값
2. y:number - 현재 [Vector](Vector.md) 객체의 y값에 뺄 값
3. z:number - 현재 [Vector](Vector.md) 객체의 z값에 뺄 값

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector = Vector( 1, 2, 3 );

vector.subtractXYZ( 1, 2, 3 );
```

[top](#)
## scaleBy( scale:number )

**description**

현재 [Vector](Vector.md) 객체의 크기를 스칼라 값만큼 조절합니다.

**param**

1. scale:number - 현재 [Vector](Vector.md) 객체의 크기를 조절할 스칼라 값.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector = Vector( 1, 2, 3 );

vector.scale( 10 );
```

[top](#)
## distance( vector:[Vector](Vector.md) )

**description**

현재 [Vector](Vector.md) 객체와 대상 [Vector](Vector.md) 객체 사이의 거리를 반환합니다.

**param**

1. vector:[Vector](Vector.md) - 사이의 거리를 알아낼 대상 [Vector](Vector.md) 객체.

**return**

number - 대상 객체와의 거리.

**sample**

```javascript
var vector1 = Vector( 1, 2, 3 );
var vector2 = Vector( 10, 20, 30 );

var distance = vector1.distance( vector2 );
```

[top](#)
## negate()

**description**

현재 [Vector](Vector.md) 객체를 역수로 설정합니다.

**param**
없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector = Vector( 1, 2, 3 );

vector.negate();
```

[top](#)
## normalize()

**description**

현재 [Vector](Vector.md)의 단위벡터화된 길이입니다.

**param**
없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var vector = Vector( 1, 2, 3 );

vector.normalize();
```

[top](#)
## dot( vector:[Vector](Vector.md) )

**description**

내적값을 반환

**param**

1. vector:[Vector](Vector.md) - 내적값을 구할 대상 [Vector](Vector.md) 객체.

**return**

number - 대상 [Vector](Vector.md) 객체와의 내적값.

**sample**

```javascript
var vector1 = Vector( 1, 2, 3 );
var vector2 = Vector( 3, 2, 1 );

var d = vector1.dot( vector2 );
```

[top](#)
## cross( vector:[Vector](Vector.md) )

**description**

현재 [Vector](Vector.md) 객체와 대상 [Vector](Vector.md) 객체와 수직인 [Vector](Vector.md)를 반환.

**param**

1. vector:[Vector](Vector.md) - 수직인 [Vector](Vector.md)를 구할 대상 [Vector](Vector.md) 객체.

**return**

vector - 두 [Vector](Vector.md)에 수직인 [Vector](Vector.md).

**sample**

```javascript
var vector1 = Vector( 1, 2, 3 );
var vector2 = Vector( 3, 2, 1 );

var c = vector1.cross( vector2 );
```