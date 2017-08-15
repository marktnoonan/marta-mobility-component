/* global ExpandoModule:false */
/* global TabbedModule:false */
/* global CodeMirror:false */
/* global enquire:false */

var addressAutocomplete = function () {
    var timer;
    var displayDropdown = function ($this, query) {
        // Create dropdown if it doesn't already exist
        if (!$this.closest('.address-autocomplete').find('.address-autocomplete__dropdown').length) {
            $this.after('<div class="address-autocomplete__dropdown"><ul class="address-autocomplete__dropdown-items"></ul></div>');
        }

        var $dropdownItems = $this.closest('.address-autocomplete').find('.address-autocomplete__dropdown-items');

        if ($this.val().length >= 5) {
            var params = {
                country: 'us',
                proximity: '-84.3880,33.7490',
                bbox: '-85.605165,30.355757,-80.751429,35.000659',
                access_token: 'pk.eyJ1IjoibWFydGF1c2VyIiwiYSI6ImNpcTE2OWZsazAwdnRmdG00c2hwZHAxYmcifQ.X76v7TavYSzkEN4AuVeh9Q',
            };

            $.ajax({
                url: '//api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json',
                type: 'GET',
                data: params,
                dataType: 'json',
                error: function () {
                },
                success: function (res) {
                    var data = [];

                    for (var itemPos in res.features) {
                        var resultItem = res.features[itemPos];
                        var lonlat = resultItem.geometry.coordinates;
                        var item = {
                            id: parseInt(itemPos, 10) + 1,
                            text: resultItem.place_name,
                            place: lonlat[1] + ',' + lonlat[0],
                            source: 'mapbox'
                        };

                        data.push(item);
                    }

                    // Clear address list
                    $this.closest('.address-autocomplete').find('.address-autocomplete__dropdown-item').remove();

                    if (data.length > 0) {
                        // Fill address list
                        for (var i = 0; i < data.length; i++) {
                            $dropdownItems.append('<li class="address-autocomplete__dropdown-item"><a class="address-autocomplete__dropdown-item-link address-autocomplete__dropdown-item-link--result" href="#" data-place="' + data[i].place + '">' + data[i].text + '</a></li>');
                        }

                        //  Select first item
                        $dropdownItems.find('.address-autocomplete__dropdown-item-link').first().addClass('is-selected');
                    }
                    else {
                        // Not found
                        $dropdownItems.append('<li class="address-autocomplete__dropdown-item"><a class="address-autocomplete__dropdown-item-link address-autocomplete__dropdown-item-link--not-found">' + query + ' (not found)</a></li>');
                    }
                }
            });
        }
        else {
            // Clear address list
            $this.closest('.address-autocomplete').find('.address-autocomplete__dropdown-item').remove();

            // Not enough characters
            $dropdownItems.append('<li class="address-autocomplete__dropdown-item"><a class="address-autocomplete__dropdown-item-link address-autocomplete__dropdown-item-link--not-found">Please enter at least 5 characters</a></li>');
        }
    };

    $('.js-address-autocomplete-input').on('click', function (event) {
        event.stopPropagation();
    });

    $('.js-address-autocomplete-input').on('keydown', function (event) {
        var $this = $(this);
        var $wrapper = $this.closest('.address-autocomplete');

        var noOfItems = $wrapper.find('.address-autocomplete__dropdown-item-link--result').length;
        var $selectedItem = $wrapper.find('.address-autocomplete__dropdown-item-link--result.is-selected');

        if (event.keyCode === 13) {
            if (noOfItems > 1) {
                event.preventDefault();

                $this.val($selectedItem.text());
                $wrapper.find('input[type="hidden"]').val($selectedItem.attr('data-place'));
                $('.address-autocomplete__dropdown').remove();

                $this.blur();

                return false;
            }
        }
        else if ((event.keyCode === 38) || (event.keyCode === 40)) {
            event.preventDefault();
            return false;
        }
    });

    $('.js-address-autocomplete-input').on('keyup', function (event) {
        var $this = $(this);
        var $wrapper = $this.closest('.address-autocomplete');
        var query = $this.val();

        var index = $wrapper.find('.address-autocomplete__dropdown-item-link--result.is-selected').closest('.address-autocomplete__dropdown-item').index();
        var noOfItems = $wrapper.find('.address-autocomplete__dropdown-item-link--result').length;

        var updateSelectedItem = function () {
            $wrapper.find('.address-autocomplete__dropdown-item-link--result.is-selected').removeClass('is-selected');
            $wrapper.find('.address-autocomplete__dropdown-item').eq(index).find('.address-autocomplete__dropdown-item-link--result').addClass('is-selected');
        };

        if (event.keyCode === 38) {
            if ((noOfItems > 1) && (index > 0)) {
                index--;
                updateSelectedItem();
            }
        }
        else if (event.keyCode === 40) {
            if ((noOfItems > 1) && (index < (noOfItems - 1))) {
                index++;
                updateSelectedItem();
            }
        }
        else {
            clearTimeout(timer);

            timer = setTimeout(function () {
                displayDropdown($this, query);
            }, 200);
        }
    });

    $('.js-address-autocomplete-input').on('focus', function () {
        var $this = $(this);
        var $wrapper = $this.closest('.address-autocomplete');
        var query = $this.val();

        $('.address-autocomplete__dropdown').not($wrapper.find('.address-autocomplete__dropdown')).remove();
        displayDropdown($this, query);
    });

    $('.js-address-autocomplete-input').on('blur', function () {
        var $this = $(this);
        var $wrapper = $this.closest('.address-autocomplete');

        var noOfItems = $wrapper.find('.address-autocomplete__dropdown-item-link--result').length;
        var $selectedItem = $wrapper.find('.address-autocomplete__dropdown-item-link--result.is-selected');

        if (noOfItems > 1) {
            $this.val($selectedItem.text());
            $wrapper.find('input[type="hidden"]').val($selectedItem.attr('data-place'));
            $('.address-autocomplete__dropdown').remove();
        }
    });

    $('.address-autocomplete').on('click', '.address-autocomplete__dropdown-item-link--result', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $wrapper = $this.closest('.address-autocomplete');
        var $input = $wrapper.find('.js-address-autocomplete-input');

        $input.val($this.text());
        $wrapper.find('input[type="hidden"]').val($this.attr('data-place'));
    });

    $('.address-autocomplete').on('click', '.address-autocomplete__dropdown-item-link--not-found', function (event) {
        event.stopPropagation();
    });

    $('body').on('click', function () {
        $('.address-autocomplete__dropdown').remove();
    });
};


