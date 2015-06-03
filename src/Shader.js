var Shader = (function () {
    var code,
        Shader, fn;

    //private
    code = {},
    //shared private
    $setPrivate('Shader', {
    }),
  
    Shader = function Shader(v) {
        code[this] = v;
    },
    fn = Sahder.prototype,
    fn.prop = {
        code:{get:$getter(vertexCount)}
    };
    return MoGL.ext(Shader);
})();