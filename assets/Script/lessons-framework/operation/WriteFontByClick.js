// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html



// 写一写


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
        CharNode: [cc.Node],  //笔画 Node
        CharFrame: [cc.Node],    //笔画下 田字格
        DispersionNode: [cc.Node], //目标点
        WrongTag: cc.Node,
        ClickAudio: cc.AudioClip,
        WrongAudio: cc.AudioClip,
        LineNum: -1,  //字行数
        PlayOnStart: true,
        LightFrame: cc.Node,
        FontAnim: [cc.Node],
        GrayFont: [cc.Node],
        FontAudio: [cc.AudioClip],
        AnimName: [cc.String],
        HasFontAnim: true,
    },
    start() {
        if (this.LineNum == -1) {
            this.LineNum = this.CharNode.length;
        }
        if (this.PlayOnStart) {
            this.Play();
        }

    },
    playFontAction() {
        this.Play();
    },
    Play() {
        let pre_pos = [];
        for (let i = 0, char_node, frame; frame = this.CharFrame[i], char_node = this.CharNode[i]; ++i) {
            frame.active = false;
            char_node.active = true;
            pre_pos.push(char_node.getPosition());
            char_node.setPosition(this.DispersionNode[0].getPosition());
        }
        this.can_touch = true;
        let current_index = 0;
        let ActionFunc = [
            () => {
                this.can_touch = false;
                this.DispersionNode[0].active = true;
                AudioUtil.play(this.FontAudio[0], () => {
                    this.can_touch = true;
                })
                AnimUtil.play(this.FontAnim[0], this.AnimName[0], 1);
                for (let i = 0, char_node, frame; frame = this.CharFrame[i], char_node = this.CharNode[i]; ++i) {
                    char_node.active = false;
                }
            },
            () => {
                //字体 分散
                if (this.FontAnim[0]) {
                    this.FontAnim[0].active = false;
                }
                if (this.GrayFont[0]) {
                    this.GrayFont[0].active = true;
                }
                AudioUtil.play(this.ClickAudio);
                for (let i = 0, char; char = this.CharNode[i]; ++i) {
                    this.CharFrame[i].active = true;
                    char.active = true;
                    char.runAction(cc.spawn(cc.rotateBy(0.2, 360), cc.moveTo(0.2, pre_pos[i])));
                }
                this.can_touch = false;
                this.scheduleOnce(() => {
                    this.can_touch = true
                }, 0.2)
            },
            () => {
                AudioUtil.play(this.ClickAudio);
                let callback = () => {
                    let char_index = 0;
                    for (let i = 0, char; char = this.CharNode[i]; ++i) {
                        let char_prepos = char.getPosition();
                        TouchUtil.addClickBtn(char, () => {
                            if (char_index == i) {
                                ++char_index;
                                NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, (i + 1) / this.CharNode.length * 100);
                                AudioUtil.play(this.ClickAudio);
                                char.runAction(cc.sequence(cc.spawn(cc.rotateBy(0.15, 360), cc.moveTo(0.2, this.DispersionNode[0].getPosition())), cc.callFunc(() => {
                                    this.CharFrame[i].active = false;
                                    if (i + 1 == this.CharNode.length && this.LightFrame) {
                                        ActionUtil.show(this.LightFrame);
                                    }
                                })))
                                TouchUtil.removeClickBtn(char);
                            } else {
                                AudioUtil.play(this.WrongAudio);
                                this.WrongTag.stopAllActions();
                                this.WrongTag.opacity = 255;
                                this.WrongTag.active = true;
                                this.WrongTag.runAction(cc.sequence(cc.delayTime(1.0), cc.fadeOut(0.2)));
                                char.stopAllActions();
                                char.setPosition(char_prepos);
                                ActionUtil.wrongAction(char, char_prepos);
                            }
                        });
                    }
                };
                let first = true;
                for (let i = 0; this.LineNum * i < this.CharNode.length; ++i) {
                    if (first) {
                        first = false;
                        this.shuffle(this.CharNode.slice(this.LineNum * i, this.LineNum * (i + 1)), () => {
                            this.scheduleOnce(callback, 0.5);
                        });
                    } else {
                        this.shuffle(this.CharNode.slice(this.LineNum * i, this.LineNum * (i + 1)));
                    }
                }
            }
        ];
        TouchUtil.addClickBtn(this.node, () => {
            if (this.can_touch == false || typeof (ActionFunc[current_index]) != "function") {
                return;
            }
            ActionFunc[current_index]();
            ++current_index;
        })
    },
    shuffle(nodes, callback) {
        let count = 0;
        let __shuffle = (nodes, index) => {
            if (index == nodes.length) {
                return;
            }
            let i = index + 1;
            while (i == nodes.length) {
                i = 0;
            }
            let pos = nodes[i].getPosition(),
                pos2 = nodes[index].getPosition();
            nodes[index].runAction(cc.moveTo(0.2, pos))
            count++;
            nodes[i].runAction(cc.sequence(cc.moveTo(0.2, pos2), cc.delayTime(0.2), cc.callFunc(() => {
                count--;
                __shuffle(nodes, ++index);
                if (count == 0) {
                    if (callback) {
                        callback();
                    }
                }
            })))
        }
        __shuffle(nodes, 0);
    }
});
