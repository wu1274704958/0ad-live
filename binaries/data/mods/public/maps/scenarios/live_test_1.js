
class PlayerData
{
	constructor(playerID, defaultArmy, baseFortress, civ, homePos)
	{
		this.playerID = playerID;
		this.defaultArmy = defaultArmy;
		this.baseFortress = baseFortress;
		this.civ = civ;
		this.homePos = homePos;
	}
}

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

		this.InitAllPlayerData(cmpPlayerManager);
	}

	InitAllPlayerData(cmpPlayerManager)
	{
		this.playerData = {};
		const numPlayers = TriggerHelper.GetNumberOfPlayers(); // includes gaia (0), real players start at 1
		for (let pid = 1; pid < numPlayers; ++pid)
		{
			const playerEt = cmpPlayerManager.GetPlayerByID(pid);
			if (!playerEt)
			{
				error("InitAllPlayerData: GetPlayerByID returned invalid entity for pid=" + pid);
				continue;
			}

			const cmpIdentity = Engine.QueryInterface(playerEt, IID_Identity);
			if (!cmpIdentity)
			{
				error("InitAllPlayerData: QueryInterface(IID_Identity) failed for pid=" + pid);
				continue;
			}
			const civ = cmpIdentity.GetCiv();
			if (!civ)
			{
				error("InitAllPlayerData: GetCiv() returned invalid value for pid=" + pid);
				continue;
			}

			const defaultArmy = TriggerHelper.GetTemplateNamesByClasses(
				"Sword Infantry", civ, undefined, "Basic", true)[0];
			if (!defaultArmy)
				error("InitAllPlayerData: no Sword Infantry Basic template found for pid=" + pid + " civ=" + civ);

			const baseFortress = TriggerHelper.GetPlayerEntitiesByClass(pid, "Fortress")[0];
			if (!baseFortress)
				error("InitAllPlayerData: no Fortress entity found for pid=" + pid + " civ=" + civ);

			let homePos;
			if (baseFortress)
			{
				const cmpPosition = Engine.QueryInterface(baseFortress, IID_Position);
				if (cmpPosition)
					homePos = cmpPosition.GetPosition();
				else
					error("InitAllPlayerData: QueryInterface(IID_Position) failed for fortress of pid=" + pid);
			}

			this.playerData[pid] = new PlayerData(pid, defaultArmy, baseFortress, civ, homePos);
			log("PlayerData initialized for player " + pid + " civ=" + civ + " army=" + defaultArmy + " homePos=" + uneval(homePos));
		}
	}

	IsFortressAlive(entity)
	{
		const cmpHealth = Engine.QueryInterface(entity, IID_Health);
		return cmpHealth && cmpHealth.GetHitpoints() > 0;
	}

	GetAutoTarget(playerID)
	{
		for (const pid in this.playerData)
		{
			if (+pid === playerID)
				continue;
			const pd = this.playerData[pid];
			if (pd.baseFortress && this.IsFortressAlive(pd.baseFortress))
				return +pid;
		}
		warn("GetAutoTarget: no opponent with a living fortress found for playerID=" + playerID);
		return undefined;
	}

	SpawnSquad(cmd)
	{
		const playerID = cmd.playerID || 1;
		const pd = this.playerData[playerID];
		if (!pd)
		{
			warn("No PlayerData for playerID " + playerID);
			return;
		}

		if (!pd.baseFortress)
		{
			warn("No fortress found for player " + playerID + ", cannot spawn squad");
			return;
		}

		const targetPlayerID = cmd.target !== undefined ? cmd.target : this.GetAutoTarget(playerID);

		if(targetPlayerID === undefined)
		{
			warn("SpawnSquad: no valid target found for playerID=" + playerID);
			return;
		}

		log("SpawnSquad: playerID=" + playerID + " targetPlayerID=" + targetPlayerID);

		const squadData = cmd.squadData || [{ army: pd.defaultArmy, count: 100 }];

		if (!Array.isArray(squadData))
		{
			warn("squadData is not an array. squadData=" + uneval(squadData));
			return;
		}

		var allEntity = [];
		for (const squad of squadData)
		{
			const army = squad.army || pd.defaultArmy;
			const count = squad.count || 1;
			warn("Spawning squad for player " + playerID + " (civ=" + pd.civ + "): army=" + army + " count=" + count);
			allEntity = allEntity.concat(TriggerHelper.SpawnUnits(pd.baseFortress, army, count, playerID));
		}

		const targetPd = this.playerData[targetPlayerID];
		if (targetPd && targetPd.homePos)
		{
			const tx = targetPd.homePos.x;
			const tz = targetPd.homePos.z;
			log("SpawnSquad: issuing WalkAndFight to target homePos (" + tx + ", " + tz + ") for " + allEntity.length + " entities");
			for (const ent of allEntity)
			{
				const cmpUnitAI = Engine.QueryInterface(ent, IID_UnitAI);
				if (cmpUnitAI)
					cmpUnitAI.WalkAndFight(tx, tz, null, true, false, false);
			}
		}
		else
			warn("SpawnSquad: target playerID=" + targetPlayerID + " has no valid homePos, skipping attack-move");
	}
}

var g_LiveModeTrigger = new LiveModeTrigger();
g_LiveModeTrigger.Init();

Engine.RegisterGlobal("LiveModeTrigger", g_LiveModeTrigger);


