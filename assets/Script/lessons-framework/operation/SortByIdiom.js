// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html



//成语来站队    lv1-16

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
        CharOfIdiom: [cc.Node], // 字
        RightPos: [cc.Node],    //正确位置
        RightSort: [cc.String],
        MarkPos: [cc.Node],     //标记
        HasAudioIndex: [cc.Integer], //需要播放成语 下标
        AudioIndex: [cc.Integer],
        Mark: cc.Node,  //标记节点
        Ready: true,
        _cur: 0,
        SorderBtn: cc.Node,
    },
    start() {
        if (this.Ready) {
            this.PrePare()
        }
    },
    PrePare() {
        let prePos = [];
        let preRotation = [];
        this.CharOfIdiom.forEach((element, index) => {
            prePos.push(element.getPosition())
            preRotation.push(element.rotation);
            element.setPosition(this.RightPos[index].getPosition());
            element.rotation = 0;
        })
        TouchUtil.addClickBtn(this.SorderBtn, () => {
            TouchUtil.removeClickBtn(this.SorderBtn);
            this.CharOfIdiom.forEach((element, index) => {
                element.runAction(cc.spawn(cc.moveTo(0.2, prePos[index]), cc.rotateTo(0.2, preRotation[index])))
            })
            NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK) 
            this.scheduleOnce(()=>{
                this.Play();
            }, 1);
        })
      
    },
    Play() {
        let order = [];
        this.RightSort.forEach((element, index) => {
            order[index] = element.split('').map(value => parseInt(value));
        })
        cc.log(order);
        if (this.Mark && this.MarkPos[this._cur]) {
            this.Mark.setPosition(this.MarkPos[this._cur].getPosition());
        }
        this.Mark.active = true;
        this.CharOfIdiom.forEach((element, index) => {
            let prePos = element.getPosition();
            TouchUtil.addClickBtn(element, () => {
                element.stopAllActions();
                element.setPosition(prePos);
                if (order[this._cur].indexOf(index) !== -1) {
                    element.runAction(cc.spawn(cc.moveTo(0.2, this.RightPos[this._cur].getPosition()), cc.rotateBy(0.2, 720 - element.rotation)));
                    TouchUtil.removeClickBtn(element);
                    if (this.HasAudioIndex.indexOf(this._cur) !== -1) {
                        let audio_index = this.AudioIndex[this.HasAudioIndex.indexOf(this._cur)];
                        if (audio_index === undefined) {
                            audio_index = this.HasAudioIndex.indexOf(this._cur)
                        }
                        NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.SUBTITLE, audio_index);
                    } else {
                        NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK)
                    }
                    ++this._cur;
                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, this._cur / this.CharOfIdiom.length * 100);
                    if (this.Mark && this.MarkPos[this._cur]) {
                        this.Mark.setPosition(this.MarkPos[this._cur].getPosition());
                    } else {
                        this.Mark.active = false;
                    }
                } else {
                    ActionUtil.wrongAction(element, prePos);
                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.WRONG)
                }
            })
        })
    }
})
