/**
 * 动画操作
 * by houzehang
 */
let NoticeCenter = require('./../core/NoticeCenter');
let EnumCfg = require('./../config/EnumCfg');

let AnimUtil = {

    _getAnim: (animNode) => {
        if (!animNode) return;
        return animNode.getComponent(sp.Skeleton) || animNode.getComponent(dragonBones.ArmatureDisplay);
    },

    _playAnimation: (anim, animationName, timeScale, loopTimes) => {
        if (!anim) return;

        anim.timeScale = timeScale;
        if (anim.setAnimation) {
            anim.setAnimation(0, animationName || anim.animationName, loopTimes == 0);
        } else if (anim.playAnimation) {
            anim.playAnimation(animationName || anim.animationName, typeof loopTimes === 'undefined' ? anim.loop : loopTimes);
        }
    },

    _registerCompleteCallback: (anim, callBackForDragonBones, callBackForSpine) => {
        if (!anim) return;

        if (anim.removeEventListener && anim.addEventListener) {
            anim.removeEventListener(dragonBones.EventObject.COMPLETE);
            anim.addEventListener(dragonBones.EventObject.COMPLETE, () => {
                anim.removeEventListener(dragonBones.EventObject.COMPLETE);
                callBackForDragonBones && typeof callBackForDragonBones === 'function' && callBackForDragonBones();
            });
        } else if (anim.setCompleteListener) {
            anim.setCompleteListener(callBackForSpine);
        }
    },
    _registerEventListenerCallback: (node, anim, callback = () => { }) => {
        if (!node || !anim) {
            return;
        }
        if (anim.setEventListener) {
            anim.setEventListener((TrackEntry, event) => {
                callback(node, TrackEntry, event);
            })
        }
    },
    /**
     * 播放动画
     * @param  {[type]} animNode        [dragonBones/spine节点]
     * @param  {[type]} animationName   [description]
     * @param  {[type]} loopTimes       [ 0 为无限循环]
     * @param  {[type]} animCallback    [description]
     * @return {[type]}                 [description]
     */
    play: (animNode, animationName, loopTimes, animCallback, timeScale = 1, curLoopTimes = 0, eventListener = () => { }) => {
        if (!animNode) return;

        animNode.active = true;
        let _curLoopTimes = curLoopTimes;
        let anim = AnimUtil._getAnim(animNode);
        animationName = animationName || anim.animationName;
        AnimUtil._playAnimation(anim, animationName, timeScale, loopTimes);

        let callBackForDragonBones = () => {
            animCallback && animCallback();
        };
        let callBackForSpine = (track) => {
            _curLoopTimes++;
            if (loopTimes > _curLoopTimes) {
                AnimUtil.play(animNode, animationName, loopTimes, animCallback, timeScale, _curLoopTimes, eventListener);
            } else {
                animCallback && animCallback(track);
            }
        };
        if (animCallback) {
            AnimUtil._registerCompleteCallback(anim, callBackForDragonBones, callBackForSpine);
        }
        AnimUtil._registerEventListenerCallback(animNode, anim, eventListener);
    },
    /**
     * @param {cc.node} animNode
     * @param {cc.Integer} trackIndex
     * @param {cc.String} name
     * @param {cc.Boolean} loop
     * @param {cc.Float} delay
     * @return {sp.spine.TrackEntry}
     */
    addAnimation(animNode, trackIndex, name, loop = false, delay = 0) {
        let sp_spine = animNode.getComponent(sp.Skeleton);
        if (!sp_spine || !cc.js.isNumber(trackIndex) || (!cc.js.isString(name) && name != "")) {
            console.error("addAnimation param error")
            return;
        }
        return sp_spine.addAnimation(trackIndex, name, loop, delay);
    },
    /**
     * 暂停
     * @param  {[type]} animNode [description]
     * @return {[type]}          [description]
     */
    pause: (animNode) => {
        let anim = AnimUtil._getAnim(animNode);
        if (!anim) return;
        anim.timeScale = 0;
    },

    /**
     * 继续
     * @param  {[type]} animNode         [description]
     * @param  {Number} initialTimeScale [description]
     * @return {[type]}                  [description]
     */
    resume: (animNode, initialTimeScale = 1) => {
        let anim = AnimUtil._getAnim(animNode);
        if (!anim) return;
        anim.timeScale = initialTimeScale;
    }
}

module.exports = AnimUtil;