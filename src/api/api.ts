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
  phone_contact?: string;
  email_contact?: string;
  additional_info?: string;
  sector_industry?: string;
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
  // Encuentra la última acción basada en action_date (no en next_contact)
  const lastAction = prospect.actions && prospect.actions.length > 0
    ? prospect.actions.sort((a, b) => {
      if (!a.action_date) return 1;
      if (!b.action_date) return -1;
      return new Date(b.action_date).getTime() - new Date(a.action_date).getTime();
    })[0]
    : null;

  // Calcular último contacto basado en la fecha de la última acción
  const ultimoContacto = lastAction?.action_date || '-';

  return {
    id: prospect.id ? prospect.id.toString() : '0',
    nombreCliente: prospect.name,
    contacto: prospect.company_contact,
    oficial: prospect.official,
    referente: prospect.referent,
    cargo_contacto: prospect.contact_position,
    telefono_contacto: prospect.phone_contact || '',
    email_contacto: prospect.email_contact || '',
    info_adicional: prospect.additional_info || '',
    sector_industria: prospect.sector_industry || '',
    // Usar la fecha de la última acción como último contacto
    ultimoContacto: ultimoContacto,
    tipoAccion: lastAction?.description || '',
    fechaVencimiento: lastAction?.next_contact || '-',
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
    contact_position: prospecto.cargo_contacto || '',
    phone_contact: prospecto.telefono_contacto || '',
    email_contact: prospecto.email_contacto || '',
    additional_info: prospecto.info_adicional || '',
    sector_industry: prospecto.sector_industria || '',
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
  async getProspectos(
    page = 1,
    filterStatus: string = 'todos',
    sortField: string | null = null,
    sortDirection: 'ascending' | 'descending' | null = null
  ): Promise<{
    data: Prospecto[];
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
    };
  }> {
    try {
      // Construir URL con parámetros de ordenamiento
      let url = `${API_BASE_URL}/prospects/${page}?status=${filterStatus}`;

      // Agregar parámetros de ordenamiento si están presentes
      if (sortField && sortDirection) {
        // Convertir ascending/descending a asc/desc para la API
        const direction = sortDirection === 'ascending' ? 'asc' : 'desc';
        url += `&sort_by=${sortField}&sort_dir=${direction}`;
      }

      console.log(`Realizando petición GET a ${url}`);

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

  async searchProspectos(
    searchTerm: string,
    page = 1,
    filterStatus: string = 'todos',
    sortField: string | null = null,
    sortDirection: 'ascending' | 'descending' | null = null
  ): Promise<{
    data: Prospecto[];
    pagination: {
      currentPage: number;
      lastPage: number;
      total: number;
    };
  }> {
    try {
      // Construir URL base
      let url = `${API_BASE_URL}/prospects/search?term=${encodeURIComponent(searchTerm)}&page=${page}&status=${filterStatus}`;

      // Agregar parámetros de ordenamiento
      if (sortField && sortDirection) {
        const direction = sortDirection === 'ascending' ? 'asc' : 'desc';
        url += `&sort_by=${sortField}&sort_dir=${direction}`;
      }

      console.log(`Realizando búsqueda en ${url}`);

      const response = await axios.get<PaginatedResponse<BackendProspect>>(url);
      console.log('Resultados de búsqueda recibidos:', response.data);

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
      console.error('Error al buscar prospectos:', error);
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
  statusFilter: 'todos' | 'activos' | 'inactivos' = 'todos',
  sortField: string | null = null,
  sortDirection: 'ascending' | 'descending' | null = null,
  riskFilter: string | null = null,
  riskParams: { fx?: number; sob?: number; credito?: number; tasa?: number; equity?: number; search_term?: string } = {}
) {
  try {
    // Construir la URL base usando URLSearchParams
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('status', statusFilter);

    // Añadir filtro por riesgo si está presente
    if (riskFilter) {
      params.append('risk_id', riskFilter);
    }

    if (riskParams.fx !== undefined && riskParams.fx !== 2) {
      params.append('fx', riskParams.fx.toString());
    }
    if (riskParams.sob !== undefined && riskParams.sob !== 2) {
      params.append('sob', riskParams.sob.toString());
    }
    if (riskParams.credito !== undefined && riskParams.credito !== 2) {
      params.append('credito', riskParams.credito.toString());
    }
    if (riskParams.tasa !== undefined && riskParams.tasa !== 2) {
      params.append('tasa', riskParams.tasa.toString());
    }
    if (riskParams.equity !== undefined && riskParams.equity !== 2) {
      params.append('equity', riskParams.equity.toString());
    }

    if (riskParams.search_term) {
      params.append('search_term', riskParams.search_term);
    }

    // Añadir parámetros de ordenamiento si están presentes
    if (sortField && sortDirection) {
      const direction = sortDirection === 'ascending' ? 'asc' : 'desc';
      params.append('sort_by', sortField);
      params.append('sort_dir', direction);
    }

    // Construir la URL completa
    const url = `${API_BASE_URL}/clients?${params.toString()}`;

    console.log('Fetching clients with URL:', url);

    const response = await axios.get(url);

    console.log('Raw response:', response.data);

    // Verificar si hay datos en la respuesta
    if (!response.data || !response.data.data) {
      console.error('No se recibieron datos de la API');
      return {
        data: [],
        pagination: {
          currentPage: 1,
          lastPage: 1,
          total: 0,
        }
      };
    }

    // Transformar los datos para el formato que espera el frontend
    const transformedData = response.data.data.map((item: any, index: number) => {
      // Procesar riesgos de manera más robusta
      const risks = item.risks || [];
      const formattedRisks = risks.map((risk: any) => ({
        id: risk.id ?? String(index),
        name: risk.name || risk.description || 'Riesgo sin nombre'
      }));

      // Procesar acciones y encontrar la próxima fecha de vencimiento
      const actions = item.actions || [];
      let fechaVencimiento = null;

      if (actions.length > 0) {
        // Encontrar la acción con la fecha de próximo contacto más próxima
        const pendingActions = actions
          .filter((action: any) => action.next_contact)
          .sort((a: any, b: any) => {
            if (!a.next_contact) return 1;
            if (!b.next_contact) return -1;
            return new Date(a.next_contact).getTime() - new Date(b.next_contact).getTime();
          });

        if (pendingActions.length > 0) {
          fechaVencimiento = pendingActions[0].next_contact;
        }
      }

      // Función de ayuda para obtener el primer elemento de una cadena separada por coma
      const getFirstElement = (value: string) =>
        value ? value.split(',')[0].trim() : '-';

      // Crear un objeto base con los campos principales
      const baseData = {
        id: item.Numero || String(index + 1),
        Numero: item.Numero || '-',
        nombre: item.Descripcion || '-',
        sector: item.Actividad || '-',
        oficial: getFirstElement(item.Oficial),
        referente: getFirstElement(item.Referente),
        cuit: item.CUIT || '-',
        mail: item.EMail || '-',
        activo: item.EstaAnulado === "0",
        risks: formattedRisks,
        fechaVencimiento: fechaVencimiento,
      };

      // Añadir campos adicionales dinámicamente
      const additionalFields: Record<string, any> = {};
      const excludedKeys = new Set([
        'Numero', 'Descripcion', 'Actividad', 'Oficial',
        'Referente', 'CUIT', 'EMail', 'EstaAnulado',
        'risks', 'actions'
      ]);

      Object.keys(item).forEach(key => {
        if (!excludedKeys.has(key)) {
          additionalFields[key] = item[key];
        }
      });

      return {
        ...baseData,
        ...additionalFields
      };
    });

    return {
      data: transformedData,
      pagination: {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      }
    };
  } catch (error) {
    console.error('Error al obtener clientes:', error);

    // Si es un error de axios, imprimir más detalles
    if (axios.isAxiosError(error)) {
      console.error('Detalles del error:', error.response?.data);
    }

    return {
      data: [],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      }
    };
  }
}

export async function searchClients(
  searchTerm: string,
  page: number = 1,
  filter: 'todos' | 'activos' | 'inactivos' = 'todos',
  riskFilter: string | null = null,
  sortField: string | null = null,
  sortDirection: 'ascending' | 'descending' | null = null,
) {
  try {
    // Construir URL base para búsqueda
    let url = `${API_BASE_URL}/clients/search/${page}?term=${encodeURIComponent(searchTerm)}&status=${filter}`;

    // Añadir filtro por riesgo si está presente
    if (riskFilter && riskFilter !== 'null') {
      url += `&risk_id=${riskFilter}`;
    }

    // Añadir parámetros de ordenamiento si están presentes
    if (sortField && sortDirection) {
      const direction = sortDirection === 'ascending' ? 'asc' : 'desc';
      url += `&sort_by=${sortField}&sort_dir=${direction}`;
    }

    // IMPORTANTE: Incluir riesgos y acciones en la misma petición
    url += '&include=risks,actions';

    console.log('Realizando búsqueda en:', url);
    const response = await axios.get(url);
    console.log('Respuesta de búsqueda:', response.data);

    // Extraer los datos y la paginación de la respuesta
    const rawData = response.data.data || [];
    const pagination = {
      currentPage: response.data.current_page || 1,
      lastPage: response.data.last_page || 1,
      total: response.data.total || 0
    };

    // Transformar los datos al formato que espera el frontend
    const transformedData = rawData.map((item: any, index: number) => {
      // Extraer los riesgos si vienen incluidos en la respuesta
      let risks: Array<{ id: string; name: string }> = [];
      if (item.risks && Array.isArray(item.risks)) {
        risks = item.risks.map((risk: any) => ({
          id: risk.id?.toString() || String(index),
          name: risk.name || risk.description || 'Riesgo sin nombre'
        }));
      }

      // Calcular la fecha de vencimiento basada en las acciones
      let fechaVencimiento = null;
      if (item.actions && Array.isArray(item.actions) && item.actions.length > 0) {
        const pendingActions = item.actions
          .filter((action: any) => action.next_contact)
          .sort((a: any, b: any) => {
            if (!a.next_contact) return 1;
            if (!b.next_contact) return -1;
            return new Date(a.next_contact).getTime() - new Date(b.next_contact).getTime();
          });

        if (pendingActions.length > 0) {
          fechaVencimiento = pendingActions[0].next_contact;
        }
      }

      // Construir el objeto de cliente transformado
      return {
        id: item.Numero?.toString() || String(index + 1),
        Numero: item.Numero?.toString() || '-',
        nombre: item.Descripcion || '-',
        sector: item.Actividad || '-',
        oficial: item.Oficial ? item.Oficial.split(',')[0] : '-',
        referente: item.Referente ? item.Referente.split(',')[0] : '-',
        cuit: item.CUIT || '-',
        mail: item.EMail || '-',
        activo: item.EstaAnulado === "0" || item.activo === true,
        risks: risks,
        fechaVencimiento: fechaVencimiento
      };
    });

    return {
      data: transformedData,
      pagination: pagination
    };
  } catch (error) {
    console.error('Error al buscar clientes:', error);

    // Si es un error de axios, mostrar más detalles
    if (axios.isAxiosError(error)) {
      console.error('Detalles del error:', error.response?.data);
    }

    return {
      data: [],
      pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0
      }
    };
  }
}

export default prospectoService;
