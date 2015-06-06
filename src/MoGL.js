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
var $setPrivate, $getPrivate, $writable, $readonly, $value, $getter, $setter, $color,
    GLMAT_EPSILON, SIN, COS, TAN, ATAN, ATAN2, ASIN, SQRT, CEIL, ABS, PIH, PERPI;
    
(function() {
    var VAR = {}, value = {};
    $setPrivate = function $setPrivate(cls, v) { //공용private설정
        $value.value = v,
        Object.defineProperty(VAR, cls, $value);
    },
    $getPrivate = function $getPrivate(cls) { //공용private읽기
        if (arguments.length == 2 ) {
            return VAR[cls][arguments[1]];
        } else {
            return VAR[cls];
        }
    };
})(),
//defineProperty용 헬퍼
$writable = {value:true, writable:true},
$readonly = {value:null},
$value = function(prop, key){
    if (arguments.length == 3) {
        return {
            get:$getter(prop, key, arguments[2]),
            set:$setter(prop, key)
        };
    } else {
        return {
            get:$getter(prop, key),
            set:$setter(prop, key)
        };
    }
},
$getter = function(prop, key){
    var defaultValue = arguments.length == 3 ? arguments[2] : null;
    if (key) {
        return function getter() {
            var p = prop[this];
            return key in p ? p[key] : defaultValue;
        };
    } else {
        return function getter() {
            return this.uuid in prop ? prop[this] : defaultValue;
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
    var wrapper, method, prev,
        uuid, counter, totalCount,
        listener, ids, updated, uuid2instance,
        MoGL, mock, fn, fnProp;
    //lib
    prev = [], //스택구조의 이전 함수이름의 배열
    wrapper = (function(){
        var wrap;
        wrap = function wrap(f, key) { //생성할 이름과 메서드
            return function() {
                var result;
                if (!this.isAlive) throw new Error('Destroyed Object:' + this); //비활성객체 배제
                prev[prev.length] = method, //에러가 발생한 메소드이름을 스택으로 관리
                method = key, //현재 에러가 난 메소드명
                result = f.apply(this, arguments), //메소드실행
                method = prev.pop(); //스택을 되돌림
                return result;
            };
        };
        return function(cls, newProto, f, prop, notFreeze) {
            var k, v;
            //정적 속성을 복사
            for (k in f) {
                if (f.hasOwnProperty(k)) {
                    cls[k] = f[k];
                }
            }
            //프로토타입레벨에서 클래스의 id와 이름을 정의해줌.
            $value.value = cls.uuid = 'uuid:' + (uuid++),
            Object.defineProperty(newProto, 'classId', $value);
            $value.value = f.name,
            Object.defineProperty(newProto, 'className', $value);
            if(!(cls.uuid in counter)) counter[cls.uuid] = 0;
            f = f.prototype;
            for (k in f) {
                if (f.hasOwnProperty(k)) {
                    if (typeof f[k] == 'function') {
                        newProto[k] = wrap(f[k], k);
                    } else {
                        newProto[k] = f[k];
                    }
                }
            }
            //속성지정자처리
            if (prop) {
                for (k in prop) {
                    v = prop[k];
                    if (v.get) v.get = wrap(v.get, k + 'Get');
                    if (v.set) v.set = wrap(v.set, k + 'Set');
                    Object.defineProperty(newProto, k, v);
                }
            }
            //새롭게 프로토타입을 정의함
            cls.prototype = newProto,
            Object.freeze(cls);
            if(!notFreeze) Object.freeze(newProto);
            return cls;
        };
    })(),
    uuid = 0,//모든 인스턴스는 고유한 uuid를 갖게 됨.
    totalCount = 0, //생성된 인스턴스의 갯수를 관리함
    counter = {}, //클래스별로 관리
    //private
    ids = {},
    listener = {},
    updated = {},
    uuid2instance = {},
    //MoGL정의
    MoGL = function MoGL() {
        $value.value = 'uuid:' + (uuid++),
        Object.defineProperty(this, 'uuid', $value), //객체고유아이디
        $writable.value = true,
        Object.defineProperty(this, 'isAlive', $writable),//활성화상태초기화 true
        counter[this.classId]++, //클래스별 인스턴스 수 증가
        totalCount++; //전체 인스턴스 수 증가
    },
    fnProp = {
        id:{
            get:function idGet() {
                //클래스별 id저장소에서 가져옴
                if (ids[this.classId] && this.uuid in ids[this.classId]) { 
                    return ids[this.classId][this];
                }
                return null; //없으면 null
            },
            set:function idSet(v) {
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
            }
        },
        isUpdated:{
            get:function isUpdatedGet() {
                return updated[this] || false;
            },
            set:function isUpdatedSet(v) {
                this.dispatch( 'updated', updated[this] = v ); //set과 동시에 디스패치
            }
        }
    },
    fn = MoGL.prototype,
    fn.destroy = function destroy() { //파괴자
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
        delete uuid2instance[this],
        this.isAlive = false, //비활성화
        counter[this.classId]--, //클래스별인스턴스감소
        totalCount--; //전체인스턴스감소
    },
    fn.registerInstance = function(){
        uuid2instance[this] = this;
        
    },
    fn.setId = function setId(v) { //id setter
        this.id = v;
        return this;
    },
    //이벤트시스템
    fn.addEventListener = function(ev, f/*, context, arg1*/) {
        var target
        //private저장소에 this용 공간 초기화
        if (!listener[this]) listener[this] = {};
        target = listener[this];
        //해당 이벤트용 공간 초기화
        if (!target[ev]) target[ev] = [];
        target = target[ev];
        target[target.length] = {
            f:f, 
            cx:arguments[2] || this, 
            arg:arguments.length > 3 ? Array.prototype.slice.call(arguments, 3) : null
        };
        return this;
    },
    fn.removeEventListener = function(ev, f) {
        var target, i;
        if( f ){
            if (listener[this] && listener[this][ev]) {
                target = listener[this][ev],
                //해당이벤트의 리스너를 루프돌며 삭제
                i = target.length;
                while (i--) {
                    //삭제하려는 값이 문자열인 경우 리스너이름에 매칭, 함수인 경우는 리스너와 직접 매칭
                    if ((typeof f == 'string' && target[i].f.name == f) || target[i].f === f) {
                        target.splice(i, 1);
                    }
                }
            }
        }else{
            if (listener[this] && listener[this][ev]) delete listener[this][ev]; //전체를 삭제
        }
        return this;
    },
    fn.dispatch = function(ev){
        var target, arg, i, j, k, l;
        if (listener[this] && listener[this][ev]) {
            //만약 추가로 보낸 인자가 있다면 리스너에게 apply해줌.
            if(arguments.length > 1) arg = Array.prototype.slice.call(arguments, 1);
            for (target = listener[this][ev], i = 0, j = target.length ; i < j ; i++) {
                k = target[i];
                if (arg) {
                    if (k.arg) {
                        k.f.apply(k.cx, arg.concat(k.arg));
                    } else{
                        k.f.apply(k.cx, arg);
                    }
                } else {
                    if (k.arg) {
                        k.f.apply(k.cx, k.arg);
                    } else{
                        k.f.call(k.cx);
                    }
                }
            }
        }
        return this;
    },
    MoGL.count = function count(cls) { //인스턴스의 갯수를 알아냄
        if (cls instanceof MoGL) {
            return counter[cls]; //클래스별 인스턴스수
        } else {
            return totalCount; //전체 인스턴스 수
        }
    },
    MoGL.error = function error(cls, method, id) { //정적함수용 에러보고함수
        throw new Error(cls + '.' + method + ':' + id);
    },
    MoGL.getInstance = function getInstance(v){
        if (v in uuid2instance) {
            return uuid2instance[v];
        } else {
            MoGL.error('MoGL', 'getInstance', 0);
        }
    },
    MoGL.ext = (function(){
        var isFactory, isSuperChain;
        isFactory = {factory:1},//팩토리 함수용 식별상수
        isSuperChain = {superChain:1};//생성자체인용 상수
        return function ext(child, parent, prop) { //parent클래스를 상속하는 자식클래스를 만들어냄.
            var cls;
            if (parent !== MoGL && !(parent.prototype instanceof MoGL)) MoGL.error('MoGL', 'ext', 0);
            return wrapper(cls = function() {
                var arg, arg0 = arguments[0], result;
                prev[prev.length] = method,
                method = 'constructor';
                if (arg0 === isSuperChain) {
                    parent.call(this, isSuperChain, arguments[1]),
                    child.apply(this, arguments[1]);
                } else if (this instanceof cls) {
                    if (arg0 === isFactory) {
                        arg = arguments[1];
                    } else {
                        arg = arguments;
                    }
                    parent.call(this, isSuperChain, arg),
                    child.apply(this, arg),
                    Object.seal(this),
                    result = this;
                } else {
                    result = cls.call(Object.create(cls.prototype), isFactory, arguments);
                }
                method = prev.pop();
                return result;
            }, Object.create(parent.prototype), child, prop);
        };
    })(),
    MoGL.updated = 'updated',
    wrapper(MoGL, fn, MoGL, fnProp, true);
    fn = MoGL.prototype;
    fn.error = function error(id) { //error처리기는 method를 통해 래핑하지 않음
        throw new Error(this.className + '.' + method + ':' + id);
    },    
    fn.toString = function(){//toString상황에서 uuid를 반환함.
        return this.uuid;
    },
    Object.freeze(fn);
    return MoGL;
})();