var backToTop = function () {
    var main = function () {
        var $element = $('.js-back-to-top');
        var documentTop = $(document).scrollTop();
        var windowBottom = $(window).scrollTop() + $(window).height();
        var siteFooterHeight = $('.site-footer').height();
        var siteFooterTop = $('.site-footer').offset().top;

        if (documentTop <= 1200) {
            $element.slideUp(200);
        }
        else if (documentTop > 1200) {
            $element.slideDown(200);
        }

        if (windowBottom < siteFooterTop) {
            $element.css({
                'bottom': '0',
                'position': 'fixed'
            });
        }
        else if (windowBottom >= siteFooterTop) {
            $element.css({
                'bottom': siteFooterHeight,
                'position': 'absolute'
            });
        }
    };

    main();

    $('.back-to-top').on('click', function (event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: 0
        });
    });

    $(document).on('scroll', function () {
        main();
    });

    $(window).on('resize', function () {
        main();
    });
};

var carousels = function () {
    $('.js-title-carousel__slides').slick({
        'prevArrow': '<a tabindex="0" aria-label="previous slide" class="title-carousel__previous" href="#">&larr;</a>',
        'nextArrow': '<a tabindex="0" aria-label="next slide" class="title-carousel__next" href="#">&rarr;</a>'
    });

    // Initialize tabindexes for title carousel links
    $('.js-title-carousel__slide a').attr("tabindex", "-1");
    $('.js-title-carousel__slide .slick-active a').attr("tabindex", "0");

    // Changes title carousel link tabindexes on change
    $('.js-title-carousel__slides').on('afterChange', function () {
        $('.js-title-carousel__slide a').attr("tabindex", "-1");
        $('.js-title-carousel__slide .slick-active a').attr("tabindex", "0");
    });

    $('.js-featured-events__slides').slick({
        'arrows': false
    });

    $('.js-featured-events__slides-nav').find('a').click(function (event) {
        event.preventDefault();

        var slideIndex = $(this).closest('li').index();
        $('.js-featured-events__slides').slick('slickGoTo', slideIndex);
    });

    $('.js-featured-events__slides').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var $module = $(this).closest('.js-featured-events');
        var $nav = $module.find('.js-featured-events__slides-nav');

        $nav.find('li a').removeClass('is-current');
        $nav.find('li').eq(nextSlide).find('a').addClass('is-current');
    });

    $('.js-featured-events__slides').on('afterChange', function () {
        $('.featured-events__slide-cta').attr("tabindex", "-1");
        $('.featured-events .slick-active .featured-events__slide-cta').attr("tabindex", "0");
    });

    $('.js-station-gallery__slides').slick({
        'prevArrow': '<a class="station-gallery__previous" href="#">&larr;</a>',
        'nextArrow': '<a class="station-gallery__next" href="#">&rarr;</a>'
    });
};

