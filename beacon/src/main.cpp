#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DNSServer.h>
#include <ESPAsyncWebServer.h>
#include "secrets.h"

//Configuration SoftAP
const char* AP_SSID = "BridgeGuard-Alerte";
const IPAddress AP_IP(192, 168, 4, 1);
const IPAddress AP_GATEWAY(192, 168, 4, 1);
const IPAddress AP_SUBNET(255, 255, 255, 0);

//Serveur DNS
DNSServer dnsServer;
const byte DNS_PORT = 53;

//Serveur HTTP
AsyncWebServer server(80);
unsigned long displayCount = 0; // compteur anonyme

const char alertPageHTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>BridgeGuard — Alerte</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #fdf1f1; color: #2b1414; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
  }
  .page { width: 100%; max-width: 440px; min-height: 100vh; display: flex; flex-direction: column; }
  .header {
    background: linear-gradient(160deg, #ff5c5c 0%, #d92b2b 100%);
    padding: 22px 22px 26px; color: #fff; box-shadow: 0 8px 24px rgba(217, 43, 43, 0.25);
  }
  .header-top { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .flood-icon { width: 38px; height: 38px; flex-shrink: 0; }
  .header-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; opacity: 0.85; }
  .header-title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; line-height: 1.25; text-align: center; }
  .location-msg { margin-top: 12px; line-height: 1.5; background: rgba(255,255,255,0.16); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; align-items: center; }
  .location-row { display: flex; align-items: center; gap: 8px; }
  .location-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .location-main { font-size: 14px; font-weight: 600; }
  .location-sub { font-size: 12px; opacity: 0.85; margin-top: 3px; text-align: center; }
  .cta-zone { display: flex; flex-direction: column; align-items: center; padding: 22px 20px 18px; }
  .cta-button {
    width: 156px; height: 156px; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #3fcf6e, #1f9e4c);
    box-shadow: 0 0 0 10px rgba(31,158,76,0.12), 0 10px 30px rgba(31,158,76,0.35);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #fff; text-decoration: none; border: none; cursor: pointer; transition: transform 0.12s ease;
  }
  .cta-button:active { transform: scale(0.96); }
  .cta-icon { width: 36px; height: 36px; margin-bottom: 6px; }
  .cta-label { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; }
  .cta-caption { margin-top: 12px; font-size: 12px; color: #6b5a5a; text-align: center; line-height: 1.5; }
  .place-card { margin: 4px 20px 20px; background: #fff; border-radius: 16px; padding: 12px 14px; box-shadow: 0 2px 10px rgba(43,20,20,0.05); }
  .place-row { display: flex; align-items: center; gap: 12px; padding: 8px 4px; }
  .place-row + .place-row { border-top: 1px solid #f3e6e6; }
  .place-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .place-icon.dest { background: #fdecec; }
  .place-icon.origin { background: #eaf2fd; }
  .place-text-title { font-size: 13.5px; font-weight: 600; color: #2b1414; }
  .place-text-sub { font-size: 11.5px; color: #9a8a8a; margin-top: 1px; }
  .place-badge { margin-left: auto; background: #fff4d6; color: #a3760a; font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 8px; flex-shrink: 0; }
  .footer { margin-top: auto; padding: 8px 24px 26px; text-align: center; }
  .footer-note { font-size: 11.5px; color: #9a8a8a; line-height: 1.5; }
  .anonymous-badge { display: inline-flex; align-items: center; gap: 6px; background: #fff; border-radius: 20px; padding: 6px 14px; font-size: 11.5px; color: #6b5a5a; margin-top: 12px; box-shadow: 0 2px 8px rgba(43,20,20,0.06); }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <svg class="flood-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 16c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M3 20c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
        <path d="M12 2v9M12 11l-3.5-3.5M12 11l3.5-3.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="header-label">BridgeGuard · Alerte automatique</div>
    </div>
    <div class="header-title">Alerte inondation<br>danger immédiat</div>
    <div class="location-msg">
      <div class="location-row">
        <svg class="location-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
          <circle cx="12" cy="9.5" r="2.4" stroke="#fff" stroke-width="1.8"/>
        </svg>
        <span class="location-main">Pont de l'Oued Tensift submergé</span>
      </div>
      <span class="location-sub">Axe Nord, 300 m devant vous</span>
    </div>
  </div>
  <div class="cta-zone">
    <a class="cta-button" href="https://www.google.com/maps/dir/?api=1&origin=31.695430,-7.987536&destination=31.696762,-7.987861&travelmode=driving" target="_blank" rel="noopener">
      <svg class="cta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18l6-6-6-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 18l6-6-6-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
      </svg>
      <div class="cta-label">Guidage</div>
    </a>
    <div class="cta-caption">Ouvre l'itinéraire de déviation<br>directement dans votre app GPS</div>
  </div>
  <div class="place-card">
    <div class="place-row">
      <div class="place-icon dest">📍</div>
      <div>
        <div class="place-text-title">Route Nord (N9)</div>
        <div class="place-text-sub">S'éloigne de la zone inondée · point sûr le plus proche</div>
      </div>
      <div class="place-badge">+150 m</div>
    </div>
    <div class="place-row">
      <div class="place-icon origin">🧭</div>
      <div>
        <div class="place-text-title">Balise Axe Nord</div>
        <div class="place-text-sub">Point de départ du guidage — entrée du pont</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-note">
      Cette alerte est diffusée automatiquement par BridgeGuard.<br>
      Aucune donnée personnelle n'est collectée ni requise.
    </div>
    <div class="anonymous-badge">🔒 Session anonyme</div>
  </div>
</div>
</body>
</html>
)rawliteral";

//Client Supabase embarqué
unsigned long lastPoll = 0;
const unsigned long POLL_INTERVAL_MS = 10000;

String currentRiskLevel = "low";
bool activeAlert = false;
String bridgeState = "accessible";
bool beaconActive = false;

void connectWiFiSTA() {
  Serial.print("[STA] Connexion en cours");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[STA] Connecté — IP : " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[STA] ERREUR : échec de connexion");
  }
}

void updateActivation() {
  if (activeAlert && !beaconActive) {
    beaconActive = true;
    Serial.println("[Beacon] ACTIVÉ — risk_level = " + currentRiskLevel);
  } else if (!activeAlert && beaconActive) {
    beaconActive = false;
    Serial.println("[Beacon] DÉSACTIVÉ — retour à la normale");
  }
}

void pollSupabase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Supabase] Pas de connexion montante — requête ignorée");
    return;
  }

  HTTPClient http;
  http.begin(SUPABASE_URL);
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("[Supabase] Réponse : " + payload);

    activeAlert = payload.indexOf("\"active_alert\":true") != -1;

    int riskIndex = payload.indexOf("\"risk_level\":\"");
    if (riskIndex != -1) {
      int start = riskIndex + 15;
      int end = payload.indexOf("\"", start);
      currentRiskLevel = payload.substring(start, end);
    }

    updateActivation();
  } else {
    Serial.printf("[Supabase] Erreur requête : code %d\n", httpCode);
  }

  http.end();
}

void handleGenerate204(AsyncWebServerRequest *request) { 
  request->redirect("http://192.168.4.1/portal"); 
} 
void handleCaptivePortal(AsyncWebServerRequest *request) {
  displayCount++;
  Serial.print("Page d'alerte affichée — compteur anonyme : ");
  Serial.println(displayCount);
  request->send_P(200, "text/html", alertPageHTML);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[BridgeGuard-Beacon] Démarrage...");

  //Mode Access Point
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAPConfig(AP_IP, AP_GATEWAY, AP_SUBNET);
  WiFi.softAP(AP_SSID, nullptr);
  Serial.print("SoftAP démarré — IP : ");
  Serial.println(WiFi.softAPIP());
  connectWiFiSTA();

  //Redirection DNS
  dnsServer.start(DNS_PORT, "*", AP_IP);
  Serial.println("Serveur DNS démarré (spoofing actif)");

  //Serveur HTTP embarqué
  server.on("/generate_204", HTTP_GET, handleGenerate204);                // Android
  server.on("/portal", HTTP_GET, handleCaptivePortal);
  server.on("/hotspot-detect.html", HTTP_GET, handleCaptivePortal);       // iOS
  server.on("/library/test/success.html", HTTP_GET, handleCaptivePortal); 
  server.on("/ncsi.txt", HTTP_GET, handleCaptivePortal);                  // Windows
  server.onNotFound(handleCaptivePortal);

  server.begin();
  Serial.println("Serveur HTTP démarré");
}

void loop() {
  dnsServer.processNextRequest();
  if (millis() - lastPoll > POLL_INTERVAL_MS) {
  lastPoll = millis();
  pollSupabase();
}
}