const jwt = require('jsonwebtoken');

// -----------------------------------------------------------------------------
// ÇFARË ËSHTË KY SKEDAR (Për Profesorin):
// Ky quhet "Middleware" (Një urë lidhëse). Detyra e tij është të mbrojë API-në.
// Ai ekzekutohet PARA se përdoruesi të arrijë tek të dhënat. 
// Nëse ai nuk ka një "Token" të vlefshëm (që vërteton se është bërë log-in),
// ne e bllokojmë këtu dhe nuk e lëmë të kalojë më tej.
// Kjo parandalon hakerat ose njerëzit e pa-autorizuar të shohin detyrat/projektet.
// -----------------------------------------------------------------------------

const verifyToken = (req, res, next) => {
    // 1. Përdoruesi e dërgon Token-in përmes kokës së kërkesës (Headers).
    // Ne e marrim atë nga req.headers['authorization'].
    let token = req.headers['authorization'];

    // 2. Nëse nuk ka asnjë token, i kthejmë statusin 403 (E Ndaluar).
    // Pse? Sepse ai s'ka leje të hyjë pa "çelës".
    if (!token) return res.status(403).json({ message: "Nuk ka token! Qasja u refuzua." });

    // 3. Shpesh herë tokeni vjen në formatin: "Bearer fsfjlk23..." 
    // Fjala "Bearer" është një standard botëror i uebit që tregon "Mbajtësi i këtij tokeni".
    // Ne i fshijmë 7 karakteret e para ("Bearer ") për të marrë vetëm kodin e pastër.
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trim();
    }

    try {
        // 4. Provon të deshifrojë (dekodojë) tokenin.
        // jwt.verify() merr tokenin e klientit dhe fjalëkalimin tonë sekret (nga .env).
        // Nëse fjalëkalimi përputhet dhe tokeni s'ka skaduar, ai na kthen të dhënat e përdoruesit.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Ne e ruajmë ID-në e përdoruesit tek "req.user". 
        // Pse? Që funksionet e tjera (psh. krijimi i një detyre) ta dinë se KUSH po e krijon atë.
        req.user = decoded;
        
        // 6. next() është thelbësore! I thotë Express-it: "Gjithçka është në rregull, lejoje përdoruesin të kalojë".
        next(); 
    } catch (err) {
        // 7. Nëse kodi hidhet këtu (catch), do të thotë që tokeni ishte fals ose i ka ikur koha (ka skaduar).
        // I kthejmë statusin 401 (I Paautorizuar).
        return res.status(401).json({ message: "Token i pavlefshëm ose ka skaduar!" });
    }
};

module.exports = verifyToken;
