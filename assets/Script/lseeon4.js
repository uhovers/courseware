
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
} = require('./lessons-framework/importer');
cc.Class({
    extends: LogicBase,

    properties: {
        mPlayButton: cc.Node,
    },

    start() {
        // TouchUtil.addClickBtn(this.mPlayButton, () => {
        //     this.unscheduleAllCallbacks()
        //     this.playAudioSubtitle(0)
        //     return true
        // })
    },
    onAudioControllerCompleteSubtitle(index) {
        // this.scheduleOnce(() => {
        //     this.playAudioSubtitle(++index)
        // }, 0.5)
    }
});
