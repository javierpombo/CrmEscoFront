import axios from 'axios';
import { Stage, StageProgress, RequiredAction } from '../types/Stage';
import { API_BASE_URL } from '../config/constants';

export const stageService = {
  async getStages(): Promise<Stage[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stages:', error);
      return [];
    }
  },

  async getStageById(stageId: string): Promise<Stage | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stages/${stageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stage ${stageId}:`, error);
      return null;
    }
  },

  async createStage(stage: Omit<Stage, 'id'>): Promise<Stage | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/stages`, stage);
      return response.data;
    } catch (error) {
      console.error('Error creating stage:', error);
      return null;
    }
  },

  async updateStage(stageId: string, stage: Partial<Stage>): Promise<Stage | null> {
    try {
      const response = await axios.put(`${API_BASE_URL}/stages/${stageId}`, stage);
      return response.data;
    } catch (error) {
      console.error(`Error updating stage ${stageId}:`, error);
      return null;
    }
  },

  async deleteStage(stageId: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE_URL}/stages/${stageId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting stage ${stageId}:`, error);
      return false;
    }
  },

  async getStageProgress(prospectoId: string): Promise<StageProgress[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/prospectos/${prospectoId}/stages/progress`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stage progress for prospecto ${prospectoId}:`, error);
      return [];
    }
  },

  async updateStageProgress(
    prospectoId: string,
    stageId: string,
    progress: Partial<StageProgress>
  ): Promise<StageProgress | null> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/prospectos/${prospectoId}/stages/${stageId}/progress`,
        progress
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating stage progress:`, error);
      return null;
    }
  }
};