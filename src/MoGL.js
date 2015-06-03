//ie11에서 Function.name이 지원되지 않는 문제 폴리필
(function(){
    var test = function test(){};
    if(!('name' in test)){ //함수에 name속성이 없다면..
        Object.defineProperty( Function.prototype, 'name', {
            get:function(){
                var f;
                if(!('__name' in this)){//캐쉬에서 없다면
                    f = this.toString();//함수를 문자열로 바꿔서 function과 ()사이의 문자열을 이름으로 추출
                    this.__name = f.substring(f.indexOf('function') + 8, f.indexOf('(')).trim() || undefined;
                }
                return this.__name;
            }
        });
    }
})();
//전역에서 사용하는 공통함수
var $method, $setPrivate, $getPrivate, $value, $getter, $setter, $color,
    GLMAT_EPSILON, SIN, COS, TAN, ATAN, ATAN2, ASIN, SQRT, CEIL, ABS, PIH, PERPI;
    
(function() {
    var VAR = {}, value = {};
    $setPrivate = function $setPrivate(cls, v) { //공용private설정
        value.value = v,
        Object.defineProperty(VAR, cls, v);
    },
    $getPrivate = function $getPrivate(cls) { //공용private읽기
        if (arguments.length == 2 ) {
            return VAR[cls][arguments[1]];
        } else {
            return VAR[cls];
        }
    };
})(),
$method = function $method(f, key) { //생성할 이름과 메서드
    return function() {
        var result, prev = $method.prev;
        if (!this.isAlive) throw new Error('Destroyed Object:' + this); //비활성객체 배제
        prev[prev.length] = $method.method, //에러가 발생한 메소드이름을 스택으로 관리
        $method.method = key, //현재 에러가 난 메소드명
        result = f.apply(this, arguments), //메소드실행
        $method.method = prev.pop(); //스택을 되돌림
        return result;
    };
},
$method.prev = [], //스택구조의 이전 함수이름의 배열
//defineProperty용 헬퍼
$value = function(prop, key){
    return {
        get:$getter(prop, key),
        set:$setter(prop, key)
    };
},
$getter = function(prop, key){
    var defaultValue = arguments.length == 3 ? arguments[3] : null;
    if (key) {
        return function getter() {
            return prop[this][key]// || defaultValue;
        };
    } else {
        return function getter() {
            return prop[this]// || defaultValue;
        };
    }
},
$setter = function(prop, key){
    if (key) {
        return function setter(v) {
            prop[this][key] = v;
        };
    } else {
        return function setter(v) {
            prop[this] = v;
        };
    }
},
$color = (function(){
    var co = [];
    return function(v){
        if (typeof v == 'string' && v.charAt(0) == '#') {
            if (v.length == 4) {
                v += v.substr(1,3)
            }
            co[0] = parseInt(v.substr(1, 2), 16) / 255,
            co[1] = parseInt(v.substr(3, 2), 16) / 255,
            co[2] = parseInt(v.substr(5, 2), 16) / 255;
            if (v.length > 7) {
                co[3] = parseFloat(v.substr(7));
                if (co[3] > 1) co[3] = 1;
            } else {
                co[3] = 1;
            }
        } else if ('r' in v) {
            co[0] = v.r, co[1] = v.g, co[2] = v.b, co[3] = 'a' in v ? v.a : 1;
        } else {
            co[0] = v[0], co[1] = v[1], co[2] = v[2], co[3] = '3' in v ? v[3] : 1;
        }
        return co;
    };
})();
//수학함수
GLMAT_EPSILON = 0.000001,
SIN = Math.sin, COS = Math.cos, TAN = Math.tan, ATAN = Math.atan, ATAN2 = Math.atan2, ASIN = Math.asin,
SQRT = Math.sqrt, CEIL = Math.ceil, ABS = Math.abs, PI = Math.PI, PIH = PI * 0.5, PERPI = 180 / PI;

