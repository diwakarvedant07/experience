
//Template script here

(function($) {
  'use strict' ;
		
	$('nav').coreNavigation({
		menuPosition: "right",
		container: true,	
    	mode: 'sticky',		
				
		onStartSticky: function(){
        	console.log('Start Sticky');
		},
		onEndSticky: function(){
			console.log('End Sticky');
		},
		
		dropdownEvent: 'hover',
		onOpenDropdown: function(){
			console.log('open');
		},
		onCloseDropdown: function(){
			console.log('close');
		},
		onOpenMegaMenu: function(){
			console.log('Open Megamenu');
		},
		onCloseMegaMenu: function(){
			console.log('Close Megamenu');
		}		
	});	
	
})(jQuery);// End of use strict



