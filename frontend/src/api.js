import axios from 'axios';

// Kjo është adresa qendrore ku ndodhet Backend-i ynë
const API_BASE = 'http://localhost:5001';

// Krijojmë një instancë të axios (klient për HTTP kërkesa) për të mos shkruar adresën çdo herë
const api = axios.create({
    baseURL: API_BASE,
});

// --- INTERCEPTOR I KËRKESAVE (Request Interceptor) ---
// Për Profesorin: Kjo është si një "postbllok policie" që kontrollon çdo kërkesë PARA se të niset nga Frontend për në Backend.
// Pse e përdorim? Sepse në vend që t'i ngjisim Token-in manualisht në çdo API call (kemi 50+ të tilla),
// ky Interceptor e bën automatikisht për çdo kërkesë!
api.interceptors.request.use(
    (config) => {
        // 1. Marrim Token-in nga memori i shfletuesit (që e ruajtëm gjatë Login)
        const token = localStorage.getItem('token');
        if (token) {
            // 2. Ia ngjisim në "Kapak" (Header) në formatin "Bearer kodi..."
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config; // Lejon kërkesën të niset
    },
    (error) => Promise.reject(error)
);

// --- INTERCEPTOR I PËRGJIGJEVE ---
// Kjo logjikë ekzekutohet PASI marrim një përgjigje nga Backend-i
api.interceptors.response.use(
    (response) => response, // Nëse gjithçka është në rregull, e lë të kalojë
    (error) => {
        if (!error.response) {
            // Nëse nuk ka fare përgjigje, do të thotë që serveri (node server.js) është i fikur
            console.error('Backend nuk është i ndezur! Ndiz: cd Backend && node server.js');
            alert('⚠️ Nuk ka lidhje me serverin!\n\nHap terminalet dhe ndiz:\n1. cd Backend → node server.js\n2. cd frontend → npm start');
            return Promise.reject(error);
        }

        // 401 ose 403 do të thotë që tokeni ka skaduar ose përdoruesi është i paautorizuar
        if (error.response.status === 401 || error.response.status === 403) {
            console.warn('Token i pavlefshëm - ridrejtim te login');
            localStorage.clear(); // Fshijmë të dhënat e vjetra
            window.location.href = '/login'; // E kthejmë te faqja e hyrjes
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export { API_BASE };
export default api;
