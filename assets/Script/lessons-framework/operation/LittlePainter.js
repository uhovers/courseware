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
        Btn: [cc.Node],
        ShowNode: [cc.Node],
        DefultShowNode: [cc.Node],
        Pic: [cc.Node],
        PicSprite: [cc.SpriteFrame],
        Layer: [cc.Node],
        Board: cc.Node,
        BtnLayer: cc.Node,
        _SelectIndex: [cc.Integer],
        _IsStar: false,
        ClosMagic: cc.Node,

    },

    start() {
        TouchUtil.addClickBtn(this.node, () => {
            this.Layer[0].active = false;
            this.Layer[1].active = true;
            TouchUtil.removeClickBtn(this.node);
            if (!window.ONLINE) {
                cc.director.getScene().emit("ENABLE_MAGIC");
            }
        })
        for (let i = 0; i < this.Btn.length; ++i) {
            let prePos = this.Btn[i].getPosition();
            let preSp = this.Btn[i].getComponent(cc.Sprite).spriteFrame;
            let preParent = this.Btn[i].parent;
            TouchUtil.addMoveNode(this.Btn[i], (event) => {
                this.playAudioClick();
                this.Btn[i].stopAllActions();
                this.Btn[i].parent = this.node;
                this.Btn[i].setPosition(this.node.convertToNodeSpaceAR(event.getLocation()));
                this.Btn[i].getComponent(cc.Sprite).spriteFrame = this.PicSprite[i];
                let index = this._SelectIndex.indexOf(i);
                if (index !== -1) {
                    this._SelectIndex.splice(index, 1);
                }
                return true;
            }, (event) => {
                this.Btn[i].setPosition(this.Btn[i].parent.convertToNodeSpaceAR(event.getLocation()));
            }, (event) => {
                if (this.Board.getBoundingBox().contains(this.Board.parent.convertToNodeSpaceAR(event.getLocation()))) {
                    this.Pic[i].active = true;
                    this.Pic[i].removeComponent(cc.Sprite)
                    this.Btn[i].runAction(cc.sequence(cc.moveTo(0.5, this.Btn[i].parent.convertToNodeSpaceAR(this.Pic[i].convertToWorldSpaceAR(cc.v2(0, 0)))), cc.callFunc(() => {
                        this.Btn[i].parent = this.Pic[i];
                        this.Btn[i].setPosition(cc.v2(0, 0));
                    })))
                    if (this._SelectIndex.includes(i) === false) {
                        this._SelectIndex.push(i);
                    }
                } else {
                    this.Btn[i].getComponent(cc.Sprite).spriteFrame = preSp;
                    this.Btn[i].runAction(cc.sequence(cc.moveTo(0.5, this.Btn[i].parent.convertToNodeSpaceAR(preParent.convertToWorldSpaceAR(prePos))), cc.callFunc(() => {
                        this.Btn[i].parent = preParent;
                        this.Btn[i].setPosition(prePos);
                    })))
                }
            }, () => {
                this.Btn[i].getComponent(cc.Sprite).spriteFrame = preSp;
                this.Btn[i].runAction(cc.sequence(cc.moveTo(0.5, this.Btn[i].parent.convertToNodeSpaceAR(preParent.convertToWorldSpaceAR(prePos))), cc.callFunc(() => {
                    this.Btn[i].parent = preParent;
                    this.Btn[i].setPosition(prePos);
                })))
            })
        }
        if (window.ONLINE) {
            this.ClosMagic.active = false;
        } else {
            TouchUtil.addClickBtn(this.ClosMagic, () => {
                cc.director.getScene().emit("DISABLE_MAGIC");
            })
        }
    },
    showNodes(nodes, posY = -421) {
        let width = 20;
        let maxWidth = 1960;
        let validNode = [];
        for (let i = 0; i < nodes.length; ++i) {
            if (width + nodes[i].getBoundingBox().width + 20 < maxWidth) {
                validNode.push(nodes[i]);
                width += (nodes[i].getBoundingBox().width + 20)
                nodes.splice(i, 1);
                --i;
            }
        }
        let fix = -width / 2;
        for (let i = 0; i < validNode.length; ++i) {
            validNode[i].setPosition(fix + 20 + validNode[i].getBoundingBox().width / 2, posY);
            validNode[i].active = true;
            fix = fix + 20 + validNode[i].getBoundingBox().width;
        }
        if (nodes.length > 0) {
            this.showNodes(nodes, -648)
        }
    },
    onContextMagicEnabledChanged(enable) {
        if (enable === true && this._IsStar === false) {
            this._IsStar = true;
            this.playAudioCustom(0);
        }
        if (enable === false && this._IsStar === true) {
            this._IsStar = null;
            for (let i = 0; i < this.Btn.length; ++i) {
                TouchUtil.removeMoveNode(this.Btn[i]);
            }
            this.BtnLayer.active = false;
            let node = [];
            for (let i = 0; i < this.DefultShowNode.length; ++i) {
                node.push(this.DefultShowNode[i]);
            }
            for (let i = 0; i < this._SelectIndex.length; ++i) {
                if (this.ShowNode[this._SelectIndex[i]]) {
                    node.push(this.ShowNode[this._SelectIndex[i]]);
                }
            }
            if (node.length > 0) {
                this.Layer[1].runAction(cc.scaleTo(0.5, 0.8));
            }
            this.showNodes(node);
        }
    }

});