var form = function () {
    $('.js-validate-form').each(function () {
        $(this).validate({
            errorPlacement: function (error, element) {
                var $field = element.closest('.form__field');

                $field.append(error);

                if (element.is('select')) {
                    $field.find('.selectboxit').addClass('error');
                }
            },
            ignore: ''
        });
    });

    $('select').selectBoxIt({
        aggressiveChange: true,
        autoWidth: false
    });

    $('.form').find('select').on('change', function () {
        var $this = $(this);
        var $field = $this.closest('.form__field');

        $field.find('.selectboxit').addClass('is-changed');

        $this.removeClass('error');
        $field.find('.selectboxit').removeClass('error');
        $field.find('label.error').remove();
    });
    $('.js-clear-input-wrapper').find('input').on('input', function () {
        var $this = $(this);
        var $wrapper = $this.closest('.js-clear-input-wrapper');
        var $trigger = $wrapper.find('.js-clear-input-trigger');
        var val = $this.val();

        if (val) {
            $trigger.removeClass('is-hidden');
        }
        else {
            $trigger.addClass('is-hidden');
        }
    });

    $('.js-clear-input-trigger').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $wrapper = $this.closest('.js-clear-input-wrapper');

        $wrapper.find('input').val('');
        $this.addClass('is-hidden');
        $('.isotope').isotope({ filter: '*' });
    });

    $('.js-elastic-textarea').elastic();

    $('input, textarea').placeholder();
};

var isotope = function () {
    function debounce(fn, threshold) {
        var timeout;

        return function debounced() {
            if (timeout) {
                clearTimeout(timeout);
            }
            function delayed() {
                fn();
                timeout = null;
            }

            timeout = setTimeout(delayed, threshold || 100);
        };
    }

    var qsRegex;

    var $container = $('.isotope').isotope({
        itemSelector: '.stations__item'
    });

    var $quicksearch = $('.quicksearch').keyup(debounce(function () {
        qsRegex = new RegExp($quicksearch.val(), 'gi');
        $container.isotope();
    }, 200));

    // filter functions
    var filterFns = {
        // show if number is greater than 50
        numberGreaterThan50: function () {
            var number = $(this).find('.number').text();
            return parseInt(number, 10) > 50;
        },
        // show if name ends with -ium
        ium: function () {
            var name = $(this).find('.name').text();
            return name.match(/ium$/);
        }
    };

    // quicksearch
    $('.quicksearch').on('keyup', function () {
        $container.isotope({
            filter: function () {
                return qsRegex ? $(this).text().match(qsRegex) : true;
            }
        });
    });

    // bind filter button click
    $('#filters').on('click', 'button', function (event) {
        event.preventDefault();

        $('.quicksearch').val('');
        var filterValue = $(this).attr('data-filter');
        // use filterFn if matches value
        filterValue = filterFns[filterValue] || filterValue;
        $container.isotope({ filter: filterValue });
    });

    $('.quicksearch').keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });


    // change is-checked class on buttons
    $('.button-group').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });
};

var mainNav = function () {
    $('.js-main-nav__trigger').on('click', function (event) {
        event.preventDefault();

        var $this = $(this);

        $this.toggleClass('is-open');
        if (!$this.hasClass('is-open')) {
            $('.main-nav__nav').find('.main-nav__dropdown').hide();
            $('.main-nav__nav').find('.main-nav__level1').removeClass('is-selected');
            $('.main-nav__level1').removeClass('is-hovered');
        }
        $('.js-main-nav').toggle();
    });

    enquire.register('screen and (max-width: 991px)', {
        match: function () {
            $('.main-nav__level1').unbind('mouseenter').unbind('mouseleave');
            $('.main-nav__level1').removeProp('hoverIntent_t').removeProp('hoverIntent_s');
            $('.main-nav__level1').removeClass('is-hovered');

            $('.main-nav__dropdown-trigger').off().on('click', function (event) {
                event.preventDefault();

                var $this = $(this);

                $this.closest('.main-nav__level1').find('.main-nav__dropdown').toggle();
                $this.closest('.main-nav__level1').toggleClass('is-selected');
            });
        }
    });

    enquire.register('screen and (min-width: 992px)', {
        match: function () {
            $('.main-nav__dropdown-trigger').off();
            $('.main-nav__level1').removeClass('is-selected');

            $('.js-main-nav').show();
            $('.main-nav__dropdown').hide();

            $('.main-nav__level1').off().hoverIntent({
                over: function () {
                    var $this = $(this);

                    $('.main-nav__level1').removeClass('is-hovered');

                    $this.find('.main-nav__dropdown').stop(true, true).fadeIn(50, function () {
                        $this.addClass('is-hovered');
                    });
                },
                out: function () {
                    var $this = $(this);

                    $this.find('.main-nav__dropdown').hide(0, function () {
                        $this.removeClass('is-hovered');
                    });
                },
                timeout: 100
            });

            // Force main nav dropdowns to open on focus.
            $('.main-nav__level1').on("focus", function () {
                var $this = $(this);

                // Close all main nav dropdowns
                $('.main-nav__dropdown').hide(0, function () {
                    $('.main-nav__level1').removeClass('is-hovered');
                });

                // Close all mini-service alerts
                $('.mini-service-updates__item').removeClass('is-selected');

                // Open this one
                $this.find('.main-nav__dropdown').stop(true, true).fadeIn(50, function () {
                    $this.addClass('is-hovered');
                });
            });
            
        }
    });
};

