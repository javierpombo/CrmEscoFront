// src/services/apiService.ts
import axios from 'axios';
import { OptionType } from '../components/AsyncSelect/AsyncSelect';
import { API_BASE_URL } from '../config/constants'; /* Es la URL de la api */

// Por ejemplo, para obtener usuarios:
export const getUsers = async (): Promise<OptionType[]> => {
  try {
    // Aquí usas la URL base configurada en un .env o en una constante
    const response = await axios.get(`${API_BASE_URL}/users`);
    // Suponemos que el endpoint devuelve un arreglo de objetos { id, name }
    // Mapeamos para que encajen con OptionType (id y label)
    return response.data.map((user: any) => ({
      id: user.id,
      label: user.name,
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

