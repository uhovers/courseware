let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        ClickBtn: [cc.Node],
        RightBtn: [cc.Node],
        _rightCount: 0,
    },

    onLoad() {
        this._super();
        
    },

    start() {
        this.ClickBtn.forEach((btn, index) => {
            let prePos = btn.getPosition();
            console.log(prePos);
            TouchUtil.addClickBtn(btn, () => {
                let _index = this.RightBtn.indexOf(btn);
                btn.stopAllActions();
                btn.setPosition(prePos);
                if (_index !== -1) {
                    this._rightCount++;
                    console.log('选对了');
                    this.playAudioRight();
                    TouchUtil.removeClickBtn(btn);
                    ActionUtil.shakeAction(btn);
                } else {
                    console.log('选错了');
                    this.playAudioWrong();
                    ActionUtil.wrongAction(btn, prePos);
                }
            })
        })
    },

    onContextMagicEnabledChanged(enabled){
        console.log('魔法棒响应函数:', enabled);
        if(!enabled){
            if (this._rightCount>=4) {
                console.log('全部正确');
                this.notice(EnumCfg.EEventName.ON_SUCCESS);
            }
        }else{
            this.playAudioCustom(1);
        }
    },

    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});