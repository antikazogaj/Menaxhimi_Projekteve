import axios from 'axios';

// Kjo është adresa qendrore ku ndodhet Backend-i ynë
const API_BASE = 'http://localhost:5001';

// Krijojmë një instancë të axios (klient për HTTP kërkesa) për të mos shkruar adresën çdo herë
const api = axios.create({
    baseURL: API_BASE,
});

// --- INTERCEPTOR I KËRKESAVE ---
// Kjo logjikë ekzekutohet PARA se çdo kërkesë të niset drejt Backend-it
api.interceptors.request.use(
    (config) => {
        // Marrim token-in nga 'localStorage' i shfletuesit
        const token = localStorage.getItem('token');
        if (token) {
            // Ia bashkëngjisim kërkesës në mënyrë automatike
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
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
