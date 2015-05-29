# World
* [Constructor](#constructor)

**method**

* [addAction](#addaction-actionfunction-idstring-)
* [addScene](#addscene-scenescene-)
* [getRenderer](#getrenderer-isrequestanimationframeboolean-)
* [getScene](#getscene-sceneidstring-)
* [removeAction](#removeaction-actionfunction-)
* [removeScene](#removescene-sceneidstring-)
* [render](#render)
* [setAutoSize](#setautosize-isautosizeboolean-)
* [start](#start)
* [stop](#stop)

[top](#)
## Constructor

```javascript
World('canvasID')
```

**description**

World는 MoGL의 기본 시작객체로 내부에 다수의 [Scene](Scene.md)을 소유할 수 있으며, 실제 렌더링되는 대상임.


**exception**

* 'World.constructor:0' - 캔버스 아이디가 없을때
* 'World.constructor:1' - 존재하지않는 Dom id일때
* 'World.constructor:2' - GLcontext생성 실패

**param**

1. id:string : canvasID

**sample**

```javascript
var world = new World('canvasID1');

//애니메이션 루프에 인스턴스를 넣는다.
requestAnimationFrame( world.getRenderer(true) );

//팩토리함수로도 작동
var world2 = World('canvasID2');
```

[top](#)
## addAction( action:function[, id:string] )

**description**

렌더링이 일어나기전 실행될 액션함수를 등록함.

**param**

1. action:function - 렌더시마다 선행되어 실행될 함수. id인자를 생략하는 경우 기명함수의 name속성을 통해 삭제함.
2. ?id:string  - 삭제시 사용할 id.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.addAction( function act1(){console.log('render');} );
world.removeAction( 'act1' );
```

[top](#)
## addScene( scene:Scene )

**description**

[Scene](Scene.md)객체를 world에 추가함.

**param**

1. scene:[Scene](Scene.md) - [Scene](Scene.md)의 인스턴스

**exception**

* 'World.addScene:0' - 이미 등록된 Scene.
* 'World.addScene:1' - [Scene](Scene.md)이 아닌 객체를 지정한 경우.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.addScene( Scene().setId('lobby') );
world.addScene( Scene().setId('room') );
```

[top](#)
## getRenderer( isRequestAnimationFrame:boolean )

**description**

setInterval이나 requestAnimationFrame에서 사용될 렌더링 함수를 얻음.
실제로는 본인과 바인딩된 render함수를 반환하고 한 번 반환한 이후는 캐쉬로 잡아둠.

**param**

1. isRequestAnimationFrame:boolean - 애니메이션프레임용으로 반환하는 경우는 내부에서 다시 requestAnimationFrame을 호출하는 기능이 추가됨.

**exception**

없음.

**return**

function - this.render.bind(this) 형태로 본인과 바인딩된 함수를 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.addScene( Scene().setId('lobby') );
//인터벌용
setInterval( world.getRenderer() );
//raf용
requestAnimationFrame( world.getRenderer(true) );
```

[top](#)
## getScene( sceneId:string )

**description**

sceneId에 해당되는 [Scene](Scene.md)을 얻음.

**param**

1. sceneId:string - 등록시 scene의 id. 없으면 null을 반환함.

**return**

[Scene](Scene.md) - sceneId에 해당되는 [Scene](Scene.md) 인스턴스.

**sample**

```javascript
var world = new World('canvasID');
world.addScene( new Scene().setId('lobby') );
var lobby = world.getScene( 'lobby' );
```

[top](#)
## removeAction( action:function )
└removeAction( id:string )

**description**

렌더링이 일어나기전 실행될 액션함수를 등록함.

**param**

1. action:function - addAction을 통해 지정된 함수.
2. id:string  - addAction에서 등록시 지정한 id를 우선적으로 찾은 뒤 없는 경우 함수의 name속성과 일치하는 모든 함수를 제거함.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.addAction( function act1(){console.log('render');} );
world.removeAction( 'act1' );
```

[top](#)
## removeScene( sceneId:string )

**description**

[Scene](Scene.md)객체를 world에서 제거함.
[Scene](Scene.md)을 제거하면 관련된 카메라가 지정된 render도 자동으로 제거됨.

**param**

1. sceneId:string - [Scene](Scene.md)객체에 정의된 id.

**exception**

* 'World.removeScene:0' - id에 해당되는 [Scene](Scene.md)이 존재하지 않음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
// Scene과 Camara생성 및 등록
var lobby = new Scene();
lobby.addChild( Camera() );

// Scene 등록
var world = new World('canvasID');
world.addScene( lobby.setId('lobby') );

// Scene 제거
world.removeScene( 'lobby' );
```
[top](#)
## render()

**description**

현재 화면을 그림.

**param**

없음.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
// Scene과 Camara생성 및 등록
var lobby = new Scene();
lobby.addChild( Camera() );

// Scene 등록
var world = new World('canvasID');
world.addScene( lobby.setId('lobby') );

// 실제 출력
world.render();
```

[top](#)
## setAutoSize( isAutoSize:boolean )

**description**

world에 지정된 canvas요소에 대해 viewport에 대한 자동 크기 조정을 해주는지 여부.
* 생성시 기본값은 false임.

**param**

1. isAutoSize:boolean - 자동으로 캔버스의 크기를 조정하는지에 대한 여부.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.isAutoSize(true);
```

[top](#)
## start()

**description**

requestAnimationFrame을 이용해 자동으로 render를 호출함.

**param**

없음.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.start();
```

[top](#)
## stop()

**description**

start시킨 자동 render를 정지함.

**param**

없음.

**exception**

없음.

**return**

this - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var world = new World('canvasID');
world.start();
world.stop();
```

[top](#)
