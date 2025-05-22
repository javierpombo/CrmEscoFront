import { User } from './User';
import { Stage, StageProgress } from './Stage';
import { Action } from './Action';

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
  // New fields for stages and actions
  currentStage?: Stage;
  stageProgress: StageProgress[];
  actions: Action[];
  [key: string]: any;
}

export type ProspectoNuevo = Omit<Prospecto, 'id'>;
export type ProspectoActualizacion = Partial<Prospecto>;