//
// V_GUI 
//
// simple to use GUI tools (message boxes, spinners, etc.)
//
// Requires EJS (ejs_production.ejs), and jQuery
// provided templates should be in the /templates directory off docroot
//


$(function() {


var vgs = function() {

	// some DOM objects that get inserted when needed
	var mask = "<div id='vgMask' class='vg-mask'></div>";
	var spin = "<div id='vgSpin' class='ball-loader'> <p> Loading... </p></div>";
	var modal = "<div id='vgModal' class='vg-modal'><div class='vg-modal-head'><div class='vg-close vg-tabable'>&#215</div><div class='vg-title'></div></div><div class='vg-modal-body'></div><div class='vg-btn-bar'></div></div>";
	var btn = "<div class='vg-btn vg-tabable'></div>";

	var that = this;
	this.maskCount = 0;
    this.shifted = false;
    
    // keep track of key states
    //
    $(document).keydown(function(e) {
        if (e.which==16) {
            that.shifted = true;
        }    
    });
    $(document).keyup(function(e) {
        if (e.which==16) {
            that.shifted = false;
        }    
    });

	//----------------------------------------------------------------
	// showMask
	//
	// shows the mask that covers the entire html window
	// using height 100% doesn't work right, so use JS to calc height
	this.showMask = function() {
		if (this.maskCount <= 0) {			
			$("body").prepend(mask);
			sizeMask();
			$(window).resize(function() {
				sizeMask();
			});
		}	
		this.maskCount++;
	}
	//----------------------------------------------------------------
	// hideMask
	//
	// hide the mask
	this.hideMask = function() {
		this.maskCount--;
		if (this.maskCount < 1) {
			$(".vg-mask").remove();
			this.maskCount = 0;
		}	
	}
	//----------------------------------------------------------------
	// showSpinner
	//
	// show the css spinner (bouncing ball)
	this.showSpinner = function () {
		that.showMask();
		$("#vgMask").append(spin);
	}
	//----------------------------------------------------------------
	// hideSpinner
	//
	// hide the spinner
	this.hideSpinner = function () {
		that.hideMask();
		$(".ball-loader").remove();
	}

	//----------------------------------------------------------------
	// showModal
	//
	// Show a standard modal box specified by the template.  Sends the data object "data" to the 
	// template.  Options is an object with the title, and an array of strings for the buttons
	// the button string is returned in the callback if a button is pressed
	// dismiss the modal using hideModal()
	//
	// options = {data: {<data for template>}, title: "Title String", buttons: ['btn1', 'btn2', 'btn3']}

	this.showModal = function(template, options, cb) {
		var e;
		var template = new EJS({url: "/templates/" + template + ".ejs"});
		var data = null;
		var buttons = ['ok'];

		if (exists(options)) {
			if ('data' in options) {
				data = options.data;
			}
			if ('buttons' in options) {
				buttons = options.buttons;
			}
		}
			
		if (template) {
			that.showMask();
			e = template.render(data);
			$("#vgMask").append(modal);
			el = $(".vg-modal-body").append(e);
			$(".vg-title").text(options.title);

			// add buttons
			setupButtons ($(".vg-btn-bar"), buttons, cb);
			// setup actions
			setBtnClick ($('.vg-close'), that.hideModal);
			$('.vg-close').attr("tabindex", 0);

			centerWindow($(".vg-modal"));
			$(window).resize(function() {
				centerWindow($(".vg-modal"));
				sizeMask();
			});
		}	
	}

	//----------------------------------------------------------------
	// messageModal
	//
	this.messageModal = function(message, btns, cb) {
		opts = {title: "Crammly Message",
				data: {msg: message},
				buttons:['Ok']
		}
		if (exists(btns)) {
			opts.buttons = btns;
		}
		that.showModal("core_gui/messagebox", opts, function(txt){
									  		that.hideModal();
									  		if (exists(cb)) {
									  			cb(txt);
									  		}
		});
	}

	this.alertBox = function(message, cb) {
		that.messageModal(message, null, cb);
	}

	//----------------------------------------------------------------
	// hideModal
	//
	// hides the modal
	this.hideModal = function() {
		that.hideMask();
		$(".vg-modal").remove();
	}

	//----------------------------------------------------------------
	// centerWindow
	function centerWindow(el) {

		var w = $(el).width();
		var h = $(el).height();
		var sw = $(window).width();
		var sh = $(window).height();
		$(el).css("left", (sw-w)/2 + "px");
		$(el).css("top", (sh-h)/2 + "px");
	}

	//----------------------------------------------------------------
	// sizeMask
	function sizeMask() {

		var el = $(".vg-mask");
		var sw = $(document).width();
		var sh = $(document).height();
		$(el).css("width", sw + "px");
		$(el).css("height", sh + "px");
	}

	//----------------------------------------------------------------
	// setBtnClick
	function setBtnClick(el, cb) {
		$(el).click(function() {
			cb($(el).text());
		});
	}

    function stop_tab(e){
        if(e.target.id === 'vg-btn-ok'){
            if(e.keyCode === 10){
                e.preventDefault();
            }
        }
    }

	//----------------------------------------------------------------
	// setupButtons
	//
	// Setup the buttons based on the strings
	function setupButtons(el, opts, cb) {
		var e, i, buttonId;

		for (i=0; i<opts.length; i++) {
			e = btn;
			e = $(e).attr("tabindex", i+1);
			e = $(e).text(opts[i]);
			$(e).click(function(e) {
				var txt = $(e.target).text();
				cb(txt);
			});
			$(el).append(e);
		}
		$(".vg-btn").first().focus();

		setupButtonKeyActions ("vg-tabable");
	}


	//----------------------------------------------------------------
	// setupButtonKeyActions
	//
	// Sets up custom tabbing within the modal dialog and captures 
	// enter key.  Pass in the classname that is used to identify 
	// any controls you want in the tab order
	//
	function setupButtonKeyActions(classname) {

	    $("." + classname).keydown(function(e) {
	        if (e.which == 9) {
	        	e.preventDefault();
				var numTabable = $('.vg-tabable').length;
				var nextTab = parseInt($(e.target).attr('tabindex')) + (that.shifted ? -1 : 1);
				if (nextTab < 0) {
					nextTab = numTabable-1;
				}
				if (nextTab >= numTabable) {
					nextTab = 0
				}
				nextTab = Math.min(nextTab, numTabable);
				nextTab = Math.max(nextTab, 0);
				$("."+classname)[nextTab].focus();
	        }
	        if (e.which == 13) {
	        	$(e.target).trigger("click");
	        }
	    });
	}
}

vgGUI = new(vgs);

});