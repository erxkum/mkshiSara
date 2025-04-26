/*:
 * @plugindesc スキルの成功率の計算式を分かりやすい式に変更
 * @author hiz
 * 
 * @param ignore chara hit
 * @desc 0:キャラの命中率を使用 1:キャラの命中率を無視
 * @default 0
 * 
 * @help
 * スキルの成功率の計算式を、分かりやすい式に変更します。
 * 
 * 　標準：スキルの命中率 × キャラの命中率 × 対象の回避率
 * 変更後：スキルの命中率 +(キャラの命中率 - 100%)- 対象の回避率
 * 
 * ※ ignore chara hit = 1 の場合、スキルの命中率 - 対象の回避率
 * 
 * 標準では命中判定と回避判定が別々に行われるため、
 * 命中率・回避率から想像する成功率よりも実際の成功率は低くなりがちです。
 * 
 * このプラグインを導入すると成功率が単純に命中率 - 回避率になるので、
 * 成功率が計算しやすくなるはずです。
 * 
 */

(function() {
    
    var parameters     = PluginManager.parameters('HzHitCalc');
    var ignoreCharaHit = Number(parameters['ignore chara hit']) == 1 ? true : false;
    
    Game_Action.prototype.itemHit = function(target) {
        if (this.isPhysical()) {
            var charaHit = ignoreCharaHit ? 0 : this.subject().hit - 1.0;
            return (this.item().successRate * 0.01 + charaHit - target.eva);
        } else {
            return (this.item().successRate * 0.01 - target.mev);
        }
    };
    
    Game_Action.prototype.itemEva = function(target) {
        return 0;
    };
})();