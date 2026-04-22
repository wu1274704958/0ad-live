

function init(data)
{
	Engine.GetGUIObjectByName("Print Camera").onPress = () => {
		var pos = Engine.GetCameraPosition();
		var rot = Engine.GetCameraRotation();
		var zoom = Engine.GetCameraZoom();
		warn("CameraData: pos=(" + pos.x + ", " + pos.y + ", " + pos.z + ") rot=(" + rot.x + ", " + rot.y + ") zoom=" + zoom);
	};

	Engine.GetGUIObjectByName("team2SpawnButton").onPress = () => {
		// TODO: Team2 Spawn logic
	};
	return new Promise(closePageCallback => {
		Engine.GetGUIObjectByName("closeButton").onPress = () => {
            closePageCallback(null);
        };
	});
}
