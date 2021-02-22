// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let NoticeCenter = require('./../core/NoticeCenter');
let EnumCfg = require('./../config/EnumCfg');
class ToolUtil {
    init() {
        //-- 初始化条件
        let curScene = cc.director.getScene();
        if (this._scene === curScene) return;
        //-- 初始化过程
        this._scene = curScene;
        this._seed = 5;
    }
    randGlobal(addSeed = 0) {
        this.init();
        if (addSeed) {
            this._seed += addSeed;
        }
        this._seed = (this._seed * 9301 + 49297) % 233280;
        return this._seed / 233280.0;
    }
    setSeed(seed = 0) {
        this._seed = seed
    }
    confusionArr(arr) {
        arr = arr.concat()
        for (let i = 0, length = arr.length; i < length; ++i) {
            let index = Math.floor(this.randGlobal() * length)
            let temp = arr[index]
            arr[index] = arr[i]
            arr[i] = temp
        }
        return arr
    }
}
module.exports = new ToolUtil