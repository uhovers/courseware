// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//  -- ty

let {
    WidgetBase,
    EnumCfg,
    DraftCfg,
    NoticeCenter,
    LogicBase,
    TouchUtil,
} = require('../importer');
cc.Class({
    extends: LogicBase,

    properties: {
        ClickNode: [cc.Node],
        SetNode: [cc.Node],
        SpriteFrame: [cc.SpriteFrame],
        HasClickSound: true,
    },
    start() {
        for (let i = 0, btn; btn = this.ClickNode[i]; ++i) {
            TouchUtil.addClickBtn(btn, () => {
                let setNode = this.SetNode[i] || this.SetNode[0];
                if (setNode.getComponent(cc.Sprite).spriteFrame == this.SpriteFrame[i]) {
                    return;
                }
                setNode.getComponent(cc.Sprite).spriteFrame = this.SpriteFrame[i];
                if (this.HasClickSound) {
                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK);
                }
            });
        }
    },
});
