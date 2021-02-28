let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        bg: cc.Node,
        node1: cc.Node,
        box: cc.Node,
        _isTouch: false
    },

    onLoad() {
        this._super();
        this.node1.active = false;
        this.box.active = false;
    },

    start() {
        TouchUtil.addClickBtn(this.bg, ()=>{
            if (!this._isTouch) {
                this.node1.active = true;
                this._isTouch = true;
            } 
        })
    },

    onClickOpen(event, data){
        let tag = Number(data);
        this.box.active = true;
        this.box.getChildByName('page1').active = tag===1;
        this.box.getChildByName('page2').active = tag===2;
        
    },

    onClickClose(){
        this.box.active = false;
    },

    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});