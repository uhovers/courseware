// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let {
    WidgetBase,
    EnumCfg,
    DraftCfg,
    NoticeCenter,
    LogicBase,
    TouchUtil,
    AudioUtil,
    AnimUtil,
    ActionUtil,
} = require('../importer');
cc.Class({
    extends: LogicBase,

    properties: {
        playBtn: cc.Node,
        eventName: [cc.String],
        autoNextAnim: true,
        _cur: -1,
        mComId: 0
    },

    start() {
        TouchUtil.addClickBtn(this.playBtn, () => {
            cc.director.getScene().emit(EnumCfg.EEventName.ON_CLICK_SHOW_HIDE_NODE_SET_ENABLE, true)
            TouchUtil.removeClickBtn(this.playBtn);
            this.playBtn.active = false;
            this.playAnim(this.mComId, 0);
            return true;
        })
    },
    onAnimControllerEvent(comId, node, TrackEntry, event) {
        if (comId !== this.mComId || this.node.activeInHierarchy == false) {
            return;
        }
        cc.log(event.data.name)
        let index = this.eventName.indexOf(event.data.name);
        if (index != -1) {
            this.playAudioSubtitle(index);
            this._cur = index;
        } else if (!this.eventName[this._cur + 1]) {
            this.playAudioSubtitle(++this._cur);
        }
    },
    onAnimControllerComplete(comId, index) {
        if (comId !== this.mComId || !this.autoNextAnim || this.node.activeInHierarchy == false) {
            return;
        }
        this.playAnim(this.mComId, index + 1);
    }
});
