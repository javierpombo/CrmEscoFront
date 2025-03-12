export interface BaseEntity {
    id: string;
    nombre: string;
  }
  
  export interface Prospect extends BaseEntity {
    contactoEmpresa: string;
    cargoContacto: string;
    referente: string;
    oficial: string;
    ultimoContacto: string;
    fechaProximoContacto: string;
    eventoPendiente?: string;
    accionPendiente?: string;
  }
  
  export interface Client extends BaseEntity {
    cargo_contacto: string;
    contacto: string;
    oficial: string;
    referente: string;
    ultimoContacto: string;
    ultimaOperacion: string;
    accionPendiente?: string;
  }