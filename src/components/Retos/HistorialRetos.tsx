// src/components/Retos/HistorialRetos.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { obtenerHistorial } from "../../service/retoService";
import { useAuth } from "../../context/AuthContext";
const HistorialRetos: React.FC = () => {
  const { user } = useAuth();
  const [historial, setHistorial] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    if (user) {
      obtenerHistorial(user.uid).then(setHistorial);
    }
  }, [user]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Historial de Retos</h2>
        <IonList>
          {historial.map((reto) => (
            <IonItem key={reto.id}>
              <IonLabel>
                <p>De: {reto.emisorUid}</p>
                <p>Para: {reto.receptorUid}</p>
                <p>
                  Puntajes: {reto.puntajeEmisor} - {reto.puntajeReceptor ?? "Sin jugar"}
                </p>
                <p>Estado: {reto.estado}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonButton expand="block" onClick={() => history.push("/")}>
          Volver al Home
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default HistorialRetos;
