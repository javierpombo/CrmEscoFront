import { User } from './User';
/**
 * Tipo para eventos relacionados a un prospecto
 */
export interface EventoType {
  id?: number | string;
  prospect_id?: string;
  event_date: string | null;
  description: string | null;
  next_contact: string | null;
  user_id: string;
}

/**
 * Tipo para acciones relacionadas a un prospecto
 */
export interface AccionType {
  id?: number | string;
  prospect_id?: number | string;
  action_date: string | null;
  description: string | null;
  next_contact: string | null;
  user_id: string;
}

/**
 * Interfaz que define la estructura de un prospecto en el frontend.
 * Los nombres de los campos están en español para mantener consistencia con la UI.
 */
export interface Prospecto {
  id?: string;
  nombreCliente: string;
  contacto: string;
  tipoCliente: string;
  oficial?: string;
  referente?: string;
  officialUser?: any;
  referentUser?: any;
  ultimoContacto: string | null;
  fechaVencimiento: string | null;
  tipoAccion: string;
  numComitente: string;
  yaEsCliente: boolean;
  tipoClienteAccion: string;
  activo: string;
  notas: string;
  events?: any[];
  actions?: any[];
  [key: string]: any;
}



/**
 * Tipo para creación de prospectos (sin ID)
 */
export type ProspectoNuevo = Omit<Prospecto, 'id'>;

/**
 * Tipo para actualización parcial de prospectos
 */
export type ProspectoActualizacion = Partial<Prospecto>;