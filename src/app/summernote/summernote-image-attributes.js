
/* https://github.com/adeelhussain/summernote-image-attribute-editor */
(function (factory) {

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory)
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory(require('jquery'));
	} else {
		factory(window.jQuery)
	}
}
	(function ($) {
		// TODO: Add more languages!
		$.extend(true, $.summernote.lang, {
			'en-US': {
				imageAttributes: {
					edit: 'Edit Attributes',
					titleLabel: 'Title',
					altLabel: 'Alternative Text',
					captionLabel: '캡션(이미지 하단 배치)',
					linkLabel: '링크(a tag href)',
					tooltip: 'Edit Image',
					dialogSaveBtnMessage: '저장',
					dialogTitle: '이미지 속성 변경 팝업'
				}
			}
		});
		$.extend($.summernote.options, {
			imageAttributes: {
				icon: '<i class="note-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14"><path d="M 8.781,11.11 7,11.469 7.3595,9.688 8.781,11.11 Z M 7.713,9.334 9.135,10.7565 13,6.8915 11.5775,5.469 7.713,9.334 Z M 6.258,9.5 8.513,7.12 7.5,5.5 6.24,7.5 5,6.52 3,9.5 6.258,9.5 Z M 4.5,5.25 C 4.5,4.836 4.164,4.5 3.75,4.5 3.336,4.5 3,4.836 3,5.25 3,5.6645 3.336,6 3.75,6 4.164,6 4.5,5.6645 4.5,5.25 Z m 1.676,5.25 -4.176,0 0,-7 9,0 0,1.156 1,0 0,-2.156 -11,0 0,9 4.9845,0 0.1915,-1 z"/></svg></i>',
				figureClass: '',
				figcaptionClass: '',
				captionText: 'Caption Goes Here.',
				tooltip: 'Edit Image Attributes',
			}
		});
		$.extend($.summernote.plugins, {
			'imageAttributes': function (context) {
				var self = this;
				var ui = $.summernote.ui,
					$editable = context.layoutInfo.editable,
					options = context.options,
					$editor = context.layoutInfo.editor,
					lang = options.langInfo,
					$note = context.layoutInfo.note;

				context.memo('button.imageAttributes', function () {
					var button = ui.button({
						contents: options.imageAttributes.icon,
						// container: false,
						container: $editor,
						// tooltip: lang.imageAttributes.tooltip,
						tooltip: options.imageAttributes.tooltip,
						click: function () {
							context.invoke('imageAttributes.show');
						}
					});
					return button.render();
				});

				this.initialize = function () {
					// Either the modal appends in Body or Inside the Editor
					var $container = options.imageAttributes.dialogsInBody ? $(document.body) : $editor;

					var body = ` <div class="form-group">
									<label class="note-form-label">${lang.imageAttributes.titleLabel}</label>
									<input class="form-control note-input note-image-title-text" type="text" />
								</div>
								<div class="form-group">
									<label class="note-form-label">${lang.imageAttributes.altLabel}</label>
									<input class="form-control note-input note-image-alt-text" type="text" />
								</div>
								<div class="form-group">
									<label class="note-form-label">${lang.imageAttributes.captionLabel}</label>
									<input class="form-control note-input note-image-caption-text" type="text" />
								</div>
								<div class="form-group">
									<label class="note-form-label">${lang.imageAttributes.linkLabel}</label>
									<input class="form-control note-input note-image-link-text" type="text" />
								</div>`;

					var footer = `<button href="#" class="btn btn-primary note-image-title-btn note-btn">${lang.imageAttributes.dialogSaveBtnMessage}</button>`;

					this.$dialog = ui.dialog({
						title: lang.imageAttributes.dialogTitle,
						body: body,
						footer: footer
					}).render().appendTo($container);

				};

				this.destroy = function () {
					ui.hideDialog(this.$dialog);
					this.$dialog.remove();
				};

				this.bindEnterKey = function ($input, $btn) {
					$input.on('keypress', function (event) {
						if (event.keyCode === 13) {
							$btn.trigger('click');
						}
					});
				};

				this.show = function () {
					var $img = $($editable.data('target'));
					var _imgInfo = {
						title: $img.attr('title'),
						alt: $img.attr('alt'),
						caption: $img.parent().attr('href') ? $img.parent().next('figcaption').text() : $img.next('figcaption').text(),
						link: $img.parent().attr('href'),
					};
					// var img = new Image();
					// img.src = $img.attr('src');

					this.showLinkDialog(_imgInfo)
						.then((imgInfo) => {
							ui.hideDialog(self.$dialog);
							var isAnyChangeMade = false;

							// NOTE: Must add more conditions if any new field is being added!
							if (_imgInfo.title != imgInfo.title 
								|| _imgInfo.alt != imgInfo.alt 
								|| _imgInfo.caption != imgInfo.caption
								|| _imgInfo.link != imgInfo.link ) {
								isAnyChangeMade = true;
							}

							if (imgInfo.alt) {
								$img.attr('alt', imgInfo.alt);
							}
							else {
								$img.removeAttr('alt');
							}

							if (imgInfo.title) {
								$img.attr('title', imgInfo.title);
							}
							else {
								$img.removeAttr('title');
							}

							var captionText = imgInfo.caption;
							var $parentAnchorLink = $img.parent();

							// If caption are not same, then its mean need to update!
							var isUpdateCaption = (captionText !== _imgInfo.caption);

							var linkText = imgInfo.link;

							if(linkText) {
								if ($parentAnchorLink.is('a') && linkText) {
									// a 의 href 를 변경
									$parentAnchorLink.attr('href', linkText);
									$parentAnchorLink.attr('target', '_blank');
								} else {
									// a 태그가 없으면 생성
									$parentAnchorLink = $img.wrap(`<a href="${linkText}" target="_blank"></a>`).parent();
								}
							}

							// If image already have a caption and is equal to old one, then remove that!
							var $imgFigure = $img.closest('figure');
							if ($imgFigure.length && isUpdateCaption) {

								// Means image wrpped in figure
								$imgFigure.find('figcaption').remove();
								$imgFigure.children().first().unwrap();
							}

							// If caption text is present then add that caption, otherwise don't do any thing
							if (isUpdateCaption && captionText) {
								var $newFigure;
								if ($parentAnchorLink.is('a')) {
									$newFigure = $parentAnchorLink.wrap(`<figure class="${options.imageAttributes.figureClass}"></figure>`).parent();
									$newFigure.append(`<figcaption class="${options.imageAttributes.figcaptionClass}"> ${captionText}</figcaption>`);
								} else {
									$newFigure = $img.wrap(`<figure class="${options.imageAttributes.figureClass}"></figure>`).parent();
									$img.after(`<figcaption class="${options.imageAttributes.figcaptionClass}">${captionText}</figcaption>`);
								}
							}

							if (isAnyChangeMade) {
								var _content = context.invoke('code');

								$note.val(_content);
								$note.trigger('summernote.change', _content);
								$note.change();

								const $summernote = $('#summernote');
								const $editable = $summernote.summernote('editable');
								context.triggerEvent('change', _content, $editable);
							}
						});
				};

				this.showLinkDialog = function (imgInfo) {
					return $.Deferred(function (deferred) {
						var $imageTitle = self.$dialog.find('.note-image-title-text');
						var $imageCaption = self.$dialog.find('.note-image-caption-text');
						var $imageLink = self.$dialog.find('.note-image-link-text');
						var $imageAlt = self.$dialog.find('.note-image-alt-text');
						var $editBtn = self.$dialog.find('.note-image-title-btn');
						var $lockButton = self.$dialog.find('.lock-button');
						var $resetSizeButton = self.$dialog.find('.reset-size-buttton');
						var $unlockIcon = $lockButton.find('.icon-unlock');
						var $lockIcon = $lockButton.find('.icon-lock');

						var isLocked = (typeof options.imageAttributes.manageAspectRatio === 'undefined') ? true: options.imageAttributes.manageAspectRatio;
						if(isLocked){
							$unlockIcon.addClass('hide').removeClass('show');
							$lockIcon.addClass('show').removeClass('hide');	
						}
						else {
							$unlockIcon.addClass('show').removeClass('hide');
							$lockIcon.addClass('hide').removeClass('show');	
						}

						$lockButton.on('click', function (event) {
							event.preventDefault();
							isLocked = !isLocked;

							if (isLocked) {

								$unlockIcon.addClass('hide').removeClass('show')
								$lockIcon.addClass('show').removeClass('hide')
							}
							else {

								$unlockIcon.addClass('show').removeClass('hide')
								$lockIcon.addClass('hide').removeClass('show')
							}
						});

						ui.onDialogShown(self.$dialog, function () {
							context.triggerEvent('dialog.shown');

							$editBtn.on('click', function (event) {
								event.preventDefault();
								deferred.resolve({
									title: $imageTitle.val(),
									alt: $imageAlt.val(),
									caption: $imageCaption.val(),
									link: $imageLink.val(),
								});
							});

							$imageTitle.val(imgInfo.title).trigger('focus');
							self.bindEnterKey($imageTitle, $editBtn);

							$imageAlt.val(imgInfo.alt);
							self.bindEnterKey($imageAlt, $editBtn);

							$imageCaption.val(imgInfo.caption);
							self.bindEnterKey($imageCaption, $editBtn);

							$imageLink.val(imgInfo.link);
							self.bindEnterKey($imageLink, $editBtn);
						});

						ui.onDialogHidden(self.$dialog, function () {
							$editBtn.off('click');
							$lockButton.off('click');
							$resetSizeButton.off('click');
							$unlockIcon.off('click');
							$lockIcon.off('click');


							if (deferred.state() === 'pending') {
								deferred.reject();
							}
						});
						ui.showDialog(self.$dialog);
					});
				};
			}
		});
	}));