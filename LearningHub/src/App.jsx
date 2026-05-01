 import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "./firebase";
import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
query,
where,
} from "firebase/firestore";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
} from "firebase/auth";

const APP_NAME = "LearningHub";
const CLOUD_NAME = "diu45f6nj";
const UPLOAD_PRESET = "learninghub_upload";

export default function App() {
const [activePage, setActivePage] = useState("home");
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
const [purchases, setPurchases] = useState([]);
const [message, setMessage] = useState("");
const [isUploading, setIsUploading] = useState(false);
const [hoveredId, setHoveredId] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);

const [search, setSearch] = useState("");
const [filterCategory, setFilterCategory] = useState("Alle");
const [sortOrder, setSortOrder] = useState("neu");

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
setUser(currentUser);
await loadItems();

if (currentUser) {
await loadPurchases(currentUser.uid);
} else {
setPurchases([]);
}
});

return () => unsubscribe();
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
console.error("Fehler beim Laden der Lernblätter:", error);
}
}

async function loadPurchases(userId) {
try {
const purchasesQuery = query(
collection(db, "purchases"),
where("buyerId", "==", userId)
);

const querySnapshot = await getDocs(purchasesQuery);

const data = querySnapshot.docs.map((document) => ({
id: document.id,
...document.data(),
}));

setPurchases(data);
} catch (error) {
console.error("Fehler beim Laden der Käufe:", error);
}
}

async function handleRegister() {
try {
await createUserWithEmailAndPassword(auth, authEmail, authPassword);
setAuthMessage("✅ Konto erfolgreich erstellt.");
setAuthEmail("");
setAuthPassword("");
} catch (error) {
console.error(error);
setAuthMessage("❌ Registrierung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
}
}

async function handleLogin() {
try {
await signInWithEmailAndPassword(auth, authEmail, authPassword);
setAuthMessage("✅ Erfolgreich angemeldet.");
setAuthEmail("");
setAuthPassword("");
} catch (error) {
console.error(error);
setAuthMessage("❌ Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.");
}
}

async function handleLogout() {
await signOut(auth);
setPurchases([]);
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

const myItems = useMemo(() => {
return user ? items.filter((item) => item.ownerId === user.uid) : [];
}, [items, user]);

const newestItems = useMemo(() => {
return [...items]
.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
.slice(0, 4);
}, [items]);

const purchasedItemIds = purchases.map((purchase) => purchase.itemId);

const downloadedItems = items.filter((item) =>
purchasedItemIds.includes(item.id)
);

const purchasedCategories = downloadedItems.map((item) => item.category);

const recommendations = items
.filter(
(item) =>
purchasedCategories.includes(item.category) &&
!purchasedItemIds.includes(item.id) &&
item.ownerId !== user?.uid
)
.slice(0, 4);

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
if (sortOrder === "bewertung")
return Number(b.rating || 0) - Number(a.rating || 0);

return Number(b.createdAt || 0) - Number(a.createdAt || 0);
});

function formatPrice(value) {
return new Intl.NumberFormat("de-DE", {
style: "currency",
currency: "EUR",
}).format(Number(value || 0));
}

function clearForm() {
setTitle("");
setDescription("");
setPrice("");
setCategory("Mathematik");
setFile(null);
}

async function handleAdd() {
if (!user) {
setMessage("❌ Bitte zuerst einloggen.");
return;
}

if (!title.trim() || !description.trim() || Number(price) <= 0) {
setMessage("❌ Bitte Titel, Beschreibung und Preis korrekt ausfüllen.");
return;
}

setIsUploading(true);
setMessage("");

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

clearForm();
setMessage("✅ Lernblatt erfolgreich gespeichert.");
await loadItems();
} catch (error) {
console.error(error);
setMessage("❌ Fehler beim Speichern oder Hochladen.");
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

await deleteDoc(doc(db, "items", id));
await loadItems();

if (selectedItem?.id === id) {
setSelectedItem(null);
}
}

async function handlePurchase(item) {
if (!user) {
alert("Bitte zuerst einloggen.");
return;
}

if (item.ownerId === user.uid) {
alert("Eigene Lernblätter müssen nicht gekauft werden.");
return;
}

try {
const alreadyPurchased = purchases.some(
(purchase) => purchase.itemId === item.id
);

if (!alreadyPurchased) {
await addDoc(collection(db, "purchases"), {
buyerId: user.uid,
buyerEmail: user.email,
itemId: item.id,
title: item.title,
category: item.category,
fileUrl: item.fileUrl,
fileName: item.fileName,
price: item.price,
createdAt: Date.now(),
});
}

await loadPurchases(user.uid);
setActivePage("home");
alert("✅ Kauf gespeichert. Das Lernblatt erscheint jetzt unter Downloads.");
} catch (error) {
console.error("Fehler beim Kaufen:", error);
alert("❌ Kauf konnte nicht gespeichert werden. Prüfen Sie Firebase-Regeln.");
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
) {
return "Bild-Datei";
}

return "Datei";
}

