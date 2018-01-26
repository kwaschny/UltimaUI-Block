/* globals jQuery, UltimaBlock */
'use strict';

if (!window.UltimaBlock) {

	// BEGIN: check dependencies

		if (jQuery === undefined) {

			throw new Error('jQuery missing for UltimaBlock');
		}

		// feature detection
		if (!jQuery.isPlainObject) {

			throw new Error('jQuery 1.4+ required for UltimaBlock');
		}

	// END: check dependencies

	window.UltimaBlock = function(target, options) {

		// prevent skipping the constructor
		if (!(this instanceof UltimaBlock)) {

			return new UltimaBlock(options);
		}

		// force jQuery wrap
		target = jQuery(target);

		// re-use existing block
		var i = 0, len = UltimaBlock.collection.length;
		for (i; i < len; i++) {

			if (target[0] === UltimaBlock.collection[i].target[0]) {

				var overlay = UltimaBlock.collection[i];
				overlay.options.current = overlay._.methods.mergeOptions(overlay.options.current, options);

				return overlay;
			}
		}

		// private scope
		this._ = {};

		// closure reference
		var self = this;

		// BEGIN: public properties

			this.target 	= target;
			this.overlay 	= null;
			this.message 	= null;

			// BEGIN: options

				this.options = {};
				this.options.current = {};

				this.options['default'] = {

					message: 			'',

					behavior: {

						// increment zIndex with each parallel overlay
						zIndexInc: true

					},

					css: {

						overlay: {

							// class added to the overlay element
							className: 	'',

							// start z-index
							zIndex: 	9001

						},

						message: {

							// class added to the message element
							className: 	'',

							// positioning offset
							offset: {
								x: 0,
								y: 0
							},

							// viewport to base the positioning on
							viewport: 	'auto',

							// horizontal position of the message, either in px or in %
							x: 			'50%',

							// vertical position of the message, either in px or in %
							y: 			'50%'

						}

					},

					callbacks: {

						// before blocking
						onBlocking: 	undefined, // (UltimaBlock) 			: return false to interrupt

						// before unblocking
						onUnblocking: 	undefined  // (UltimaBlock) 			: return false to interrupt

					}

				};

			// END: options

		// END: public properties

		// BEGIN: private properties

			this._.properties = {

				classNames: {
					overlay: 'UltimaBlock-overlay',
					message: 'UltimaBlock-message'
				}

			};

		// END: private properties

		// BEGIN: public methods

			this.block = function(message) {

				// callback: on blocking
				if (jQuery.isFunction(this.options.current.callbacks.onBlocking)) {

					if (this.options.current.callbacks.onBlocking(this) === false) {

						return false;
					}
				}

				// BEGIN: create overlay

					if ( (this.overlay === null) || (!document.body.contains(this.overlay.dom.element[0])) ) {

						// build overlay
						this.overlay 	= this._.methods.createOverlay();

						// force relative positioning
						this.target.css({
							position: 'relative'
						});

						// append overlay to target
						this.target.append(
							this.overlay.dom.element
						);
					}

				// END: create overlay

				// BEGIN: create message

					if ( (this.message === null) || (!document.body.contains(this.message.dom.outerElement[0])) ) {

						// build message
						this.message 	= this._.methods.createMessage();

						// append message to overlay
						this.overlay.dom.element.append(
							this.message.dom.outerElement
						);
					}

				// END: create message

				this.message.set(message);

				this.overlay.show();
				this.message.show();
			};

			this.unblock = function() {

				// callback: on unblocking
				if (jQuery.isFunction(this.options.current.callbacks.onUnblocking)) {

					if (this.options.current.callbacks.onUnblocking(this) === false) {

						return false;
					}
				}

				if (this.overlay === null) {

					return false;
				}

				this.overlay.hide();
			};

		// END: public methods

		// BEGIN: private methods

			this._.methods = {

				createOverlay: function() {

					var overlay = {

						// BEGIN: public properties

							dom: {

								element: jQuery('<div></div>').hide()

							},

						// END: public properties

						// BEGIN: public methods

							// hide overlay
							hide: function() {

								this.dom.element.hide();
							},

							// show overlay
							show: function() {

								this.dom.element.show();

								// immediately reposition content
								this._.methods.reposition();
							},

						// END: public methods

						_: {

							// BEGIN: private methods

								methods: {

									reposition: function() {

										var overlayW, overlayH;

										if (typeof self.options.current.css.message.viewport.width === 'number') {

											overlayW = self.options.current.css.message.viewport.width;

										} else {

											overlayW = self.overlay.dom.element.outerWidth();
										}

										if (typeof self.options.current.css.message.viewport.height === 'number') {

											overlayH = self.options.current.css.message.viewport.height;

										} else {

											overlayH = self.overlay.dom.element.outerHeight();
										}

										var messageW = self.message.dom.innerElement.width();
										var messageH = self.message.dom.innerElement.height();

										var left, top;

										// x
										if (/^[0-9]{1,3}%$/.test(self.options.current.css.message.x)) {

											left = (((self.options.current.css.message.x.replace('%', '') * overlayW) / 100) - (messageW / 2));

										} else {

											left = self.options.current.css.message.x;
										}

										// y
										if (/^[0-9]{1,3}%$/.test(self.options.current.css.message.y)) {

											top = (((self.options.current.css.message.y.replace('%', '') * overlayH) / 100) - (messageH / 2));

										} else {

											top = self.options.current.css.message.y;
										}

										self.message.dom.innerElement.css({
											left: 	(left + self.options.current.css.message.offset.x),
											top: 	(top  + self.options.current.css.message.offset.y)
										});
									}

								}

							// END: private methods

						}

					};

					// BEGIN: build element

						// BEGIN: appearance

							// class
							overlay.dom.element.addClass(self._.properties.classNames.overlay);
							overlay.dom.element.addClass(self.options.current.css.overlay.className);

							// BEGIN: inline CSS

								var cssAttr = {};

								if (!self.options.current.css.overlay.className) {

									cssAttr.backgroundColor = 'rgba(0, 0, 0, 0.50)';
								}

								jQuery.extend(true, cssAttr, self.options.current.css.overlay);
								jQuery.extend(true, cssAttr, {
									bottom: 	0,
									height: 	'100%',
									left: 		0,
									margin: 	0,
									position: 	'absolute',
									right: 		0,
									top: 		0,
									width: 		'100%',
									zIndex: 	(self.options.current.css.overlay.zIndex + (self.options.current.behavior.zIndexInc ? UltimaBlock.collection.length : 0 ))
								});

								// style
								overlay.dom.element.css(cssAttr);

							// END: inline CSS

						// END: appearance

					// END: build element

					return overlay;
				},

				createMessage: function() {

					var message = {

						// BEGIN: public properties

							dom: {

								outerElement: jQuery('<div></div>'),
								innerElement: jQuery('<div></div>')

							},

						// END: public properties

						// BEGIN: public methods

							hide: function() {

								this.dom.outerElement.hide();
							},

							set: function(content) {

								this.dom.innerElement.html(content);
							},

							show: function() {

								this.dom.outerElement.show();
							},

						// END: public methods

					};

					// BEGIN: build element

						// BEGIN: appearance

							// class
							message.dom.innerElement.addClass(self._.properties.classNames.message);
							message.dom.innerElement.addClass(self.options.current.css.message.className);

							// BEGIN: inline CSS

								// force relative positioning
								message.dom.outerElement.css({
									height: 	'100%',
									position: 	'relative',
									width: 		'100%',
								});

								var cssAttr = {};

								if (!self.options.current.css.message.className) {

									cssAttr.color = '#FFFFFF';
								}

								jQuery.extend(true, cssAttr, self.options.current.css.message);
								jQuery.extend(true, cssAttr, {
									position: 'absolute'
								});

								// style
								message.dom.innerElement.css(cssAttr);

							// END: inline CSS

						// END: appearance

						// connect elements
						message.dom.outerElement.append(
							message.dom.innerElement
						);

					// END: build element

					return message;
				},

				mergeOptions: function(options1, options2) {

					self._.methods.translateOptions(options2);

					var result = {};
					jQuery.extend(true, result, options1);
					jQuery.extend(true, result, options2);

					return result;
				},

				translateOptions: function(options) {

					var buffer, length, i, result, ref;

					for (var key in options) {

						if (!options.hasOwnProperty(key)) {

							continue;
						}

						if (key.indexOf('->') !== 0) {

							continue;
						}

						buffer = key.replace('->', '');
						buffer = buffer.split('.');
						length = buffer.length;

						result = {};
						ref = result;

						for (i = 0; i < (length - 1); i++) {

							ref[buffer[i]] = {};
							ref = ref[buffer[i]];
						}

						ref[buffer[length - 1]] = options[key];

						delete options[key];
						jQuery.extend(true, options, result);
					}

					return options;
				}

			};

		// END: private methods

		// BEGIN: constructor

			// prepare options
			this.options.current = this._.methods.mergeOptions(this.options['default'], UltimaBlock.options);
			this.options.current = this._.methods.mergeOptions(this.options.current, options);

		// END: constructor

		// register as new block
		UltimaBlock.collection.push(this);

	};

	// keep track of the active blocks
	UltimaBlock.collection = [];

	UltimaBlock.options = {};

	// BEGIN: jQuery integration

		// option defaults for all jQuery integrated calls
		jQuery.UltimaBlock = {
			options: {}
		};

		jQuery.UltimaBlock.block = function(target, options) {

			var mergedOptions = {};
			jQuery.extend(true, mergedOptions, jQuery.UltimaBlock.options);
			jQuery.extend(true, mergedOptions, options);

			var overlay = new UltimaBlock(target, mergedOptions);
			overlay.block();

			return overlay;
		};

		jQuery.UltimaBlock.unblock = function(target, options) {

			var mergedOptions = {};
			jQuery.extend(true, mergedOptions, jQuery.UltimaBlock.options);
			jQuery.extend(true, mergedOptions, options);

			var overlay = new UltimaBlock(target, mergedOptions);
			overlay.unblock();

			return overlay;
		};

		jQuery.fn.block = function(message, options) {
			//            function(message)
			//            function(options)

			if (options === undefined) {

				// options
				if (typeof message !== 'string') {

					options = message;
				}
			}

			var mergedOptions = {};
			jQuery.extend(true, mergedOptions, jQuery.UltimaBlock.options);
			jQuery.extend(true, mergedOptions, options);

			this.each(function() {

				new UltimaBlock(this, mergedOptions).block(message);
			});

			return this;
		};

		jQuery.fn.unblock = function(options) {

			var mergedOptions = {};
			jQuery.extend(true, mergedOptions, jQuery.UltimaBlock.options);
			jQuery.extend(true, mergedOptions, options);

			this.each(function() {

				new UltimaBlock(this, mergedOptions).unblock();
			});

			return this;
		};

	// END: jQuery integration

	UltimaBlock.version = '0.3.5';
}