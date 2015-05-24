/**
 * Created by redcamel on 2015-05-18.
 */
var Shading = {
    none: function none() {
        this._shading.type = 'none';
    },
    gouraud: function gouraud() {
        this._shading.type = 'gouraud';
    },
    phong: function phong() {
        this._shading.type = 'phong';
    },
    blinn: function blinn() {
        this._shading.type = 'blinn';
    },
    flat: function flat() {
        this._shading.type = 'flat';
    },
    toon: function toon() {
        this._shading.type = 'toon';
    }
};
Object.freeze(Shading);

