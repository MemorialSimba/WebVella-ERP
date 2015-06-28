﻿/* entity-views.module.js */

/**
* @desc this module manages the entity views in the admin screen
*/

(function () {
    'use strict';

    angular
        .module('webvellaAdmin') //only gets the module, already initialized in the base.module of the plugin. The lack of dependency [] makes the difference.
        .config(config)
        .controller('WebVellaAdminEntityViewsController', controller)
	    .controller('CreateViewModalController', createViewModalController);

    // Configuration ///////////////////////////////////
    config.$inject = ['$stateProvider'];

    /* @ngInject */
    function config($stateProvider) {
        $stateProvider.state('webvella-admin-entity-views', {
            parent: 'webvella-admin-base',
            url: '/entities/:entityName/views', //  /desktop/areas after the parent state is prepended
            views: {
                "topnavView": {
                    controller: 'WebVellaAdminTopnavController',
                    templateUrl: '/plugins/webvella-admin/topnav.view.html',
                    controllerAs: 'topnavData'
                },
                "sidebarView": {
                    controller: 'WebVellaAdminSidebarController',
                    templateUrl: '/plugins/webvella-admin/sidebar.view.html',
                    controllerAs: 'sidebarData'
                },
                "contentView": {
                    controller: 'WebVellaAdminEntityViewsController',
                    templateUrl: '/plugins/webvella-admin/entity-views.view.html',
                    controllerAs: 'contentData'
                }
            },
            resolve: {
                resolvedCurrentEntityMeta: resolveCurrentEntityMeta
            },
            data: {

            }
        });
    };


    // Resolve Function /////////////////////////
    resolveCurrentEntityMeta.$inject = ['$q', '$log', 'webvellaAdminService', '$stateParams', '$state', '$timeout'];
    /* @ngInject */
    function resolveCurrentEntityMeta($q, $log, webvellaAdminService, $stateParams, $state, $timeout) {
        $log.debug('webvellaAdmin>entity-details> BEGIN state.resolved');
        // Initialize
        var defer = $q.defer();

        // Process
        function successCallback(response) {
            if (response.object == null) {
                $timeout(function () {
                    $state.go("webvella-root-not-found");
                }, 0);
            }
            else {
                defer.resolve(response.object);
            }
        }

        function errorCallback(response) {
            if (response.object == null) {
                $timeout(function () {
                    $state.go("webvella-root-not-found");
                }, 0);
            }
            else {
                defer.resolve(response.object);
            }
        }

        webvellaAdminService.getEntityMeta($stateParams.entityName, successCallback, errorCallback);

        // Return
        $log.debug('webvellaAdmin>entity-details> END state.resolved');
        return defer.promise;
    }
 
    // Controller ///////////////////////////////
    controller.$inject = ['$scope', '$log', '$rootScope', '$state', 'pageTitle', 'resolvedCurrentEntityMeta', '$modal'];

    /* @ngInject */
    function controller($scope, $log, $rootScope, $state, pageTitle, resolvedCurrentEntityMeta, $modal) {
        $log.debug('webvellaAdmin>entity-details> START controller.exec');
        /* jshint validthis:true */
        var contentData = this;
        contentData.entity = angular.copy(resolvedCurrentEntityMeta);
        contentData.views = angular.copy(resolvedCurrentEntityMeta.recordViews);
        if (contentData.views == null) {
        	contentData.views = [];
        }
        //Update page title
        contentData.pageTitle = "Entity Views | " + pageTitle;
        $rootScope.$emit("application-pageTitle-update", contentData.pageTitle);
        //Hide Sidemenu
        $rootScope.$emit("application-body-sidebar-menu-isVisible-update", false);
        $log.debug('rootScope>events> "application-body-sidebar-menu-isVisible-update" emitted');
        $scope.$on("$destroy", function () {
            $rootScope.$emit("application-body-sidebar-menu-isVisible-update", true);
            $log.debug('rootScope>events> "application-body-sidebar-menu-isVisible-update" emitted');
        });

    	//Create new view modal
        contentData.createView = function () {

        	var modalInstance = $modal.open({
        		animation: false,
        		templateUrl: 'createViewModal.html',
        		controller: 'CreateViewModalController',
        		controllerAs: "popupData",
        		size: "",
        		resolve: {
        			contentData: function () {
        				return contentData;
        			}
        		}
        	});

        }


        $log.debug('webvellaAdmin>entity-details> END controller.exec');
    }


	//// Modal Controllers
    createViewModalController.$inject = ['$modalInstance', '$log', 'ngToast', '$timeout', '$state', '$location', 'contentData', 'webvellaAdminService', 'webvellaRootService'];

	/* @ngInject */
    function createViewModalController($modalInstance, $log, ngToast, $timeout, $state, $location, contentData, webvellaAdminService, webvellaRootService) {
    	$log.debug('webvellaAdmin>entities>createViewModalController> START controller.exec');
    	/* jshint validthis:true */
    	var popupData = this;
    	popupData.modalInstance = $modalInstance;
    	popupData.view = webvellaAdminService.initView();
    	popupData.currentEntity = angular.copy(contentData.entity);

    	popupData.ok = function () {
    		webvellaAdminService.createEntityView(popupData.view, popupData.currentEntity.name, successCallback, errorCallback);
    	};

    	popupData.cancel = function () {
    		$modalInstance.dismiss('cancel');
    	};

    	/// Aux
    	function successCallback(response) {
    		ngToast.create({
    			className: 'success',
    			content: '<h4>Success</h4><p>The view was successfully saved</p>'
    		});
    		$modalInstance.close('success');
    		$timeout(function () { 
    			webvellaRootService.reloadCurrentState($state, {});
    		}, 0);
    	}

    	function errorCallback(response) {
    		var location = $location;
    		//Process the response and generate the validation Messages
    		webvellaRootService.generateValidationMessages(response, popupData, popupData.entity, location);
    	}

    	$log.debug('webvellaAdmin>entities>createViewModalController> END controller.exec');
    };




})();


