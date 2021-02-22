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
    TouchUtil
} = require('../importer');
cc.Class({
    extends: LogicBase,

    properties: {
        ClickNode: [cc.Node],
        MoveNode: [cc.Node],
        NodePos: [cc.Node],
        HasClickSound: true,
        DefaultIndex: -1,
    },
    start() {
        for (let i = 0, btn; btn = this.ClickNode[i]; ++i) {
            TouchUtil.addClickBtn(btn, () => {
                let move_node = this.MoveNode[i] || this.MoveNode[0] || this.ClickNode[i];
                let new_pos = move_node.parent.convertToNodeSpaceAR(this.NodePos[i].parent.convertToWorldSpaceAR(this.NodePos[i].getPosition()));
                if (Math.abs(move_node.x - new_pos.x) < 1 && Math.abs(move_node.y - new_pos.y) < 1) {
                    return;
                }
                move_node.setPosition(new_pos);
                if (this.HasClickSound) {
                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, {
                        audioType: EnumCfg.EAudioType.CLICK
                    });
                }
            });
        }
    },
});
