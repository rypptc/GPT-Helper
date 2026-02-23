# GPT Helper

Extensión de Chrome que personaliza y mejora la experiencia de ChatGPT con prompts rápidos y funciones adicionales.

## Características

### Slash Commands (//)
- Escribe `//` seguido del nombre de un prompt para acceder rápidamente a tus textos guardados
- Navegación con teclado (↑↓ para navegar, Enter/Tab para seleccionar, Esc para cerrar)
- Búsqueda incremental por nombre mientras escribes (ej: `//res` filtra prompts que contengan "res" en el nombre)

### Modo Borrado
- Botón de borrado rápido para eliminar el chat actual
- Se activa/desactiva desde el popup de la extensión
- Icono de papelera flotante que aparece cerca del botón de opciones

### Gestión de Prompts
- Guarda tus prompts favoritos con un nombre personalizado
- Edita y elimina prompts desde el popup
- Los prompts se sincronizan entre dispositivos con tu cuenta de Chrome

## Instalación

1. Descarga o clona este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta del proyecto

## Uso

### Agregar un Prompt
1. Haz clic en el icono de la extensión
2. Escribe un nombre corto para tu prompt (ej: "Resumen")
3. Escribe el texto completo del prompt
4. Haz clic en "Guardar prompt"

### Usar un Prompt
1. Ve a [ChatGPT](https://chatgpt.com)
2. En el campo de texto, escribe `//` seguido del nombre del prompt
3. Aparecerá un menú con sugerencias
4. Usa las flechas o el mouse para seleccionar y presiona Enter

### Activar el Modo Borrado
1. Haz clic en el icono de la extensión
2. Activa el toggle "Modo borrado"
3. Verás aparecer un botón de papelera en los chats
4. Haz clic para borrar el chat actual rápidamente

## Estructura del Proyecto

```
GPT-Helper/
├── manifest.json         # Configuración de la extensión
├── content.js           # Script principal que se inyecta en ChatGPT
├── popup.html           # Interfaz del popup
├── popup.js            # Lógica del popup
├── icons/              # Iconos de la extensión
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── templates/          # Templates HTML de referencia
│   ├── chatgpt.html
│   └── 3dotsupperright.html
└── README.md
```

## Tecnologías

- Manifest V3 (Chrome Extensions)
- JavaScript vanilla (sin dependencias)
- Chrome Storage API para sincronización

## Desarrollo

El proyecto usa Chrome Extensions API con Manifest V3. Para hacer cambios:

1. Modifica los archivos necesarios
2. Ve a `chrome://extensions/`
3. Haz clic en el icono de recarga de la extensión
4. Prueba los cambios en ChatGPT

## Licencia

MIT
