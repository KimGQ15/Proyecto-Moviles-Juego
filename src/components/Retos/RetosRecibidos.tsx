import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import { obtenerRetosPendientes, aceptarReto } from "../../service/retoService";
import { useAuth } from "../../context/AuthContext";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { enviarNotificacionPush } from "../../service/notification";
import { useHistory } from "react-router-dom";
const RetosRecibidos: React.FC = () => {
  const { user } = useAuth();
  const [retos, setRetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [toastError, setToastError] = useState("");

  useEffect(() => {
    const fetchRetos = async () => {
      try {
        if (user) {
          const data = await obtenerRetosPendientes(user.uid);
          setRetos(data);
        }
      } catch (error) {
        console.error("Error al obtener retos pendientes:", error);
        setToastError("Error al cargar retos.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetos();
  }, [user]);

 const history = useHistory();

const handleAceptar = async (retoId: string) => {
  const reto = retos.find((r) => r.id === retoId);

  if (!reto) {
    setToastError("Reto no encontrado.");
    return;
  }

  history.push("/jugar", { retoId }); 
}

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2>Retos Recibidos</h2>

        {loading ? (
          <IonSpinner name="crescent" />
        ) : (
          <IonList>
            {retos.length === 0 ? (
              <IonItem>
                <IonLabel>No tienes retos pendientes.</IonLabel>
              </IonItem>
            ) : (
              retos.map((reto) => (
                <IonItem key={reto.id}>
                  <IonLabel>
                    <p>De: {reto.emisorUid}</p>
                    <p>Puntaje: {reto.puntajeEmisor}</p>
                  </IonLabel>
                  <IonButton onClick={() => handleAceptar(reto.id)}>Aceptar</IonButton>
                </IonItem>
              ))
            )}
          </IonList>
        )}

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg("")}
          color="success"
        />

        <IonToast
          isOpen={!!toastError}
          message={toastError}
          duration={2500}
          onDidDismiss={() => setToastError("")}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default RetosRecibidos;
