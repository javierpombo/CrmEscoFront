// src/types/Prospecto.ts

/**
 * Tipo para eventos relacionados a un prospecto
 */
export interface EventoType {
  id?: number | string;
  prospect_id?: number | string;
  event_date: string | null;
  description: string | null;
  next_contact: string | null;
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
}

/**
 * Interfaz que define la estructura de un prospecto en el frontend.
 * Los nombres de los campos están en español para mantener consistencia con la UI.
 */
export interface Prospecto {
  id?: string;                    // ID único, opcional al crear
  nombreCliente: string;          // Nombre del cliente o empresa
  contacto: string;               // Información de contacto principal
  tipoCliente: string;            // Tipo de cliente (Particular, Empresa, etc.)
  oficial: string;                // Oficial asignado
  referente: string;              // Persona que refirió al prospecto
  ultimoContacto: string | null;  // Fecha del último contacto
  fechaVencimiento: string | null; // Fecha de vencimiento para próxima acción
  tipoAccion: string;             // Tipo de acción pendiente
  numComitente: string;           // Número de comitente si ya es cliente
  yaEsCliente: boolean;           // Indica si ya es cliente
  tipoClienteAccion: string;      // Tipo de cliente para la acción
  activo: string;                 // Estado del prospecto (activo, inactivo)
  notas: string;                  // Notas adicionales
  
  // Relaciones con eventos y acciones
  events?: EventoType[];         // Eventos asociados al prospecto
  actions?: AccionType[];        // Acciones asociadas al prospecto
}

/**
 * Tipo para creación de prospectos (sin ID)
 */
export type ProspectoNuevo = Omit<Prospecto, 'id'>;

/**
 * Tipo para actualización parcial de prospectos
 */
export type ProspectoActualizacion = Partial<Prospecto>;