// src/services/prospectoService.ts

import axios from 'axios';
import { Prospecto, EventoType, AccionType } from '../types/Prospecto';
import { API_BASE_URL } from '../config/constants'; /* Es la URL de la api */

// Variable para controlar si hay una solicitud de creación en curso
let isCreatingProspect = false;

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
  phone_contact?: string;
  email_contact?: string;
  additional_info?: string; 
  referent: string;
  official: string;
  last_contact: string | null;
  client_number?: string;
  is_client?: boolean;
  client_type_action?: string;
  active?: string;
  notes?: string;
  sector_industry: string;
  // Propiedades para crear acciones iniciales
  action_description?: string;
  action_date?: string | null;
  // Relaciones
  events?: BackendEvent[];
  actions?: BackendAction[];
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

  // Convertir eventos del backend al tipo del frontend
  const mappedEvents: EventoType[] = (prospect.events || []).map(e => ({
    id: e.id,
    prospect_id: e.prospect_id.toString(), 
    event_date: e.event_date,
    description: e.description,
    next_contact: e.next_contact,
    user_id: (e as any).user_id || ''  
  }));
  
  // Convertir acciones del backend al tipo del frontend
  const mappedActions: AccionType[] = (prospect.actions || []).map(a => ({
    id: a.id,
    prospect_id: a.prospect_id.toString(), 
    action_date: a.action_date,
    description: a.description,
    next_contact: a.next_contact,
    user_id: (a as any).user_id || ''  
  }));

  return {
    id: prospect.id.toString(),
    nombreCliente: prospect.name,
    contacto: prospect.company_contact,
    oficial: prospect.official,
    referente: prospect.referent,
    cargo_contacto: prospect.contact_position,
    ultimoContacto: prospect.last_contact,
    tipoAccion: lastAction?.description || '',
    fechaVencimiento: lastAction?.next_contact || null,
    numComitente: prospect.client_number || '',
    yaEsCliente: prospect.is_client || false,
    tipoClienteAccion: prospect.client_type_action || '',
    activo: prospect.active || 'activo',
    notas: prospect.notes || '',
    events: mappedEvents,
    actions: mappedActions,
    telefono_contacto: prospect.phone_contact || '',
    email_contacto: prospect.email_contact || '',
    info_adicional: prospect.additional_info || '',
    sector_industria: prospect.sector_industry || '',
  };
}

/**
 * Convierte los datos del front-end (Prospecto) para crear nuevo en backend
 */
function mapFrontendProspectToBackendForCreate(
  prospecto: Omit<Prospecto, 'id'>
): Partial<BackendProspect> {
  return {
    name: prospecto.nombreCliente || '',
    company_contact: prospecto.contacto || '',
    official: prospecto.oficial || '',
    referent: prospecto.referente || '',
    contact_position: prospecto.cargo_contacto || '',
    phone_contact: prospecto.telefono_contacto || '',
    email_contact: prospecto.email_contacto || '',
    additional_info: prospecto.info_adicional || '', 
    sector_industry: prospecto.sector_industry || '', 
    last_contact: prospecto.ultimoContacto
      ? new Date(prospecto.ultimoContacto).toISOString().split('T')[0]
      : null,
    // Campos adicionales para el formulario
    client_number: prospecto.Numero || '',
    is_client: prospecto.yaEsCliente || false,
    client_type_action: prospecto.tipoClienteAccion || '',
    active: prospecto.activo || 'activo',
    notes: prospecto.notas || '',
    // Información para la acción inicial
    action_description: prospecto.tipoAccion || '',
    action_date: prospecto.fechaVencimiento
      ? new Date(prospecto.fechaVencimiento).toISOString().split('T')[0]
      : null
  };
}

/**
 * Convierte los datos del front-end (Prospecto) para actualización
 */
function mapFrontendProspectToBackendForUpdate(
  prospecto: Partial<Prospecto>,
  id: string
): Partial<BackendProspect> {
  const backendProspect: Partial<BackendProspect> = {
    id: id, // Siempre incluimos el ID para actualización
    name: prospecto.nombreCliente || '',
    company_contact: prospecto.contacto || '',
    official: prospecto.oficial || '',
    referent: prospecto.referente || '',
    contact_position: prospecto.cargo_contacto || '',
    phone_contact: prospecto.telefono_contacto || '',
    email_contact: prospecto.email_contacto || '',
    additional_info: prospecto.info_adicional || '',
    sector_industry: prospecto.sector_industria || '', 
    last_contact: prospecto.ultimoContacto
      ? new Date(prospecto.ultimoContacto).toISOString().split('T')[0]
      : null,
    // Campos adicionales
    client_number: prospecto.numComitente || '',
    is_client: prospecto.yaEsCliente || false,
    client_type_action: prospecto.tipoClienteAccion || '',
    active: prospecto.activo || 'activo',
    notes: prospecto.notas || ''
  };

  return backendProspect;
}

