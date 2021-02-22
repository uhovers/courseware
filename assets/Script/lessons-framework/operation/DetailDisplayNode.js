// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//点击 图片 放大显示 再点击缩小
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
        Mask: [cc.Node], // mask 
        Pic: [cc.Node],  //点击（小图）
        DetailNode: [cc.Node],//放大显示  节点
    },

    start() {
        let prePos = null;
        let preScale = null;
        let preZindex = null;
        let canSelece = true;
        let select_index = -1;
        TouchUtil.addClickBtn(this.node, () => {
            if (select_index!=-1) {
                this.playAudioClick();
                if (this.DetailNode[select_index]) {
                    this.DetailNode[select_index].active = false;
                    this.Pic[select_index].active = true;
                } else {
                    this.Pic[select_index].runAction(cc.spawn(cc.moveTo(0.2, prePos), cc.scaleTo(0.2, preScale)));
                    select.zIndex = preZindex;
                }
                select_index = -1;
                if (this.Mask[1]) {
                    this.Mask[1].active = false;
                }
                if (this.Mask[0]) {
                    this.Mask[0].active = true;
                }
                this.scheduleOnce(() => {
                    canSelece = true;
                }, 0.2);
            }
        })
        for (let i = 0, pic; pic = this.Pic[i]; ++i) {
            let picPos = pic.getPosition();
            let picZindex = pic.zIndex;
            let picScale = pic.scaleX;
            TouchUtil.addClickBtn(pic, () => {
                if (canSelece == false) {
                    return;
                }
                this.playAudioClick();
                canSelece = false;
                if (this.DetailNode[i] && this.DetailNode[i] != pic) {
                    this.DetailNode[i].active = true;
                    pic.active = false;
                    
                } else {
                    prePos = picPos;
                    preZindex = picZindex;
                    preScale = picScale;
                    pic.zIndex = 2;
                    pic.runAction(cc.spawn(cc.moveTo(0.2, cc.v2(0, 0)), cc.scaleTo(0.2, 2)));
                }
                select_index = i;
                this.Mask[0].active = false;
                this.Mask[1].zIndex = 1;
                this.Mask[1].active = true;
                return true;
            })
        }
    },

});
