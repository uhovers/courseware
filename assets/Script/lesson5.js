let {
    LogicBase,
    ActionUtil,
    EnumCfg,
    TouchUtil
} = require('./lessons-framework/importer');

cc.Class({
    extends: LogicBase,
    properties: {
        btn1Answer: [cc.Node],
        answer1: [cc.Node],

        btn2Answer: [cc.Node],
        answer2: [cc.Node],
       
        btn3Answer: [cc.Node],
        answer3: [cc.Node],

        nextStep: cc.Node,
        selectNode: cc.Node,
        resultNode: cc.Node,
        finishNode: cc.Node,

        rightCount: 0,
    },
    
    onLoad() {
        this._super();

        this.nextStep.active = false;
        this.resultNode.active = false;
        this.finishNode.active = false;

        for (let i = 0; i < 3; i++) {
            if (this.answer1[i]) this.answer1[i].active = false;
            if (this.answer2[i]) this.answer2[i].active = false;
            if (this.answer3[i]) this.answer3[i].active = false;
        }

        let a1Touch = true, a2Touch = true;
        this.btn1Answer.forEach((btn, idx) => {
            if (btn) {
                TouchUtil.addClickBtn(btn, ()=>{
                    if(!a1Touch) return;
                    if (this.answer1[idx] && !this.answer1[idx].active) {
                        console.log('选择正确1');
                        this.answer1[idx].active = true;
                        this.rightCount++;
                        this.answerRight(btn);
                        if (this.rightCount===2) {
                            this.showResult();
                        }
                    } else if(!this.answer1[idx]) {
                        console.log('选择错误1');
                        this.answerWrong(btn);
                    }
                })
            }
        });

        this.btn2Answer.forEach((btn, idx) => {
            if (btn) {
                TouchUtil.addClickBtn(btn, ()=>{
                    a1Touch = false;
                    if(!a2Touch) return;
                    if (this.answer2[idx] && !this.answer2[idx].active) {
                        console.log('选择正确2');
                        this.answer2[idx].active = true;
                        this.rightCount++;
                        this.answerRight(btn);
                        if (this.rightCount===2) {
                            this.showResult();
                        }
                    } else {
                        console.log('选择错误2');
                        this.answerWrong(btn);
                    }
                })
            }
        });

        this.btn3Answer.forEach((btn, idx) => {
            if (btn) {
                TouchUtil.addClickBtn(btn, ()=>{
                    a2Touch = false;
                    if (this.answer3[idx] && !this.answer3[idx].active) {
                        console.log('选择正确3');
                        this.answer3[idx].active = true;
                        this.rightCount++;
                        this.answerRight(btn);
                        if (this.rightCount===3) {
                            this.showFinish();
                        }
                    } else {
                        console.log('选择错误3');
                        this.answerWrong(btn);
                    }
                })
            }
        });
    },

    start() {    
        // this.showFinish();
    },

    onAnimControllerStart(compId, index){
        console.log('11111动画开始播放');
        this.nextStep.active = true;
    },

    onAnimControllerComplete(){
        console.log('动画完成播放');
    },

    onClickAppearShowWithIndex(){
        let index = [].splice.call(arguments, 1)[0];
        console.log('当前页: ', index);
        this.rightCount = 0;
        let active = true;
        switch (+index) {
            case 1:
                this.playAudioCustom(4)
                break;
            case 2:
                this.playAudioCustom(1)
                active = false;
                break;
            case 3:
                this.playAudioCustom(5)
                break;
            case 4:
                this.playAudioCustom(2)
                active = false;
                break;
            case 5:
                this.playAudioCustom(3)
                active = false;
                break;
            default:
                break;
        }
        this.nextStep.active = active;
    },

    onContextMagicEnabledChanged(enabled){
        if(!enabled){
            this.finishNode.active = true
            this.playAnim(1);
            this.playAudioCustom(0);
            this.setTimeout(()=>{
                this.finishNode.active = false
            }, 3000)
        }
    },

    /**
     * 回答正确
     */
    answerRight(n){
        let xz = cc.instantiate(this.selectNode);
        xz.position = cc.v2(n.position.x-7, n.position.y);
        xz.width = n.width + 40;
        xz.zIndex = 1;
        xz.parent = n.parent;
        xz.active = true;
        this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.RIGHT)
    },

    /**
     * 回答错误
     */
    answerWrong(n){
        let pos = n.position
        n.stopAllActions();
        let seq = cc.sequence(
            cc.moveTo(0.03, cc.p(pos.x + 30, pos.y)),
            cc.moveTo(0.06, cc.p(pos.x - 30, pos.y)),
            cc.moveTo(0.03, cc.p(pos.x, pos.y))
        ).repeat(2);
        n.runAction(seq);
        this.notice(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.WRONG)
    },

    showResult(){
        this.resultNode.active = true;
        this.resultNode.opacity = 0;
        this.resultNode.stopAllActions();
        this.playAudioCustom(7);
        this.resultNode.runAction(cc.sequence(cc.fadeIn(0.5), cc.delayTime(3), cc.callFunc(()=>{
            this.resultNode.active = false;
            this.nextStep.active = true;
        })))
    },

    showFinish(){
        console.log('最终完成');
        this.notice(EnumCfg.EEventName.ON_SUCCESS);
        // this.finishNode.active = true;
        // this.playAnim(1);
        // this.playAudioCustom(0);
        // this.setTimeout(()=>{
        //     this.finishNode.active = false
        // }, 3000)
    },

    /**
     * 动画结束时
     */
    onDestroy() {
        this._super();
    },
});