function renderFilePreview(item, large = false) {
if (!item.fileUrl) {
return (
<div style={fileBoxStyle}>
<div style={{ fontSize: 34 }}>📘</div>
<strong>Keine Datei hochgeladen</strong>
</div>
);
}

if (item.fileType?.startsWith("image")) {
return (
<img
src={item.fileUrl}
alt="Lernblatt Vorschau"
style={{
width: "100%",
height: large ? 300 : 150,
objectFit: "cover",
borderRadius: 18,
marginBottom: 14,
background: "#f1f5f9",
}}
/>
);
}

return (
<div style={fileBoxStyle}>
<div style={{ fontSize: large ? 44 : 32, marginBottom: 8 }}>📄</div>
<div style={{ fontWeight: "800", marginBottom: 6 }}>
{getFileLabel(item)}
</div>
<div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
{item.fileName || "Datei"}
</div>
<a href={item.fileUrl} target="_blank" rel="noreferrer" style={fileLinkStyle}>
Datei öffnen
</a>

{(item.fileName?.toLowerCase().endsWith(".doc") ||
item.fileName?.toLowerCase().endsWith(".docx")) && (
<p style={{ ...smallTextStyle, marginTop: 10 }}>
Hinweis: Word-Dateien können sich zuerst über Microsoft Office Online öffnen.
</p>
)}
</div>
);
}

function renderStars(item) {
return (
<div style={{ marginBottom: 12 }}>
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
);
}

function renderCard(item) {
return (
<article
key={item.id}
onMouseEnter={() => setHoveredId(item.id)}
onMouseLeave={() => setHoveredId(null)}
style={{
...cardStyle,
boxShadow:
hoveredId === item.id
? "0 18px 38px rgba(15,23,42,0.16)"
: "0 8px 24px rgba(15,23,42,0.08)",
transform: hoveredId === item.id ? "translateY(-5px)" : "none",
}}
>
{renderFilePreview(item)}

<div style={rowBetweenStyle}>
<span style={categoryStyle}>{item.category}</span>
<button onClick={() => toggleFavorite(item.id)} style={favoriteButtonStyle}>
{item.favorite ? "❤️" : "🤍"}
</button>
</div>

<h3 style={{ marginTop: 10, marginBottom: 8 }}>{item.title}</h3>

<p style={descriptionTextStyle}>{item.description}</p>

<p style={smallTextStyle}>
Von: <strong>{item.ownerEmail || "Unbekannt"}</strong>
</p>

{renderStars(item)}

<strong style={priceStyle}>{formatPrice(item.price)}</strong>

<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<button onClick={() => setSelectedItem(item)} style={detailButtonStyle}>
Details
</button>

<button onClick={() => handlePurchase(item)} style={buyButtonStyle}>
Kaufen
</button>

{user && item.ownerId === user.uid && (
<button onClick={() => handleDelete(item.id)} style={deleteButtonStyle}>
Löschen
</button>
)}
</div>
</article>
);
}

