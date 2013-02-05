chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('ui.html', {
    'width': 400,
    'height': 500
  });
});

$(document).ready(function() {
	for(var i = 0; i < 1; i++) {
		$(document.body).append(create_video_tile());
	}
	get_live_videos();
});