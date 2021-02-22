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
    extends: WidgetBase,

    properties: {
        Nodes: [cc.Node],
        LeftBtn: cc.Node,
        RightBtn: cc.Node,
        Cur: 0,
    },

    start() {
        TouchUtil.addClickBtn(this.LeftBtn, () => {
            this.Cur = Math.max(0, this.Cur - 1);
            this.Show();
            if (this.Cur === 0) {
                this.LeftBtn.active = false;
            }
            this.RightBtn.active = true;
            return true;
        })
        TouchUtil.addClickBtn(this.RightBtn, () => {
            this.Cur = Math.min(this.Nodes.length - 1, this.Cur + 1);
            this.Show();
            if (this.Cur === this.Nodes.length - 1) {
                this.RightBtn.active = false;
            }
            this.LeftBtn.active = true;
            return true;
        })
    },
    Show() {
        this.Nodes.forEach((node) => {
            node.active = false;
        })
        this.Nodes[this.Cur].active = true;
        this.notice(EnumCfg.EEventName.ON_SWAPNODES_SHOWCHANGESHOW, this.Cur);
    }
});
