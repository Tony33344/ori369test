// Company data for ORI 369 / JB FIT d.o.o.
export const companyData = {
  // Legal entity
  legalName: "JB FIT, d.o.o.",
  tradeName: "ORI 369",
  
  // Address
  legalAddress: "Zvezna ulica 53, 2000 Maribor, Slovenia",
  businessAddress: "Ulica škofa Maksimilijana Držečnika 11, 2000 Maribor, Slovenia",
  
  // Tax & Registration
  taxNumber: "SI56107641",
  registrationNumber: "9357050000",
  vatPayer: true,
  
  // Bank details for UPN payments
  bank: {
    name: "NLB d.d.",
    iban: "SI56 0284 3026 4749 846",
    bic: "LJBASI2X",
  },
  
  // Contact
  email: "Info@ori369.com",
  ownerEmail: "jernej.babij@gmail.com",
  phones: ["051 302 206", "041 458 931"],
  
  // Social media
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61569699862375",
    instagram: "https://www.instagram.com/ori_backtolife",
  },
  
  // Google Maps
  googleMaps: {
    placeId: "ChIJrRC2dwB3bhMRyj09T40R3VY",
    url: "https://www.google.com/maps/place/Ori+369/@46.5598601,15.6478896,680m/data=!3m2!1e3!4b1!4m6!3m5!1s0x476f770077b610ad:0x56dd118d4f3d3dca!8m2!3d46.5598564!4d15.6504699!16s%2Fg%2F11x3988330",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2743.8!2d15.6478896!3d46.5598601!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476f770077b610ad%3A0x56dd118d4f3d3dca!2sOri%20369!5e0!3m2!1sen!2ssi!4v1702500000000!5m2!1sen!2ssi",
    coordinates: {
      lat: 46.5598564,
      lng: 15.6504699,
    },
  },
  
  // Business hours
  hours: {
    weekdays: "07:00–14:00 in 16:00–21:00",
    saturday: "08:00–14:00",
    sunday: "Zaprto",
  },
  
  // Shipping costs
  shipping: {
    post: 3.90, // EUR - Pošta Slovenije
    pickup: 0,  // Free pickup in shop
    payOnDelivery: 5.90, // EUR - Pay on delivery (povzetje)
  },
};

// UPN QR code generation helper
export interface UPNData {
  iban: string;
  amount: number;
  reference: string;
  purpose: string;
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
}

export function generateUPNReference(orderId: string): string {
  // SI model 00 - simple reference format
  // Format: SI00 + order ID (numeric part)
  const numericId = orderId.replace(/[^0-9]/g, '').slice(0, 12);
  return `SI00${numericId}`;
}

export function formatIBAN(iban: string): string {
  // Format IBAN with spaces for display
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export function generateUPNQRData(data: UPNData): string {
  // Generate UPN QR code data string according to Slovenian standard
  // Format: UPNQR\n[data fields separated by \n]
  const lines = [
    'UPNQR',
    '', // IBAN payer (empty for incoming payment)
    '', // Payer deposit (empty)
    '', // Payer withdraw (empty)
    '', // Payer name (empty)
    '', // Payer address (empty)
    '', // Payer city (empty)
    formatAmount(data.amount), // Amount
    '', // Date (empty = immediate)
    'OTHR', // Purpose code
    data.purpose, // Purpose description
    '', // Due date (empty)
    data.iban.replace(/\s/g, ''), // Recipient IBAN (no spaces)
    data.reference, // Reference
    data.recipientName,
    data.recipientAddress,
    data.recipientCity,
  ];
  
  return lines.join('\n');
}

function formatAmount(amount: number): string {
  // Format amount as required by UPN QR (no decimals, in cents)
  return Math.round(amount * 100).toString().padStart(11, '0');
}