// Servicio principal para Prospectos
export const prospectoService = {
  // Obtener lista de prospectos con paginación
  async getProspectos(page = 1): Promise<{
    data: Prospecto[];
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
    };
  }> {
    try {
      const url = `${API_BASE_URL}/prospects/${page}`;
      console.log(`Realizando petición GET a ${url}`);
      
      const response = await axios.get<PaginatedResponse<BackendProspect>>(url);
      console.log('Datos paginados recibidos:', response.data);
      
      const prospectos = response.data.data.map(mapBackendProspectToFrontend);
      const pagination = {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total
      };
      
      return { 
        data: prospectos, 
        pagination
      };
    } catch (error) {
      console.error('Error al obtener prospectos:', error);
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

  // Crear un nuevo prospecto - MODIFICADO PARA EVITAR DUPLICADOS
  async createProspecto(data: Omit<Prospecto, 'id'>): Promise<Prospecto | null> {
    // Evitar múltiples solicitudes simultáneas
    if (isCreatingProspect) {
      console.warn('Ya hay una solicitud de creación en curso, se ignora esta segunda llamada');
      return null;
    }

    try {
      // Marcar que hay una creación en curso
      isCreatingProspect = true;
      console.log('⏳ Iniciando creación de prospecto...');

      // 1. Crear una copia limpia de los datos
      const cleanData = { ...data };
      
      // 2. Asegurarse de eliminar cualquier ID que pudiera haberse colado
      delete (cleanData as any).id;
      
      // 3. Usar la función específica para mapeo de creación
      const backendData = mapFrontendProspectToBackendForCreate(cleanData);
      
      // 4. Doble verificación: eliminar cualquier ID que pudiera colarse
      delete backendData.id;
      
      // 5. Loggear para depuración
      console.log('📤 DATOS FINALES ENVIADOS AL CREAR:', backendData);
      
      const url = `${API_BASE_URL}/prospects`;
      console.log(`🔄 Realizando petición POST a ${url}`);
      
      const response = await axios.post(url, backendData);
      console.log('✅ Respuesta al crear prospecto:', response.data);
      
      if (response.data && response.data.prospect) {
        return mapBackendProspectToFrontend(response.data.prospect);
      } else {
        console.error('❌ La respuesta no contiene el prospecto creado:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error al crear prospecto:', error);
      return null;
    } finally {
      // Siempre liberar el bloqueo al finalizar
      isCreatingProspect = false;
      console.log('🔚 Finalizada creación de prospecto');
    }
  },

  // Actualizar un prospecto existente
  async updateProspecto(id: string, data: Partial<Prospecto>): Promise<Prospecto | null> {
    try {
      // Usar la función específica para actualización
      const backendData = mapFrontendProspectToBackendForUpdate(data, id);
      console.log(data);
      // Verificar que el ID esté presente
      if (!backendData.id) {
        console.error('Error: No se proporcionó ID para actualizar prospecto');
        return null;
      }
      
      const url = `${API_BASE_URL}/prospects/${id}`;
      console.log(`Realizando petición post a ${url} con datos:`, backendData);
      
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

  // Actualizar un prospecto con eventos y acciones
  async updateProspectoFull(
    id: string, 
    data: Partial<Prospecto>, 
    events: any[] = [], 
    actions: any[] = []
  ): Promise<Prospecto | null> {
    try {
      const backendData = {
        ...mapFrontendProspectToBackendForUpdate(data, id),
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
  },
  async createEvent(prospectId: string, event: EventoType): Promise<EventoType | null> {
    try {
      const url = `${API_BASE_URL}/prospects/${prospectId}/events/create`;
      const response = await axios.post(url, event);
      console.log('Evento creado:', response.data);
      return response.data.event;
    } catch (error) {
      console.error('Error al crear evento:', error);
      return null;
    }
  },

  async updateEvent(prospectId: string, event: EventoType): Promise<EventoType | null> {
    try {
      const url = `${API_BASE_URL}/prospects/${prospectId}/events/update`;
      const response = await axios.post(url, event);
      console.log('Evento actualizado:', response.data);
      return response.data.event;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      return null;
    }
  },
  async createAction(prospectId: string, action: AccionType): Promise<AccionType | null> {
    try {
      const url = `${API_BASE_URL}/prospects/${prospectId}/actions/create`;
      const response = await axios.post(url, action);
      console.log('Acción creada:', response.data);
      // Se asume que el backend devuelve el objeto acción en response.data.action
      return response.data.action;
    } catch (error) {
      console.error('Error al crear acción:', error);
      return null;
    }
  },
  
  async updateAction(prospectId: string, action: AccionType): Promise<AccionType | null> {
    try {
      const url = `${API_BASE_URL}/prospects/${prospectId}/actions/update`;
      const response = await axios.post(url, action);
      console.log('Acción actualizada:', response.data);
      // Se asume que el backend devuelve el objeto acción en response.data.action
      return response.data.action;
    } catch (error) {
      console.error('Error al actualizar acción:', error);
      return null;
    }
  },

};

// Para mantener compatibilidad con código existente
export async function getContacts() {
  try {
    const url = `${API_BASE_URL}/clients/active/1`;
    console.log(`Obteniendo contactos desde ${url}`);
    
    const response = await axios.get(url);
    console.log('Contactos recibidos:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return [];
  }
}

export default prospectoService;