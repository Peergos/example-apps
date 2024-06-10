(() => {
	let rAF_ID, rotologo, $window, space_phase_key_handler, player, player_placeholder;
	let vaporwave_active = false;

	if (parent && frameElement && parent.$) {
		$window = parent.$(frameElement).closest(".window");
	} else {
		$window = $();
	}

	const wait_for_youtube_api = callback => {
		if (typeof YT !== "undefined") {
			callback();
		} else {
			const tag = document.createElement('script');
			tag.src = "https://www.youtube.com/player_api";
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			// The YouTube API will call this global function when loaded and ready.
			window.onYouTubeIframeAPIReady = () => {
				callback();
			};
		}
	};

	const stop_vaporwave = () => {
		vaporwave_active = false;

		cancelAnimationFrame(rAF_ID);

		$(rotologo).remove();
		$window.css({ transform: "" });

		removeEventListener("keydown", space_phase_key_handler);
		if (player) {
			player.destroy();
			player = null;
		}
		$(player_placeholder).remove();

		// vaporwave is dead. long live vaporwave.
		// bepis pepsi isded pepsi isded
	};

	const start_vaporwave = () => {
		vaporwave_active = true;

		rotologo = document.createElement("img");
		rotologo.classList.add("rotologo");
		if (frameElement) {
			frameElement.parentElement.appendChild(rotologo);
			rotologo.src = "images/logo/98.js.org.svg";
		} else {
			document.body.appendChild(rotologo);
			rotologo.src = "images/98.js.org.svg";
		}

		$(rotologo).css({
			position: "absolute",
			left: "50%",
			top: "50%",
			pointerEvents: "none",
			transformOrigin: "0% 0%",
			transition: "opacity 1s ease",
			opacity: "0",
		});

		const animate = () => {
			rAF_ID = requestAnimationFrame(animate);

			// @TODO: slow down and stop when you pause?
			const turns = Math.sin(Date.now() / 5000);
			const hueTurns = Math.sin(Date.now() / 4000);
			$(rotologo).css({
				transform: `perspective(4000px) rotateY(${turns}turn) translate(-50%, -50%) translateZ(500px)`,
				filter: `hue-rotate(${hueTurns}turn)`,
			});

			if ($window.length) {
				let el = $window[0];
				let offsetLeft = 0;
				let offsetTop = 0;
				do {
					offsetLeft += el.offsetLeft;
					offsetTop += el.offsetTop;
					el = el.offsetParent;
				} while (el);

				const rotateY = -(offsetLeft + ($window.outerWidth() - parent.innerWidth) / 2) / parent.innerWidth / 3;
				const rotateX = (offsetTop + ($window.outerHeight() - parent.innerHeight) / 2) / parent.innerHeight / 3;
				$window.css({
					transform: `perspective(4000px) rotateY(${rotateY}turn) rotateX(${rotateX}turn)`,
					transformOrigin: "50% 50%",
					transformStyle: "preserve-3d",
					// @FIXME: interactivity problems (with order elements are considered to have), I think related to preserve-3d
				});
			}
		};
		animate();

		player_placeholder = document.createElement("div");
		document.querySelector(".canvas-area").appendChild(player_placeholder);
		$(player_placeholder).css({
			position: "absolute",
			top: "3px", // @TODO: dynamic
			left: "3px",
			mixBlendMode: "multiply",
			pointerEvents: "none",
			transition: "opacity 0.4s ease",
			width: "100vw",
			height: "100vh",
		});
		// NOTE: placeholder not a container; the YT API replaces the element passed in the DOM
		// but keeps inline styles apparently, and maybe other things, I don't know; it's weird

		wait_for_youtube_api(() => {
			player = new YT.Player(player_placeholder, {
				height: "390",
				width: "640",
				videoId: "8TvcyPCgKSU",
				playerVars: {
					autoplay: 1,
					controls: 0,
				},
				events: {
					onReady: onPlayerReady,
					onStateChange: onPlayerStateChange,
				},
			});
			// @TODO: attribution for this video!
			// I mean, you can see the title if you hit spacebar, but
			// I could make it wave across the screen behind Paint on the desktop
			// I could add a "Song Name?" button that responds "Darude Sandstorm"
			// I could add a "Song At 420?" button that actually links to the video
			// some number of those things or something like that
		});

		// The API will call this function when the video player is ready.
		function onPlayerReady(/*event*/) {
			player.playVideo();
			player.unMute();
		}

		// The API calls this function when the player's state changes.
		function onPlayerStateChange(event) {
			if (event.data == YT.PlayerState.PLAYING) {
				// @TODO: pause and resume this timer with the video
				setTimeout(() => {
					$(rotologo).css({ opacity: 1 });
				}, 14150);
			}
			if (event.data == YT.PlayerState.ENDED) {
				player.destroy();
				player = null;
				// @TODO: fade to white instead of black, to work with the multiply effect
				// or fade out opacity alternatively
				// setTimeout/setInterval and check player.getCurrentTime() for when near the end?
				// or we might switch to using soundcloud for the audio and so trigger it with that, with a separate video of just clouds
				// also fade out the rotologo earlier
				$(rotologo).css({ opacity: 0 });
				// destroy rotologo once faded out
				setTimeout(stop_vaporwave, 1200);
			}
		}

		let is_theoretically_playing = true;
		space_phase_key_handler = e => {
			// press space to phase in and out of space phase スペース相 - windows 98 マイクロソフト 『ＷＩＮＴＲＡＰ』 X 将来のオペレーティングシステムサウンド 1998 VAPORWAVE
			if (e.which === 32) {
				// @TODO: record player SFX
				if (is_theoretically_playing) {
					player.pauseVideo();
					is_theoretically_playing = false;
					$(player.getIframe())
						.add(rotologo)
						.css({ opacity: "0" });
				} else {
					player.playVideo();
					is_theoretically_playing = true;
					$(player.getIframe())
						.add(rotologo)
						.css({ opacity: "" });
				}
				e.preventDefault();
				// player.getIframe().focus();
			}
		};
		addEventListener("keydown", space_phase_key_handler);
	};

	const toggle_vaporwave = () => {
	};

	addEventListener("keydown", Konami.code(toggle_vaporwave));
	addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			stop_vaporwave();
		}
	});

})();


