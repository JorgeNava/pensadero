import os
import json
import base64
import urllib.parse
import firebase_admin
from firebase_admin import db
from firebase_admin import initialize_app, credentials

def lambda_handler(event, context):
    # Inicializar Firebase si no está inicializado
    if not firebase_admin._apps:
        # Crear credenciales de Firebase desde variables de entorno
        cred_json = {
            "type": "service_account",
            "project_id": os.getenv("firebaseProjectId"),
            "private_key_id": os.getenv("firebasePrivateKeyId"),
            "private_key": os.getenv("firebasePrivateKey").replace('\\n', '\n'),
            "client_email": os.getenv("firebaseClientEmail"),
            "client_id": os.getenv("firebaseClientId"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.getenv("firebaseClientCertUrl")
        }
        cred = credentials.Certificate(cred_json)
        initialize_app(cred, {
            'databaseURL': os.getenv("firebaseDatabaseURL")
        })
    
    # Obtener el cuerpo del mensaje y decodificarlo de Base64
    encoded_body = event.get('body', '')
    print("Received encoded message body:", encoded_body)  # Para depuración

    if event.get('isBase64Encoded', False):
        decoded_body = base64.b64decode(encoded_body).decode('utf-8')
    else:
        decoded_body = encoded_body
    
    print("Decoded message body:", decoded_body)  # Para depuración

    # Decodificar el mensaje como URL-encoded
    parsed_message_data = urllib.parse.parse_qs(decoded_body)
    message_data = {key: values[0] for key, values in parsed_message_data.items()}

    # Obtener el texto del mensaje
    message_text = message_data.get('Body', 'No message found')

    # Verificación para mostrar el mensaje decodificado
    print("Message text:", message_text)

    # Referencia al nodo "pensamientos" en Firebase
    ref = db.reference('pensamientos')

    # Optimización: Usar un contador almacenado en la base de datos
    counter_ref = db.reference('contador_pensamientos')
    current_count = counter_ref.get() or 0
    new_index = current_count + 1

    # Crear un nuevo registro en el nodo "pensamientos"
    ref.child(str(new_index)).set({
        'texto': message_text
    })

    # Actualizar el contador en la base de datos
    counter_ref.set(new_index)

    return {
        'statusCode': 200,
        'body': json.dumps('Message recorded successfully!')
    }
