# KeyBoard

**const**

```javascript
BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, PAUSE: 19, CAPSLOCK: 20, ESC: 27,
PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT_ARROW: 37, UP_ARROW: 38, RIGHT_ARROW: 39, 
DOWN_ARROW: 40, INSERT: 45, DELETE: 46,
0: 48, 1: 49, 2: 50, 3: 51, 4: 52, 5: 53, 6: 54, 7: 55, 8: 56, 9: 57, 
A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 
78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
NUMPAD_0: 96, NUMPAD_1: 97, NUMPAD_2: 98, NUMPAD_3: 99, NUMPAD_4: 100, 
NUMPAD_5: 101, NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104, NUMPAD_9: 105,
"*": 106, "+": 107, "-": 109, ".": 110, "/": 111,
F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
"=": 187, COMA: 188, "SLASH/": 191, "BACKSLASH": 220
```

**sample**

```javascript
KeyBoard.A
```

**method**

* [bindKey](#bindkeykeyint-funcfuntion)
* [unBindKey](#unbindkeykeyint)
* [unBindAll](#unbindall)

## bindKey(key:int, func:funtion)

**description**

키보드 이벤트를 발생시킬 키보드 키를 등록함..

**param**

1. key:int - KeyBoard 상수로 입력(KeyBoard.A)
2. func:function 
  - 키보드 이벤트에 반응할 이벤트를 발생시킴.
  - func 발생시 인자값으로 type과 key가 반영되어 실행됨.

**return**

없음

**sample**

```javascript
// 키바인딩
KeyBoard.bindkey(KeyBoard.A, downTest)
// 핸들러 함수
function downTest(type, key) {
    if (type == 'keydown') console.log(type, key, '가 다운')
    if (type == 'keyup') console.log(type, key, '가 업')
}
```

[top](#)

## unBindkey(key:int)

**description**

등록된 키보드 이벤트 키를 삭제함

**param**

1. key:int - KeyBoard 상수로 입력(KeyBoard.A)

**return**

없음

**sample**

```javascript
KeyBoard.unBindkey(KeyBoard.A)
```

[top](#)

## unBindAll()

**description**

현재 등록되어진 키보드 이벤트키를 모두삭제

**param**

없음

**return**

없음

**sample**

```javascript
KeyBoard.unBindAll()
```

[top](#)
