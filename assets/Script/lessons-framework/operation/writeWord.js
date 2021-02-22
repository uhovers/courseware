let TouchUtil = require('./../util/TouchUtil');
let EnumCfg = require('./../config/EnumCfg');
let NoticeCenter = require('./../core/NoticeCenter');
let WidgetBase = require('./../basement/WidgetBase');
cc.Class({
    extends: WidgetBase,
    properties: {
        rightCharacter: [cc.Node],
        characterList: [cc.Node],
        moveNode: cc.Node,
        GraphicsNode: [cc.Node],
        pencil: cc.Node,
        _step : 0,  
    },

    onLoad() {
        this._super();
        this.Graphics = {};
        this.GraphicsNode.map((node, index) =>{
            if(node) this.Graphics[index] = node.getComponent(cc.Graphics);
        })
        this._prePos = null;

        this.restart();
        TouchUtil.addMoveNode(this.moveNode, (event)=>{//start
            this._prePos = event.getLocation();
        }, (event)=>{//move
            if(this.checkPosition(event.getLocation()) == 2){
                this.restart();
            }else{
                if(this._step >= this.characterList.length){
                    return;
                }
                let _position = this.characterList[this._step].children[i].parent.convertToNodeSpaceAR(event.getLocation())
                if(this.pencil) this.pencil.position = _position;

                this._prePos = this.GraphicsNode[this._step].convertToNodeSpace(this._prePos);
                this.Graphics[this._step].moveTo(this._prePos.x, this._prePos.y);
                let pos = this.GraphicsNode[this._step].convertToNodeSpace(event.getLocation());
                this.Graphics[this._step].lineTo(pos.x, pos.y);
                this.Graphics[this._step].stroke();
            }
            this._prePos = event.getLocation();

        }, (event)=>{//end
            if(this.checkCharacter()){
            }else{
                if(this.checkPosition(event.getLocation()) == 2 || this.checkPosition(event.getLocation()) == -1 ){
                    this.restart();
                } 
            }
        }, (event)=>{//cancle
            this.checkCharacter(); 
            this.restart();
        })
    },

    start() {

    },
    playAgain(){
        this._step = 0;
        for(let i = 0;  i< this.Graphics.length; i++){
            this.Graphics[i].clear();
        }
        this.rightCharacter[this._step].active = true;
        this.rightCharacter.map((node)=>{
            if(node) node.active = false;
        })
        this.restart();
    },
    restart(){
        if(this._step >= this.characterList.length) return;
        this.Graphics[this._step].clear();
        if(this.pencil) {
            this.pencil.active = true;
            this.pencil.position = this.characterList[this._step].children[0].position;
        }
        this._records = {};
        this.characterList.forEach((character, index) =>{
            this._records[index] = [];
            character.children.forEach((node, _index) =>{
                this._records[index][_index] = false;
            })
        })
    },
    checkPosition(position){
        if(this._step >= this.characterList.length) return 1;
        let _position = this.characterList[this._step].children[i].parent.convertToNodeSpaceAR(position)
        for(let i = 0 ; i < this.characterList[this._step].children.length; i ++){
            let rect = this.characterList[this._step].children[i].getBoundingBox();
            if(rect.contains(_position)){
                for(let j = i -1; j >= 0; j --){
                    if(!this._records[this._step][j]){
                        return 2;
                    }
                }
                this._records[this._step][i] = true;
                return 1;
            }
        }
        return -1;
    },
    checkCharacter(){
        if(this._step >= this.characterList.length){
            return true;  
        } 
        for(let j = this.characterList[this._step].children.length -1; j >= 0; j --){
            if(!this._records[this._step][j]){
                return false;
            }
        }
        this.Graphics[this._step].clear();
        this.rightCharacter[this._step].active = true;
        let progressVal = ++this._step/this.characterList.length * 100;
        NoticeCenter.dispatchEvent(EnumCfg.EEventName.CONTEXT_UPDATE_PROGRESS, progressVal)
        if(this._step >= this.characterList.length){
            if(this.pencil) this.pencil.active = false;
        }else{
            if(this.pencil) this.pencil.position = this.characterList[this._step].children[0].position;
        } 
        return true;
    },
});