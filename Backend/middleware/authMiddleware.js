const jwt = require('jsonwebtoken');

// Ky funksion kontrollon nëse përdoruesi ka një 'Token' të vlefshëm përpara se ta lejojë të marrë të dhëna
const verifyToken = (req, res, next) => {
    // Marrim token-in nga 'Headers' i kërkesës që vjen nga Frontend
    let token = req.headers['authorization'];

    // Nëse s'ka fare token, i ndalojmë qasjen
    if (!token) return res.status(403).json({ message: "Nuk ka token!" });

    // Formatimi standard është "Bearer <token_kodi>", kështu që heqim fjalën "Bearer " për të mbajtur vetëm kodin
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trim();
    }

    try {
        // Dekodifikojmë token-in duke përdorur fjalëkalimin tonë sekret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ruajmë të dhënat e përdoruesit (si ID-ja e tij) për t'i përdorur në kërkesat në vazhdim
        req.user = decoded;
        next(); // Lejon vazhdimin te funksioni i radhës (Route)
    } catch (err) {
        // Nëse tokeni është manipuluar ose ka skaduar
        return res.status(401).json({ message: "Token i pavlefshëm!" });
    }
};

module.exports = verifyToken;
