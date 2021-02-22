// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


// 点击显示

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
        Btn: [cc.Node],         //不设置时 默认为 defaultBtn
        DefaultBtn: cc.Node,     //不设置时 默认为 当前 node

        ConditionShow: [cc.Node], // 触发条件需要显示
        ConditionHide: [cc.Node],

        ShowNode: [cc.Node],
        HideNode: [cc.Node],

        IsPic: [cc.Boolean],

        HasAudio: [cc.Boolean],  //只配置一个时 全局式
        CusTomAudio: [cc.Integer],
        WithSubAudioIndex: [cc.Integer],
        Enable: true, //设置脚本是否有效
        ReactionOnce: true, //每个只触发一次
        Step: 0,
        StepOneByOne: true,
        _Condition: [],
        get Condition() {
            return this._Condition;
        },
        TouchPriority: 0,
    },
    _setEnable(value) {
        this.Enable = value;
    },
    start() {
        let length = Math.max(this.ShowNode.length, this.HideNode.length);
        for (let i = 0; i < length; ++i) {
            this.Btn[i] = this.Btn[i] || this.DefaultBtn || this.node;
            this.ConditionShow[i] = this.ConditionShow[i] || null;
            this.ConditionHide[i] = this.ConditionHide[i] || null;
            if (typeof (this.IsPic[i]) === 'undefined') {
                this.IsPic[i] = typeof (this.IsPic[0]) === 'undefined' ? true : this.IsPic[0];
            }
            if (typeof (this.HasAudio[i]) === 'undefined') {
                this.HasAudio[i] = typeof (this.HasAudio[0]) === 'undefined' ? true : this.HasAudio[0];
            }
        }
        for (let i = 0, length = this.Btn.length; i < length; ++i) {
            let element = this.Btn[i];
            TouchUtil.addClickBtn(element, (event) => {
                if (this.Enable === false) {
                    return;
                }
                if (this.StepOneByOne === true) {
                    if (this.Step === i && this.check(this.Step, event)) {
                        this.reaction(i);
                        ++this.Step;
                        cc.director.getScene().emit('clickTimes', i);
                        return true;
                    }
                } else {
                    if (this.check(i, event)) {
                        this.reaction(i);
                        cc.director.getScene().emit('clickTimes', i);
                        return true;
                    }
                }
            })
        }
        TouchUtil.addClickBtn(this.node, (event) => {
            if (this.Enable === false) {
                return;
            }
        }, this.TouchPriority)
        cc.director.getScene().on(EnumCfg.EEventName.ON_CLICK_SHOW_HIDE_NODE_SET_ENABLE, (context) => {
            this._setEnable(context.detail);
        })
    },
    check(i) {
        if (this.checkCondition(this.ConditionShow[i], true) && this.checkCondition(this.ConditionHide[i], false)
            && (
                (this.ShowNode[i] && this.ShowNode[i].isValid && this.ShowNode[i].active === false)
                || (this.HideNode[i] && this.HideNode[i].isValid && this.HideNode[i].active === true)
            )
        ) {
            return true;
        }
    },
    //反应
    reaction(cur) {
        let isValid = false;
        if (this.ShowNode[cur] && this.ShowNode[cur].isValid && this.ShowNode[cur].active === false) {
            this.ShowNode[cur].active = true;
            if (this.IsPic[cur] && this.ShowNode[cur].name.includes('mask') === false && this.ShowNode[cur].name.includes('NotFade') === false) {
                ActionUtil.show(this.ShowNode[cur])
            }
            if (this.ShowNode[cur].name.includes('Multi') && this.ShowNode[cur].name.includes('Show')) {
                let i = 0;
                this.ShowNode[cur].children.forEach(element => {
                    if (this.IsPic[cur] && element.name.includes('mask') === false && element.name.includes('NotFade') === false) {
                        this.scheduleOnce(() => {
                            ActionUtil.show(element)
                        }, i * 0.5);
                        ++i;
                    } else {
                        element.active = true;
                    }
                });
            }
            isValid = true;
        }
        if (this.HideNode[cur] && this.HideNode[cur].isValid && this.HideNode[cur].active === true) {
            this.HideNode[cur].active = false;
            isValid = true;
        }
        if (isValid) {
            if (this.ReactionOnce) {
                this.Btn[cur] = null;
            }
            if (this.WithSubAudioIndex[cur] >= 0) {
                this.playAudioSubtitle(this.WithSubAudioIndex[cur])
            } else if (this.HasAudio[cur]) {
                if (typeof this.CusTomAudio[cur] !== "undefined") {
                    this.playAudioCustom(this.CusTomAudio[cur]);
                } else {
                    this.playAudioClick();
                }
            }
        }
        isValid = false;
    },
    checkCondition(node, needActive) {
        if (!node) {
            return true;
        }
        if (node.active === needActive) {
            if (node.name.includes('Multi') && node.name.includes('Condition')) {
                let children = node.children;
                for (let child of children) {
                    if (child.active !== needActive) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return false
        }
    }
    // //点击是否 有效
    // getTouchIsEnable(node, worldPos) {
    //     if (node.isValid === false || node.activeInHierarchy === false) {
    //         return false;
    //     }
    //     if (node.getBoundingBox().contains(node.parent.convertToNodeSpaceAR(worldPos))) {
    //         return true;
    //     }
    //     if (node.name.includes('Multi') && node.name.includes('Click')) {
    //         let children = node.children;
    //         for (let i = 0; i < children.length; ++i) {
    //             if (children[i].getBoundingBox().contains(children[i].parent.convertToNodeSpaceAR(worldPos))) {
    //                 return true;
    //             }
    //         }
    //     }
    // }
});
