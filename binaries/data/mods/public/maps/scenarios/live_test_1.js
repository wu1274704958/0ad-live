
const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);

const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);

cmpRangeManager.SetLosRevealAll(-1, true);

var settings = MapScriptSettings;

TriggerHelper.Dbg(Engine.SetCameraData ); 


if(settings && settings.Camera)
{
	warn("Setting CameraData: pos=(" + settings.Camera.pos.x + ", " + settings.Camera.pos.y + ", " + settings.Camera.pos.z + ") rot=(" + settings.Camera.rot.x + ", " + settings.Camera.rot.y + ") zoom=" + settings.Camera.zoom);
	Engine.SetCameraData(settings.Camera.pos.x, settings.Camera.pos.y, settings.Camera.pos.z,
	 			settings.Camera.rot.x, settings.Camera.rot.y, settings.Camera.zoom);
}
else
{
	warn("No Camera data found in ScriptSettings. settings=" + uneval(settings));
}


