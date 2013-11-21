(function ($) {
	/*
	* Editable 1.3.3
	*
	* Copyright (c) 2009 Arash Karimzadeh (arashkarimzadeh.com)
	* Licensed under the MIT (MIT-LICENSE.txt)
	* http://www.opensource.org/licenses/mit-license.php
	*
	* Date: Mar 02 2009
	* Siva: Added validate event to support validation if required.
	* caller should supply a validation function which returns tru or false.
	*/
	$.fn.editable = function (options) {
		var defaults = {
			onEdit: null,
			validate: null,
			onSubmit: null,
			onCancel: null,
			editClass: null,
			submit: null,
			cancel: null,
			type: 'text', //text, textarea or select
			submitBy: 'blur', //blur,change,dblclick,click
			editBy: 'click',
			options: null,
			errorMessage: "Input field contains invalid characters"
		};
		if (options == 'disable')
			return this.unbind(this.data('editable.options').editBy, this.data('editable.options').toEditable);
		if (options == 'enable')
			return this.bind(this.data('editable.options').editBy, this.data('editable.options').toEditable);
		if (options == 'destroy')
			return this.unbind(this.data('editable.options').editBy, this.data('editable.options').toEditable)
				.data('editable.previous', null)
				.data('editable.current', null)
				.data('editable.options', null);

		var options = $.extend(defaults, options);

		options.toEditable = function () {
			$this = $(this);
			if ($('#editedValueError').length > 0) {
				$('#editedvalue').focus();
				return false;
			}
			if ($this.find('input').length == 0)
				$this.data('editable.current', $this.text());
			opts = $this.data('editable.options');
			if ($this.find('input').length == 0)
				$.editableFactory[opts.type].toEditable($this.empty(), opts);
			// Configure events,styles for changed content
			$this.data('editable.previous', $this.data('editable.current'))
				.children()
				.focus()
				.addClass(opts.editClass);
			// Submit Event
			if (opts.submit) {
				$('<button/>').appendTo($this)
					.html(opts.submit)
					.one('mouseup', function () { opts.toNonEditable($(this).parent(), true); });
			} else
				$this.one(opts.submitBy, function () { opts.toNonEditable($(this), true); })
					.children()
					.one(opts.submitBy, function () { opts.toNonEditable($(this).parent(), true); });
			// Cancel Event
			if (opts.cancel)
				$('<button/>').appendTo($this)
					.html(opts.cancel)
					.one('mouseup', function () { opts.toNonEditable($(this).parent(), false); });
			// Call User Function
			if ($.isFunction(opts.onEdit))
				opts.onEdit.apply($this,
					[{
						current: $this.data('editable.current'),
						previous: $this.data('editable.previous')
					}]
				);
		};
		options.toNonEditable = function ($this, change) {
			opts = $this.data('editable.options');
			// Configure events,styles for changed content
			var validateFunc;
			if ($.isFunction(opts.validate) && change == true)
				validateFunc = opts.validate;
			if (change && validateFunc != null) {
				var result = validateFunc.apply($this,
					[{
						current: $.editableFactory[opts.type].getValue($this, opts),
						previous: $this.data('editable.previous')
					}]
				);
				if (result && !result.IsValid) {
					var errorMessage = opts.errorMessage;
					if (result.ErrorMessage)
						errorMessage = result.ErrorMessage;
					var inputField = $this.find('input');
					if ($('#editedValueError').length == 0) {
						inputField.after('<span id="editedValueError" class="field-validation-error" style="float:none">' + errorMessage + '</span>');
					} else {
						$('#editedValueError').html(errorMessage);
					}
					inputField.one(opts.submitBy, function () { opts.toNonEditable($(this).parent(), true); });
					inputField.focus().select();
					return false;
				} else
					$('#editedValueError').remove();
			}
			$this.one(opts.editBy, opts.toEditable)
				.data('editable.current',
					change
						? $.editableFactory[opts.type].getValue($this, opts)
						: $this.data('editable.current')
				)
				.text(
					opts.type == 'password'
						? '*****'
						: $this.data('editable.current')
				);
			// Call User Function
			var func = null;
			if ($.isFunction(opts.onSubmit) && change == true)
				func = opts.onSubmit;
			else if ($.isFunction(opts.onCancel) && change == false)
				func = opts.onCancel;
			if (func != null)
				func.apply($this,
					[{
						current: $this.data('editable.current'),
						previous: $this.data('editable.previous')
					}]
				);
		};
		this.data('editable.options', options);
		return this.one(options.editBy, options.toEditable);
	};
	$.editableFactory = {
		'text': {
			toEditable: function ($this, options) {
				$('<input id="editedvalue"/>').appendTo($this)
					.val($this.data('editable.current'));
			},
			getValue: function ($this, options) {
				return $this.children().val();
			}
		},
		'password': {
			toEditable: function ($this, options) {
				$this.data('editable.current', $this.data('editable.password'));
				$this.data('editable.previous', $this.data('editable.password'));
				$('<input type="password"/>').appendTo($this)
					.val($this.data('editable.current'));
			},
			getValue: function ($this, options) {
				$this.data('editable.password', $this.children().val());
				return $this.children().val();
			}
		},
		'textarea': {
			toEditable: function ($this, options) {
				$('<textarea/>').appendTo($this)
					.val($this.data('editable.current'));
			},
			getValue: function ($this, options) {
				return $this.children().val();
			}
		},
		'select': {
			toEditable: function ($this, options) {
				$select = $('<select/>').appendTo($this);
				$.each(options.options,
					function (key, value) {
						$('<option/>').appendTo($select)
							.html(value)
							.attr('value', key);
					}
				)
				$select.children().each(
					function () {
						var opt = $(this);
						if (opt.text() == $this.data('editable.current'))
							return opt.attr('selected', 'selected').text();
					}
				)
			},
			getValue: function ($this, options) {
				var item = null;
				$('select', $this).children().each(
					function () {
						if ($(this).attr('selected'))
							return item = $(this).text();
					}
				)
				return item;
			}
		}
	};
})(jQuery);