return (
<div style={appShellStyle}>
<header style={topNavStyle}>
<div>
<h1 style={brandStyle}>{APP_NAME}</h1>
<p style={{ margin: 0, color: "#64748b" }}>
Digitale Lernblätter einfach hochladen, finden und nutzen
</p>
</div>

<nav style={navButtonGroupStyle}>
{[
["home", "Home"],
["market", "Marktplatz"],
["upload", "Hochladen"],
["account", "Mein Bereich"],
].map(([key, label]) => (
<button
key={key}
onClick={() => setActivePage(key)}
style={{
...navButtonStyle,
background: activePage === key ? "#2563eb" : "#ffffff",
color: activePage === key ? "#ffffff" : "#0f172a",
}}
>
{label}
</button>
))}
</nav>
</header>

{activePage === "home" && (
<main style={pageContentStyle}>
<section style={heroStyle}>
<h2 style={{ fontSize: 38, marginBottom: 10 }}>
Willkommen bei {APP_NAME}
</h2>
<p style={{ fontSize: 17, lineHeight: 1.7 }}>
Ihre Übersicht für neue Lernblätter, Downloads, Uploads und passende Empfehlungen.
</p>
</section>

<section style={statsGridStyle}>
<StatCard number={items.length} label="Neueinstellungen" />
<StatCard number={downloadedItems.length} label="Downloads / Käufe" />
<StatCard number={myItems.length} label="Eigene Uploads" />
<StatCard number={recommendations.length} label="Empfehlungen" />
</section>

<Section title="Neueinstellungen">
<CardGrid items={newestItems} renderCard={renderCard} />
</Section>

<Section title="Ihre Downloads">
{downloadedItems.length === 0 ? (
<Empty text="Noch keine gekauften oder gespeicherten Lernblätter." />
) : (
<CardGrid items={downloadedItems} renderCard={renderCard} />
)}
</Section>

<Section title="Empfehlungen für Sie">
{recommendations.length === 0 ? (
<Empty text="Empfehlungen erscheinen, sobald Sie ein Lernblatt kaufen." />
) : (
<CardGrid items={recommendations} renderCard={renderCard} />
)}
</Section>
</main>
)}

{activePage === "market" && (
<main style={pageContentStyle}>
<Section title="Marktplatz">
<div style={filterBarStyle}>
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
<option value="bewertung">Beste Bewertung zuerst</option>
</select>
</div>

<p style={smallTextStyle}>Gefundene Lernblätter: {filteredItems.length}</p>
<CardGrid items={filteredItems} renderCard={renderCard} />
</Section>
</main>
)}

{activePage === "upload" && (
<main style={pageContentStyle}>
<section style={panelStyle}>
<h2 style={{ marginTop: 0 }}>Lernblatt hochladen</h2>

{message && <p style={message.includes("✅") ? successStyle : errorStyle}>{message}</p>}

{!user && (
<p style={infoStyle}>
Bitte melden Sie sich zuerst mit E-Mail und Passwort an.
</p>
)}

<input
placeholder="Titel"
value={title}
onChange={(e) => setTitle(e.target.value)}
style={inputStyle}
/>

<textarea
placeholder="Beschreibung (max. 100 Wörter)"
value={description}
onChange={(e) => {
const text = e.target.value;
const words = text.trim() === "" ? [] : text.trim().split(/\s+/);
if (words.length <= 100) setDescription(text);
}}
style={{ ...inputStyle, minHeight: 120, resize: "none" }}
/>

<p style={smallTextStyle}>{wordCount} / 100 Wörter</p>

<input
type="number"
min="0.01"
step="0.01"
placeholder="Preis (€)"
value={price}
onChange={(e) => setPrice(e.target.value)}
style={inputStyle}
/>

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
</section>
</main>
)}

{activePage === "account" && (
<main style={pageContentStyle}>
<section style={panelStyle}>
<h2 style={{ marginTop: 0 }}>Mein Bereich</h2>

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

<h3 style={{ marginTop: 30 }}>Meine Uploads</h3>
<CardGrid items={myItems} renderCard={renderCard} />
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
</>
)}
</section>
</main>
)}

