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
        cardList: [cc.Node],
        rectList: [cc.Node],
    },
    start() {

    },
    onContextMouseMove(x, y) {
        this.rectList.map((rect, index) => {
            if (rect && rect.activeInHierarchy && this.cardList[index]) {
                this.cardList[index].active = rect.getBoundingBox().contains(rect.parent.convertToNodeSpaceAR(cc.v2(x, y)));
            }
        })
    }
});
