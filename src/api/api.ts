// src/services/prospectoService.ts

import axios from 'axios';
import { Prospecto } from '../types/Prospecto';
import { User } from '../types/User';
import { API_BASE_URL } from '../config/constants'; /* Es la URL de la api */

// Configura axios para mostrar más información en caso de error
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

// Interfaces que reflejan la respuesta del backend (en inglés)
interface BackendProspect {
  id: number | string;
  name: string;
  company_contact: string;
  contact_position: string;
  referent: string;
  official: string;
  last_contact: string | null;
  events?: BackendEvent[];
  actions?: BackendAction[];
  official_user?: any;
  referent_user?: any;
}

interface BackendEvent {
  id: number | string;
  prospect_id: number | string;
  event_date: string | null;
  description: string | null;
  next_contact: string | null;
}

interface BackendAction {
  id: number | string;
  prospect_id: number | string;
  action_date: string | null;
  description: string | null;
  next_contact: string | null;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Convierte la respuesta del backend (en inglés) 
 * al formato que manejas en el front-end (en español).
 */
function mapBackendProspectToFrontend(prospect: BackendProspect): Prospecto {
  // Encuentra la última acción (ejemplo de lógica) si existe
  const lastAction = prospect.actions && prospect.actions.length > 0
    ? prospect.actions.sort((a, b) => {
        if (!a.next_contact) return 1;
        if (!b.next_contact) return -1;
        return new Date(b.next_contact).getTime() - new Date(a.next_contact).getTime();
      })[0]
    : null;

  return {
    id: prospect.id.toString(),
    nombreCliente: prospect.name,
    contacto: prospect.company_contact,
    oficial: prospect.official,
    referente: prospect.referent,
    tipoCliente: prospect.contact_position,
    ultimoContacto: prospect.last_contact,
    tipoAccion: lastAction?.description || '',
    fechaVencimiento: lastAction?.next_contact || null,
    numComitente: '',  // Ajusta si en el futuro viene desde el backend
    yaEsCliente: false, 
    tipoClienteAccion: '',
    activo: 'activo',
    notas: (prospect.events || [])
      .map(e => e.description)
      .filter(Boolean)
      .join(', '),
    // Asigna los objetos completos de usuario:
    officialUser: prospect.official_user,
    referentUser: prospect.referent_user
  };
}

/**
 * Convierte los datos del front-end (Prospecto) 
 * al formato que espera tu backend (en inglés).
 */

function mapFrontendProspectToBackend(
  prospecto: Omit<Prospecto, 'id'> | Partial<Prospecto>
): Partial<BackendProspect> {
  const backendProspect: Partial<BackendProspect> = {
    name: prospecto.nombreCliente || '',
    company_contact: prospecto.contacto || '',
    official: prospecto.oficial || '',
    referent: prospecto.referente || '',
    contact_position: prospecto.tipoCliente || '',
    last_contact: prospecto.ultimoContacto
      ? new Date(prospecto.ultimoContacto).toISOString().split('T')[0]
      : null
  };

  if ('id' in prospecto && prospecto.id) {
    backendProspect.id = prospecto.id;
  }

  return backendProspect;
}


// Prueba directa de conexión a la API
export async function testApiConnection() {
  try {
    const response = await axios.get(`${API_BASE_URL}/prospects/1`);
    console.log('Conexión exitosa, datos recibidos:', response.data);
    return true;
  } catch (error) {
    console.error('Error al conectar con la API:', error);
    return false;
  }
}

// Servicio principal para Prospectos
export const prospectoService = {
  // Obtener lista de prospectos con paginación
  async getProspectos(page = 1, status: string = 'todos'): Promise<{
    data: Prospecto[];
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
    };
  }> {
    try {
      const url = `${API_BASE_URL}/prospects/${page}?status=${status}`;
      const response = await axios.get<PaginatedResponse<BackendProspect>>(url);
      const prospectos = response.data.data.map(mapBackendProspectToFrontend);
      const pagination = {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      };
      return { data: prospectos, pagination };
    } catch (error) {
      console.error('Error al obtener prospectos:', error);
      return {
        data: [],
        pagination: { currentPage: 1, lastPage: 1, total: 0 },
      };
    }
  },

  // Obtener un prospecto por ID
  async getProspectoById(id: string): Promise<Prospecto | null> {
    try {
      const url = `${API_BASE_URL}/prospects/detail/${id}`;
      console.log(`Realizando petición GET detallada a ${url}`);
      
      const response = await axios.get<BackendProspect>(url);
      console.log('Detalle de prospecto recibido:', response.data);
      
      if (response.data && response.data.id) {
        return mapBackendProspectToFrontend(response.data);
      } else {
        console.error('La respuesta no contiene un prospecto válido:', response.data);
        return null;
      }
    } catch (error) {
      console.error(`Error al obtener prospecto con id ${id}:`, error);
      return null;
    }
  },