var MoGL = (function() {
    var isFactory, isSuperChain, 
        value, writable,
        uuid, counter, totalCount,
        listener, ids, updated, 
        MoGL, fn;
    
    //내부용 상수
    isFactory = {factory:1},//팩토리 함수용 식별상수
    isSuperChain = {superChain:1},//생성자체인용 상수
    
    //인스턴스 카운트 시스템
    uuid = 0,//모든 인스턴스는 고유한 uuid를 갖게 됨.
    totalCount = 0, //생성된 인스턴스의 갯수를 관리함
    counter = {}, //클래스별로 관리
    
    //속성지정자용 기술객체
    writable = {value:true, writable:true},
    value = {value:null},
    
    //private용 저장소
    ids = {},//id용
    listener = {}, //이벤트 리스너용
    updated = {}, //업데이트용
    
    //MoGL정의
    MoGL = function MoGL() {
        value.value = 'uuid:' + (uuid++),
        Object.defineProperty(this, 'uuid', value), //객체고유아이디
        writable.value = true,
        Object.defineProperty(this, 'isAlive', writable),//활성화상태초기화 true
        counter[this.classId]++, //클래스별 인스턴스 수 증가
        totalCount++; //전체 인스턴스 수 증가
    },
    fn = MoGL.prototype,
    fn.classId = MoGL.uuid = 'uuid:' + (uuid++), //프로토타입수준에서 클래스의 고유아이디와
    fn.className = 'MoGL', //클래스명설정
    fn.error = function error(id) { //error처리기는 method를 통해 래핑하지 않음
        throw new Error(this.className + '.' + $method.method + ':' + id);
    },    
    fn.toString = function(){//toString상황에서 uuid를 반환함.
        return this.uuid;
    },
    Object.defineProperty(fn, 'id', { //id처리기
        get:$method(function idGet() {
            //클래스별 id저장소에서 가져옴
            if (ids[this.classId] && this.uuid in ids[this.classId]) { 
                return ids[this.classId][this];
            }
            return null; //없으면 null
        }),
        set:$method(function idSet(v) {
            if (!ids[this.classId]){ // 클래스별 저장소가 없으면 생성
                ids[this.classId] = {ref:{}};//역참조 ref는 중복확인용
            } else if(v in ids[this.classId].ref){ //역참조에 이미 존재하는 아이디면 예외
                 throw new Error(this.className + '.idSetter:0');
            }
            if(v === null && this.uuid in ids[this.classId]){ //기존id가 있는데 null온 경우 삭제
                v = ids[this.classId][this],
                delete ids[this.classId][this],
                delete ids[this.classId].ref[v];
            }else{ //정상인 경우는 정의함
                ids[this.classId][this] = v;
                ids[this.classId].ref[v] = this.uuid;
            }
        })
    }),
    Object.defineProperty(fn, 'isUpdated', { //updated처리기
        get:$method(function isUpdatedGet() {
            return updated[this] || false;
        }),
        set:$method(function isUpdatedSet(v) {
            this.dispatch( 'updated', updated[this] = v ); //set과 동시에 디스패치
        })
    }),
    fn.destroy = $method(function destroy() { //파괴자
        var key;
        for (key in this) {
            if (this.hasOwnProperty(key)) this[key] = null;
        }
        //id파괴
        if(ids[this.classId] && this.uuid in ids[this.classId][this]){
            key = ids[this.classId][this],
            delete ids[this.classId][this],
            delete ids[this.classId].ref[key];
        }
        this.isAlive = false, //비활성화
        counter[this.classId]--, //클래스별인스턴스감소
        totalCount--; //전체인스턴스감소
    }),
    fn.setId = $method(function setId(v) { //id setter
        this.id = v;
        return this;
    }),
    //이벤트시스템
    fn.addEventListener = $method(function(ev, f) {
        var target
        //private저장소에 this용 공간 초기화
        if (!listener[this]) listener[this] = {};
        target = listener[this];
        //해당 이벤트용 공간 초기화
        if (!target[ev]) target[ev] = [];
        target = target[ev];
        //기존에 없는 리스너라면 추가
        if (target.indexOf(f) == -1) target[target.length] = f;
        return this;
    }),
    fn.removeEventListener = $method(function(ev, f) {
        var target, i;
        if( f ){
            if (listener[this] && listener[this][ev]) {
                target = listener[this][ev],
                //해당이벤트의 리스너를 루프돌며 삭제
                i = target.length;
                while (i--) {
                    //삭제하려는 값이 문자열인 경우 리스너이름에 매칭, 함수인 경우는 리스너와 직접 매칭
                    if ((typeof f == 'string' && MoGL.functionName(target[i]) == f) || target[i] === f) {
                        target.splice(i, 1);
                    }
                }
            }
        }else{
            if (listener[this] && listener[this][ev]) delete listener[this][ev]; //전체를 삭제
        }
        return this;
    }),
    fn.dispatch = $method(function(ev){
        var target, arg, i, j;
        if (listener[this] && listener[this][ev]) {
            //만약 추가로 보낸 인자가 있다면 리스너에게 apply해줌.
            if(arguments.length > 1) arg = Array.prototype.slice.call(arguments, 1);
            for (target = listener[this][ev], i = 0, j = target.length ; i < j ; i++) {
                target[i].apply(this, arg);
            }
        }
        return this;
    }),
    Object.freeze(fn);
    MoGL.updated = 'updated',
    //인스턴스의 갯수를 알아냄
    MoGL.count = function count(cls) {
        if (typeof cls == 'function') {
            return counter[cls.uuid]; //클래스별 인스턴스수
        } else {
            return totalCount; //전체 인스턴스 수
        }
    },
    MoGL.error = function error(cls, method, id) { //정적함수용 에러보고함수
        throw new Error(cls + '.' + method + ':' + id);
    },
    //parent클래스를 상속하는 자식클래스를 만들어냄.
    MoGL.ext = function ext(child, parent) {
        var cls, oldProto, newProto, key, prop;
        //부모검사
        if (!parent) {
            parent = MoGL;
        } else if (parent !== MoGL && !('uuid' in parent)) {
            MoGL.error('MoGL', 'ext', 0);
        }
        //생성자클래스
        cls = function() {
            var arg, arg0 = arguments[0], result, prev = $method.prev;
            
            //생성자에서도 에러처리를 위한 스택을 정의함
            prev[prev.length] = $method.method;
            $method.method = 'constructor';
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
            $method.method = prev.pop();
            return result;
        };
        //parent와 프로토타입체인생성
        newProto = Object.create(parent.prototype);
        //기존 child의 프로토타입속성을 복사
        oldProto = child.prototype;
        for (key in oldProto) if (oldProto.hasOwnProperty(key)) newProto[key] = $method(oldProto[key], key);
        oldProto = oldProto.prop;
        if (oldProto) {
            for (key in oldProto) {
                prop = oldProto[key];
                if( prop.get ) prop.get = $method(prop.get);
                if( prop.set ) prop.set = $method(prop.set);
                Object.defineProperty(newProto, key, prop);
            }
        }
        //정적 속성을 복사
        for ( key in child ) if (child.hasOwnProperty(key)) cls[key] = child[key];
        //프로토타입레벨에서 클래스의 id와 이름을 정의해줌.
        value.value = cls.uuid = 'uuid:' + (uuid++),
        Object.defineProperty(newProto, 'classId', value);
        value.value = child.name;
        Object.defineProperty(newProto, 'className', value);
        if(!(cls.uuid in counter)) counter[cls.uuid] = 0;
        //새롭게 프로토타입을 정의함
        cls.prototype = newProto,
        Object.freeze(cls),
        Object.freeze(newProto);
        return cls;
    };
    return MoGL;
})();