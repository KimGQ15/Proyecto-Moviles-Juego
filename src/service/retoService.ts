import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

// Interfaz para un reto
export interface Reto {
  id: string;
  emisorUid: string;
  receptorUid: string;
  puntajeEmisor: number;
  puntajeReceptor?: number;
  estado: "pendiente" | "finalizado";
  fecha: Date;
}

// Crear un nuevo reto
export async function crearReto(
  emisorUid: string,
  receptorUid: string,
  puntajeEmisor: number
): Promise<void> {
  try {
    await addDoc(collection(db, "retos"), {
      emisorUid,
      receptorUid,
      puntajeEmisor,
      estado: "pendiente",
      fecha: new Date(),
    });
    console.log("Reto enviado con éxito");
  } catch (error) {
    console.error("Error al crear el reto:", error);
  }
}

// Obtener retos recibidos pendientes
export async function obtenerRetosPendientes(uid: string): Promise<Reto[]> {
  try {
    const q = query(
      collection(db, "retos"),
      where("receptorUid", "==", uid),
      where("estado", "==", "pendiente")
    );

    const snapshot = await getDocs(q);

    const retos: Reto[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Reto, "id">),
    }));

    return retos;
  } catch (error) {
    console.error("Error al obtener retos:", error);
    return [];
  }
}

// Aceptar reto
export async function aceptarReto(
  retoId: string,
  puntajeReceptor: number
): Promise<void> {
  try {
    const retoRef = doc(db, "retos", retoId);
    await updateDoc(retoRef, {
      puntajeReceptor,
      estado: "finalizado",
    });
    console.log("Reto aceptado y finalizado");
  } catch (error) {
    console.error("Error al aceptar reto:", error);
  }
}

// Obtener historial de retos 
export async function obtenerHistorial(uid: string): Promise<Reto[]> {
  try {
    const q = query(
      collection(db, "retos"),
      where("estado", "==", "finalizado")
    );
    const snapshot = await getDocs(q);

    const retos: Reto[] = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Reto, "id">),
      }))
      .filter(
        (reto) => reto.emisorUid === uid || reto.receptorUid === uid
      );

    return retos;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return [];
  }
}
