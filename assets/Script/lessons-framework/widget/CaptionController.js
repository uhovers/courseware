/*!
 * [widget]插图控件(特点是非连续地出现)
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,
    properties: {
        captionNodes: [cc.Node],
        hideAllAtFirst: true,
        //-- 唯一组件，隐藏ID
        compId: {
            type: cc.Integer,
            default: 0,
            override: true,
            visible: false
        },
        nodeScale: 1,
        _curIndex: -1,
    },

    onLoad() {
        //-- 具有唯一性的组件
        this._unique = true;
        this._init();
        this._super();
        this._updateScale();
    },

    events() {
        return {
            [EnumCfg.EEventName.CAPTION_CONTROLLER_SHOW_WITH_INDEX]: this._showWithIndex,
            [EnumCfg.EEventName.CAPTION_CONTROLLER_SHOW_NEXT]: this._showNext,
            [EnumCfg.EEventName.CAPTION_CONTROLLER_HIDE_WITH_INDEX]: this._hideWithIndex,
        }
    },

    _updateScale() {
        this.captionNodes.map((captionNode) => {
            if (captionNode) {
                captionNode.setScale(this.nodeScale);
            }
        });
    },

    /**
     * 初始化
     * @return {[type]} [description]
     */
    _init() {
        if (this.hideAllAtFirst) {
            this.captionNodes.map((captionNode) => {
                captionNode && (captionNode.active = false);
            });
        }
    },

    /**
     * 显示插图
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _showWithIndex(index) {
        this.captionNodes[index] && (this.captionNodes[index].active = true, this._curIndex = index);
    },

    /**
     * 显示下一个插图
     * @param  {[type]} needHidePre [是否隐藏上一个]
     * @return {[type]} [description]
     */
    _showNext(needHidePre) {
        if (needHidePre) this._hideWithIndex(this._curIndex);
        this._showWithIndex(++this._curIndex);
    },

    /**
     * 隐藏插图
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _hideWithIndex(index) {
        if (index == undefined) {
            this.captionNodes.map((captionNode) => {
                if (captionNode) captionNode.active = false;
            });
        } else {
            this.captionNodes[index] && (this.captionNodes[index].active = false);
        }
    },

    onDestroy() {
        this._super();
    }
});