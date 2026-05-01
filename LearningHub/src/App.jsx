 import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
} from "firebase/firestore";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
} from "firebase/auth";

const CLOUD_NAME = "diu45f6nj";
const UPLOAD_PRESET = "learninghub_upload";

export default function App() {
const [user, setUser] = useState(null);
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authMessage, setAuthMessage] = useState("");

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [price, setPrice] = useState("");
const [category, setCategory] = useState("Mathematik");
const [file, setFile] = useState(null);

const [items, setItems] = useState([]);
const [errors, setErrors] = useState({});
const [successMessage, setSuccessMessage] = useState("");
const [isUploading, setIsUploading] = useState(false);
const [hoveredId, setHoveredId] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);

const [search, setSearch] = useState("");
const [filterCategory, setFilterCategory] = useState("Alle");
const [sortOrder, setSortOrder] = useState("neu");

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
setUser(currentUser);
});

return () => unsubscribe();
}, []);

useEffect(() => {
loadItems();
}, []);

async function loadItems() {
try {
const querySnapshot = await getDocs(collection(db, "items"));
const data = querySnapshot.docs.map((document) => ({
id: document.id,
...document.data(),
}));
setItems(data);
} catch (error) {
console.error("Fehler beim Laden:", error);
}
}

async function handleRegister() {
try {
await createUserWithEmailAndPassword(auth, authEmail, authPassword);
setAuthMessage("✅ Konto erfolgreich erstellt.");
setAuthEmail("");
setAuthPassword("");
} catch (error) {
setAuthMessage("❌ Registrierung fehlgeschlagen.");
console.error(error);
}
}

async function handleLogin() {
try {
await signInWithEmailAndPassword(auth, authEmail, authPassword);
setAuthMessage("✅ Erfolgreich angemeldet.");
setAuthEmail("");
setAuthPassword("");
} catch (error) {
setAuthMessage("❌ Anmeldung fehlgeschlagen.");
console.error(error);
}
}

async function handleLogout() {
await signOut(auth);
setAuthMessage("Sie wurden abgemeldet.");
}

async function uploadFileToCloudinary(fileToUpload) {
if (!fileToUpload) {
return { fileUrl: null, fileName: null, fileType: null };
}

const formData = new FormData();
formData.append("file", fileToUpload);
formData.append("upload_preset", UPLOAD_PRESET);

const response = await fetch(
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
{
method: "POST",
body: formData,
}
);

const data = await response.json();

if (!data.secure_url) {
console.error(data);
throw new Error("Cloudinary Upload fehlgeschlagen");
}

return {
fileUrl: data.secure_url,
fileName: fileToUpload.name,
fileType: fileToUpload.type,
};
}

const wordCount =
description.trim() === "" ? 0 : description.trim().split(/\s+/).length;

const formIsValid =
user &&
title.trim() !== "" &&
description.trim() !== "" &&
Number(price) > 0 &&
!isUploading;

const favoriteCount = items.filter((item) => item.favorite).length;
const myItems = user ? items.filter((item) => item.ownerId === user.uid) : [];

const filteredItems = items
.filter((item) => {
const searchText = search.toLowerCase();
const person = item.ownerEmail || "";

const matchesSearch =
item.title?.toLowerCase().includes(searchText) ||
item.description?.toLowerCase().includes(searchText) ||
person.toLowerCase().includes(searchText);

const matchesCategory =
filterCategory === "Alle" || item.category === filterCategory;

return matchesSearch && matchesCategory;
})
.sort((a, b) => {
if (sortOrder === "preis-auf") return Number(a.price) - Number(b.price);
if (sortOrder === "preis-ab") return Number(b.price) - Number(a.price);
if (sortOrder === "favoriten")
return Number(b.favorite) - Number(a.favorite);
if (sortOrder === "bewertung")
return Number(b.rating || 0) - Number(a.rating || 0);
return Number(b.createdAt || 0) - Number(a.createdAt || 0);
});

function formatPrice(value) {
return new Intl.NumberFormat("de-DE", {
style: "currency",
currency: "EUR",
}).format(Number(value));
}

