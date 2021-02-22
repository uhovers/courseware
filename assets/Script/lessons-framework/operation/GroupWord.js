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
        AnsCard: [cc.Node],
        AskNode: cc.Node,
        AudioIndex: [cc.Integer],
        Next: cc.Node,
        //AnsFontPosNode: [cc.Node],
        _cur: 0,
        _OldPos: [],
    },

    start() {
        //吞噬触摸
        TouchUtil.addClickBtn(this.node, () => {
            return true;
        })
        this.ClickBtn.forEach((btn, index) => {
            let prePos = btn.getPosition();
            TouchUtil.addClickBtn(btn, () => {
                let _index = this.RightBtn.indexOf(btn);
                btn.stopAllActions();
                btn.setPosition(prePos);
                if (_index !== -1) {
                    TouchUtil.removeClickBtn(btn);
                    if (this.AudioIndex[_index] == undefined) {
                        this.playAudioSubtitle(_index);
                    } else {
                        this.playAudioSubtitle(this.AudioIndex[_index]);
                    }
                    let temp = cc.instantiate(this.AskNode);
                    temp.parent = this.AskNode.parent;
                    if (this._OldPos[this._cur] === undefined) {
                        this._OldPos[this._cur] = this.AnsCard[this._cur].parent.convertToWorldSpaceAR(this.AnsCard[this._cur].getPosition());
                    }
                    if (this._OldPos[_index] === undefined) {
                        this._OldPos[_index] = this.AnsCard[_index].parent.convertToWorldSpaceAR(this.AnsCard[_index].getPosition());
                    }
                    let pos = temp.parent.convertToNodeSpaceAR(this._OldPos[this._cur]);
                    temp.zIndex = 1;
                    temp.runAction(cc.sequence(cc.moveTo(0.5, pos), cc.callFunc((ref) => {
                        ref.destroy();
                    })));

                    let card = this.AnsCard[_index];
                    pos = card.parent.convertToNodeSpaceAR(this._OldPos[this._cur]);
                    card.setPosition(pos);

                    pos = btn.parent.convertToNodeSpaceAR(this._OldPos[this._cur]);
                    btn.zIndex = 1;
                    btn.runAction(cc.sequence(cc.moveTo(0.5, pos), cc.callFunc((ref) => {
                        ref.active = false;
                        card.active = true;
                        card.runAction(cc.fadeIn(0.5));
                    })))
                    ++this._cur;
                    this.updateProgress(parseInt(this._cur / this.AnsCard.length * 100));
                } else {
                    this.playAudioWrong();
                    ActionUtil.wrongAction(btn, prePos);
                }
            })
        })
        TouchUtil.addClickBtn(this.Next, () => {
            this.node.active = false;
            return true;
        })
    },

});
