module.exports =  function ($interval, CONFIG, reactTo, playerState, $timeout) {
		'use strict';

		var player;
		// 2. This code loads the IFrame Player API code asynchronously.
		var tag = document.createElement('script');

		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		var timeupdater;
		return {
			restrict: 'A',
			template: require('./detailViewYoutubeTemplate.html'),
			link: function (scope, element, attrs) {
				var react = reactTo(scope);
				var updateTime = function () {
					if (typeof player === 'undefined' || player === null) {
						return;
					}

					if (player && player.getCurrentTime) {
						var actTime = player.getCurrentTime();
						scope.info.actTime = actTime;
						scope.info.percentage = Math.round(actTime / scope.info.duration * 100);

						if (!scope.$$phase) {
							scope.$apply();
						}
					}
				};

				var onStateChange = function (event) {
					if (typeof player === 'undefined' || player === null || scope.info.isYoutube === false) {
						return;
					}
					if (player.getPlayerState() === YT.PlayerState.PLAYING) {
						scope.info.duration = player.getDuration();
						scope.info.isPlaying = true;
						if (!scope.$$phase) {
							scope.$apply();
						}
						timeupdater = $interval(updateTime, 500);
					} else {
						scope.info.isPlaying = false;
						if (!scope.$$phase) {
							scope.$apply();
						}
						$interval.cancel(timeupdater);
					}
				};

				var stop = function () {
					if (typeof player === 'undefined' || player === null) {
						return;
					}
					player.pauseVideo();
				};

				var vidplay = function () {
					if (typeof player === 'undefined' || player === null) {
						return;
					}
					if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
						player.playVideo();
					} else {
						player.pauseVideo();
					}
				};

				var skip = function (value) {
					if (typeof player === 'undefined' || player === null) {
						return;
					}
					player.pauseVideo();
					$interval.cancel(timeupdater);

					var time = player.getCurrentTime();
					var newTime = time + value;
					if (newTime < 0) {
						newTime = 0;
					} else if (newTime > scope.info.duration) {
						newTime = scope.info.duration;
						player.seekTo(newTime, true);
						scope.info.actTime = newTime;
						scope.info.percentage = 100;
						if (!scope.$$phase) {
							scope.$apply();
						}
					} else {
						player.seekTo(newTime, true);
						player.playVideo();
					}
				};

				var loadPlayerAndVideo = function () {
					if (typeof player === 'undefined' || player === null) {
						player = new YT.Player('player', {
							height: '1080',
							width: '1920',
							playerVars: {'autoplay': 1, 'controls': 0, 'showinfo': 0},
							videoId: scope.data.feed.entries[scope.currentIndex].videourl,
							events: {
								'onStateChange': onStateChange
							}
						});
					}
                    if (player.getVideoUrl && player.getVideoUrl().indexOf(scope.data.feed.entries[scope.currentIndex].videourl) === -1) {
                        player.loadVideoById(scope.data.feed.entries[scope.currentIndex].videourl, 0, CONFIG.youtube.SUGGESTED_QUALITY);
                    } else if (player.getPlayerState && player.getPlayerState() !== YT.PlayerState.PLAYING) {
                        player.playVideo();
                    }

				};

				react(playerState, 'togglePlay', function () {
					vidplay();
				});
				react(playerState, 'toggleRewind', function () {
					skip(CONFIG.video.FAST_REWIND);
				});
				react(playerState, 'toggleForward', function () {
					skip(CONFIG.video.FAST_FORWARD);
				});
				//TODO: implement when right pressed and preview of all videos shown to stop video and when the preview is left to play video
				//react(stateLevelService, 'level', function (n) {
				//	if (typeof player === 'undefined' || player === null) {
				//		return;
				//	}
				//	if (n === STATE_CONST.level.PREVIEW_VIEW) {
				//		if (player.getPlayerState() === YT.PlayerState.PLAYING) {
				//			player.pauseVideo();
				//		}
				//	} else if (n === STATE_CONST.level.APP_FEED_VIEW) {
				//		if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
				//			player.playVideo();
				//		}
				//	}
				//});

                //TODO: remove this timeout
                $timeout(function(){
                    if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined'){
                        loadPlayerAndVideo();
                    }
                })
                

				scope.$watch('currentIndex', function (n, o) {
					if (typeof YT === 'undefined' || typeof YT.Player === 'undefined' || typeof n === 'undefined') {
						return;
					}
					loadPlayerAndVideo();
				});
                // has to come as message from tv frontend
                //react(overlayState, 'overlayOpened', function (n, o) {
					//if (n && typeof(n) !== 'undefined' && player) {
					//	stop();
					//}
					//else if (!n && typeof(n) !== 'undefined' && player) {
					//	if (stateLevelService.level === STATE_CONST.level.APP_FEED_VIEW) {
					//		if (typeof player === 'undefined' || player === null) {
					//			angular.noop();
					//		}
					//		if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
					//			vidplay();
					//		}
					//	}
					//}
                //});
				scope.$on('$destroy', function () {
					player = null;
				});
			}
		};
	};
