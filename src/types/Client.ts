// src/types/Client.ts

export interface ClientAction {
  id: string | number;
  client_id: string;
  action_date: string | null;
  description: string | null;
  next_contact: string | null;
  user_id: string;
  status?: string; // Campo opcional para manejo de estados
}

// Con un index signature se permite tener propiedades adicionales sin listarlas todas.
export interface Client {
  id: string;
  numcomitente: string;
  nombre: string;
  sector: string;
  mail: string;
  cuit: string;
  oficial: string;
  referente: string;
  activo: boolean;
  actions?: ClientAction[];
  [key: string]: any;
}

export interface Strategy {
  id: string | number;
  client_number: number;
  strategy: string;
  description: string | null;
}

// Definición simplificada para Risk
export interface Risk {
  id: string | number;
  description: string;
  fx: number;     
  sobo: number;   
  credito: number; 
  tasa: number;   
  equity: number; 
}

// Definición simplificada para Instrument
export interface Instrument {
  id_instruments: string | number;
  description: string;
  abbreviation: string;
  tp_active?: string;
  iso?: string;
}