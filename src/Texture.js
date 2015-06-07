/**
 * Created by redcamel on 2015-05-05.
 */
var Texture = {
    zoomOut: 'zoomOut', //'zoomOut' - 이미지를 축소하여 2의 n에 맞춤.
    zoomIn: 'zoomIn', //'zoomIn' - 이미지를 확대하여 2의 n에 맞춤.
    crop: 'crop', //'crop' - 이미지를 2의 n에 맡게 좌상단을 기준으로 잘라냄.
    addSpace: 'addSpace', //' - 이미지를 2의 n에 맡게 여백을 늘림.
    diffuse: 'diffuse', //' - 디퓨즈 맵으로 등록함.
    specular: 'specular', //' - 스페큘러 맵으로 등록함.
    diffuseWrap: 'diffuseWrap', //' - 디퓨즈랩 맵으로 등록함.
    normal: 'normal', // - 노말 맵으로 등록함.
    specularNormal: 'specularNormal' // - 스페큘러노말 맵으로 등록함.
};
Object.freeze(Texture);