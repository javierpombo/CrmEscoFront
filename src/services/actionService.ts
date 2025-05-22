import axios from 'axios';
import { Action, ActionStatus, ApprovalStatus, EmailActionDetails } from '../types/Action';
import { API_BASE_URL } from '../config/constants';

export const actionService = {
  async getActions(prospectoId: string): Promise<Action[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/prospectos/${prospectoId}/actions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actions:', error);
      return [];
    }
  },

  async createAction(prospectoId: string, action: Omit<Action, 'id'>): Promise<Action | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/prospectos/${prospectoId}/actions`, action);
      return response.data;
    } catch (error) {
      console.error('Error creating action:', error);
      return null;
    }
  },

  async updateAction(actionId: string, action: Partial<Action>): Promise<Action | null> {
    try {
      const response = await axios.put(`${API_BASE_URL}/actions/${actionId}`, action);
      return response.data;
    } catch (error) {
      console.error(`Error updating action ${actionId}:`, error);
      return null;
    }
  },

  async approveAction(actionId: string, approved: boolean, comments?: string): Promise<Action | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/actions/${actionId}/approve`, {
        approved,
        comments
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving action ${actionId}:`, error);
      return null;
    }
  },

  async sendEmail(actionId: string, emailDetails: EmailActionDetails): Promise<boolean> {
    try {
      await axios.post(`${API_BASE_URL}/actions/${actionId}/send-email`, emailDetails);
      return true;
    } catch (error) {
      console.error(`Error sending email for action ${actionId}:`, error);
      return false;
    }
  }
};