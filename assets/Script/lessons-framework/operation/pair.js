// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


//  lv1-14    2
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
} = require('./../importer');
cc.Class({
    extends: WidgetBase,

    properties: {
        SelectBtn: [cc.Node],
        Pair: [cc.String],  //对应分组   |
        _hasSelect: [cc.Integer],//选中的
        _rightCount: 0,//正确数
        m_touch_enable: true,
        _right: [cc.Integer],
    },
    _touch_enable(value) {
        this.m_touch_enable = value || false;
    },
    events() {
        return {
            [EnumCfg.EEventName.PAIR_TOUCH_ENABLE]: this._touch_enable,
        }
    },
    start() {
        let _pair = []
        this.Pair.forEach((element, index) => {
            if (element) {
                _pair[index] = (element.split("|"));
                _pair[index] = _pair[index].map((element) => {
                    return parseInt(element);
                })
            }
        })
        cc.log(_pair);
        this.SelectBtn.forEach((element, index) => {
            TouchUtil.addClickBtn(element, () => {
                if (!this.m_touch_enable) {
                    return;
                }
                NoticeCenter.dispatchEvent(EnumCfg.EEventName.AUDIO_CONTROLLER_PLAY_AUDIO_BY_TYPE, EnumCfg.EAudioType.CLICK);
                if (this._hasSelect.indexOf(index) !== -1) {
                } else if (this._hasSelect.length === 0) {
                    this._hasSelect.push(index);
                } else {
                    let _selectPair = [];//选中 队列
                    this._hasSelect.push(index);
                    for (let i = 0, length = _pair.length; i < length; ++i) {
                        let __pair = _pair[i];
                        let isPair = true;
                        for (let i = 0, length = this._hasSelect.length; i < length; ++i) {
                            if (__pair.indexOf(this._hasSelect[i]) === -1) {
                                isPair = false;
                                break;
                            }

                        }
                        if (isPair === true) {
                            _selectPair.push(i);
                        }
                    }
                    if (_selectPair.length === 0) {
                        this._hasSelect = [];
                        this._hasSelect.push(index);
                    } else {
                        for (let i = 0, length = _selectPair.length; i < length; ++i) {
                            if (_pair[_selectPair[i]].length <= this._hasSelect.length) {
                                let selectNode = [];
                                this._hasSelect.forEach((element) => {
                                    selectNode.push(this.SelectBtn[element])
                                })
                                this.notice(EnumCfg.EEventName.ON_PAIR_SELET, this._hasSelect, selectNode);
                                this.notice(EnumCfg.EEventName.ON_PAIR_SELET_RIGHT_INDEX, _selectPair[i], this._hasSelect, selectNode);
                                if (this._right.indexOf(_selectPair[i]) === -1) {
                                    ++this._rightCount;
                                    this._right.push(_selectPair[i]);
                                    NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, this._rightCount / _pair.length * 100);
                                }
                                this._hasSelect = [];
                            }
                        }
                    }
                }
                let selectNode = [];
                this._hasSelect.forEach((element) => {
                    selectNode.push(this.SelectBtn[element])
                })
                this.notice(EnumCfg.EEventName.ON_PAIR_SELET, this._hasSelect, selectNode);
                return true;
            })
        })
    },
});
