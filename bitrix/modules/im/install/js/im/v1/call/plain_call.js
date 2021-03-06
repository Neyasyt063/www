;(function()
{
	/**
	 * Implements Call interface
	 * Public methods:
	 * - inviteUsers
	 * - cancel
	 * - answer
	 * - decline
	 * - hangup
	 * - setMuted
	 * - setVideoEnabled
	 * - setCameraId
	 * - setMicrophoneId
	 *
	 * Events:
	 * - onCallStateChanged //not sure about this.
	 * - onUserStateChanged
	 * - onUserVoiceStarted
	 * - onUserVoiceStopped
	 * - onLocalMediaReceived
	 * - onLocalMediaStopped
	 * - onLocalMediaError
	 * - onStreamReceived
	 * - onStreamRemoved
	 * - onDeviceListUpdated
	 * - onDestroy
	 */

	BX.namespace('BX.Call');

	var ajaxActions = {
		invite: 'im.call.invite',
		cancel: 'im.call.cancel',
		answer: 'im.call.answer',
		decline: 'im.call.decline',
		hangup: 'im.call.hangup',
		ping: 'im.call.ping',
		negotiationNeeded: 'im.call.negotiationNeeded',
		connectionOffer: 'im.call.connectionOffer',
		connectionAnswer: 'im.call.connectionAnswer',
		iceCandidate: 'im.call.iceCandidate'
	};

	var pullEvents = {
		ping: 'Call::ping',
		negotiationNeeded: 'Call::negotiationNeeded',
		connectionOffer: 'Call::connectionOffer',
		connectionAnswer: 'Call::connectionAnswer',
		iceCandidate: 'Call::iceCandidate',
		voiceStarted: 'Call::voiceStarted',
		voiceStopped: 'Call::voiceStopped'
	};

	var defaultConnectionOptions = {
		offerToReceiveVideo: true,
		offerToReceiveAudio: true
	};

	var signalingConnectionRefreshPeriod = 30000;
	var pingPeriod = 25000;

	BX.Call.PlainCall = function(params)
	{
		this.superclass.constructor.apply(this, arguments);

		this.state = params.state || '';

		this.peers = this.initPeers(this.users);
		this.voiceDetection = null;

		this.signaling = new BX.Call.PlainCall.Signaling({
			call: this
		});

		this.deviceList = [];

		this.turnServer = (BX.browser.IsFirefox() ? BX.message('turn_server_firefox') : BX.message('turn_server')) || 'turn.calls.bitrix24.com';
		this.turnServerLogin = BX.message('turn_server_login') || 'bitrix';
		this.turnServerPassword = BX.message('turn_server_password') || 'bitrix';

		this.ping();
		this.pingInterval = setInterval(this.ping.bind(this), pingPeriod);

		this._onUnloadHandler = this._onUnload.bind(this);

		this.enableMicAutoParameters = params.enableMicAutoParameters !== false;

		window.addEventListener("unload", this._onUnloadHandler);
	};

	BX.extend(BX.Call.PlainCall, BX.Call.AbstractCall);

	BX.Call.PlainCall.prototype.initPeers = function(userIds)
	{
		var peers = {};
		for(var i = 0; i < userIds.length; i++)
		{
			var userId = userIds[i];
			if(userId == this.userId)
				continue;

			peers[userId] = this.createPeer(userId);
		}
		return peers;
	};

	BX.Call.PlainCall.prototype.createPeer = function(userId)
	{
		var self = this;
		return new BX.Call.PlainCall.Peer({
			call: this,
			userId: userId,
			ready: userId == this.initiatorId,
			signalingConnected: userId == this.initiatorId,

			onStreamReceived: function(e)
			{
				//this.log("onStreamReceived: ", e);
				self.runCallback(BX.Call.Event.onStreamReceived, e);
			},
			onStreamRemoved: function(e)
			{
				//this.log("onStreamRemoved: ", e);
				self.runCallback(BX.Call.Event.onStreamRemoved, e);
			},
			onStateChanged: this.__onPeerStateChanged.bind(this),
			onRTCStatsReceived: this.__onPeerRTCStatsReceived.bind(this)
		});
	};

	/**
	 * Returns call participants and their states
	 * @return {object} userId => user state
	 */
	BX.Call.PlainCall.prototype.getUsers = function()
	{
		var result = {};
		for (var userId in this.peers)
		{
			result[userId] = this.peers[userId].calculatedState;
		}
		return result;
	};

	BX.Call.PlainCall.prototype.isReady = function()
	{
		return this.ready;
	};

	BX.Call.PlainCall.prototype.setVideoEnabled = function(videoEnabled)
	{
		videoEnabled = (videoEnabled === true);
		if(this.videoEnabled == videoEnabled)
		{
			return;
		}

		this.videoEnabled = videoEnabled;
		if(this.ready)
		{
			this.replaceLocalMediaStream();
		}
	};

	BX.Call.PlainCall.prototype.setMuted = function(muted)
	{
		muted = !!muted;
		if(this.muted == muted)
		{
			return;
		}

		this.muted = muted;
		if(this.localStreams["main"])
		{
			var audioTracks = this.localStreams["main"].getAudioTracks();
			if(audioTracks[0])
			{
				audioTracks[0].enabled = !this.muted;
			}
		}
	};

	BX.Call.PlainCall.prototype.setCameraId = function(cameraId)
	{
		if(this.cameraId == cameraId)
		{
			return;
		}

		this.cameraId = cameraId;
		if(this.ready && this.videoEnabled)
		{
			this.replaceLocalMediaStream();
		}
	};

	BX.Call.PlainCall.prototype.setMicrophoneId = function(microphoneId)
	{
		if(this.microphoneId == microphoneId)
		{
			return;
		}

		this.microphoneId = microphoneId;
		if(this.ready)
		{
			this.replaceLocalMediaStream();
		}
	};


	BX.Call.PlainCall.prototype.stopSendingStream = function(tag)
	{
		//todo: implement
	};

	/**
	 * Invites users to participate in the call.
	 *
	 * @param {Object} config
	 * @param {int[]} [config.users] Array of ids of the users to be invited.
	 * @param {MediaStream} [config.localStream] Prefetched local media stream (if has one).
	**/
	BX.Call.PlainCall.prototype.inviteUsers = function(config)
	{
		var self = this;
		if(!BX.type.isPlainObject(config))
		{
			config = {};
		}
		var users = BX.type.isArray(config.users) ? config.users : Object.keys(this.peers);
		this.ready = true;

		if(config.localStream instanceof MediaStream && !this.localStreams["main"])
		{
			this.localStreams["main"] = config.localStream;
		}

		this.getLocalMediaStream().then(function()
		{
			return self.signaling.inviteUsers({
				userIds: users,
				video: self.videoEnabled ? 'Y' : 'N'
			});

		}).then(function(response)
		{
			for (var i = 0; i < users.length; i++)
			{
				if(!self.peers[users[i]])
				{
					self.peers[users[i]] = self.createPeer(users[i]);

					self.runCallback(BX.Call.Event.onUserInvited, {
						userId: users[i]
					});
				}
				self.peers[users[i]].onInvited();
			}
		}).catch(function(e)
		{
			self.runCallback(BX.Call.Event.onCallFailure, e);
		});
	};

	BX.Call.PlainCall.prototype.getMediaConstraints = function()
	{
		var audio = {};
		var video = this.videoEnabled ? {} : false;

		var supportedConstraints = navigator.mediaDevices.getSupportedConstraints ? navigator.mediaDevices.getSupportedConstraints() : {};

		if(this.microphoneId)
		{
			audio.deviceId = {ideal: this.microphoneId};
		}

		if(!this.enableMicAutoParameters)
		{
			if(supportedConstraints.echoCancellation)
			{
				audio.echoCancellation = false;
			}
			if(supportedConstraints.noiseSuppression)
			{
				audio.noiseSuppression = false;
			}
			if(supportedConstraints.autoGainControl)
			{
				audio.autoGainControl = false;
			}
		}

		if(video)
		{
			video.aspectRatio = 1.7777777778;
			if(this.cameraId)
			{
				video.deviceId = {ideal: this.cameraId};
			}
		}

		return {audio: audio, video: video};
	};

	BX.Call.PlainCall.prototype.getLocalMediaStream = function(tag)
	{
		var self = this;
		if(!BX.type.isNotEmptyString(tag))
		{
			tag = 'main';
		}
		this.log("Requesting access to media devices");

		return new Promise(function(resolve, reject)
		{
			if(self.localStreams[tag])
			{
				return resolve(self.localStreams[tag]);
			}

			var constraints = self.getMediaConstraints();
			navigator.mediaDevices.getUserMedia(constraints).then(function(stream)
			{
				self.log("Local media stream received");
				self.localStreams[tag] = stream;
				self.runCallback(BX.Call.Event.onLocalMediaReceived, {
					tag: tag,
					stream: stream
				});
				if(tag === 'main')
				{
					self.attachVoiceDetection();
					if(self.muted)
					{
						var audioTracks = stream.getAudioTracks();
						if(audioTracks[0])
						{
							audioTracks[0].enabled = false;
						}
					}
				}
				if(self.deviceList.length === 0)
				{
					navigator.mediaDevices.enumerateDevices().then(function(deviceList)
					{
						self.deviceList = deviceList;
						self.runCallback(BX.Call.Event.onDeviceListUpdated, {
							deviceList: self.deviceList
						})
					});
				}

				resolve(self.localStreams[tag]);
			}).catch(function(e)
			{
				self.log("Could not get local media stream.", e);
				self.log("Request constraints: .", constraints);
				self.runCallback("onLocalMediaError", {
					tag: tag,
					error: e
				});
				reject(e);
			});
		})
	};

	BX.Call.PlainCall.prototype.startMediaCapture = function ()
	{
		return this.getLocalMediaStream();
	};

	BX.Call.PlainCall.prototype.attachVoiceDetection = function()
	{
		if(this.voiceDetection)
		{
			this.voiceDetection.destroy();
		}

		try
		{
			this.voiceDetection = new BX.SimpleVAD({
				mediaStream: this.localStreams['main'],
				onVoiceStarted: this.onLocalVoiceStarted.bind(this),
				onVoiceStopped: this.onLocalVoiceStopped.bind(this)
			})
		}
		catch (e)
		{
			this.log('Could not attach voice detection to media stream');
		}
	};

	BX.Call.PlainCall.prototype.startScreenSharing = function()
	{
		var self = this;
		if(this.localStreams["screen"])
		{
			return;
		}

		navigator.mediaDevices.getUserMedia({
			video: {
				mandatory: {
					chromeMediaSource : 'screen',
					maxWidth : 1920,
					maxHeight : 1080,
					maxFrameRate : 5
				}
			}
		}).then(function(stream)
		{
			self.localStreams["screen"] = stream;

			self.runCallback(BX.Call.Event.onLocalMediaReceived, {
				tag: 'screen',
				stream: stream
			});

			if(self.ready)
			{
				for(var userId in self.peers)
				{
					if(self.peers[userId].calculatedState === BX.Call.UserState.Connected)
					{
						self.peers[userId].sendMedia();
					}
				}
			}

		}).catch(function(e)
		{
			this.log(e);
		});
	};

	BX.Call.PlainCall.prototype.stopScreenSharing = function()
	{
		if(!this.localStreams["screen"])
		{
			return;
		}

		this.localStreams["screen"].getTracks().forEach(function(track)
		{
			track.stop();
		});
		this.localStreams["screen"] = null;
		this.runCallback(BX.Call.Event.onLocalMediaStopped, {
			tag: 'screen'
		});
		
		for(var userId in this.peers)
		{
			if(this.peers[userId].calculatedState === BX.Call.UserState.Connected)
			{
				this.peers[userId].sendMedia();
			}
		}
	};

	BX.Call.PlainCall.prototype.isScreenSharingStarted = function()
	{
		return this.localStreams["screen"] instanceof MediaStream;
	};

	BX.Call.PlainCall.prototype.onLocalVoiceStarted = function()
	{
		this.signaling.sendVoiceStarted({
			userId: this.users
		});
	};

	BX.Call.PlainCall.prototype.onLocalVoiceStopped = function()
	{
		this.signaling.sendVoiceStopped({
			userId: this.users
		});
	};

	/**
	 * @param {Object} config
	 * @param {bool} [config.useVideo]
	 * @param {bool} [config.enableMicAutoParameters]
	 * @param {MediaStream} [config.localStream]
	 */
	BX.Call.PlainCall.prototype.answer = function(config)
	{
		var self = this;
		if(!BX.type.isPlainObject(config))
		{
			config = {};
		}
		if(this.direction !== BX.Call.Direction.Incoming)
		{
			throw new Error('Only incoming call could be answered');
		}

		this.ready = true;
		this.videoEnabled = (config.useVideo == true);
		this.enableMicAutoParameters = (config.enableMicAutoParameters !== false);

		if(config.localStream instanceof MediaStream)
		{
			this.localStreams["main"] = config.localStream;
		}

		return new Promise(function(resolve, reject)
		{
			self.getLocalMediaStream().then(
				function()
				{
					return self.signaling.sendAnswer();
				},
				function(e)
				{
					self.runCallback(BX.Call.Event.onCallFailure, e);
				}
			).then(function()
			{
				resolve();
			});
		});
	};

	BX.Call.PlainCall.prototype.decline = function(code, reason)
	{
		this.ready = false;

		var data = {
			callId: this.id,
			callInstanceId: this.instanceId,
		};

		if(typeof(code) != 'undefined')
		{
			data.code = code;
		}
		if(typeof(reason) != 'undefined')
		{
			data.reason = reason;
		}

		BX.ajax.runAction(ajaxActions.decline, {
			data: data
		}).then(function()
		{
			this.destroy();
		}.bind(this));
	};

	BX.Call.PlainCall.prototype.hangup = function()
	{
		this.ready = false;
		var self = this;

		return new Promise(function (resolve, reject)
		{
			BX.ajax.runAction(ajaxActions.hangup, {
				data: {
					callId: self.id,
					callInstanceId: self.instanceId
				}
			}).then(function()
			{
				for (var userId in self.peers)
				{
					self.peers[userId].disconnect();
				}

				resolve();
			});
		});
	};

	BX.Call.PlainCall.prototype.ping = function()
	{
		this.signaling.sendPing({userId: this.users});
	};

	BX.Call.PlainCall.prototype.getState = function()
	{

	};

	BX.Call.PlainCall.prototype.replaceLocalMediaStream = function(tag)
	{
		var self = this;
		tag = tag || "main";

		if(this.localStreams[tag])
		{
			BX.webrtc.stopMediaStream(this.localStreams[tag]);
			this.localStreams[tag] = null;
		}

		this.getLocalMediaStream(tag).then(function()
		{
			if(self.ready)
			{
				for(var userId in self.peers)
				{
					if(self.peers[userId].isReady())
					{
						self.peers[userId].replaceMediaStream(tag);
					}
				}
			}
		}).catch(function(e)
		{
			console.error('Could not get access to hardware; don\'t really know what to do. error:', e);
		}.bind(this));
	};

	BX.Call.PlainCall.prototype.sendAllStreams = function(userId)
	{
		if(!this.peers[userId])
			return;

		if(!this.peers[userId].isReady())
			return;

		for (var tag in this.localStreams)
		{
			if(this.localStreams[tag])
			{
				this.peers[userId].sendMedia();
			}
		}
	};

	BX.Call.PlainCall.prototype.isAnyoneParticipating = function()
	{
		for (var userId in this.peers)
		{
			if(this.peers[userId].isParticipating())
			{
				return true;
			}
		}

		return false;
	};

	BX.Call.PlainCall.prototype.__onPullEvent = function(command, params, extra)
	{
		var handlers = {
			'Call::answer': this.__onPullEventAnswer.bind(this),
			'Call::hangup': this.__onPullEventHangup.bind(this),
			'Call::ping': this.__onPullEventPing.bind(this),
			'Call::negotiationNeeded': this.__onPullEventNegotiationNeeded.bind(this),
			'Call::connectionOffer': this.__onPullEventConnectionOffer.bind(this),
			'Call::connectionAnswer': this.__onPullEventConnectionAnswer.bind(this),
			'Call::iceCandidate': this.__onPullEventIceCandidate.bind(this),
			'Call::voiceStarted': this.__onPullEventVoiceStarted.bind(this),
			'Call::voiceStopped': this.__onPullEventVoiceStopped.bind(this),
			'Call::usersInvited': this.__onPullEventUsersInvited.bind(this),
			'Call::associatedEntityReplaced': this.__onPullEventAssociatedEntityReplaced.bind(this),
			'Call::finish': this.__onPullEventFinish.bind(this)
		};

		if(handlers[command])
		{
			this.log("Signaling: " + command + "; Parameters: " + JSON.stringify(params));
			handlers[command].call(this, params);
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventUsersInvited = function(params)
	{
		var users = params.users;

		// update userdata
		// update public id list

		for(var i = 0; i < users.length; i++)
		{
			var userId = users[i];
			if(this.peers[userId])
			{
				if(this.peers[userId].calculatedState === BX.Call.UserState.Failed || this.peers[userId].calculatedState === BX.Call.UserState.Idle)
				{
					this.peers[userId].onInvited();
				}
			}
			else
			{
				this.peers[userId] = this.createPeer(userId);
				this.runCallback(BX.Call.Event.onUserInvited, {
					userId: userId
				});

				this.peers[userId].onInvited();
			}
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventAnswer = function(params)
	{
		var senderId = params.senderId;

		if(senderId === this.userId)
		{
			return this.__onPullEventAnswerSelf(params);
		}

		if(!this.peers[senderId])
		{
			return;
		}

		this.peers[senderId].setSignalingConnected(true);
		this.peers[senderId].setReady(true);
		if(this.ready)
		{
			this.sendAllStreams(senderId);
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventAnswerSelf = function(params)
	{
		if(params.callInstanceId === this.instanceId)
			return;

		// call was answered elsewhere
		this.destroy();
	};

	BX.Call.PlainCall.prototype.__onPullEventHangup = function(params)
	{
		var senderId = params.senderId;

		if(this.userId == senderId)
		{
			if(this.instanceId != params.callInstanceId)
			{
				this.destroy();
			}
		}

		if(!this.peers[senderId])
			return;

		this.peers[senderId].disconnect(params.code);
		this.peers[senderId].setReady(false);

		if(params.code == 603)
		{
			this.peers[senderId].setDeclined(true);
		}

		if(!this.isAnyoneParticipating())
		{
			this.destroy();
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventPing = function(params)
	{
		var peer = this.peers[params.senderId];
		if(!peer)
			return;

		peer.setSignalingConnected(true);
	};

	BX.Call.PlainCall.prototype.__onPullEventNegotiationNeeded = function(params)
	{
		/** @var BX.Call.PlainCall.Peer */
		var peer = this.peers[params.senderId];
		if(!peer)
		{
			return;
		}

		peer.setReady(true);
		if(params.restart)
		{
			peer.reconnect()
		}
		else
		{
			peer.onNegotiationNeeded();
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventConnectionOffer = function(params)
	{
		var peer = this.peers[params.senderId];
		if(!peer)
		{
			return;
		}

		peer.setReady(true);
		peer.setUserAgent(params.userAgent);
		peer.setConnectionOffer(params.connectionId, params.sdp);
	};

	BX.Call.PlainCall.prototype.__onPullEventConnectionAnswer = function(params)
	{
		var peer = this.peers[params.senderId];
		if(!peer)
			return;

		peer.setUserAgent(params.userAgent);
		peer.setConnectionAnswer(params.sdp);
	};

	BX.Call.PlainCall.prototype.__onPullEventIceCandidate = function(params)
	{
		var peer = this.peers[params.senderId];
		var candidates;
		if(!peer)
			return;

		try
		{
			candidates = params.candidates;
			for(var i = 0; i < candidates.length; i++)
			{
				peer.addIceCandidate(candidates[i]);
			}
		}
		catch (e)
		{
			this.log('Error parsing serialized candidate: ', e);
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventVoiceStarted = function(params)
	{
		this.runCallback(BX.Call.Event.onUserVoiceStarted, {
			userId: params.senderId
		})
	};

	BX.Call.PlainCall.prototype.__onPullEventVoiceStopped = function(params)
	{
		this.runCallback(BX.Call.Event.onUserVoiceStopped, {
			userId: params.senderId
		})
	};

	BX.Call.PlainCall.prototype.__onPullEventAssociatedEntityReplaced = function(params)
	{
		if (params.call && params.call.ASSOCIATED_ENTITY)
		{
			this.associatedEntity = params.call.ASSOCIATED_ENTITY;
		}
	};

	BX.Call.PlainCall.prototype.__onPullEventFinish = function(params)
	{
		this.destroy();
	};

	BX.Call.PlainCall.prototype.__onPeerStateChanged = function(e)
	{
		this.runCallback(BX.Call.Event.onUserStateChanged, e);

		if(e.state == BX.Call.UserState.Failed)
		{
			if(!this.isAnyoneParticipating())
			{
				this.hangup().then(this.destroy.bind(this));
			}
		}
	};

	BX.Call.PlainCall.prototype.__onPeerRTCStatsReceived = function(e)
	{
		this.runCallback(BX.Call.Event.onRTCStatsReceived, e);
	};

	BX.Call.PlainCall.prototype._onUnload = function(e)
	{
		BX.ajax.runAction(ajaxActions.hangup, {
			data: {
				callId: this.id,
				callInstanceId: this.instanceId
			}
		});

		for (var userId in this.peers)
		{
			this.peers[userId].disconnect();
		}
	};

	BX.Call.PlainCall.prototype.destroy = function ()
	{
		// stop sending media streams
		for(var userId in this.peers)
		{
			if(this.peers[userId])
			{
				this.peers[userId].destroy();
			}
		}
		// stop media streams
		for(var tag in this.localStreams)
		{
			if(this.localStreams[tag])
			{
				BX.webrtc.stopMediaStream(this.localStreams[tag]);
				this.localStreams[tag] = null;
			}
		}

		// remove all event listeners
		window.removeEventListener("unload", this._onUnloadHandler);

		clearInterval(this.pingInterval);
		this.runCallback(BX.Call.Event.onDestroy);
	};

	BX.Call.PlainCall.Signaling = function(params)
	{
		this.call = params.call;
	};

	BX.Call.PlainCall.Signaling.prototype.isIceTricklingAllowed = function()
	{
		return BX.PULL.isPublishingSupported();
	};

	BX.Call.PlainCall.Signaling.prototype.inviteUsers = function(data)
	{
		return this.__runAjaxAction(ajaxActions.invite, data);
	};

	BX.Call.PlainCall.Signaling.prototype.sendAnswer = function(data)
	{
		return this.__runAjaxAction(ajaxActions.answer, data);
	};

	BX.Call.PlainCall.Signaling.prototype.sendConnectionOffer = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			return this.__sendPullEvent(pullEvents.connectionOffer, data);
		}
		else
		{
			return this.__runAjaxAction(ajaxActions.connectionOffer, data);
		}
	};

	BX.Call.PlainCall.Signaling.prototype.sendConnectionAnswer = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			return this.__sendPullEvent(pullEvents.connectionAnswer, data);
		}
		else
		{
			return this.__runAjaxAction(ajaxActions.connectionAnswer, data);
		}
	};

	BX.Call.PlainCall.Signaling.prototype.sendIceCandidate = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			return this.__sendPullEvent(pullEvents.iceCandidate, data);
		}
		else
		{
			return this.__runAjaxAction(ajaxActions.iceCandidate, data);
		}
	};

	BX.Call.PlainCall.Signaling.prototype.sendNegotiationNeeded = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			return this.__sendPullEvent(pullEvents.negotiationNeeded, data);
		}
		else
		{
			return this.__runAjaxAction(ajaxActions.negotiationNeeded, data);
		}
	};

	BX.Call.PlainCall.Signaling.prototype.sendVoiceStarted = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			return this.__sendPullEvent(pullEvents.voiceStarted, data);
		}
	};

	BX.Call.PlainCall.Signaling.prototype.sendVoiceStopped = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			return this.__sendPullEvent(pullEvents.voiceStopped, data);
		}
	};

	BX.Call.PlainCall.Signaling.prototype.sendPing = function(data)
	{
		if(BX.PULL.isPublishingSupported())
		{
			this.__sendPullEvent(pullEvents.ping, data);
			this.__runAjaxAction(ajaxActions.ping, {retransmit: false});
		}
		else
		{
			this.__runAjaxAction(ajaxActions.ping, {retransmit: true});
		}
	};

	BX.Call.PlainCall.Signaling.prototype.__sendPullEvent = function(eventName, data)
	{
		if(!data.userId)
		{
			throw new Error('userId is not found in data');
		}

		if(!BX.type.isArray(data.userId))
		{
			data.userId = [data.userId];
		}
		data.senderId = this.call.userId;
		data.callId = this.call.id;
		data.requestId = BX.Call.Engine.getInstance().getUuidv4();

		this.call.log('Sending p2p signaling event ' + eventName + '; ' + JSON.stringify(data));
		BX.PULL.sendMessage(data.userId, 'im', eventName, data, 10);
	};

	BX.Call.PlainCall.Signaling.prototype.__runAjaxAction = function(signalName, data)
	{
		if(!BX.type.isPlainObject(data))
		{
			data = {};
		}

		data.callId = this.call.id;
		data.callInstanceId = this.call.instanceId;
		data.requestId = BX.Call.Engine.getInstance().getUuidv4();

		this.call.log('Sending ajax-based signaling event ' + signalName + '; ' + JSON.stringify(data));
		return BX.ajax.runAction(signalName, {data: data}).catch(function(e) {console.error(e)});
	};

	BX.Call.PlainCall.Peer = function(params)
	{
		/** @var {BX.Call.PlainCall} */
		this.call = params.call;
		this.userId = params.userId;

		this.ready = params.ready === true;
		this.calling = false;
		this.inviteTimeout = false;
		this.declined = false;
		this.signalingConnected = params.signalingConnected === true;
		this.failureReason = '';

		this.userAgent = '';
		this.isFirefox = false;
		this.isChrome = false;
		this.isMobile = false;

		/*sums up from signaling, ready and connection states*/
		this.calculatedState = this.calculateState();

		this.localStreams =	{
			main: null,
			screen: null
		};

		this.senderMediaStream = null;
		this.peerConnection = null;
		this.pendingIceCandidates = [];
		this.localIceCandidates = [];

		this.callbacks = {
			onStateChanged: BX.type.isFunction(params.onStateChanged) ? params.onStateChanged : BX.DoNothing,
			onStreamReceived: BX.type.isFunction(params.onStreamReceived) ? params.onStreamReceived : BX.DoNothing,
			onStreamRemoved: BX.type.isFunction(params.onStreamRemoved) ? params.onStreamRemoved : BX.DoNothing,
			onRTCStatsReceived: BX.type.isFunction(params.onRTCStatsReceived) ? params.onRTCStatsReceived : BX.DoNothing,
		};

		// intervals and timeouts
		this.answerTimeout = null;
		this.callingTimeout = null;
		this.connectionTimeout = null;
		this.signalingConnectionTimeout = null;
		this.candidatesTimeout = null;

		this.statsInterval = null;

		// event handlers
		this._onPeerConnectionIceCandidateHandler = this._onPeerConnectionIceCandidate.bind(this);
		this._onPeerConnectionIceConnectionStateChangeHandler = this._onPeerConnectionIceConnectionStateChange.bind(this);
		this._onPeerConnectionIceGatheringStateChangeHandler = this._onPeerConnectionIceGatheringStateChange.bind(this);
		this._onPeerConnectionNegotiationNeededHandler = BX.debounce(this._onPeerConnectionNegotiationNeeded, 100, this);
		this._onPeerConnectionTrackHandler = this._onPeerConnectionTrack.bind(this);
		this._onPeerConnectionRemoveStreamHandler = this._onPeerConnectionRemoveStream.bind(this);
	};

	BX.Call.PlainCall.Peer.prototype.sendMedia = function()
	{
		var tracksToSend = [];

		if(this.call.localStreams["main"])
		{
			tracksToSend = tracksToSend.concat(this.call.localStreams["main"].getAudioTracks());
		}
		if(this.call.localStreams["screen"])
		{
			tracksToSend = tracksToSend.concat(this.call.localStreams["screen"].getVideoTracks());
		}
		else if(this.call.localStreams["main"])
		{
			tracksToSend = tracksToSend.concat(this.call.localStreams["main"].getVideoTracks());
		}

		this.log("User: " + this.userId + '; Sending media streams. Tracks: ' + tracksToSend.map(function(track){return track.id}).join('; '));

		if(tracksToSend.length === 0)
		{
			this.log("No media streams to send");
			return;
		}

		if(this.peerConnection)
		{
			this.peerConnection.getSenders().forEach(function(sender)
			{
				this.peerConnection.removeTrack(sender);
			}.bind(this));
		}

		if(this.senderMediaStream && this.senderMediaStream.getTracks().length > 0)
		{
			this.log('removing old tracks');
			this.senderMediaStream.getTracks().forEach(function(track)
			{
				this.senderMediaStream.removeTrack(track);
			}, this);
		}

		if(!this.peerConnection)
		{
			if(!this.isInitiator())
			{
				this.log('waiting for the other side to send connection offer');
				this.getSignaling().sendNegotiationNeeded({
					userId: this.userId,
				});
				return;
			}

			var connectionId = BX.Call.Engine.getInstance().getUuidv4();
			this._createPeerConnection(connectionId);
		}

		this.senderMediaStream = new MediaStream();
		tracksToSend.forEach(function(track)
		{
			this.senderMediaStream.addTrack(track);
			this.peerConnection.addTrack(track, this.senderMediaStream);
		}, this);
	};

	BX.Call.PlainCall.Peer.prototype.replaceMediaStream = function(tag)
	{
		if(this.isRenegotiationSupported())
		{
			this.sendMedia();
		}
		else
		{
			this.localStreams[tag] = this.call.getLocalStream(tag);
			this.reconnect();
		}
	};

	BX.Call.PlainCall.Peer.prototype.isInitiator = function()
	{
		return this.call.userId < this.userId;
	};

	BX.Call.PlainCall.Peer.prototype.isRenegotiationSupported = function()
	{
		return (BX.browser.IsChrome() && this.isChrome);
	};

	BX.Call.PlainCall.Peer.prototype.setReady = function(ready)
	{
		this.ready = ready;
		if(this.ready)
		{
			this.declined = false;
		}
		if(this.calling)
		{
			clearTimeout(this.callingTimeout);
			this.calling = false;
		}
		this.updateCalculatedState();
	};

	BX.Call.PlainCall.Peer.prototype.isReady = function()
	{
		return this.ready;
	};

	BX.Call.PlainCall.Peer.prototype.onInvited = function()
	{
		this.ready = false;
		this.inviteTimeout = false;
		this.declined = false;
		this.calling = true;

		if(this.callingTimeout)
		{
			clearTimeout(this.callingTimeout);
		}
		this.callingTimeout = setTimeout(this.onInviteTimeout.bind(this), 30000);
		this.updateCalculatedState();
	};

	BX.Call.PlainCall.Peer.prototype.onInviteTimeout = function()
	{
		clearTimeout(this.callingTimeout);
		this.calling = false;
		this.inviteTimeout = true;
		this.updateCalculatedState();
	};

	BX.Call.PlainCall.Peer.prototype.setUserAgent = function(userAgent)
	{
		this.userAgent = userAgent;
		this.isFirefox = userAgent.toLowerCase().indexOf('firefox') != -1;
		this.isChrome = userAgent.toLowerCase().indexOf('chrome') != -1;
		this.isMobile = userAgent === 'Bitrix Mobile';
	};

	BX.Call.PlainCall.Peer.prototype.getUserAgent = function()
	{
		return this.userAgent;
	};

	BX.Call.PlainCall.Peer.prototype.isParticipating = function()
	{
		if(this.calling)
			return true;

		if(this.declined)
			return false;

		if(this.peerConnection)
		{
			// todo: maybe we should check iceConnectionState as well.
			var iceConnectionState = this.peerConnection.iceConnectionState;
			if(iceConnectionState == 'checking' || iceConnectionState == 'connected' || iceConnectionState == 'completed')
			{
				return true;
			}
		}

		return false;
	};

	BX.Call.PlainCall.Peer.prototype.setSignalingConnected = function(signalingConnected)
	{
		this.signalingConnected = signalingConnected;
		this.updateCalculatedState();

		if(this.signalingConnected)
			this.refreshSignalingTimeout();
		else
			this.stopSignalingTimeout();
	};

	BX.Call.PlainCall.Peer.prototype.isSignalingConnected = function()
	{
		return this.signalingConnected;
	};

	BX.Call.PlainCall.Peer.prototype.setDeclined = function(declined)
	{
		this.declined = declined;
		if(this.calling)
		{
			clearTimeout(this.callingTimeout);
			this.calling = false;
		}
		this.updateCalculatedState();
	};

	BX.Call.PlainCall.Peer.prototype.isDeclined = function()
	{
		return this.declined;
	};

	BX.Call.PlainCall.Peer.prototype.updateCalculatedState = function()
	{
		var calculatedState = this.calculateState();

		if(this.calculatedState != calculatedState)
		{
			this.callbacks.onStateChanged({
				userId: this.userId,
				state: calculatedState,
				previousState: this.calculatedState,
				isMobile: this.isMobile
			});
			this.calculatedState = calculatedState;
		}
	};

	BX.Call.PlainCall.Peer.prototype.calculateState = function()
	{
		if(this.peerConnection)
		{
			if(this.peerConnection.iceConnectionState === 'failed')
			{
				return BX.Call.UserState.Failed;
			}

			if(this.peerConnection.iceConnectionState === 'connected' || this.peerConnection.iceConnectionState === 'completed')
			{
				return BX.Call.UserState.Connected;
			}

			return BX.Call.UserState.Connecting;
		}

		if(this.calling)
			return BX.Call.UserState.Calling;

		if(this.inviteTimeout)
			return BX.Call.UserState.Failed;

		if(this.declined)
			return BX.Call.UserState.Declined;

		if(this.ready)
			return BX.Call.UserState.Ready;

		return BX.Call.UserState.Idle;
	};

	BX.Call.PlainCall.Peer.prototype.getSignaling = function()
	{
		return this.call.signaling;
	};

	BX.Call.PlainCall.Peer.prototype.startStatisticsGathering = function()
	{
		clearInterval(this.statsInterval);

		this.statsInterval = setInterval(function()
		{
			if(!this.peerConnection)
			{
				return false;
			}

			this.peerConnection.getStats().then(function(stats)
			{
				this.callbacks.onRTCStatsReceived({
					userId: this.userId,
					stats: stats
				});
			}.bind(this));
		}.bind(this), 1000);
	};

	BX.Call.PlainCall.Peer.prototype.stopStatisticsGathering = function()
	{
		clearInterval(this.statsInterval);
		this.statsInterval = null;
	};

	BX.Call.PlainCall.Peer.prototype.updateCandidatesTimeout = function()
	{
		if(this.candidatesTimeout)
		{
			clearTimeout(this.candidatesTimeout);
		}

		this.candidatesTimeout = setTimeout(this.sendIceCandidates.bind(this), 500);
	};

	BX.Call.PlainCall.Peer.prototype.sendIceCandidates = function()
	{
		this.candidatesTimeout = null;

		this.log("User " + this.userId + ": sending ICE candidates due to the timeout");

		if(this.localIceCandidates.length > 0)
		{
			this.getSignaling().sendIceCandidate({
				userId: this.userId,
				candidates: this.localIceCandidates
			});
			this.localIceCandidates = [];
		}
		else
		{
			this.log("User " + this.userId +  ": ICE candidates pool is empty");
		}
	};

	BX.Call.PlainCall.Peer.prototype._createPeerConnection = function(id)
	{
		this.log("User " + this.userId + ": Creating peer connection");
		var connectionConfig = {
			"iceServers": [
				{
					url: "stun:" + this.call.turnServer
				},
				{
					url: "turn:" + this.call.turnServer,
					username: this.call.turnServerLogin,
					credential: this.call.turnServerPassword
				}
			]
		};

		this.localIceCandidates = [];
		var peerConnection = new RTCPeerConnection(connectionConfig);
		peerConnection._id = id;

		peerConnection.addEventListener("icecandidate", this._onPeerConnectionIceCandidateHandler);
		peerConnection.addEventListener("iceconnectionstatechange", this._onPeerConnectionIceConnectionStateChangeHandler);
		peerConnection.addEventListener("icegatheringstatechange", this._onPeerConnectionIceGatheringStateChangeHandler);
		peerConnection.addEventListener("negotiationneeded", this._onPeerConnectionNegotiationNeededHandler);
		peerConnection.addEventListener("track", this._onPeerConnectionTrackHandler);
		peerConnection.addEventListener("removestream", this._onPeerConnectionRemoveStreamHandler);

		this.peerConnection = peerConnection;
		this.updateCalculatedState();

		this.startStatisticsGathering();
	};

	BX.Call.PlainCall.Peer.prototype._destroyPeerConnection = function()
	{
		if(!this.peerConnection)
			return;

		this.log("User " + this.userId + ": Destroying peer connection");
		this.stopStatisticsGathering();

		this.peerConnection.removeEventListener("icecandidate", this._onPeerConnectionIceCandidateHandler);
		this.peerConnection.removeEventListener("iceconnectionstatechange", this._onPeerConnectionIceConnectionStateChangeHandler);
		this.peerConnection.removeEventListener("icegatheringstatechange", this._onPeerConnectionIceGatheringStateChangeHandler);
		this.peerConnection.removeEventListener("negotiationneeded", this._onPeerConnectionNegotiationNeededHandler);
		this.peerConnection.removeEventListener("track", this._onPeerConnectionTrackHandler);
		this.peerConnection.removeEventListener("removestream", this._onPeerConnectionRemoveStreamHandler);

		this.peerConnection.close();
		this.peerConnection = null;
	};

	BX.Call.PlainCall.Peer.prototype._onPeerConnectionIceCandidate = function(e)
	{
		var candidate = e.candidate;
		this.log("User " + this.userId +  ": ICE candidate discovered. Candidate: " + (candidate ? candidate.candidate : candidate));

		if(candidate)
		{
			if(this.getSignaling().isIceTricklingAllowed())
			{
				this.getSignaling().sendIceCandidate({
					userId: this.userId,
					candidates: [candidate.toJSON()]
				});
			}
			else
			{
				this.localIceCandidates.push(candidate.toJSON());
				this.updateCandidatesTimeout();
			}
		}
	};

	BX.Call.PlainCall.Peer.prototype._onPeerConnectionIceConnectionStateChange = function(e)
	{
		this.log("User " + this.userId +  ": ICE connection state changed. New state: " + this.peerConnection.iceConnectionState);
		this.updateCalculatedState();
	};

	BX.Call.PlainCall.Peer.prototype._onPeerConnectionIceGatheringStateChange = function(e)
	{
		var connection = e.target;

		this.log("User " + this.userId +  ": ICE gathering state changed to : " + connection.iceGatheringState);

		if(connection.iceGatheringState === 'complete')
		{
			this.log("User " + this.userId +  ": ICE gathering complete");

			if(!this.getSignaling().isIceTricklingAllowed())
			{
				if(this.localIceCandidates.length > 0)
				{
					this.getSignaling().sendIceCandidate({
						userId: this.userId,
						candidates: this.localIceCandidates
					});
					this.localIceCandidates = [];
				}
				else
				{
					this.log("User " + this.userId +  ": ICE candidates already sent");
				}
			}
		}
	};

	BX.Call.PlainCall.Peer.prototype._onPeerConnectionNegotiationNeeded = function(e)
	{
		this.log("User " + this.userId +  ": needed negotiation for peer connection");
		this.log("signaling state: ", e.target.signalingState);
		this.log("ice connection state: ", e.target.iceConnectionState);
		this.log("pendingRemoteDescription: ", e.target.pendingRemoteDescription);

		if(e.target.iceConnectionState !== "new" && e.target.iceConnectionState !== "connected" && e.target.iceConnectionState !== "completed")
		{
			this.log("User " + this.userId + ": wrong connection state");
			return;
		}

		if(this.isInitiator())
		{
			this.createAndSendOffer();
		}
		else
		{
			this.getSignaling().sendNegotiationNeeded({
				userId: this.userId,
			});
		}
	};

	BX.Call.PlainCall.Peer.prototype._onPeerConnectionTrack = function(e)
	{
		this.log("User " + this.userId + ": media track received: ", e.track.id + " (" + e.track.kind + ")");

		this.callbacks.onStreamReceived({
			userId: this.userId,
			kind: e.track.kind,
			stream: e.streams[0]
		});
	};

	BX.Call.PlainCall.Peer.prototype._onPeerConnectionRemoveStream = function(e)
	{
		this.log("User: " + this.userId + "_onPeerConnectionRemoveStream: ", e);
		this.callbacks.onStreamRemoved({
			userId: this.userId,
			stream: e.stream
		})
	};

	BX.Call.PlainCall.Peer.prototype.stopSignalingTimeout = function()
	{
		clearTimeout(this.signalingConnectionTimeout);
	};

	BX.Call.PlainCall.Peer.prototype.refreshSignalingTimeout = function()
	{
		clearTimeout(this.signalingConnectionTimeout);
		this.signalingConnectionTimeout = setTimeout(this._onLostSignalingConnection.bind(this), signalingConnectionRefreshPeriod);
	};

	BX.Call.PlainCall.Peer.prototype._onLostSignalingConnection = function()
	{
		this.setSignalingConnected(false);
	};

	BX.Call.PlainCall.Peer.prototype.setConnectionOffer = function(connectionId, sdp)
	{
		this.log("User " + this.userId + ": applying connection offer for connection " + connectionId);
		if(!this.call.isReady())
			return;

		if(!this.isReady())
			return;

		if(this.peerConnection)
		{
			if(this.peerConnection._id !== connectionId)
			{
				this._destroyPeerConnection();
				this._createPeerConnection(connectionId);
			}
		}
		else
		{
			this._createPeerConnection(connectionId);
		}

		this.applyOfferAndSendAnswer(sdp);
	};

	BX.Call.PlainCall.Peer.prototype.createAndSendOffer = function(config)
	{
		var self = this;

		connectionConfig = defaultConnectionOptions;
		for(var key in config)
		{
			connectionConfig[key] = config[key];
		}

		self.peerConnection.createOffer(connectionConfig).then(function(offer)
		{
			self.log("User " + self.userId + ": Created connection offer.");
			self.log("Applying local description");
			return self.peerConnection.setLocalDescription(offer);
		}).then(function()
		{
			self.sendOffer();
		})
	};

	BX.Call.PlainCall.Peer.prototype.sendOffer = function()
	{
		this.getSignaling().sendConnectionOffer({
			userId: this.userId,
			connectionId: this.peerConnection._id,
			sdp: this.peerConnection.localDescription.sdp,
			userAgent: navigator.userAgent
		})
	};

	BX.Call.PlainCall.Peer.prototype.applyOfferAndSendAnswer = function(sdp)
	{
		var self = this;
		var sessionDescription = new RTCSessionDescription({
			type: "offer",
			sdp: sdp
		});

		var peerConnection = this.peerConnection;

		this.log("User: " + this.userId + "; Applying remote offer");
		this.log("User: " + this.userId + "; Peer ice connection state ", peerConnection.iceConnectionState);

		peerConnection.setRemoteDescription(sessionDescription).then(function()
		{
			if(peerConnection.iceConnectionState === 'new')
			{
				self.sendMedia();
			}

			return self.peerConnection.createAnswer();
		}).then(function(answer)
		{
			self.log("Created connection answer.");
			self.log("Applying local description.");
			return self.peerConnection.setLocalDescription(answer);
		}).then(function()
		{
			self.applyPendingIceCandidates();
			self.getSignaling().sendConnectionAnswer({
				userId: self.userId,
				connectionId: self.peerConnection._id,
				sdp: self.peerConnection.localDescription.sdp,
				userAgent: navigator.userAgent
			});
		}).catch(function(e)
		{
			self.log(e);
		});
	};

	BX.Call.PlainCall.Peer.prototype.setConnectionAnswer = function(sdp)
	{
		var self = this;
		if(!this.peerConnection)
			return;

		if(this.peerConnection.signalingState !== 'have-local-offer')
			return;

		var sessionDescription = new RTCSessionDescription({
			type: "answer",
			sdp: sdp
		});

		this.log("User: " + this.userId + "; Applying remote answer");
		this.peerConnection.setRemoteDescription(sessionDescription).then(function()
		{
			self.applyPendingIceCandidates();
		});
	};

	BX.Call.PlainCall.Peer.prototype.addIceCandidate = function(candidate)
	{
		if(!this.peerConnection)
			return;

		if(this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type)
		{
			this.peerConnection.addIceCandidate(candidate).then(function()
			{
				this.log("User: " + this.userId + "; Added remote ICE candidate: " + (candidate ? candidate.candidate : candidate));
			}.bind(this)).catch(function(e)
			{
				this.log(e);
			}.bind(this));
		}
		else
		{
			this.pendingIceCandidates.push(candidate);
		}
	};

	BX.Call.PlainCall.Peer.prototype.applyPendingIceCandidates = function()
	{
		var self = this;
		if(!this.peerConnection || !this.peerConnection.remoteDescription.type)
			return;

		if(BX.type.isArray(this.pendingIceCandidates))
		{
			this.pendingIceCandidates.forEach(function(candidate)
			{
				self.peerConnection.addIceCandidate(candidate).then(function()
				{
					this.log("User: " + this.userId + "; Added remote ICE candidate: " + (candidate ? candidate.candidate : candidate));
				}.bind(this));
			});

			self.pendingIceCandidates = [];
		}
	};

	/**
	 * @param {string} tag
	 */
	BX.Call.PlainCall.Peer.prototype.onNegotiationNeeded = function()
	{
		if(this.peerConnection)
		{
			this.createAndSendOffer({iceRestart: true});
		}
		else
		{
			this.sendMedia();
		}
	};

	BX.Call.PlainCall.Peer.prototype.reconnect = function()
	{
		if(this.isInitiator())
		{
			this._destroyPeerConnection();
			this.sendMedia();
		}
		else
		{
			this.getSignaling().sendNegotiationNeeded({
				userId: this.userId,
				restart: true
			})
		}
	};

	BX.Call.PlainCall.Peer.prototype.disconnect = function()
	{
		this._destroyPeerConnection();
	};

	BX.Call.PlainCall.Peer.prototype.log = function()
	{
		this.call.log.apply(this.call, arguments);
	};

	BX.Call.PlainCall.Peer.prototype.destroy = function()
	{
		this.disconnect();

		if(this.voiceDetection)
		{
			this.voiceDetection.destroy();
			this.voiceDetection = null;
		}

		for (var tag in this.localStreams)
		{
			this.localStreams[tag] = null;
		}

		clearTimeout(this.answerTimeout);
		this.answerTimeout = null;

		clearTimeout(this.connectionTimeout);
		this.connectionTimeout = null;

		clearTimeout(this.signalingConnectionTimeout);
		this.signalingConnectionTimeout = null;

		this.callbacks.onStateChanged = BX.DoNothing;
		this.callbacks.onStreamReceived = BX.DoNothing;
		this.callbacks.onStreamRemoved = BX.DoNothing;
	};

})();