  // Crear un nuevo prospecto
  async createProspecto(data: Omit<Prospecto, 'id'>): Promise<Prospecto | null> {
    try {
      const backendData = mapFrontendProspectToBackend(data);
      const url = `${API_BASE_URL}/prospects`;
      console.log(`Realizando petición POST a ${url} con datos:`, backendData);
      
      const response = await axios.post(url, backendData);
      console.log('Respuesta al crear prospecto:', response.data);
      
      if (response.data && response.data.prospect) {
        return mapBackendProspectToFrontend(response.data.prospect);
      } else {
        console.error('La respuesta no contiene el prospecto creado:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error al crear prospecto:', error);
      return null;
    }
  },

  // Actualizar un prospecto existente (upsert)
  async updateProspecto(id: string, data: Partial<Prospecto>): Promise<Prospecto | null> {
    try {
      const backendData = mapFrontendProspectToBackend(data);
      backendData.id = id;
      
      const url = `${API_BASE_URL}/prospects`;
      console.log(`Realizando petición POST a ${url} con datos:`, backendData);
      
      const response = await axios.post(url, backendData);
      console.log('Respuesta al actualizar prospecto:', response.data);
      
      if (response.data && response.data.prospect) {
        return mapBackendProspectToFrontend(response.data.prospect);
      } else {
        console.error('La respuesta no contiene el prospecto actualizado:', response.data);
        return null;
      }
    } catch (error) {
      console.error(`Error al actualizar prospecto con id ${id}:`, error);
      return null;
    }
  },

  // Actualizar un prospecto con eventos y acciones (updateFull)
  async updateProspectoFull(
    id: string, 
    data: Partial<Prospecto>, 
    events: any[] = [], 
    actions: any[] = []
  ): Promise<Prospecto | null> {
    try {
      const backendData = {
        ...mapFrontendProspectToBackend(data),
        id,
        events,
        actions
      };
      
      const url = `${API_BASE_URL}/prospects/updateFull`;
      console.log(`Realizando petición POST a ${url} con datos:`, backendData);
      
      const response = await axios.post(url, backendData);
      console.log('Respuesta al actualizar prospecto completo:', response.data);
      
      if (response.data && response.data.prospect) {
        return mapBackendProspectToFrontend(response.data.prospect);
      } else {
        console.error('La respuesta no contiene el prospecto actualizado:', response.data);
        return null;
      }
    } catch (error) {
      console.error(`Error al actualizar prospecto completo con id ${id}:`, error);
      return null;
    }
  },

  // Eliminar un prospecto (soft delete en el backend)
  async deleteProspecto(id: string): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/prospects/${id}`;
      console.log(`Realizando petición DELETE a ${url}`);
      
      await axios.delete(url);
      return true;
    } catch (error) {
      console.error(`Error al eliminar prospecto con id ${id}:`, error);
      return false;
    }
  }
};

// Para mantener compatibilidad con código existente
export async function getContacts() {
  try {
    const url = `${API_BASE_URL}/clients/1`;
    console.log(`Obteniendo contactos desde ${url}`);
    
    const response = await axios.get(url);
    console.log('Contactos recibidos:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return [];
  }
}


export async function getClients(
  page: number = 1, 
  filter: 'todos' | 'activos' | 'inactivos' = 'todos'
) {
  let endpoint = '';
  if (filter === 'activos') {
    endpoint = `/clients/active/${page}`;
  } else if (filter === 'inactivos') {
    endpoint = `/clients/inactive/${page}`;
  } else {
    endpoint = `/clients/${page}`;
  }

  const response = await axios.get(`${API_BASE_URL}${endpoint}`);

  // La respuesta de Laravel tiene la siguiente estructura:
  // { current_page, data: [...], last_page, total, ... }

  // Realizamos el mapeo de cada item para que tenga los campos que usa el front.
  const transformedData = response.data.data.map((item: any, index: number) => ({
    id: item.Numero || String(index + 1),
    numcomitente: item.CodComitente || '-',
    nombre: item.Descripcion || '-',
    sector: item.Actividad || '-',
    // Si el campo Oficial tiene comas, nos quedamos con el primer valor:
    oficial: item.Oficial ? item.Oficial.split(',')[0] : '-',
    // Lo mismo para Referente:
    referente: item.Referente ? item.Referente.split(',')[0] : '-',
    cuit: item.CUIT || '-',
    mail: item.EMail || '-',
    // Consideramos activo si EstaAnulado es "0"
    activo: item.EstaAnulado === "0"
  }));

  return {
    data: transformedData,
    pagination: {
      currentPage: response.data.current_page,
      lastPage: response.data.last_page,
      total: response.data.total,
    }
  };
}

export default prospectoService;
