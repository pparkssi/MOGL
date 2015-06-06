# MoGL
* children : all of MoGL subClass
* [Constructor](#constructor)
* [UnitTest](http://projectbs.github.io/MoGL/test/MoGL.html)

**event**
* [MoGL.updated](#event---moglupdated-or-updated)

**field**

* [classId](#classid)
* [className](#classname)
* [id](#id)
* [isAlive](#isalive)
* [isUpdated](#isupdated)
* [uuid](#uuid) 
 
**method**

* [addEventListener](#addeventlistener-typestring-listenerfunction-)
* [destroy](#destroy)
* [dispatch](#dispatch-typestring-arg1-arg2-)
* [error](#error-idint-)
* [registerInstance](#)
* [removeEventListener](#removeeventlistener-typestring-listenerfunction-)
* [setId](#setid-idstring-)
* [toString](#tostring)
 
**static**

* [MoGL.count](#moglcount-classfunction-)
* [MoGL.getInstance](#)
* [MoGL.globalization](#)
* [MoGL.error](#moglerror-classnamestring-methodnamestring-idint-)
* [MoGL.ext](#moglext-childfunction-parentfunction-)

**const**
* [MoGL.BlendMode](#BlendMode.md)
* [MoGL.Camera](#Camera.md)
* [MoGL.Filter](#Filter.md)
* [MoGL.Geometry](#Geometry.md)
* [MoGL.Group](#Group.md)
* [MoGL.Material](#Material.md)
* [MoGL.Matrix](#Matrix.md)
* [MoGL.Mesh](#Mesh.md)
* [MoGL.Primitive](#Primitive.md)
* [MoGL.Program](#Program.md)
* [MoGL.Scene](#Scene.md)
* [MoGL.Texture](#Texture.md)
* [MoGL.Vertex](#Vertex.md)
* [MoGL.World](#World.md)

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
## event - MoGL.updated or 'updated'

**trigger**

isUpdated속성이 바뀔 때마다 발생.

**param**
1. isUpdated:boolean - isUpdated의 값.

**sample**

```
var scene = new Scene();
scene.addEventListener( MoGL.updated, function(isUpdated){
  console.log(isUpdated);
} );
scene.isUpdated = true;
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
└ writable 

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
└ writable

**description**

현재 인스턴스가 destroy를 통해 파괴된 객체인지 아닌지를 판별해줌.

**sample**

```
var scene = new Scene();
console.log( scene.isAlive ); //true
```

[top](#)
## isUpdated
└ writable

**description**

현재 인스턴스의 업데이트여부를 관리하는 플래그.
* 상태가 바뀌면 'updated' 이벤트가 발생함.

**sample**

```
var scene = new Scene();
scene.addEventListener( 'updated', function(v){
  console.log(v); //2. 리스너가 발동함 - true
} );
console.log( scene.isUpdated ); //false
scene.isUpdated = true; //1. 값을 바꾸면
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
## addEventListener( type:string, listener:function[, context:*, arg1, ...] )

**description**

해당 type으로 리스너를 추가함.

**param**

1. type:string - 이벤트의 이름.
2. listener:function - 이벤트를 수신할 리스너.
3. ?context:* - 리스너가 호출될 때 사용될 this의 컨텍스트. 생략 또는 거짓인 경우는 원래 디스패치 대상으로 바인딩됨.
4. ?arg1,... - 리스너가 호출될 때 dispatch의 인자 뒤에 추가적으로 받고 싶은 인자를 기술함.

**exception**

없음.

**return**

this - 메소드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var city1 = Scene();
city1.addEventListener( 'updated', function(v){
  console.log(v);
});
var city2 = Scene();
city1.addEventListener( 'updated', function(v, added){
  this == city2
  added == 10
}, city2, 10);
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
## dispatch( type:string[, arg1, arg2..] )

**description**

해당 이벤트를 통보함.

**param**

1. type:string - 통보할 이벤트의 타입.
2. ?arg1, arg2.. - 리스너에 전달한 인자.

**exception**

없음.

**return**

this - 메소드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var city1 = Scene();
city1.dispatch( 'updated', city.isUpdated );
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
## registerInstance()

**description**

MoGL.getInstance에서 찾기 위해 사전에 자신을 등록해 둠. 이후 uuid를 이용하면 실제 객체를 찾을 수 있음.

**param**

없음.

**exception**

없음.

**return**

없음.

**sample**

```javascript
var Test = function(){
  this.registerInstance();
}
Test = MoGL.ext(Test);
var a = new Test();
var b = MoGL.getInstance(a.uuid);

a === b //true
```

[top](#)
## removeEventListener( type:string, listener:function )
└removeEventListener( type:string, name:string )
└removeEventListener( type:string )

**description**

해당 이벤트로부터 리스너를 제거함.

**param**

1. type:string - 이벤트타입.
2. listener:function - 리스너함수.
3. name:string - 리스너함수의 이름.
4. 두번째인자없음 - 해당 이벤트의 모든 리스너제거.

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
## toString()

**description**

자신의 uuid를 반환함. MoGL을 상속한 모든 클래스는 toString상황에서 uuid를 반환하게 됨.

**param**

없음.

**exception**

없음.

**return**

uuid:int - 생성시 할당된 고유값.

**sample**

```javascript
var scene = new Scene();
scene.toString() == scene.uuid //true
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
## MoGL.error( className:string, methodName:string, id:int )  
  
**description**  
  
표준 예외를 보고함.  
  
**param**  
  
1. className:string - 예외가 발생한 클래스의 이름.  
2. methodName:string - 예외가 발생한 메서드의 이름.  
3. id:int - 예외별 id.  
  
**exception**  
  
주어진 인자에 따라 className + '.' + methodName + ':' + id 형태로 예외메세지가 출력됨.  
  
**return**  
  
없음  
  
**sample**  
  
```javascript  
MoGL.error( 'Scene', 'addChild', 2 );  
```  

[top](#)  
## MoGL_Class.getInstance( key:string )
  
**description**  
  
key로부터 역으로 인스턴스를 찾아냄. key에는 uuid또는 id가 올 수 있음.
* MoGL을 상속한 모든 클래스는 클래스.getInstance(uuid) 정적메서드를 자동으로 부여받음.
  
**param**  
  
1. key:string - 찾고자 하는 인스턴스의 uuid 또는 id
  
**exception**  
  
* MoGL.getInstance:0 - 해당되는 인스턴스가 없는 경우 발생.
  
**return**  
  
해당 클래스의 인스턴스
  
**sample**  
  
```javascript  
var city1 = new Scene();
city1.registerInstance();

Scene.getInstance(city1.uuid) === city1

city1.id = 'test';
Scene.getInstance('test') === city1
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