(() => {

	const log = (...args) => {
		window.console && console.log(...args);
	};

	let localStorageAvailable = false;
	try {
		localStorage._available = true;
		localStorageAvailable = localStorage._available;
		delete localStorage._available;
		// eslint-disable-next-line no-empty
	} catch (e) { }

	// @TODO: keep other data in addition to the image data
	// such as the file_name and other state
	// (maybe even whether it's considered saved? idk about that)
	// I could have the image in one storage slot and the state in another

	const match_threshold = 1; // 1 is just enough for a workaround for Brave browser's farbling: https://github.com/1j01/jspaint/issues/184
	const canvas_has_any_apparent_image_data = () =>
		main_canvas.ctx.getImageData(0, 0, main_canvas.width, main_canvas.height).data.some((v) => v > match_threshold);

	let $recovery_window;
	function show_recovery_window(no_longer_blank) {
		$recovery_window && $recovery_window.close();
		const $w = $recovery_window = $DialogWindow();
		$w.on("close", () => {
			$recovery_window = null;
		});
		$w.title("Recover Document");
		let backup_impossible = false;
		try { window.localStorage } catch (e) { backup_impossible = true; }
		$w.$main.append($(`
			<h1>Woah!</h1>
			<p>Your browser may have cleared the canvas due to memory usage.</p>
			<p>Undo to recover the document, and remember to save with <b>File > Save</b>!</p>
			${backup_impossible ?
				"<p><b>Note:</b> No automatic backup is possible unless you enable Cookies in your browser.</p>"
				: (
					no_longer_blank ?
						`<p>
							<b>Note:</b> normally a backup is saved automatically,<br>
							but autosave is paused while this dialog is open<br>
							to avoid overwriting the (singular) backup.
						</p>
						<p>
							(See <b>File &gt; Manage Storage</b> to view backups.)
						</p>`
						: ""
				)
			}
		`));

		const $undo = $w.$Button("Undo", () => {
			undo();
		});
		const $redo = $w.$Button("Redo", () => {
			redo();
		});
		const update_buttons_disabled = () => {
			$undo.attr("disabled", undos.length < 1);
			$redo.attr("disabled", redos.length < 1);
		};
		$G.on("session-update.session-hook", update_buttons_disabled);
		update_buttons_disabled();

		$w.$Button(localize("Close"), () => {
			$w.close();
		});
		$w.center();

		$w.find("button:enabled").focus();
	}

	let last_undos_length = undos.length;
	function handle_data_loss() {
		const window_is_open = $recovery_window && !$recovery_window.closed;
		let save_paused = false;
		if (!canvas_has_any_apparent_image_data()) {
			if (!window_is_open) {
				show_recovery_window();
			}
			save_paused = true;
		} else if (window_is_open) {
			if (undos.length > last_undos_length) {
				show_recovery_window(true);
			}
			save_paused = true;
		}
		last_undos_length = undos.length;
		return save_paused;
	}

	class LocalSession {
		constructor(session_id) {
			this.id = session_id;
			const lsid = `image#${session_id}`;
			log(`Local storage ID: ${lsid}`);
			// save image to storage
			this.save_image_to_storage_immediately = () => {
				const save_paused = handle_data_loss();
				if (save_paused) {
					return;
				}
				log(`Saving image to storage: ${lsid}`);
				storage.set(lsid, main_canvas.toDataURL("image/png"), err => {
					if (err) {
						if (err.quotaExceeded) {
							storage_quota_exceeded();
						}
						else {
							// e.g. localStorage is disabled
							// (or there's some other error?)
							// @TODO: show warning with "Don't tell me again" type option
						}
					}
				});
			};
			this.save_image_to_storage_soon = debounce(this.save_image_to_storage_immediately, 100);
			storage.get(lsid, (err, uri) => {
				if (err) {
					if (localStorageAvailable) {
						show_error_message("Failed to retrieve image from local storage.", err);
					}
					else {
						// @TODO: DRY with storage manager message
						showMessageBox({
							message: "Please enable local storage in your browser's settings for local backup. It may be called Cookies, Storage, or Site Data.",
						});
					}
				}
				else if (uri) {
					load_image_from_uri(uri).then((info) => {
						open_from_image_info(info, null, null, true, true);
					}, (error) => {
						show_error_message("Failed to open image from local storage.", error);
					});
				}
				else {
					// no uri so lets save the blank canvas
					this.save_image_to_storage_soon();
				}
			});
			$G.on("session-update.session-hook", this.save_image_to_storage_soon);
		}
		end() {
			// Skip debounce and save immediately
			this.save_image_to_storage_soon.cancel();
			this.save_image_to_storage_immediately();
			// Remove session-related hooks
			$G.off(".session-hook");
		}
	}


	// The user ID is not persistent
	// A person can enter a session multiple times,
	// and is always given a new user ID
	let user_id;
	// @TODO: I could make the color persistent, though.
	// You could still have multiple cursors and they would just be the same color.
	// There could also be an option to change your color

	// The data in this object is stored in the server when you enter a session
	// It is (supposed to be) removed when you leave
	const user = {
		// Cursor status
		cursor: {
			// cursor position in canvas coordinates
			x: 0, y: 0,
			// whether the user is elsewhere, such as in another tab
			away: true,
		},
		// Currently selected tool (@TODO)
		tool: localize("Pencil"),
		// Color components
		hue: ~~(Math.random() * 360),
		saturation: ~~(Math.random() * 50) + 50,
		lightness: ~~(Math.random() * 40) + 50,
	};

	// The main cursor color
	user.color = `hsla(${user.hue}, ${user.saturation}%, ${user.lightness}%, 1)`;
	// Unused
	user.color_transparent = `hsla(${user.hue}, ${user.saturation}%, ${user.lightness}%, 0.5)`;
	// (@TODO) The color (that may be) used in the toolbar indicating to other users it is selected by this user
	user.color_desaturated = `hsla(${user.hue}, ${~~(user.saturation * 0.4)}%, ${user.lightness}%, 0.8)`;


	// The image used for other people's cursors
	const cursor_image = new Image();
	cursor_image.src = "images/cursors/default.png";


	class MultiUserSession {
		constructor(session_id) {
			this.id = session_id;
			this._fb_listeners = [];

			file_name = `[Loading ${this.id}]`;
			update_title();
			const on_firebase_loaded = () => {
				file_name = `[${this.id}]`;
				update_title();
				this.start();
			};
			if (!MultiUserSession.fb_root) {
				var script = document.createElement("script");
				script.addEventListener("load", () => {
					const config = {
						apiKey: "AIzaSyBgau8Vu9ZE8u_j0rp-Lc044gYTX5O3X9k",
						authDomain: "jspaint.firebaseapp.com",
						databaseURL: "https://jspaint.firebaseio.com",
						projectId: "firebase-jspaint",
						storageBucket: "",
						messagingSenderId: "63395010995"
					};
					firebase.initializeApp(config);
					MultiUserSession.fb_root = firebase.database().ref("/");
					on_firebase_loaded();
				});
				script.addEventListener("error", () => {
					show_error_message("Failed to load Firebase; the document will not load, and changes will not be saved.");
					file_name = `[Failed to load ${this.id}]`;
					update_title();
				});
				script.src = "lib/firebase.js";
				document.head.appendChild(script);
			}
			else {
				on_firebase_loaded();
			}
		}
		start() {
			// @TODO: how do you actually detect if it's failing???
			showMessageBox({
				messageHTML: `
					<p>The document may not load. Changes may not save.</p>
					<p>Multiuser sessions are public. There is no security.</p>
				`
			});
			// "<p>The document may not load. Changes may not save. If it does save, it's public. There is no security.</p>"// +
			// "<p>I haven't found a way to detect Firebase quota limits being exceeded, " +
			// "so for now I'm showing this message regardless of whether it's working.</p>" +
			// "<p>If you're interested in using multiuser mode, please thumbs-up " +
			// "<a href='https://github.com/1j01/jspaint/issues/68'>this issue</a> to show interest, and/or subscribe for updates.</p>"

			// Wrap the Firebase API because they don't
			// provide a great way to clean up event listeners
			const _fb_on = (fb, event_type, callback, error_callback) => {
				this._fb_listeners.push({ fb, event_type, callback, error_callback });
				fb.on(event_type, callback, error_callback);
			};
			// Get Firebase references
			this.fb = MultiUserSession.fb_root.child(this.id);
			this.fb_data = this.fb.child("data");
			this.fb_users = this.fb.child("users");
			if (user_id) {
				this.fb_user = this.fb_users.child(user_id);
			}
			else {
				this.fb_user = this.fb_users.push();
				user_id = this.fb_user.key;
			}
			// Remove the user from the session when they disconnect
			this.fb_user.onDisconnect().remove();
			// Make the user present in the session
			this.fb_user.set(user);
			// @TODO: Execute the above two lines when .info/connected
			// For each existing and new user
			_fb_on(this.fb_users, "child_added", snap => {
				// Is this you?
				if (snap.key === user_id) {
					// You already have a cursor.
					return;
				}
				// Get the Firebase reference for this user
				const fb_other_user = snap.ref;
				// Get the user object stored on the server
				let other_user = snap.val();
				// @TODO: display other cursor types?
				// @TODO: display pointer button state?
				// @TODO: display selections
				const cursor_canvas = make_canvas(32, 32);
				// Make the cursor element
				const $cursor = $(cursor_canvas).addClass("user-cursor").appendTo($app);
				$cursor.css({
					display: "none",
					position: "absolute",
					left: 0,
					top: 0,
					opacity: 0,
					zIndex: 5, // @#: z-index
					pointerEvents: "none",
					transition: "opacity 0.5s",
				});
				// When the cursor data changes
				_fb_on(fb_other_user, "value", snap => {
					other_user = snap.val();
					// If the user has left
					if (other_user == null) {
						// Remove the cursor element
						$cursor.remove();
					}
					else {
						// Draw the cursor
						const draw_cursor = () => {
							cursor_canvas.width = cursor_image.width;
							cursor_canvas.height = cursor_image.height;
							const cursor_ctx = cursor_canvas.ctx;
							cursor_ctx.fillStyle = other_user.color;
							cursor_ctx.fillRect(0, 0, cursor_canvas.width, cursor_canvas.height);
							cursor_ctx.globalCompositeOperation = "multiply";
							cursor_ctx.drawImage(cursor_image, 0, 0);
							cursor_ctx.globalCompositeOperation = "destination-atop";
							cursor_ctx.drawImage(cursor_image, 0, 0);
						};
						if (cursor_image.complete) {
							draw_cursor();
						}
						else {
							$(cursor_image).one("load", draw_cursor);
						}
						// Update the cursor element
						const canvas_rect = canvas_bounding_client_rect;
						$cursor.css({
							display: "block",
							position: "absolute",
							left: canvas_rect.left + magnification * other_user.cursor.x,
							top: canvas_rect.top + magnification * other_user.cursor.y,
							opacity: 1 - other_user.cursor.away,
						});
					}
				});
			});
			let previous_uri;
			// let pointer_operations = []; // the multiplayer syncing stuff is a can of worms, so this is disabled
			this.write_canvas_to_database_immediately = () => {
				const save_paused = handle_data_loss();
				if (save_paused) {
					return;
				}
				// Sync the data from this client to the server (one-way)
				const uri = main_canvas.toDataURL();
				if (previous_uri !== uri) {
					// log("clear pointer operations to set data", pointer_operations);
					// pointer_operations = [];
					log("Write canvas data to Firebase");
					this.fb_data.set(uri);
					previous_uri = uri;
				}
				else {
					log("(Don't write canvas data to Firebase; it hasn't changed)");
				}
			};
			this.write_canvas_to_database_soon = debounce(this.write_canvas_to_database_immediately, 100);
			let ignore_session_update = false;
			$G.on("session-update.session-hook", () => {
				if (ignore_session_update) {
					log("(Ignore session-update from Sync Session undoable)");
					return;
				}
				this.write_canvas_to_database_soon();
			});
			// Any time we change or receive the image data
			_fb_on(this.fb_data, "value", snap => {
				log("Firebase data update");
				const uri = snap.val();
				if (uri == null) {
					// If there's no value at the data location, this is a new session
					// Sync the current data to it
					this.write_canvas_to_database_soon();
				}
				else {
					previous_uri = uri;
					// Load the new image data
					const img = new Image();
					img.onload = () => {
						// Cancel any in-progress pointer operations
						// if (pointer_operations.length) {
						// 	$G.triggerHandler("pointerup", "cancel");
						// }

						const test_canvas = make_canvas(img);
						const image_data_remote = test_canvas.ctx.getImageData(0, 0, test_canvas.width, test_canvas.height);
						const image_data_local = main_ctx.getImageData(0, 0, main_canvas.width, main_canvas.height);

						if (!image_data_match(image_data_remote, image_data_local, 5)) {
							ignore_session_update = true;
							undoable({
								name: "Sync Session",
								icon: get_help_folder_icon("p_database.png"),
							}, () => {
								// Write the image data to the canvas
								main_ctx.copy(img);
								$canvas_area.trigger("resize");
							});
							ignore_session_update = false;
						}

						// (transparency = has_any_transparency(main_ctx); here would not be ideal
						// Perhaps a better way of syncing transparency
						// and other options will be established)
						/*
						// Playback recorded in-progress pointer operations
						log("Playback", pointer_operations);

						for (const e of pointer_operations) {
							// Trigger the event at each place it is listened for
							$canvas.triggerHandler(e, ["synthetic"]);
							$G.triggerHandler(e, ["synthetic"]);
						}
						*/
					};
					img.src = uri;
				}
			}, error => {
				show_error_message("Failed to retrieve data from Firebase. The document will not load, and changes will not be saved.", error);
				file_name = `[Failed to load ${this.id}]`;
				update_title();
			});
			// Update the cursor status
			$G.on("pointermove.session-hook", e => {
				const m = to_canvas_coords(e);
				this.fb_user.child("cursor").update({
					x: m.x,
					y: m.y,
					away: false,
				});
			});
			$G.on("blur.session-hook", () => {
				this.fb_user.child("cursor").update({
					away: true,
				});
			});
			// @FIXME: the cursor can come back from "away" via a pointer event
			// while the window is blurred and stay there when the user goes away
			// maybe replace "away" with a timestamp of activity and then
			// clients can decide whether a given cursor should be visible

			/*
			const debug_event = (e, synthetic) => {
				// const label = synthetic ? "(synthetic)" : "(normal)";
				// window.console && console.debug && console.debug(e.type, label);
			};

			$canvas_area.on("pointerdown.session-hook", "*", (e, synthetic) => {
				debug_event(e, synthetic);
				if (synthetic) { return; }

				pointer_operations = [e];
				const pointermove = (e, synthetic) => {
					debug_event(e, synthetic);
					if (synthetic) { return; }

					pointer_operations.push(e);
				};
				$G.on("pointermove.session-hook", pointermove);
				$G.one("pointerup.session-hook", (e, synthetic) => {
					debug_event(e, synthetic);
					if (synthetic) { return; }

					$G.off("pointermove.session-hook", pointermove);
				});
			});
			*/
		}
		end() {
			// Skip debounce and save immediately
			this.write_canvas_to_database_soon.cancel();
			this.write_canvas_to_database_immediately();
			// Remove session-related hooks
			$G.off(".session-hook");
			// $canvas_area.off("pointerdown.session-hook");
			// Remove collected Firebase event listeners
			this._fb_listeners.forEach(({ fb, event_type, callback/*, error_callback*/ }) => {
				log(`Remove listener for ${fb.path.toString()} .on ${event_type}`);
				fb.off(event_type, callback);
			});
			this._fb_listeners.length = 0;
			// Remove the user from the session
			this.fb_user.remove();
			// Remove any cursor elements
			$app.find(".user-cursor").remove();
			// Reset to "untitled"
			reset_file();
		}
	}



	// Handle the starting, switching, and ending of sessions from the location.hash

	let current_session;
	const end_current_session = () => {
		if (current_session) {
			log("Ending current session");
			current_session.end();
			current_session = null;
		}
	};
	const generate_session_id = () => (Math.random() * (2 ** 32)).toString(16).replace(".", "");
	const update_session_from_location_hash = () => {
		const session_match = location.hash.match(/^#?(?:.*,)?(session|local):(.*)$/i);
		const load_from_url_match = location.hash.match(/^#?(?:.*,)?(load):(.*)$/i);
		if (session_match) {
			const local = session_match[1].toLowerCase() === "local";
			const session_id = session_match[2];
			if (session_id === "") {
				log("Invalid session ID; session ID cannot be empty");
				end_current_session();
			} else if (!local && session_id.match(/[./[\]#$]/)) {
				log("Session ID is not a valid Firebase location; it cannot contain any of ./[]#$");
				end_current_session();
			} else if (!session_id.match(/[-0-9A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02af\u1d00-\u1d25\u1d62-\u1d65\u1d6b-\u1d77\u1d79-\u1d9a\u1e00-\u1eff\u2090-\u2094\u2184-\u2184\u2488-\u2490\u271d-\u271d\u2c60-\u2c7c\u2c7e-\u2c7f\ua722-\ua76f\ua771-\ua787\ua78b-\ua78c\ua7fb-\ua7ff\ufb00-\ufb06]+/)) {
				log("Invalid session ID; it must consist of 'alphanumeric-esque' characters");
				end_current_session();
			} else if (
				current_session && current_session.id === session_id &&
				local === (current_session instanceof LocalSession)
			) {
				log("Hash changed but the session ID and session type are the same");
			} else {
				// @TODO: Ask if you want to save before starting a new session
				end_current_session();
				if (local) {
					log(`Starting a new LocalSession, ID: ${session_id}`);
					current_session = new LocalSession(session_id);
				} else {
					log(`Starting a new MultiUserSession, ID: ${session_id}`);
					current_session = new MultiUserSession(session_id);
				}
			}
		} else if (load_from_url_match) {
			const url = decodeURIComponent(load_from_url_match[2]);

			const uris = get_uris(url);
			if (uris.length === 0) {
				show_error_message("Invalid URL to load (after #load: in the address bar). It must include a protocol (https:// or http://)");
				return;
			}

			log("Switching to new session from #load: URL (to #local: URL with session ID)");
			// Note: could use into_existing_session=false on open_from_image_info instead of creating the new session beforehand
			end_current_session();
			change_url_param("local", generate_session_id());

			load_image_from_uri(url).then((info) => {
				open_from_image_info(info, null, null, true, true);
			}, show_resource_load_error_message);

		} else {
			/*log("No session ID in hash");
			const old_hash = location.hash;
			end_current_session();
			change_url_param("local", generate_session_id(), { replace_history_state: true });
			log("After replaceState:", location.hash);
			if (old_hash === location.hash) {
				// e.g. on Wayback Machine
				show_error_message("Autosave is disabled. Failed to update URL to start session.");
			} else {
				update_session_from_location_hash();
			}*/
			let href = window.location.href
			let url = new URL(href);
			let filePath = url.searchParams.get("path");
			let uri = url.protocol + "//" + url.host + filePath
			load_image_from_uri(uri).then((info) => {
				open_from_image_info(info, null, null, true, true);
			}, show_resource_load_error_message);
		}
	};
	window.update_session_from_location_hash = () => {
		update_session_from_location_hash();
	};
	/*PEERGOS
	$G.on("hashchange popstate change-url-params", e => {
		log(e.type, location.hash);
		update_session_from_location_hash();
	});
	log("Initializing with location hash:", location.hash);
	update_session_from_location_hash();

	window.new_local_session = () => {
		end_current_session();
		log("Changing URL to start new session...");
		change_url_param("local", generate_session_id());
	};

	// @TODO: Session GUI
	// @TODO: Indicate when the session ID is invalid
	// @TODO: Indicate when the session switches

	// @TODO: Indicate when there is no session!
	// Probably in app.js so as to handle the possibility of sessions.js failing to load.
	*/
})();

((exports) => {

	let seed = 4; // chosen later

	const seededRandom = (max = 1, min = 0) => {
		seed = (seed * 9301 + 49297) % 233280;
		const rnd = seed / 233280;

		return min + rnd * (max - min);
	};

	exports.stopSimulatingGestures && exports.stopSimulatingGestures();
	exports.simulatingGestures = false;

	let gestureTimeoutID;
	let periodicGesturesTimeoutID;

	let choose = (array) => array[~~(seededRandom() * array.length)];
	let isAnyMenuOpen = () => $(".menu-button.active").length > 0;

	let cursor_image = new Image();
	cursor_image.src = "images/cursors/default.png";

	const $cursor = $(cursor_image).addClass("user-cursor");
	$cursor.css({
		position: "absolute",
		left: 0,
		top: 0,
		opacity: 0,
		zIndex: 5, // @#: z-index
		pointerEvents: "none",
		transition: "opacity 0.5s",
	});

	exports.simulateRandomGesture = (callback, { shift, shiftToggleChance = 0.01, secondary, secondaryToggleChance, target = main_canvas }) => {
		let startWithinRect = target.getBoundingClientRect();
		let canvasAreaRect = $canvas_area[0].getBoundingClientRect();

		let startMinX = Math.max(startWithinRect.left, canvasAreaRect.left);
		let startMaxX = Math.min(startWithinRect.right, canvasAreaRect.right);
		let startMinY = Math.max(startWithinRect.top, canvasAreaRect.top);
		let startMaxY = Math.min(startWithinRect.bottom, canvasAreaRect.bottom);
		let startPointX = startMinX + seededRandom() * (startMaxX - startMinX);
		let startPointY = startMinY + seededRandom() * (startMaxY - startMinY);

		$cursor.appendTo($app);
		let triggerMouseEvent = (type, point) => {

			if (isAnyMenuOpen()) {
				return;
			}

			const clientX = point.x;
			const clientY = point.y;
			const el_over = document.elementFromPoint(clientX, clientY);
			const do_nothing = !type.match(/move/) && (!el_over || !el_over.closest(".canvas-area"));
			$cursor.css({
				display: "block",
				position: "absolute",
				left: clientX,
				top: clientY,
				opacity: do_nothing ? 0.5 : 1,
			});
			if (do_nothing) {
				return;
			}

			let event = new $.Event(type, {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX,
				clientY,
				screenX: clientX,
				screenY: clientY,
				offsetX: point.x,
				offsetY: point.y,
				button: secondary ? 2 : 0,
				buttons: secondary ? 2 : 1,
				shiftKey: shift,
			});
			$(target).trigger(event);
		};

		let t = 0;
		let gestureComponents = [];
		let numberOfComponents = 5;
		for (let i = 0; i < numberOfComponents; i += 1) {
			gestureComponents.push({
				rx:
					(seededRandom() * Math.min(canvasAreaRect.width, canvasAreaRect.height)) /
					2 /
					numberOfComponents,
				ry:
					(seededRandom() * Math.min(canvasAreaRect.width, canvasAreaRect.height)) /
					2 /
					numberOfComponents,
				angularFactor: seededRandom() * 5 - seededRandom(),
				angularOffset: seededRandom() * 5 - seededRandom(),
			});
		}
		const stepsInGesture = 50;
		let pointForTimeWithArbitraryStart = (t) => {
			let point = { x: 0, y: 0 };
			for (let i = 0; i < gestureComponents.length; i += 1) {
				let { rx, ry, angularFactor, angularOffset } = gestureComponents[i];
				point.x +=
					Math.sin(Math.PI * 2 * ((t / 2) * angularFactor + angularOffset)) *
					rx;
				point.y +=
					Math.cos(Math.PI * 2 * ((t / 2) * angularFactor + angularOffset)) *
					ry;
			}
			return point;
		};
		let pointForTime = (t) => {
			let point = pointForTimeWithArbitraryStart(t);
			let zeroPoint = pointForTimeWithArbitraryStart(0);
			point.x -= zeroPoint.x;
			point.y -= zeroPoint.y;
			point.x += startPointX;
			point.y += startPointY;
			return point;
		};

		triggerMouseEvent("pointerenter", pointForTime(t)); // so dynamic cursors follow the simulation cursor
		triggerMouseEvent("pointerdown", pointForTime(t));
		let move = () => {
			t += 1 / stepsInGesture;
			if (seededRandom() < shiftToggleChance) {
				shift = !shift;
			}
			if (seededRandom() < secondaryToggleChance) {
				secondary = !secondary;
			}
			if (t > 1) {
				triggerMouseEvent("pointerup", pointForTime(t));

				$cursor.remove();

				if (callback) {
					callback();
				}
			} else {
				triggerMouseEvent("pointermove", pointForTime(t));
				gestureTimeoutID = setTimeout(move, 10);
			}
		};
		triggerMouseEvent("pointerleave", pointForTime(t));
		move();
	};

	exports.simulateRandomGesturesPeriodically = () => {
		exports.simulatingGestures = true;

		if (window.drawRandomlySeed != null) {
			seed = window.drawRandomlySeed;
		} else {
			seed = ~~(Math.random() * 5000000);
		}
		window.console && console.log("Using seed:", seed);
		window.console && console.log("Note: Seeds are not guaranteed to work with different versions of the app, but within the same version it should produce the same results given the same starting document & other state & NO interference... except for airbrush randomness");
		window.console && console.log(`To use this seed:

			window.drawRandomlySeed = ${seed};
			document.body.style.width = "${getComputedStyle(document.body).width}";
			document.body.style.height = "${getComputedStyle(document.body).height}";
			simulateRandomGesturesPeriodically();
			delete window.drawRandomlySeed;

		`);

		let delayBetweenGestures = 500;
		let shiftStart = false;
		let shiftStartToggleChance = 0.1;
		let shiftToggleChance = 0.001;
		let secondaryStart = false;
		let secondaryStartToggleChance = 0.1;
		let secondaryToggleChance = 0.001;
		let switchToolsChance = 0.5;
		let multiToolsChance = 0.8;
		let pickColorChance = 0.5;
		let pickToolOptionsChance = 0.8;
		let scrollChance = 0.2;
		let dragSelectionChance = 0.8;

		// scroll randomly absolutely initially so the starting scroll doesn't play into whether a seed reproduces
		$canvas_area.scrollTop($canvas_area.width() * seededRandom());
		$canvas_area.scrollLeft($canvas_area.height() * seededRandom());

		let _simulateRandomGesture = (callback) => {
			exports.simulateRandomGesture(callback, {
				shift: shiftStart,
				shiftToggleChance,
				secondary: secondaryStart,
				secondaryToggleChance
			});
		};
		let waitThenGo = () => {
			// @TODO: a button to stop it as well (maybe make "stop drawing randomly" a link button?)
			$status_text.text("Press Esc to stop drawing randomly.");
			if (isAnyMenuOpen()) {
				periodicGesturesTimeoutID = setTimeout(waitThenGo, 50);
				return;
			}

			if (seededRandom() < shiftStartToggleChance) {
				shiftStart = !shiftStart;
			}
			if (seededRandom() < secondaryStartToggleChance) {
				secondaryStart = !secondaryStart;
			}
			if (seededRandom() < switchToolsChance) {
				let multiToolsPlz = seededRandom() < multiToolsChance;
				$(choose($(".tool, tool-button"))).trigger($.Event("click", { shiftKey: multiToolsPlz }));
			}
			if (seededRandom() < pickToolOptionsChance) {
				$(choose($(".tool-options *"))).trigger("click");
			}
			if (seededRandom() < pickColorChance) {
				// @TODO: maybe these should respond to a normal click?
				let secondary = seededRandom() < 0.5;
				const colorButton = choose($(".swatch, .color-button"));
				$(colorButton)
					.trigger($.Event("pointerdown", { button: secondary ? 2 : 0 }))
					.trigger($.Event("click", { button: secondary ? 2 : 0 }))
					.trigger($.Event("pointerup", { button: secondary ? 2 : 0 }));
			}
			if (seededRandom() < scrollChance) {
				let scrollAmount = (seededRandom() * 2 - 1) * 700;
				if (seededRandom() < 0.5) {
					$canvas_area.scrollTop($canvas_area.scrollTop() + scrollAmount);
				} else {
					$canvas_area.scrollLeft($canvas_area.scrollLeft() + scrollAmount);
				}
			}
			periodicGesturesTimeoutID = setTimeout(() => {
				_simulateRandomGesture(() => {
					if (selection && seededRandom() < dragSelectionChance) {
						exports.simulateRandomGesture(waitThenGo, {
							shift: shiftStart,
							shiftToggleChance,
							secondary: secondaryStart,
							secondaryToggleChance,
							target: selection.canvas
						});
					} else {
						waitThenGo();
					}
				});
			}, delayBetweenGestures);
		};
		_simulateRandomGesture(waitThenGo);
	};

	exports.stopSimulatingGestures = () => {
		if (exports.simulatingGestures) {
			clearTimeout(gestureTimeoutID);
			clearTimeout(periodicGesturesTimeoutID);
			exports.simulatingGestures = false;
			$status_text.default();
			$cursor.remove();
			cancel();
		}
		document.body.style.width = "";
		document.body.style.height = "";
	};

})(window);

((exports) => {

	let $help_window;
	function show_help() {
		/*if ($help_window) {
			$help_window.focus();
			return;
		}
		$help_window = open_help_viewer({
			title: localize("Paint Help"),
			root: "help",
			contentsFile: "help/mspaint.hhc",
		}).$help_window;
		$help_window.on("close", () => {
			$help_window = null;
		});*/
	}

	// shared code with 98.js.org
	// (copy-pasted / manually synced for now)

	function open_help_viewer(options) {
		const $help_window = $Window({
			title: options.title || "Help Topics",
			icons: {
				16: "images/chm-16x16.png",
			},
			resizable: true,
		})
		$help_window.addClass("help-window");

		let ignore_one_load = true;
		let back_length = 0;
		let forward_length = 0;

		const $main = $(E("div")).addClass("main");
		const $toolbar = $(E("div")).addClass("toolbar");
		const add_toolbar_button = (name, sprite_n, action_fn, enabled_fn) => {
			const $button = $("<button class='lightweight'>")
				.append($("<span>").text(name))
				.appendTo($toolbar)
				.on("click", () => {
					action_fn();
				});
			$("<div class='icon'/>")
				.appendTo($button)
				.css({
					backgroundPosition: `${-sprite_n * 55}px 0px`,
				});
			const update_enabled = () => {
				$button[0].disabled = enabled_fn && !enabled_fn();
			};
			update_enabled();
			$help_window.on("click", "*", update_enabled);
			$help_window.on("update-buttons", update_enabled);
			return $button;
		};
		const measure_sidebar_width = () =>
			$contents.outerWidth() +
			parseFloat(getComputedStyle($contents[0]).getPropertyValue("margin-left")) +
			parseFloat(getComputedStyle($contents[0]).getPropertyValue("margin-right")) +
			$resizer.outerWidth();
		const $hide_button = add_toolbar_button("Hide", 0, () => {
			const toggling_width = measure_sidebar_width();
			$contents.hide();
			$resizer.hide();
			$hide_button.hide();
			$show_button.show();
			$help_window.width($help_window.width() - toggling_width);
			$help_window.css("left", $help_window.offset().left + toggling_width);
			$help_window.bringTitleBarInBounds();
		});
		const $show_button = add_toolbar_button("Show", 5, () => {
			$contents.show();
			$resizer.show();
			$show_button.hide();
			$hide_button.show();
			const toggling_width = measure_sidebar_width();
			$help_window.css("max-width", "unset");
			$help_window.width($help_window.width() + toggling_width);
			$help_window.css("left", $help_window.offset().left - toggling_width);
			// $help_window.applyBounds() would push the window to fit (before trimming it only if needed)
			// Trim the window to fit (especially for if maximized)
			if ($help_window.offset().left < 0) {
				$help_window.width($help_window.width() + $help_window.offset().left);
				$help_window.css("left", 0);
			}
			$help_window.css("max-width", "");
		}).hide();
		add_toolbar_button("Back", 1, () => {
			$iframe[0].contentWindow.history.back();
			ignore_one_load = true;
			back_length -= 1;
			forward_length += 1;
		}, () => back_length > 0);
		add_toolbar_button("Forward", 2, () => {
			$iframe[0].contentWindow.history.forward();
			ignore_one_load = true;
			forward_length -= 1;
			back_length += 1;
		}, () => forward_length > 0);
		add_toolbar_button("Options", 3, () => { }, () => false); // @TODO: hotkey and underline on O
		add_toolbar_button("Web Help", 4, () => {
			iframe.src = "help/online_support.htm";
		});

		const $iframe = $Iframe({ src: "help/default.html" }).addClass("inset-deep");
		const iframe = $iframe[0];
		iframe.$window = $help_window; // for focus handling integration
		const $resizer = $(E("div")).addClass("resizer");
		const $contents = $(E("ul")).addClass("contents inset-deep");

		// @TODO: fix race conditions
		$iframe.on("load", () => {
			if (!ignore_one_load) {
				back_length += 1;
				forward_length = 0;
			}
			// iframe.contentWindow.location.href
			ignore_one_load = false;
			$help_window.triggerHandler("update-buttons");
		});

		$main.append($contents, $resizer, $iframe);
		$help_window.$content.append($toolbar, $main);

		$help_window.css({ width: 800, height: 600 });

		$iframe.attr({ name: "help-frame" });
		$iframe.css({
			backgroundColor: "white",
			border: "",
			margin: "1px",
		});
		$contents.css({
			margin: "1px",
		});
		$help_window.center();

		$main.css({
			position: "relative", // for resizer
		});

		const resizer_width = 4;
		$resizer.css({
			cursor: "ew-resize",
			width: resizer_width,
			boxSizing: "border-box",
			background: "var(--ButtonFace)",
			borderLeft: "1px solid var(--ButtonShadow)",
			boxShadow: "inset 1px 0 0 var(--ButtonHilight)",
			top: 0,
			bottom: 0,
			zIndex: 1,
		});
		$resizer.on("pointerdown", (e) => {
			let pointermove, pointerup;
			const getPos = (e) =>
				Math.min($help_window.width() - 100, Math.max(20,
					e.clientX - $help_window.$content.offset().left
				));
			$G.on("pointermove", pointermove = (e) => {
				$resizer.css({
					position: "absolute",
					left: getPos(e)
				});
				$contents.css({
					marginRight: resizer_width,
				});
			});
			$G.on("pointerup", pointerup = (e) => {
				$G.off("pointermove", pointermove);
				$G.off("pointerup", pointerup);
				$resizer.css({
					position: "",
					left: ""
				});
				$contents.css({
					flexBasis: getPos(e) - resizer_width,
					marginRight: "",
				});
			});
		});

		const parse_object_params = $object => {
			// parse an $(<object>) to a plain object of key value pairs
			const object = {};
			for (const param of $object.children("param").get()) {
				object[param.name] = param.value;
			}
			return object;
		};

		let $last_expanded;

		const $Item = text => {
			const $item = $(E("div")).addClass("item").text(text.trim());
			$item.on("mousedown", () => {
				$contents.find(".item").removeClass("selected");
				$item.addClass("selected");
			});
			$item.on("click", () => {
				const $li = $item.parent();
				if ($li.is(".folder")) {
					if ($last_expanded) {
						$last_expanded.not($li).removeClass("expanded");
					}
					$li.toggleClass("expanded");
					$last_expanded = $li;
				}
			});
			return $item;
		};

		const $default_item_li = $(E("li")).addClass("page");
		$default_item_li.append($Item("Welcome to Help").on("click", () => {
			$iframe.attr({ src: "help/default.html" });
		}));
		$contents.append($default_item_li);

		function renderItem(source_li, $folder_items_ul) {
			const object = parse_object_params($(source_li).children("object"));
			if ($(source_li).find("li").length > 0) {

				const $folder_li = $(E("li")).addClass("folder");
				$folder_li.append($Item(object.Name));
				$contents.append($folder_li);

				const $folder_items_ul = $(E("ul"));
				$folder_li.append($folder_items_ul);

				$(source_li).children("ul").children().get().forEach((li) => {
					renderItem(li, $folder_items_ul);
				});
			} else {
				const $item_li = $(E("li")).addClass("page");
				$item_li.append($Item(object.Name).on("click", () => {
					$iframe.attr({ src: `${options.root}/${object.Local}` });
				}));
				if ($folder_items_ul) {
					$folder_items_ul.append($item_li);
				} else {
					$contents.append($item_li);
				}
			}
		}

		fetch(options.contentsFile).then((response) => {
			response.text().then((hhc) => {
				$($.parseHTML(hhc)).filter("ul").children().get().forEach((li) => {
					renderItem(li, null);
				});
			}, (error) => {
				show_error_message(`${localize("Failed to launch help.")} Failed to read ${options.contentsFile}.`, error);
			});
		}, (/* error */) => {
			// access to error message is not allowed either, basically
			if (location.protocol === "file:") {
				showMessageBox({
					// <p>${localize("Failed to launch help.")}</p>
					// but it's already launched at this point

					// what's a good tutorial for starting a web server?
					// https://gist.github.com/willurd/5720255 - impressive list, but not a tutorial
					// https://attacomsian.com/blog/local-web-server - OK, good enough
					messageHTML: `
					<p>Help is not available when running from the <code>file:</code> protocol.</p>
					<p>To use this feature, <a href="https://attacomsian.com/blog/local-web-server">start a web server</a>.</p>
				`,
					iconID: "error",
				});
			} else {
				show_error_message(`${localize("Failed to launch help.")} ${localize("Access to %1 was denied.", options.contentsFile)}`);
			}
		});

		// @TODO: keyboard accessability
		// $help_window.on("keydown", (e)=> {
		// 	switch(e.keyCode){
		// 		case 37:
		// 			show_error_message("MOVE IT");
		// 			break;
		// 	}
		// });
		// var task = new Task($help_window);
		var task = {};
		task.$help_window = $help_window;
		return task;
	}


	var programs_being_loaded = 0;

	function $Iframe(options) {
		var $iframe = $("<iframe allowfullscreen sandbox='allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-modals allow-popups allow-downloads'>");
		var iframe = $iframe[0];

		var disable_delegate_pointerup = false;

		$iframe.focus_contents = function () {
			if (!iframe.contentWindow) {
				return;
			}
			if (iframe.contentDocument.hasFocus()) {
				return;
			}

			disable_delegate_pointerup = true;
			iframe.contentWindow.focus();
			setTimeout(function () {
				iframe.contentWindow.focus();
				disable_delegate_pointerup = false;
			});
		};

		// Let the iframe to handle mouseup events outside itself
		var delegate_pointerup = function () {
			if (disable_delegate_pointerup) {
				return;
			}
			// This try-catch may only be needed for running Cypress tests.
			try {
				if (iframe.contentWindow && iframe.contentWindow.jQuery) {
					iframe.contentWindow.jQuery("body").trigger("pointerup");
				}
				if (iframe.contentWindow) {
					const event = new iframe.contentWindow.MouseEvent("mouseup", { button: 0 });
					iframe.contentWindow.dispatchEvent(event);
					const event2 = new iframe.contentWindow.MouseEvent("mouseup", { button: 2 });
					iframe.contentWindow.dispatchEvent(event2);
				}
			} catch (error) {
				console.log("Failed to access iframe to delegate pointerup; got", error);
			}
		};
		$G.on("mouseup blur", delegate_pointerup);
		$iframe.destroy = () => {
			$G.off("mouseup blur", delegate_pointerup);
		};

		// @TODO: delegate pointermove events too?

		$("body").addClass("loading-program");
		programs_being_loaded += 1;

		$iframe.on("load", function () {

			if (--programs_being_loaded <= 0) {
				$("body").removeClass("loading-program");
			}

			// This try-catch may only be needed for running Cypress tests.
			try {
				if (window.themeCSSProperties) {
					applyTheme(themeCSSProperties, iframe.contentDocument.documentElement);
				}

				// on Wayback Machine, and iframe's url not saved yet
				if (iframe.contentDocument.querySelector("#error #livewebInfo.available")) {
					var message = document.createElement("div");
					message.style.position = "absolute";
					message.style.left = "0";
					message.style.right = "0";
					message.style.top = "0";
					message.style.bottom = "0";
					message.style.background = "#c0c0c0";
					message.style.color = "#000";
					message.style.padding = "50px";
					iframe.contentDocument.body.appendChild(message);
					message.innerHTML = `<a target="_blank">Save this url in the Wayback Machine</a>`;
					message.querySelector("a").href =
						"https://web.archive.org/save/https://98.js.org/" +
						iframe.src.replace(/.*https:\/\/98.js.org\/?/, "");
					message.querySelector("a").style.color = "blue";
				}

				var $contentWindow = $(iframe.contentWindow);
				$contentWindow.on("pointerdown click", function (e) {
					iframe.$window && iframe.$window.focus();

					// from close_menus in $MenuBar
					$(".menu-button").trigger("release");
					// Close any rogue floating submenus
					$(".menu-popup").hide();
				});
				// We want to disable pointer events for other iframes, but not this one
				$contentWindow.on("pointerdown", function (e) {
					$iframe.css("pointer-events", "all");
					$("body").addClass("dragging");
				});
				$contentWindow.on("pointerup", function (e) {
					$("body").removeClass("dragging");
					$iframe.css("pointer-events", "");
				});
				// $("iframe").css("pointer-events", ""); is called elsewhere.
				// Otherwise iframes would get stuck in this interaction mode

				iframe.contentWindow.close = function () {
					iframe.$window && iframe.$window.close();
				};
				// @TODO: hook into saveAs (a la FileSaver.js) and another function for opening files
				// iframe.contentWindow.saveAs = function(){
				// 	saveAsDialog();
				// };

			} catch (error) {
				console.log("Failed to reach into iframe; got", error);
			}
		});
		if (options.src) {
			$iframe.attr({ src: options.src });
		}
		$iframe.css({
			minWidth: 0,
			minHeight: 0, // overrides user agent styling apparently, fixes Sound Recorder
			flex: 1,
			border: 0, // overrides user agent styling
		});

		return $iframe;
	}

	// function $IframeWindow(options) {

	// 	var $win = new $Window(options);

	// 	var $iframe = $win.$iframe = $Iframe({ src: options.src });
	// 	$win.$content.append($iframe);
	// 	var iframe = $win.iframe = $iframe[0];
	// 	// @TODO: should I instead of having iframe.$window, have something like get$Window?
	// 	// Where all is $window needed?
	// 	// I know it's used from within the iframe contents as frameElement.$window
	// 	iframe.$window = $win;

	// 	$win.on("close", function () {
	// 		$iframe.destroy();
	// 	});
	// 	$win.onFocus($iframe.focus_contents);

	// 	$iframe.on("load", function () {
	// 		$win.show();
	// 		$win.focus();
	// 		// $iframe.focus_contents();
	// 	});

	// 	$win.setInnerDimensions = ({ width, height }) => {
	// 		const width_from_frame = $win.width() - $win.$content.width();
	// 		const height_from_frame = $win.height() - $win.$content.height();
	// 		$win.css({
	// 			width: width + width_from_frame,
	// 			height: height + height_from_frame + 21,
	// 		});
	// 	};
	// 	$win.setInnerDimensions({
	// 		width: (options.innerWidth || 640),
	// 		height: (options.innerHeight || 380),
	// 	});
	// 	$win.$content.css({
	// 		display: "flex",
	// 		flexDirection: "column",
	// 	});

	// 	// @TODO: cascade windows
	// 	$win.center();
	// 	$win.hide();

	// 	return $win;
	// }

	// Fix dragging things (i.e. windows) over iframes (i.e. other windows)
	// (when combined with a bit of css, .dragging iframe { pointer-events: none; })
	// (and a similar thing in $IframeWindow)
	$(window).on("pointerdown", function (e) {
		//console.log(e.type);
		$("body").addClass("dragging");
	});
	$(window).on("pointerup dragend blur", function (e) {
		//console.log(e.type);
		if (e.type === "blur") {
			if (document.activeElement.tagName.match(/iframe/i)) {
				return;
			}
		}
		$("body").removeClass("dragging");
		$("iframe").css("pointer-events", "");
	});

	exports.show_help = show_help;

})(window);

((exports) => {

	let $storage_manager;
	let $quota_exceeded_window;
	let ignoring_quota_exceeded = false;

	async function storage_quota_exceeded() {
		if ($quota_exceeded_window) {
			$quota_exceeded_window.close();
			$quota_exceeded_window = null;
		}
		if (ignoring_quota_exceeded) {
			return;
		}
		const { promise, $window } = showMessageBox({
			title: "Storage Error",
			messageHTML: `
			<p>JS Paint stores images as you work on them so that if you close your browser or tab or reload the page your images are usually safe.</p>
			<p>However, it has run out of space to do so.</p>
			<p>You can still save the current image with <b>File > Save</b>. You should save frequently, or free up enough space to keep the image safe.</p>
		`,
			buttons: [
				{ label: "Manage Storage", value: "manage", default: true },
				{ label: "Ignore", value: "ignore" },
			],
			iconID: "warning",
		});
		$quota_exceeded_window = $window;
		const result = await promise;
		if (result === "ignore") {
			ignoring_quota_exceeded = true;
		} else if (result === "manage") {
			ignoring_quota_exceeded = false;
			manage_storage();
		}
	}

	function manage_storage() {
		if ($storage_manager) {
			$storage_manager.close();
		}
		$storage_manager = $DialogWindow().title("Manage Storage").addClass("storage-manager squish");
		// @TODO: way to remove all (with confirmation)
		const $table = $(E("table")).appendTo($storage_manager.$main);
		const $message = $(E("p")).appendTo($storage_manager.$main).html(
			"Any images you've saved to your computer with <b>File > Save</b> will not be affected."
		);
		$storage_manager.$Button("Close", () => {
			$storage_manager.close();
		});

		const addRow = (k, imgSrc) => {
			const $tr = $(E("tr")).appendTo($table);

			const $img = $(E("img")).attr({ src: imgSrc }).addClass("thumbnail-img");
			const $remove = $(E("button")).text("Remove").addClass("remove-button");
			const href = `#${k.replace("image#", "local:")}`;
			const $open_link = $(E("a")).attr({ href, target: "_blank" }).text(localize("Open"));
			const $thumbnail_open_link = $(E("a")).attr({ href, target: "_blank" }).addClass("thumbnail-container");
			$thumbnail_open_link.append($img);
			$(E("td")).append($thumbnail_open_link).appendTo($tr);
			$(E("td")).append($open_link).appendTo($tr);
			$(E("td")).append($remove).appendTo($tr);

			$remove.on("click", () => {
				localStorage.removeItem(k);
				$tr.remove();
				if ($table.find("tr").length == 0) {
					$message.html("<p>All clear!</p>");
				}
			});
		};

		let localStorageAvailable = false;
		try {
			if (localStorage.length > 0) {
				// This is needed in case it's COMPLETELY full.
				// Test with https://stackoverflow.com/questions/45760110/how-to-fill-javascript-localstorage-to-its-max-capacity-quickly
				// Of course, this dialog only manages images, not other data (for now anyway).
				localStorageAvailable = true;
			} else {
				localStorage._available = true;
				localStorageAvailable = localStorage._available;
				delete localStorage._available;
			}
			// eslint-disable-next-line no-empty
		} catch (e) { }

		if (localStorageAvailable) {
			for (const k in localStorage) {
				if (k.match(/^image#/)) {
					let v = localStorage[k];
					try {
						if (v[0] === '"') {
							v = JSON.parse(v);
						}
						// eslint-disable-next-line no-empty
					} catch (e) { }
					addRow(k, v);
				}
			}
		}

		if (!localStorageAvailable) {
			// @TODO: DRY with similar message
			// @TODO: instructions for your browser; it's called Cookies in chrome/chromium at least, and "storage" gives NO results
			$message.html("<p>Please enable local storage in your browser's settings for local backup. It may be called Cookies, Storage, or Site Data.</p>");
		} else if ($table.find("tr").length == 0) {
			$message.html("<p>All clear!</p>");
		}

		$storage_manager.$content.width(450);
		$storage_manager.center();

		$storage_manager.find(".remove-button").focus();
	}

	exports.storage_quota_exceeded = storage_quota_exceeded;
	exports.manage_storage = manage_storage;

})(window);

((exports) => {

	// @TODO:
	// - Persist custom colors list across reloads? It's not very persistent in real Windows...
	// - OK with Enter, after selecting a focused color if applicable
	// - maybe use https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Grid_Role
	// - Question mark button in titlebar that lets you click on parts of UI to ask about them; also context menu "What's this?"
	// - For mobile layout, maybe add a way to get back (<<) without adding (potentially overwriting) a custom color
	// - Speech recognition
	//   - Lum as Luminosity, Luminance, Lightness, maybe even Brightness
	//   - Sat as Saturation
	//   - Add / Add Color / Add Custom Color for Add To Custom Colors or if not available then Define Custom Colors >>
	//   - Set green to 50 etc.

	// In Windows, the Hue goes from 0 to 239 (240 being equivalent to 0), and Sat and Lum go from 0 to 240
	// I think people are more familiar with degrees and percentages, so I don't think I'll be implementing that.

	// Development workflow:
	// - In the console, set localStorage.dev_edit_colors = "true";
	// - Reload the page
	// - Load a screenshot of the Edit Colors window into the editor
	// - Position it finely using the arrow keys on a selection
	// - For measuring positions, look at the Windows source code OR:
	//   - close the window,
	//   - point on the canvas, mark down the coordinates shown in status bar,
	//   - point on the canvas at the origin
	//     - the top left of the inside of the window, or
	//     - the top left of (what corresponds to) the nearest parent position:fixed/absolute/relative
	//   - subtract the origin from the target

	let $edit_colors_window;

	let dev_edit_colors = false;
	try {
		dev_edit_colors = localStorage.dev_edit_colors === "true";
		// eslint-disable-next-line no-empty
	} catch (error) { }
	if (dev_edit_colors) {
		$(() => {
			show_edit_colors_window();
			$(".define-custom-colors-button").click();
			$edit_colors_window.css({
				left: 80,
				top: 50,
				opacity: 0.5,
			});
		});
	}

	// Paint-specific handling of color picking
	// Note: It always updates a cell in the palette and one of the color selections.
	// When the dialog is opened, it always starts* with one of the color selections,
	// which lets you use the color picker and then add a custom color based on that.
	// *It may not show the color in the grid, but it will in the custom colors area.
	function show_edit_colors_window($swatch_to_edit, color_selection_slot_to_edit) {
		// console.log($swatch_to_edit, $colorbox.data("$last_fg_color_button"));
		$swatch_to_edit = $swatch_to_edit || $colorbox.data("$last_fg_color_button");
		color_selection_slot_to_edit = color_selection_slot_to_edit || "foreground";

		const $palette = $swatch_to_edit.closest(".palette, .color-box");
		const swatch_index = $palette.find(".swatch").toArray().indexOf($swatch_to_edit[0]);
		const initial_color = selected_colors[color_selection_slot_to_edit];
		choose_color(initial_color, (color) => {
			// The palette may have changed or rerendered due to switching themes,
			// toggling vertical color box mode, or monochrome document mode.
			$swatch_to_edit = $($palette.find(".swatch")[swatch_index]);
			if (!$swatch_to_edit.length) {
				show_error_message("Swatch no longer exists.");
				return;
			}

			if (monochrome && (swatch_index === 0 || swatch_index === 14)) {
				// when editing first color in first or second row (the solid base colors),
				// update whole monochrome patterns palette and image
				let old_rgba = get_rgba_from_color(palette[swatch_index]);
				const new_rgba = get_rgba_from_color(color);
				const other_rgba = get_rgba_from_color(palette[14 - swatch_index]);
				const main_monochrome_info = detect_monochrome(main_ctx);
				const selection_monochrome_info = (selection && selection.canvas) ? detect_monochrome(selection.canvas.ctx) : main_monochrome_info;
				const selection_matches_main_canvas_colors =
					selection_monochrome_info.isMonochrome &&
					selection_monochrome_info.presentNonTransparentRGBAs.every((rgba) =>
						main_monochrome_info.presentNonTransparentRGBAs.map(rgba => rgba.toString()).includes(rgba.toString())
					);
				if (
					main_monochrome_info.isMonochrome &&
					selection_monochrome_info.isMonochrome &&
					selection_matches_main_canvas_colors
				) {
					const recolor = (ctx, present_rgbas) => {
						// HTML5 Canvas API is unreliable for exact colors.
						// 1. The specifications specify unpremultiplied alpha, but in practice browsers use premultiplied alpha for performance.
						// 2. Some browsers implement protections against fingerprinting that return slightly random data
						// 3. There may be color profiles that affect returned pixel values vs color table values when loading images.
						//    (BMPs are supposed to be able to embed ICC profiles although I doubt it's prevalent.
						//    Some global system color profile might apply however, I don't know how all that works.)
						if (
							present_rgbas.length === 2 &&
							present_rgbas.every((present_rgba) => `${present_rgba}` !== `${old_rgba}`)
						) {
							// Find the nearer color in the image data to replace.
							const distances = present_rgbas.map((rgba) =>
								Math.abs(rgba[0] - old_rgba[0]) +
								Math.abs(rgba[1] - old_rgba[1]) +
								Math.abs(rgba[2] - old_rgba[2]) +
								Math.abs(rgba[3] - old_rgba[3])
							);
							if (distances[0] < distances[1]) {
								old_rgba = present_rgbas[0];
							} else {
								old_rgba = present_rgbas[1];
							}
						}
						const image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
						replace_color_globally(image_data, old_rgba[0], old_rgba[1], old_rgba[2], old_rgba[3], new_rgba[0], new_rgba[1], new_rgba[2], new_rgba[3]);
						ctx.putImageData(image_data, 0, 0);
					};
					undoable({
						name: "Recolor",
						icon: get_help_folder_icon("p_color.png"),
					}, () => {
						recolor(main_ctx, main_monochrome_info.presentNonTransparentRGBAs);
						if (selection && selection.canvas) {
							recolor(selection.canvas.ctx, selection_monochrome_info.presentNonTransparentRGBAs);
							// I feel like this shouldn't be necessary, if I'm not changing the size, but it makes it work:
							selection.replace_source_canvas(selection.canvas);
						}
					});
				}
				if (swatch_index) {
					palette = make_monochrome_palette(other_rgba, new_rgba);
				} else {
					palette = make_monochrome_palette(new_rgba, other_rgba);
				}
				$colorbox.rebuild_palette();
				selected_colors.foreground = palette[0];
				selected_colors.background = palette[14]; // first in second row
				selected_colors.ternary = "";
				$G.triggerHandler("option-changed");
			} else {
				palette[swatch_index] = color;
				update_$swatch($swatch_to_edit, color);
				selected_colors[color_selection_slot_to_edit] = color;
				$G.triggerHandler("option-changed");
				window.console && console.log(`Updated palette: ${palette.map(() => `%c█`).join("")}`, ...palette.map((color) => `color: ${color};`));
			}
		});
	}

	// Repurposable color picker modeled after the Windows system color picker
	function choose_color(initial_color, callback) {
		if ($edit_colors_window) {
			$edit_colors_window.close();
		}
		const $w = new $DialogWindow(localize("Edit Colors"));
		$w.addClass("edit-colors-window");
		$edit_colors_window = $w;

		let hue_degrees = 0;
		let sat_percent = 50;
		let lum_percent = 50;

		let custom_colors_index = 0;

		const get_current_color = () => `hsl(${hue_degrees}deg, ${sat_percent}%, ${lum_percent}%)`;
		const set_color_from_rgb = (r, g, b) => {
			const [h, s, l] = rgb_to_hsl(r, g, b);
			hue_degrees = h * 360;
			sat_percent = s * 100;
			lum_percent = l * 100;
		};
		const set_color = (color) => {
			const [r, g, b] = get_rgba_from_color(color);
			set_color_from_rgb(r, g, b);
		};
		const select = ($swatch) => {
			$w.$content.find(".swatch").removeClass("selected");
			$swatch.addClass("selected");
			set_color($swatch[0].dataset.color);
			if ($swatch.closest("#custom-colors")) {
				custom_colors_index = Math.max(0, custom_colors_swatches_list_order.indexOf(
					$custom_colors_grid.find(".swatch.selected")[0]
				));
			}
			update_inputs("hslrgb");
		};

		const make_color_grid = (colors, id) => {
			const $color_grid = $(`<div class="color-grid" tabindex="0">`).attr({ id });
			for (const color of colors) {
				const $swatch = $Swatch(color);
				$swatch.appendTo($color_grid).addClass("inset-deep");
				$swatch.attr("tabindex", -1); // can be focused by clicking or calling focus() but not by tabbing
			}
			let $local_last_focus = $color_grid.find(".swatch:first-child");
			const num_colors_per_row = 8;
			const navigate = (relative_index) => {
				const $focused = $color_grid.find(".swatch:focus");
				if (!$focused.length) { return; }
				const $swatches = $color_grid.find(".swatch");
				const from_index = $swatches.toArray().indexOf($focused[0]);
				if (relative_index === -1 && (from_index % num_colors_per_row) === 0) { return; }
				if (relative_index === +1 && (from_index % num_colors_per_row) === num_colors_per_row - 1) { return; }
				const to_index = from_index + relative_index;
				const $to_focus = $($swatches.toArray()[to_index]);
				// console.log({from_index, to_index, $focused, $to_focus});
				if (!$to_focus.length) { return; }
				$to_focus.focus();
			};
			$color_grid.on("keydown", (event) => {
				// console.log(event.code);
				if (event.code === "ArrowRight") { navigate(+1); }
				if (event.code === "ArrowLeft") { navigate(-1); }
				if (event.code === "ArrowDown") { navigate(+num_colors_per_row); }
				if (event.code === "ArrowUp") { navigate(-num_colors_per_row); }
				if (event.code === "Home") { $color_grid.find(".swatch:first-child").focus(); }
				if (event.code === "End") { $color_grid.find(".swatch:last-child").focus(); }
				if (event.code === "Space" || event.code === "Enter") {
					select($color_grid.find(".swatch:focus"));
					draw();
				}
			});
			$color_grid.on("pointerdown", (event) => {
				const $swatch = $(event.target).closest(".swatch");
				if ($swatch.length) {
					select($swatch);
					draw();
				}
			});
			$color_grid.on("dragstart", (event) => {
				event.preventDefault();
			});
			$color_grid.on("focusin", (event) => {
				if (event.target.closest(".swatch")) {
					$local_last_focus = $(event.target.closest(".swatch"));
				} else {
					if (!$local_last_focus.is(":focus")) { // prevent infinite recursion
						$local_last_focus.focus();
					}
				}
				// allow shift+tabbing out of the control
				// otherwise it keeps setting focus back to the color cell,
				// since the parent grid is previous in the tab order
				$color_grid.attr("tabindex", -1);
			});
			$color_grid.on("focusout", (event) => {
				$color_grid.attr("tabindex", 0);
			});
			return $color_grid;
		};
		const $left_right_split = $(`<div class="left-right-split">`).appendTo($w.$main);
		const $left = $(`<div class="left-side">`).appendTo($left_right_split);
		const $right = $(`<div class="right-side">`).appendTo($left_right_split).hide();
		$left.append(`<label for="basic-colors">${display_hotkey("&Basic colors:")}</label>`);
		const $basic_colors_grid = make_color_grid(basic_colors, "basic-colors").appendTo($left);
		$left.append(`<label for="custom-colors">${display_hotkey("&Custom colors:")}</label>`);
		const custom_colors_dom_order = []; // (wanting) horizontal top to bottom
		for (let list_index = 0; list_index < custom_colors.length; list_index++) {
			const row = list_index % 2;
			const column = Math.floor(list_index / 2);
			const dom_index = row * 8 + column;
			custom_colors_dom_order[dom_index] = custom_colors[list_index];
		}
		const $custom_colors_grid = make_color_grid(custom_colors_dom_order, "custom-colors").appendTo($left);
		const custom_colors_swatches_dom_order = $custom_colors_grid.find(".swatch").toArray(); // horizontal top to bottom
		const custom_colors_swatches_list_order = []; // (wanting) vertical left to right
		for (let dom_index = 0; dom_index < custom_colors_swatches_dom_order.length; dom_index++) {
			const row = Math.floor(dom_index / 8);
			const column = dom_index % 8;
			const list_index = column * 2 + row;
			custom_colors_swatches_list_order[list_index] = custom_colors_swatches_dom_order[dom_index];
			// custom_colors_swatches_list_order[list_index].textContent = list_index; // visualization
		}

		const $define_custom_colors_button = $(`<button class="define-custom-colors-button">`)
			.html(display_hotkey("&Define Custom Colors >>"))
			.appendTo($left)
			.on("click", (e) => {
				// prevent the form from submitting
				// @TODO: instead, prevent the form's submit event in $Window.js in os-gui (or don't have a form? idk)
				e.preventDefault();

				$right.show();
				$w.addClass("defining-custom-colors"); // for mobile layout
				$define_custom_colors_button.attr("disabled", "disabled");
				// assuming small viewport implies mobile implies an onscreen keyboard,
				// and that you probably don't want to use the keyboard to choose colors
				if ($w.width() >= 300) {
					inputs_by_component_letter.h.focus();
				}
				maybe_reenable_button_for_mobile_navigation();
			});

		// for mobile layout, re-enable button because it's a navigation button in that case, rather than one-time expand action
		const maybe_reenable_button_for_mobile_navigation = () => {
			// if ($right.is(":hidden")) {
			if ($w.width() < 300 || document.body.classList.contains("eye-gaze-mode")) {
				$define_custom_colors_button.removeAttr("disabled");
			}
		};
		$(window).on("resize", maybe_reenable_button_for_mobile_navigation);

		const $color_solid_label = $(`<label for="color-solid-canvas">${display_hotkey("Color|S&olid")}</label>`);
		$color_solid_label.css({
			position: "absolute",
			left: 10,
			top: 244,
		});

		const rainbow_canvas = make_canvas(175, 187);
		const luminosity_canvas = make_canvas(10, 187);
		const result_canvas = make_canvas(58, 40);
		const lum_arrow_canvas = make_canvas(5, 9);

		$(result_canvas).css({
			position: "absolute",
			left: 10,
			top: 198,
		});

		let mouse_down_on_rainbow_canvas = false;
		let crosshair_shown_on_rainbow_canvas = false;
		const draw = () => {
			if (!mouse_down_on_rainbow_canvas || crosshair_shown_on_rainbow_canvas) {
				// rainbow
				for (let y = 0; y < rainbow_canvas.height; y += 6) {
					for (let x = -1; x < rainbow_canvas.width; x += 3) {
						rainbow_canvas.ctx.fillStyle = `hsl(${x / rainbow_canvas.width * 360}deg, ${(1 - y / rainbow_canvas.height) * 100}%, 50%)`;
						rainbow_canvas.ctx.fillRect(x, y, 3, 6);
					}
				}
				// crosshair
				if (!mouse_down_on_rainbow_canvas) {
					const x = ~~(hue_degrees / 360 * rainbow_canvas.width);
					const y = ~~((1 - sat_percent / 100) * rainbow_canvas.height);
					rainbow_canvas.ctx.fillStyle = "black";
					rainbow_canvas.ctx.fillRect(x - 1, y - 9, 3, 5);
					rainbow_canvas.ctx.fillRect(x - 1, y + 5, 3, 5);
					rainbow_canvas.ctx.fillRect(x - 9, y - 1, 5, 3);
					rainbow_canvas.ctx.fillRect(x + 5, y - 1, 5, 3);
				}
				crosshair_shown_on_rainbow_canvas = !mouse_down_on_rainbow_canvas;
			}

			for (let y = -2; y < luminosity_canvas.height; y += 6) {
				luminosity_canvas.ctx.fillStyle = `hsl(${hue_degrees}deg, ${sat_percent}%, ${(1 - y / luminosity_canvas.height) * 100}%)`;
				luminosity_canvas.ctx.fillRect(0, y, luminosity_canvas.width, 6);
			}

			lum_arrow_canvas.ctx.fillStyle = getComputedStyle($w.$content[0]).getPropertyValue("--ButtonText");
			for (let x = 0; x < lum_arrow_canvas.width; x++) {
				lum_arrow_canvas.ctx.fillRect(x, lum_arrow_canvas.width - x - 1, 1, 1 + x * 2);
			}
			lum_arrow_canvas.style.position = "absolute";
			lum_arrow_canvas.style.left = "215px";
			lum_arrow_canvas.style.top = `${3 + ~~((1 - lum_percent / 100) * luminosity_canvas.height)}px`;

			result_canvas.ctx.fillStyle = get_current_color();
			result_canvas.ctx.fillRect(0, 0, result_canvas.width, result_canvas.height);
		};
		draw();
		$(rainbow_canvas).addClass("rainbow-canvas inset-shallow");
		$(luminosity_canvas).addClass("luminosity-canvas inset-shallow");
		$(result_canvas).addClass("result-color-canvas inset-shallow").attr("id", "color-solid-canvas");

		const select_hue_sat = (event) => {
			hue_degrees = Math.min(1, Math.max(0, event.offsetX / rainbow_canvas.width)) * 360;
			sat_percent = Math.min(1, Math.max(0, (1 - event.offsetY / rainbow_canvas.height))) * 100;
			update_inputs("hsrgb");
			draw();
			event.preventDefault();
		};
		$(rainbow_canvas).on("pointerdown", (event) => {
			mouse_down_on_rainbow_canvas = true;
			select_hue_sat(event);

			$(rainbow_canvas).on("pointermove", select_hue_sat);
			if (event.pointerId !== 1234567890) { // for Eye Gaze Mode simulated clicks
				rainbow_canvas.setPointerCapture(event.pointerId);
			}
		});
		$G.on("pointerup pointercancel", (event) => {
			$(rainbow_canvas).off("pointermove", select_hue_sat);
			// rainbow_canvas.releasePointerCapture(event.pointerId);
			mouse_down_on_rainbow_canvas = false;
			draw();
		});

		const select_lum = (event) => {
			lum_percent = Math.min(1, Math.max(0, (1 - event.offsetY / luminosity_canvas.height))) * 100;
			update_inputs("lrgb");
			draw();
			event.preventDefault();
		};
		$(luminosity_canvas).on("pointerdown", (event) => {
			select_lum(event);

			$(luminosity_canvas).on("pointermove", select_lum);
			if (event.pointerId !== 1234567890) { // for Eye Gaze Mode simulated clicks
				luminosity_canvas.setPointerCapture(event.pointerId);
			}
		});
		$G.on("pointerup pointercancel", (event) => {
			$(luminosity_canvas).off("pointermove", select_lum);
			// luminosity_canvas.releasePointerCapture(event.pointerId);
		});

		const inputs_by_component_letter = {};

		["hsl", "rgb"].forEach((color_model, color_model_index) => {
			[...color_model].forEach((component_letter, component_index) => {
				const text_with_hotkey = {
					h: "Hu&e:",
					s: "&Sat:",
					l: "&Lum:",
					r: "&Red:",
					g: "&Green:",
					b: "Bl&ue:",
				}[component_letter];
				const input = document.createElement("input");
				// not doing type="number" because the inputs have no up/down buttons and they have special behavior with validation
				input.type = "text";
				input.classList.add("inset-deep");
				input.dataset.componentLetter = component_letter;
				input.dataset.min = 0;
				input.dataset.max = {
					h: 360,
					s: 100,
					l: 100,
					r: 255,
					g: 255,
					b: 255,
				}[component_letter];
				const label = document.createElement("label");
				label.innerHTML = display_hotkey(text_with_hotkey);
				const input_y_spacing = 22;
				$(label).css({
					position: "absolute",
					left: 63 + color_model_index * 80,
					top: 202 + component_index * input_y_spacing,
					textAlign: "right",
					display: "inline-block",
					width: 40,
					height: 20,
					lineHeight: "20px",
				});
				$(input).css({
					position: "absolute",
					left: 106 + color_model_index * 80,
					top: 202 + component_index * input_y_spacing + (component_index > 1), // spacing of rows is uneven by a pixel
					width: 21,
					height: 14,
				});
				$right.append(label, input);

				inputs_by_component_letter[component_letter] = input;
			});
		});

		// listening for input events on input elements using event delegation (looks a little weird)
		$right.on("input", "input", (event) => {
			const input = event.target;
			const component_letter = input.dataset.componentLetter;
			if (component_letter) {
				// In Windows, it actually only updates if the numerical value changes, not just the text.
				// That is, you can add leading zeros, and they'll stay, then add them in the other color model
				// and it won't remove the ones in the fields of the first color model.
				// This is not important, so I don't know if I'll do that.

				if (input.value.match(/^\d+$/)) {
					let n = Number(input.value);
					if (n < input.dataset.min) {
						n = input.dataset.min;
						input.value = n;
					} else if (n > input.dataset.max) {
						n = input.dataset.max;
						input.value = n;
					}
					if ("hsl".indexOf(component_letter) > -1) {
						switch (component_letter) {
							case "h":
								hue_degrees = n;
								break;
							case "s":
								sat_percent = n;
								break;
							case "l":
								lum_percent = n;
								break;
						}
						update_inputs("rgb");
					} else {
						let [r, g, b] = get_rgba_from_color(get_current_color());
						const rgb = { r, g, b };
						rgb[component_letter] = n;
						set_color_from_rgb(rgb.r, rgb.g, rgb.b);
						update_inputs("hsl");
					}
					draw();
				} else if (input.value.length) {
					update_inputs(component_letter);
					input.select();
				}
			}
		});
		$right.on("focusout", "input", (event) => {
			const input = event.target;
			const component_letter = input.dataset.componentLetter;
			if (component_letter) {
				// Handle empty input when focus moves away
				if (!input.value.match(/^\d+$/)) {
					update_inputs(component_letter);
					input.select();
				}
			}
		});

		$w.on("keydown", (event) => {
			if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
				switch (event.key) {
					case "o":
						set_color(get_current_color());
						update_inputs("hslrgb");
						draw();
						break;
					case "b":
						$basic_colors_grid.find(".swatch.selected, .swatch").focus();
						break;
					case "c":
						$basic_colors_grid.find(".swatch.selected, .swatch").focus();
						break;
					case "e":
						inputs_by_component_letter.h.focus();
						break;
					case "s":
						inputs_by_component_letter.s.focus();
						break;
					case "l":
						inputs_by_component_letter.l.focus();
						break;
					case "r":
						inputs_by_component_letter.r.focus();
						break;
					case "g":
						inputs_by_component_letter.g.focus();
						break;
					case "u":
						inputs_by_component_letter.b.focus();
						break;
					case "a":
						if ($add_to_custom_colors_button.is(":visible")) {
							$add_to_custom_colors_button.click();
						}
						break;
					case "d":
						$define_custom_colors_button.click();
						break;
					default:
						return; // don't prevent default by default
				}
			} else {
				return; // don't prevent default by default
			}
			event.preventDefault();
			event.stopPropagation();
		});

		const update_inputs = (components) => {
			for (const component_letter of components) {
				const input = inputs_by_component_letter[component_letter];
				const [r, g, b] = get_rgba_from_color(get_current_color());
				input.value = Math.floor({
					h: hue_degrees,
					s: sat_percent,
					l: lum_percent,
					r,
					g,
					b,
				}[component_letter]);
			}
		};

		$right.append(rainbow_canvas, luminosity_canvas, result_canvas, $color_solid_label, lum_arrow_canvas);

		const $add_to_custom_colors_button = $(`<button class="add-to-custom-colors-button">`)
			.html(display_hotkey("&Add To Custom Colors"))
			.appendTo($right)
			.on("click", (event) => {
				// prevent the form from submitting
				// @TODO: instead, prevent the form's submit event in $Window.js in os-gui (or don't have a form? idk)
				event.preventDefault();

				const color = get_current_color();
				custom_colors[custom_colors_index] = color;
				// console.log(custom_colors_swatches_reordered, custom_colors_index, custom_colors_swatches_reordered[custom_colors_index]));
				update_$swatch($(custom_colors_swatches_list_order[custom_colors_index]), color);
				custom_colors_index = (custom_colors_index + 1) % custom_colors.length;

				$w.removeClass("defining-custom-colors"); // for mobile layout
			});

		$w.$Button(localize("OK"), () => {
			callback(get_current_color());
			$w.close();
		})[0].focus();
		$w.$Button(localize("Cancel"), () => {
			$w.close();
		});

		$left.append($w.$buttons);

		// initially select the first color cell that matches the swatch to edit, if any
		// (first in the basic colors, then in the custom colors otherwise - implicitly)
		for (const swatch_el of $left.find(".swatch").toArray()) {
			if (get_rgba_from_color(swatch_el.dataset.color).join(",") === get_rgba_from_color(initial_color).join(",")) {
				select($(swatch_el));
				swatch_el.focus();
				break;
			}
		}
		custom_colors_index = Math.max(0, custom_colors_swatches_list_order.indexOf(
			$custom_colors_grid.find(".swatch.selected")[0]
		));

		set_color(initial_color);
		update_inputs("hslrgb");

		$w.center();
	}

	exports.show_edit_colors_window = show_edit_colors_window;

})(window);

((exports) => {

	function $FontBox() {
		const $fb = $(E("div")).addClass("font-box");

		const $family = $(E("select")).addClass("inset-deep").attr({
			"aria-label": "Font Family",
			"aria-description": localize("Selects the font used by the text."),
		});
		const $size = $(E("input")).addClass("inset-deep").attr({
			type: "number",
			min: 8,
			max: 72,
			value: text_tool_font.size,
			"aria-label": "Font Size",
			"aria-description": localize("Selects the point size of the text."),
		}).css({
			maxWidth: 50,
		});
		const $button_group = $(E("span")).addClass("text-toolbar-button-group");
		// @TODO: localized labels
		const $bold = $Toggle(0, "bold", "Bold", localize("Sets or clears the text bold attribute."));
		const $italic = $Toggle(1, "italic", "Italic", localize("Sets or clears the text italic attribute."));
		const $underline = $Toggle(2, "underline", "Underline", localize("Sets or clears the text underline attribute."));
		const $vertical = $Toggle(3, "vertical", "Vertical Writing Mode", localize("Only a Far East font can be used for vertical editing."));
		$vertical.attr("disabled", true);

		$button_group.append($bold, $italic, $underline, $vertical);
		$fb.append($family, $size, $button_group);

		const update_font = () => {
			text_tool_font.size = Number($size.val());
			text_tool_font.family = $family.val();
			$G.trigger("option-changed");
		};

		FontDetective.each(font => {
			const $option = $(E("option"));
			$option.val(font).text(font.name);
			$family.append($option);
			if (!text_tool_font.family) {
				update_font();
			}
		});

		if (text_tool_font.family) {
			$family.val(text_tool_font.family);
		}

		$family.on("change", update_font);
		$size.on("change", update_font);

		const $w = $ToolWindow();
		$w.title(localize("Fonts"));
		$w.$content.append($fb);
		$w.center();
		return $w;


		function $Toggle(xi, thing, label, description) {
			const $button = $(E("button")).addClass("toggle").attr({
				"aria-pressed": false,
				"aria-label": label,
				"aria-description": description,
			});
			const $icon = $(E("span")).addClass("icon").appendTo($button);
			$button.css({
				width: 23,
				height: 22,
				padding: 0,
				display: "inline-flex",
				alignContent: "center",
				alignItems: "center",
				justifyContent: "center",
			});
			$icon.css({
				flex: "0 0 auto",
				display: "block",
				width: 16,
				height: 16,
				"--icon-index": xi,
			});
			$button.on("click", () => {
				$button.toggleClass("selected");
				text_tool_font[thing] = $button.hasClass("selected");
				$button.attr("aria-pressed", $button.hasClass("selected"));
				update_font();
			});
			if (text_tool_font[thing]) {
				$button.addClass("selected").attr("aria-pressed", true);
			}
			return $button;
		}
	}

	exports.$FontBox = $FontBox;

})(window);

((exports) => {
	// Note that this API must be kept in sync with the version in 98.js.org.

	function showMessageBox({
		title = window.defaultMessageBoxTitle ?? "Alert",
		message,
		messageHTML,
		buttons = [{ label: "OK", value: "ok", default: true }],
		iconID = "warning", // "error", "warning", "info", or "nuke" for deleting files/folders
		windowOptions = {}, // for controlling width, etc.
	}) {
		let $window, $message;
		const promise = new Promise((resolve, reject) => {
			$window = make_window_supporting_scale(Object.assign({
				title,
				resizable: false,
				innerWidth: 400,
				maximizeButton: false,
				minimizeButton: false,
			}, windowOptions));
			// $window.addClass("dialog-window horizontal-buttons");
			$message =
				$("<div>").css({
					textAlign: "left",
					fontFamily: "MS Sans Serif, Arial, sans-serif",
					fontSize: "14px",
					marginTop: "22px",
					flex: 1,
					minWidth: 0, // Fixes hidden overflow, see https://css-tricks.com/flexbox-truncated-text/
					whiteSpace: "normal", // overriding .window:not(.squish)
				});
			if (messageHTML) {
				$message.html(messageHTML);
			} else if (message) { // both are optional because you may populate later with dynamic content
				$message.text(message).css({
					whiteSpace: "pre-wrap",
					wordWrap: "break-word",
				});
			}
			$("<div>").append(
				$("<img width='32' height='32'>").attr("src", `images/${iconID}-32x32-8bpp.png`).css({
					margin: "16px",
					display: "block",
				}),
				$message
			).css({
				display: "flex",
				flexDirection: "row",
			}).appendTo($window.$content);

			$window.$content.css({
				textAlign: "center",
			});
			for (const button of buttons) {
				const $button = $window.$Button(button.label, () => {
					button.action?.(); // API may be required for using user gesture requiring APIs
					resolve(button.value);
					$window.close(); // actually happens automatically
				});
				if (button.default) {
					$button.addClass("default");
					$button.focus();
					setTimeout(() => $button.focus(), 0); // @TODO: why is this needed? does it have to do with the iframe window handling?
				}
				$button.css({
					minWidth: 75,
					height: 23,
					margin: "16px 2px",
				});
			}
			$window.on("focusin", "button", (event) => {
				$(event.currentTarget).addClass("default");
			});
			$window.on("focusout", "button", (event) => {
				$(event.currentTarget).removeClass("default");
			});
			$window.on("closed", () => {
				resolve("closed"); // or "cancel"? do you need to distinguish?
			});
			$window.center();
		});
		promise.$window = $window;
		promise.$message = $message;
		promise.promise = promise; // for easy destructuring
		return promise;
	}

	// Prefer a function injected from outside an iframe,
	// which will make dialogs that can go outside the iframe,
	// for 98.js.org integration.
	// exports.showMessageBox = window.showMessageBox;
	exports.showMessageBox = exports.showMessageBox || showMessageBox;
})(window);

// Note `defaultMessageBoxTitle` handling in make_iframe_window
// Any other default parameters need to be handled there (as it works now)

window.defaultMessageBoxTitle = localize("Paint");

// Don't override alert, because I only use it as a fallback for global error handling.
// If make_window_supporting_scale is not defined, then alert is used instead,
// so it must not also end up calling make_window_supporting_scale.
// More generally, if there's an error in showMessageBox, it must fall back to something that does not use showMessageBox.
// window.alert = (message) => {
// 	showMessageBox({ message });
// };

/*
	imagetracer.js version 1.2.5
	Simple raster image tracer and vectorizer written in JavaScript.
	andras@jankovics.net
*/

/*

The Unlicense / PUBLIC DOMAIN

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to http://unlicense.org/

*/

(function(){ 'use strict';

function ImageTracer(){
	var _this = this;

	this.versionnumber = '1.2.5',
	
	////////////////////////////////////////////////////////////
	//
	//  User friendly functions
	//
	////////////////////////////////////////////////////////////
	
	// Loading an image from a URL, tracing when loaded,
	// then executing callback with the scaled svg string as argument
	this.imageToSVG = function( url, callback, options ){
		options = _this.checkoptions(options);
		// loading image, tracing and callback
		_this.loadImage(
			url,
			function(canvas){
				callback(
					_this.imagedataToSVG( _this.getImgdata(canvas), options )
				);
			},
			options
		);
	},// End of imageToSVG()
	
	// Tracing imagedata, then returning the scaled svg string
	this.imagedataToSVG = function( imgd, options ){
		options = _this.checkoptions(options);
		// tracing imagedata
		var td = _this.imagedataToTracedata( imgd, options );
		// returning SVG string
		return _this.getsvgstring(td, options);
	},// End of imagedataToSVG()
	
	// Loading an image from a URL, tracing when loaded,
	// then executing callback with tracedata as argument
	this.imageToTracedata = function( url, callback, options ){
		options = _this.checkoptions(options);
		// loading image, tracing and callback
		_this.loadImage(
				url,
				function(canvas){
					callback(
						_this.imagedataToTracedata( _this.getImgdata(canvas), options )
					);
				},
				options
		);
	},// End of imageToTracedata()
	
	// Tracing imagedata, then returning tracedata (layers with paths, palette, image size)
	this.imagedataToTracedata = function( imgd, options ){
		options = _this.checkoptions(options);
		
		// 1. Color quantization
		var ii = _this.colorquantization( imgd, options );
		
		if(options.layering === 0){// Sequential layering
			
			// create tracedata object
			var tracedata = {
				layers : [],
				palette : ii.palette,
				width : ii.array[0].length-2,
				height : ii.array.length-2
			};
			
			// Loop to trace each color layer
			for(var colornum=0; colornum<ii.palette.length; colornum++){
				
				// layeringstep -> pathscan -> internodes -> batchtracepaths
				var tracedlayer =
					_this.batchtracepaths(
							
						_this.internodes(
								
							_this.pathscan(
								_this.layeringstep( ii, colornum ),
								options.pathomit
							),
							
							options
							
						),
						
						options.ltres,
						options.qtres
						
					);
				
				// adding traced layer
				tracedata.layers.push(tracedlayer);
				
			}// End of color loop
			
		}else{// Parallel layering
			// 2. Layer separation and edge detection
			var ls = _this.layering( ii );
			
			// Optional edge node visualization
			if(options.layercontainerid){ _this.drawLayers( ls, _this.specpalette, options.scale, options.layercontainerid ); }
			
			// 3. Batch pathscan
			var bps = _this.batchpathscan( ls, options.pathomit );
			
			// 4. Batch interpollation
			var bis = _this.batchinternodes( bps, options );
			
			// 5. Batch tracing and creating tracedata object
			var tracedata = {
				layers : _this.batchtracelayers( bis, options.ltres, options.qtres ),
				palette : ii.palette,
				width : imgd.width,
				height : imgd.height
			};
			
		}// End of parallel layering
		
		// return tracedata
		return tracedata;
		
	},// End of imagedataToTracedata()
	
	this.optionpresets = {
		'default': {
			
			// Tracing
			corsenabled : false,
			ltres : 1,
			qtres : 1,
			pathomit : 8,
			rightangleenhance : true,
			
			// Color quantization
			colorsampling : 2,
			numberofcolors : 16,
			mincolorratio : 0,
			colorquantcycles : 3,
			
			// Layering method
			layering : 0,
			
			// SVG rendering
			strokewidth : 1,
			linefilter : false,
			scale : 1,
			roundcoords : 1,
			viewbox : false,
			desc : false,
			lcpr : 0,
			qcpr : 0,
			
			// Blur
			blurradius : 0,
			blurdelta : 20
			
		},
		'posterized1': { colorsampling:0, numberofcolors:2 },
		'posterized2': { numberofcolors:4, blurradius:5 },
		'curvy': { ltres:0.01, linefilter:true, rightangleenhance:false },
		'sharp': { qtres:0.01, linefilter:false },
		'detailed': { pathomit:0, roundcoords:2, ltres:0.5, qtres:0.5, numberofcolors:64 },
		'smoothed': { blurradius:5, blurdelta: 64 },
		'grayscale': { colorsampling:0, colorquantcycles:1, numberofcolors:7 },
		'fixedpalette': { colorsampling:0, colorquantcycles:1, numberofcolors:27 },
		'randomsampling1': { colorsampling:1, numberofcolors:8 },
		'randomsampling2': { colorsampling:1, numberofcolors:64 },
		'artistic1': { colorsampling:0, colorquantcycles:1, pathomit:0, blurradius:5, blurdelta: 64, ltres:0.01, linefilter:true, numberofcolors:16, strokewidth:2 },
		'artistic2': { qtres:0.01, colorsampling:0, colorquantcycles:1, numberofcolors:4, strokewidth:0 },
		'artistic3': { qtres:10, ltres:10, numberofcolors:8 },
		'artistic4': { qtres:10, ltres:10, numberofcolors:64, blurradius:5, blurdelta: 256, strokewidth:2 },
		'posterized3': { ltres: 1, qtres: 1, pathomit: 20, rightangleenhance: true, colorsampling: 0, numberofcolors: 3,
			mincolorratio: 0, colorquantcycles: 3, blurradius: 3, blurdelta: 20, strokewidth: 0, linefilter: false,
			roundcoords: 1, pal: [ { r: 0, g: 0, b: 100, a: 255 }, { r: 255, g: 255, b: 255, a: 255 } ] }
	},// End of optionpresets
	
	// creating options object, setting defaults for missing values
	this.checkoptions = function(options){
		options = options || {};
		// Option preset
		if(typeof options === 'string'){
			options = options.toLowerCase();
			if( _this.optionpresets[options] ){ options = _this.optionpresets[options]; }else{ options = {}; }
		}
		// Defaults
		var ok = Object.keys(_this.optionpresets['default']);
		for(var k=0; k<ok.length; k++){
			if(!options.hasOwnProperty(ok[k])){ options[ok[k]] = _this.optionpresets['default'][ok[k]]; }
		}
		// options.pal is not defined here, the custom palette should be added externally: options.pal = [ { 'r':0, 'g':0, 'b':0, 'a':255 }, {...}, ... ];
		// options.layercontainerid is not defined here, can be added externally: options.layercontainerid = 'mydiv'; ... <div id="mydiv"></div>
		return options;
	},// End of checkoptions()
	
	////////////////////////////////////////////////////////////
	//
	//  Vectorizing functions
	//
	////////////////////////////////////////////////////////////
	
	// 1. Color quantization
	// Using a form of k-means clustering repeatead options.colorquantcycles times. http://en.wikipedia.org/wiki/Color_quantization
	this.colorquantization = function( imgd, options ){
		var arr = [], idx=0, cd,cdl,ci, paletteacc = [], pixelnum = imgd.width * imgd.height, i, j, k, cnt, palette;
		
		// imgd.data must be RGBA, not just RGB
		if( imgd.data.length < pixelnum * 4 ){
			var newimgddata = new Uint8ClampedArray(pixelnum * 4);
			for(var pxcnt = 0; pxcnt < pixelnum ; pxcnt++){
				newimgddata[pxcnt*4  ] = imgd.data[pxcnt*3  ];
				newimgddata[pxcnt*4+1] = imgd.data[pxcnt*3+1];
				newimgddata[pxcnt*4+2] = imgd.data[pxcnt*3+2];
				newimgddata[pxcnt*4+3] = 255;
			}
			imgd.data = newimgddata;
		}// End of RGBA imgd.data check
		
		// Filling arr (color index array) with -1
		for( j=0; j<imgd.height+2; j++ ){ arr[j]=[]; for(i=0; i<imgd.width+2 ; i++){ arr[j][i] = -1; } }
		
		// Use custom palette if pal is defined or sample / generate custom length palette
		if(options.pal){
			palette = options.pal;
		}else if(options.colorsampling === 0){
			palette = _this.generatepalette(options.numberofcolors);
		}else if(options.colorsampling === 1){
			palette = _this.samplepalette( options.numberofcolors, imgd );
		}else{
			palette = _this.samplepalette2( options.numberofcolors, imgd );
		}
		
		// Selective Gaussian blur preprocessing
		if( options.blurradius > 0 ){ imgd = _this.blur( imgd, options.blurradius, options.blurdelta ); }
		
		// Repeat clustering step options.colorquantcycles times
		for( cnt=0; cnt < options.colorquantcycles; cnt++ ){
			
			// Average colors from the second iteration
			if(cnt>0){
				// averaging paletteacc for palette
				for( k=0; k < palette.length; k++ ){
					
					// averaging
					if( paletteacc[k].n > 0 ){
						palette[k] = {  r: Math.floor( paletteacc[k].r / paletteacc[k].n ),
										g: Math.floor( paletteacc[k].g / paletteacc[k].n ),
										b: Math.floor( paletteacc[k].b / paletteacc[k].n ),
										a:  Math.floor( paletteacc[k].a / paletteacc[k].n ) };
					}
					
					// Randomizing a color, if there are too few pixels and there will be a new cycle
					if( ( paletteacc[k].n/pixelnum < options.mincolorratio ) && ( cnt < options.colorquantcycles-1 ) ){
						palette[k] = {  r: Math.floor(Math.random()*255),
										g: Math.floor(Math.random()*255),
										b: Math.floor(Math.random()*255),
										a: Math.floor(Math.random()*255) };
					}
					
				}// End of palette loop
			}// End of Average colors from the second iteration
			
			// Reseting palette accumulator for averaging
			for( i=0; i < palette.length; i++ ){ paletteacc[i] = { r:0, g:0, b:0, a:0, n:0 }; }
			
			// loop through all pixels
			for( j=0; j < imgd.height; j++ ){
				for( i=0; i < imgd.width; i++ ){
					
					// pixel index
					idx = (j*imgd.width+i)*4;
					
					// find closest color from palette by measuring (rectilinear) color distance between this pixel and all palette colors
					ci=0; cdl = 1024; // 4 * 256 is the maximum RGBA distance
					for( k=0; k<palette.length; k++ ){
						
						// In my experience, https://en.wikipedia.org/wiki/Rectilinear_distance works better than https://en.wikipedia.org/wiki/Euclidean_distance
						cd = Math.abs(palette[k].r-imgd.data[idx]) + Math.abs(palette[k].g-imgd.data[idx+1]) + Math.abs(palette[k].b-imgd.data[idx+2]) + Math.abs(palette[k].a-imgd.data[idx+3]);
						
						// Remember this color if this is the closest yet
						if(cd<cdl){ cdl = cd; ci = k; }
						
					}// End of palette loop
					
					// add to palettacc
					paletteacc[ci].r += imgd.data[idx  ];
					paletteacc[ci].g += imgd.data[idx+1];
					paletteacc[ci].b += imgd.data[idx+2];
					paletteacc[ci].a += imgd.data[idx+3];
					paletteacc[ci].n++;
					
					// update the indexed color array
					arr[j+1][i+1] = ci;
					
				}// End of i loop
			}// End of j loop
			
		}// End of Repeat clustering step options.colorquantcycles times
		
		return { array:arr, palette:palette };
		
	},// End of colorquantization()
	
	// Sampling a palette from imagedata
	this.samplepalette = function( numberofcolors, imgd ){
		var idx, palette=[];
		for(var i=0; i<numberofcolors; i++){
			idx = Math.floor( Math.random() * imgd.data.length / 4 ) * 4;
			palette.push({ r:imgd.data[idx  ], g:imgd.data[idx+1], b:imgd.data[idx+2], a:imgd.data[idx+3] });
		}
		return palette;
	},// End of samplepalette()
	
	// Deterministic sampling a palette from imagedata: rectangular grid
	this.samplepalette2 = function( numberofcolors, imgd ){
		var idx, palette=[], ni = Math.ceil(Math.sqrt(numberofcolors)), nj = Math.ceil(numberofcolors/ni),
			vx = imgd.width / (ni+1), vy = imgd.height / (nj+1);
		for(var j=0; j<nj; j++){
			for(var i=0; i<ni; i++){
				if(palette.length === numberofcolors){
					break;
				}else{
					idx = Math.floor( ((j+1)*vy) * imgd.width + ((i+1)*vx) ) * 4;
					palette.push( { r:imgd.data[idx], g:imgd.data[idx+1], b:imgd.data[idx+2], a:imgd.data[idx+3] } );
				}
			}
		}
		return palette;
	},// End of samplepalette2()
	
	// Generating a palette with numberofcolors
	this.generatepalette = function(numberofcolors){
		var palette = [], rcnt, gcnt, bcnt;
		if(numberofcolors<8){
			
			// Grayscale
			var graystep = Math.floor(255/(numberofcolors-1));
			for(var i=0; i<numberofcolors; i++){ palette.push({ r:i*graystep, g:i*graystep, b:i*graystep, a:255 }); }
			
		}else{
			
			// RGB color cube
			var colorqnum = Math.floor(Math.pow(numberofcolors, 1/3)), // Number of points on each edge on the RGB color cube
				colorstep = Math.floor(255/(colorqnum-1)), // distance between points
				rndnum = numberofcolors - colorqnum*colorqnum*colorqnum; // number of random colors
			
			for(rcnt=0; rcnt<colorqnum; rcnt++){
				for(gcnt=0; gcnt<colorqnum; gcnt++){
					for(bcnt=0; bcnt<colorqnum; bcnt++){
						palette.push( { r:rcnt*colorstep, g:gcnt*colorstep, b:bcnt*colorstep, a:255 } );
					}// End of blue loop
				}// End of green loop
			}// End of red loop
			
			// Rest is random
			for(rcnt=0; rcnt<rndnum; rcnt++){ palette.push({ r:Math.floor(Math.random()*255), g:Math.floor(Math.random()*255), b:Math.floor(Math.random()*255), a:Math.floor(Math.random()*255) }); }

		}// End of numberofcolors check
		
		return palette;
	},// End of generatepalette()
		
	// 2. Layer separation and edge detection
	// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
	// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
	this.layering = function(ii){
		// Creating layers for each indexed color in arr
		var layers = [], val=0, ah = ii.array.length, aw = ii.array[0].length, n1,n2,n3,n4,n5,n6,n7,n8, i, j, k;
		
		// Create layers
		for(k=0; k<ii.palette.length; k++){
			layers[k] = [];
			for(j=0; j<ah; j++){
				layers[k][j] = [];
				for(i=0; i<aw; i++){
					layers[k][j][i]=0;
				}
			}
		}
		
		// Looping through all pixels and calculating edge node type
		for(j=1; j<ah-1; j++){
			for(i=1; i<aw-1; i++){
				
				// This pixel's indexed color
				val = ii.array[j][i];
				
				// Are neighbor pixel colors the same?
				n1 = ii.array[j-1][i-1]===val ? 1 : 0;
				n2 = ii.array[j-1][i  ]===val ? 1 : 0;
				n3 = ii.array[j-1][i+1]===val ? 1 : 0;
				n4 = ii.array[j  ][i-1]===val ? 1 : 0;
				n5 = ii.array[j  ][i+1]===val ? 1 : 0;
				n6 = ii.array[j+1][i-1]===val ? 1 : 0;
				n7 = ii.array[j+1][i  ]===val ? 1 : 0;
				n8 = ii.array[j+1][i+1]===val ? 1 : 0;
				
				// this pixel's type and looking back on previous pixels
				layers[val][j+1][i+1] = 1 + n5 * 2 + n8 * 4 + n7 * 8 ;
				if(!n4){ layers[val][j+1][i  ] = 0 + 2 + n7 * 4 + n6 * 8 ; }
				if(!n2){ layers[val][j  ][i+1] = 0 + n3*2 + n5 * 4 + 8 ; }
				if(!n1){ layers[val][j  ][i  ] = 0 + n2*2 + 4 + n4 * 8 ; }
				
			}// End of i loop
		}// End of j loop
		
		return layers;
	},// End of layering()
	
	// 2. Layer separation and edge detection
	// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
	// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
	// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
	//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
	this.layeringstep = function(ii,cnum){
		// Creating layers for each indexed color in arr
		var layer = [], val=0, ah = ii.array.length, aw = ii.array[0].length, n1,n2,n3,n4,n5,n6,n7,n8, i, j, k;
		
		// Create layer
		for(j=0; j<ah; j++){
			layer[j] = [];
			for(i=0; i<aw; i++){
				layer[j][i]=0;
			}
		}
		
		// Looping through all pixels and calculating edge node type
		for(j=1; j<ah; j++){
			for(i=1; i<aw; i++){
				layer[j][i] =
					( ii.array[j-1][i-1]===cnum ? 1 : 0 ) +
					( ii.array[j-1][i]===cnum ? 2 : 0 ) +
					( ii.array[j][i-1]===cnum ? 8 : 0 ) +
					( ii.array[j][i]===cnum ? 4 : 0 )
				;
			}// End of i loop
		}// End of j loop
			
		return layer;
	},// End of layeringstep()
	
	// Lookup tables for pathscan
	// pathscan_combined_lookup[ arr[py][px] ][ dir ] = [nextarrpypx, nextdir, deltapx, deltapy];
	this.pathscan_combined_lookup = [
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]],// arr[py][px]===0 is invalid
		[[ 0, 1, 0,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 2,-1, 0]],
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 1, 0,-1], [ 0, 0, 1, 0]],
		[[ 0, 0, 1, 0], [-1,-1,-1,-1], [ 0, 2,-1, 0], [-1,-1,-1,-1]],
		
		[[-1,-1,-1,-1], [ 0, 0, 1, 0], [ 0, 3, 0, 1], [-1,-1,-1,-1]],
		[[13, 3, 0, 1], [13, 2,-1, 0], [ 7, 1, 0,-1], [ 7, 0, 1, 0]],
		[[-1,-1,-1,-1], [ 0, 1, 0,-1], [-1,-1,-1,-1], [ 0, 3, 0, 1]],
		[[ 0, 3, 0, 1], [ 0, 2,-1, 0], [-1,-1,-1,-1], [-1,-1,-1,-1]],
		
		[[ 0, 3, 0, 1], [ 0, 2,-1, 0], [-1,-1,-1,-1], [-1,-1,-1,-1]],
		[[-1,-1,-1,-1], [ 0, 1, 0,-1], [-1,-1,-1,-1], [ 0, 3, 0, 1]],
		[[11, 1, 0,-1], [14, 0, 1, 0], [14, 3, 0, 1], [11, 2,-1, 0]],
		[[-1,-1,-1,-1], [ 0, 0, 1, 0], [ 0, 3, 0, 1], [-1,-1,-1,-1]],
		
		[[ 0, 0, 1, 0], [-1,-1,-1,-1], [ 0, 2,-1, 0], [-1,-1,-1,-1]],
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 1, 0,-1], [ 0, 0, 1, 0]],
		[[ 0, 1, 0,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [ 0, 2,-1, 0]],
		[[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]]// arr[py][px]===15 is invalid
	],

	// 3. Walking through an edge node array, discarding edge node types 0 and 15 and creating paths from the rest.
	// Walk directions (dir): 0 > ; 1 ^ ; 2 < ; 3 v 
	this.pathscan = function( arr, pathomit ){
		var paths=[], pacnt=0, pcnt=0, px=0, py=0, w = arr[0].length, h = arr.length,
			dir=0, pathfinished=true, holepath=false, lookuprow;
		
		for(var j=0; j<h; j++){
			for(var i=0; i<w; i++){
				if( (arr[j][i] == 4) || ( arr[j][i] == 11) ){ // Other values are not valid
					
					// Init
					px = i; py = j;
					paths[pacnt] = {};
					paths[pacnt].points = [];
					paths[pacnt].boundingbox = [px,py,px,py];
					paths[pacnt].holechildren = [];
					pathfinished = false;
					pcnt=0;
					holepath = ( arr[j][i] == 11);
					dir = 1;

					// Path points loop
					while(!pathfinished){
						
						// New path point
						paths[pacnt].points[pcnt] = {};
						paths[pacnt].points[pcnt].x = px-1;
						paths[pacnt].points[pcnt].y = py-1;
						paths[pacnt].points[pcnt].t = arr[py][px];
						
						// Bounding box
						if( (px-1) < paths[pacnt].boundingbox[0] ){ paths[pacnt].boundingbox[0] = px-1; }
						if( (px-1) > paths[pacnt].boundingbox[2] ){ paths[pacnt].boundingbox[2] = px-1; }
						if( (py-1) < paths[pacnt].boundingbox[1] ){ paths[pacnt].boundingbox[1] = py-1; }
						if( (py-1) > paths[pacnt].boundingbox[3] ){ paths[pacnt].boundingbox[3] = py-1; }
						
						// Next: look up the replacement, direction and coordinate changes = clear this cell, turn if required, walk forward
						lookuprow = _this.pathscan_combined_lookup[ arr[py][px] ][ dir ];
						arr[py][px] = lookuprow[0]; dir = lookuprow[1]; px += lookuprow[2]; py += lookuprow[3];

						// Close path
						if( (px-1 === paths[pacnt].points[0].x ) && ( py-1 === paths[pacnt].points[0].y ) ){
							pathfinished = true;
							
							// Discarding paths shorter than pathomit
							if( paths[pacnt].points.length < pathomit ){
								paths.pop();
							}else{
							
								paths[pacnt].isholepath = holepath ? true : false;
								
								// Finding the parent shape for this hole
								if(holepath){
									
									var parentidx = 0, parentbbox = [-1,-1,w+1,h+1];
									for(var parentcnt=0; parentcnt < pacnt; parentcnt++){
										if( (!paths[parentcnt].isholepath) &&
											_this.boundingboxincludes( paths[parentcnt].boundingbox , paths[pacnt].boundingbox ) &&
											_this.boundingboxincludes( parentbbox , paths[parentcnt].boundingbox )
										){
											parentidx = parentcnt;
											parentbbox = paths[parentcnt].boundingbox;
										}
									}
									
									paths[parentidx].holechildren.push( pacnt );
									
								}// End of holepath parent finding
								
								pacnt++;
							
							}
							
						}// End of Close path
						
						pcnt++;
						
					}// End of Path points loop
					
				}// End of Follow path
				
			}// End of i loop
		}// End of j loop
		
		return paths;
	},// End of pathscan()
	
	this.boundingboxincludes = function( parentbbox, childbbox ){
		return ( ( parentbbox[0] < childbbox[0] ) && ( parentbbox[1] < childbbox[1] ) && ( parentbbox[2] > childbbox[2] ) && ( parentbbox[3] > childbbox[3] ) );
	},// End of boundingboxincludes()
	
	// 3. Batch pathscan
	this.batchpathscan = function( layers, pathomit ){
		var bpaths = [];
		for(var k in layers){
			if(!layers.hasOwnProperty(k)){ continue; }
			bpaths[k] = _this.pathscan( layers[k], pathomit );
		}
		return bpaths;
	},
	
	// 4. interpollating between path points for nodes with 8 directions ( East, SouthEast, S, SW, W, NW, N, NE )
	this.internodes = function( paths, options ){
		var ins = [], palen=0, nextidx=0, nextidx2=0, previdx=0, previdx2=0, pacnt, pcnt;
		
		// paths loop
		for(pacnt=0; pacnt<paths.length; pacnt++){
			
			ins[pacnt] = {};
			ins[pacnt].points = [];
			ins[pacnt].boundingbox = paths[pacnt].boundingbox;
			ins[pacnt].holechildren = paths[pacnt].holechildren;
			ins[pacnt].isholepath = paths[pacnt].isholepath;
			palen = paths[pacnt].points.length;
			
			// pathpoints loop
			for(pcnt=0; pcnt<palen; pcnt++){
			
				// next and previous point indexes
				nextidx = (pcnt+1)%palen; nextidx2 = (pcnt+2)%palen; previdx = (pcnt-1+palen)%palen; previdx2 = (pcnt-2+palen)%palen;
				
				// right angle enhance
				if( options.rightangleenhance && _this.testrightangle( paths[pacnt], previdx2, previdx, pcnt, nextidx, nextidx2 ) ){
					
					// Fix previous direction
					if(ins[pacnt].points.length > 0){
						ins[pacnt].points[ ins[pacnt].points.length-1 ].linesegment = _this.getdirection(
								ins[pacnt].points[ ins[pacnt].points.length-1 ].x,
								ins[pacnt].points[ ins[pacnt].points.length-1 ].y,
								paths[pacnt].points[pcnt].x,
								paths[pacnt].points[pcnt].y
							);
					}
					
					// This corner point
					ins[pacnt].points.push({
						x : paths[pacnt].points[pcnt].x,
						y : paths[pacnt].points[pcnt].y,
						linesegment : _this.getdirection(
								paths[pacnt].points[pcnt].x,
								paths[pacnt].points[pcnt].y,
								(( paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x ) /2),
								(( paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y ) /2)
							)
					});
					
				}// End of right angle enhance
				
				// interpolate between two path points
				ins[pacnt].points.push({
					x : (( paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x ) /2),
					y : (( paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y ) /2),
					linesegment : _this.getdirection(
							(( paths[pacnt].points[pcnt].x + paths[pacnt].points[nextidx].x ) /2),
							(( paths[pacnt].points[pcnt].y + paths[pacnt].points[nextidx].y ) /2),
							(( paths[pacnt].points[nextidx].x + paths[pacnt].points[nextidx2].x ) /2),
							(( paths[pacnt].points[nextidx].y + paths[pacnt].points[nextidx2].y ) /2)
						)
				});
				
			}// End of pathpoints loop
						
		}// End of paths loop
		
		return ins;
	},// End of internodes()
	
	this.testrightangle = function( path, idx1, idx2, idx3, idx4, idx5 ){
		return ( (( path.points[idx3].x === path.points[idx1].x) &&
				  ( path.points[idx3].x === path.points[idx2].x) &&
				  ( path.points[idx3].y === path.points[idx4].y) &&
				  ( path.points[idx3].y === path.points[idx5].y)
				 ) ||
				 (( path.points[idx3].y === path.points[idx1].y) &&
				  ( path.points[idx3].y === path.points[idx2].y) &&
				  ( path.points[idx3].x === path.points[idx4].x) &&
				  ( path.points[idx3].x === path.points[idx5].x)
				 )
		);
	},// End of testrightangle()
	
	this.getdirection = function( x1, y1, x2, y2 ){
		var val = 8;
		if(x1 < x2){
			if     (y1 < y2){ val = 1; }// SouthEast
			else if(y1 > y2){ val = 7; }// NE
			else            { val = 0; }// E
		}else if(x1 > x2){
			if     (y1 < y2){ val = 3; }// SW
			else if(y1 > y2){ val = 5; }// NW
			else            { val = 4; }// W
		}else{
			if     (y1 < y2){ val = 2; }// S
			else if(y1 > y2){ val = 6; }// N
			else            { val = 8; }// center, this should not happen
		}
		return val;
	},// End of getdirection()
	
	// 4. Batch interpollation
	this.batchinternodes = function( bpaths, options ){
		var binternodes = [];
		for (var k in bpaths) {
			if(!bpaths.hasOwnProperty(k)){ continue; }
			binternodes[k] = _this.internodes(bpaths[k], options);
		}
		return binternodes;
	},
	
	// 5. tracepath() : recursively trying to fit straight and quadratic spline segments on the 8 direction internode path
	
	// 5.1. Find sequences of points with only 2 segment types
	// 5.2. Fit a straight line on the sequence
	// 5.3. If the straight line fails (distance error > ltres), find the point with the biggest error
	// 5.4. Fit a quadratic spline through errorpoint (project this to get controlpoint), then measure errors on every point in the sequence
	// 5.5. If the spline fails (distance error > qtres), find the point with the biggest error, set splitpoint = fitting point
	// 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
	
	this.tracepath = function( path, ltres, qtres ){
		var pcnt=0, segtype1, segtype2, seqend, smp = {};
		smp.segments = [];
		smp.boundingbox = path.boundingbox;
		smp.holechildren = path.holechildren;
		smp.isholepath = path.isholepath;
		
		while(pcnt < path.points.length){
			// 5.1. Find sequences of points with only 2 segment types
			segtype1 = path.points[pcnt].linesegment; segtype2 = -1; seqend=pcnt+1;
			while(
				((path.points[seqend].linesegment === segtype1) || (path.points[seqend].linesegment === segtype2) || (segtype2 === -1))
				&& (seqend < path.points.length-1) ){
				
				if((path.points[seqend].linesegment!==segtype1) && (segtype2===-1)){ segtype2 = path.points[seqend].linesegment; }
				seqend++;
				
			}
			if(seqend === path.points.length-1){ seqend = 0; }

			// 5.2. - 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
			smp.segments = smp.segments.concat( _this.fitseq(path, ltres, qtres, pcnt, seqend) );
			
			// forward pcnt;
			if(seqend>0){ pcnt = seqend; }else{ pcnt = path.points.length; }
			
		}// End of pcnt loop
		
		return smp;
	},// End of tracepath()
		
	// 5.2. - 5.6. recursively fitting a straight or quadratic line segment on this sequence of path nodes,
	// called from tracepath()
	this.fitseq = function( path, ltres, qtres, seqstart, seqend ){
		// return if invalid seqend
		if( (seqend>path.points.length) || (seqend<0) ){ return []; }
		// variables
		var errorpoint=seqstart, errorval=0, curvepass=true, px, py, dist2;
		var tl = (seqend-seqstart); if(tl<0){ tl += path.points.length; }
		var vx = (path.points[seqend].x-path.points[seqstart].x) / tl,
			vy = (path.points[seqend].y-path.points[seqstart].y) / tl;
		
		// 5.2. Fit a straight line on the sequence
		var pcnt = (seqstart+1) % path.points.length, pl;
		while(pcnt != seqend){
			pl = pcnt-seqstart; if(pl<0){ pl += path.points.length; }
			px = path.points[seqstart].x + vx * pl; py = path.points[seqstart].y + vy * pl;
			dist2 = (path.points[pcnt].x-px)*(path.points[pcnt].x-px) + (path.points[pcnt].y-py)*(path.points[pcnt].y-py);
			if(dist2>ltres){curvepass=false;}
			if(dist2>errorval){ errorpoint=pcnt; errorval=dist2; }
			pcnt = (pcnt+1)%path.points.length;
		}
		// return straight line if fits
		if(curvepass){ return [{ type:'L', x1:path.points[seqstart].x, y1:path.points[seqstart].y, x2:path.points[seqend].x, y2:path.points[seqend].y }]; }
		
		// 5.3. If the straight line fails (distance error>ltres), find the point with the biggest error
		var fitpoint = errorpoint; curvepass = true; errorval = 0;
		
		// 5.4. Fit a quadratic spline through this point, measure errors on every point in the sequence
		// helpers and projecting to get control point
		var t=(fitpoint-seqstart)/tl, t1=(1-t)*(1-t), t2=2*(1-t)*t, t3=t*t;
		var cpx = (t1*path.points[seqstart].x + t3*path.points[seqend].x - path.points[fitpoint].x)/-t2 ,
			cpy = (t1*path.points[seqstart].y + t3*path.points[seqend].y - path.points[fitpoint].y)/-t2 ;
		
		// Check every point
		pcnt = seqstart+1;
		while(pcnt != seqend){
			t=(pcnt-seqstart)/tl; t1=(1-t)*(1-t); t2=2*(1-t)*t; t3=t*t;
			px = t1 * path.points[seqstart].x + t2 * cpx + t3 * path.points[seqend].x;
			py = t1 * path.points[seqstart].y + t2 * cpy + t3 * path.points[seqend].y;
			
			dist2 = (path.points[pcnt].x-px)*(path.points[pcnt].x-px) + (path.points[pcnt].y-py)*(path.points[pcnt].y-py);
			
			if(dist2>qtres){curvepass=false;}
			if(dist2>errorval){ errorpoint=pcnt; errorval=dist2; }
			pcnt = (pcnt+1)%path.points.length;
		}
		// return spline if fits
		if(curvepass){ return [{ type:'Q', x1:path.points[seqstart].x, y1:path.points[seqstart].y, x2:cpx, y2:cpy, x3:path.points[seqend].x, y3:path.points[seqend].y }]; }
		// 5.5. If the spline fails (distance error>qtres), find the point with the biggest error
		var splitpoint = fitpoint; // Earlier: Math.floor((fitpoint + errorpoint)/2);
		
		// 5.6. Split sequence and recursively apply 5.2. - 5.6. to startpoint-splitpoint and splitpoint-endpoint sequences
		return _this.fitseq( path, ltres, qtres, seqstart, splitpoint ).concat(
				_this.fitseq( path, ltres, qtres, splitpoint, seqend ) );
		
	},// End of fitseq()
	
	// 5. Batch tracing paths
	this.batchtracepaths = function(internodepaths,ltres,qtres){
		var btracedpaths = [];
		for(var k in internodepaths){
			if(!internodepaths.hasOwnProperty(k)){ continue; }
			btracedpaths.push( _this.tracepath(internodepaths[k],ltres,qtres) );
		}
		return btracedpaths;
	},
	
	// 5. Batch tracing layers
	this.batchtracelayers = function(binternodes, ltres, qtres){
		var btbis = [];
		for(var k in binternodes){
			if(!binternodes.hasOwnProperty(k)){ continue; }
			btbis[k] = _this.batchtracepaths(binternodes[k], ltres, qtres);
		}
		return btbis;
	},
	
	////////////////////////////////////////////////////////////
	//
	//  SVG Drawing functions
	//
	////////////////////////////////////////////////////////////
	
	// Rounding to given decimals https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-in-javascript
	this.roundtodec = function(val,places){ return +val.toFixed(places); },
	
	// Getting SVG path element string from a traced path
	this.svgpathstring = function( tracedata, lnum, pathnum, options ){
		
		var layer = tracedata.layers[lnum], smp = layer[pathnum], str='', pcnt;
		
		// Line filter
		if(options.linefilter && (smp.segments.length < 3)){ return str; }
		
		// Starting path element, desc contains layer and path number
		str = '<path '+
			( options.desc ? ('desc="l '+lnum+' p '+pathnum+'" ') : '' ) +
			_this.tosvgcolorstr(tracedata.palette[lnum], options) +
			'd="';
		
		// Creating non-hole path string
		if( options.roundcoords === -1 ){
			str += 'M '+ smp.segments[0].x1 * options.scale +' '+ smp.segments[0].y1 * options.scale +' ';
			for(pcnt=0; pcnt<smp.segments.length; pcnt++){
				str += smp.segments[pcnt].type +' '+ smp.segments[pcnt].x2 * options.scale +' '+ smp.segments[pcnt].y2 * options.scale +' ';
				if(smp.segments[pcnt].hasOwnProperty('x3')){
					str += smp.segments[pcnt].x3 * options.scale +' '+ smp.segments[pcnt].y3 * options.scale +' ';
				}
			}
			str += 'Z ';
		}else{
			str += 'M '+ _this.roundtodec( smp.segments[0].x1 * options.scale, options.roundcoords ) +' '+ _this.roundtodec( smp.segments[0].y1 * options.scale, options.roundcoords ) +' ';
			for(pcnt=0; pcnt<smp.segments.length; pcnt++){
				str += smp.segments[pcnt].type +' '+ _this.roundtodec( smp.segments[pcnt].x2 * options.scale, options.roundcoords ) +' '+ _this.roundtodec( smp.segments[pcnt].y2 * options.scale, options.roundcoords ) +' ';
				if(smp.segments[pcnt].hasOwnProperty('x3')){
					str += _this.roundtodec( smp.segments[pcnt].x3 * options.scale, options.roundcoords ) +' '+ _this.roundtodec( smp.segments[pcnt].y3 * options.scale, options.roundcoords ) +' ';
				}
			}
			str += 'Z ';
		}// End of creating non-hole path string
		
		// Hole children
		for( var hcnt=0; hcnt < smp.holechildren.length; hcnt++){
			var hsmp = layer[ smp.holechildren[hcnt] ];
			// Creating hole path string
			if( options.roundcoords === -1 ){
				
				if(hsmp.segments[ hsmp.segments.length-1 ].hasOwnProperty('x3')){
					str += 'M '+ hsmp.segments[ hsmp.segments.length-1 ].x3 * options.scale +' '+ hsmp.segments[ hsmp.segments.length-1 ].y3 * options.scale +' ';
				}else{
					str += 'M '+ hsmp.segments[ hsmp.segments.length-1 ].x2 * options.scale +' '+ hsmp.segments[ hsmp.segments.length-1 ].y2 * options.scale +' ';
				}
				
				for(pcnt = hsmp.segments.length-1; pcnt >= 0; pcnt--){
					str += hsmp.segments[pcnt].type +' ';
					if(hsmp.segments[pcnt].hasOwnProperty('x3')){
						str += hsmp.segments[pcnt].x2 * options.scale +' '+ hsmp.segments[pcnt].y2 * options.scale +' ';
					}
					
					str += hsmp.segments[pcnt].x1 * options.scale +' '+ hsmp.segments[pcnt].y1 * options.scale +' ';
				}
				
			}else{
				
				if(hsmp.segments[ hsmp.segments.length-1 ].hasOwnProperty('x3')){
					str += 'M '+ _this.roundtodec( hsmp.segments[ hsmp.segments.length-1 ].x3 * options.scale ) +' '+ _this.roundtodec( hsmp.segments[ hsmp.segments.length-1 ].y3 * options.scale ) +' ';
				}else{
					str += 'M '+ _this.roundtodec( hsmp.segments[ hsmp.segments.length-1 ].x2 * options.scale ) +' '+ _this.roundtodec( hsmp.segments[ hsmp.segments.length-1 ].y2 * options.scale ) +' ';
				}
				
				for(pcnt = hsmp.segments.length-1; pcnt >= 0; pcnt--){
					str += hsmp.segments[pcnt].type +' ';
					if(hsmp.segments[pcnt].hasOwnProperty('x3')){
						str += _this.roundtodec( hsmp.segments[pcnt].x2 * options.scale ) +' '+ _this.roundtodec( hsmp.segments[pcnt].y2 * options.scale ) +' ';
					}
					str += _this.roundtodec( hsmp.segments[pcnt].x1 * options.scale ) +' '+ _this.roundtodec( hsmp.segments[pcnt].y1 * options.scale ) +' ';
				}
				
				
			}// End of creating hole path string
			
			str += 'Z '; // Close path
			
		}// End of holepath check
		
		// Closing path element
		str += '" />';
		
		// Rendering control points
		if(options.lcpr || options.qcpr){
			for(pcnt=0; pcnt<smp.segments.length; pcnt++){
				if( smp.segments[pcnt].hasOwnProperty('x3') && options.qcpr ){
					str += '<circle cx="'+ smp.segments[pcnt].x2 * options.scale +'" cy="'+ smp.segments[pcnt].y2 * options.scale +'" r="'+ options.qcpr +'" fill="cyan" stroke-width="'+ options.qcpr * 0.2 +'" stroke="black" />';
					str += '<circle cx="'+ smp.segments[pcnt].x3 * options.scale +'" cy="'+ smp.segments[pcnt].y3 * options.scale +'" r="'+ options.qcpr +'" fill="white" stroke-width="'+ options.qcpr * 0.2 +'" stroke="black" />';
					str += '<line x1="'+ smp.segments[pcnt].x1 * options.scale +'" y1="'+ smp.segments[pcnt].y1 * options.scale +'" x2="'+ smp.segments[pcnt].x2 * options.scale +'" y2="'+ smp.segments[pcnt].y2 * options.scale +'" stroke-width="'+ options.qcpr * 0.2 +'" stroke="cyan" />';
					str += '<line x1="'+ smp.segments[pcnt].x2 * options.scale +'" y1="'+ smp.segments[pcnt].y2 * options.scale +'" x2="'+ smp.segments[pcnt].x3 * options.scale +'" y2="'+ smp.segments[pcnt].y3 * options.scale +'" stroke-width="'+ options.qcpr * 0.2 +'" stroke="cyan" />';
				}
				if( (!smp.segments[pcnt].hasOwnProperty('x3')) && options.lcpr){
					str += '<circle cx="'+ smp.segments[pcnt].x2 * options.scale +'" cy="'+ smp.segments[pcnt].y2 * options.scale +'" r="'+ options.lcpr +'" fill="white" stroke-width="'+ options.lcpr * 0.2 +'" stroke="black" />';
				}
			}
			
			// Hole children control points
			for( var hcnt=0; hcnt < smp.holechildren.length; hcnt++){
				var hsmp = layer[ smp.holechildren[hcnt] ];
				for(pcnt=0; pcnt<hsmp.segments.length; pcnt++){
					if( hsmp.segments[pcnt].hasOwnProperty('x3') && options.qcpr ){
						str += '<circle cx="'+ hsmp.segments[pcnt].x2 * options.scale +'" cy="'+ hsmp.segments[pcnt].y2 * options.scale +'" r="'+ options.qcpr +'" fill="cyan" stroke-width="'+ options.qcpr * 0.2 +'" stroke="black" />';
						str += '<circle cx="'+ hsmp.segments[pcnt].x3 * options.scale +'" cy="'+ hsmp.segments[pcnt].y3 * options.scale +'" r="'+ options.qcpr +'" fill="white" stroke-width="'+ options.qcpr * 0.2 +'" stroke="black" />';
						str += '<line x1="'+ hsmp.segments[pcnt].x1 * options.scale +'" y1="'+ hsmp.segments[pcnt].y1 * options.scale +'" x2="'+ hsmp.segments[pcnt].x2 * options.scale +'" y2="'+ hsmp.segments[pcnt].y2 * options.scale +'" stroke-width="'+ options.qcpr * 0.2 +'" stroke="cyan" />';
						str += '<line x1="'+ hsmp.segments[pcnt].x2 * options.scale +'" y1="'+ hsmp.segments[pcnt].y2 * options.scale +'" x2="'+ hsmp.segments[pcnt].x3 * options.scale +'" y2="'+ hsmp.segments[pcnt].y3 * options.scale +'" stroke-width="'+ options.qcpr * 0.2 +'" stroke="cyan" />';
					}
					if( (!hsmp.segments[pcnt].hasOwnProperty('x3')) && options.lcpr){
						str += '<circle cx="'+ hsmp.segments[pcnt].x2 * options.scale +'" cy="'+ hsmp.segments[pcnt].y2 * options.scale +'" r="'+ options.lcpr +'" fill="white" stroke-width="'+ options.lcpr * 0.2 +'" stroke="black" />';
					}
				}
			}
		}// End of Rendering control points
			
		return str;
		
	},// End of svgpathstring()
	
	// Converting tracedata to an SVG string
	this.getsvgstring = function( tracedata, options ){
		
		options = _this.checkoptions(options);
		
		var w = tracedata.width * options.scale, h = tracedata.height * options.scale;
		
		// SVG start
		var svgstr = '<svg ' + (options.viewbox ? ('viewBox="0 0 '+w+' '+h+'" ') : ('width="'+w+'" height="'+h+'" ')) +
			'version="1.1" xmlns="http://www.w3.org/2000/svg" desc="Created with imagetracer.js version '+_this.versionnumber+'" >';

		// Drawing: Layers and Paths loops
		for(var lcnt=0; lcnt < tracedata.layers.length; lcnt++){
			for(var pcnt=0; pcnt < tracedata.layers[lcnt].length; pcnt++){
				
				// Adding SVG <path> string
				if( !tracedata.layers[lcnt][pcnt].isholepath ){
					svgstr += _this.svgpathstring( tracedata, lcnt, pcnt, options );
				}
					
			}// End of paths loop
		}// End of layers loop
		
		// SVG End
		svgstr+='</svg>';
		
		return svgstr;
		
	},// End of getsvgstring()
	
	// Comparator for numeric Array.sort
	this.compareNumbers = function(a,b){ return a - b; },
	
	// Convert color object to rgba string
	this.torgbastr = function(c){ return 'rgba('+c.r+','+c.g+','+c.b+','+c.a+')'; },
	
	// Convert color object to SVG color string
	this.tosvgcolorstr = function(c, options){
		return 'fill="rgb('+c.r+','+c.g+','+c.b+')" stroke="rgb('+c.r+','+c.g+','+c.b+')" stroke-width="'+options.strokewidth+'" opacity="'+c.a/255.0+'" ';
	},
	
	// Helper function: Appending an <svg> element to a container from an svgstring
	this.appendSVGString = function(svgstr,parentid){
		var div;
		if(parentid){
			div = document.getElementById(parentid);
			if(!div){
				div = document.createElement('div');
				div.id = parentid;
				document.body.appendChild(div);
			}
		}else{
			div = document.createElement('div');
			document.body.appendChild(div);
		}
		div.innerHTML += svgstr;
	},
	
	////////////////////////////////////////////////////////////
	//
	//  Canvas functions
	//
	////////////////////////////////////////////////////////////
	
	// Gaussian kernels for blur
	this.gks = [ [0.27901,0.44198,0.27901], [0.135336,0.228569,0.272192,0.228569,0.135336], [0.086776,0.136394,0.178908,0.195843,0.178908,0.136394,0.086776],
	             [0.063327,0.093095,0.122589,0.144599,0.152781,0.144599,0.122589,0.093095,0.063327], [0.049692,0.069304,0.089767,0.107988,0.120651,0.125194,0.120651,0.107988,0.089767,0.069304,0.049692] ],
	
	// Selective Gaussian blur for preprocessing
	this.blur = function(imgd,radius,delta){
		var i,j,k,d,idx,racc,gacc,bacc,aacc,wacc;
		
		// new ImageData
		var imgd2 = { width:imgd.width, height:imgd.height, data:[] };
		
		// radius and delta limits, this kernel
		radius = Math.floor(radius); if(radius<1){ return imgd; } if(radius>5){ radius = 5; } delta = Math.abs( delta ); if(delta>1024){ delta = 1024; }
		var thisgk = _this.gks[radius-1];
		
		// loop through all pixels, horizontal blur
		for( j=0; j < imgd.height; j++ ){
			for( i=0; i < imgd.width; i++ ){

				racc = 0; gacc = 0; bacc = 0; aacc = 0; wacc = 0;
				// gauss kernel loop
				for( k = -radius; k < radius+1; k++){
					// add weighted color values
					if( (i+k > 0) && (i+k < imgd.width) ){
						idx = (j*imgd.width+i+k)*4;
						racc += imgd.data[idx  ] * thisgk[k+radius];
						gacc += imgd.data[idx+1] * thisgk[k+radius];
						bacc += imgd.data[idx+2] * thisgk[k+radius];
						aacc += imgd.data[idx+3] * thisgk[k+radius];
						wacc += thisgk[k+radius];
					}
				}
				// The new pixel
				idx = (j*imgd.width+i)*4;
				imgd2.data[idx  ] = Math.floor(racc / wacc);
				imgd2.data[idx+1] = Math.floor(gacc / wacc);
				imgd2.data[idx+2] = Math.floor(bacc / wacc);
				imgd2.data[idx+3] = Math.floor(aacc / wacc);
				
			}// End of width loop
		}// End of horizontal blur
		
		// copying the half blurred imgd2
		var himgd = new Uint8ClampedArray(imgd2.data);
		
		// loop through all pixels, vertical blur
		for( j=0; j < imgd.height; j++ ){
			for( i=0; i < imgd.width; i++ ){

				racc = 0; gacc = 0; bacc = 0; aacc = 0; wacc = 0;
				// gauss kernel loop
				for( k = -radius; k < radius+1; k++){
					// add weighted color values
					if( (j+k > 0) && (j+k < imgd.height) ){
						idx = ((j+k)*imgd.width+i)*4;
						racc += himgd[idx  ] * thisgk[k+radius];
						gacc += himgd[idx+1] * thisgk[k+radius];
						bacc += himgd[idx+2] * thisgk[k+radius];
						aacc += himgd[idx+3] * thisgk[k+radius];
						wacc += thisgk[k+radius];
					}
				}
				// The new pixel
				idx = (j*imgd.width+i)*4;
				imgd2.data[idx  ] = Math.floor(racc / wacc);
				imgd2.data[idx+1] = Math.floor(gacc / wacc);
				imgd2.data[idx+2] = Math.floor(bacc / wacc);
				imgd2.data[idx+3] = Math.floor(aacc / wacc);
				
			}// End of width loop
		}// End of vertical blur
		
		// Selective blur: loop through all pixels
		for( j=0; j < imgd.height; j++ ){
			for( i=0; i < imgd.width; i++ ){
				
				idx = (j*imgd.width+i)*4;
				// d is the difference between the blurred and the original pixel
				d = Math.abs(imgd2.data[idx  ] - imgd.data[idx  ]) + Math.abs(imgd2.data[idx+1] - imgd.data[idx+1]) +
					Math.abs(imgd2.data[idx+2] - imgd.data[idx+2]) + Math.abs(imgd2.data[idx+3] - imgd.data[idx+3]);
				// selective blur: if d>delta, put the original pixel back
				if(d>delta){
					imgd2.data[idx  ] = imgd.data[idx  ];
					imgd2.data[idx+1] = imgd.data[idx+1];
					imgd2.data[idx+2] = imgd.data[idx+2];
					imgd2.data[idx+3] = imgd.data[idx+3];
				}
			}
		}// End of Selective blur
		
		return imgd2;
		
	},// End of blur()
	
	// Helper function: loading an image from a URL, then executing callback with canvas as argument
	this.loadImage = function(url,callback,options){
		var img = new Image();
		if(options && options.corsenabled){ img.crossOrigin = 'Anonymous'; }
		img.onload = function(){
			var canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			var context = canvas.getContext('2d');
			context.drawImage(img,0,0);
			callback(canvas);
		};
		img.src = url;
	},
	
	// Helper function: getting ImageData from a canvas
	this.getImgdata = function(canvas){
		var context = canvas.getContext('2d');
		return context.getImageData(0,0,canvas.width,canvas.height);
	},
	
	// Special palette to use with drawlayers()
	this.specpalette = [
		{r:0,g:0,b:0,a:255}, {r:128,g:128,b:128,a:255}, {r:0,g:0,b:128,a:255}, {r:64,g:64,b:128,a:255},
		{r:192,g:192,b:192,a:255}, {r:255,g:255,b:255,a:255}, {r:128,g:128,b:192,a:255}, {r:0,g:0,b:192,a:255},
		{r:128,g:0,b:0,a:255}, {r:128,g:64,b:64,a:255}, {r:128,g:0,b:128,a:255}, {r:168,g:168,b:168,a:255},
		{r:192,g:128,b:128,a:255}, {r:192,g:0,b:0,a:255}, {r:255,g:255,b:255,a:255}, {r:0,g:128,b:0,a:255}
	],
	
	// Helper function: Drawing all edge node layers into a container
	this.drawLayers = function(layers,palette,scale,parentid){
		scale = scale||1;
		var w,h,i,j,k;
		
		// Preparing container
		var div;
		if(parentid){
			div = document.getElementById(parentid);
			if(!div){
				div = document.createElement('div');
				div.id = parentid;
				document.body.appendChild(div);
			}
		}else{
			div = document.createElement('div');
			document.body.appendChild(div);
		}
		
		// Layers loop
		for (k in layers) {
			if(!layers.hasOwnProperty(k)){ continue; }
			
			// width, height
			w=layers[k][0].length; h=layers[k].length;
			
			// Creating new canvas for every layer
			var canvas = document.createElement('canvas'); canvas.width=w*scale; canvas.height=h*scale;
			var context = canvas.getContext('2d');
			
			// Drawing
			for(j=0; j<h; j++){
				for(i=0; i<w; i++){
					context.fillStyle = _this.torgbastr(palette[ layers[k][j][i]%palette.length ]);
					context.fillRect(i*scale,j*scale,scale,scale);
				}
			}
			
			// Appending canvas to container
			div.appendChild(canvas);
		}// End of Layers loop
	}// End of drawlayers
	
	;// End of function list
	
}// End of ImageTracer object

// export as AMD module / Node module / browser or worker variable
if(typeof define === 'function' && define.amd){
	define(function() { return new ImageTracer(); });
}else if(typeof module !== 'undefined'){
	module.exports = new ImageTracer();
}else if(typeof self !== 'undefined'){
	self.ImageTracer = new ImageTracer();
}else window.ImageTracer = new ImageTracer();

})();

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var after, domReady, every;

