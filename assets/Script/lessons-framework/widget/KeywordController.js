/*!
 * [widget]关键字（功能和插图字幕类似，区分开是为了防止后续功能设计时耦合）
 * by houzehang
 */
let WidgetBase = require('./../basement/WidgetBase');
let EnumCfg = require('./../config/EnumCfg');

cc.Class({
    extends: WidgetBase,
    properties: {
        keywordNodes: [cc.Node],
        hideOthersAppearing: false,
        hideAllAtFirst: true,
        //-- 唯一组件，隐藏ID
        compId: {
            type: cc.Integer,
            default: 0,
            override: true,
            visible: false
        },
        _curIndex: -1,

    },

    onLoad() {
        //-- 具有唯一性的组件
        this._unique = true;
        this._super();
    },

    start() {
        this._init();
    },

    events() {
        return {
            [EnumCfg.EEventName.KEYWORD_CONTROLLER_SHOW_WITH_INDEX]: this._showWithIndex,
            [EnumCfg.EEventName.KEYWORD_CONTROLLER_SHOW_NEXT]: this._showNext,
            [EnumCfg.EEventName.KEYWORD_CONTROLLER_HIDE_WITH_INDEX]: this._hideWithIndex,
            [EnumCfg.EEventName.KEYWORD_CONTROLLER_HIDE_CUR]: this._hideCur,
        }
    },

    /**
     * 初始化
     * @return {[type]} [description]
     */
    _init() {
        if (this.hideAllAtFirst) {
            this.keywordNodes.map((keywordNode) => {
                keywordNode && (keywordNode.active = false);
            });
        }
    },

    /**
     * 显示关键字
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _showWithIndex(index) {
        if (this.hideOthersAppearing) {
            this.keywordNodes.map((node) => {
                if (node) node.active = false;
            });
        }
        if (index == undefined) {
            this.keywordNodes.map((keywordNode) => {
                if (keywordNode) keywordNode.active = true;
            });
        } else {
            this.keywordNodes[index] && (this.keywordNodes[index].active = true, this._curIndex = index);
        }
    },

    /**
     * 显示下一个关键字
     * @param  {[type]} needHidePre [是否隐藏上一个]
     * @return {[type]} [description]
     */
    _showNext(needHidePre) {
        if (needHidePre) this._hideWithIndex(this._curIndex);
        this._showWithIndex(++this._curIndex);
    },

    /**
     * 隐藏关键字
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _hideWithIndex(index) {
        if (index == undefined) {
            this.keywordNodes.map((keywordNode) => {
                if (keywordNode) keywordNode.active = false;
            });
        } else {
            this.keywordNodes[index] && (this.keywordNodes[index].active = false);
        }
    },

    /**
     * 隐藏当前关键字
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    _hideCur() {
        this.keywordNodes[this._curIndex] && (this.keywordNodes[this._curIndex].active = false);
    },

    onDestroy() {
        this._super();
    }
});