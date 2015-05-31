var MoGL = (function() {
    var isFactory, isSuperChain, value,
        uuidProp, isAliveProp, idProp,
        uuid, counter, totalCount,
        method, prevMethod, errorMethod,
        MoGL, fn, listener;
    
    //내부용 상수
    isFactory = {factory:1},//팩토리 함수용 식별상수
    isSuperChain = {superChain:1},//생성자체인용 상수
    
    //인스턴스 카운트 시스템
    uuid = 0,//모든 인스턴스는 고유한 uuid를 갖게 됨.
    totalCount = 0, //생성된 인스턴스의 갯수를 관리함
    counter = {}, //클래스별로 관리
    
    //속성지정자용 기술객체
    uuidProp = {value:0},
    isAliveProp = {value:true, writable:true},
    idProp = {value:null, writable:true},
    value = {value:null},
    
    //메서드생성기
    prevMethod = []; //스택구조의 이전 함수이름의 배열
    method = function method(f, key) { //생성할 이름과 메서드
        return function() {
            var result;
            if (!this.isAlive) throw new Error('Destroyed Object:' + this);
            prevMethod[prevMethod.length] = errorMethod;
            errorMethod = key;
            result = f.apply(this, arguments);
            errorMethod = prevMethod.pop();
            return result;
        };
    },
    //MoGL정의
    MoGL = function MoGL() {
        uuidProp.value = uuid++;
        Object.defineProperty(this, 'uuid', uuidProp),
        Object.defineProperty(this, 'isAlive', isAliveProp),
        Object.defineProperty(this, '_id', idProp),
        counter[this.classId]++;
        totalCount++;
    },
    fn = MoGL.prototype,
    fn.classId = MoGL.uuid = uuid++,
    fn.className = 'MoGL',
    fn.error = function error(id) { //error
        throw new Error(this.className + '.' + errorMethod + ':' + id);
    },
    fn.destroy = method(function destroy() { //파괴자
        var key;
        for (key in this) {
            if (this.hasOwnProperty(key)) this[key] = null;
        }
        this.isAlive = false;
        counter[this.classId]--;
        totalCount--;
    }),
    fn.setId = method(function setId(v) { //id setter
        this.id = v;
        return this;
    }),
    fn.toString = function(){
        return this.uuid;
    },
    listener = {};
    fn.addEventListener = function(ev, f) {
        var target;
        if (!listener[this]) listener[this] = {};
        target = listener[this];
        if (!target[ev]) target[ev] = [];
        target = target[ev];
        if (target.indexOf(f) == -1) target[target.length] = f;
    },
    fn.removeEventListener = function(ev, f) {
        var target, i;
        if (listener[this] && listener[this][ev]) {
            target = listener[this][ev],
            i = target.length;
            while (i--) {
                if ((typeof f == 'string' && MoGL.functionName(target[i]) == f) || target[i] === f) {
                    target.splice(i, 1);
                }
            }
        }
    },
    fn.dispatch = function(ev,currentTime){
        var target, i, j;
        if (listener[this] && listener[this][ev]) {
            for (target = listener[this][ev], i = 0, j = target.length ; i < j ; i++) {
                target[i].call(this,currentTime);
            }
        }
    },
    Object.defineProperty(fn, 'id', { //id처리기
        get:function idGet() {return this._id;},
        set:function idSet(v) {this._id = v;}
    }),
    Object.freeze(fn);
    //인스턴스의 갯수를 알아냄
    MoGL.count = function count(cls) {
        if ( typeof cls == 'function' ) {
            return counter[cls.uuid];
        } else {
            return totalCount;
        }
    },
    MoGL.error = function error(cls, method, id) { //error
        throw new Error(cls + '.' + method + ':' + id);
    },
    MoGL.functionName = function(f){
        if ('name' in f) return f.name;
        f = f.toString();
        return f.substring(f.indexOf('function') + 8, f.indexOf('(')).trim();
    },
    //parent클래스를 상속하는 자식클래스를 만들어냄.
    MoGL.ext = function ext(child, parent) {
        var cls, oldProto, newProto, key;
        //부모검사
        if (!parent) {
            parent = MoGL;
        } else if (parent !== MoGL && !('uuid' in parent)) {
            MoGL.error( 'MoGL', 'ext', 0 );
        }
        //생성자클래스
        cls = function() {
            var arg, arg0 = arguments[0], result;
            prevMethod[prevMethod.length] = errorMethod;
            errorMethod = 'constructor';
            
            if (arg0 === isSuperChain) {//생성자체인으로 요청된 경우
                parent.call(this, isSuperChain, arguments[1]),
                child.apply(this, arguments[1]);
            } else if(this instanceof cls) {//일반적인 new생성시
                if (arg0 === isFactory) {
                    arg = arguments[1];
                } else {
                    arg = arguments;
                }
                parent.call(this, isSuperChain, arg),
                child.apply(this, arg),
                Object.seal(this),
                result = this;
            } else {//팩토리함수형태로 호출된 경우
                result = cls.call(Object.create(cls.prototype), isFactory, arguments);
            }
            errorMethod = prevMethod.pop();
            return result;
        };
        //parent와 프로토타입체인생성
        newProto = Object.create(parent.prototype);
        //기존 child의 프로토타입속성을 복사
        oldProto = child.prototype;
        for (key in oldProto) if (oldProto.hasOwnProperty(key)) newProto[key] = method(oldProto[key], key);
        //정적 속성을 복사
        for ( key in child ) if (child.hasOwnProperty(key)) cls[key] = child[key];
        value.value = cls.uuid = uuid++,
        Object.defineProperty(newProto, 'classId', value);
        value.value = MoGL.functionName(child);
        Object.defineProperty(newProto, 'className', value);
        if(!(cls.uuid in counter)) counter[cls.uuid] = 0;
        //새롭게 프로토타입을 정의함
        cls.prototype = newProto,
        Object.freeze(cls),
        Object.seal(newProto);
        return cls;
    };
    return MoGL;
})();
