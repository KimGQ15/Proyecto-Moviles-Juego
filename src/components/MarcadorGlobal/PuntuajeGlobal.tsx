// src/components/PuntuajeGlobal.tsx
import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar, 
  IonText, 
  IonSpinner,
  IonButton,
  useIonRouter
} from '@ionic/react';
import { obtenerTop5PuntajesGlobales } from '../../service/PuntuajeGlobalService';
import './PuntuajeGlobal.css';

const PuntuajeGlobal: React.FC = () => {
  const [topPuntajes, setTopPuntajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useIonRouter();

  useEffect(() => {
    const cargarPuntajes = async () => {
      try {
        const puntajes = await obtenerTop5PuntajesGlobales();
        setTopPuntajes(puntajes);
      } catch (error) {
        console.error('Error cargando puntajes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPuntajes();
  }, []);

  const handleVolver = () => {
    router.push('/', 'back');
  };

  return (
    <IonPage>
      <IonContent className="puntuaje-global-content">
        <div className="leaderboard-container">
          {loading ? (
            <div className="loading-spinner">
              <IonSpinner name="crescent" />
            </div>
          ) : (
            <>
              <div className="leaderboard-header">
                <IonText color="primary">
                  <h2>Top 5 Global</h2>
                </IonText>
              </div>
              
              <IonList className="leaderboard-list">
                {topPuntajes.map((jugador, index) => (
                  <IonItem key={jugador.uid} className="leaderboard-item">
                    <div slot="start" className="position-badge">
                      <span>{index + 1}</span>
                    </div>
                    <IonAvatar slot="start" className="player-avatar">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${jugador.nombre}&background=random&rounded=true`} 
                        alt={jugador.nombre} 
                      />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{jugador.nombre}</h2>
                      <p>Puntaje: {jugador.puntaje}</p>
                    </IonLabel>
                  </IonItem>
                ))}
                
                {topPuntajes.length === 0 && (
                  <IonItem>
                    <IonLabel className="no-results">
                      No hay puntajes registrados aún
                    </IonLabel>
                  </IonItem>
                )}
              </IonList>

              <div className="button-container">
                <IonButton 
                  expand="block" 
                  onClick={handleVolver}
                  className="back-button"
                >
                  Volver al Inicio
                </IonButton>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PuntuajeGlobal;