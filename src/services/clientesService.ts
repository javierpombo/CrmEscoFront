// src/services/clientesService.ts

import axios from 'axios';
import { Client, ClientEvent, ClientAction } from '../types/Client';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
  events?: BackendClientEvent[];
  actions?: BackendClientAction[];
}

interface BackendClientEvent {
  id: number | string;
  client_number: string;
  event_date: string | null;
  description: string | null;
  next_contact: string | null;
  user_id?: string;
}

interface BackendClientAction {
  id: number | string;
  client_number: string;
  action_date: string | null;
  description: string | null;
  next_contact: string | null;
  user_id?: string;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
}

// Mapeo: transformar un cliente del backend al formato del front
function mapBackendClientToFrontend(client: BackendClient): Client {
  const mappedEvents: ClientEvent[] = (client.events || []).map(e => ({
    id: e.id,
    client_id: e.client_number,
    event_date: e.event_date,
    description: e.description,
    next_contact: e.next_contact,
    user_id: e.user_id || ''
  }));
  const mappedActions: ClientAction[] = (client.actions || []).map(a => ({
    id: a.id,
    client_id: a.client_number,
    action_date: a.action_date,
    description: a.description,
    next_contact: a.next_contact,
    user_id: a.user_id || ''
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
    events: mappedEvents,
    actions: mappedActions,
    // Se pueden incluir otras propiedades dinámicamente mediante un index signature en el type
  };
}

// Funciones para mapear datos del front para crear o actualizar
function mapFrontendClientToBackendForCreate(client: Omit<Client, 'id'>): Partial<BackendClient> {
  return {
    Descripcion: client.nombre,
    Actividad: client.sector,
    EMail: client.mail,
    CUIT: client.cuit,
    Oficial: client.oficial,
    Referente: client.referente,
    CodComitente: client.numcomitente,
    EstaAnulado: client.activo ? "0" : "1"
  };
}

function mapFrontendClientToBackendForUpdate(client: Partial<Client>, id: string): Partial<BackendClient> {
  return {
    Descripcion: client.nombre || '',
    Actividad: client.sector || '',
    EMail: client.mail || '',
    CUIT: client.cuit || '',
    Oficial: client.oficial || '',
    Referente: client.referente || '',
    CodComitente: client.numcomitente || id,
    EstaAnulado: (client.activo !== undefined) ? (client.activo ? "0" : "1") : "0"
  };
}

export const clientesService = {
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

  // Crear un evento para un cliente
  async createEvent(clientId: string, event: ClientEvent): Promise<ClientEvent | null> {
    try {
      const url = `${API_BASE_URL}/clients/${clientId}/events/create`;
      const response = await axios.post(url, event);
      return response.data.event;
    } catch (error) {
      console.error('Error al crear evento:', error);
      return null;
    }
  },

  // Actualizar un evento para un cliente
  async updateEvent(clientId: string, event: ClientEvent): Promise<ClientEvent | null> {
    try {
      const url = `${API_BASE_URL}/clients/${clientId}/events/update`;
      const response = await axios.post(url, event);
      return response.data.event;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      return null;
    }
  },

  // Eliminar un evento para un cliente
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/clients/${eventId}/events`;
      await axios.delete(url);
      return true;
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      return false;
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

  // Actualizar una acción para un cliente
  async updateAction(clientId: string, action: ClientAction): Promise<ClientAction | null> {
    try {
      const url = `${API_BASE_URL}/clients/${clientId}/actions/update`;
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
    events: ClientEvent[] = [],
    actions: ClientAction[] = []
  ): Promise<Client | null> {
    try {
      const backendData = {
        ...mapFrontendClientToBackendForUpdate(data, id),
        events,
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

  async getEventsByCodComitente(cod: string): Promise<ClientEvent[]> {
    try {
      const url = `${API_BASE_URL}/clients/${cod}/events`;
      const response = await axios.get(url);
      // Se asume que la respuesta es { data: [...] }
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      return [];
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
  }

};

export default clientesService;
