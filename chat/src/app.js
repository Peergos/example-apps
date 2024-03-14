
var App  			= require('./components/App.vue');
var Confirm         = require('./components/confirm');
var Spinner         = require('./components/spinner');
Vue.component('spinner', Vue.extend(Spinner));
Vue.component('confirm', Vue.extend(Confirm));
Vue.component('App', Vue.extend(App));

Vue.config.productionTip = false;

const ToastOptions = {
	hideProgressBar: true,
	maxToasts: 3,
	showCloseButtonOnHover: true,
	position: 'bottom-right'
};

Vue.use( VueToastification.default, ToastOptions);

// Initializing Vue after GWT has finished
setTimeout(function() {
    var vueRoot = new Vue({
		el: '#app',
        data: {
            currentView: 'App',
        },
        render: function() {
            with(this){return _c('div',{staticClass:"fillspace",attrs:{"id":"app"}},[_c(currentView,{tag:"component"})],1)}
        }
    });
}, 500);
