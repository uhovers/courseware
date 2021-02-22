let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        imgs: [cc.Node],
        bigImgs: [cc.Node],
    },
    onLoad() {
        this._super();
        this.imgs.map((node, i) =>{
            if(node){
                TouchUtil.addClickBtn(node, ()=>{
                    this.playAudioClick();
                    this.showBigImg(i);
                    return true;
                })
            }
        })
        TouchUtil.addClickBtn(this.bigImgs[this.bigImgs.length - 1], ()=>{
            this.bigImgs[this.bigImgs.length - 1].active = false;
            this.playAudioClick();
            return true;
        })
    },
    start() {    
      
    },
    showBigImg(index){
        this.bigImgs.map((node, i) =>{
            if(node) node.active = i == index;
        })
        this.bigImgs[this.bigImgs.length - 1].active = true;
    },
    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});