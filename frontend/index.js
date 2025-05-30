import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Trash2, Plus, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const TaskScheduler = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'macro_excel',
    horario_execucao: '',
    parametros: {}
  });
  
  const API_BASE = 'http://localhost:8000';
  
  // Carregar tarefas
  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tarefas`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };
  
  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);
  
  // Criar/atualizar tarefa
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedTask 
        ? `${API_BASE}/tarefas/${selectedTask.id}`
        : `${API_BASE}/tarefas`;
      
      const method = selectedTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowForm(false);
        setSelectedTask(null);
        setFormData({ nome: '', tipo: 'macro_excel', horario_execucao: '', parametros: {} });
        loadTasks();
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };
  
  // Deletar tarefa
  const deleteTask = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        const response = await fetch(`${API_BASE}/tarefas/${id}`, { method: 'DELETE' });
        if (response.ok) {
          loadTasks();
        }
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
      }
    }
  };
  
  // Editar tarefa
  const editTask = (task) => {
    setSelectedTask(task);
    setFormData({
      nome: task.nome,
      tipo: task.tipo,
      horario_execucao: new Date(task.horario_execucao).toISOString().slice(0, 16),
      parametros: task.parametros
    });
    setShowForm(true);
  };
  
  // Renderizar parâmetros baseado no tipo
  const renderParametersForm = () => {
    switch (formData.tipo) {
      case 'macro_excel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caminho do Arquivo Excel
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="C:\\caminho\\para\\arquivo.xlsx"
                value={formData.parametros.arquivo_excel || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  parametros: { ...formData.parametros, arquivo_excel: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Macro
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="NomeDaMacro"
                value={formData.parametros.macro_name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  parametros: { ...formData.parametros, macro_name: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case 'enviar_email':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Remetente
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.parametros.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parametros: { ...formData.parametros, username: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.parametros.password || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parametros: { ...formData.parametros, password: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Para (Email)
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.parametros.to_email || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  parametros: { ...formData.parametros, to_email: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.parametros.subject || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  parametros: { ...formData.parametros, subject: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={formData.parametros.body || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  parametros: { ...formData.parametros, body: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case 'script_python':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caminho do Script
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="/caminho/para/script.py"
                value={formData.parametros.script_path || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  parametros: { ...formData.parametros, script_path: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case 'comando_sistema':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comando
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ls -la"
              value={formData.parametros.command || ''}
              onChange={(e) => setFormData({
                ...formData,
                parametros: { ...formData.parametros, command: e.target.value }
              })}
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'executando':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'concluida':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'executando':
        return 'bg-blue-100 text-blue-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'erro':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agendador de Tarefas</h1>
              <p className="text-gray-600 mt-1">Gerencie e agende suas tarefas automatizadas</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{task.nome}</h3>
                  <p className="text-sm text-gray-600 capitalize">{task.tipo.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.horario_execucao).toLocaleString('pt-BR')}
                </div>
                
                {task.log_execucao && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-700">{task.log_execucao}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => editTask(task)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa agendada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira tarefa automatizada</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Criar primeira tarefa
            </button>
          </div>
        )}

        {/* Modal do Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Tarefa
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Tarefa
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value, parametros: {} })}
                  >
                    <option value="macro_excel">Macro do Excel</option>
                    <option value="enviar_email">Enviar Email</option>
                    <option value="script_python">Script Python</option>
                    <option value="comando_sistema">Comando do Sistema</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora de Execução
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.horario_execucao}
                    onChange={(e) => setFormData({ ...formData, horario_execucao: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Parâmetros da Tarefa
                  </label>
                  {renderParametersForm()}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedTask(null);
                      setFormData({ nome: '', tipo: 'macro_excel', horario_execucao: '', parametros: {} });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    {selectedTask ? 'Atualizar' : 'Criar'} Tarefa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskScheduler;