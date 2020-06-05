let app = angular.module('app', ['ngRoute']);

app.factory('galleryFactory', function ($http) {
	let gallery = [];
	let likes = [];
	return {
		getData: function () {
			return $http({
				method: 'GET',
				url: 'https://api.unsplash.com/photos/?client_id=nrdAH9Xc2ahyiZ1MvtuvStxgaZ6H6HlreaeRBeteikk&per_page=24',
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
					'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
				},
			})
		},
		gallery: gallery,
		likesGallery: likes
	}
});

app.controller('galleryCtrl', function ($scope, $http, galleryFactory) {
	$scope.galleryFactory = galleryFactory.getData();
	$scope.gallery = galleryFactory.gallery
	$scope.galleryFactory.then(function (response) {
		for (let i = 0; i < response.data.length; i++) {
			let singleData = {
				id: response.data[i].id,
				photoSm: response.data[i].urls.thumb,
				photoMd: response.data[i].urls.small,
			}
			$scope.gallery.push(singleData)
		}
	})
	$scope.currentPage = 0;
	$scope.pageSize = 4;
	$scope.modalShown = false;
	$scope.toggleModal = function (params) {
		$scope.modalShown = !$scope.modalShown;
		$scope.itemData = params
	};
});

app.filter('startFrom', function () {
	return function (input, start) {
		start = +start;
		return input.slice(start);
	}
});

app.directive('modal', function () {
	return {
		restrict: 'EA',
		scope: {
			show: '='
		},
		replace: true,
		transclude: true,
		link: function (scope, element, attrs) {

			scope.dialogStyle = {};
			if (attrs.width)
				scope.dialogStyle.width = attrs.width;
			if (attrs.height)
				scope.dialogStyle.height = attrs.height;
			scope.hideModal = function () {
				scope.show = false;
			};
		},
		template: "<div class='ng-modal' ng-show='show'> <div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
	};
});

app.controller('photoDetailCtrl', function ($scope, $routeParams, galleryFactory) {
	$scope.photoId = $routeParams.photoId;
	$scope.photoSrc;
	for (let i = 0; i < galleryFactory.gallery.length; i++) {
		if (galleryFactory.gallery[i].id === $scope.photoId) {
			return $scope.photoSrc = galleryFactory.gallery[i].photoMd
		}
	}
});

app.controller('favorite', function ($scope, galleryFactory) {
	$scope.like = function (id) {
		$scope.getLocalStorageData = localStorage.getItem('Likes');
		$scope.itemId = id;
		$scope.likesArr = [];
		$scope.storageData = JSON.parse(localStorage.getItem('Likes'));
		galleryFactory.gallery.forEach(function (item) {
			if (item.id === $scope.itemId) {
				$scope.photoData = item;
			}
		});

		var parsedData = JSON.parse($scope.getLocalStorageData);
		if (parsedData && parsedData.length) {
			$scope.likesArr = addToArr(parsedData, $scope.photoData);
			localStorage.setItem('Likes', JSON.stringify($scope.likesArr))
		} else {
			$scope.likesArr.push($scope.photoData);
			localStorage.setItem('Likes', JSON.stringify($scope.likesArr));
		}

	};
	$scope.$watchCollection('likesArr.length', function () {
		$scope.storageData = JSON.parse(localStorage.getItem('Likes'));

	})

});



function addToArr(arr, obj) {
	var length = arr.length;
	var id = length + 1;
	var found = arr.some(function (el) {
		return el.id === obj.id
	});
	if (!found) arr.push(obj);
	return arr;
}


app.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'home.html',
		})
		.when('/photo/:photoId', {
			templateUrl: 'photo.html',
			controller: 'photoDetailCtrl',
		})


	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});

});



