# MoGL
* children : all of MoGL subClass
* [Constructor](#constructor)
* [UnitTest](http://projectbs.github.io/MoGL/test/MoGL.html)

**field**

* [classId](#classid)
* [className](#classname)
* [id](#id)
* [isAlive](#isalive)
* [uuid](#uuid) 
 
**method**

* [destroy](#destroy)
* [error](#error-idint-)
* [setId](#setid-idstring-)
 
**static**

* [MoGL.count](#moglcount-classfunction-)
* [MoGL.ext](#moglext-childfunction-parentfunction-)

[top](#)
## Constructor

```javascript
MoGL()
```

**description**

MoGL 라이브러리의 모든 클래스는 MoGL을 상속함. 보통 직접적으로 MoGL 클래스를 사용하는 경우는 없음.

**param**

없음.

**sample**

```javascript
var instance = new MoGL();
```

[top](#)
## classId

**description**

현재 인스턴스의 클래스에 대한 고유 uuid.

**sample**

```
var scene = new Scene();
console.log( scene.classId == Scene.uuid ); 
```

[top](#)
## className

**description**

현재 인스턴스의 클래스이름.

**sample**

```
var scene = new Scene();
console.log( scene.className == 'Scene' ); //true
```

[top](#)
## id

**description**

사용자가 임의로 정의한 id.

**sample**

```
var scene = new Scene();
scene.id = 'test1';
console.log( scene.id ); //'test1'
```

[top](#)
## isAlive

**description**

현재 인스턴스가 destroy를 통해 파괴된 객체인지 아닌지를 판별해줌.

**sample**

```
var scene = new Scene();
console.log( scene.isAlive ); //true
```

[top](#)
## uuid

**description**

MoGL을 상속한 모든 클래스의 인스턴스는 식별할 수 있는 고유값인 uuid를 갖게 됨. uuid는 0이상의 정수임.
또한 MoGL 자신과 MoGL을 상속한 모든 클래스는 정적속성으로서 uuid를 갖게 됨.

**sample**

```
var scene = new Scene();
console.log( scene.uuid ); //인스턴스의 uuid
console.log( Scene.uuid ); //클래스의 uuid
```

[top](#)
## destroy()

**description**

생성된 객체를 파괴함.

**param**

없음.

**exception**

없음.

**return**

없음.

**sample**

```javascript
var city1 = Scene();
city1.destroy();
```

[top](#)
## error( id:int )

**description**

특정 id로 에러를 보고함.

**param**

1. id:int - 에러의 고유 id.

**exception**

에러함수는 무조건 예외를 발생시키며 에러메세지는 '클래스명.메서드명:id' 형태로 출력됨.
* 이 메서드는 외부에서 사용하지 못하고 내부의 메서드 구현시 사용하는 시스템임.

**return**

없음.

**sample**

```javascript
var Test = function(){}
Test.prototype.action = function(){
  this.error(0);
};
Test = MoGL.ext(Test);
var a = new Test();
try{
  a.action();
}catch(e){
  console.log( e.toString() ); //'Test.action:0'
}
```


[top](#)
## setId( id:string )

**description**

자신의 id를 설정한 뒤 다시 자신을 반환하여 체이닝을 일으킴.

**param**

1. id:string - 고유 id.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var scene = new Scene();
scene.addGeometry( new Geometry( vertex, index ).setId('test') );
```

[top](#)
## MoGL.count( [class:function] )

**description**

해당 클래스로 생성된 인스턴스의 수를 반환함. 생략시 전체 인스턴스의 수를 반환함.

**param**

1. ?class:function - 파악하고자 하는 인스턴스의 클래스. 생략 시 전체 인스턴스 수가 반환됨.

**exception**

없음.

**return**

int - 인스턴스의 수.

**sample**

```javascript
console.log( MoGL.count(Scene) );
```


[top](#)
## MoGL.ext( child:function[, parent:function] )

**description**

parent 클래스를 상속하는 child 클래스를 생성함.
* 프로토타입 체인 형식이 아니라 부모의 프로토타입속성을 자식에게 복사하는 형태로 상속됨.
* child의 함수는 유지되지 않고 새로운 함수로 반환됨.
* 새로 생성된 함수는 팩토리함수 기능을 자동으로 제공하고 생성자 체인을 자동으로 생성함.
* 생성된 클래스는 uuid속성을 갖게 됨.

**param**

1. child:function - parent로부터 상속받을 자식클래스로 미리 child.prototype에 원하는 메서드를 다 정의한 후 사용함.
2. ?parent:function - 반드시 MoGL.ext로부터 생성된 클래스나 최상위 MoGL클래스만 올 수 있음. 부모클래스의 prototype속성 일체는 새로 생성되는 자식 클래스의 prototype에 래핑되어 복사됨. child함수의 정적 속성도 전부 복사됨. 생략시 기본값은 MoGL임.

**exception**

* 'MoGL.ext:0' - parent가 MoGL.ext로 만들어진 클래스가 아니고 MoGL도 아닌 경우 발생.

**return**

function - 상속받은 새로운 클래스함수.

**sample**

```javascript
//일반적인 부모 클래스를 정의
var parent = function( a, b ){
	this.a = a;
	this.b = b;
};
parent.prototype.printA = function(){
	return this.a;
};
parent.prototype.printB = function(){
	return this.b;
};

//최상위 MoGL로 부터 상속받음.
parent = MoGL.ext( parent, MoGL );

//일반적인 자식클래스를 정의
var child = function( a, b, c ){
	this.c = c;
};
child.prototype.printC = function(){
	return this.c;
};

//MoGL.ext로 생성된 parent로 부터 상속
child = MoGL.ext( child, parent );

//일반적인 new구문으로 생성가능.
var instance1 = new child( 1, 2, 3 );
instance1.printA() == 1
instance1.printB() == 2
instance1.printC() == 3

//팩토리함수 형태로도 인스턴스 생성가능.
var instance2 = child( 4, 5, 6 );
instance2.printA() == 4
instance2.printB() == 5
instance2.printC() == 6
```

[top](#)
