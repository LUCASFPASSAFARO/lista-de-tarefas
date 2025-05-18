document.addEventListener('DOMContentLoaded', function() {
    
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let tasks = [];
    let currentFilter = 'all';
    
    
    loadTasks();
    
   
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
    
    
    async function loadTasks() {
        try {
            
            const response = await fetch('/api/tasks');
            
            if (response.ok) {
                tasks = await response.json();
                renderTasks();
            } else {
                console.error('Erro ao carregar tarefas');
                
                
                const storedTasks = localStorage.getItem('tasks');
                if (storedTasks) {
                    tasks = JSON.parse(storedTasks);
                    renderTasks();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            
           
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) {
                tasks = JSON.parse(storedTasks);
                renderTasks();
            }
        }
    }
    
    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        try {
            
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });
            
            if (response.ok) {
              
                tasks.push(newTask);
                taskInput.value = '';
                renderTasks();
            } else {
                console.error('Erro ao adicionar tarefa no servidor');
                
                
                tasks.push(newTask);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                taskInput.value = '';
                renderTasks();
            }
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            
            
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskInput.value = '';
            renderTasks();
        }
    }
    
    async function toggleTaskStatus(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return;
        
        const updatedTask = {
            ...tasks[taskIndex],
            completed: !tasks[taskIndex].completed
        };
        
        try {
            
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTask)
            });
            
            if (response.ok) {
               
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                renderTasks();
            } else {
                console.error('Erro ao atualizar tarefa no servidor');
                
               
                tasks[taskIndex].completed = !tasks[taskIndex].completed;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            }
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            
            
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    }
    
    async function deleteTask(id) {
        try {
            
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
               
                tasks = tasks.filter(task => task.id !== id);
                renderTasks();
            } else {
                console.error('Erro ao excluir tarefa do servidor');
                
                
                tasks = tasks.filter(task => task.id !== id);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            }
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            
            
            tasks = tasks.filter(task => task.id !== id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    }
    
    async function clearCompleted() {
        const completedTaskIds = tasks
            .filter(task => task.completed)
            .map(task => task.id);
            
        try {
            
            const response = await fetch('/api/tasks/clear-completed', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: completedTaskIds })
            });
            
            if (response.ok) {
               
                tasks = tasks.filter(task => !task.completed);
                renderTasks();
            } else {
                console.error('Erro ao limpar tarefas concluídas no servidor');
                
                
                tasks = tasks.filter(task => !task.completed);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            }
        } catch (error) {
            console.error('Erro ao limpar tarefas concluídas:', error);
            
           
            tasks = tasks.filter(task => !task.completed);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    }
    
    function renderTasks() {
        
        let filteredTasks = tasks;
        
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
       
        taskList.innerHTML = '';
        
       
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '&times;';
            deleteButton.addEventListener('click', () => deleteTask(task.id));
            
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteButton);
            
            taskList.appendChild(li);
        });
        
       
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} tarefa${activeTasks !== 1 ? 's' : ''} restante${activeTasks !== 1 ? 's' : ''}`;
        
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});