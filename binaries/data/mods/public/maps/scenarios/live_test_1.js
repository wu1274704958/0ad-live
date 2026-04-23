
class LiveModeTrigger
{	
	Init()
	{
		const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);

		const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);

		cmpRangeManager.SetLosRevealAll(-1, true);

		var settings = MapScriptSettings;

		TriggerHelper.Dbg(Engine.SetCameraData);

		if (settings && settings.Camera)
		{
			log("Setting CameraData: pos=(" + settings.Camera.pos.x + ", " + settings.Camera.pos.y + ", " + settings.Camera.pos.z + ") rot=(" + settings.Camera.rot.x + ", " + settings.Camera.rot.y + ") zoom=" + settings.Camera.zoom);
			Engine.SetCameraData(settings.Camera.pos.x, settings.Camera.pos.y, settings.Camera.pos.z,
						settings.Camera.rot.x, settings.Camera.rot.y, settings.Camera.zoom);
		}
		else
		{
			warn("No Camera data found in ScriptSettings. settings=" + uneval(settings));
		}
	}

	DefaultArmy()
	{
		return "aaa";
	}

	SpawnSquad(cmd, data) {
		const playerID = cmd.playerID || 1;
		const squadData = cmd.squadData || [
			{
				army: this.DefaultArmy(),
				count: 1
			}
		];
		//check squadData is array
		if (!Array.isArray(squadData)) {
			warn("squadData is not an array. squadData=" + uneval(squadData));
			return;
		}
		for (const squad of squadData) {
			{
				const army = squad.army || this.DefaultArmy();
				const count = squad.count || 1;
				warn("Spawning squad for player " + playerID + ": army=" + army + " count=" + count);
			}
		}
	}
}

var g_LiveModeTrigger = new LiveModeTrigger();
g_LiveModeTrigger.Init();

Engine.RegisterGlobal("LiveModeTrigger", g_LiveModeTrigger);


