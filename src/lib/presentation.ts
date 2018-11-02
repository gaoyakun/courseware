import $ from 'jquery';

const animEndEventNames: any = {
	'WebkitAnimation': 'webkitAnimationEnd',
	'OAnimation': 'oAnimationEnd',
	'msAnimation': 'MSAnimationEnd',
	'animation': 'animationend'
};
const animEndEventName = animEndEventNames['animation'];//(animEndEventNames as any)[ (Modernizr as any).prefixed( 'animation' ) ]
const navForwardAnimation = 48;
const navBackwardAnimation = 49;

export class CousewareFramework {
	pageList: any;
	endCurrentPage: boolean;
	endNextPage: boolean;
	outClass: string;
	inClass: string;
	navHistory: Array<any>;

	constructor() {
		this.pageList = null;
		this.endCurrentPage = false;
		this.endNextPage = false;
		this.outClass = '';
		this.inClass = '';
		this.navHistory = [];
	}

	setup(activePage: any): void {
		let that = this;
		that.pageList = $(".presentation-page");
		that.pageList.each(function () {
			var page: any = $(this);
			page.data('originalClassList', page.attr('class'));
		});
		$('#page-back').on('click', function () {
			that.back();
		});
		$('.page-nav').on('click', function () {
			that.navigateTo($('#' + $(this).attr('target')));
		});
		if (activePage) {
			$('#page-title').html(activePage.attr('page-title'));
			activePage.addClass('page-active');
			let eventPageIn: any = new Event('pageIn');
			eventPageIn['id'] = activePage.attr('id');
			window.dispatchEvent(eventPageIn);
		}
	}

	navigateTo(page: any): void {
		var currentPage = $(".page-active").eq(0);
		if (this.setActivePage(currentPage, page, navForwardAnimation)) {
			this.navHistory.push(currentPage);
			$('#page-back').css('visibility', 'visible');
		}
	}

	back(): void {
		if (this.navHistory.length > 0) {
			let lastPage = this.navHistory.pop();
			let currentPage = $(".page-active").eq(0);
			this.setActivePage(currentPage, lastPage, navBackwardAnimation);
		}
		if (this.navHistory.length == 0) {
			$('#page-back').css('visibility', 'hidden');
		}
	}

	setActivePage(currentPage: any, nextPage: any, animationType: number): boolean {
		nextPage.addClass('page-active');
		if (currentPage && currentPage.attr('id') != nextPage.attr('id')) {
			this.getAnimationClass(animationType);

			currentPage.addClass(this.outClass).on(animEndEventName, () => {
				currentPage.off(animEndEventName);
				this.endCurrentPage = true;
				if (this.endNextPage) {
					this.onEndAnimation(currentPage, nextPage);
				}
			});
			nextPage.addClass(this.inClass).on(animEndEventName, () => {
				nextPage.off(animEndEventName);
				this.endNextPage = true;
				if (this.endCurrentPage) {
					this.onEndAnimation(currentPage, nextPage);
				}
			});

			$('#page-title').html(nextPage.attr('page-title'));
			return true;
		}
		return false;
	}

	onEndAnimation(outPage: any, inPage: any): void {
		this.endCurrentPage = false;
		this.endNextPage = false;
		outPage.attr('class', outPage.data('originalClassList'));
		inPage.attr('class', inPage.data('originalClassList') + ' page-active');

		var eventPageOut: any = new Event('pageOut');
		eventPageOut['id'] = outPage.attr('id');
		window.dispatchEvent(eventPageOut);
		var eventPageIn: any = new Event('pageIn');
		eventPageIn['id'] = inPage.attr('id');
		window.dispatchEvent(eventPageIn);
	}