{selectedItem && (
<div style={modalOverlayStyle}>
<div style={modalStyle}>
<button onClick={() => setSelectedItem(null)} style={closeButtonStyle}>
×
</button>

{renderFilePreview(selectedItem, true)}

<span style={categoryStyle}>{selectedItem.category}</span>

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
onClick={() => handlePurchase(selectedItem)}
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

function Section({ title, children }) {
return (
<section style={panelStyle}>
<h2 style={{ marginTop: 0 }}>{title}</h2>
{children}
</section>
);
}

function Empty({ text }) {
return (
<div style={emptyStateStyle}>
<div style={{ fontSize: 36 }}>📚</div>
<p>{text}</p>
</div>
);
}

function CardGrid({ items, renderCard }) {
if (!items || items.length === 0) {
return <Empty text="Keine Lernblätter vorhanden." />;
}

return <div style={gridStyle}>{items.map((item) => renderCard(item))}</div>;
}

function StatCard({ number, label }) {
return (
<div style={statCardStyle}>
<strong style={{ fontSize: 30, color: "#2563eb" }}>{number}</strong>
<span>{label}</span>
</div>
);
}

const appShellStyle = {
minHeight: "100vh",
background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 45%, #ffffff 100%)",
fontFamily: "Arial, sans-serif",
color: "#0f172a",
};

const topNavStyle = {
position: "sticky",
top: 0,
zIndex: 50,
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: 24,
padding: "22px 48px",
background: "rgba(255,255,255,0.92)",
backdropFilter: "blur(14px)",
borderBottom: "1px solid #e2e8f0",
};

const brandStyle = {
margin: 0,
fontSize: 34,
fontWeight: 900,
color: "#1d4ed8",
};

const navButtonGroupStyle = {
display: "flex",
gap: 10,
flexWrap: "wrap",
};

const navButtonStyle = {
border: "1px solid #dbeafe",
padding: "10px 16px",
borderRadius: 999,
cursor: "pointer",
fontWeight: 700,
boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
};

const pageContentStyle = {
maxWidth: 1280,
margin: "0 auto",
padding: 40,
display: "grid",
gap: 24,
};

const heroStyle = {
padding: 34,
borderRadius: 28,
background: "linear-gradient(135deg, #2563eb, #7c3aed)",
color: "white",
boxShadow: "0 22px 50px rgba(37,99,235,0.25)",
};

const statsGridStyle = {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: 18,
};

const statCardStyle = {
background: "white",
borderRadius: 22,
padding: 22,
boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
display: "grid",
gap: 8,
};

const panelStyle = {
background: "rgba(255,255,255,0.95)",
padding: 26,
borderRadius: 24,
boxShadow: "0 14px 36px rgba(15,23,42,0.08)",
border: "1px solid #e2e8f0",
};

const filterBarStyle = {
display: "grid",
gridTemplateColumns: "2fr 1fr 1fr",
gap: 12,
marginBottom: 16,
};

const inputStyle = {
display: "block",
marginBottom: 10,
padding: 13,
width: "100%",
boxSizing: "border-box",
borderRadius: 14,
border: "1px solid #cbd5e1",
outline: "none",
background: "white",
};

const smallTextStyle = {
color: "#64748b",
fontSize: 14,
};

const successStyle = {
background: "#dcfce7",
color: "#166534",
padding: 12,
borderRadius: 14,
fontSize: 14,
};

const errorStyle = {
background: "#fee2e2",
color: "#991b1b",
padding: 12,
borderRadius: 14,
fontSize: 14,
};

const infoStyle = {
background: "#eff6ff",
color: "#1d4ed8",
padding: 12,
borderRadius: 14,
fontSize: 14,
};

const mainButtonStyle = {
width: "100%",
padding: "14px 18px",
borderRadius: 14,
border: "none",
color: "white",
fontWeight: "bold",
fontSize: 15,
};

const mainSmallButtonStyle = {
width: "100%",
padding: "12px 14px",
borderRadius: 14,
border: "none",
background: "#2563eb",
color: "white",
fontWeight: "bold",
cursor: "pointer",
};

const secondaryButtonStyle = {
width: "100%",
padding: "12px 14px",
borderRadius: 14,
border: "none",
background: "#64748b",
color: "white",
fontWeight: "bold",
cursor: "pointer",
};

const gridStyle = {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
gap: 20,
};

const cardStyle = {
border: "1px solid #e2e8f0",
borderRadius: 24,
padding: 18,
background: "#ffffff",
transition: "all 0.2s ease",
};

const rowBetweenStyle = {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
};

const categoryStyle = {
display: "inline-block",
padding: "5px 12px",
borderRadius: 999,
background: "#e0f2fe",
color: "#0369a1",
fontSize: 12,
fontWeight: "bold",
};

const favoriteButtonStyle = {
border: "none",
background: "transparent",
cursor: "pointer",
fontSize: 20,
};

const descriptionTextStyle = {
color: "#475569",
fontSize: 14,
lineHeight: 1.5,
minHeight: 44,
};

const priceStyle = {
display: "block",
marginTop: 10,
marginBottom: 14,
fontSize: 18,
};

const detailButtonStyle = {
flex: 1,
padding: "10px",
borderRadius: 12,
border: "none",
background: "#64748b",
color: "white",
cursor: "pointer",
fontWeight: "bold",
};

const buyButtonStyle = {
flex: 1,
padding: "10px",
borderRadius: 12,
border: "none",
background: "#16a34a",
color: "white",
cursor: "pointer",
fontWeight: "bold",
};

const deleteButtonStyle = {
flex: 1,
padding: "10px",
borderRadius: 12,
border: "none",
background: "#ef4444",
color: "white",
cursor: "pointer",
fontWeight: "bold",
};

const buyLargeButtonStyle = {
width: "100%",
padding: "14px 18px",
borderRadius: 14,
border: "none",
background: "#16a34a",
color: "white",
cursor: "pointer",
fontWeight: "bold",
fontSize: 16,
};

const fileBoxStyle = {
marginBottom: 14,
padding: 18,
borderRadius: 18,
background: "#f8fafc",
textAlign: "center",
border: "1px solid #e2e8f0",
};

const fileLinkStyle = {
display: "inline-block",
marginTop: 8,
padding: "8px 14px",
borderRadius: 12,
background: "#2563eb",
color: "white",
textDecoration: "none",
fontSize: 13,
fontWeight: "bold",
};

const emptyStateStyle = {
textAlign: "center",
padding: 28,
borderRadius: 20,
background: "#f8fafc",
color: "#64748b",
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
width: "min(680px, 95vw)",
maxHeight: "90vh",
overflowY: "auto",
padding: 32,
borderRadius: 26,
boxShadow: "0 22px 60px rgba(0,0,0,0.25)",
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