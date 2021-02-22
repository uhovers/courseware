// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

// 飞镖射字
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
        SelectBtn: [cc.Node],//选择按钮
        RightIndex: [cc.Integer],//正确  下标
        Problem: [cc.Node],  //问题Node
        Dart: cc.Node, //飞镖
        RotationRight: [cc.Node], //正确旋转角度
        RotationWrong: [cc.Node], //错误旋转角
        PosRight: [cc.Node],    //正确 射到的 位置
        PosWrong: [cc.Node],    //错误射到的位置

        AnimNode: [cc.Node],    //动画节点
        AnimStandName: [cc.String], //stand 动画
        AnimBoomName: [cc.String],  //爆炸动画
        AnimDownName: [cc.String],  //下降动画

        FinishPanel: cc.Node,

        Reload: cc.Node,  //从新 开始
        IsAllAready: true,
        _DartPrePos: cc.v2(0, 0),
        _DartPreRotation: 0,
        _ProblemIndex: 0,
        _canTouch: false,
    },

    onLoad() {
        this._super();
        this._bindEvents(this._setAllAready, EnumCfg.EEventName.SHOOTDARTS_ALL_ALREADY);
    },

    start() {
        this._DartPrePos = this.Dart.getPosition();
        this._DartPreRotation = this.Dart.getRotation();
        if (this.IsAllAready) this.SwitchInterface(0);
        for (let i = 0, selectBtn; selectBtn = this.SelectBtn[i]; ++i) {
            TouchUtil.addClickBtn(selectBtn, () => {
                if (this._canTouch === false) {
                    return;
                }
                // this.playAudioClick();
                this._canTouch = false;
                if (i == this.RightIndex[this._ProblemIndex]) {
                    this.playAudioRight();
                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.ON_SHOOTDARTS_RIGHT, this._ProblemIndex);
                    this.Dart.runAction(cc.sequence(cc.rotateTo(0.2, this.RotationRight[i].getRotation()), cc.delayTime(0.5), cc.moveTo(0.3, this.PosRight[i].getPosition()), cc.callFunc(() => {
                        AnimUtil.play(this.AnimNode[i], this.AnimBoomName[this._ProblemIndex], 1);
                        AnimUtil.addAnimation(this.AnimNode[i], 0, this.AnimDownName[this._ProblemIndex], false);
                        this.Dart.active = false;
                        NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, (this._ProblemIndex + 1) / this.Problem.length * 100);
                        this.playAudioCustom(0)
                        this.AnimNode[i].getComponent(sp.Skeleton).setCompleteListener((track, index) => {
                            if (track.animation.name === this.AnimDownName[this._ProblemIndex]) {
                                this.SwitchInterface(++this._ProblemIndex);
                                if (this._ProblemIndex > this.Problem.length - 1) {
                                    if (this.FinishPanel) {
                                        this.FinishPanel.active = true;
                                        this.FinishPanel.scale = 0.1;
                                        this.FinishPanel.runAction(cc.sequence(
                                            cc.scaleTo(0.2, 1.2),
                                            cc.scaleTo(0.2, 0.9),
                                            cc.scaleTo(0.2, 1),
                                        ))
                                    }
                                }
                            }
                        })
                    })))
                } else {
                    this.playAudioWrong();
                    this.Dart.runAction(cc.sequence(cc.rotateTo(0.2, this.RotationWrong[i].getRotation()), cc.delayTime(0.5), cc.moveTo(0.5, this.PosWrong[i].getPosition()), cc.callFunc(() => {
                        this.ResetDart();
                        this._canTouch = true;
                    })))
                }

            })
        }
        this.Reload && TouchUtil.addClickBtn(this.Reload, () => {
            if (!this.IsAllAready) return;
            this.SwitchInterface(0);
            this.FinishPanel && (this.FinishPanel.active = false);
        })
    },
    SwitchInterface(index) {
        if (index > this.Problem.length - 1) {
            return;
        }
        this._ProblemIndex = index;
        this.ResetDart();
        let length = this.AnimNode.length;
        for (let i = 0, node; node = this.AnimNode[i]; ++i) {
            AnimUtil.play(node, this.AnimStandName[index * length + i], 0);
        }
        for (let i = 0, problem; problem = this.Problem[i]; ++i) {
            problem.active = false;
        }
        this.Problem[index].active = true;
        this._canTouch = true;

    },
    ResetDart() {
        this.Dart.active = true;
        this.Dart.stopAllActions()
        this.Dart.setRotation(this._DartPreRotation);
        this.Dart.setPosition(this._DartPrePos);
    },
    _setAllAready(isAlready) {
        this.IsAllAready = !!isAlready;
        if (this.IsAllAready) this.SwitchInterface(this._ProblemIndex || 0);
    },
});
