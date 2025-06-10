
export const useWhatsApp = () => {
  const generateWhatsAppUrl = (phoneNumber: string, message: string) => {
    // Remove any non-numeric characters from phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Argentina +54)
    const formattedPhone = cleanPhone.startsWith('54') ? cleanPhone : `54${cleanPhone}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  };

  const generateCargoWhatsAppMessage = (carga: any, isForTransporter = false) => {
    const baseUrl = window.location.origin;
    const cargoLink = `${baseUrl}/ver-carga/${carga.id}`;
    
    if (isForTransporter) {
      return `¡Hola! Me interesa tu carga de ${carga.origen} a ${carga.destino}. Puedes ver los detalles aquí: ${cargoLink}`;
    } else {
      return `¡Hola! Soy el dador de carga ${carga.origen} - ${carga.destino}. Te contacto por tu postulación. Detalles: ${cargoLink}`;
    }
  };

  const openWhatsApp = (phoneNumber: string, message: string) => {
    const url = generateWhatsAppUrl(phoneNumber, message);
    window.open(url, '_blank');
  };

  return {
    generateWhatsAppUrl,
    generateCargoWhatsAppMessage,
    openWhatsApp
  };
};
