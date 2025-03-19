// src/services/clientesService.ts (ampliado)

import axios from 'axios';
import { Client, ClientAction, Strategy, Risk, Instrument } from '../types/Client';
import { API_BASE_URL } from '../config/constants';

// Configuración de interceptores para depuración
axios.interceptors.request.use(request => {
  console.log('Haciendo petición a:', request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Respuesta recibida:', response.status, response.data);
    return response;
  },
  error => {
    console.error(
      'Error en la petición:',
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Interfaces para la respuesta del backend de clientes
interface BackendClient {
  CodComitente: string;
  Actividad: string;
  Descripcion: string;
  EMail: string;
  CUIT: string;
  Oficial: string;
  Referente: string;
  EstaAnulado: string;
  actions?: BackendClientAction[];
  risks?: BackendRisk[];
}

interface BackendClientAction {
  id: number | string;
  client_number: string;
  action_date: string | null;
  description: string | null;
  next_contact: string | null;
  user_id?: string;
}

interface BackendRisk {
  id: string;
  name: string;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
}

// Mapeo: transformar un cliente del backend al formato del front
function mapBackendClientToFrontend(client: BackendClient): Client {
  // Mapeo de acciones
  const mappedActions: ClientAction[] = (client.actions || []).map(a => ({
    id: a.id,
    client_id: a.client_number,
    action_date: a.action_date,
    description: a.description,
    next_contact: a.next_contact,
    user_id: a.user_id || ''
  }));

  // Calcular fecha de vencimiento basado en la próxima acción pendiente
  let fechaVencimiento = null;
  if (mappedActions.length > 0) {
    const sortedActions = [...mappedActions].sort((a, b) => {
      if (!a.next_contact) return 1;
      if (!b.next_contact) return -1;
      return new Date(a.next_contact).getTime() - new Date(b.next_contact).getTime();
    });
    
    if (sortedActions[0].next_contact) {
      fechaVencimiento = sortedActions[0].next_contact;
    }
  }

  // Mapeo de riesgos
  const mappedRisks = (client.risks || []).map(r => ({
    id: r.id,
    name: r.name
  }));

  return {
    id: client.CodComitente,
    numcomitente: client.CodComitente,
    nombre: client.Descripcion,
    sector: client.Actividad,
    mail: client.EMail,
    cuit: client.CUIT,
    oficial: client.Oficial,
    referente: client.Referente,
    activo: client.EstaAnulado === "0",
    actions: mappedActions,
    risks: mappedRisks,
    fechaVencimiento: fechaVencimiento
  };
}

export const clientesService = {
  // Obtener clientes con paginación, filtrado y ordenamiento
  async getClients(
    page = 1,
    statusFilter: 'todos' | 'activos' | 'inactivos' = 'todos',
    riskFilter: string | null = null,
    sortField: string | null = null,
    sortDirection: 'ascending' | 'descending' | null = null
  ): Promise<{
    data: Client[];
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
    };
  }> {
    try {
      // Construir la URL del endpoint con los parámetros de consulta
      let url = `${API_BASE_URL}/clients?page=${page}&status=${statusFilter}`;
  
      if (riskFilter) {
        url += `&risk_id=${riskFilter}`;
      }
  
      if (sortField && sortDirection) {
        const direction = sortDirection === 'ascending' ? 'asc' : 'desc';
        url += `&sort_by=${sortField}&sort_dir=${direction}`;
      }
  
      const response = await axios.get<PaginatedResponse<BackendClient>>(url);
  
      // Mapear clientes y mantener la información de paginación
      const clients = response.data.data.map(mapBackendClientToFrontend);
      const pagination = {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total
      };
  
      return {
        data: clients,
        pagination
      };
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          lastPage: 1,
          total: 0
        }
      };
    }
  },

  // Buscar clientes (similar a searchProspectos)
  async searchClients(
    searchTerm: string,
    page = 1,
    statusFilter: 'todos' | 'activos' | 'inactivos' = 'todos',
    riskFilter: string | null = null,
    sortField: string | null = null,
    sortDirection: 'ascending' | 'descending' | null = null
  ): Promise<{
    data: Client[];
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
    };
  }> {
    try {
      // Construir la URL base para búsqueda
      let url = `${API_BASE_URL}/clients/search`;
      
      // Agregar parámetros de consulta
      let params = new URLSearchParams();
      params.append('term', searchTerm);
      params.append('page', page.toString());
      params.append('status', statusFilter);
      
      // Filtro por riesgo
      if (riskFilter && riskFilter !== 'null') {
        params.append('risk_id', riskFilter);
      }
      
      // Ordenamiento
      if (sortField && sortDirection) {
        const direction = sortDirection === 'ascending' ? 'asc' : 'desc';
        params.append('sort_field', sortField);
        params.append('sort_direction', direction);
      }
      
      url += `?${params.toString()}`;

      const response = await axios.get<PaginatedResponse<BackendClient>>(url);
      
      // Mapear clientes y mantener la información de paginación
      const clients = response.data.data.map(mapBackendClientToFrontend);
      const pagination = {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total
      };

      return {
        data: clients,
        pagination
      };
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          lastPage: 1,
          total: 0
        }
      };
    }
  },

  // Obtiene el detalle de un cliente usando CodComitente
  async getClientByCodComitente(cod: string): Promise<Client | null> {
    try {
      const url = `${API_BASE_URL}/clients/detail/${cod}`;
      const response = await axios.get<BackendClient>(url);
      if (response.data && response.data.CodComitente) {
        return mapBackendClientToFrontend(response.data);
      } else {
        console.error('La respuesta no contiene un cliente válido:', response.data);
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener cliente con CodComitente ${cod}:`, error);
      return null;
    }
  },

  // Obtener usuarios para los selects asíncronos
  async getUsers(): Promise<{ id: string; label: string }[]> {
    try {
      const url = `${API_BASE_URL}/users`;
      const response = await axios.get(url);
      return response.data.map((user: any) => ({
        id: user.id.toString(),
        label: user.name
      }));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  },

  // Crear una acción para un cliente
  async createAction(clientId: string, action: ClientAction): Promise<ClientAction | null> {
    try {
      const url = `${API_BASE_URL}/clients/${clientId}/actions/create`;
      const response = await axios.post(url, action);
      return response.data.action;
    } catch (error) {
      console.error('Error al crear acción:', error);
      return null;
    }
  },

  async updateAction(actionId: string, action: ClientAction): Promise<ClientAction | null> {
    try {
      // Utilizando la ruta correcta según tu backend
      const url = `${API_BASE_URL}/clients/${actionId}/actions/update`;
      const response = await axios.post(url, action);
      return response.data.action;
    } catch (error) {
      console.error('Error al actualizar acción:', error);
      return null;
    }
  },

  // Eliminar una acción para un cliente
  async deleteAction(actionId: string): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/clients/${actionId}/actions`;
      await axios.delete(url);
      return true;
    } catch (error) {
      console.error('Error al eliminar acción:', error);
      return false;
    }
  },

  // Actualizar el cliente completo (datos + eventos + acciones)
  async updateClientFull(
    id: string,
    data: Partial<Client>,
    actions: ClientAction[] = []
  ): Promise<Client | null> {
    try {
      const backendData = {
        ...data,
        actions
      };
      const url = `${API_BASE_URL}/clients/updateFull`;
      const response = await axios.post(url, backendData);
      if (response.data && response.data.client) {
        return mapBackendClientToFrontend(response.data.client);
      } else {
        console.error('La respuesta no contiene el cliente actualizado:', response.data);
        return null;
      }
    } catch (error) {
      console.error(`Error al actualizar cliente completo con id ${id}:`, error);
      return null;
    }
  },

  async getActionsByCodComitente(cod: string): Promise<ClientAction[]> {
    try {
      const url = `${API_BASE_URL}/clients/${cod}/actions`;
      const response = await axios.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener acciones:', error);
      return [];
    }
  },

  async getStrategyByClientNumber(clientNumber: string): Promise<Strategy | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/strategies/${clientNumber}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estrategia del cliente:', error);
      return null;
    }
  },

  async createStrategy(strategyData: Partial<Strategy>): Promise<Strategy | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/clients/strategies`, strategyData);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear estrategia:', error);
      return null;
    }
  },

  async updateStrategy(id: string | number, strategyData: Partial<Strategy>): Promise<Strategy | null> {
    try {
      // Cambia a POST con /update como sufijo
      const response = await axios.post(`${API_BASE_URL}/clients/strategies/${id}/update`, strategyData);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar estrategia:', error);
      return null;
    }
  },

  // Obtener riesgos de un cliente
  async getClientRisks(clientId: string): Promise<Risk[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/risks`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener riesgos del cliente:', error);
      return [];
    }
  },

  // Obtener todos los riesgos disponibles
  async getAllRisks(): Promise<Risk[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/risks`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener todos los riesgos:', error);
      return [];
    }
  },

  // Obtener instrumentos asociados a un riesgo
  async getRiskInstruments(riskId: string | number): Promise<Instrument[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/risks/${riskId}/instruments`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener instrumentos del riesgo:', error);
      return [];
    }
  },

  // Agregar un riesgo a un cliente
  async addRiskToClient(clientId: string, riskId: string | number): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/clients/${clientId}/risks`, { risk_id: riskId });
      return response.data.success || false;
    } catch (error) {
      console.error('Error al agregar riesgo al cliente:', error);
      return false;
    }
  },

  // Quitar un riesgo de un cliente
  async removeRiskFromClient(clientId: string, riskId: string | number): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/clients/${clientId}/risks/${riskId}`);
      return response.data.success || false;
    } catch (error) {
      console.error('Error al quitar riesgo del cliente:', error);
      return false;
    }
  }
};

export default clientesService;