async function handleAdd() {
const newErrors = {};

if (!user) newErrors.user = "Bitte zuerst einloggen.";
if (!title.trim()) newErrors.title = "Bitte einen Titel eingeben.";
if (!description.trim())
newErrors.description = "Bitte eine Beschreibung eingeben.";
if (!price) newErrors.price = "Bitte einen Preis eingeben.";
if (Number(price) <= 0)
newErrors.price = "Der Preis muss größer als 0 sein.";

setErrors(newErrors);

if (Object.keys(newErrors).length > 0) return;

setIsUploading(true);

try {
const uploadedFile = await uploadFileToCloudinary(file);

await addDoc(collection(db, "items"), {
ownerId: user.uid,
ownerEmail: user.email,
title,
description,
price: Number(price),
category,
fileUrl: uploadedFile.fileUrl,
fileName: uploadedFile.fileName,
fileType: uploadedFile.fileType,
favorite: false,
rating: 0,
createdAt: Date.now(),
});

setTitle("");
setDescription("");
setPrice("");
setCategory("Mathematik");
setFile(null);
setErrors({});
setSuccessMessage("✅ Lernblatt erfolgreich gespeichert.");

await loadItems();

setTimeout(() => setSuccessMessage(""), 3000);
} catch (error) {
console.error("Fehler beim Speichern:", error);
setSuccessMessage("❌ Fehler beim Speichern oder Hochladen.");
} finally {
setIsUploading(false);
}
}

async function handleDelete(id) {
const item = items.find((entry) => entry.id === id);

if (!user || item?.ownerId !== user.uid) {
alert("Sie können nur eigene Lernblätter löschen.");
return;
}

try {
await deleteDoc(doc(db, "items", id));
await loadItems();

if (selectedItem?.id === id) {
setSelectedItem(null);
}
} catch (error) {
console.error("Fehler beim Löschen:", error);
}
}

async function toggleFavorite(id) {
const item = items.find((entry) => entry.id === id);
if (!item) return;

await updateDoc(doc(db, "items", id), {
favorite: !item.favorite,
});

await loadItems();
}

async function setRating(id, ratingValue) {
await updateDoc(doc(db, "items", id), {
rating: ratingValue,
});

await loadItems();
}

function getFileLabel(item) {
if (!item.fileName) return "Datei";
const name = item.fileName.toLowerCase();

if (name.endsWith(".pdf")) return "PDF-Datei";
if (name.endsWith(".doc") || name.endsWith(".docx")) return "Word-Datei";
if (
name.endsWith(".jpg") ||
name.endsWith(".jpeg") ||
name.endsWith(".png") ||
name.endsWith(".webp")
)
return "Bild-Datei";

return "Datei";
}

function renderFilePreview(item, large = false) {
if (!item.fileUrl) return null;

if (item.fileType?.startsWith("image")) {
return (
<img
src={item.fileUrl}
alt="Lernblatt Vorschau"
style={{
width: "100%",
height: large ? 300 : 130,
objectFit: "cover",
borderRadius: 12,
marginBottom: 12,
background: "#f1f5f9",
}}
/>
);
}

return (
<div style={fileBoxStyle}>
<div style={{ fontSize: large ? 42 : 28, marginBottom: 8 }}>📄</div>

<div style={{ fontWeight: "bold", marginBottom: 6 }}>
{getFileLabel(item)}
</div>

<div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
{item.fileName || "Datei"}
</div>

<a
href={item.fileUrl}
target="_blank"
rel="noreferrer"
style={fileLinkStyle}
>
Datei öffnen
</a>

{(item.fileName?.toLowerCase().endsWith(".doc") ||
item.fileName?.toLowerCase().endsWith(".docx")) && (
<p style={{ ...smallTextStyle, marginTop: 10 }}>
Hinweis: Word-Dateien können sich zuerst über Microsoft Office
Online öffnen.
</p>
)}
</div>
);
}

