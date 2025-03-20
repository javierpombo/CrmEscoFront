import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const riskInstrumentService = {
    async getRisks() {
        console.log("[riskInstrumentService] getRisks: Solicitando lista de riesgos...");
        try {
            const response = await axiosInstance.get('/risks');
            console.log("[riskInstrumentService] getRisks: Respuesta:", response.data);
            return response.data;
        } catch (error) {
            console.error("[riskInstrumentService] getRisks: Error:", error);
            throw error;
        }
    },
    async getRisk(riskId: number) {
        console.log(`[riskInstrumentService] getRisk: Solicitando riesgo con ID ${riskId}...`);
        try {
            const response = await axiosInstance.get(`/risks/${riskId}`);
            console.log(`[riskInstrumentService] getRisk: Respuesta para ID ${riskId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] getRisk: Error al obtener riesgo ${riskId}:`, error);
            throw error;
        }
    },
    async createRisk(riskData: any) {
        console.log("[riskInstrumentService] createRisk: Enviando datos:", riskData);
        try {
            const response = await axiosInstance.post('/risks', riskData);
            console.log("[riskInstrumentService] createRisk: Riesgo creado:", response.data);
            return response.data;
        } catch (error) {
            console.error("[riskInstrumentService] createRisk: Error:", error);
            throw error;
        }
    },
    async updateRisk(riskId: number, riskData: any) {
        console.log(`[riskInstrumentService] updateRisk: Actualizando riesgo ${riskId} con datos:`, riskData);
        try {
            const response = await axiosInstance.put(`/risks/${riskId}`, riskData);
            console.log(`[riskInstrumentService] updateRisk: Riesgo actualizado ${riskId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] updateRisk: Error al actualizar riesgo ${riskId}:`, error);
            throw error;
        }
    },
    async getInstruments(includeInactive: boolean = false) {
        console.log("[riskInstrumentService] getInstruments: Solicitando lista de instrumentos...");
        try {
            const response = await axiosInstance.get('/instruments', {
                params: { includeInactive }
            });
            console.log("[riskInstrumentService] getInstruments: Respuesta:", response.data);
            return response.data;
        } catch (error) {
            console.error("[riskInstrumentService] getInstruments: Error:", error);
            throw error;
        }
    },
    async getInstrument(instrumentId: number) {
        console.log(`[riskInstrumentService] getInstrument: Solicitando instrumento con ID ${instrumentId}...`);
        try {
            const response = await axiosInstance.get(`/instruments/${instrumentId}`);
            console.log(`[riskInstrumentService] getInstrument: Respuesta para ID ${instrumentId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] getInstrument: Error al obtener instrumento ${instrumentId}:`, error);
            throw error;
        }
    },
    async createInstrument(instrumentData: any) {
        console.log("[riskInstrumentService] createInstrument: Enviando datos:", instrumentData);
        try {
            const response = await axiosInstance.post('/instruments', instrumentData);
            console.log("[riskInstrumentService] createInstrument: Instrumento creado:", response.data);
            return response.data;
        } catch (error) {
            console.error("[riskInstrumentService] createInstrument: Error:", error);
            throw error;
        }
    },
    async updateInstrument(instrumentId: number, instrumentData: any) {
        console.log(`[riskInstrumentService] updateInstrument: Actualizando instrumento ${instrumentId} con datos:`, instrumentData);
        try {
            const response = await axiosInstance.put(`/instruments/${instrumentId}`, instrumentData);
            console.log(`[riskInstrumentService] updateInstrument: Instrumento actualizado ${instrumentId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] updateInstrument: Error al actualizar instrumento ${instrumentId}:`, error);
            throw error;
        }
    },
    async deleteInstrument(instrumentId: number) {
        console.log(`[riskInstrumentService] deleteInstrument: Eliminando instrumento con ID ${instrumentId}...`);
        try {
            const response = await axiosInstance.delete(`/instruments/${instrumentId}`);
            console.log(`[riskInstrumentService] deleteInstrument: Instrumento ${instrumentId} eliminado:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] deleteInstrument: Error al eliminar instrumento ${instrumentId}:`, error);
            throw error;
        }
    },
    async getRiskInstruments(riskId: number) {
        console.log(`[riskInstrumentService] getRiskInstruments: Solicitando instrumentos para riesgo ${riskId}...`);
        try {
            const response = await axiosInstance.get(`/risks/${riskId}/instruments`);
            console.log(`[riskInstrumentService] getRiskInstruments: Instrumentos para riesgo ${riskId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] getRiskInstruments: Error al obtener instrumentos para riesgo ${riskId}:`, error);
            throw error;
        }
    },
    // En riskInstrumentService.ts
    // riskInstrumentService.ts

    async assignInstrumentToRisk(riskId: number, instrumentId: string) {
        // IMPORTANTE: enviar instrument_id en el body
        return axiosInstance.post(`/risks/${riskId}/instruments`, {
            instrument_id: instrumentId
        });
    },

    async removeInstrumentFromRisk(riskId: number, instrumentId: string) {
        // IMPORTANTE: usar GET, no DELETE
        return axiosInstance.get(`/risks/${riskId}/instruments/${instrumentId}`);
    },


    async updateInstrumentRisks(instrumentId: number, payload: any) {
        console.log(`[riskInstrumentService] updateInstrumentRisks: Actualizando riesgos del instrumento ${instrumentId} con payload:`, payload);
        try {
            const response = await axiosInstance.put(`/instruments/${instrumentId}`, payload);
            console.log(`[riskInstrumentService] updateInstrumentRisks: Instrumento ${instrumentId} actualizado:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[riskInstrumentService] updateInstrumentRisks: Error al actualizar riesgos del instrumento ${instrumentId}:`, error);
            throw error;
        }
    }
};

export { riskInstrumentService };
