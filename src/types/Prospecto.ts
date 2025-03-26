import { User } from './User';

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
  status?: string; 
}

export interface Prospecto {
  id?: string;
  nombreCliente: string;
  contacto: string;
  cargo_contacto: string;
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
  sector_industria: string;
  actions?: AccionType[];
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