//=============================================================================
// ElemSkillSeal.js
//=============================================================================

/*:ja
 * @plugindesc ver1.01 スキル属性による封印のステート。
 * @author まっつＵＰ
 *
 * @help
 * 
 * RPGで笑顔を・・・
 * 
 * このヘルプとパラメータの説明をよくお読みになってからお使いください。
 * 
 * バトラーの特定の属性のスキルを封印できるステートをつくります。
 * この属性とは、スキルの「ダメージ」に設定された属性を言います。
 * ただし、バトラーが通常攻撃として扱うスキルは封印できません。
 * 
 * YEP_ElementCore.jsを同時に導入する場合
 * YEP_ElementCore.jsよりも下で導入してください。
 * 
 * ステートのノートタグ
 * xは数値
 * <ElemSealx>
 * このステートが付加されているバトラーは
 * IDxの属性のスキルを封印されます。
 * 
 * 例:<ElemSeal2>
 * 属性2が使えません。
 * 
 * このプラグインを利用する場合は
 * readmeなどに「まっつＵＰ」の名を入れてください。
 * また、素材のみの販売はダメです。
 * 上記以外の規約等はございません。
 * もちろんツクールMVで使用する前提です。
 * 何か不具合ありましたら気軽にどうぞ。
 * 
 * ver1.01 YEP_ElementCore.jsの機能<Multiple Elements: x>に対応
 *  
 * 免責事項：
 * このプラグインを利用したことによるいかなる損害も制作者は一切の責任を負いません。
 * 
 */

var Imported = Imported || {};
Imported.ElemSkillSeal = true;

(function() {

//var parameters = PluginManager.parameters('ElemSkillSeal');

var _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
    return this.meetsElemSeal(skill) && _Game_BattlerBase_meetsSkillConditions.call(this, skill);
};

Game_BattlerBase.prototype.meetsElemSeal = function(skill) {
    return skill.id === this.attackSkillId() || !this.isElemSealstate(skill.damage.elementId);
};

if(Imported.YEP_ElementCore){
    var _Game_BattlerBase_meetsElemSeal = Game_BattlerBase.prototype.meetsElemSeal;
    Game_BattlerBase.prototype.meetsElemSeal = function(skill) {
    return !this.isYEPElemESS(skill.multipleElements) && _Game_BattlerBase_meetsElemSeal.call(this, skill);
    };
}

Game_BattlerBase.prototype.isElemSealstate = function(elem) {
    if(elem <= 0 || this.states().length <= 0) return false;
    var text = '<ElemSeal' + elem + '>';
    text = new RegExp(text);
    return this.states().some(function(state){
        return state.note.match(text);
    });
};

Game_BattlerBase.prototype.isYEPElemESS = function(elem) {
    if(this.states().length <= 0) return false;
    var isseal = false;
    for(var i = 0; i < elem.length; i++){
        if(isseal) break;
        if(elem[i] <= 0) continue;
        var text = '<ElemSeal' + elem[i] + '>';
        text = new RegExp(text);
        isseal = this.states().some(function(state){
            return state.note.match(text);
        });
    }
    return isseal;
};

})();