return (
<div style={pageStyle}>
<aside style={{ width: "28%" }}>
<h1 style={logoStyle}>LearningHub</h1>

<p style={subtitleStyle}>
Lernblätter hochladen, anbieten und testen
</p>

<section style={sideBoxStyle}>
<h3>Benutzerbereich</h3>

{user ? (
<>
<p>
Eingeloggt als:
<br />
<strong>{user.email}</strong>
</p>

<p style={smallTextStyle}>Eigene Lernblätter: {myItems.length}</p>

<button onClick={handleLogout} style={secondaryButtonStyle}>
Abmelden
</button>
</>
) : (
<>
<input
placeholder="E-Mail"
value={authEmail}
onChange={(e) => setAuthEmail(e.target.value)}
style={inputStyle}
/>

<input
type="password"
placeholder="Passwort"
value={authPassword}
onChange={(e) => setAuthPassword(e.target.value)}
style={inputStyle}
/>

<button onClick={handleLogin} style={mainSmallButtonStyle}>
Einloggen
</button>

<button
onClick={handleRegister}
style={{ ...secondaryButtonStyle, marginTop: 8 }}
>
Registrieren
</button>

{authMessage && <p style={smallTextStyle}>{authMessage}</p>}
{errors.user && <p style={errorStyle}>{errors.user}</p>}
</>
)}
</section>
</aside>

<main style={panelStyle}>
<h2 style={{ marginTop: 0 }}>Lernblatt hochladen</h2>

{successMessage && <p style={successStyle}>{successMessage}</p>}

{!user && (
<p style={infoStyle}>
Bitte melden Sie sich zuerst mit E-Mail und Passwort an.
</p>
)}

<input
placeholder="Titel"
value={title}
onChange={(e) => {
setTitle(e.target.value);
setErrors((prev) => ({ ...prev, title: "" }));
}}
style={{
...inputStyle,
border: errors.title ? "1px solid #dc2626" : "1px solid #ddd",
}}
/>
{errors.title && <p style={errorStyle}>{errors.title}</p>}

<textarea
placeholder="Beschreibung (max. 100 Wörter)"
value={description}
onChange={(e) => {
const text = e.target.value;
const words = text.trim() === "" ? [] : text.trim().split(/\s+/);

if (words.length <= 100) {
setDescription(text);
setErrors((prev) => ({ ...prev, description: "" }));
}
}}
style={{
...inputStyle,
minHeight: 90,
resize: "none",
border: errors.description
? "1px solid #dc2626"
: "1px solid #ddd",
}}
/>

<p style={smallTextStyle}>{wordCount} / 100 Wörter</p>
{errors.description && <p style={errorStyle}>{errors.description}</p>}

<input
type="number"
min="0.01"
step="0.01"
placeholder="Preis (€)"
value={price}
onChange={(e) => {
setPrice(e.target.value);
setErrors((prev) => ({ ...prev, price: "" }));
}}
style={{
...inputStyle,
border: errors.price ? "1px solid #dc2626" : "1px solid #ddd",
}}
/>
{errors.price && <p style={errorStyle}>{errors.price}</p>}

<select
value={category}
onChange={(e) => setCategory(e.target.value)}
style={inputStyle}
>
<option>Mathematik</option>
<option>Biologie</option>
<option>Deutsch</option>
<option>Geschichte</option>
<option>Englisch</option>
<option>Physik</option>
<option>Chemie</option>
</select>

<input
type="file"
accept="image/*,.pdf,.doc,.docx"
onChange={(e) => setFile(e.target.files[0])}
style={{ display: "block", marginBottom: 16 }}
/>

<button
onClick={handleAdd}
disabled={!formIsValid}
style={{
...mainButtonStyle,
background: formIsValid ? "#2563eb" : "#94a3b8",
cursor: formIsValid ? "pointer" : "not-allowed",
}}
>
{isUploading ? "Wird gespeichert..." : "Lernblatt speichern"}
</button>
</main>

<section
style={{
...panelStyle,
width: "40%",
maxHeight: "85vh",
overflowY: "auto",
}}
>
<h2 style={{ marginTop: 0 }}>Marktplatz</h2>

<input
placeholder="Lernblatt, Fach oder Anbieterin suchen..."
value={search}
onChange={(e) => setSearch(e.target.value)}
style={inputStyle}
/>

<select
value={filterCategory}
onChange={(e) => setFilterCategory(e.target.value)}
style={inputStyle}
>
<option>Alle</option>
<option>Mathematik</option>
<option>Biologie</option>
<option>Deutsch</option>
<option>Geschichte</option>
<option>Englisch</option>
<option>Physik</option>
<option>Chemie</option>
</select>

<select
value={sortOrder}
onChange={(e) => setSortOrder(e.target.value)}
style={inputStyle}
>
<option value="neu">Neueste zuerst</option>
<option value="preis-auf">Preis aufsteigend</option>
<option value="preis-ab">Preis absteigend</option>
<option value="favoriten">Favoriten zuerst</option>
<option value="bewertung">Beste Bewertung zuerst</option>
</select>

<p style={smallTextStyle}>
Gefundene Lernblätter: {filteredItems.length} | Favoriten:{" "}
{favoriteCount}
</p>

{items.length === 0 && (
<div style={emptyStateStyle}>
<div style={{ fontSize: 36 }}>📚</div>
<h3>Noch keine Lernblätter vorhanden</h3>
<p>Erstellen Sie links Ihr erstes Lernblatt.</p>
</div>
)}

{items.length > 0 && filteredItems.length === 0 && (
<div style={emptyStateStyle}>
<div style={{ fontSize: 36 }}>🔍</div>
<h3>Keine passenden Ergebnisse</h3>
<p>Bitte ändern Sie Suche oder Filter.</p>
</div>
)}

<div style={gridStyle}>
{filteredItems.map((item) => (
<article
key={item.id}
onMouseEnter={() => setHoveredId(item.id)}
onMouseLeave={() => setHoveredId(null)}
style={{
...cardStyle,
boxShadow:
hoveredId === item.id
? "0 10px 24px rgba(0,0,0,0.14)"
: "0 4px 14px rgba(0,0,0,0.08)",
transform: hoveredId === item.id ? "translateY(-4px)" : "none",
}}
>
{renderFilePreview(item)}

<div style={categoryStyle}>{item.category}</div>

<button
onClick={() => toggleFavorite(item.id)}
style={favoriteButtonStyle}
>
{item.favorite ? "❤️" : "🤍"}
</button>

<h3 style={{ marginTop: 0, marginBottom: 8 }}>{item.title}</h3>

<p style={descriptionTextStyle}>{item.description}</p>

<p style={smallTextStyle}>
Von: <strong>{item.ownerEmail || "Unbekannt"}</strong>
</p>

<div style={{ marginBottom: 10 }}>
{[1, 2, 3, 4, 5].map((star) => (
<button
key={star}
onClick={() => setRating(item.id, star)}
style={{
border: "none",
background: "transparent",
cursor: "pointer",
fontSize: 20,
color: star <= (item.rating || 0) ? "#f59e0b" : "#cbd5e1",
}}
>
★
</button>
))}
</div>

<strong style={priceStyle}>{formatPrice(item.price)}</strong>

<div style={{ display: "flex", gap: 8 }}>
<button
onClick={() => setSelectedItem(item)}
style={detailButtonStyle}
>
Details
</button>

<button
onClick={() => alert("Kauf simuliert")}
style={buyButtonStyle}
>
Kaufen
</button>

{user && item.ownerId === user.uid && (
<button
onClick={() => handleDelete(item.id)}
style={deleteButtonStyle}
>
Löschen
</button>
)}
</div>
</article>
))}
</div>
</section>

{selectedItem && (
<div style={modalOverlayStyle}>
<div style={modalStyle}>
<button
onClick={() => setSelectedItem(null)}
style={closeButtonStyle}
>
×
</button>

{renderFilePreview(selectedItem, true)}

<div style={categoryStyle}>{selectedItem.category}</div>

<h2>{selectedItem.title}</h2>

<p style={{ color: "#475569", lineHeight: 1.7 }}>
{selectedItem.description}
</p>

<p style={smallTextStyle}>
Anbieterin oder Anbieter:{" "}
<strong>{selectedItem.ownerEmail || "Unbekannt"}</strong>
</p>

<p style={{ fontSize: 24, fontWeight: "bold" }}>
{formatPrice(selectedItem.price)}
</p>

<button
onClick={() => alert("Kauf simuliert")}
style={buyLargeButtonStyle}
>
Kaufen
</button>
</div>
</div>
)}
</div>
);
}

