import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from "@ionic/react";
import { crearReto } from "../../service/retoService";
import { useAuth } from "../../context/AuthContext";
import { getFirestore, collection, getDocs, getDoc, doc } from "firebase/firestore";
import { enviarNotificacionPush } from "../../service/notification";
import { useLocation, useHistory } from "react-router-dom";

interface Usuario {
  uid: string;
  correo: string;
}

const EnviarReto: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation<{ puntaje: number }>();
  const history = useHistory();
  const puntajeActual = location.state?.puntaje ?? 0;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [receptorUid, setReceptorUid] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastError, setToastError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUsuarios = async () => {
      try {
        const db = getFirestore();
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        const lista: Usuario[] = [];
        usuariosSnapshot.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== user.uid && data.correo) {
            lista.push({
              uid: doc.id,
              correo: data.correo,
            });
          }
        });

        setUsuarios(lista);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        setToastError("Error al cargar usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [user]);

  const handleEnviarReto = async () => {
    if (!receptorUid || !user) return;

    try {
      await crearReto(user.uid, receptorUid, puntajeActual);
      setShowToast(true);
      setReceptorUid("");

      const db = getFirestore();
      const receptorDocRef = doc(db, "usuarios", receptorUid);
      const receptorDoc = await getDoc(receptorDocRef);

      if (!receptorDoc.exists()) {
        throw new Error("Usuario receptor no encontrado.");
      }

      const receptorData = receptorDoc.data();
      const token = receptorData?.tokenDispositivo;

      if (!token) {
        console.warn("El usuario no tiene un token registrado.");
        return;
      }

      await enviarNotificacionPush({
        token,
        title: "Nuevo reto recibido",
        body: `${user.displayName || "Un jugador"} te ha retado con ${puntajeActual} puntos.`,
        data: {
          tipo: "reto",
          emisorUid: user.uid,
        },
      });
    } catch (error) {
      console.error("Error al enviar reto:", error);
      setToastError("Hubo un error al enviar el reto.");
    }
  };

  return (
    <IonPage className="EnviarReto">
      <IonContent className="ion-padding">
        <IonCard className="enviar-reto-card">
          <IonCardHeader>
            <IonCardTitle style={{ textAlign: 'center' }}>Selecciona un amigo</IonCardTitle>
            <IonCardSubtitle style={{ textAlign: 'center' }}>Elige a quien retar</IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <>
                <IonItem className="select-item">
                  <IonSelect
                    placeholder="Selecciona un amigo"
                    value={receptorUid}
                    onIonChange={(e) => setReceptorUid(e.detail.value)}
                  >
                    {usuarios.map((u) => (
                      <IonSelectOption key={u.uid} value={u.uid}>
                        {u.correo || u.uid}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonText>
                  <p className="puntaje-text">
                    Puntaje del reto: <strong>{puntajeActual}</strong>
                  </p>
                </IonText>

                <div className="buttons-container">
                  <IonButton 
                    expand="block" 
                    onClick={handleEnviarReto} 
                    disabled={!receptorUid}
                    className="enviar-button"
                  >
                    ENVIAR RETO
                  </IonButton>
                  
                  <IonButton 
                    expand="block" 
                    onClick={() => history.goBack()}
                    fill="outline"
                    className="back-button"
                  >
                    REGRESAR
                  </IonButton>
                </div>
              </>
            )}
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Reto enviado exitosamente."
          duration={2000}
          color="success"
        />

        <IonToast
          isOpen={!!toastError}
          onDidDismiss={() => setToastError("")}
          message={toastError}
          duration={2500}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default EnviarReto;