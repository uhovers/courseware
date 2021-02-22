/*!
 * [widget]字幕控件
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,

    properties: {
        subtitleBaseNode: cc.Node,
        subtitleSprite: cc.Sprite,
        subtitleMoveFlag: cc.Node,
        subtitleFrame: [cc.SpriteFrame],
        // 字幕时长
        playTime: [cc.Float],
        finishAutoHide: true,
    },

    events() {
        return {
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_PLAY]: this._playByIndex,
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_PAUSE]: this._pause,
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_GOON]: this._goon,
            [EnumCfg.EEventName.SUBTITLE_CONTROLLER_HIDE]: this._hide,
        }
    },

    onLoad() {
        this._super();
    },
    _playByIndex(compId = 0, index, maxDuration) {
        if (arguments.length == 1) {
            index = compId;
            compId = 0;
        } else if (arguments.length == 2) {
            maxDuration = index;
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        if (maxDuration) {
            this.playTime[index] = maxDuration;
        }
        this._play(index);
    },
    _play(idx) {
        if(this.subtitleFrame[idx]){
            this.subtitleMoveFlag.stopAllActions();
            this.subtitleBaseNode.active = true;
            this.subtitleSprite.spriteFrame = this.subtitleFrame[idx];
            let width = this.subtitleSprite.node.width;
            this.subtitleMoveFlag.x = -1 * width/2;
            let time = this.playTime[idx] || 0;
            this.subtitleMoveFlag.active = true;
            this.subtitleMoveFlag.opacity = 255;
            this.subtitleMoveFlag.runAction(cc.sequence(
                cc.moveTo(time, width/2, this.subtitleMoveFlag.y),
                cc.callFunc(()=>{
                    this.subtitleMoveFlag.opacity = 0;
                }),
                cc.delayTime(1.4),
                cc.callFunc(()=>{
                   if(this.finishAutoHide) this.subtitleBaseNode.active = false;
                })
            ));
        }else{
            this.subtitleMoveFlag.stopAllActions();
            this.subtitleBaseNode.active = false;
        }
    },
    _hide(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this.subtitleBaseNode && (this.subtitleBaseNode.active = false);
    },
    _pause(compId = 0) {
        if (compId !== null && compId != this.compId) return;
    
    },
    _goon(compId = 0) {
        if (compId !== null && compId != this.compId) return;
    },
    onDestroy() {
        this._super();
    }
});