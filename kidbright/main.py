import machine
import network
import time
import math
import uasyncio as asyncio
import ubinascii
from umqtt.simple import MQTTClient
import json
from config import WIFI_SSID, WIFI_PASS, MQTT_USER, MQTT_PASS, MQTT_BROKER


TOPIC = "b6610545901/smartfarm"

PHOTORESISTOR_PIN = 34
SOIL_MOISTURE_PIN = 33
I2C_SDA = 4
I2C_SCL = 5

adc_light = machine.ADC(machine.Pin(PHOTORESISTOR_PIN))
adc_light.atten(machine.ADC.ATTN_11DB)

adc_soil = machine.ADC(machine.Pin(SOIL_MOISTURE_PIN))
adc_soil.atten(machine.ADC.ATTN_11DB)
adc_soil.width(machine.ADC.WIDTH_12BIT)

i2c = machine.I2C(sda=machine.Pin(I2C_SDA), scl=machine.Pin(I2C_SCL))
TEMP_SENSOR_ADDR = 77

RESISTANCE_KOHMS = [900, 100, 10, 4.0, 0.8, 0.1]  # in kΩ
LUX_VALUES = [0.1, 1.0, 10, 100, 1000, 10000]

# Precompute log values for interpolation
LOG_RESISTANCE = [math.log10(r) for r in RESISTANCE_KOHMS]
LOG_LUX = [math.log10(lux) for lux in LUX_VALUES]

async def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASS)
    
    print("Connecting to Wi-Fi...", end="")
    while not wlan.isconnected():
        await asyncio.sleep(1)
        print(".", end="")
    print("\nConnected! IP:", wlan.ifconfig()[0])

async def connect_mqtt():
    global mqtt_client
    mqtt_client = MQTTClient(client_id="",
                      server=MQTT_BROKER,
                      user=MQTT_USER,
                      password=MQTT_PASS)
    mqtt_client.connect()
    print("Connected to MQTT Broker:", MQTT_BROKER)

async def read_soil_moisture():
    adc_value = adc_soil.read()
    moisture_percentage = max(0, min(100, ((4095 - adc_value) / 4095) * 100))
    return moisture_percentage

def interpolate_lux(r_ldr_ohm):
    """Convert resistance (Ω) to Lux using logarithmic interpolation."""
    r_ldr_kohm = r_ldr_ohm / 1000  # Convert Ω to kΩ
    log_r = math.log10(r_ldr_kohm)

    if log_r > LOG_RESISTANCE[0]:  # Too dark
        return LUX_VALUES[0]
    if log_r < LOG_RESISTANCE[-1]:  # Too bright
        return LUX_VALUES[-1]

    for i in range(len(LOG_RESISTANCE) - 1):
        if LOG_RESISTANCE[i] >= log_r >= LOG_RESISTANCE[i + 1]:
            log_lux = LOG_LUX[i] + (log_r - LOG_RESISTANCE[i]) * (LOG_LUX[i + 1] - LOG_LUX[i]) / (LOG_RESISTANCE[i + 1] - LOG_RESISTANCE[i])
            return 10 ** log_lux
    return None


async def read_light_sensor():
    adc_value = adc_light.read()
    voltage = adc_value * (3.3 / 4095)
    resistance = ((voltage / 3.3) * 10000) / (1 - (voltage / 3.3))
    lux_value = interpolate_lux(resistance)
    return lux_value

async def read_temperature():
    try:
        i2c.writeto(TEMP_SENSOR_ADDR, bytearray([0x04, 0b01100000]))
        i2c.writeto(TEMP_SENSOR_ADDR, bytearray([0]))
        high, low = i2c.readfrom(TEMP_SENSOR_ADDR, 2)
        celsius = (low + (high * 256)) / 128
        return celsius
    except Exception as e:
        print("Error reading temperature:", e)
        return None

async def publish_data():
    while True:
        try:
            lux_value = await read_light_sensor()
            soil_moisture = await read_soil_moisture()
            temperature = await read_temperature()

            payload = {
                "lux": lux_value,
                "soil_moisture": round(soil_moisture, 2),
                "temperature": round(temperature, 2) if temperature is not None else "N/A",
                "latitude": 13.8657,
                "longitude": 100.462,
            }

            payload_json = json.dumps(payload)
            mqtt_client.publish(TOPIC, payload_json)
            print("Published:", payload_json)

        except Exception as e:
            print("Error:", e)

        await asyncio.sleep(1800)

async def main():
    await connect_wifi()
    await connect_mqtt()
    await publish_data()  

asyncio.run(main())

