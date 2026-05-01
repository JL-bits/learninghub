import React, { useMemo, useState } from "react";
import { Upload, FileText, Image as ImageIcon, Sparkles, Euro, Eye, Zap, Search, Filter, BookOpen, Star, ChevronRight, CheckCircle2, Wallet, LayoutDashboard, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const sampleDocs = [
  {
    id: 1,
    title: "Mathematik Abitur Lernzettel Analysis",
    desc: "Strukturierte Zusammenfassung zu Ableitungen, Kurvendiskussion und Integralrechnung.",
    price: 7.99,
    previewPages: 3,
    category: "Mathematik",
    pushed: true,
  },
  {
    id: 2,
    title: "Biologie Lernblätter Genetik",
    desc: "Verständliche Übersichten zu DNA, Replikation, Mutation und Proteinbiosynthese.",
    price: 6.49,
    previewPages: 2,
    category: "Biologie",
    pushed: false,
  },
  {
    id: 3,
    title: "Geschichte Zusammenfassung Kalter Krieg",
    desc: "Kompakte Lernblätter zu Ursachen, Verlauf und Folgen des Ost West Konflikts.",
    price: 8.99,
    previewPages: 4,
    category: "Geschichte",
    pushed: true,
  },
];

function AIBadge() {
  return (
    <Badge className="rounded-full px-3 py-1 text-xs">
      <Sparkles className="mr-1 h-3.5 w-3.5" /> KI Unterstützung
    </Badge>
  );
}

export default function LernblattMarketplace() {
  const [price, setPrice] = useState("4.99");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("seller");
  const [previewPages, setPreviewPages] = useState([3]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("mathematik");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("alle");

  const aiSuggestion = useMemo(() => {
    const categoryMap = {
      mathematik: {
        title: "Mathematik Lernzettel, klar und prüfungsrelevant",
        description:
          "Übersichtliche Zusammenfassung mit wichtigen Regeln, Beispielen und typischen Prüfungsaufgaben für schnelles Wiederholen.",
      },
      biologie: {
        title: "Biologie Lernblätter, verständlich erklärt",
        description:
          "Strukturierte Lernblätter mit Definitionen, Zusammenhängen und prüfungsrelevanten Schwerpunkten für Schule und Studium.",
      },
      geschichte: {
        title: "Geschichte kompakt, Lernblätter mit Überblick",
        description:
          "Klar gegliederte Zusammenfassung mit Ursachen, Verlauf, Folgen und wichtigen Begriffen für sicheres Lernen.",
      },
      deutsch: {
        title: "Deutsch Lernzettel mit klarer Struktur",
        description:
          "Praktische Übersichten zu Epochen, Stilmitteln, Textanalyse und relevanten Prüfungsinhalten in verständlicher Form.",
      },
    };

    return categoryMap[category] || categoryMap.mathematik;
  }, [category]);

  const filteredDocs = useMemo(() => {
    return sampleDocs.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.desc.toLowerCase().includes(search.toLowerCase()) ||
        doc.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "alle" ? true : doc.category.toLowerCase() === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">LernBlatt Hub</div>
              <div className="text-sm text-slate-500">Lernblätter einfach hochladen und verkaufen</div>
            </div>
          </div>
          <nav className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" className="rounded-xl">Start</Button>
            <Button variant="ghost" className="rounded-xl">Marktplatz</Button>
            <Button variant="ghost" className="rounded-xl">Dashboard</Button>
            <Button variant="ghost" className="rounded-xl">Admin</Button>
            {!isLoggedIn ? (
              <>
                <Button variant="outline" className="rounded-xl" onClick={() => setIsLoggedIn(true)}>Anmelden</Button>
                <Button className="rounded-xl">Registrieren</Button>
              </>
            ) : (
              <>
                <Badge className="rounded-full px-3 py-1">Eingeloggt</Badge>
                <Button variant="outline" className="rounded-xl" onClick={() => setIsLoggedIn(false)}>Abmelden</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <AIBadge />
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">Foto oder Dokument Upload</Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">Bezahltes Pushen möglich</Badge>
              </div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
                Ihre Lernblätter hochladen, mit KI optimieren und direkt verkaufen
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Eine einfache Plattform für Schüler*innen, Studierende und Lehrkräfte. Dateien hochladen, Fotos von Notizen machen, Preis festlegen, Vorschauseiten bestimmen und mit Zusatzoptionen mehr Sichtbarkeit erhalten.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="rounded-2xl px-6">
                  <PlusCircle className="mr-2 h-4 w-4" /> Lernblätter einstellen
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl px-6">
                  <ChevronRight className="mr-2 h-4 w-4" /> Demo ansehen
                </Button>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-2xl font-semibold">Foto</div>
                  <div className="mt-1 text-sm text-slate-600">Notizen direkt mit dem Handy fotografieren</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-2xl font-semibold">KI</div>
                  <div className="mt-1 text-sm text-slate-600">Titel und Beschreibung automatisch vorschlagen</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-2xl font-semibold">Push</div>
                  <div className="mt-1 text-sm text-slate-600">Mit Zusatzpaketen mehr Sichtbarkeit buchen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Wie es funktioniert</CardTitle>
              <CardDescription>Schnell, klar und ohne unnötige Komplexität</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["1", "Datei oder Foto hochladen", "PDF, Word, Bilder oder Handyfotos von Notizen"],
                ["2", "Preis und Vorschau festlegen", "Sie bestimmen, wie viele Seiten sichtbar sein sollen"],
                ["3", "KI Vorschläge nutzen", "Automatische Hilfe für Titel und Beschreibung"],
                ["4", "Veröffentlichen oder pushen", "Mehr Reichweite durch Zusatzoptionen"],
              ].map(([num, title, text]) => (
                <div key={num} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                    {num}
                  </div>
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-sm text-slate-600">{text}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="h-5 w-5" /> Lernblätter hochladen
              </CardTitle>
              <CardDescription>Mit Upload, Preisfestlegung, Vorschauseiten und KI Hilfe</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="push">Push</TabsTrigger>
                  <TabsTrigger value="payment">Bezahlung</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-dashed bg-slate-50 p-6 text-center">
                      <FileText className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                      <div className="font-medium">Dokument hochladen</div>
                      <div className="mt-1 text-sm text-slate-500">PDF, Word oder Bilddatei</div>
                      <Button variant="outline" className="mt-4 rounded-2xl">Datei auswählen</Button>
                    </div>
                    <div className="rounded-3xl border border-dashed bg-slate-50 p-6 text-center">
                      <ImageIcon className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                      <div className="font-medium">Foto von Notizen machen</div>
                      <div className="mt-1 text-sm text-slate-500">Direkt per Handy oder Webcam</div>
                      <Button variant="outline" className="mt-4 rounded-2xl">Kamera öffnen</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-6 space-y-6">
                  <div className="grid gap-5">
                    <div>
                      <Label>Kategorie</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-2 rounded-2xl">
                          <SelectValue placeholder="Kategorie auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematik">Mathematik</SelectItem>
                          <SelectItem value="biologie">Biologie</SelectItem>
                          <SelectItem value="geschichte">Geschichte</SelectItem>
                          <SelectItem value="deutsch">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label>Titel</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setTitle(aiSuggestion.title)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" /> KI Vorschlag
                        </Button>
                      </div>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Zum Beispiel, Mathematik Lernzettel Analysis Abitur"
                        className="rounded-2xl"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label>Beschreibung</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setDescription(aiSuggestion.description)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" /> KI Beschreibung
                        </Button>
                      </div>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Beschreiben Sie kurz, was in Ihren Lernblättern enthalten ist"
                        className="min-h-[120px] rounded-2xl"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label className="flex items-center gap-2"><Euro className="h-4 w-4" /> Preis in Euro</Label>
                        <Input
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="mt-2 rounded-2xl"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2"><Eye className="h-4 w-4" /> Vorschauseiten</Label>
                        <div className="mt-4 px-2">
                          <Slider value={previewPages} onValueChange={setPreviewPages} max={10} min={1} step={1} />
                          <div className="mt-3 text-sm text-slate-600">{previewPages[0]} Seiten sind vor dem Kauf sichtbar</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="push" className="mt-6 space-y-6">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div>
                      <div className="font-medium">Push aktivieren</div>
                      <div className="text-sm text-slate-600">Mehr Sichtbarkeit im Marktplatz gegen Zusatzkosten</div>
                    </div>
                    <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { name: "Basic Push", price: "2,99 €", text: "24 Stunden hervorgehoben" },
                      { name: "Top Push", price: "5,99 €", text: "3 Tage prominent platziert" },
                      { name: "Premium Push", price: "9,99 €", text: "1 Woche maximale Sichtbarkeit" },
                    ].map((plan) => (
                      <div key={plan.name} className="rounded-3xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{plan.name}</div>
                          <Zap className="h-4 w-4" />
                        </div>
                        <div className="mt-4 text-2xl font-bold">{plan.price}</div>
                        <div className="mt-2 text-sm text-slate-600">{plan.text}</div>
                        <Button className="mt-5 w-full rounded-2xl">Auswählen</Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="payment" className="mt-6 space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border bg-slate-50 p-5">
                      <div className="font-semibold">Zahlungen für Käufer*innen</div>
                      <div className="mt-2 text-sm text-slate-600">Kreditkarte, PayPal, Sofortüberweisung, Apple Pay, Google Pay</div>
                      <div className="mt-4 space-y-2 text-sm text-slate-700">
                        <div>• Sicherer Checkout</div>
                        <div>• Download nach erfolgreicher Zahlung</div>
                        <div>• Automatische Rechnungserstellung</div>
                      </div>
                    </div>
                    <div className="rounded-3xl border bg-slate-50 p-5">
                      <div className="font-semibold">Auszahlungen für Verkäufer*innen</div>
                      <div className="mt-2 text-sm text-slate-600">Bankkonto oder PayPal für Auszahlungen hinterlegen</div>
                      <div className="mt-4 space-y-2 text-sm text-slate-700">
                        <div>• Übersicht über Einnahmen</div>
                        <div>• Geplante Auszahlungen</div>
                        <div>• Status jeder Transaktion</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <LayoutDashboard className="h-5 w-5" /> Verkäufer*innen Übersicht
              </CardTitle>
              <CardDescription>Einfach strukturierte Verwaltungsansicht</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-sm text-slate-500">Aktive Uploads</div>
                  <div className="mt-2 text-3xl font-bold">12</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-sm text-slate-500">Verkäufe</div>
                  <div className="mt-2 text-3xl font-bold">84</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-sm text-slate-500">Einnahmen</div>
                  <div className="mt-2 text-3xl font-bold">426 €</div>
                </div>
              </div>

              <div className="rounded-3xl border bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Aktuelles Dokument</div>
                    <div className="text-sm text-slate-600">Vorschau Ihrer Eingaben</div>
                  </div>
                  <Badge className="rounded-full">Entwurf</Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium">Titel:</span> {title || "Noch kein Titel eingegeben"}</div>
                  <div><span className="font-medium">Beschreibung:</span> {description || "Noch keine Beschreibung eingegeben"}</div>
                  <div><span className="font-medium">Preis:</span> {price} €</div>
                  <div><span className="font-medium">Vorschau:</span> {previewPages[0]} Seiten</div>
                  <div><span className="font-medium">Push:</span> {pushEnabled ? "Aktiviert" : "Nicht aktiviert"}</div>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-semibold">Gespeicherte Uploads</div>
                  <Badge variant="secondary" className="rounded-full">Cloud bereit</Badge>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="rounded-2xl bg-slate-50 p-3">Mathematik Analysis, Status: online, 7 Verkäufe</div>
                  <div className="rounded-2xl bg-slate-50 p-3">Biologie Genetik, Status: Entwurf, noch nicht veröffentlicht</div>
                  <div className="rounded-2xl bg-slate-50 p-3">Geschichte Kalter Krieg, Status: gepusht, hohe Sichtbarkeit</div>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-semibold">Empfohlene nächste Schritte</div>
                  <CheckCircle2 className="h-5 w-5 text-slate-500" />
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div>• Titel mit relevanten Stichwörtern optimieren</div>
                  <div>• 2 bis 4 Vorschauseiten freischalten, damit Käufer*innen Vertrauen gewinnen</div>
                  <div>• Für neue Dokumente vorübergehend Push nutzen</div>
                  <div>• Preis klar an Qualität und Umfang anpassen</div>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl">Marktplatz Vorschau</CardTitle>
                  <CardDescription>So könnten Käufer*innen die Lernblätter sehen</CardDescription>
                </div>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Lernblätter suchen"
                      className="rounded-2xl pl-9"
                    />
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full rounded-2xl md:w-56">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle">Alle Fächer</SelectItem>
                      <SelectItem value="mathematik">Mathematik</SelectItem>
                      <SelectItem value="biologie">Biologie</SelectItem>
                      <SelectItem value="geschichte">Geschichte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <FileText className="h-6 w-6 text-slate-700" />
                      </div>
                      <div className="flex gap-2">
                        {doc.pushed && <Badge className="rounded-full"><Zap className="mr-1 h-3 w-3" /> Gepusht</Badge>}
                        <Badge variant="secondary" className="rounded-full">{doc.category}</Badge>
                      </div>
                    </div>
                    <div className="text-lg font-semibold leading-6">{doc.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{doc.desc}</p>
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-slate-600"><Eye className="h-4 w-4" /> {doc.previewPages} Vorschauseiten</div>
                      <div className="flex items-center gap-1 text-slate-600"><Star className="h-4 w-4" /> 4.8</div>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <div className="text-2xl font-bold">{doc.price.toFixed(2)} €</div>
                      <Button className="rounded-2xl">Kaufen</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><Wallet className="h-5 w-5" /> Monetarisierung</CardTitle>
              <CardDescription>Verdienen und zusätzlich Reichweite buchen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">Eigene Preisfestlegung für jedes Lernblatt</div>
              <div className="rounded-2xl bg-slate-50 p-4">Vorschauseiten steuern für mehr Vertrauen und Schutz</div>
              <div className="rounded-2xl bg-slate-50 p-4">Push Pakete für neue oder wichtige Dokumente</div>
              <div className="rounded-2xl bg-slate-50 p-4">Später erweiterbar um Bewertungen, Verkäufe und Auszahlungen</div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Warum dieses Konzept gut funktioniert</CardTitle>
              <CardDescription>Einfach, übersichtlich und direkt auf den Anwendungsfall ausgerichtet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Klarer Upload Prozess ohne Überladung",
                  "Foto Upload für handschriftliche Notizen",
                  "KI Hilfe für bessere Sichtbarkeit der Angebote",
                  "Flexibles Modell für Vorschau und Preis",
                  "Zusätzliche Einnahmen über Push Funktionen",
                  "Gut ausbaufähig für Login, Bezahlung und Bewertungen",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Login und Registrierung</CardTitle>
              <CardDescription>Getrennte Wege für Käufer*innen, Verkäufer*innen und Admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border bg-slate-50 p-5">
                  <div className="font-semibold">Anmelden</div>
                  <div className="mt-4 space-y-3">
                    <Input placeholder="E Mail" className="rounded-2xl" />
                    <Input placeholder="Passwort" type="password" className="rounded-2xl" />
                    <Button className="w-full rounded-2xl">Einloggen</Button>
                  </div>
                </div>
                <div className="rounded-3xl border bg-slate-50 p-5">
                  <div className="font-semibold">Registrieren</div>
                  <div className="mt-4 space-y-3">
                    <Input placeholder="Name" className="rounded-2xl" />
                    <Input placeholder="E Mail" className="rounded-2xl" />
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Rolle wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Käufer*in</SelectItem>
                        <SelectItem value="seller">Verkäufer*in</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Passwort" type="password" className="rounded-2xl" />
                    <Button variant="outline" className="w-full rounded-2xl">Konto erstellen</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Admin Bereich</CardTitle>
              <CardDescription>Verwaltung und Moderation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">Neue Uploads prüfen und freigeben</div>
              <div className="rounded-2xl bg-slate-50 p-4">Gemeldete Inhalte kontrollieren</div>
              <div className="rounded-2xl bg-slate-50 p-4">Push Buchungen verwalten</div>
              <div className="rounded-2xl bg-slate-50 p-4">Nutzer*innen und Transaktionen einsehen</div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
