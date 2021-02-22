// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//我是大画家  lv1-7-SeasonsOfAncientPoetry

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
    extends: WidgetBase,

    properties: {
        DragNode: [cc.Node],//拖动节点
        OnDragSp: [cc.SpriteFrame],//拖动过程中的图片
        PaintSp: [cc.SpriteFrame],//拖动结束的绘制图片
        Board: cc.Node,
        RightParent: [cc.Node],//挂载节点
        RightPos: [cc.Node],    //正确的位置（只取位置）
        RightScale: [cc.Float], //scale
        _hasDrag: [cc.Node],
        WrongBtn: [cc.Node],    //错误的按钮
        DragParent: [cc.Node],
    },

    start() {
        this.DragNode.forEach((element, index) => {
            const prePos = element.getPosition();
            const preParent = element.parent;
            const preSP = element.getComponent(cc.Sprite).spriteFrame;
            const scale = element.scale;
            TouchUtil.addMoveNode(element,
                (event) => {
                    element.stopAllActions();
                    element.parent = this.DragParent[index] || preParent;
                    element.zIndex = 1;
                    element.scale = scale;
                    if (this.OnDragSp[index]) {
                        element.getComponent(cc.Sprite).spriteFrame = this.OnDragSp[index];
                    }
                    element.setPosition(element.parent.convertToNodeSpaceAR(event.getLocation()));
                    let _dragInHasDrag = this._hasDrag.indexOf(element);
                    if (_dragInHasDrag !== -1) {
                        this._hasDrag.splice(_dragInHasDrag, 1);
                    }
                    event.stopPropagation(); // 吞噬触摸
                    return true;
                }, (event) => {
                    element.setPosition(element.parent.convertToNodeSpaceAR(event.getLocation()));
                },
                (event) => {
                    if (this.Board.getBoundingBox().contains(this.Board.parent.convertToNodeSpaceAR(event.getLocation()))) {
                        element.parent = this.RightParent[index] || this.Board;
                        element.zIndex = 0;
                        element.setPosition(element.parent.convertToNodeSpaceAR(event.getLocation()));
                        element.scale = this.RightScale[index] || element.scale;
                        if (this.PaintSp[index]) {
                            element.getComponent(cc.Sprite).spriteFrame = this.PaintSp[index];
                        }
                        NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK);
                        if (this._hasDrag.indexOf(element) === -1) {
                            this._hasDrag.push(element);
                        }
                        if (this.RightPos[index]) {
                            element.runAction(cc.moveTo(0.15, element.parent.convertToNodeSpaceAR(this.RightPos[index].convertToWorldSpaceAR(cc.v2(0, 0)))))
                        }
                    } else {

                        element.runAction(cc.sequence(cc.moveTo(0.25, element.parent.convertToNodeSpaceAR(preParent.convertToWorldSpaceAR(prePos))), cc.callFunc(() => {
                            element.zIndex = 0;
                            element.parent = preParent
                            element.setPosition(prePos);
                            element.getComponent(cc.Sprite).spriteFrame = preSP;
                        })))
                    }
                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, this._hasDrag.length / this.DragNode.length * 100)
                },
                () => {

                    element.runAction(cc.sequence(cc.moveTo(0.25, element.parent.convertToNodeSpaceAR(preParent.convertToWorldSpaceAR(prePos))), cc.callFunc(() => {
                        element.parent = preParent
                        element.zIndex = 0;
                        element.setPosition(prePos);
                        element.getComponent(cc.Sprite).spriteFrame = preSP;
                    })))
                })
        })
        this.WrongBtn.forEach((element, index) => {
            let prePos = element.getPosition()
            TouchUtil.addClickBtn(element, () => {
                ActionUtil.wrongAction(element, prePos);
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.WRONG);
                return true;
            })
        })
    }

});
