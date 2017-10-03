(function($) {

//create singleton to namespace js
if (!projectlight) {
  var projectlight = {};
}

//set up initial page variables - cached Jquery variables
projectlight.init = function(){

	//temporary debugging element to allow developer to see exact screen width during development
	$("body").append("<p style='color:red;z-index:100;position:absolute;top:5px;left:5px' id='pagewidth'></p>")

	//caching variables to refer to DOM elements in code
	projectlight.$window = $(window);
	projectlight.$wrap = $(".campl-wrap");
	projectlight.$rows = $(".campl-row");

	//header items
	projectlight.$globalHdrCtrl = $("#global-header-controls");
	projectlight.$siteSearchBtn = $("#site-search-btn");
	projectlight.$quicklinks = $(".campl-quicklinks");

	//navigation items
	projectlight.$globalNavOuter = $(".campl-global-navigation-outer");
	projectlight.$globalNavLI = $(".campl-global-navigation li");

	//instantiate footer columns on page load
	projectlight.$localFooter = $('.campl-local-footer');
	projectlight.$globalFooter = $('.campl-global-footer');

	projectlight.$localFooterColumns = projectlight.$localFooter.find('.campl-column3');
	projectlight.$globalFooterColumns = projectlight.$globalFooter.find('.campl-column3');

	//set namespaced variable to determine layout of menu
	//using modernizr to detect if media query is valid and has been triggered
	if(Modernizr.mq('only screen and (max-width: 767px)')){
		projectlight.mobileLayout  = true;

		//call function to remove uniform column height in footers for mobile layout
		projectlight.removeGlobalNavigationColumnHeight();
		projectlight.removeNavigationColumnHeight();
		projectlight.removeSectionListChildrenColumnHeight();
		projectlight.removeContentColumnHeight();
		projectlight.removeFooterColumnsHeight();

	}else{
		projectlight.mobileLayout  = false;

		//call function to create uniform column height in footers for desktop/tablet users
		projectlight.setGlobalNavigationColumnHeight();
		projectlight.setNavigationColumnHeight();
		projectlight.setSectionListChildrenColumnHeight();
		projectlight.setContentColumnHeight();
		projectlight.setFooterColumnsHeight();
	}

	//if media queries are not supported set a fixed width container to prevent fluid layout breaking in IE and other browsers which do no support MQ
	if(!Modernizr.mq('only all')){
		projectlight.$wrap.addClass("campl-fixed-container");
	}

	//dynamically append Global navigation controls for javascript
	projectlight.$globalHdrCtrl.prepend('<a href="" class="campl-open-menu ir" id="open-menu">View menu</a>');
	projectlight.$siteSearchBtn.prepend('<a href="#" class="campl-icon-search-btn ir" id="open-search">Search</a>');
	projectlight.$quicklinks.prepend('<a href="#" class="campl-open-quicklinks clearfix"><span class="campl-quicklinks-txt">Quick links</span><span class="campl-icon-dropdown ir"></span></a>')
	projectlight.$globalNavOuter.append('<a href="#" class="campl-close-menu" >Close</a>')

	//cache variables for DOM elements
	projectlight.$searchDrawer = $('.campl-search-drawer')
	projectlight.$navigationDrawer = $('.campl-global-navigation-drawer')

	//INSTANTIATE QUICKLINKS DROP DOWN MENU
	// header quicklinks
	projectlight.$quicklinks.find('ul').hide();

	//get campl-quicklinks-list from page and clone into new container underneath the button inside quicklinks container
	$('.campl-quicklinks-list').clone().appendTo(projectlight.$quicklinks).addClass("column12 clearfix");

	$(".campl-open-quicklinks").bind('click', function(e){
		//shut other open panels nav and search
		projectlight.$searchDrawer.removeClass("campl-search-open");
		projectlight.$navigationDrawer.removeClass("campl-navigation-open");
		projectlight.$globalNavOuter.removeClass("campl-drawer-open");
		//deselect any previously clicked links
		projectlight.$globalNavLI.removeClass("campl-selected");

		projectlight.$quicklinks.toggleClass("campl-quicklinks-open");
		e.preventDefault();
	})


	//open search bound click event to open search bar drawer in page
	$("#open-search").bind('click', function(e){
		//shut other open panels nav and quicklinks
		projectlight.$navigationDrawer.removeClass("campl-navigation-open");
		projectlight.$globalNavOuter.removeClass("campl-drawer-open");
		projectlight.$quicklinks.removeClass("campl-quicklinks-open");
		$("body").removeClass("campl-navigation-open");
		projectlight.localNav.hideMenu();
		//deselect any previously clicked links
		projectlight.$globalNavLI.removeClass("campl-selected");

		projectlight.$searchDrawer.toggleClass("campl-search-open");
		e.preventDefault();
	})

	//ensure drop down closes if you click outside of it. Binding click event to entire page
	$('html').bind('click', function(e){
		if(!$(e.target).hasClass("campl-open-quicklinks") && !$(e.target).hasClass("campl-icon-dropdown") && !$(e.target).hasClass("campl-quicklinks-txt")){
			projectlight.$quicklinks.removeClass("campl-quicklinks-open");
		}
	})

	//Bound click event to global nav button for mobile users to allow them to open the navigation in side drawer
	$("#open-menu").bind('click', function(e){
		//shut other open panels search and quicklinks
		projectlight.$searchDrawer.removeClass("campl-search-open");
		projectlight.$quicklinks.removeClass("campl-quicklinks-open");
		projectlight.localNav.hideMenu();
		//close main navigation drawer
		projectlight.$globalNavOuter.removeClass("campl-drawer-open");
		//deselect any previously clicked links
		projectlight.$globalNavLI.removeClass("campl-selected");

		$("body").toggleClass("campl-navigation-open"); //added class to body instead so whole page can be moved to the right
		e.preventDefault();
	})

	$(".campl-close-menu").bind('click', function(e){
		//close main navigation drawer
		$(e.target).parent().removeClass("campl-drawer-open");
		//remove selected class from nav item clicked
		$(".campl-global-navigation li").removeClass("campl-selected")
		e.preventDefault();

	})


	//bound click event to primary navigation items for desktop view to allow users to browse the navigation in a megadropdown
	//the campl-no-drawer items are links that click straight through to a page instead of opening a mega dropdown
	$(".campl-global-navigation a").not(".campl-no-drawer").bind('click', function(e){
		var linkClicked = $(e.target);
		linkClicked.parent().addClass("campl-selected");
		var $drawer = $(linkClicked.attr('href'));

		//shut other open panels search and quicklinks
		projectlight.$searchDrawer.removeClass("campl-search-open");
		projectlight.$quicklinks.removeClass("campl-quicklinks-open");

		//if the navigation is open, and the drawer showing is the same as the link clicked then close drawer and close navigation container
		if($drawer.hasClass("campl-drawer-open")){
			projectlight.$globalNavLI.removeClass("campl-selected");
			projectlight.$navigationDrawer.removeClass("campl-navigation-open");
			projectlight.$globalNavOuter.removeClass("campl-drawer-open");
		}else{
			//else show close existing drawer and show new drawer, keep open navigation container

			//close any other drawers that are open
			projectlight.$globalNavOuter.not($drawer).removeClass("campl-drawer-open");
			//deselect any previously clicked links
			projectlight.$globalNavLI.not(linkClicked.parent()).removeClass("campl-selected");

			//toggle the open drawer class
			projectlight.$navigationDrawer.addClass("campl-navigation-open");
			$drawer.toggleClass("campl-drawer-open");
		}

		e.preventDefault();
	})

	//Show page elements which have been hidden to handle FOUC
	projectlight.$globalHdrCtrl.show();

	//fake last psuedo class to help layout in IE8. This removes the double borders from nested LI
	//which was visually confusing
	$(".campl-section-list-children ul").each(function(){
		$(this).find("li").last().addClass("campl-last")
	})

}


projectlight.setGlobalNavigationColumnHeight = function(){
	//for each section, get children, measure height of each, set height of each child
	$(".campl-global-navigation-outer").each(function(){
		var $childrenOfList = $(this).find(".campl-global-navigation-container");
		var maxColumnHeight = Math.max($childrenOfList.eq(0).height(), $childrenOfList.eq(1).height(), $childrenOfList.eq(2).height());

		//why is the col height 0 here?
		// console.log(maxColumnHeight)
		//hardcoded to 300 for time being
		$childrenOfList.css({'min-height':300} )
	})
}

projectlight.removeGlobalNavigationColumnHeight = function(){
	$('.campl-global-navigation-container').removeAttr("style");
}

projectlight.setSectionListChildrenColumnHeight = function(){
	//for each section list, get section-list-children, measure height of each, set height of each child
	$(".campl-section-list-row").each(function(){
		var $childrenOfList = $(this).find(".campl-section-list-children");
		var maxColumnHeight = Math.max($childrenOfList.eq(0).height(), $childrenOfList.eq(1).height(), $childrenOfList.eq(2).height());
		$childrenOfList.css({'min-height':maxColumnHeight} )
	})
}

projectlight.removeSectionListChildrenColumnHeight = function(){
	$('.campl-section-list-children').removeAttr("style");
}

projectlight.setNavigationColumnHeight = function(){
	//reset all values to begin with to ensure layout is changing on ipad orientation change
	$('.campl-global-navigation li a').removeAttr("style");

	var maxColumnHeight = Math.max($('.campl-global-navigation li a').eq(0).height(), $('.campl-global-navigation li a').eq(1).height(), $('.campl-global-navigation li a').eq(2).height());
	$('.campl-global-navigation li a').css({'min-height':maxColumnHeight} )
};

//force main content column min-height to the same height as the navigation column
projectlight.setContentColumnHeight = function(){

	//reset before adding further height
	$('.campl-tertiary-navigation, .campl-secondary-content, .campl-main-content').removeAttr("style");

	var secondaryContentRecessedHeight = 0;

	if($('.campl-secondary-content').hasClass("campl-recessed-secondary-content")) {
		secondaryContentRecessedHeight = ($('.campl-secondary-content').parent().width() / 100) * 36.6;
	}

	var maxColumnHeight = Math.max($('.campl-secondary-content').height() - secondaryContentRecessedHeight, $('.campl-tertiary-navigation').height(), $(".campl-main-content").height());

	if($('.campl-tertiary-navigation').length > 0){
		$('.campl-tertiary-navigation, .campl-secondary-content, .campl-main-content').css({'min-height':maxColumnHeight+50} )
		//uneven height distribution on nav and sec columns
	}else{
		$('.campl-tertiary-navigation, .campl-secondary-content, .campl-main-content').css({'min-height':maxColumnHeight} )
		$('.campl-secondary-content').css({'min-height':maxColumnHeight +50} 	)
	}


	if($('.campl-secondary-content').hasClass("campl-recessed-secondary-content")){
		$('.campl-secondary-content').css({'min-height':maxColumnHeight + secondaryContentRecessedHeight } 	)
	}


	$('.campl-secondary-content').show();
};

projectlight.removeNavigationColumnHeight = function(){
	//had to remove style attribute, as setting height back to auto would not work
	$('.campl-global-navigation li a').removeAttr("style");
};

projectlight.removeContentColumnHeight = function(){
	//had to remove style attribute, as setting height back to auto would not work
	$('.campl-tertiary-navigation, .campl-secondary-content, .campl-main-content').removeAttr("style");
	$('.campl-secondary-content, .campl-main-content').show();
};

projectlight.setFooterColumnsHeight = function(){
	var highestglobalFooter = Math.max(projectlight.$globalFooterColumns.eq(0).height(), projectlight.$globalFooterColumns.eq(1).height(),projectlight.$globalFooterColumns.eq(2).height(),projectlight.$globalFooterColumns.eq(3).height())
	var highestLocalFooter = Math.max(projectlight.$localFooterColumns.eq(0).height(), projectlight.$localFooterColumns.eq(1).height(),projectlight.$localFooterColumns.eq(2).height(),projectlight.$localFooterColumns.eq(3).height())

	projectlight.$localFooterColumns.height(highestLocalFooter);
	projectlight.$globalFooterColumns.height(highestglobalFooter);
};

projectlight.removeFooterColumnsHeight = function(){
	projectlight.$localFooter.height("auto");
	projectlight.$localFooterColumns.height("auto");
	projectlight.$globalFooterColumns.height("auto");
};




projectlight.initTables = function(){
	/* FULLY EXPANDED RESPONSIVE TABLE SOLUTION */
	//responsive table solution
	var $tableContainer = $(".campl-responsive-table");

	//cycle through all responsive tables on page to instantiate open link
	$tableContainer.each(function (i) {
		var $table = $(this).find("table");
		var summary = "";

		//hide table
		$table.hide(); //might have to use positioning to prevent it being hidden from screen readers

		//suck out caption and summary to display above link
		var openTable = "<div class='campl-open-responsive-table'><a href='#' class='campl-open-responsive-table-link'>Click to open table " + $table.find("caption").text() + "</a>"+ summary + "</div>"

		//insert button to open table in page
		$(this).prepend(openTable);

		//create collapse button and hide until table is opened
		$(this).find('.campl-open-responsive-table').append("<a href='#' class='campl-collapse-table'>Collapse table</a>");

		$('.campl-collapse-table').hide();

		//collapse table and restore open link to user
		$(this).find('.campl-collapse-table').bind("click", function(e){
			var $tableContainer = $(e.target).parent().parent();
			$tableContainer.removeClass("campl-expanded-table");
			$table.removeClass("campl-full-width-table").hide();
			//show appropriate open link
			$(e.target).parent().find('.campl-open-responsive-table-link').show();
			//hide collapse link
			$(e.target).hide();
			e.preventDefault();
		})


		//open table on bind click event
		$(this).find(".campl-open-responsive-table-link").bind("click", function(e){
			$(e.target).parent().parent().addClass("campl-expanded-table");
			$table.addClass("campl-full-width-table");
			$table.show();
			//show appropriate close link
			$(e.target).parent().find('.campl-collapse-table').show();
			//hide open link
			$(e.target).hide();
			e.preventDefault();
		});

	})

	/* VERTICAL STACKING TABLE */
	var $verticalTable = $(".campl-vertical-stacking-table");

	//cycle through every vertical table on the page and insert table headers into table cells for mobile layout
	$verticalTable.each(function (i) {
		//for vertical stacking tables need to read the text value of each TH in turn and assign to the headers array
		var $tableHeaders = $(this).find('thead').find("th");

		var headerTextArray = [];
		//insert th value into every data set row in order
		//each loop to push into data array
		$tableHeaders.each(function (i) {
			headerTextArray.push($(this).text());
		});

		//for every row, insert into td append before text in td insert span to handle styling of header and data
		var $verticalTableRows = $(this).find("tr");

		$verticalTableRows.each(function (i) {
			//need to find all children of the table rows, (and not just table data cells)
			var $tableCells = $(this).children();
			$tableCells.each(function (i) {
				if(headerTextArray[i]) {
					$(this).prepend("<span class='campl-table-heading'>"+headerTextArray[i]+"</span>")
				}
			})

		})

	})

}

/**  LOCAL NAVIGATION CONTROLS updated code taken from sony.com **/
//this controls both the dropdowns and graphical style of the desktop navigation and the sliding panels of the mobile navigation
projectlight.localNav=(function(){
	var $openMenu,$navigation,$navContainer,$topUL,$topListItems,$allListItems,$links,$secondLevelListitems,$allMenuLists,n,$allNavLinks,menuPosition=0,m;
	return{
		init:function(u){
			$navigation = $(".campl-local-navigation");

			//only run if there is navigation available in the page
			if($navigation.length > 0){
				//need to remove btn from IE7 and IE8 - feature detection for media queries
				if(Modernizr.mq('only all')){
					$navigation.prepend('<p class="campl-closed campl-menu-btn" id="menu-btn"><a href="#"><span>Menu</span> <span class="campl-menu-btn-arrow"></span></a></p>')
					$openMenu = $("#menu-btn a");

					//bind click event to button to open menu for mobile
					$openMenu.click(function(){
						var $linkClicked = $(this);

						//close main nav drawer or search panel if open
						$("body").removeClass("campl-navigation-open");
						projectlight.$searchDrawer.removeClass("campl-search-open");

						if($linkClicked.parent().hasClass("campl-closed")){
							displayMenu("show")
						}else{
							displayMenu("hide")
						}
						return false
					});
				}
				//call function to instantiate children and title structure
				setupNavigation();
			}
		},
		hideMenu:function(){
			$openMenu = $("#menu-btn a");
			$navContainer = $(".campl-local-navigation-container");
			$openMenu.parent().removeClass("campl-open").addClass("campl-closed");
			$navContainer.css({left:-9999});
		},
		resetLocalNavigation:function(){
			//remove all sub classes
			$navContainer = $(".campl-local-navigation-container"),
			$allListItems = $navContainer.find("li");
			$allListItems.removeClass("campl-sub");

			//reset sub classes onto correct items
			if(projectlight.mobileLayout){
				$allListItems.has('ul').addClass("campl-sub");
			}else{
				$allListItems.not($allListItems.find("li")).has('ul').addClass("campl-sub");
			}
		}
	};
	function setupNavigation(){

		$navContainer = $navigation.children(".campl-local-navigation-container"),
		$topUL = $navContainer.children("ul");
		$topListItems = $topUL.children("li");
		$allListItems = $topUL.find("li");

		$secondLevelListitems = $topListItems.children("li");
		$allMenuLists = $topListItems.find("ul");
		$dropdownListItems = $topListItems.find("li");
		$allNavLinks = $allMenuLists.find("a");

		$currentPageListitem = $navigation.find(".campl-current-page");
		currentSectionNo = 0;

		m=$topUL.height();

		//need to dynamically append sub class to elements that have children
		$allListItems.has('ul').addClass("campl-sub")

		//this needs to be added to browsers with media queries only to prevent IE7 adding gap above items with children in desktop layout
		//for all the list items that have children append forward indicator arrow
		if(Modernizr.mq('only all')){
			$('.campl-sub').children("a").css({"position":"relative"}).append("<span class='campl-menu-indicator campl-fwd-btn'></span>")
		}
		//dynamically mark top level list items
		$topListItems.addClass("campl-top")


		//for each list item with a class of sub, clone the link and prepend it to the top of the nested UL beneath
		//this will act as the overview link in the top level and the UL title in the mobile navigation

		//for each UL walk up the DOM to find the title of the UL in the section above, prepend this link as the back button to the section before for
		//the mobile navigation
		$navigation.find(".campl-sub").each(function(){
			var $childUl = $(this).children("ul");
				$childUl.prepend('<li class="campl-title"><a href="'+ $(this).children("a").attr('href') +'">'+$(this).children("a").text()+'</a></li>');
			if($(this).hasClass('campl-top')){
				$childUl.prepend('<li class="campl-back-link"><a href="#"><span class="campl-back-btn campl-menu-indicator"></span>Back to section home</a></li>');
			}else{

				$childUl.prepend('<li class="campl-back-link"><a href="#"><span class="campl-back-btn campl-menu-indicator"></span>'+ $(this).parent().children(".campl-title").children("a").html()  +'</a></li>');
			}

		})


		//reset menu structure after title links have been appended to ensure they are always created for full mobile structure
		//desktop menu only needs to go one level deep
		$allListItems.removeClass("campl-sub");
		if(projectlight.mobileLayout){
			$allListItems.has('ul').addClass("campl-sub");
		}else{
			$allListItems.not($allListItems.find("li")).has('ul').addClass("campl-sub");
		}

		//declare array of links after title link has been created
		$links = $topListItems.find("a");

		//set current class to first level navigation so mobile menu can always open at least
		//one level of menu. This style makes the UL visible
		$topUL.addClass("campl-current");


	//hover classes not required for mobile and tablet layouts
	//hover event should only trigger from top level items not children of top level
	$topListItems.hover(
			function(){
			if(!projectlight.mobileLayout){
				$(this).addClass("campl-hover")
			}
		},function(){
			if(!projectlight.mobileLayout){
				$(this).removeClass("campl-hover")
			}
		});


		//Bound click event for all links inside the local navigation.
		//handles moving forwards and backwards through pages or opening dropdown menu
		$links.click(function(e){
			var $linkClicked = $(this),
			$listItemClicked = $linkClicked.parent();

			if($listItemClicked.hasClass("campl-title") && Modernizr.mq('only screen and (max-width: 767px)')){
				e.preventDefault();
			}else{
				if($listItemClicked.hasClass("campl-sub")){
					//slide mobile or tablet menu forward
					if(projectlight.mobileLayout){
						slideMenu("forward");
						$listItemClicked.addClass("campl-current")
					}else{
						if($listItemClicked.hasClass("campl-top") && $linkClicked.hasClass("campl-clicked")){
							//toggle open navigation if top level without sub level link clicked
							closeSubNavigation();
						}else{
							//display sub menu for the desktop view for the item clicked
							showSubNavigation($linkClicked, e)
						}
					}
				e.preventDefault();
				}else{
					if($listItemClicked.hasClass("campl-back-link")){
						slideMenu("back");
						$linkClicked.parent().parent().parent().addClass("campl-previous");
						$linkClicked.parent().parent().addClass("campl-previous");
						return false
					}
				}
			}

		});

		//ensure dropdown or sliding panels are set to the correct width if the page changes and also on first load
		$(window).resize(function(){
			setMenuWidth();
		});
		if(projectlight.mobileLayout){
			setMenuWidth();
		}
	}

	//sets the width of the sub menus, for either the desktop dropdown,
	//or to ensure the mobile sliding panels stretch to fill the whole screen
	function setMenuWidth(){

		var widthOfMenu = 480;

		if(Modernizr.mq('only screen and (max-width: 767px)')){
			widthOfMenu = $(window).width()

			$topUL.width(widthOfMenu);
			$allMenuLists.width(widthOfMenu).css("left",widthOfMenu);
			if($openMenu.parent().hasClass("campl-open")){
				$navContainer.css("left",-(menuPosition*widthOfMenu))
			}
			//should be adding mobile state to dom elem
			$navContainer.addClass("campl-mobile");
		}else{

			//this resets the mobile structure by removing all the unwanted classes
			//so the show/hide will work for the desktop dropdown menu
			if($navContainer.hasClass("campl-mobile")){
				$openMenu.parent().removeClass("campl-open").addClass("campl-closed");
				$navContainer.find(".campl-current").removeClass("campl-current");
				$navContainer.attr("style","").removeAttr("style");
				$topUL.attr("style","").removeAttr("style");
				$allMenuLists.attr("style","").removeAttr("style")
			}
		}
	}
	//shows the desktop dropdown menus by positioning them on or off screen
	function displayMenu(actionSent){
		if(actionSent == "show"){

			//Walk up through DOM to determine nested level
			var $currentUL = $currentPageListitem.parent();
			currentSectionNo = 0;
			if($currentPageListitem.length > 0){
				if($currentPageListitem.parent().length > 0){
					//do while this is UL
					while ($currentUL[0].tagName === "UL")
					{
						$currentUL.addClass("campl-current")// this displays hidden nav sections
						if($currentUL.parent()[0].tagName === "LI" ){
							$currentUL.parent().addClass("campl-current") //need to add current to full path, UL and LI
						}
						$currentUL = $currentUL.parent().parent();
						currentSectionNo ++;
					}
					//set current menu position depending on which nested level the active page is on
					menuPosition = currentSectionNo-1;
					$navContainer.children("ul").removeClass("campl-current")
				}
			}else{
				menuPosition = 0
			}

			//get current menu width
			if(Modernizr.mq('only screen and (min-width: 768px)')){
				widthOfMenu=480;
			}else{
				widthOfMenu=$(window).width();
			}

			//set left position depending which level to open menu at
			$navContainer.css({left:-(menuPosition*widthOfMenu)});

			$openMenu.parent().removeClass("campl-closed").addClass("campl-open");
		}else{
			if(actionSent == "hide"){
				$openMenu.parent().removeClass("campl-open").addClass("campl-closed");
				$navContainer.css({left:-9999});

				//need to force top container to go away. Ghost block seemed to be staying on screen even
				//though CSS should have removed it, this hack forces it to be hidden then removes the display
				//style to allow it to be controlled by the CSS again
				$navContainer.find(".campl-current").removeClass("campl-current").hide();
				$navContainer.find(':hidden').css("display", "")

				//reset menu back to opening position
				menuPosition = currentSectionNo-1;
			}
		}
	}
	//shows the sliding menus for the mobile navigation
	function slideMenu(directionToSlide){
		var widthOfMenu,
		currentLeftPos=$navContainer.css("left");
		currentLeftPos=parseInt(currentLeftPos.replace("px",""));

		if(Modernizr.mq('only screen and (min-width: 768px)')){
			widthOfMenu=480;
		}else{
			widthOfMenu=$(window).width()
		}

		if(directionToSlide === "forward"){
			menuPosition++;
			$navContainer.stop().animate({left:currentLeftPos-widthOfMenu},300,function(){})
		}else{
			if(directionToSlide === "back"){
				menuPosition--;
				$navContainer.stop().animate({left:currentLeftPos+widthOfMenu},300,function(){
					$navContainer.find(".campl-previous").removeClass("campl-previous").removeClass("campl-current");
				})
			}
		}
	}
	//controls mulitple levels of dropdown navigation depending on hover and clicked classes being set
	//nb: we have altered from the original sony code by only allowing users to open one level or
	//dropdown menu in the desktop view
	function showSubNavigation(linkClicked, event){
		var $linkClicked = $(linkClicked),
		$listItemClicked = $linkClicked.parent(),
		$ListItemSiblings = $listItemClicked.siblings(),
		y;

		if($linkClicked.hasClass("campl-clicked")){
			$listItemClicked.removeClass("campl-hover");
			$linkClicked.removeClass("campl-clicked");

			//list items beneath current with hover set
			y = $listItemClicked.find(".campl-hover");
			$clickedChildren = x.find(".clicked");
			y.removeClass("campl-hover");
			$clickedChildren.removeClass("campl-clicked")
		}else{
			$listItemClicked.addClass("campl-hover");
			$linkClicked.addClass("campl-clicked");

			//for each of the list items siblings remove hover and clicked classes
			$ListItemSiblings.each(function(){
				var $sibling = $(this);
				if($sibling.children("a").hasClass("campl-clicked")){
					y = $sibling.find(".campl-hover");
					$clickedChildren = $sibling.find(".campl-clicked");
					$sibling.removeClass("campl-hover");
					y.removeClass("campl-hover");
					$clickedChildren.removeClass("campl-clicked")
				}
			})
		}
		event.preventDefault();
	}

	//close button resets all open classes and returns the navigation back to a full closed state
	function closeSubNavigation(){
		var $hoveredListItems  =$topUL.find(".campl-hover"),
		$linksClicked = $topUL.find(".campl-clicked");

		$hoveredListItems.removeClass("campl-hover");
		$linksClicked.removeClass("campl-clicked");
		$secondLevelListitems.css("left",-9999)
	}

})(); //end of nav - self calling function


//carousel instantiation
projectlight.createCarousel = function(){
	var carousel = {};

	// set up initial carousel values and autoplay, hide other slides
	carousel.init = function(){
		this.carouselContainer = $(".campl-carousel").first();
		this.slides = this.carouselContainer.find("ul.campl-slides");
		this.currentSlide = 1;
		this.maxSlides = this.slides.children().length;
		this.animating = false;
		this.endPos = 0;

		// need to determine width of carousel, container and slide item depending on screen size
		this.carouselWidth = this.carouselContainer.width();

		// need to dynamically set width of slides Ul (length of all slides plus the cloned item) and left position (length off each side * currentSlide)
		if (this.maxSlides > 1) {
			this.slides.css({'width': (this.carouselWidth*(this.maxSlides+2))+this.carouselWidth+'px', 'left': '-' + (this.carouselWidth * this.currentSlide)+'px'});
		}


		// calculate lookup position table
		this.lookupPos = [];

		for(var cc = 0; cc < this.maxSlides; cc++){
			this.lookupPos.push(-cc * parseInt(this.carouselContainer.innerWidth(), 10));
		}

		if (this.maxSlides > 1) {
			this.carouselContainer.removeClass('campl-banner')
			//create next and back buttons for carousel
			this.createCarouselControls();

			//append pagination indicator
			this.createPaginationIndicator();

			// Clone first and last slides and append it to the slideshow to mimic infinite carousel functionality
			var clonedFirstSlide = this.slides.children('li:first-child').clone();
			this.slides.append(clonedFirstSlide);
			var clonedLastSlide = this.slides.children('li:nth-child('+this.maxSlides+')').clone();
			this.slides.prepend(clonedLastSlide);

			this.slide = this.slides.find("li")

			// click event on carousel direction controls
			this.carouselControls.bind('click', this.activateDirectionButtons)

			//set width of each slide to ensure image is scaling to match fluid grid
			this.slides.children().css({width:this.carouselWidth})

			projectlight.resetCarousel();

			this.autoPlaying = true;
                        $('.campl-play').addClass('campl-pause').removeClass('campl-play');
			this.startAutoPlay();



		}else{
			this.carouselContainer.addClass('campl-banner')
		}

		this.carouselContainer.find("li").show();

		//instantiate caption and content text variables for handling truncation across all slides and cloned slides
		//has to happen after cloning so all slides are properly controlled by the truncation during resize event
		projectlight.$slideCaption = $(".campl-slide-caption-txt");
		projectlight.$carouselContent = $(".campl-carousel-content p");

		projectlight.carouselContentItems = [];
		projectlight.slideCaptionItems = [];

		//store array of original strings to replace when at full size
		projectlight.$slideCaption.each(function(){
			projectlight.slideCaptionItems.push($(this).text())
		})

		projectlight.$carouselContent.each(function(){
			projectlight.carouselContentItems.push($(this).text())
		})

		//truncate homepage carousel content if page is thinner than tablet view but not on mobile view
		if(Modernizr.mq('only screen and (min-width: 768px) and (max-width: 1000px)')){
			projectlight.$slideCaption.each(function(){
        if($.trim($(this).text()).length>51) {
					$(this).text($.trim($(this).text()).substring(0, 50).split(" ").slice(0, -1).join(" ") + "...")
				}
			})

			projectlight.$carouselContent.each(function(){
				if($.trim($(this).text()).length>36) {
					$(this).text($.trim($(this).text()).substring(0, 35).split(" ").slice(0, -1).join(" ") + "...")
				}
			})

		}
	}

	carousel.createPaginationIndicator = function(){
		carousel.slides.children().each(function(i){
			var slideNo = i+1
			$(this).find(".campl-slide-caption").append("<span class='campl-carousel-pagination'>"+ slideNo + " of " + carousel.maxSlides + "</span>")
		})
	}

	//append control buttons unobtrusively if there is more than one slide in carousel
	carousel.createCarouselControls = function(){

		var carouselControls = document.createElement('ul');
		carouselControls.className = 'campl-unstyled-list clearfix campl-carousel-controls';
		carouselControls.id = 'carousel-controls';

		var previouslistItem = document.createElement('li');
		previouslistItem.className = "campl-previous-li";
		var previouslink = document.createElement('a');
		var previousArrowSpan = document.createElement('span');
		previousArrowSpan.className = "campl-arrow-span";
		previouslink.className = "ir campl-carousel-control-btn campl-previous";
		var previouslinkText = document.createTextNode('previous slide');
		previouslink.setAttribute('href', '#');
		previouslink.appendChild(previousArrowSpan);
		previouslink.appendChild(previouslinkText);
		previouslistItem.appendChild(previouslink);
		carouselControls.appendChild(previouslistItem);

		var pauselistItem = document.createElement('li');
		pauselistItem.className = "campl-pause-li";
		var pauselink = document.createElement('a');
		var pauseArrowSpan = document.createElement('span');
		pauseArrowSpan.className = "campl-arrow-span";
		pauselink.className = "ir campl-carousel-control-btn campl-pause";
		var pauselinkText = document.createTextNode('pause slides');
		pauselink.setAttribute('href', '#');
		pauselink.appendChild(pauseArrowSpan);
		pauselink.appendChild(pauselinkText);
		pauselistItem.appendChild(pauselink);
		carouselControls.appendChild(pauselistItem);

		var nextlistItem = document.createElement('li');
		nextlistItem.className = "campl-next-li";
		var nextlink = document.createElement('a');
		var nextArrowSpan = document.createElement('span');
		nextArrowSpan.className = "campl-arrow-span";
		nextlink.className = "ir campl-carousel-control-btn campl-next";
		var nextlinkText = document.createTextNode('next slide');
		nextlink.setAttribute('href', '#');
		nextlink.appendChild(nextArrowSpan);
		nextlink.appendChild(nextlinkText);
		nextlistItem.appendChild(nextlink);
		carouselControls.appendChild(nextlistItem);

		this.carouselContainer.append(carouselControls);
		this.carouselControls = $('#carousel-controls a');
		this.prev = this.carouselControls.eq(0);
		this.next = this.carouselControls.eq(1);

	};

	//bound click event for carousel navigation controls
	carousel.activateDirectionButtons = function(e){
		carousel.stopAutoPlay();
		var buttonClicked;
		if(e.target.tagName === "SPAN"){
			buttonClicked = $(e.target.parentNode);
		}else{
			buttonClicked = $(e.target.parentNode).find("a");
		}

		// detect which button has been clicked from event delegation + call animate slides and pass direction val
		if(buttonClicked.hasClass('campl-previous')){
			carousel.animateSlides('left');
                        $('.campl-pause').addClass('campl-play').removeClass('campl-pause');
		}
		else if(buttonClicked.hasClass('campl-next')){
			carousel.animateSlides('right');
                       $('.campl-pause').addClass('campl-play').removeClass('campl-pause');
		}
		else if(buttonClicked.hasClass('campl-pause')){
                        buttonClicked.removeClass('campl-pause');
                        buttonClicked.addClass('campl-play');
		}
		else if(buttonClicked.hasClass('campl-play')){
                        buttonClicked.removeClass('campl-play');
                        buttonClicked.addClass('campl-pause');
                        carousel.autoPlaying = true;
                        carousel.startAutoPlay(1000);
		}
		e.preventDefault();
	};


	//autoplay function sets time out which is called repeatedly from the animation completed call back
	carousel.startAutoPlay = function(ticks){
            if(ticks === undefined) {
                ticks = 5000;
            }
		this.slides.queue(function() {
			carousel.timer = window.setTimeout(function() {
				carousel.animateSlides('right');
			}, ticks);
		})
		carousel.slides.dequeue();
	};

	// stops play for reset purposes
	carousel.stopAutoPlay = function(){
		this.autoPlaying = false;
		window.clearTimeout(this.timer);
		this.slides.queue("fx", []);
	};

	//controls the slide number of the current slide, distance to scroll and animation function with callback
	carousel.animateSlides = function(directionToScroll){
		// check to see if gallery is not currently being animated
		if(this.slides.filter(':animated').length === 0){
			var endPos = 0;
			// get current left position of slides and remove measurement notation
			var startPos = parseInt(this.slides.css('left'));


			if(directionToScroll !== undefined){
				if(directionToScroll === 'left'){
					if(carousel.currentSlide <= 1){
						carousel.currentSlide = carousel.maxSlides;
					}else{
						carousel.currentSlide = carousel.currentSlide - 1;
					}
					endPos = startPos + carousel.carouselContainer.innerWidth();
				}else{
					if(carousel.currentSlide >= carousel.maxSlides){
						carousel.currentSlide = 1;
						endPos = 0;
					}else{
						carousel.currentSlide = carousel.currentSlide + 1;
					}
					endPos = startPos - carousel.carouselContainer.innerWidth();
				}
			}

			this.slides.animate({left: endPos}, 2500, function(){
				//after carousel has finished moving
				if(carousel.currentSlide === carousel.maxSlides){
					carousel.slides.css({left:(-carousel.maxSlides * carousel.carouselContainer.innerWidth())+'px'});
				}else if(carousel.currentSlide === 1){
					//set the position of the slides to be back to the beginning
					carousel.slides.css({left: -carousel.carouselContainer.innerWidth()+'px'});

				}

				if(carousel.autoPlaying === true){
					carousel.startAutoPlay();
				}
			});
		}
	}



	// Reset carousel
	projectlight.resetCarousel = function(){

		carousel.stopAutoPlay();

		// need to determine width of carousel, container and slide item depending on screen size
		carousel.carouselWidth = carousel.carouselContainer.width();

		// reset width and position of slides when page is changed
		// need to dynamically set width of slides Ul (length of all slides plus the cloned item) and left position (length off each side * currentSlide)
		if (carousel.maxSlides > 1) {
			carousel.slides.css({'width': (carousel.carouselWidth*(carousel.maxSlides+2))+carousel.carouselWidth+'px', 'left': '-' + (carousel.carouselWidth * carousel.currentSlide)+'px'});
		}

		// reset width and position of slides when page is changed
		carousel.slides.children().css({width:carousel.carouselWidth})

		// calculate lookup position table
		carousel.lookupPos = [];

		for(var cc = 0; cc < carousel.maxSlides; cc++){
			carousel.lookupPos.push(-cc * parseInt(carousel.carouselContainer.innerWidth(), 10));
		}

		//carousel.updateControlActivation();
		// carousel.startAutoPlay();

                // Project light doesn't resart the carousel aftr a resize event - see commented out code above.
                // Therefore we need to ensure we have a play rather than a pause button.
                $('.campl-pause').addClass('campl-play').removeClass('campl-pause');

	}


	// dont seem to be used
	//projectlight.stopCarousel = function(){
	//	carousel.stopAutoPlay();
	//};

	//projectlight.startCarousel = function(){
	//	carousel.stopAutoPlay();
	//	carousel.startAutoPlay();
	//};


	carousel.init();

}

//only mark external links inside of the main content area as denoted by the campl-skipTo ID
projectlight.markExternalLinks = function(){
	if (jQuery.browser.msie) {
		$("#content a[href*='cam.ac.uk']").not(".campl-carousel a[href*='http://']").addClass("campl-external").attr({
			"title": $(this).attr("title")+" (Link to an external website)"
		})
	}else{
		$('#content a').not(".campl-carousel a").filter(function(){
			return this.hostname && !this.hostname.match(/cam.ac.uk/gi);
		}).addClass("campl-external").attr({
			"title": $(this).attr("title")+" (Link to an external website)"
		})
	}
}

//DOM ready
$(function() {

	//instantiate all the DOM elements which require javascript rendering
	projectlight.init();
	projectlight.initTables();
	projectlight.localNav.init();
	projectlight.markExternalLinks();

	//remove click event from local nav children selected items

	$(".campl-vertical-breadcrumb-children .campl-selected a").bind("click", function(e){
		e.preventDefault()
	})

	//instantiate calendar
	if(document.getElementById('calendar')){
		$("#calendar").Zebra_DatePicker({
		    always_visible: $('.calendar-container'),
			format: 'dd mm yyyy',
			direction: true,
			always_show_clear:false,
			disabled_dates: ['15 09 2012']
		});
	}

	//Change event for mobile navigation list selector
	if(document.getElementById('navigation-select')){
		$("#navigation-select").bind("change", function(e){
			window.location = $(this).val()
		})
	}


	$(".campl-notifications-panel").each(function(){
		var $thisElem = $(this);
		$thisElem.append("<a href='#' class='ir campl-close-panel'>Close panel</a>");
		$thisElem.find('.campl-close-panel').bind("click", function(e){
			$(e.target).parent().remove();
			e.preventDefault();
		})
	})


	//bound click events for twitter bootstrap pills and tab elements
	$('#navTabs a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	})

	$('#navPills a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	})

	$('#searchTabs a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	})



	//instantiate height of buttons for mobile users, on carousel object
	if($(".campl-carousel").length){
		projectlight.createCarousel();
    //wait for DOM ready to resize buttons for mobile (actually need to wait for page load) TPD
		if(Modernizr.mq('only screen and (max-width: 767px)')){
			$(window).load( function(){
          var height = $(".image-container").height();
			    $(".campl-carousel-controls, .campl-carousel-controls a.campl-previous, .campl-carousel-controls a.campl-next").height(height);
			});
		}else{
			$(".campl-carousel-controls, .campl-carousel-controls a").attr("style", "");
		}
	}


	//resize event handles changing flag layout to determine if user mode is mobile or not
	//If the mode has changed the re-rendering or reset functions will be called to change the page layout
	projectlight.$window.resize(function() {

		if($(".campl-carousel").length){
			projectlight.resetCarousel();

			//truncate homepage carousel content if page is thinner
			if(Modernizr.mq('only screen and (min-width: 768px) and (max-width: 1000px)')){

				//carousel height is remaining as if text isn't being truncated

				projectlight.$slideCaption.each(function(i){
						if(($.trim(projectlight.slideCaptionItems[i]).length>51)) {
							$(this).text($.trim(projectlight.slideCaptionItems[i]).substring(0, 50).split(" ").slice(0, -1).join(" ") + "...")
						}
					})

					projectlight.$carouselContent.each(function(i){
						if(($.trim(projectlight.slideCaptionItems[i]).length>36)) {
							$(this).text($.trim(projectlight.carouselContentItems[i]).substring(0, 35).split(" ").slice(0, -1).join(" ") + "...")
						}
					})
			}else{

				projectlight.$slideCaption.each(function(i){
					$(this).text(projectlight.slideCaptionItems[i]);
				})

				projectlight.$carouselContent.each(function(i){
					$(this).text(projectlight.carouselContentItems[i]);
				})
			}

		}

		//commented out debugging to help developers see page width during development
		//$("#pagewidth").html($(window).width());


		//check size of columns on resize event and remove incase of mobile layout
		if(Modernizr.mq('only all')){
			//if mobile layout is triggered in media queries
			if(Modernizr.mq('only screen and (max-width: 767px)')){
				//if layout moves from desktop to mobile layout
				if(!projectlight.mobileLayout){
					//set current state flag
					projectlight.mobileLayout  = true;
					//reset main nav to un-open state
					projectlight.$navigationDrawer.removeClass("campl-navigation-open");
					projectlight.$globalNavOuter.removeClass("campl-drawer-open");
					projectlight.$searchDrawer.removeClass("campl-search-open");
					//deselect any previously clicked links
					projectlight.$globalNavLI.removeClass("campl-selected");

					//reset nav menus
					projectlight.localNav.resetLocalNavigation();
					projectlight.localNav.hideMenu();
				}

				// if media queries are supported then remove columns on mobile layout
				projectlight.removeGlobalNavigationColumnHeight();
				projectlight.removeNavigationColumnHeight();
				projectlight.removeContentColumnHeight();
				projectlight.removeSectionListChildrenColumnHeight();
				projectlight.removeFooterColumnsHeight();

				//set height of carousel buttons
				$(".campl-carousel-controls, .campl-carousel-controls a.campl-previous, .campl-carousel-controls a.campl-next").height($(".image-container").height());

				projectlight.mobileLayout  = true;
			}else{ //desktop layout code
				//if page width moves from mobile layout to desktop
				if(projectlight.mobileLayout){
					//set current state flag
					projectlight.mobileLayout  = false;

					//reset nav menus
					//hide dropdowns if open
					projectlight.localNav.resetLocalNavigation();
					projectlight.localNav.hideMenu();
					//close global nav drawer
					$("body").removeClass("campl-navigation-open");
				}
				projectlight.setGlobalNavigationColumnHeight();
				projectlight.setNavigationColumnHeight();
				projectlight.setContentColumnHeight();
				projectlight.setSectionListChildrenColumnHeight();
				projectlight.setFooterColumnsHeight();

				//remove fixed height on carousel buttons
				//set height of carousel buttons
				$(".campl-carousel-controls, .campl-carousel-controls a").attr("style", "");

				projectlight.mobileLayout  = false;
			}
		}
	})



})

})(jQuery);






