import { getUsers } from './apiService';

// Función para obtener el nombre del usuario a partir de su ID
export const getUserNameById = async (userId: string | number): Promise<string> => {
    console.log("userId")
  if (!userId) return "Desconocido";

  try {
    const users = await getUsers();
    console.log("hola")
    const user = users.find(user => user.id === userId);
    return user ? user.label : "Desconocido";
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return "Error al cargar";
  }
};
