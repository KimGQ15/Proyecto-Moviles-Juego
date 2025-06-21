export const enviarNotificacionPush = async ({
  token,
  title,
  body,
  data = {},
}: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  try {
    const response = await fetch("http://192.168.0.8:3000/api/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, title, body, data }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
  } catch (error) {
    console.error("❌ Error al enviar notificación push:", error);
  }
};
