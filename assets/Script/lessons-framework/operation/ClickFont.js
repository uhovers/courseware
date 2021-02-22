// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//汉字的秘密 页面中选出正确的汉字   1-1

let {
    WidgetBase,
    EnumCfg,
    DraftCfg,
    NoticeCenter,
    LogicBase,
    TouchUtil,
    AnimUtil,
    AudioUtil,
    ActionUtil,
} = require("./../importer")
cc.Class({
    extends: LogicBase,

    properties: {
        Test: true,
        RightNode: [cc.Node],//正确节点 点击点
        RightNodeSp: [cc.Node],//改变sp 的节点
        RedSp: [cc.SpriteFrame], //正确 的 红 色 sp
        Audio: [cc.AudioClip],  //声音
        BigShowNode: cc.Node,
        BigShowNodeSp: cc.Node,//改变sp 的节点
        BigShowSpriteFrame: [cc.SpriteFrame],
        Width: 1,
        Height: 1,
        LocationPosNode: [cc.Node],//用于定位node  2个  不同行不同列  
        LocationPosVec2: [cc.Vec2],//node 下标     0,0  
        RightAudio: cc.AudioClip,
        WrongAudio: cc.AudioClip,
        GoodSentence: cc.Node,
        WrongShowNode: cc.Node,
        AddWrongNodeRect: [cc.Node],
    },
    start() {
        let dis_x = (this.LocationPosNode[1].x - this.LocationPosNode[0].x) / (this.LocationPosVec2[1].x - this.LocationPosVec2[0].x);
        let dis_y = (this.LocationPosNode[1].y - this.LocationPosNode[0].y) / (this.LocationPosVec2[1].y - this.LocationPosVec2[0].y);
        let start_pos_x = this.LocationPosNode[0].x - this.LocationPosVec2[0].x * dis_x;
        let start_pos_y = this.LocationPosNode[0].y - this.LocationPosVec2[0].y * dis_y;
        let pos_array = [];
        let posIsValid = true;
        for (let i = 0; i < this.Width; ++i) {
            for (let j = 0; j < this.Height; ++j) {
                posIsValid = true;
                let pos = cc.v2(start_pos_x + dis_x * i, start_pos_y + dis_y * j);
                for (let k = 0, node; node = this.RightNode[k]; ++k) {
                    if (node.getBoundingBox().contains(pos)) {
                        node.setPosition(pos);
                        posIsValid = false;
                        break;
                    }
                }
                if (posIsValid) {
                    if (this.Test) {
                        let node = cc.instantiate(this.RightNode[0]);
                        this.RightNode[0].parent.addChild(node);
                        node.setPosition(pos)
                    }
                    pos_array.push(cc.rect(pos.x - this.RightNode[0].width * 0.5, pos.y - this.RightNode[0].height * 0.5, this.RightNode[0].width, this.RightNode[0].height));
                }
            }
        }
        this.AddWrongNodeRect.forEach((element) => {
            pos_array.push(element.getBoundingBox());
        })
        let can_touch = true;
        TouchUtil.addClickBtn(this.node, (event) => {
            for (let i = 0, pos; pos = pos_array[i]; ++i) {
                if (!can_touch) {
                    return;
                }
                if (pos.contains(this.RightNode[0].parent.convertToNodeSpaceAR(event.getLocation()))) {
                    AudioUtil.play(this.WrongAudio);
                    let action = cc.sequence(cc.delayTime(1.0), cc.fadeOut(0.5), cc.callFunc(() => {
                        this.WrongShowNode.active = false;
                    }))
                    this.WrongShowNode.stopAllActions();
                    this.WrongShowNode.opacity = 255;
                    this.WrongShowNode.active = true;
                    this.WrongShowNode.runAction(action);
                }
            }
        })
        let BigNodePrePos = this.BigShowNode.getPosition();
        let count = 0;
        for (let i = 0, node; node = this.RightNode[i]; ++i) {
            TouchUtil.addClickBtn(node, () => {
                if (can_touch == false) {
                    return true;
                }
                can_touch = false;
                this.BigShowNodeSp.getComponent(cc.Sprite).spriteFrame = this.BigShowSpriteFrame[i];
                ActionUtil.show(this.BigShowNode);
                if (count + 1 === this.RightNode.length) {
                    this.GoodSentence.active = true;
                }
                AudioUtil.play(this.Audio[i], () => {
                    this.BigShowNode.runAction(cc.sequence(cc.scaleTo(0.2, 0.3), cc.delayTime(0.1), cc.moveTo(0.2, node.getPosition()), cc.callFunc(() => {
                        this.BigShowNode.active = false;
                        this.BigShowNode.setPosition(BigNodePrePos);
                        this.BigShowNode.setScale(1.0);
                        let com = this.RightNodeSp[i].getComponent(cc.Sprite);
                        if (com.spriteFrame != this.RedSp[i]) {
                            com.spriteFrame = this.RedSp[i];
                            ++count;
                            NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, count / this.RightNode.length * 100);

                            AudioUtil.play(this.RightAudio);
                            if (count == this.RightNode.length) {
                                this.scheduleOnce(() => {
                                    this.playAnim(0);
                                    this.playAudioCustom(0);
                                })
                                // setScale(0.2);
                                // this.GoodSentence.parent.active = true;
                                // this.GoodSentence.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.delayTime(3), cc.spawn(cc.fadeOut(0.2), cc.scaleTo(0.2, 0.2)), cc.callFunc(() => {
                                //     this.GoodSentence.parent.destroy();
                                //     this.GoodSentence = null;
                                //     can_touch = true;
                                // })));
                            } else {
                                can_touch = true;
                            }
                        } else {
                            can_touch = true;
                        }
                    })))
                })
                return true;
            })
        }
    },
});