var miniServicesUpdates = function () {
    var $miniServiceUpdatesItem = $('.mini-service-updates__item');
    enquire.register('screen and (max-width: 991px)', {
        match: function () {
            $('.mini-service-updates__trigger').on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                var $this = $(this);
                var $thisItem = $this.closest('.mini-service-updates__item');

                $miniServiceUpdatesItem.not($thisItem).removeClass('is-selected');
                $this.closest('.mini-service-updates__item').toggleClass('is-selected');
            });
        },
    });

    $('.mini-service-updates__item').on('focus', function () {
        // Close all main nav items and mini-service updates
        $('.mini-service-updates__item').removeClass('is-selected');
        $(".main-nav__level1").removeClass("is-hovered");

        $(this).addClass('is-selected');

        $('.main-nav__dropdown').hide();
    });
    $('.mini-service-updates__content > a').on('blur', function () {
        $('.mini-service-updates__item').removeClass('is-selected');
        $('.mini-service-updates__item:focus').addClass('is-selected');
    });

    $('body').on('click', function () {
        $miniServiceUpdatesItem.removeClass('is-selected');
    });
};

var planATripBox = function () {
    var setTimeDate = function ($wrapper) {
        var currentDateTime = new Date();
        var currentDate = formatDate(currentDateTime);
        var currentTime = formatTime(currentDateTime);

        $wrapper.find('.js-current-time').val(currentTime).attr('placeholder', currentTime);
        $wrapper.find('.js-current-date').val(currentDate).attr('placeholder', currentDate);
    };

    setTimeDate($('body'));

    $('.js-departure-time-select').on('change', function () {
        var $this = $(this);
        var $departureTimeDate = $this.closest('.js-departure-time').find('.js-departure-time-date');

        if ($this.find('option:selected').text() === 'Departing At' || $this.find('option:selected').text() === 'Arrive By') {
            $departureTimeDate.show();
            setTimeDate($departureTimeDate);
        }
        else {
            $departureTimeDate.hide();
        }
    });

    $('.js-plan-a-trip-box-form').on('submit', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $departureTimeDate = $this.find('.js-departure-time-date');
        var action;

        if ($('select[name="arriveBy"]').val() === 'departingNow') {
            setTimeDate($departureTimeDate);
        }

        action = 'plan-a-trip.html#plan?' + $this.serialize();

        window.location = action;
    });
};

var realtimeTrainUpdate = function (callback) {
    $('.js-arrival-time-value').removeClass('was-changed');

    $('.station-status--station-detail').find('.station-status__item').css({
        'border-left': '',
        'padding-left': ''
    });

    $.get('./arrivals.aspx', function (data) {
        data = JSON.parse(data);

        $.each(data, function (index, item) {
            $('.js-arrival-time[data-station="' + item.STATION + '"][data-line="' + item.LINE + '"][data-direction="' + item.DIRECTION + '"]')
              .find('.js-arrival-time-value').not('.was-changed').text(item.WAITING_TIME).addClass('was-changed')
              .closest('.js-arrival-time').show();
        });

        if ($('.isotope').length) {
            $('.isotope').isotope('layout');
        }

        $('.station-status--station-detail').find('.station-status__item:visible:first').css({
            'border-left': 'none',
            'padding-left': '0'
        });

        if (typeof callback === 'function') {
            callback();
        }
    });
};


var subnav = function () {
    $('.js-subnav-select').on('change', function () {
        var url = $(this).val();

        if (url) {
            window.location = url;
        }

        return false;
    });
};

var stickyHeaderTables = function () {
    $('.js-sticky-table-headers').stickyTableHeaders({
        scrollableArea: $(this).closest('.route-schedules__table-wrapper')[0]
    });

    $('.js-sticky-table-headers').on('enabledStickiness.stickyTableHeaders', function () {
        $(this).closest('.route-schedules__table-wrapper').find('.route-schedules__sticky-header-mask').css({
            'display': 'block'
        });
    }).on('disabledStickiness.stickyTableHeaders', function () {
        $(this).closest('.route-schedules__table-wrapper').find('.route-schedules__sticky-header-mask').css({
            'display': 'none'
        });
    });

    $('.route-schedules__table-wrapper').on('scroll', function () {
        $(window).trigger('resize.stickyTableHeaders');
    });
};