const pageStyle = {
display: "flex",
gap: 40,
padding: 50,
maxWidth: 1300,
margin: "0 auto",
background: "#f8fafc",
minHeight: "100vh",
fontFamily: "Arial, sans-serif",
};

const logoStyle = {
fontSize: 52,
marginTop: 20,
marginBottom: 10,
};

const subtitleStyle = {
color: "#64748b",
fontSize: 18,
marginTop: 20,
lineHeight: 1.5,
};

const panelStyle = {
width: "32%",
background: "#ffffff",
padding: 25,
borderRadius: 18,
boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const sideBoxStyle = {
marginTop: 30,
background: "#ffffff",
padding: 20,
borderRadius: 18,
boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const inputStyle = {
display: "block",
marginBottom: 8,
padding: 12,
width: "100%",
boxSizing: "border-box",
borderRadius: 10,
border: "1px solid #ddd",
outline: "none",
};

const smallTextStyle = {
color: "#64748b",
fontSize: 14,
};

const errorStyle = {
color: "#dc2626",
fontSize: 12,
marginTop: 0,
marginBottom: 10,
};

const infoStyle = {
background: "#eff6ff",
color: "#1d4ed8",
padding: 10,
borderRadius: 10,
fontSize: 13,
};

const successStyle = {
background: "#dcfce7",
color: "#166534",
padding: 10,
borderRadius: 10,
fontSize: 13,
marginBottom: 12,
};

const mainButtonStyle = {
width: "100%",
padding: "13px 18px",
borderRadius: 12,
border: "none",
color: "white",
fontWeight: "bold",
fontSize: 15,
};

const mainSmallButtonStyle = {
width: "100%",
padding: "10px 14px",
borderRadius: 10,
border: "none",
background: "#2563eb",
color: "white",
fontWeight: "bold",
cursor: "pointer",
};

const secondaryButtonStyle = {
width: "100%",
padding: "10px 14px",
borderRadius: 10,
border: "none",
background: "#64748b",
color: "white",
fontWeight: "bold",
cursor: "pointer",
};

const gridStyle = {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: 18,
};

const cardStyle = {
border: "1px solid #e5e7eb",
borderRadius: 18,
padding: 18,
background: "#ffffff",
transition: "all 0.2s ease",
};

const descriptionTextStyle = {
color: "#475569",
fontSize: 14,
lineHeight: 1.4,
minHeight: 40,
};

const emptyStateStyle = {
textAlign: "center",
padding: 30,
borderRadius: 18,
background: "#f8fafc",
color: "#64748b",
marginTop: 10,
marginBottom: 20,
};

const categoryStyle = {
display: "inline-block",
marginBottom: 10,
padding: "4px 10px",
borderRadius: 999,
background: "#e0f2fe",
color: "#0369a1",
fontSize: 12,
fontWeight: "bold",
};

const favoriteButtonStyle = {
float: "right",
border: "none",
background: "transparent",
cursor: "pointer",
fontSize: 20,
};

const priceStyle = {
display: "block",
marginTop: 10,
marginBottom: 14,
fontSize: 18,
};

const detailButtonStyle = {
flex: 1,
padding: "9px 10px",
borderRadius: 8,
border: "none",
background: "#64748b",
color: "white",
cursor: "pointer",
fontWeight: "bold",
};

const buyButtonStyle = {
flex: 1,
padding: "9px 10px",
borderRadius: 8,
border: "none",
background: "#16a34a",
color: "white",
cursor: "pointer",
fontWeight: "bold",
};

const deleteButtonStyle = {
flex: 1,
padding: "9px 10px",
borderRadius: 8,
border: "none",
background: "#ef4444",
color: "white",
cursor: "pointer",
fontWeight: "bold",
};

const buyLargeButtonStyle = {
width: "100%",
padding: "14px 18px",
borderRadius: 12,
border: "none",
background: "#16a34a",
color: "white",
cursor: "pointer",
fontWeight: "bold",
fontSize: 16,
};

const fileBoxStyle = {
marginBottom: 12,
padding: 16,
borderRadius: 14,
background: "#f8fafc",
textAlign: "center",
border: "1px solid #e2e8f0",
};

const fileLinkStyle = {
display: "inline-block",
marginTop: 6,
padding: "6px 12px",
borderRadius: 8,
background: "#2563eb",
color: "white",
textDecoration: "none",
fontSize: 13,
};

const modalOverlayStyle = {
position: "fixed",
inset: 0,
background: "rgba(15, 23, 42, 0.55)",
display: "flex",
justifyContent: "center",
alignItems: "center",
padding: 20,
zIndex: 1000,
};

const modalStyle = {
position: "relative",
background: "white",
width: "min(650px, 95vw)",
maxHeight: "90vh",
overflowY: "auto",
padding: 30,
borderRadius: 22,
boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
};

const closeButtonStyle = {
position: "absolute",
right: 18,
top: 12,
border: "none",
background: "transparent",
fontSize: 30,
cursor: "pointer",
};
