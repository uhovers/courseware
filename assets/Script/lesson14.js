let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        box: cc.Node,
        pages: [cc.Node],
        _curIndex: 0,
    },

    onLoad() {
        this._super();
        this.box.active = false;
        this.pages.forEach((p, idx) => {
            p.active = false;
        });
    },

    start() {
        
    },

    onClickOpen(){
        if (this._curIndex>=this.pages.length) {
            return;
        }
        this.box.active = true;
        this.pages.forEach((p, idx) => {
            if (this._curIndex===idx) {
                p.active = true;
            }else{
                p.active = false;
            }
        });
        this._curIndex++;
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