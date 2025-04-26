#==============================================================================
# ★ セーブ、ロード時コモンイベント ver1.0 by USK
#------------------------------------------------------------------------------
# ・セーブ、ロード前後にコモンイベントを起動します
# ・変数、スイッチの制御、メッセージ表示を想定しています
# ・スイッチ、選択肢を用いてセーブ、ロード時の確認のコモンも作れます
#==============================================================================
=begin
・SaveCommonId1にセーブ前に実行されるコモンイベントのIDを設定してください。
  使わないときは0を設定してください。
  
・SaveCommonId2にセーブ後に実行されるコモンイベントのIDを設定してください。
  使わないときは0を設定してください。
  
・LoadCommonId1にロード前に実行されるコモンイベントのIDを設定してください。
  このときメッセージの表示とCancelSwitchIdで設定したスイッチのオンオフ以外
  はあまり意味がありません。使わないときは0を設定してください。
  
・LoadCommonId2にロード後に実行されるコモンイベントのIDを設定してください。
  使わないときは0を設定してください。

・CancelSwitchIdで設定したIDのスイッチがオンの時セーブ、ロードがキャンセル
　されます。セーブ、ロード前に設定しなければ効果がありません。スイッチのオン
　オフ管理に注意してください。使わないときは0を設定してください。

=end
SaveCommonId1  = 2 #セーブ前コモンイベントID
SaveCommonId2  = 3 #セーブ後コモンイベントID
LoadCommonId1  = 2 #ロード前コモンイベントID
LoadCommonId2  = 3 #ロード後コモンイベントID
CancelSwitchId = 1 #キャンセルスイッチID

#==============================================================================
# ■ Scene_File
#==============================================================================

class Scene_File
  #--------------------------------------------------------------------------
  # ● 開始後処理
  #--------------------------------------------------------------------------
  alias :usk_slc_post_start :post_start
  def post_start
    @interpreter    = Game_Interpreter.new
    @message_window = Window_Message.new
    usk_slc_post_start
  end
end

#==============================================================================
# ■ Scene_Save
#==============================================================================

class Scene_Save
  #--------------------------------------------------------------------------
  # ● 
  #--------------------------------------------------------------------------
  def phase_common_event1
    $game_temp.reserve_common_event(SaveCommonId1)
    @interpreter.setup_reserved_common_event
    while @interpreter.running?
      @interpreter.update
      update_basic
    end
    update_basic until @message_window.close?
    return $game_switches[CancelSwitchId]
  end
  #--------------------------------------------------------------------------
  # ● セーブファイル［決定］
  #--------------------------------------------------------------------------
  alias :usk_slc_on_savefile_ok :on_savefile_ok
  def on_savefile_ok
    return if phase_common_event1
    usk_slc_on_savefile_ok
    phase_common_event2
  end
  #--------------------------------------------------------------------------
  # ● 
  #--------------------------------------------------------------------------
  def phase_common_event2
    $game_temp.reserve_common_event(SaveCommonId2)
    @interpreter.setup_reserved_common_event
    while @interpreter.running?
      @interpreter.update
      update_basic
    end
    update_basic until @message_window.close?
  end
end

#==============================================================================
# ■ Scene_Load
#==============================================================================

class Scene_Load
  #--------------------------------------------------------------------------
  # ● 
  #--------------------------------------------------------------------------
  def phase_common_event1
    $game_temp.reserve_common_event(LoadCommonId1)
    @interpreter.setup_reserved_common_event
    while @interpreter.running?
      @interpreter.update
      update_basic
    end
    update_basic until @message_window.close?
    return $game_switches[CancelSwitchId]
  end
  #--------------------------------------------------------------------------
  # ● セーブファイル［決定］
  #--------------------------------------------------------------------------
  alias :usk_slc_on_savefile_ok :on_savefile_ok
  def on_savefile_ok
    return if phase_common_event1
    usk_slc_on_savefile_ok
  end
  #--------------------------------------------------------------------------
  # ● 
  #--------------------------------------------------------------------------
  def phase_common_event3
    $game_temp.reserve_common_event(LoadCommonId2)
    @interpreter.setup_reserved_common_event
    while @interpreter.running?
      @interpreter.update
      update_basic
    end
    update_basic until @message_window.close?
  end
  #--------------------------------------------------------------------------
  # ● ロード成功時の処理
  #--------------------------------------------------------------------------
  alias :usk_slc_on_load_success :on_load_success
  def on_load_success
    phase_common_event3
    usk_slc_on_load_success
  end
end