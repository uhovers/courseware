let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        pageNode: [cc.Node],
        redNode: cc.Node,
        _curIndex: 0,
    },

    onLoad() {
        this._super();
        this.redNode.active = false;
    },

    start() {    
        TouchUtil.addClickBtn(this.pageNode[0], ()=>{
            this.redNode.active = true;
        })
    },

    onClickAppearShowWithIndex(){
        let index = [].splice.call(arguments, 1)[0];
        console.log('当前页: ', index);
        if (index==1) {
            this.pageNode[0].active = false;
        }else if(index==3){
            this.pageNode[1].active = false;
        }
    },

    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});