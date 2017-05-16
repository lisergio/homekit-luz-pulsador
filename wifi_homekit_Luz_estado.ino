#include <PubSubClient.h>
#include <ESP8266WiFi.h>

IPAddress server(192, 168, 0, 56); // IP de la raspberry Pi

const char* ssid     = "SSID"; // Your ssid
const char* pass = "PASSWORD"; // Your Password
const char* host = "Light1estado"; // nombre del entorno

int led = 2;
int pulsador = 0;
boolean estado_pulsador = LOW;
boolean estado_luz = 0;

#define BUFFER_SIZE 100

WiFiClient wclient;
PubSubClient client(wclient, server);

void callback(const MQTT::Publish& pub) {
  Serial.println (pub.payload_string());
    if(pub.payload_string() == "on")
    {
      digitalWrite(led, HIGH); // en caso de que el modulo rele funcione al reves, cambiarl HIGH por LOW
      estado_luz=1;
       Serial.println("Switch On");    
    }
    else
    {
      digitalWrite(led, LOW); // en caso de que el modulo rele funcione al reves, cambiarl LOWGH por HIGH
      estado_luz=0;
      Serial.println("Switch Off");
    }
    
}

void setup() 
{
  pinMode(led,OUTPUT);
  pinMode(pulsador,INPUT);
  digitalWrite(led, LOW);
  Serial.begin(115200);
  delay(10);
  Serial.println();
  Serial.println();
  client.set_callback(callback);
  if (WiFi.status() != WL_CONNECTED) 
  {
    Serial.print("Connecting to ");
    Serial.print(ssid);
    Serial.println("...");
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, pass);
    
    if (WiFi.waitForConnectResult() != WL_CONNECTED)
    {
    Serial.print("WiFi not connected");
    }
    else
    {
    Serial.print("WiFi connected"); 
    }
  } 
}

void loop() {

  estado_pulsador=digitalRead(pulsador);
  if (estado_pulsador==LOW)
  {
    if (estado_luz==0)
    {
      estado_luz=1;
      client.publish("Light1estado","SwitchedOn");
      Serial.print("Switch On");
    }
    else
    {
      estado_luz=0; 
      client.publish("Light1estado","SwitchedOff");
      Serial.print("Switch Off");
    }

    delay(500);
  }

    if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      if (client.connect("ESP8266: Light1estado")) {
        client.publish("outTopic",(String)"hello world, I'm "+host);
        client.subscribe(host+(String)"/#");
      }
    }
    if (client.connected())
      client.loop();
  }
  else
  {
    if (estado_luz==0)
    {
       digitalWrite(led,HIGH); // en caso de que el modulo rele funcione al reves, cambiarl HIGH por LOWGH
    }
    else
    {
      digitalWrite(led,LOW);  // en caso de que el modulo rele funcione al reves, cambiarl LOW por HIGH
    }
  }
 
}
