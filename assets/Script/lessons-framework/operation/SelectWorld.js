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
} = require('./../importer');
cc.Class({
    extends: LogicBase,

    properties: {
        ClickBtn: [cc.Node],
        RightBtn: [cc.Node],
        RightPic: [cc.Node],
        EndPage: cc.Node,
        Layer: [cc.Node],
    },

    start() {
        this.ClickBtn.forEach((btn) => {
            let prePos = btn.getPosition();
            TouchUtil.addClickBtn(btn, () => {
                let _index = this.RightBtn.indexOf(btn);
                btn.stopAllActions()
                btn.setPosition(prePos);
                if (_index !== -1) {
                    this.playAudioClick();
                    TouchUtil.removeClickBtn(btn);
                    let pos = btn.parent.convertToNodeSpaceAR(this.RightPic[_index].parent.convertToWorldSpaceAR(this.RightPic[_index].getPosition()));
                    btn.runAction(cc.sequence(cc.moveTo(0.5, pos), cc.callFunc((ref) => {
                        ref.active = false;
                        this.RightPic[_index].active = true;
                        this.RightPic[_index].opacity = 0;
                        this.RightPic[_index].runAction(cc.fadeIn(0.5));
                        this.scheduleOnce(() => {
                            this.Layer[_index].active = false;
                            if (this.Layer[_index + 1]) {
                                this.Layer[_index + 1].active = true;
                            } else {
                                this.EndPage.active = true;
                            }
                        }, 0.5)
                    })))
                    this.updateProgress(parseInt((_index + 1) / this.Layer.length * 100));
                } else {
                    this.playAudioWrong();
                    ActionUtil.wrongAction(btn, prePos);
                }
            })
        })
    },

});
