/*!
 * [operation]点击拖放
 * by houzhenag
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let NoticeCenter = require('./../core/NoticeCenter');
let TouchUtil = require('./../util/TouchUtil');

cc.Class({
    extends: WidgetBase,

    properties: {
        //-- 拖拽物品列表
        dragNodes: [cc.Node],
        //-- 需要替换的拖拽节点的frame   进入判定区域内变显示
        dragChangeFrame: [cc.SpriteFrame],
        //-- [位置]列表
        seatNode: [cc.Node],
        //-- [位置]辅助判断是否拖中
        auxSeatNode: [cc.Node],
        auxDragNodes: [cc.Node],
        //-- 拖放完成后是否隐藏[位置]
        hideSeatFinally: false,
        hideDragFinally: [cc.Boolean],    //默认 false 以及取第一位
        //-- 拖放完成后是否显示[位置]
        showSeatFinally: false,
        //-- [位置]和[被拖物]的对应关系
        dragRules: [cc.String],
        //-- 是否全部准备就绪，可以开始拖放了
        isAllReady: true,
        //-- [位置]封锁
        seatsLocked: [cc.Boolean],
        //-- 无需拖拽，点击入座
        withOutDrag: false,
        //-- 坐下的方式（隐藏/坐下）
        sitDownStyle: {
            default: EnumCfg.ESitDownStyle.SITDOWN,
            type: cc.Enum(EnumCfg.ESitDownStyle)
        },
        //-- 同一个[位置]可以承载多个
        allowMultiRole: false,
        //-- 进度计算的标准
        calcProgressStyle: {
            default: EnumCfg.ECalcProgressStyle.SEAT_BASE,
            type: cc.Enum(EnumCfg.ECalcProgressStyle)
        },
        //-- 是否带音效
        withAudio: false,
        //-- 上传进度
        needUpdateProgress: false,
        //-- 坐下过程时间花费倍数
        timeScaleSitDown: 1,
        correctPriority: false, //优先判断是否可以正确
        //--需要座位存在
        needSeatExsit: false,

        //-- 正在拖拽中
        _isInTouching: false,
        //-- 每个[位置]上当前的[被拖物]ID信息
        _roleIdOnSeatInfo: [],
        //-- 每个[被拖物]的状态（就位/未就位）
        _roleState: [],
        //-- [位置]的坐标信息
        _seatPosArr: [],
        //-- 初始[被拖物]的坐标信息
        _orgRolePosArr: [],
        //-- 触摸层
        _touchPanel: null,

        //-- 替换资源前的资源frame
        _oldFrame: null,
    },

    onLoad() {
        this._super();
        for (let i = 0, length = this.dragNodes.length; i < length; ++i) {
            if (typeof this.hideDragFinally[i] === "undefined") {
                this.hideDragFinally[i] = typeof this.hideDragFinally[0] === "undefined" ? false : this.hideDragFinally[0];
            }

        }
    },

    start() {
        this._updateAllPos(this.compId);
        this._addTouchPanel();
        this._registerTouchEvent();
    },

    events() {
        return {
            [EnumCfg.EEventName.CLICK_DRAG_ALL_ALREADY]: this._setAllAready,
            [EnumCfg.EEventName.CLICK_DRAG_UNLOCK_SEAET]: this._unlockSeat,
            [EnumCfg.EEventName.CLICK_DRAG_SHOW_ALL_DRAG_NODES]: this._showAllDragNodes,
            [EnumCfg.EEventName.CLICK_DRAG_HIDE_ALL_DRAG_NODES]: this._hideAllDragNodes,
            [EnumCfg.EEventName.CLICK_DRAG_HIDE_DRAG_NODES]: this._hideDragNodes,
            [EnumCfg.EEventName.CLICK_DRAG_UPDATE_ALL_POS]: this._updateAllPos,
            [EnumCfg.EEventName.CLICK_DRAG_RESET_CLICK_DRAG]: this._reSetDrag,
        }
    },

    /**
     * 添加触摸层
     * @return {[type]} [description]
     */
    _addTouchPanel() {
        let _touchPanel = new cc.Node;
        cc.director.getScene().getChildByName("Canvas").addChild(_touchPanel);
        _touchPanel.x = 0;
        _touchPanel.y = 0;
        _touchPanel.width = cc.director.getWinSize().width;
        _touchPanel.height = cc.director.getWinSize().height;
        _touchPanel.zIndex = 1;
        this._touchPanel = _touchPanel;
    },

    /**
     * 隐藏指定拖拽物
     * @return {[type]} [description]
     */
    _hideDragNodes(compId = 0, indexArr = []) {
        if (arguments.length == 1) {
            indexArr = compId;
            compId = 0;
        }

        if (compId !== null && compId != this.compId) return;

        if (!Array.isArray(indexArr)) {
            indexArr = [indexArr];
        }
        indexArr.map((id, index) => {
            if (this.dragNodes[id]) {
                this.dragNodes[id].active = false;
            }
        });
    },

    /**
     * 隐藏所有拖拽物
     * @return {[type]} [description]
     */
    _hideAllDragNodes(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this.dragNodes.map((dragNode) => {
            dragNode && (dragNode.active = false)
        });
    },

    /**
     * 显示所有拖拽物
     * @return {[type]} [description]
     */
    _showAllDragNodes(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this.dragNodes.map((dragNode) => {
            dragNode && (dragNode.active = true)
        });
    },
    checkDragNodeTouch(index, touchWorldPos) {
        let dragNodes = [];
        if (this.auxDragNodes[index]) {
            dragNodes = [...this.auxDragNodes[index].children];
            dragNodes.push(this.auxDragNodes[index]);
        }
        dragNodes.push(this.dragNodes[index]);
        for (let i = 0, dragNode; dragNode = dragNodes[i]; ++i) {
            if (dragNode.getBoundingBox().contains(dragNode.parent.convertToNodeSpaceAR(touchWorldPos))) {
                return true;
            }
        }
        return false;
    },
    /**
     * 拖逻逻辑
     * @return {[type]} [description]
     */

    _registerTouchEvent() {
        this._curSelectIndex = -1;
        this.dragNodes.forEach((dragNode, index) => {
            TouchUtil.addMoveNode(dragNode, (event) => {
                this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_START);
                this._curSelectIndex = -1;
                if (!this.isAllReady || this._isInTouching) {
                    dragNode.valid = true;
                    return;
                }
                this._isInTouching = true;
                if (this._roleState[index] != EnumCfg.ERoleState.SITDOWN && this.dragNodes[index] && this.dragNodes[index].activeInHierarchy && this.checkDragNodeTouch(index, event.getLocation())) {
                    this._curSelectIndex = index;
                    if (this.dragChangeFrame && this.dragChangeFrame.length > 0) {
                        // 用到替图的情况下， 对干扰项提前判定
                        if (!this.dragChangeFrame[index]) {
                            this._repulse();
                            this._curSelectIndex = -1;
                            return true;
                        }
                    }
                    this.dragNodes[index].zIndex = 3;
                    this.dragNodes[index].stopAllActions();
                    return true;
                }
            }, (event) => {
                if (this._curSelectIndex != -1 && !this.withOutDrag) {
                    this.dragNodes[this._curSelectIndex].setPosition(this.dragNodes[this._curSelectIndex].parent.convertToNodeSpaceAR(event.getLocation()));
                    if (this.dragChangeFrame[this._curSelectIndex]) {
                        for (let seatId = 0, len = this.seatNode.length; seatId < len; seatId++) {
                            let rect;
                            if (this.auxSeatNode[seatId]) {
                                rect = this.auxSeatNode[seatId].getBoundingBox();
                            } else {
                                rect = this.seatNode[seatId].getBoundingBox();
                            }
                            if (rect.contains(this.dragNodes[this._curSelectIndex].getPosition())) {
                                if (!this._oldFrame) {
                                    this._oldFrame = this.dragNodes[this._curSelectIndex].getComponent(cc.Sprite).spriteFrame;
                                    this.dragNodes[this._curSelectIndex].getComponent(cc.Sprite).spriteFrame = this.dragChangeFrame[this._curSelectIndex];
                                }
                                return;
                            } else {
                                if (this._oldFrame) {
                                    this.dragNodes[this._curSelectIndex].getComponent(cc.Sprite).spriteFrame = this._oldFrame;
                                    this._oldFrame = null;
                                }
                            }
                        }
                    }
                }
            }, (event) => {
                this._isInTouching = false;

                if (this._curSelectIndex == -1) {
                    return
                }

                console.log('test----_curSelectIndex', this._curSelectIndex);
                // if (!this.dragRules[this._curSelectIndex]) {
                //     this._repulse();
                //     return;
                // }
                let dragRules = this.dragRules[this._curSelectIndex] ? this.dragRules[this._curSelectIndex].split("|") : [];

                this.dragNodes[this._curSelectIndex].stopAllActions();
                this.dragNodes[this._curSelectIndex].setLocalZOrder(2);

                if (this.withOutDrag) {
                    // ============= 无需判断是否拖拽到正确[位置] =============
                    let seatId = dragRules[0];
                    let bSeatDown = this._checkSitDownOrNot(seatId);
                    console.log('test----bSeatDown', bSeatDown, seatId);
                    if (bSeatDown) {
                        this._sitDown(seatId);
                    } else {
                        this._repulse(seatId);
                    }

                } else {
                    // ============= 判断是否拖拽到正确[位置] =============
                    let seatIdArray = [];
                    if (this.correctPriority) {
                        for (let i = 0; i < dragRules.length; ++i) {
                            let seatId = parseInt(dragRules[i])
                            cc.log("111111   ", this.seatsLocked[seatId], seatId, this.allowMultiRole, this._roleIdOnSeatInfo[seatId])
                            if ((!this.seatsLocked[seatId] && (this.allowMultiRole || !this._roleIdOnSeatInfo[seatId]))) {
                                seatIdArray.push(seatId);
                            }
                        }
                    }
                    for (let i = 0; i < this.seatNode.length; ++i) {
                        seatIdArray.push(i);
                    }

                    let arrTemp = [];
                    seatIdArray.forEach((val, index) => {
                        if (seatIdArray.indexOf(val) === index) {
                            arrTemp.push(val);
                        }
                    })
                    seatIdArray = arrTemp;
                    for (let i = 0; i < seatIdArray.length; ++i) {
                        let seatId = seatIdArray[i]

                        // if (!this.seatNode[seatId].active) {
                        //     continue;
                        // }

                        let bSeatDown = false;
                        let rect;
                        if (this.auxSeatNode[seatId]) {
                            rect = this.auxSeatNode[seatId].getBoundingBox();
                        } else {
                            rect = this.seatNode[seatId].getBoundingBox();
                        }
                        if (rect.contains(this.seatNode[seatId].parent.convertToNodeSpaceAR(event.getLocation()))) {
                            dragRules.map((_seatId, index) => {
                                if (_seatId == seatId) {
                                    bSeatDown = this._checkSitDownOrNot(seatId);
                                    console.log('test----_seatId', _seatId, bSeatDown);
                                }
                            });

                            if (bSeatDown) {
                                this._sitDown(seatId);
                            } else {
                                this._repulse(seatId);
                            }

                            // ============= 将[位置]状态通知给外部 =============
                            this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_STATE_CHANGE, this._roleIdOnSeatInfo, this.dragNodes[this._curSelectIndex], this.seatNode[seatId]);

                            return;
                        }
                    }
                    // ============= 没有拖到任何[位置]上 =============
                    this.dragNodes[this._curSelectIndex].runAction(cc.moveTo(0.2, this._orgRolePosArr[this._curSelectIndex]));
                }
            }, (event) => {
                this._isInTouching = false;

                // ============= 没有拖到任何[位置]上 =============
                if (this._curSelectIndex == -1) {
                    return
                }
                this.dragNodes[this._curSelectIndex].stopAllActions();
                this.dragNodes[this._curSelectIndex].runAction(cc.moveTo(0.2, this._orgRolePosArr[this._curSelectIndex]));
                this._oldFrame = null;
            });
        })
    },

    /**
     * 记录[拖拽物]和[位置]的坐标信息
     * @param  {Number} compId [description]
     * @return {[type]}        [description]
     */
    _updateAllPos(compId = 0) {
        if (compId !== null && compId != this.compId) return;

        this._seatPosArr = [];
        this.seatNode.map((seatNode) => {
            seatNode && this._seatPosArr.push(cc.p(seatNode.convertToWorldSpaceAR(cc.p(0, 0))));
        });
        this._orgRolePosArr = [];
        this.dragNodes.map((dragNode) => {
            dragNode && this._orgRolePosArr.push(cc.p(dragNode.getPosition()))
        });
    },

    /**
     * 判断是否坐下并记录
     * @param  {[type]} seatId [description]
     * @return {[type]}        [description]
     */
    _checkSitDownOrNot(seatId) {
        console.log('test----seatId', seatId, this.seatsLocked[seatId], this.allowMultiRole, !this._roleIdOnSeatInfo[seatId]);
        if ((!this.needSeatExsit || this.seatNode[seatId]) && !this.seatsLocked[seatId] && (this.allowMultiRole || !this._roleIdOnSeatInfo[seatId])) {
            if (this.allowMultiRole) {
                this._roleIdOnSeatInfo[seatId] = this._roleIdOnSeatInfo[seatId] || [];
                this._roleIdOnSeatInfo[seatId].push(this._curSelectIndex + 1);
            } else {
                this._roleIdOnSeatInfo[seatId] = this._curSelectIndex + 1;
            }
            this._roleState[this._curSelectIndex] = EnumCfg.ERoleState.SITDOWN;

            this._updateProgress();
            return true;
        }
        return false;
    },

    /**
     * 对外通知拖拽进度
     * @return {[type]} [description]
     */
    _updateProgress() {
        let progressVal = -1;
        if (this.calcProgressStyle == EnumCfg.ECalcProgressStyle.SEAT_BASE) {
            let seatCount = this.seatNode.length;
            let seatUponCount = 0;
            this._roleIdOnSeatInfo.map((roleId) => {
                roleId && seatUponCount++;
            });
            if (seatCount > 0) {
                progressVal = seatUponCount / seatCount * 100;

            }
        } else if (this.calcProgressStyle == EnumCfg.ECalcProgressStyle.ROLE_BASE) {
            let roleCount = this.dragNodes.length;
            let roleSitDownCount = 0;
            this._roleState.map((roleState) => {
                roleState == EnumCfg.ERoleState.SITDOWN && roleSitDownCount++;
            });
            if (roleCount > 0) {
                progressVal = roleSitDownCount / roleCount * 100;
            }
        }
        if (progressVal > -1) {
            //-- 拖拽进度变化
            this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_PROGRESS, progressVal);
            //-- 是否需要上传进度
            if (this.needUpdateProgress) {
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, progressVal)
            }
        }
    },

    /**
     * 拖拽成功后的表现
     * @param  {[type]} seatId [description]
     * @return {[type]}        [description]
     */
    _sitDown(seatId) {
        let _delayTimeForNotice;
        if (this.sitDownStyle == EnumCfg.ESitDownStyle.SITDOWN) {
            // ============= 方式一：坐下 =============
            let curScale = this.dragNodes[this._curSelectIndex].scale || 1;
            this.dragNodes[this._curSelectIndex].runAction(
                cc.sequence(cc.moveTo(0.1 * this.timeScaleSitDown, this.dragNodes[this._curSelectIndex].parent.convertToNodeSpaceAR(this._seatPosArr[seatId])),
                    cc.callFunc(() => {
                        this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_SITDOWN, this._curSelectIndex);
                    })
                )

            );
        } else if (this.sitDownStyle == EnumCfg.ESitDownStyle.HIDE) {
            // ============= 方式二：隐藏 =============
            this.dragNodes[this._curSelectIndex].active = false;
        } else if (this.sitDownStyle == EnumCfg.ESitDownStyle.STATIC) {
            // ============= 方式三：静止不动 =============
            this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_SITDOWN, this._curSelectIndex);
        } else if (this.sitDownStyle == EnumCfg.ESitDownStyle.BACK) {
            // ============= 方式四：回到原位置 =============
            let dragNodes = this.dragNodes[this._curSelectIndex];
            let seatPos = dragNodes.parent.convertToNodeSpaceAR(this._seatPosArr[seatId]);
            dragNodes.runAction(cc.sequence(
                cc.moveTo(0.1, seatPos),
                cc.spawn(cc.moveTo(0.2, this._orgRolePosArr[this._curSelectIndex]), cc.scaleTo(0.2, 1)),
                cc.callFunc(() => {

                })));
        } else if (this.sitDownStyle == EnumCfg.ESitDownStyle.FLY_INTO_FROM_TOP) {
            let bezierTime = 0.7;
            _delayTimeForNotice = bezierTime;
            // ============= 方式五：从上方飞入 =============
            let startPos = this.dragNodes[this._curSelectIndex].getPosition();
            let finalPos = this.dragNodes[this._curSelectIndex].parent.convertToNodeSpaceAR(this._seatPosArr[seatId]);

            let winSize = cc.director.getWinSize();
            var bezier = [startPos, cc.p((startPos.x + finalPos.x) / 2, finalPos.y + winSize.height * 2 / 5), finalPos];
            var bezierTo = cc.bezierTo(0.7, bezier);
            this.dragNodes[this._curSelectIndex].runAction(
                cc.sequence(
                    bezierTo.easing(cc.easeSineOut()), cc.callFunc((theNode) => {
                    })
                )
            );
        }
        if (this.hideSeatFinally && this.seatNode[seatId]) {
            this.seatNode[seatId].active = false;
        }
        if (this.showSeatFinally && this.seatNode[seatId]) {
            this.seatNode[seatId].active = true;
        }
        if (this.hideDragFinally[this._curSelectIndex] && this.dragNodes[this._curSelectIndex]) {
            this.dragNodes[this._curSelectIndex].active = false;
        }
        if (_delayTimeForNotice) {
            let _curSelectIndex = this._curSelectIndex;
            this.setTimeout(() => {
                this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_RIGHT, _curSelectIndex, seatId);
                this.withAudio && NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.RIGHT)
            }, _delayTimeForNotice * 1000);
        } else {
            this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_RIGHT, this._curSelectIndex, seatId);
            this.withAudio && NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.RIGHT)
        }
        this._oldFrame = null;
    },

    /**
     * 拖拽错误后的表现
     * @param  {[type]} seatId [description]
     * @return {[type]}        [description]
     */
    _repulse(seatId) {
        let dragNodes = this.dragNodes[this._curSelectIndex];
        if (this.sitDownStyle == EnumCfg.ESitDownStyle.STATIC || seatId == undefined) {
            if (dragNodes) {
                let dragNodePos = this._orgRolePosArr[this._curSelectIndex];
                dragNodes.runAction(cc.sequence(
                    cc.sequence(
                        cc.moveTo(0.03, cc.p(dragNodePos.x + 30, dragNodePos.y)),
                        cc.moveTo(0.06, cc.p(dragNodePos.x - 30, dragNodePos.y)),
                        cc.moveTo(0.03, cc.p(dragNodePos.x, dragNodePos.y))
                    ).repeat(2), cc.callFunc(() => {

                    })))
            }
        } else {
            if (dragNodes) {
                let seatPos = dragNodes.parent.convertToNodeSpaceAR(this._seatPosArr[seatId]);
                dragNodes.runAction(cc.sequence(
                    cc.moveTo(0.1, seatPos),
                    cc.sequence(
                        cc.moveTo(0.03, cc.p(seatPos.x + 30, seatPos.y)),
                        cc.moveTo(0.06, cc.p(seatPos.x - 30, seatPos.y)),
                        cc.moveTo(0.03, cc.p(seatPos.x, seatPos.y))
                    ).repeat(2), cc.moveTo(0.2, this._orgRolePosArr[this._curSelectIndex]), cc.callFunc(() => {

                    })));
            }
        }
        if (this._oldFrame) {
            dragNodes.getComponent(cc.Sprite).spriteFrame = this._oldFrame;
            this._oldFrame = null;
        }
        if (!this.isAllReady) return;
        this.notice(EnumCfg.EEventName.ON_CLICK_DRAG_WRONG, this._curSelectIndex, seatId);
        this.withAudio && NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.WRONG)
    },

    /**
     * 是否允许拖拽
     * @param {Number} compId [description]
     */
    _setAllAready(compId = 0, isAllReady = true) {
        if (arguments.length == 1) {
            isAllReady = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        this.isAllReady = !!isAllReady;
    },
    _reSetDrag(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this._roleIdOnSeatInfo = []
        this._roleState = [];
    },
    /**
     * 解锁[位置]
     * @param  {Number} compId [description]
     * @param  {[type]} seatId [description]
     * @return {[type]}        [description]
     */
    _unlockSeat(compId = 0, seatId) {
        if (arguments.length == 1) {
            seatId = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;
        this.seatsLocked[seatId] = false;
    }
});