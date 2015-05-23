# FreeController
* parent : [MoGL](MoGL.md)
* [Constructor](#constructor)

**field**

**method**

* [update](#update)
* [autoBindKey](#autoBindKey) - 작성해야됨
* [bindKey](#bindKey) - 작성해야됨
* [unbindKey](#unbindKey) - 작성해야됨


[top](#)
## Constructor
```javascript
FreeController(camera:Camera)
```

**description**

1. 카메라객체를 프리카메라 모드로 제어하는 컨트롤러 객체

**exception**

* 'FreeController.constructor:0' - 카메라 객체가 아닐때..

**param**

1. camera : 카메라객체.

**sample**

```javascript
// 카메라 객체만 인자로 받음
var controller = new FreeController(new Camera())
```

[top](#)
## update

**description**

1. 컨트롤러 상태를 업데이트.

**param**

없음

**sample**

```javascript
var controller = new FreeController(camera)
setInterval(function(){
  controller.update()
  world.render()
},1000/60)
```

[top](#)
