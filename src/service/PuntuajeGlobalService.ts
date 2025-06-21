// src/service/PuntuajeGlobalService.ts
import { db } from "../config/firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface PuntajeGlobal {
  uid: string;
  puntaje: number;
  nombre: string;
  timestamp: any; // Puedes usar firestore.Timestamp o Date según prefieras
}

export const obtenerTop5PuntajesGlobales = async (): Promise<PuntajeGlobal[]> => {
  try {
    const q = query(
      collection(db, "puntuacionGlobal"),
      orderBy("puntaje", "desc"),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    const topPuntajes: PuntajeGlobal[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      topPuntajes.push({
        uid: data.uid,
        puntaje: data.puntaje,
        nombre: data.nombre || "Anónimo",
        timestamp: data.timestamp
      });
    });
    
    return topPuntajes;
  } catch (error) {
    console.error("Error al obtener los puntajes globales:", error);
    return [];
  }
};