after = function(ms, fn) {
  var tid;
  tid = setTimeout(fn, ms);
  return {
    stop: function() {
      return clearTimeout(tid);
    }
  };
};

every = function(ms, fn) {
  var iid;
  iid = setInterval(fn, ms);
  return {
    stop: function() {
      return clearInterval(iid);
    }
  };
};

domReady = function(callback) {
  if (/in/.test(document.readyState)) {
    return after(10, function() {
      return domReady(callback);
    });
  } else {
    return callback();
  }
};

(function(exports) {
  var FD, Font, container, doneTestingFonts, fontAvailabilityChecker, genericFontFamilies, loadFonts, someCommonFontNames, startedLoading, testFonts, testedFonts;
  FD = exports.FontDetective = {};
  genericFontFamilies = ["serif", "sans-serif", "cursive", "fantasy", "monospace"];
  someCommonFontNames = "Helvetica,Lucida Grande,Lucida Sans,Tahoma,Arial,Geneva,Monaco,Verdana,Microsoft Sans Serif,Trebuchet MS,Courier New,Times New Roman,Courier,Lucida Bright,Lucida Sans Typewriter,URW Chancery L,Comic Sans MS,Georgia,Palatino Linotype,Lucida Sans Unicode,Times,Century Schoolbook L,URW Gothic L,Franklin Gothic Medium,Lucida Console,Impact,URW Bookman L,Helvetica Neue,Nimbus Sans L,URW Palladio L,Nimbus Mono L,Nimbus Roman No9 L,Arial Black,Sylfaen,MV Boli,Estrangelo Edessa,Tunga,Gautami,Raavi,Mangal,Shruti,Latha,Kartika,Vrinda,Arial Narrow,Century Gothic,Garamond,Book Antiqua,Bookman Old Style,Calibri,Cambria,Candara,Corbel,Monotype Corsiva,Cambria Math,Consolas,Constantia,MS Reference Sans Serif,MS Mincho,Segoe UI,Arial Unicode MS,Tempus Sans ITC,Kristen ITC,Mistral,Meiryo UI,Juice ITC,Papyrus,Bradley Hand ITC,French Script MT,Malgun Gothic,Microsoft YaHei,Gisha,Leelawadee,Microsoft JhengHei,Haettenschweiler,Microsoft Himalaya,Microsoft Uighur,MoolBoran,Jokerman,DFKai-SB,KaiTi,SimSun-ExtB,Freestyle Script,Vivaldi,FangSong,MingLiU-ExtB,MingLiU_HKSCS,MingLiU_HKSCS-ExtB,PMingLiU-ExtB,Copperplate Gothic Light,Copperplate Gothic Bold,Franklin Gothic Book,Maiandra GD,Perpetua,Eras Demi ITC,Felix Titling,Franklin Gothic Demi,Pristina,Edwardian Script ITC,OCR A Extended,Engravers MT,Eras Light ITC,Franklin Gothic Medium Cond,Rockwell Extra Bold,Rockwell,Curlz MT,Blackadder ITC,Franklin Gothic Heavy,Franklin Gothic Demi Cond,Lucida Handwriting,Segoe UI Light,Segoe UI Semibold,Lucida Calligraphy,Cooper Black,Viner Hand ITC,Britannic Bold,Wide Latin,Old English Text MT,Broadway,Footlight MT Light,Harrington,Snap ITC,Onyx,Playbill,Bauhaus 93,Baskerville Old Face,Algerian,Matura MT Script Capitals,Stencil,Batang,Chiller,Harlow Solid Italic,Kunstler Script,Bernard MT Condensed,Informal Roman,Vladimir Script,Bell MT,Colonna MT,High Tower Text,Californian FB,Ravie,Segoe Script,Brush Script MT,SimSun,Arial Rounded MT Bold,Berlin Sans FB,Centaur,Niagara Solid,Showcard Gothic,Niagara Engraved,Segoe Print,Gabriola,Gill Sans MT,Iskoola Pota,Calisto MT,Script MT Bold,Century Schoolbook,Berlin Sans FB Demi,Magneto,Arabic Typesetting,DaunPenh,Mongolian Baiti,DokChampa,Euphemia,Kalinga,Microsoft Yi Baiti,Nyala,Bodoni MT Poster Compressed,Goudy Old Style,Imprint MT Shadow,Gill Sans MT Condensed,Gill Sans Ultra Bold,Palace Script MT,Lucida Fax,Gill Sans MT Ext Condensed Bold,Goudy Stout,Eras Medium ITC,Rage Italic,Rockwell Condensed,Castellar,Eras Bold ITC,Forte,Gill Sans Ultra Bold Condensed,Perpetua Titling MT,Agency FB,Tw Cen MT,Gigi,Tw Cen MT Condensed,Aparajita,Gloucester MT Extra Condensed,Tw Cen MT Condensed Extra Bold,PMingLiU,Bodoni MT,Bodoni MT Black,Bodoni MT Condensed,MS Gothic,GulimChe,MS UI Gothic,MS PGothic,Gulim,MS PMincho,BatangChe,Dotum,DotumChe,Gungsuh,GungsuhChe,MingLiU,NSimSun,SimHei,DejaVu Sans,DejaVu Sans Condensed,DejaVu Sans Mono,DejaVu Serif,DejaVu Serif Condensed,Eurostile,Matisse ITC,Bitstream Vera Sans Mono,Bitstream Vera Sans,Staccato222 BT,Bitstream Vera Serif,Broadway BT,ParkAvenue BT,Square721 BT,Calligraph421 BT,MisterEarl BT,Cataneo BT,Ruach LET,Rage Italic LET,La Bamba LET,Blackletter686 BT,John Handy LET,Scruff LET,Westwood LET".split(",").sort();
  testedFonts = [];
  doneTestingFonts = false;
  startedLoading = false;
  container = document.createElement("div");
  container.id = "font-detective";

  /*
  	 * A font class that can be stringified for use in css
  	 * e.g. font.toString() or (font + ", sans-serif")
   */
  Font = (function() {
    function Font(name, type, style) {
      this.name = name;
      this.type = type;
      this.style = style;
    }

    Font.prototype.toString = function() {
      return '"' + this.name.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + '"';
    };

    return Font;

  })();
  fontAvailabilityChecker = (function() {
    var baseFontFamilies, baseHeights, baseWidths, span;
    baseFontFamilies = ["monospace", "sans-serif", "serif"];
    span = document.createElement("span");
    span.innerHTML = "mmmmmmmmmmlli";
    span.style.fontSize = "72px";
    baseWidths = {};
    baseHeights = {};
    return {
      init: function() {
        var baseFontFamily, j, len, results;
        document.body.appendChild(container);
        results = [];
        for (j = 0, len = baseFontFamilies.length; j < len; j++) {
          baseFontFamily = baseFontFamilies[j];
          span.style.fontFamily = baseFontFamily;
          container.appendChild(span);
          baseWidths[baseFontFamily] = span.offsetWidth;
          baseHeights[baseFontFamily] = span.offsetHeight;
          results.push(container.removeChild(span));
        }
        return results;
      },
      check: function(font) {
        var baseFontFamily, differs, j, len;
        for (j = 0, len = baseFontFamilies.length; j < len; j++) {
          baseFontFamily = baseFontFamilies[j];
          span.style.fontFamily = font + ", " + baseFontFamily;
          container.appendChild(span);
          differs = span.offsetWidth !== baseWidths[baseFontFamily] || span.offsetHeight !== baseHeights[baseFontFamily];
          container.removeChild(span);
          if (differs) {
            return true;
          }
        }
        return false;
      }
    };
  })();
  loadFonts = function() {
    if (startedLoading) {
      return;
    }
    startedLoading = true;
    FD.incomplete = true;
    return domReady((function(_this) {
      return function() {
        var fontName;
        return testFonts((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = someCommonFontNames.length; j < len; j++) {
            fontName = someCommonFontNames[j];
            results.push(new Font(fontName));
          }
          return results;
        })());
      };
    })(this));
  };
  testFonts = function(fonts) {
    var i, testingFonts;
    fontAvailabilityChecker.init();
    i = 0;
    return testingFonts = every(20, function() {
      var available, callback, font, j, k, l, len, len1, ref, ref1;
      for (j = 0; j <= 5; j++) {
        font = fonts[i];
        available = fontAvailabilityChecker.check(font);
        if (available) {
          testedFonts.push(font);
          ref = FD.each.callbacks;
          for (k = 0, len = ref.length; k < len; k++) {
            callback = ref[k];
            callback(font);
          }
        }
        i++;
        if (i >= fonts.length) {
          testingFonts.stop();
          ref1 = FD.all.callbacks;
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            callback = ref1[l];
            callback(testedFonts);
          }
          FD.all.callbacks = [];
          FD.each.callbacks = [];
          doneTestingFonts = true;
          return;
        }
      }
    });
  };

  /*
  	 * FontDetective.preload()
  	 * Starts detecting fonts early
   */
  FD.preload = loadFonts;

  /*
  	 * FontDetective.each(function(font){})
  	 * Calls back with a `Font` every time a font is detected and tested
   */
  FD.each = function(callback) {
    var font, j, len;
    for (j = 0, len = testedFonts.length; j < len; j++) {
      font = testedFonts[j];
      callback(font);
    }
    if (!doneTestingFonts) {
      FD.each.callbacks.push(callback);
      return loadFonts();
    }
  };
  FD.each.callbacks = [];

  /*
  	 * FontDetective.all(function(fonts){})
  	 * Calls back with an `Array` of `Font`s when all fonts are detected and tested
   */
  FD.all = function(callback) {
    if (doneTestingFonts) {
      return callback(testedFonts);
    } else {
      FD.all.callbacks.push(callback);
      return loadFonts();
    }
  };
  return FD.all.callbacks = [];
})(window);


},{}]},{},[1]);

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.FileSaver = mod.exports;
  }
})(this, function () {
  "use strict";

  /*
  * FileSaver.js
  * A saveAs() FileSaver implementation.
  *
  * By Eli Grey, http://eligrey.com
  *
  * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
  * source  : http://purl.eligrey.com/github/FileSaver.js
  */
  // The one and only way of getting global scope in all environments
  // https://stackoverflow.com/q/3277182/1008999
  var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;

  function bom(blob, opts) {
    if (typeof opts === 'undefined') opts = {
      autoBom: false
    };else if (typeof opts !== 'object') {
      console.warn('Deprecated: Expected third argument to be a object');
      opts = {
        autoBom: !opts
      };
    } // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF

    if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(0xFEFF), blob], {
        type: blob.type
      });
    }

    return blob;
  }

  function download(url, name, opts) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      saveAs(xhr.response, name, opts);
    };

    xhr.onerror = function () {
      console.error('could not download file');
    };

    xhr.send();
  }

  function corsEnabled(url) {
    var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker

    xhr.open('HEAD', url, false);

    try {
      xhr.send();
    } catch (e) {}

    return xhr.status >= 200 && xhr.status <= 299;
  } // `a.click()` doesn't work for all browsers (#465)


  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent('click'));
    } catch (e) {
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  } // Detect WebView inside a native macOS app by ruling out all browsers
  // We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
  // https://www.whatismybrowser.com/guides/the-latest-user-agent/macos


  var isMacOSWebView = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);
  var saveAs = _global.saveAs || ( // probably in some web worker
  typeof window !== 'object' || window !== _global ? function saveAs() {}
  /* noop */
  // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
  : 'download' in HTMLAnchorElement.prototype && !isMacOSWebView ? function saveAs(blob, name, opts) {
    var URL = _global.URL || _global.webkitURL;
    var a = document.createElement('a');
    name = name || blob.name || 'download';
    a.download = name;
    a.rel = 'noopener'; // tabnabbing
    // TODO: detect chrome extensions & packaged apps
    // a.target = '_blank'

    if (typeof blob === 'string') {
      // Support regular links
      a.href = blob;

      if (a.origin !== location.origin) {
        corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
      } else {
        click(a);
      }
    } else {
      // Support blobs
      /*a.href = URL.createObjectURL(blob);
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
      }, 4E4); // 40s

      setTimeout(function () {
        click(a);
      }, 0);*/
      	let href = window.location.href
		let url = new URL(href);
		let filePath = url.searchParams.get("path");
		blob.arrayBuffer().then(buffer => {
			let data = new Uint8Array(buffer);
  			fetch(filePath, { method: 'PUT', headers: {}, body: data }).then(function(response) {
				console.log('saved file');
    		});    
		});
    }
  } // Use msSaveOrOpenBlob as a second approach
  : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
    name = name || blob.name || 'download';

    if (typeof blob === 'string') {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        var a = document.createElement('a');
        a.href = blob;
        a.target = '_blank';
        setTimeout(function () {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  } // Fallback to using FileReader and a popup
  : function saveAs(blob, name, opts, popup) {
    // Open a popup immediately do go around popup blocker
    // Mostly only available on user interaction and the fileReader is async so...
    popup = popup || open('', '_blank');

    if (popup) {
      popup.document.title = popup.document.body.innerText = 'downloading...';
    }

    if (typeof blob === 'string') return download(blob, name, opts);
    var force = blob.type === 'application/octet-stream';

    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== 'undefined') {
      // Safari doesn't allow downloading of blob URLs
      var reader = new FileReader();

      reader.onloadend = function () {
        var url = reader.result;
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
        if (popup) popup.location.href = url;else location = url;
        popup = null; // reverse-tabnabbing #460
      };

      reader.readAsDataURL(blob);
    } else {
      var URL = _global.URL || _global.webkitURL;
      var url = URL.createObjectURL(blob);
      if (popup) popup.location = url;else location.href = url;
      popup = null; // reverse-tabnabbing #460

      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4E4); // 40s
    }
  });
  _global.saveAs = saveAs.saveAs = saveAs;

  if (typeof module !== 'undefined') {
    module.exports = saveAs;
  }
});

