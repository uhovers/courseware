/*!
 * [operation]点击依次出现节点
 * by houzhenag
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');
let NoticeCenter = require('./../core/NoticeCenter');
let TouchUtil = require('./../util/TouchUtil');
let LogUtil = require('./../util/LogUtil');
const AnimUtil = require('./../util/AnimUtil');
cc.Class({
    extends: WidgetBase,

    properties: {
        curIndex: 0,
        appearingNodes: [cc.Node],
        //-- 初始时是否隐藏所有节点
        hideAllAtFirst: true,
        //-- 出现第N个节点时,隐藏之前的节点
        disappearAt: [cc.Integer],
        //-- 附带点击音效
        withClickAudio: true,
        //-- 节点类型：静态/动画
        nodeType: {
            default: [],
            type: [cc.Enum(EnumCfg.ENodeType)],
        },
        //-- 出现方式/默认依次出现
        appearStyle: {
            default: EnumCfg.EAppaerStyle.INORDER,
            type: cc.Enum(EnumCfg.EAppaerStyle)
        },
        isAllAready: true,
        swallTouch: false,
    },

    onLoad() {
        this._super();
    },

    start() {
        this.appearingNodes.map((appearingNode, index) => {
            if (!appearingNode) {
                this.appearingNodes[index] = {}
            }
        });
        if (this.hideAllAtFirst) {
            for (let i = this.appearingNodes.length - 1; i >= this.curIndex; i--) {
                if (this.appearingNodes[i]) {
                    if (i >= this.curIndex) {
                        this.appearingNodes[i].active = false;
                    }
                }
            }
        }

        TouchUtil.addClickBtn(this.node, () => {
            if (this.isAllDone || !this.isAllAready) {
                // ============= 已经全部显示完毕/有正在播放的动作/还未就绪，不响应本次点击 =============
                return;
            }

            if (this.appearStyle == EnumCfg.EAppaerStyle.INORDER) {
                // ============= 按顺序出现 =============
                if (this.appearingNodes[this.curIndex]) {
                    if (this.nodeType[this.curIndex] == EnumCfg.ENodeType.ANIM) {
                        AnimUtil.play(this.appearingNodes[this.curIndex], null, 1);
                    }
                    this.appearingNodes[this.curIndex].active = true;
                    this.hideNodesIfNecessary();
                }
                this.curIndex++;

            }

            if (this.appearingNodes.length <= this.curIndex) {
                this.isAllDone = true;
                this.notice(EnumCfg.EEventName.ON_CLICK_APPEAR_SHOW_ALL);
            }
            this.notice(EnumCfg.EEventName.ON_CLICK_APPEAR_SHOW_WITH_INDEX, this.curIndex);
            if (this.withClickAudio) {
                //-- 点击音效
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK);
            }
            return this.swallTouch;
        });
    },

    events() {
        return {
            [EnumCfg.EEventName.CLICK_APPEAR_ALL_ALREADY]: this._setAllAready,
            [EnumCfg.EEventName.CLICK_APPEAR_RESET]: this._reset,
        }
    },

    hideNodesIfNecessary() {
        //隐藏  下标小于curIndex 
        for (let i = 0, len = this.appearingNodes.length; i < len; i++) {
            if (this.disappearAt[i] < this.curIndex && this.appearingNodes[i]) {
                this.appearingNodes[i].active = false;
            }
        }
    },
    //会隐藏 所有要显示的节点
    _reset(compId = 0) {
        if (compId !== null && compId != this.compId) return;
        this.curIndex = 0;
        this.isAllDone = false;
        this.appearingNodes.map((_node) => {
            _node && (_node.active = false);
        });
    },
    _setAllAready(compId = 0, isAllAready) {
        if (arguments.length == 1) {
            isAllAready = compId;
            compId = 0;
        }
        if (compId !== null && compId != this.compId) return;

        this.isAllAready = !!isAllAready;
    },
});