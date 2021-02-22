/*!
 * [operation]点击选字
 * by houzhenag
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let TouchUtil = require('./../util/TouchUtil');
let AudioUtil = require('./../util/AudioUtil');
let NoticeCenter = require('./../core/NoticeCenter');

cc.Class({
    extends: WidgetBase,

    properties: {
        //-- 字板
        wordsPanel: cc.Node,
        //-- 普通重点字列表
        normalKeywords: [cc.Node],
        //-- 选中后的重点字列表
        selectedKeywords: [cc.Node],
        //-- 强调时出现的节点
        containerOutstanding: cc.Node,
        //-- 强调时所出现的节点更换所需的纹理列表
        framesOutstanding: [cc.SpriteFrame],


        //-- 读音列表
        readAudios: [cc.AudioClip],
        //-- 错误提示音
        wrongAudio: cc.AudioClip,
        //-- GoodJob提示音
        goodJobAudio: cc.AudioClip,

        maxDuration: [cc.Float],

        //-- 错误提示
        wrongPanel: cc.Node,
        //-- GoodJob提示
        goodJobPanel: cc.Node,


        //-- 行数
        row: 0,
        //-- 列数
        col: 0,
        //-- 行间距
        rowSpacing: 0,
        //-- 列间距
        colSpacing: 0,
        //-- 完成数量
        _completeCount: 0,
    },
    onLoad() {
        this._super();
        this._init();
        this._registerTouchEvent();
    },
    _init() {
        if (this.containerOutstanding) this.containerOutstanding.active = false;
        if (this.wrongPanel) this.wrongPanel.active = false;
        if (this.containerOutstanding) {
            this._orgContainerOutstandingPos = this.containerOutstanding.getPosition();
        }
        this._wordWidth = (this.wordsPanel.width - (this.col - 1) * this.colSpacing) / this.col;
        this._wordHeight = (this.wordsPanel.height - (this.row - 1) * this.rowSpacing) / this.row;
        this._wordsPosLeftTopArr = []
        for (let row = 0; row < this.row; row++) {
            for (let col = 0; col < this.col; col++) {
                let posLeftTop = cc.p(col * (this._wordWidth + this.colSpacing), row * (this._wordHeight + this.rowSpacing));
                let _rect = cc.rect(posLeftTop.x, posLeftTop.y, this._wordWidth, this._wordHeight);
                let _contain = false;
                this.normalKeywords.map((normalKeyword, _index) => {
                    let normalKeywordPos = normalKeyword.getPosition();
                    let worldPos = normalKeyword.convertToWorldSpace(cc.p(0, 0));
                    let nodePos = this.wordsPanel.convertToNodeSpaceAR(worldPos);
                    nodePos.x = nodePos.x + this._wordWidth / 2 + this.wordsPanel.width / 2;
                    nodePos.y = this.wordsPanel.height / 2 - (nodePos.y + this._wordHeight / 2);
                    if (cc.rectContainsPoint(_rect, nodePos)) {
                        _contain = true;
                        return;
                    }
                });
                this._wordsPosLeftTopArr.push(_contain ? null : cc.p(col * (this._wordWidth + this.colSpacing), row * (this._wordHeight + this.rowSpacing)));

            }
        }

        this.normalKeywords.map((normalKeyword, index) => {
            if (normalKeyword) {
                TouchUtil.addClickBtn(normalKeyword, () => {
                    if (this.containerOutstanding) {
                        if (this.containerOutstanding.active) return;
                        this.containerOutstanding.getComponent(cc.Sprite).spriteFrame = this.framesOutstanding[index];
                        this.containerOutstanding.active = true;
                        let maxDuration;
                        if(this.maxDuration[index]) maxDuration = this.maxDuration[index];
                        AudioUtil.play(this.readAudios[index], () => {
                            this.containerOutstanding.runAction(cc.sequence(cc.scaleTo(0.2, 0.3),
                                cc.delayTime(0.1),
                                cc.moveTo(Math.sqrt(cc.pDistanceSQ(cc.p(this.selectedKeywords[index].parent.convertToWorldSpaceAR(this.selectedKeywords[index].getPosition())),
                                        cc.p(this.containerOutstanding.parent.convertToWorldSpaceAR(this.containerOutstanding.getPosition())))) / 2500,
                                    cc.p(this.containerOutstanding.parent.convertToNodeSpaceAR(this.selectedKeywords[index].parent.convertToWorldSpaceAR(this.selectedKeywords[index].getPosition())))),
                                cc.callFunc(() => {
                                    this.containerOutstanding.active = false;
                                    this.containerOutstanding.setScale(1);
                                    this.containerOutstanding.setPosition(this._orgContainerOutstandingPos);
                                    if (this.selectedKeywords[index].active) {
                                        return;
                                    }
                                    this.selectedKeywords[index].active = true;
                                    normalKeyword.opacity = 0;
                                    this._completeCount++;
                                    let curProgress = this._completeCount / this.selectedKeywords.length * 100;
                                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, curProgress);
                                    if (this._completeCount != this.selectedKeywords.length) {
                                        return;
                                    }
                                    AudioUtil.play(this.goodJobAudio);
                                    if (this.goodJobPanel) {
                                        this.goodJobPanel.setScale(0.2);
                                        this.goodJobPanel.active = true;
                                        this.goodJobPanel.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.delayTime(3), cc.spawn(cc.fadeOut(0.2), cc.scaleTo(0.2, 0.2)), cc.callFunc(() => {
                                            this.goodJobPanel.destroy();
                                            this.goodJobPanel = null;
                                        })));
                                    }
                                })));
                        }, maxDuration);
                    }
                });
            }
        });

        this.selectedKeywords.map((selectedKeyword) => {
            if (selectedKeyword) {
                selectedKeyword.active = false;
            }
        });
    },

    _registerTouchEvent() {
        let _touchStartFunc = (event) => {
            let touchPos = this.wordsPanel.convertToNodeSpaceAR(event.getLocation());
            this._touchPosStart = cc.p(touchPos.x, touchPos.y);
        };
        let _touchEndFunc = (event) => {
            let touchPos = this.wordsPanel.convertToNodeSpaceAR(event.getLocation());
            this._touchPosEnd = touchPos;
            if (cc.pDistance(this._touchPosStart, touchPos) > 30) return;

            touchPos.x = (touchPos.x + this.wordsPanel.width / 2);
            touchPos.y = (this.wordsPanel.height / 2 - touchPos.y);

            this._wordsPosLeftTopArr.map((posLeftTop, index) => {
                if (!posLeftTop) return;
                let _rect = cc.rect(posLeftTop.x, posLeftTop.y, this._wordWidth, this._wordHeight)
                if (cc.rectContainsPoint(_rect, cc.p(touchPos.x, touchPos.y))) {
                    this._clickWrong();
                    return;
                }
            });
        }

        TouchUtil.addMoveNode(this.wordsPanel, _touchStartFunc, null, _touchEndFunc);
    },

    _clickWrong() {
        if (this.containerOutstanding && this.containerOutstanding.active) return;
        AudioUtil.play(this.wrongAudio);
        if (this.wrongPanel) {
            this.wrongPanel.active = true;
            this.wrongPanel.stopAllActions();
            this.wrongPanel.opacity = 255;
            this.wrongPanel.runAction(cc.sequence(cc.delayTime(0.5), cc.fadeOut(0.5)));
        }
    }
});