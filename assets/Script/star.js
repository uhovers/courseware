
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
       starBtn:[cc.Node],
       starNode:cc.Node,
       delayTime: 0,
       starCount: 0, 
       useUpdate: true
    },
    onLoad(){
        this._super();
        this._stars = 0;
        this.getOriginPos(); 
    },
    onDestroy(){
        this._super();
    },
    starShow(starNum) {
        if(starNum){
            this.starNum = starNum;
        }else{
            this.starNum = -1;
        }
        this._starShowing = true;
        this.starNode.active = true;
        this.starBtn.map((star, index) => {
            if (star && star.parent) {
                if(index < this.starNum){
                    star.parent.active = true;
                    star.parent.runAction(cc.moveTo(0.5, cc.p(this.originPos[index].x, this.originPos[index].y)))
                }else{
                    star.parent.active = false;
                }
            }
        })
    },
    getOriginPos() {
        this.originPos = [];
        this.starBtn.map((star, index) => {
            if (star && star.parent) {
                this.originPos.push(star.parent.getPosition())
                star.parent.x = 1215;
                star.parent.y = -1137;
            }
        })
    },
    start() {
        // this.starBtn.map((starBtn, index) => {
        //     if (starBtn) {
        //         TouchUtil.addClickBtn(starBtn, () => {
        //             this.playAudioClick();
        //             starBtn.parent.active = false;
        //             this.pickStar(1);
        //             if(this.starNum > -1 && ++this._stars == this.starNum){
        //                 // this.updateProgress(100);
        //                 this.node.active = false;
        //             }
        //             TouchUtil.removeClickBtn(starBtn);
        //         })
        //     }
        // });
        TouchUtil.addClickBtn(this.starNode, ()=>{
            TouchUtil.removeClickBtn(this.starNode)
            this.playAudioClick();
            this.starBtn.map((btn, index) =>{
                if(btn && index < this.starNum){
                    this.setTimeout(()=>{
                        btn.parent.active = false;
                        this.pickStar(1);
                    }, index * 200)
                }
            })
            this.setTimeout(()=>{
                this.node.active = false
            }, this.starNum * 200)
            return true
        })
    },

    onSuccess(){
        if(this.useUpdate){
            this.setTimeout(() => {
                this.playAudioCustom(0);
                this.starShow(this.starCount)
            }, this.delayTime * 1000);
        }
    },

    onUpdateProgress(progress){
        if(this.useUpdate && progress >= 100){
            this.setTimeout(() => {
                this.starShow(this.starCount)
            }, this.delayTime * 1000);
        }
    },
    onContextMagicEnabledChanged(enabled){
        if(!enabled){
            this.starNode.active = false
        }
    },
});
