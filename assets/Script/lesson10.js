let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        bgNode: cc.Node,
        playNode: cc.Node,
        nextStep: cc.Node,
        _curIndex: 0,
        _isTouch: false,
    },

    onLoad() {
        this._super();
        this.playNode.active = false;
        this.nextStep.active = false;
    },

    start() {
        TouchUtil.addClickBtn(this.bgNode, ()=>{
            if (!this._isTouch) {
                this.playNode.active = true;
                this._isTouch = true;
            } 
        })
        TouchUtil.addClickBtn(this.nextStep, ()=>{
            console.log('下一个动画');
            this.notice(EnumCfg.EEventName.ANIM_CONTROLLER_NEXT_ONE)
        })
    },

    onAnimControllerStart(compId, index){
        console.log('11111动画开始播放');
        this.nextStep.active = false;
    },

    onAnimControllerComplete(compId, index){
        console.log('动画完成播放', index);
        this.nextStep.active = index<3;
    },

    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});