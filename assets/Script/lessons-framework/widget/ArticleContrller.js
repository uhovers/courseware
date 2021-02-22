/*!
 * [widget]多行文稿阅读控件
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let NoticeCenter = require('./../core/NoticeCenter');
let TouchUtil = require('./../util/TouchUtil');

cc.Class({
    extends: WidgetBase,

    properties: {
        //-- 字幕显示容器
        container: cc.Node,
        //-- 红色字幕纹理资源
        redSentences: [cc.SpriteFrame],
        //-- 黑色字幕纹理资源
        blackSentences: [cc.SpriteFrame],
        useWhite: false,
        whiteSentences: [cc.SpriteFrame],
        redColor:cc.Color,
        blackColor: cc.Color,
        //-- 每一行的阅读时长
        audioTimeLengthArr: [cc.Float],
        //-- 最多显示行数
        maxDisplayCount: -1,
        //-- 行间距
        lineSpacing: 0,
        //-- 对齐方式
        alignStyle: {
            default: EnumCfg.EETextAlignStyle.LEFT,
            type: cc.Enum(EnumCfg.EETextAlignStyle),
        },

        //-- 开始前是否显示所有
        showAllAtBegin: false,
        //-- 向上滚动一行的时间
        scorllDuration: 1,
        //-- 各句是否相互独立(相互独立时，多句可并行播放)
        isIndependence: false,
        //-- 结束行后不重置
        withoutLineReset: false,
        //-- 时间缩放
        timeScale: 1,
        //-- 缓冲宽度
        buffer: 0,

        //-- 是否自动阅读下一句
        _nextAuto: false,
        //-- 当前行号
        _curPlayIndex: 0,
        //-- 红色字幕节点
        _subtitleRedNodes: [cc.Node],
        //-- 黑色字幕纹理节点
        _subtitleBlackNodes: [cc.Node],
        //-- 每一行的遮罩
        _subtitleMasks: [],
        //-- 每一行的底衬遮罩
        _subtitleBackMasks: [],
        //-- 完成一行的标志
        _doneFlag: true,
        //-- 暂停标志
        _pauseFlag: false,
        //-- 滚动面板
        _scrollViewPanel: cc.Node,
        //-- 滚动视图
        _scrollView: cc.Node,
        //-- 红色字幕底部posY
        _bottomYRed: 0,
        //-- 黑色字幕底部posY
        _bottomYBlack: 0,
        //-- 偏移回归记录
        _offsetRecords: [],
        //-- 总高
        _totalHeight: 0
    },

    onLoad() {
        this._super();
    },

    events() {
        return {
            [EnumCfg.EEventName.ARTICLE_CONTROLLER_PLAY]: this._play,
            [EnumCfg.EEventName.ARTICLE_CONTROLLER_PAUSE]: this._pause,
            [EnumCfg.EEventName.ARTICLE_CONTROLLER_GOON]: this._goon,
            [EnumCfg.EEventName.ARTICLE_CONTROLLER_UPDATE_TIMELEN]: this._updateAudioTimeLen,
            [EnumCfg.EEventName.ARTICLE_CONTROLLER_RESET]: this._reset,
            [EnumCfg.EEventName.ARTICLE_CONTROLLER_SET_TIME_SCALE]: this._setTimeScale,
        }
    },

    start() {
        this._init();
    },

    _init() {
        this.maxDisplayCount = Math.min(this.maxDisplayCount, this.redSentences.length);
        if (this.maxDisplayCount == -1) {
            this.maxDisplayCount = this.redSentences.length;
            if(this.useWhite) this.maxDisplayCount = this.whiteSentences.length
        }
       
        if(this.useWhite){
            this.whiteSentences.map((frame, index) => {
                let red_node = new cc.Node();
                let red_sprite = red_node.addComponent(cc.Sprite);
                red_node.color = this.redColor
                red_sprite.spriteFrame = frame;
                this._subtitleRedNodes[index] = red_node;

                let black_node = new cc.Node();
                let black_sprite = black_node.addComponent(cc.Sprite);
                black_node.color = this.blackColor
                black_sprite.spriteFrame = frame;
                this._subtitleBlackNodes[index] = black_node;
            });
        }else{
            this.redSentences.map((redFrame, index) => {
                let _node = new cc.Node();
                let _sprite = _node.addComponent(cc.Sprite);
                _sprite.spriteFrame = redFrame;
                this._subtitleRedNodes[index] = _node;
            });
            this.blackSentences.map((blackFrame, index) => {
                let _node = new cc.Node();
                let _sprite = _node.addComponent(cc.Sprite);
                _sprite.spriteFrame = blackFrame;
                this._subtitleBlackNodes[index] = _node;
            });
        }
        let _lineIndex = 0;
        let _bindSubtitleNodeToMask = (subtitleNode, index, isRed) => {
            if (subtitleNode) {
                if (!isRed) {
                    subtitleNode.active = !!this.showAllAtBegin;
                }
                let subtitleMaskArr = isRed ? this._subtitleMasks : this._subtitleBackMasks;
                let subtitleMask = new cc.Node();
                subtitleMaskArr.push(subtitleMask);
                subtitleMask.addComponent(cc.Mask);
                let mask = subtitleMask.getComponent(cc.Mask);
                mask.inverted = !isRed;
                this.container.addChild(subtitleMask);
                subtitleMask.width = 0;
                subtitleMask.height = subtitleNode.height;
                subtitleMask.setAnchorPoint(0, 0.5);
                subtitleNode.removeFromParent(false);
                subtitleMask.addChild(subtitleNode);

                subtitleNode.anchorX = 0;
                subtitleNode.x = 0;
                subtitleNode.y = 0;

                if (!this.subtitleAreaLeftBottomPoint) {
                    this.subtitleAreaLeftBottomPoint = cc.v2();
                }

                if (this.alignStyle == EnumCfg.EETextAlignStyle.LEFT) {
                    subtitleMask.x = 0;
                } else if (this.alignStyle == EnumCfg.EETextAlignStyle.CENTER) {
                    subtitleMask.x = -(subtitleNode.width >> 1);
                } else if (this.alignStyle == EnumCfg.EETextAlignStyle.RIGHT) {
                    subtitleMask.x = -subtitleNode.width;
                }
                if (isRed) {
                    subtitleMask.y = this._bottomYRed - subtitleMask.height / 2 - (this._bottomYRed == 0 ? 0 : this.lineSpacing);
                    this._bottomYRed = subtitleMask.y - subtitleMask.height / 2;

                } else {
                    subtitleMask.y = this._bottomYBlack - subtitleMask.height / 2 - (this._bottomYBlack == 0 ? 0 : this.lineSpacing);
                    this._bottomYBlack = subtitleMask.y - subtitleMask.height / 2;
                }

                //-- 计算总遮罩尺寸
                let maskLeft = subtitleMask.x;
                let maskRight = subtitleMask.x + subtitleNode.width;
                if (this._bigMaskLeft == undefined) this._bigMaskLeft = maskLeft;
                if (this._bigMaskRight == undefined) this._bigMaskRight = maskRight;
                if (this._bigMaskTop == undefined) this._bigMaskTop = subtitleMask.y + subtitleMask.height / 2;
                this._bigMaskBottom = subtitleMask.y - subtitleMask.height / 2;
                this._bigMaskLeft = Math.min(this._bigMaskLeft, maskLeft);
                this._bigMaskRight = Math.max(this._bigMaskRight, maskRight);

                if (isRed) {
                    _lineIndex++;
                    let curHeight = this._bigMaskTop - this._bigMaskBottom
                    this._totalHeight = Math.max(curHeight, this._totalHeight)
                    if (this.maxDisplayCount == _lineIndex) {
                        this._displayHeight = curHeight;
                    }
                    if (_lineIndex > this.maxDisplayCount) {
                        this._offsetRecords[_lineIndex - 1] = (this._offsetRecords[_lineIndex - 2] ? this._offsetRecords[_lineIndex - 2] : 0) + subtitleNode.height + this.lineSpacing;
                    }
                }
            }
        }

        //-- 为每一行添加遮罩
        this.container && this._subtitleRedNodes.map((subtitleRedNode, index) => {
            _bindSubtitleNodeToMask(subtitleRedNode, index, true);
        });

        this.container && this._subtitleBlackNodes.map((subtitleBlackNode, index) => {
            _bindSubtitleNodeToMask(subtitleBlackNode, index, false);
        });
        let length = this.redSentences.length
        if(this.useWhite){
            length = this.whiteSentences.length
        }
        if (this.maxDisplayCount < length && this.container && this.container.parent) {

            let scrollPanelParent = this.container.parent;

            //-- 1.创建scorllPanel
            let scorllPanel = new cc.Node();
            let anchorX;
            if (this.alignStyle == EnumCfg.EETextAlignStyle.LEFT) {
                anchorX = 0;
            } else if (this.alignStyle == EnumCfg.EETextAlignStyle.CENTER) {
                anchorX = 0.5;
            } else if (this.alignStyle == EnumCfg.EETextAlignStyle.RIGHT) {
                anchorX = 1;
            }
            scorllPanel.setAnchorPoint(anchorX, 1);
            scorllPanel.x = this.container.x;
            scorllPanel.y = this.container.y
            scorllPanel.width = this._bigMaskRight - this._bigMaskLeft;
            scorllPanel.height = this._displayHeight;

            scrollPanelParent.addChild(scorllPanel, this.container.getLocalZOrder());

            //-- 1.1.创建滑动遮罩(在滚动区域内滑动时，不出现划线)
            let swapMask = new cc.Node();
            swapMask.x = scorllPanel.x;
            swapMask.y = scorllPanel.y;
            swapMask.width = scorllPanel.width;
            swapMask.height = scorllPanel.height;
            swapMask.anchorX = scorllPanel.anchorX;
            swapMask.anchorY = scorllPanel.anchorY;
            scrollPanelParent.addChild(swapMask, this.container.getLocalZOrder() + 1);
            TouchUtil.addMoveNode(swapMask, () => {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_STOP_ONCE, true);
            });
            swapMask.on(cc.Node.EventType.MOUSE_WHEEL, (event) => {
                event.stopPropagation();
            })
            //-- 2.添加scrollView组件
            let scrollView = scorllPanel.addComponent(cc.ScrollView);
            scrollView.horizontal = false;
            scrollView.vertical = true;
            scrollView.inertia = false;
            scrollView.brake = 0.75;
            scrollView.elastic = false;
            scrollView.bounceDuration = 0.63;
            // scorllPanel.on("scroll-began", () => {
            //     NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_STOP_ONCE, true);
            // });
            // //-- 3.创建maskView
            let maskPanel = new cc.Node();
            maskPanel.width = scorllPanel.width;
            maskPanel.height = scorllPanel.height;
            maskPanel.setAnchorPoint(scorllPanel.anchorX, scorllPanel.anchorY);
            scorllPanel.addChild(maskPanel);
            this._scorllPanel = scorllPanel;
            let mask = maskPanel.addComponent(cc.Mask);
            mask.inverted = false;

            this.container.removeFromParent(false);
            maskPanel.addChild(this.container);
            this.container.x = 0;
            this.container.y = 0;
            this.container.anchorX = scorllPanel.anchorX;
            this.container.anchorY = scorllPanel.anchorY;
            this.container.width = scorllPanel.width;
            this.container.height = 0;
            scrollView.content = this.container;
            this._scrollView = scrollView;
            this._scrollView.enabled = false;

            if (this.showAllAtBegin) {
                this.container.height = this._totalHeight;
                this._scrollView.enabled = true;
            }
        }
    },

    update(dt) {
        if (this.isIndependence) {
            this._curPlayIndexHeapUp = this._curPlayIndexHeapUp || [];
            this._curPlayIndexHeapUp.map((index) => {
                let _subtitleRedNodes = this._subtitleRedNodes[index];
                let subtitleMask = this._subtitleMasks[index];
                let subtitleBackMask = this._subtitleBackMasks[index];
                if (_subtitleRedNodes && subtitleMask) {
                    let audioTimeLength = this.audioTimeLengthArr[index] || 1;
                    audioTimeLength     = audioTimeLength * (this.timeScale || 1)
                    let addWidth = (_subtitleRedNodes.width / audioTimeLength) * dt;
                    if (subtitleMask.width + addWidth > _subtitleRedNodes.width + (this.buffer || 0)) {
                        this._stop(this.compId, index);
                        return;
                    }
                    subtitleMask.width = subtitleMask.width + addWidth;
                    if (subtitleBackMask) {
                        subtitleBackMask.width = subtitleBackMask.width + addWidth;
                    }
                }
            });
        } else {
            let _subtitleRedNodes = this._subtitleRedNodes[this._curPlayIndex];
            let subtitleMask = this._subtitleMasks[this._curPlayIndex];
            let subtitleBackMask = this._subtitleBackMasks[this._curPlayIndex];
            if (_subtitleRedNodes && subtitleMask) {
                if (this._doneFlag || this._pauseFlag) return;
                let audioTimeLength = this.audioTimeLengthArr[this._curPlayIndex] || 1;
                audioTimeLength     = audioTimeLength * (this.timeScale || 1)
                let addWidth = (_subtitleRedNodes.width / audioTimeLength) * dt;
                if (subtitleMask.width + addWidth > _subtitleRedNodes.width + (this.buffer || 0)) {
                    this._stop(this.compId, null);
                    return;
                }
                subtitleMask.width = subtitleMask.width + addWidth;
                if (subtitleBackMask) {
                    subtitleBackMask.width = subtitleBackMask.width + addWidth;
                }
            }
        }
    },

    /**
     * 更新时长
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _updateAudioTimeLen(compId = 0, index, timeLen) {
        if (arguments.length == 2) {
            timeLen = index;
            index = compId;
            compId = 0;
        } else if (arguments.length == 1) {
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        if (index != undefined && timeLen != undefined) {
            this.audioTimeLengthArr[index] = timeLen;
        }
    },

    /**
     * 结束播放
     * @param  {Number} compId [description]
     * @param  {[type]} index  [description]
     * @return {[type]}        [description]
     */
    _stop(compId = 0, index) {
        if (arguments.length == 1) {
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        ////======== 通知外部 ========
        this.notice(EnumCfg.EEventName.ON_ARTICLE_CONTROLLER_COMPLETE, index == undefined ? this._curPlayIndex : index);
        ////======== 属性变化 ========
        if (this.isIndependence) {
            this._curPlayIndexHeapUp = this._curPlayIndexHeapUp || [];
            this._curPlayIndexHeapUp = this._curPlayIndexHeapUp.filter((item) => {
                return item != index;
            });
            if (this._subtitleMasks[index] && this._subtitleRedNodes[index] && !this.withoutLineReset) {
                this._subtitleMasks[index].width = 0; // this._subtitleRedNodes[index].width;
            }

            if (this._subtitleBackMasks[index] && this._subtitleBlackNodes[index] && !this.withoutLineReset) {
                this._subtitleBackMasks[index].width = 0; // this._subtitleBlackNodes[index].width;
            }
        } else {
            this._doneFlag = true;
            if (this._subtitleMasks[this._curPlayIndex] && this._subtitleRedNodes[this._curPlayIndex] && !this.withoutLineReset) {
                this._subtitleMasks[this._curPlayIndex].width = 0; //this._subtitleRedNodes[this._curPlayIndex].width;
            }

            if (this._subtitleBackMasks[this._curPlayIndex] && this._subtitleBlackNodes[this._curPlayIndex] && !this.withoutLineReset) {
                this._subtitleBackMasks[this._curPlayIndex].width = 0; // this._subtitleBlackNodes[this._curPlayIndex].width;
            }
            if (this._nextAuto && this._subtitleRedNodes[this._curPlayIndex + 1]) {
                this._play(this.compId, this._curPlayIndex + 1, true);
            }
        }
    },

    /**
     * 开始播放
     * @param  {Number}  compId   [description]
     * @param  {[type]}  index    [description]
     * @param  {Boolean} nextAuto [description]
     * @return {[type]}           [description]
     */
    _play(compId = 0, index, nextAuto = false) {
        if (arguments.length == 2) {
            nextAuto = index;
            index = compId;
            compId = 0;
        } else if (arguments.length == 1) {
            index = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        this._nextAuto = !!nextAuto;

        if (this.isIndependence) {
            if (this._subtitleRedNodes[index]) {
                this._curPlayIndexHeapUp = this._curPlayIndexHeapUp || [];
                if (this._curPlayIndexHeapUp.indexOf(index) == -1) {
                    this._curPlayIndexHeapUp.push(index);
                }

                this._subtitleMasks[index] && (this._subtitleMasks[index].width = 0);
                this._subtitleBackMasks[index] && (this._subtitleBackMasks[index].width = 0);
                if (this._subtitleRedNodes[index] && !this._subtitleRedNodes[index].active) {
                    this._subtitleRedNodes[index].active = true;
                }
                if (this._subtitleBlackNodes[index] && !this._subtitleBlackNodes[index].active) {
                    this._subtitleBlackNodes[index].active = true;
                    this._subtitleBlackNodes[index].opacity = 0;
                    this._subtitleBlackNodes[index].runAction(cc.fadeIn(1));
                }
            }
        } else {
            this._stop();
            if (this._subtitleRedNodes[index]) {
                this._curPlayIndex = index;
                this._pauseFlag = false;
                this._doneFlag = false;
                this._subtitleMasks[index] && (this._subtitleMasks[index].width = 0);
                this._subtitleBackMasks[index] && (this._subtitleBackMasks[index].width = 0);

                if (this._subtitleBlackNodes[index] && !this._subtitleBlackNodes[index].active) {
                    this._subtitleBlackNodes[index].active = true;
                    this._subtitleBlackNodes[index].opacity = 0;
                    this._subtitleBlackNodes[index].runAction(cc.fadeIn(1));
                }
                if (this._subtitleRedNodes[index] && !this._subtitleRedNodes[index].active) {
                    this._subtitleRedNodes[index].active = true;
                }
                if (index + 1 > this.maxDisplayCount) {
                    if (this._scrollView) {
                        let curScrollOffset = this._scrollView.getScrollOffset();
                        this.container.height = Math.max(this.container.height, this._offsetRecords[index] + this._scorllPanel.height);
                        this._scrollView.scrollToOffset(cc.v2(0, this._offsetRecords[index]), this.scorllDuration);
                        this._scrollView.enabled = true;
                    }
                }
            }
        }
    },

    /**
     * 暂停播放
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _pause(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._pauseFlag = true;
        console.log('test----_pauseFlag',this._pauseFlag);
    },

    /**
     * 继续播放
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _goon(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._pauseFlag = false;
    },

    /**
     * 重置
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _reset(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        if (this._scrollView) {
            this._scrollView.scrollToOffset(cc.v2(0, 0), 0);
            this._scrollView.enabled = false;
        }
        [].concat.call(this._subtitleBlackNodes, this._subtitleRedNodes).map((subtitleNode) => {
            subtitleNode && (subtitleNode.active = !!this.showAllAtBegin);
        });
    },

    /**
     * 设置时间缩放
     */
    _setTimeScale(compId = 0, scale = 1){
        if (arguments.length == 1) {
            scale = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        this.timeScale = scale;
    },

    onDestroy() {
        this._super();
    }
});