	getAnimationClass(animationType: number): void {
		switch (animationType) {
			case 1:
				this.outClass = 'pt-page-moveToLeft';
				this.inClass = 'pt-page-moveFromRight';
				break;
			case 2:
				this.outClass = 'pt-page-moveToRight';
				this.inClass = 'pt-page-moveFromLeft';
				break;
			case 3:
				this.outClass = 'pt-page-moveToTop';
				this.inClass = 'pt-page-moveFromBottom';
				break;
			case 4:
				this.outClass = 'pt-page-moveToBottom';
				this.inClass = 'pt-page-moveFromTop';
				break;
			case 5:
				this.outClass = 'pt-page-fade';
				this.inClass = 'pt-page-moveFromRight pt-page-ontop';
				break;
			case 6:
				this.outClass = 'pt-page-fade';
				this.inClass = 'pt-page-moveFromLeft pt-page-ontop';
				break;
			case 7:
				this.outClass = 'pt-page-fade';
				this.inClass = 'pt-page-moveFromBottom pt-page-ontop';
				break;
			case 8:
				this.outClass = 'pt-page-fade';
				this.inClass = 'pt-page-moveFromTop pt-page-ontop';
				break;
			case 9:
				this.outClass = 'pt-page-moveToLeftFade';
				this.inClass = 'pt-page-moveFromRightFade';
				break;
			case 10:
				this.outClass = 'pt-page-moveToRightFade';
				this.inClass = 'pt-page-moveFromLeftFade';
				break;
			case 11:
				this.outClass = 'pt-page-moveToTopFade';
				this.inClass = 'pt-page-moveFromBottomFade';
				break;
			case 12:
				this.outClass = 'pt-page-moveToBottomFade';
				this.inClass = 'pt-page-moveFromTopFade';
				break;
			case 13:
				this.outClass = 'pt-page-moveToLeftEasing pt-page-ontop';
				this.inClass = 'pt-page-moveFromRight';
				break;
			case 14:
				this.outClass = 'pt-page-moveToRightEasing pt-page-ontop';
				this.inClass = 'pt-page-moveFromLeft';
				break;
			case 15:
				this.outClass = 'pt-page-moveToTopEasing pt-page-ontop';
				this.inClass = 'pt-page-moveFromBottom';
				break;
			case 16:
				this.outClass = 'pt-page-moveToBottomEasing pt-page-ontop';
				this.inClass = 'pt-page-moveFromTop';
				break;
			case 17:
				this.outClass = 'pt-page-scaleDown';
				this.inClass = 'pt-page-moveFromRight pt-page-ontop';
				break;
			case 18:
				this.outClass = 'pt-page-scaleDown';
				this.inClass = 'pt-page-moveFromLeft pt-page-ontop';
				break;
			case 19:
				this.outClass = 'pt-page-scaleDown';
				this.inClass = 'pt-page-moveFromBottom pt-page-ontop';
				break;
			case 20:
				this.outClass = 'pt-page-scaleDown';
				this.inClass = 'pt-page-moveFromTop pt-page-ontop';
				break;
			case 21:
				this.outClass = 'pt-page-scaleDown';
				this.inClass = 'pt-page-scaleUpDown pt-page-delay300';
				break;
			case 22:
				this.outClass = 'pt-page-scaleDownUp';
				this.inClass = 'pt-page-scaleUp pt-page-delay300';
				break;
			case 23:
				this.outClass = 'pt-page-moveToLeft pt-page-ontop';
				this.inClass = 'pt-page-scaleUp';
				break;
			case 24:
				this.outClass = 'pt-page-moveToRight pt-page-ontop';
				this.inClass = 'pt-page-scaleUp';
				break;
			case 25:
				this.outClass = 'pt-page-moveToTop pt-page-ontop';
				this.inClass = 'pt-page-scaleUp';
				break;
			case 26:
				this.outClass = 'pt-page-moveToBottom pt-page-ontop';
				this.inClass = 'pt-page-scaleUp';
				break;
			case 27:
				this.outClass = 'pt-page-scaleDownCenter';
				this.inClass = 'pt-page-scaleUpCenter pt-page-delay400';
				break;
			case 28:
				this.outClass = 'pt-page-rotateRightSideFirst';
				this.inClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
				break;
			case 29:
				this.outClass = 'pt-page-rotateLeftSideFirst';
				this.inClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
				break;
			case 30:
				this.outClass = 'pt-page-rotateTopSideFirst';
				this.inClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
				break;
			case 31:
				this.outClass = 'pt-page-rotateBottomSideFirst';
				this.inClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
				break;
			case 32:
				this.outClass = 'pt-page-flipOutRight';
				this.inClass = 'pt-page-flipInLeft pt-page-delay500';
				break;
			case 33:
				this.outClass = 'pt-page-flipOutLeft';
				this.inClass = 'pt-page-flipInRight pt-page-delay500';
				break;
			case 34:
				this.outClass = 'pt-page-flipOutTop';
				this.inClass = 'pt-page-flipInBottom pt-page-delay500';
				break;
			case 35:
				this.outClass = 'pt-page-flipOutBottom';
				this.inClass = 'pt-page-flipInTop pt-page-delay500';
				break;
			case 36:
				this.outClass = 'pt-page-rotateFall pt-page-ontop';
				this.inClass = 'pt-page-scaleUp';
				break;
			case 37:
				this.outClass = 'pt-page-rotateOutNewspaper';
				this.inClass = 'pt-page-rotateInNewspaper pt-page-delay500';
				break;
			case 38:
				this.outClass = 'pt-page-rotatePushLeft';
				this.inClass = 'pt-page-moveFromRight';
				break;
			case 39:
				this.outClass = 'pt-page-rotatePushRight';
				this.inClass = 'pt-page-moveFromLeft';
				break;
			case 40:
				this.outClass = 'pt-page-rotatePushTop';
				this.inClass = 'pt-page-moveFromBottom';
				break;
			case 41:
				this.outClass = 'pt-page-rotatePushBottom';
				this.inClass = 'pt-page-moveFromTop';
				break;
			case 42:
				this.outClass = 'pt-page-rotatePushLeft';
				this.inClass = 'pt-page-rotatePullRight pt-page-delay180';
				break;
			case 43:
				this.outClass = 'pt-page-rotatePushRight';
				this.inClass = 'pt-page-rotatePullLeft pt-page-delay180';
				break;
			case 44:
				this.outClass = 'pt-page-rotatePushTop';
				this.inClass = 'pt-page-rotatePullBottom pt-page-delay180';
				break;
			case 45:
				this.outClass = 'pt-page-rotatePushBottom';
				this.inClass = 'pt-page-rotatePullTop pt-page-delay180';
				break;
			case 46:
				this.outClass = 'pt-page-rotateFoldLeft';
				this.inClass = 'pt-page-moveFromRightFade';
				break;
			case 47:
				this.outClass = 'pt-page-rotateFoldRight';
				this.inClass = 'pt-page-moveFromLeftFade';
				break;
			case 48:
				this.outClass = 'pt-page-rotateFoldTop';
				this.inClass = 'pt-page-moveFromBottomFade';
				break;
			case 49:
				this.outClass = 'pt-page-rotateFoldBottom';
				this.inClass = 'pt-page-moveFromTopFade';
				break;
			case 50:
				this.outClass = 'pt-page-moveToRightFade';
				this.inClass = 'pt-page-rotateUnfoldLeft';
				break;
			case 51:
				this.outClass = 'pt-page-moveToLeftFade';
				this.inClass = 'pt-page-rotateUnfoldRight';
				break;
			case 52:
				this.outClass = 'pt-page-moveToBottomFade';
				this.inClass = 'pt-page-rotateUnfoldTop';
				break;
			case 53:
				this.outClass = 'pt-page-moveToTopFade';
				this.inClass = 'pt-page-rotateUnfoldBottom';
				break;
			case 54:
				this.outClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
				this.inClass = 'pt-page-rotateRoomLeftIn';
				break;
			case 55:
				this.outClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
				this.inClass = 'pt-page-rotateRoomRightIn';
				break;
			case 56:
				this.outClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
				this.inClass = 'pt-page-rotateRoomTopIn';
				break;
			case 57:
				this.outClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
				this.inClass = 'pt-page-rotateRoomBottomIn';
				break;
			case 58:
				this.outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCubeLeftIn';
				break;
			case 59:
				this.outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCubeRightIn';
				break;
			case 60:
				this.outClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCubeTopIn';
				break;
			case 61:
				this.outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCubeBottomIn';
				break;
			case 62:
				this.outClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCarouselLeftIn';
				break;
			case 63:
				this.outClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCarouselRightIn';
				break;
			case 64:
				this.outClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCarouselTopIn';
				break;
			case 65:
				this.outClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
				this.inClass = 'pt-page-rotateCarouselBottomIn';
				break;
			case 66:
				this.outClass = 'pt-page-rotateSidesOut';
				this.inClass = 'pt-page-rotateSidesIn pt-page-delay200';
				break;
			case 67:
				this.outClass = 'pt-page-rotateSlideOut';
				this.inClass = 'pt-page-rotateSlideIn';
				break;
		}
	}
}
