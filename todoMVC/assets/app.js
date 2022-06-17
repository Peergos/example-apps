const getURLHash = () => document.location.hash.replace(/^#\//, '');

const delegate = (el, selector, event, handler) => {
    el.addEventListener(event, e => {
        if (e.target.matches(selector)) handler(e, el);
    });
}

const insertHTML = (el, markup) => {
	el.insertAdjacentHTML('afterbegin', markup);
}

const emptyElement = el => {
    while (el.hasChildNodes()) {
		el.removeChild(el.lastChild);
	}
}

const TodoStore = class extends EventTarget {
    constructor(localStorageKey) {
        super();
        this.localStorageKey = localStorageKey;
        this.todos = [];
        this._readStorage();
	// GETTER methods
	this.get = id => this.todos.find(todo => todo.id === id);
	this.isAllCompleted = () => this.todos.every(todo => todo.completed);
	this.hasCompleted = () => this.todos.some(todo => todo.completed);
	this.all = filter =>
		(filter === 'active') ? this.todos.filter(todo => !todo.completed) :
		(filter === 'completed') ? this.todos.filter(todo => todo.completed) :
		this.todos;
    }
    _readStorage () {
    	let that = this;
    	fetch('/peergos-api/v0/data/' + this.localStorageKey, { method: 'GET' })
    	.then(function(response) {
      		if (response.status === 200) {
				response.arrayBuffer().then(function(buffer) {
    				let todoList = new TextDecoder().decode(buffer);
			        that.todos = JSON.parse(todoList);
		      		that.dispatchEvent(new CustomEvent('refresh'));
    			});
      		} else {
      			console.log('nothing loaded...');
			    that.todos = JSON.parse('[]');
		      	that.dispatchEvent(new CustomEvent('refresh'));
      		}
		});	
	
    }
    _save () {
        let newTodoFieldSet = document.getElementById('new-todo-fs');
        newTodoFieldSet.disabled = true;
        let todoListFieldSet = document.getElementById('todo-list-fs');
        todoListFieldSet.disabled = true;
        document.getElementById('savingId').style.display = '';
        
		let that = this;		
		var headers = {};
  		let encoder = new TextEncoder();
    	let body = encoder.encode(JSON.stringify(this.todos));
  		fetch('/peergos-api/v0/data/' + this.localStorageKey, { method: 'PUT', headers: headers, body: body })
    	.then(function(response) {
	        newTodoFieldSet.disabled = false;
    	    todoListFieldSet.disabled = false;
            document.getElementById('savingId').style.display = 'none';
      		console.log('save response status:' + response.status);
      		that.dispatchEvent(new CustomEvent('refresh'));
    	}); 
    	
    }
    // MUTATE methods
    add (todo) {
        this.todos.push({ title: todo.title, completed: false, id: "id_" + Date.now() });
        this._save();
    }
    remove ({ id }) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this._save();
    }
    toggle ({ id }) {
        this.todos = this.todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
        this._save();
    }
    clearCompleted () {
        this.todos = this.todos.filter(todo => !todo.completed);
        this._save();
    }
    update (todo) {
        this.todos = this.todos.map(t => t.id === todo.id ? todo : t);
        this._save();
    }
    toggleAll () {
        const completed = !this.hasCompleted() || !this.isAllCompleted();
        this.todos = this.todos.map(todo => ({ ...todo, completed }));
        this._save();
    }
    revert () {
        this._save();
    }
}


const Todos = new TodoStore('peergos-todo.json');

const App = {
	$: {
		input:		document.querySelector('.new-todo'),
		toggleAll:	document.querySelector('.toggle-all'),
		clear:		document.querySelector('.clear-completed'),
		list:		document.querySelector('.todo-list'),
		count:		document.querySelector('.todo-count'),
		setActiveFilter: filter => {
			document.querySelectorAll('.filters a').forEach(el => el.classList.remove('selected')),
			document.querySelector(`.filters [href="#/${filter}"]`).classList.add('selected');
		},
		showMain: show =>
			document.querySelector('.main').style.display = show ? 'block': 'none',
		showClear: show =>
			document.querySelector('.clear-completed').style.display = show ? 'block': 'none',
		showFooter: show =>
			document.querySelector('.footer').style.display = show ? 'block': 'none',
		displayCount: count => {
			emptyElement(App.$.count);
			insertHTML(App.$.count, `
				<strong>${count}</strong>
				${count === 1 ? 'item' : 'items'} left
			`);
		}
	},
	init() {
		Todos.addEventListener('refresh', App.render);
		App.filter = getURLHash();
		window.addEventListener('hashchange', () => {
			App.filter = getURLHash();
			App.render();
		});
		App.$.input.addEventListener('keyup', e => {
			if (e.key === 'Enter' && e.target.value.length) {
				Todos.add({ title: e.target.value, completed: false, id: "id_" + Date.now() })
				App.$.input.value = '';
			}
		});
		App.$.toggleAll.addEventListener('click', e => {
			Todos.toggleAll();
		});
		App.$.clear.addEventListener('click', e => {
			Todos.clearCompleted();
		});
		App.bindTodoEvents();
		App.render();
	},
	todoEvent(event, selector, handler) {
		delegate(App.$.list, selector, event, e => {
			let $el = e.target.closest('[data-id]');
			handler(Todos.get($el.dataset.id), $el, e);
		});
	},
	bindTodoEvents() {
		App.todoEvent('click', '.destroy', todo => Todos.remove(todo));
		App.todoEvent('click', '.toggle', todo => Todos.toggle(todo));
		App.todoEvent('dblclick', 'label', (_, $li) => {
			let newTodoFieldSet = document.getElementById('new-todo-fs');
        	if (newTodoFieldSet.disabled) {
        		return;
        	}
			$li.classList.add('editing');
			$li.querySelector('.edit').focus();
		});
		App.todoEvent('keyup', '.edit', (todo, $li, e) => {
			let $input = $li.querySelector('.edit');
			if (e.key === 'Enter' && $input.value)
				Todos.update({ ...todo, title: $input.value });
			if (e.key === 'Escape') {
				$input.value = todo.title;
				App.render();
			}
		});
		App.todoEvent('blur', '.edit', (todo, $li, e) => {
			const title = $li.querySelector('.edit').value;
			Todos.update({ ...todo, title });
		});
	},
	createTodoItem(todo) {
		const li = document.createElement('li');
		li.dataset.id = todo.id;
		if (todo.completed) { li.classList.add('completed'); }
		insertHTML(li, `
			<div class="view">
				<input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
				<label></label>
				<button class="destroy"></button>
			</div>
			<input class="edit">
		`);
		li.querySelector('label').textContent = todo.title;
		li.querySelector('.edit').value = todo.title;
		return li;
	},
	render() {
		const count = Todos.all().length;
		App.$.setActiveFilter(App.filter);
		emptyElement(App.$.list);
		Todos.all(App.filter).forEach(todo => {
			App.$.list.appendChild( App.createTodoItem(todo) );
		});
		App.$.showMain(count);
		App.$.showFooter(count);
		App.$.showClear(Todos.hasCompleted());
		App.$.toggleAll.checked = Todos.isAllCompleted();
		App.$.displayCount(Todos.all('active').length);
	}
};

App.init();
