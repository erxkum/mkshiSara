//=============================================================================
// 素手禁止 / NoWeaponDisabled.js
//=============================================================================

/*:ja
 * v0.5.0
 * @plugindesc 装備画面で武器の装備無しを禁止する
 * @author Declare War
 *
 * @help このプラグインには、プラグインコマンドはありません。
 */

/*:en
 * @plugindesc Disable no weapon in equip screen.  
 * @author Declare War
 *
 * @help This plugin does not provide plugin commands.
 */
 
(function(){
	// Game_Actor
	// clearEquipments #a
	var _Game_Actor_clearEquipments = Game_Actor.prototype.clearEquipments;
	Game_Actor.prototype.clearEquipments = function(){
		if (SceneManager._scene.constructor === Scene_Equip){
			this.noWeaponDisabledClearEquipments();
		}else{
			_Game_Actor_clearEquipments.call(this);
		}
	};
	// noWeaponDisabledClearEquipments #n
	Game_Actor.prototype.noWeaponDisabledClearEquipments = function() {
		var maxSlots = this.equipSlots().length;
		for (var i = 0; i < maxSlots; i++) {
			if (this.isEquipChangeOk(i) && this.equipSlots()[i] !== 1) {
				this.changeEquip(i, null);
			}
		}
    };
	// Scene_Equip
	// onItemOk #a
	var _Scene_Equip_onItemOk = Scene_Equip.prototype.onItemOk;
	Scene_Equip.prototype.onItemOk = function() {
		if (this.actor().equipSlots()[this._slotWindow.index()] === 1 &&
		!this._itemWindow.item()){
			this.noWeaponDisabledOnItemOk();
		}else{
			_Scene_Equip_onItemOk.call(this);
		}
	};
	// noWeaponDisabledOnItemOk #n
	Scene_Equip.prototype.noWeaponDisabledOnItemOk = function() {
		SoundManager.playBuzzer();
		this._itemWindow.activate();
    };
})();