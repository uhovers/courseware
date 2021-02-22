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
        Mask: cc.Node,
        TouchNode: [cc.Node],
        BigNode: [cc.Node],
        Scale: [cc.Float],
        NeedHideShowMask: cc.Node,
        FixSHOWY: 150,
        Priority: 0,
    },

    start() {
        for (let i = 0; i < this.TouchNode.length; ++i) {
            if (typeof this.Scale[i] === 'undefined') {
                this.Scale[i] = typeof this.Scale[0] === 'undefined' ? this.TouchNode[i].scale : this.Scale[0];
            }
        }
        let parent = [];
        let prePos = [];
        let select = 0;
        let scale = [];
        for (let i = 0, touchNode; touchNode = this.TouchNode[i]; ++i) {
            parent.push(touchNode.parent);
            prePos.push(touchNode.getPosition());
            scale.push(touchNode.scale);
            TouchUtil.addClickBtn(touchNode, () => {
                if (this.BigNode[i]) {
                    this.BigNode[i].active = true;
                } else {
                    touchNode.parent = this.Mask.parent;
                    touchNode.setPosition(cc.v2(0, this.FixSHOWY));
                    touchNode.scale = this.Scale[i];
                }
                select = i;
                this.Mask.parent.active = true;
                if (this.NeedHideShowMask) {
                    this.NeedHideShowMask.active = false;
                }
                this.playAudioClick();
                return true;
            })
        }

        TouchUtil.addClickBtn(this.Mask, () => {
            if (this.BigNode[select]) {
                this.BigNode[select].active = false;
            } else {
                this.TouchNode[select].parent = parent[select];
                this.TouchNode[select].setPosition(prePos[select]);
                this.TouchNode[select].scale = scale[select];
            }
            this.Mask.parent.active = false;
            if (this.NeedHideShowMask) {
                this.NeedHideShowMask.active = true;
            }
            this.playAudioClick();
            return true;
        })
    },
    onDestroy() {
        this._super();
        for (let i = 0, touchNode; touchNode = this.TouchNode[i]; ++i) {
            TouchUtil.removeClickBtn(touchNode);
        }
        TouchUtil.removeClickBtn(this.Mask);
    },
});
