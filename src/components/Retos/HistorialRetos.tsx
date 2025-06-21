import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonAvatar,
  IonText,
  IonBadge,
  IonSpinner,
  IonIcon
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { obtenerHistorial } from "../../service/retoService";
import { useAuth } from "../../context/AuthContext";
import { trophy } from "ionicons/icons";
import "./HistorialRetos.css";

const HistorialRetos: React.FC = () => {
  const { user } = useAuth();
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    if (user) {
      obtenerHistorial(user.uid)
        .then(setHistorial)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'completado': return 'success';
      case 'pendiente': return 'warning';
      case 'rechazado': return 'danger';
      default: return 'medium';
    }
  };

  return (
    <IonPage>
      <IonContent className="historial-content">
        <div className="historial-container">
          
          <IonText color="light">
            <h2 className="historial-title">Historial de Retos</h2>
          </IonText>

          {loading ? (
            <div className="loading-spinner">
              <IonSpinner name="crescent" />
            </div>
          ) : (
            <IonList className="historial-list">
              {historial.length === 0 ? (
                <IonItem className="empty-item">
                  <IonLabel className="empty-label">
                    No hay retos en tu historial
                  </IonLabel>
                  <IonIcon icon={trophy} slot="end" className="empty-icon" />
                </IonItem>
              ) : (
                historial.map((reto) => (
                  <IonItem key={reto.id} className="historial-item">
                    <IonAvatar slot="start" className="user-avatar">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${reto.emisorUid}&background=random&rounded=true`} 
                        alt={reto.emisorUid} 
                      />
                    </IonAvatar>
                    <IonLabel className="historial-label">
                      <h3>{reto.emisorUid}</h3>
                      <p>vs {reto.receptorUid}</p>
                      <div className="score-container">
                        <span>{reto.puntajeEmisor}</span>
                        <span className="score-separator">-</span>
                        <span>{reto.puntajeReceptor ?? "N/A"}</span>
                      </div>
                    </IonLabel>
                    <IonBadge 
                      slot="end" 
                      color={getEstadoColor(reto.estado)}
                      className="status-badge"
                    >
                      {reto.estado}
                    </IonBadge>
                  </IonItem>
                ))
              )}
            </IonList>
          )}

          <div className="button-container">
            <IonButton 
              expand="block" 
              onClick={() => history.push("/")}
              className="back-button"
            >
              Volver al Home
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HistorialRetos;