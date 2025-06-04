// Variáveis globais
let tasks = [];
let selectedTask = null;
const API_BASE = '/api';

// Inicializacao
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    loadTasks();
    setInterval(loadTasks, 5000); // Atualiza a cada 5 segundos
    updateParametersForm(); // Inicializa o formulario de parametros
});

// Carregar tarefas
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/task`);
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

// Renderizar lista de tarefas
function renderTasks() {
    const container = document.getElementById('tasks-container');
    const emptyState = document.getElementById('empty-state');
    
    if (tasks.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    container.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${task.nome}</h3>
                    <p class="task-type">${task.tipo.replace('_', ' ')}</p>
                </div>
                <div class="status-container">
                    ${getStatusIcon(task.status)}
                    <span class="status-badge status-${task.status}">${task.status}</span>
                </div>
            </div>
            
            <div class="task-info">
                <div class="task-datetime">
                    <i data-lucide="calendar" class="icon"></i>
                    ${new Date(task.horario_execucao).toLocaleString('pt-BR')}
                </div>
                
                ${task.log_execucao ? `
                    <div class="task-log">
                        ${task.log_execucao}
                    </div>
                ` : ''}
            </div>
            
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${task.id})">
                    Editar
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    <i data-lucide="trash-2" class="icon"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Obter icone do status
function getStatusIcon(status) {
    const icons = {
        'pendente': '<i data-lucide="clock" class="icon" style="color: #eab308;"></i>',
        'executando': '<i data-lucide="play" class="icon" style="color: #3b82f6;"></i>',
        'concluida': '<i data-lucide="check-circle" class="icon" style="color: #10b981;"></i>',
        'erro': '<i data-lucide="x-circle" class="icon" style="color: #ef4444;"></i>'
    };
    return icons[status] || '<i data-lucide="alert-circle" class="icon" style="color: #6b7280;"></i>';
}

// Mostrar formulario de nova tarefa
function showNewTaskForm() {
    selectedTask = null;
    document.getElementById('modal-title').textContent = 'Nova Tarefa';
    document.getElementById('submit-btn').textContent = 'Criar Tarefa';
    clearForm();
    document.getElementById('task-modal').classList.remove('hidden');
}

// Editar tarefa
function editTask(taskId) {
    selectedTask = tasks.find(task => task.id === taskId);
    if (!selectedTask) return;
    
    document.getElementById('modal-title').textContent = 'Editar Tarefa';
    document.getElementById('submit-btn').textContent = 'Atualizar Tarefa';
    
    // Preencher formulario
    document.getElementById('task-name').value = selectedTask.nome;
    document.getElementById('task-type').value = selectedTask.tipo;
    document.getElementById('task-datetime').value = new Date(selectedTask.horario_execucao).toISOString().slice(0, 16);
    
    updateParametersForm();
    fillParameters(selectedTask.parametros);
    
    document.getElementById('task-modal').classList.remove('hidden');
}

// Deletar tarefa
async function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/task/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
    }
}

// Fechar modal
function closeModal() {
    document.getElementById('task-modal').classList.add('hidden');
    selectedTask = null;
    clearForm();
}

// Limpar formulario
function clearForm() {
    document.getElementById('task-form').reset();
    updateParametersForm();
}

// Atualizar formulario de parametros
function updateParametersForm() {
    const taskType = document.getElementById('task-type').value;
    const container = document.getElementById('parameters-container');
    
    let html = '';
    
    switch (taskType) {
        case 'macro_excel':
            html = `
                <div class="form-group">
                    <label class="form-label">Caminho do Arquivo Excel</label>
                    <input type="text" id="param-arquivo_excel" class="form-input" placeholder="C:\\caminho\\para\\arquivo.xlsx">
                </div>
                <div class="form-group">
                    <label class="form-label">Nome da Macro</label>
                    <input type="text" id="param-macro_name" class="form-input" placeholder="NomeDaMacro">
                </div>
            `;
            break;
            
        case 'enviar_email':
            html = `
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Email Remetente</label>
                        <input type="email" id="param-username" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Senha</label>
                        <input type="password" id="param-password" class="form-input">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Para (Email)</label>
                    <input type="email" id="param-to_email" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Assunto</label>
                    <input type="text" id="param-subject" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Mensagem</label>
                    <textarea id="param-body" class="form-textarea" rows="4"></textarea>
                </div>
            `;
            break;
            
        case 'script_python':
            html = `
                <div class="form-group">
                    <label class="form-label">Caminho do Script</label>
                    <input type="text" id="param-script_path" class="form-input" placeholder="/caminho/para/script.py">
                </div>
            `;
            break;
            
        case 'comando_sistema':
            html = `
                <div class="form-group">
                    <label class="form-label">Comando</label>
                    <input type="text" id="param-command" class="form-input" placeholder="ls -la">
                </div>
            `;
            break;
    }
    
    container.innerHTML = html;
}

// Preencher parametros no formulario
function fillParameters(params) {
    for (const [key, value] of Object.entries(params)) {
        const element = document.getElementById(`param-${key}`);
        if (element) {
            element.value = value;
        }
    }
}

// Coletar parametros do formulario
function collectParameters() {
    const params = {};
    const paramElements = document.querySelectorAll('[id^="param-"]');
    
    paramElements.forEach(element => {
        const key = element.id.replace('param-', '');
        if (element.value) {
            params[key] = element.value;
        }
    });
    
    return params;
}

// Submeter formulario
document.getElementById('task-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('task-name').value,
        tipo: document.getElementById('task-type').value,
        horario_execucao: document.getElementById('task-datetime').value,
        parametros: collectParameters()
    };
    
    try {
        const url = selectedTask 
            ? `${API_BASE}/task/${selectedTask.id}`
            : `${API_BASE}/task`;
        
        const method = selectedTask ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            closeModal();
            loadTasks();
        }
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
    }
});

// Fechar modal ao clicar fora
document.getElementById('task-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});