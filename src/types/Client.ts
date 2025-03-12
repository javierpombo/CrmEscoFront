export interface ClientEvent {
    id: string | number;
    client_id: string;
    event_date: string | null;
    description: string | null;
    next_contact: string | null;
    user_id: string;
  }
  
  export interface ClientAction {
    id: string | number;
    client_id: string;
    action_date: string | null;
    description: string | null;
    next_contact: string | null;
    user_id: string;
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
    events?: ClientEvent[];
    actions?: ClientAction[];
    [key: string]: any;
  }
  
  export interface Strategy {
    id: string | number;
    client_number: number;
    strategy: string;
    description: string | null;
  }