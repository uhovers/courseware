let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        recordBtn: cc.Node,
        video: cc.Node,
        rec: cc.Node,
        _isTouch: false,
    },

    onLoad() {
        this._super();
        
    },

    start() {
        this.video.active = false;
        TouchUtil.addClickBtn(this.recordBtn, ()=>{
            this.setVideo();
        })
    },

    setVideo(){
        let active = this.video.active;
        this.video.active = !active;
        if (!active) {
            this.rec.runAction(cc.repeatForever(cc.blink(1, 2)));
        }else{
            this.rec.stopAllActions();
        }
    },

    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});