var typeaheadField = function () {
    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q.replace(/\s/g, ''), 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            var stripped;
            $.each(strs, function (i, str) {
                // Remove dashes and spaces from consideration
                stripped = str.replace(/-/g, '');
                stripped = stripped.replace(/\s/g, '');
                if (substrRegex.test(stripped)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    var routes = [
      'ROUTE - 1 Marietta Street',
      'ROUTE - 2 Ponce de Leon Ave/East Lake',
      'ROUTE - 3 Martin Luther King Jr. Dr/Auburn Av',
      'ROUTE - 4 Thomasville/Moreland Avenue',
      'ROUTE - 5 Piedmont Road/Sandy Springs',
      'ROUTE - 6 Emory',
      'ROUTE - 8 North Druid Hills Rd.',
      'ROUTE - 9 Toney Valley /Peachcrest Rd.',
      'ROUTE - 12 Howell Mill Rd/Cumberland',
      'ROUTE - 13 Atlanta Student Movement Blvd/Hunter Hills',
      'ROUTE - 15 Candler Rd/South DeKalb',
      'ROUTE - 16 Ralph McGill/N Highland/Lenox',
      'ROUTE - 19 Clairmont Road',
      'ROUTE - 21 Memorial Drive',
      'ROUTE - 24 East Lake/Hosea Williams',
      'ROUTE - 25 Peachtree Ind. Blvd/Johnson Ferry',
      'ROUTE - 26 Perry Boulevard/North Avenue',
      'ROUTE - 27 Cheshire Bridge Rd/Ansley Mall',
      'ROUTE - 30 LaVista Rd',
      'ROUTE - 32 Bouldercrest',
      'ROUTE - 33 Briarcliff Road/Shallowford Road',
      'ROUTE - 34 Gresham/Clifton Springs',
      'ROUTE - 36 North Decatur Rd/Virginia Highland',
      'ROUTE - 37 Defoors Ferry Road',
      'ROUTE - 39 Buford Highway',
      'ROUTE - 42 Pryor Road/McDaniel Street',
      'ROUTE - 47 Briarwood Road/I-85 Access Road/Chamblee',
      'ROUTE - 49 McDonough Boulevard',
      'ROUTE - 50 Donald E Hollowell Pkwy.',
      'ROUTE - 51 Joseph E Boone Blvd',
      'ROUTE - 53 Skipper Drive/West Lake Avenue',
      'ROUTE - 55 Jonesboro Rd/Hutchens Rd/Forest Pky',
      'ROUTE - 56 Adamsville/Collier Heights',
      'ROUTE - 58 Atlanta Industrial/Hollywood Rd',
      'ROUTE - 60 Hightower/Moores Mill',
      'ROUTE - 66 Lynhurst Dr/Barge Rd P/R',
      'ROUTE - 67 Lucile Avenue/Dixie Hills',
      'ROUTE - 68 Donnelly/Beecher',
      'ROUTE - 71 Cascade Road',
      'ROUTE - 73 Fulton Industrial',
      'ROUTE - 74 Flat Shoals',
      'ROUTE - 75 Lawrenceville Highway',
      'ROUTE - 78 Cleveland Ave',
      'ROUTE - 79 Sylvan Hills',
      'ROUTE - 81 Venetian Hills',
      'ROUTE - 82 Camp Creek Parkway/Welcome All Road',
      'ROUTE - 83 Campbellton/Greenbriar',
      'ROUTE - 84 Washington Road/Camp Creek Marketplace',
      'ROUTE - 85 Roswell/Mansell Rd',
      'ROUTE - 86 Fairington Rd/McAfee Road',
      'ROUTE - 87 Roswell Rd./Morgan Falls',
      'ROUTE - 89 Old National Hwy./Union City',
      'ROUTE - 93 East Point/Delowe Drive',
      'ROUTE - 94 Northside Drive',
      'ROUTE - 95 Metropolitan Pkwy./Hapeville',
      'ROUTE - 99 Boulevard/Monroe Drive',
      'ROUTE - 102 North Avenue/Candler Park',
      'ROUTE - 103 Peeler Rd./N. Shallowford Rd.',
      'ROUTE - 104 Winters Chapel Road',
      'ROUTE - 107 Glenwood Road',
      'ROUTE - 109 Monroe Dr/Boulevard',
      'ROUTE - 110 Peachtree St./"The Peach"',
      'ROUTE - 111 Snapfinger Woods Dr. /Stonecrest',
      'ROUTE - 114 Columbia Drive/Clifton Springs Road',
      'ROUTE - 115 Covington Highway/South Hairston Rd',
      'ROUTE - 116 Redan Road/Stonecrest',
      'ROUTE - 117 Rockbridge Rd./Panola Rd.',
      'ROUTE - 119 Hairston Road / Stone Mountain Village',
      'ROUTE - 120 East Ponce de Leon Avenue',
      'ROUTE - 121 Memorial Drive / North Hairston Road',
      'ROUTE - 123 North DeKalb Mall/Decatur/East Lake',
      'ROUTE - 124 Pleasantdale Road',
      'ROUTE - 125 Clarkston/Northlake',
      'ROUTE - 126 NorthLake / Chamblee',
      'ROUTE - 132 Tilly Mill Road',
      'ROUTE - 140 North Point Parkway',
      'ROUTE - 141 Haynes Bridge Road / Milton',
      'ROUTE - 143 Windward Park / Ride',
      'ROUTE - 148 Sandy Springs./Riveredge Pkwy.',
      'ROUTE - 150 Perimeter Center/Dunwoody Village',
      'ROUTE - 153 H E Holmes / Browntown',
      'ROUTE - 155 Windsor Street/Lakewood Ave/Polar Rock',
      'ROUTE - 162 Alison Court / Delowe Drive',
      'ROUTE - 165 Fairburn Rd./Barge Rd. Park/Ride',
      'ROUTE - 172 Sylvan Road/Virginia Ave.',
      'ROUTE - 178 Empire Blvd./Southside Ind. Parka',
      'ROUTE - 180 Fairburn / Palmetto',
      'ROUTE - 181 Buffington Rd./South Fulton P/R',
      'ROUTE - 183 Barge Rd. P/R /Lakewood',
      'ROUTE - 185 Holcomb Bridge Rd/Alpharetta Hwy/Old Milton Pkwy',
      'ROUTE - 186 Rainbow Dr. / South DeKalb',
      'ROUTE - 189 Flat Shoals Road/ Scofield Road',
      'ROUTE - 191 Riverdale / ATL International Terminal',
      'ROUTE - 192 Old Dixie / Tara Boulevard',
      'ROUTE - 193 Morrow / Jonesboro',
      'ROUTE - 194 Conley Road / Mt. Zion',
      'ROUTE - 195 Forest Parkway',
      'ROUTE - 196 Upper Riverdale / Southlake',
      'ROUTE - 800 Lovejoy',
	  'ROUTE - 823 Belvedere/Decatur',
      'ROUTE - 201 Six Flags Over Georgia',
      'ROUTE - 221 Memorial Drive Limited',
      'ROUTE - 865 Boulder Park Drive',
      'STN - Airport',
      'STN - Ashby',
      'STN - Avondale',
      'STN - Barge Rd',
      'STN - Brookhaven / Oglethorpe',
      'STN - Chamblee',
      'STN - Civic Center',
      'STN - College Park',
      'STN - Decatur',
      'STN - Dome / Congress Center / Philips Arena / CNN',
      'STN - Doraville',
      'STN - Dunwoody',
      'STN - East Lake',
      'STN - East Point',
      'STN - Edgewood / Candler Park',
      'STN - Five Points',
      'STN - Garnett',
      'STN - Georgia State',
      'STN - Hamilton E. Holmes',
      'STN - Indian Creek',
      'STN - Inman Park / Reynoldstown',
      'STN - Kensington',
      'STN - King Memorial',
      'STN - Lakewood / Ft. McPherson',
      'STN - Mansell Road',
      'STN - Medical Center',
      'STN - North Ave',
      'STN - North Springs',
      'STN - Peachtree Center',
      'STN - Sandy Springs',
      'STN - South Fulton',
      'STN - Vine City',
      'STN - West End',
      'STN - Arts Center',
      'STN - Bankhead',
      'STN - Buckhead',
      'STN - Justice Center',
      'STN - Lenox',
      'STN - Lindbergh Center',
      'STN - Midtown',
      'STN - Oakland City',
      'STN - West Lake',
      'STN - Windward Pkwy'
    ];

    var stations = [
      'Airport',
      'Ashby',
      'Avondale',
      'Barge Rd',
      'Brookhaven / Oglethorpe',
      'Chamblee',
      'Civic Center',
      'College Park',
      'Decatur',
      'Dome / Congress Center / Philips Arena / CNN',
      'Doraville',
      'Dunwoody',
      'East Lake',
      'East Point',
      'Edgewood / Candler Park',
      'Five Points',
      'Garnett',
      'Georgia State',
      'Hamilton E. Holmes',
      'Indian Creek',
      'Inman Park / Reynoldstown',
      'Kensington',
      'King Memorial',
      'Lakewood / Ft. McPherson',
      'Mansell Road',
      'Medical Center',
      'North Avenue',
      'North Springs',
      'Peachtree',
      'Sandy Springs',
      'South Fulton',
      'Vine City',
      'West End',
      'Arts Center',
      'Bankhead',
      'Buckhead',
      'Justice Center',
      'Lenox',
      'Lindbergh Center',
      'Midtown',
      'Oakland City',
      'West Lake',
      'Windward Pkwy'
    ];

    $('#routes').find('.typeahead').typeahead({
        limit: 100,
        hint: true,
        highlight: true,
        minLength: 1,
    },
    {
        name: 'routes',
        source: substringMatcher(routes)
    }).on('typeahead:selected', function () {

        var routeStr = $('#searchByRouteOrStation').val();

        if (routeStr.indexOf("ROUTE") > -1) {
            var occ1 = nth_occurrence(routeStr, ' ', 2);
            var occ2 = nth_occurrence(routeStr, ' ', 3);
            var routeNumberStr = routeStr.substring(occ1 + 1, occ2);
            var routeNameStr = routeStr.substring(occ2 + 1, routeStr.length);

            window.location.href = routeNumberStr + '.aspx';
        }
        else if (routeStr.indexOf("STN") > -1) {
            var stationname = routeStr.replace('STN - ', '')

             switch (stationname) {
                case 'Brookhaven / Oglethorpe':
                    stationname = 'Brookhaven';
                    break;
                case 'Dome / Congress Center / Philips Arena / CNN':
                    stationname = 'Omni';
                    break;
                case 'Edgewood / Candler Park':
                    stationname = 'Edgewood-Candler-Park';
                    break;
                case 'Inman Park / Reynoldstown':
                    stationname = 'Inman-Park';
                    break;
                case 'Lakewood / Ft. McPherson':
                    stationname = 'Lakewood';
                    break;
                case 'Lindbergh Center':
                    stationname = 'Lindbergh';
                    break;
                case 'Hamilton E. Holmes':
                    stationname = 'Hamilton-E-Holmes';
                    break;
            }


            //window.location.href = 'station-detail.aspx?station=' + stationname;
            stationname = stationname.replace(" ", "-");
            window.location.href = stationname + '.aspx';
        }
    });




    $('#routes1').find('.typeahead').typeahead({
        hint: false,
        highlight: true,
        minLength: 1,
    },
  {
      limit: 10,
      name: 'routes',
      source: substringMatcher(routes)
  }).on('typeahead:selected', function () {

      var routeStr = $('#findTheNextArrivalInput').val();
      if (routeStr.indexOf("ROUTE") > -1) {
          var occ1 = nth_occurrence(routeStr, ' ', 2);
          var occ2 = nth_occurrence(routeStr, ' ', 3);
          var routeNumberStr = routeStr.substring(occ1 + 1, occ2);
          var routeNameStr = routeStr.substring(occ2 + 1, routeStr.length);

          window.location.href = routeNumberStr + '.aspx';
      }
      else if (routeStr.indexOf("STN") > -1) {
          var stationname = routeStr.replace('STN - ', '')
          var val = routeStr;
          if (val === 'STN - Airport') {
              stationName = 'AIRPORT STATION';
          }
          else if (val === 'STN - Arts Center') {
              stationName = 'ARTS CENTER STATION';
          }
          else if (val === 'STN - Ashby') {
              stationName = 'ASHBY STATION';
          }
          else if (val === 'STN - Avondale') {
              stationName = 'AVONDALE STATION';
          }
          else if (val === 'STN - Bankhead') {
              stationName = 'BANKHEAD STATION';
          }
          else if (val === 'STN - Brookhaven / Oglethorpe') {
              stationName = 'BROOKHAVEN STATION';
          }
          else if (val === 'STN - Buckhead') {
              stationName = 'BUCKHEAD STATION';
          }
          else if (val === 'STN - Chamblee') {
              stationName = 'CHAMBLEE STATION';
          }
          else if (val === 'STN - Civic Center') {
              stationName = 'CIVIC CENTER STATION';
          }
          else if (val === 'STN - College Park') {
              stationName = 'COLLEGE PARK STATION';
          }
          else if (val === 'STN - Decatur') {
              stationName = 'DECATUR STATION';
          }
          else if (val === 'STN - Dome / Congress Center / Philips Arena / CNN') {
              stationName = 'OMNI DOME STATION';
          }
          else if (val === 'STN - Doraville') {
              stationName = 'DORAVILLE STATION';
          }
          else if (val === 'STN - Dunwoody') {
              stationName = 'DUNWOODY STATION';
          }
          else if (val === 'STN - East Lake') {
              stationName = 'EAST LAKE STATION';
          }
          else if (val === 'STN - East Point') {
              stationName = 'EAST POINT STATION';
          }
          else if (val === 'STN - Edgewood / Candler Park') {
              stationName = 'EDGEWOOD CANDLER PARK STATION';
          }
          else if (val === 'STN - Five Points') {
              stationName = 'FIVE POINTS STATION';
          }
          else if (val === 'STN - Garnett') {
              stationName = 'GARNETT STATION';
          }
          else if (val === 'STN - Georgia State') {
              stationName = 'GEORGIA STATE STATION';
          }
          else if (val === 'STN - Hamilton E. Holmes') {
              stationName = 'HAMILTON E HOLMES STATION';
          }
          else if (val === 'STN - Indian Creek') {
              stationName = 'INDIAN CREEK STATION';
          }
          else if (val === 'STN - Inman Park / Reynoldstown') {
              stationName = 'INMAN PARK STATION';
          }
          else if (val === 'STN - Kensington') {
              stationName = 'KENSINGTON STATION';
          }
          else if (val === 'STN - King Memorial') {
              stationName = 'KING MEMORIAL STATION';
          }
          else if (val === 'STN - Lakewood / Ft. McPherson') {
              stationName = 'LAKEWOOD STATION';
          }
          else if (val === 'STN - Lenox') {
              stationName = 'LENOX STATION';
          }
          else if (val === 'STN - Lindbergh Center') {
              stationName = 'LINDBERGH STATION';
          }
          else if (val === 'STN - Medical Center') {
              stationName = 'MEDICAL CENTER STATION';
          }
          else if (val === 'STN - Midtown') {
              stationName = 'MIDTOWN STATION';
          }
          else if (val === 'STN - North Avenue') {
              stationName = 'NORTH AVE STATION';
          }
          else if (val === 'STN - North Springs') {
              stationName = 'NORTH SPRINGS STATION';
          }
          else if (val === 'STN - Oakland City') {
              stationName = 'OAKLAND CITY STATION';
          }
          else if (val === 'STN - Peachtree') {
              stationName = 'PEACHTREE CENTER STATION';
          }
          else if (val === 'STN - Sandy Springs') {
              stationName = 'SANDY SPRINGS STATION';
          }
          else if (val === 'STN - Vine City') {
              stationName = 'VINE CITY STATION';
          }
          else if (val === 'STN - West End') {
              stationName = 'WEST END STATION';
          }
          else if (val === 'STN - West Lake') {
              stationName = 'WEST LAKE STATION';
          }

          var $stationStatus = $("#findTheNextArrival").find(".find-the-next-arrival__station-status");

          if (stationName !== '') {
              $stationStatus.hide();
              $stationStatus.find('.station-status__item').hide();
              $stationStatus.find('.station-status__item').attr('data-station', stationName);
              realtimeTrainUpdate(function () { $stationStatus.show(); });
          }
          else {
              $stationStatus.hide();
          }

          //window.location.href = 'station-detail.aspx?station=' + val;
      }


  });
};

function nth_occurrence(string, char, nth) {
    var first_index = string.indexOf(char);
    var length_up_to_first_index = first_index + 1;

    if (nth == 1) {
        return first_index;
    } else {
        var string_after_first_occurrence = string.slice(length_up_to_first_index);
        var next_occurrence = nth_occurrence(string_after_first_occurrence, char, nth - 1);

        if (next_occurrence === -1) {
            return -1;
        } else {
            return length_up_to_first_index + next_occurrence;
        }
    }
}

function formatDate(dateObj) {
    var dd = dateObj.getDate();
    var mm = dateObj.getMonth() + 1;
    var yyyy = dateObj.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return mm + '/' + dd + '/' + yyyy;
}

function formatTime(dateObj) {
    // formats a javascript Date object into a 12h AM/PM time string
    var hh = dateObj.getHours();
    var mm = dateObj.getMinutes();
    var period = (hh > 11) ? 'PM' : 'AM';

    if (hh > 12) {
        hh -= 12;
    }
    else if (hh === 0) {
        hh = '12';
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return hh + ':' + mm + ' ' + period;
}



$(document).ready(function () {
    ExpandoModule.init();
    TabbedModule.init();

    addressAutocomplete();
    backToTop();
    carousels();
    form();
    isotope();
    mainNav();
    miniServicesUpdates();
    planATripBox();
    stickyHeaderTables();
    subnav();
    typeaheadField();

    $('.js-datepicker').datepicker({
        dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    });

    $('.js-codemirror').each(function () {
        var $this = $(this);
        var mode = $this.data('mode');
        var text = $this.text();
        var lines = text.split('\n');

        // Remove extra indentation and extra lines
        if (text.trim().length > 0) {
            var doneRemovingExtraIndentation = false;

            while (!doneRemovingExtraIndentation) {
                var i;

                // Check if all lines are indented
                for (i = 0; i < lines.length; i++) {
                    if (lines[i].indexOf('  ') !== 0 && lines[i].trim().length > 0) {
                        doneRemovingExtraIndentation = true;
                    }
                }

                // If all lines are indented, remove indentation
                if (!doneRemovingExtraIndentation) {
                    for (i = 0; i < lines.length; i++) {
                        lines[i] = lines[i].replace(/^  /, '');
                    }
                }
            }
        }

        $this.text(lines.join('\n').trim());

        // CodeMirror
        CodeMirror.fromTextArea(this, {
            mode: mode,
            lineNumbers: true,
            readOnly: true
        });
    });


    if ($('.station-status__items').length) {
        realtimeTrainUpdate();
        window.setInterval(realtimeTrainUpdate, 10000);
    }

    $('input, textarea').on('change', function () {
        var $this = $(this);

        if ($this.val()) {
            $this.addClass('has-val');
        }
        else {
            $this.removeClass('has-val');
        }
    });
});
