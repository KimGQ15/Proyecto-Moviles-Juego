// src/service/RegistrarPuntajeService.ts
import { db } from "../config/firebaseConfig"; // ajusta la ruta si es necesario
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface PuntajeData {
  uid: string;
  puntaje: number;
  nombre: string;
}

export const registrarPuntajeGlobal = async ({ uid, puntaje, nombre }: PuntajeData) => {
  try {
    const docRef = await addDoc(collection(db, "puntuacionGlobal"), {
      uid,
      puntaje,
      nombre: nombre || null,
      timestamp: Timestamp.now(),
    });
    console.log("Puntaje registrado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al registrar el puntaje:", error);
  }
};
