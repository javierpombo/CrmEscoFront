// src/types/Instrument.ts

// Interfaz para un Riesgo
export interface Risk {
    id: string | number;
    description: string;
    fx: number;       // 1 = Sí, 0 = No
    sobo: number;     // 1 = Sí, 0 = No (Riesgo Soberano)
    credito: number;  // 1 = Sí, 0 = No
    tasa: number;     // 1 = Sí, 0 = No
    equity: number;   // 1 = Sí, 0 = No
  }
  
  // Interfaz para un Instrumento
  export interface Instrument {
    id: number;
    id_instruments?: string;
    description: string;
    abbreviation: string;
    iso?: string;
    tp_active: boolean;
    fx: number;       // 1 = Sí, 0 = No
    sobo: number;     // 1 = Sí, 0 = No (Riesgo Soberano)
    credito: number;  // 1 = Sí, 0 = No
    tasa: number;     // 1 = Sí, 0 = No
    equity: number;   // 1 = Sí, 0 = No
    risks?: Risk[];   // Relación con los riesgos
  }
  
  // Tipos para los filtros
  export interface RiskFilters {
    fx?: number;      // 0, 1 o undefined (para no filtrar)
    sobo?: number;    // 0, 1 o undefined (para no filtrar)
    credito?: number; // 0, 1 o undefined (para no filtrar)
    tasa?: number;    // 0, 1 o undefined (para no filtrar)
    equity?: number;  // 0, 1 o undefined (para no filtrar)
  }
  
  // Tipo para la paginación
  export interface Pagination {
    currentPage: number;
    lastPage: number;
    total: number;
  }
  
  // Respuesta paginada de instrumentos
  export interface PaginatedInstruments {
    data: Instrument[];
    pagination: Pagination;
  }
  
  // Respuesta del servidor para operaciones CRUD
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }