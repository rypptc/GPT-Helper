#!/bin/bash

# Script para generar el paquete ZIP para Chrome Web Store
# GPT Helper Extension

echo "🚀 Generando paquete para Chrome Web Store..."

# Nombre del archivo ZIP (obtener versión del manifest)
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
ZIP_NAME="GPT-Helper-v${VERSION}.zip"

# Eliminar ZIP anterior si existe
if [ -f "$ZIP_NAME" ]; then
    echo "🗑️  Eliminando versión anterior..."
    rm "$ZIP_NAME"
fi

# Crear el ZIP con solo los archivos necesarios
echo "📦 Empaquetando archivos..."
zip -r "$ZIP_NAME" \
    manifest.json \
    content.js \
    popup.html \
    popup.js \
    icons/ \
    -x "*.DS_Store" \
    -x "__MACOSX/*"

# Verificar que se creó correctamente
if [ -f "$ZIP_NAME" ]; then
    echo "✅ Paquete creado exitosamente: $ZIP_NAME"
    echo ""
    echo "📋 Contenido del paquete:"
    unzip -l "$ZIP_NAME"
    echo ""
    echo "📊 Tamaño del archivo:"
    ls -lh "$ZIP_NAME" | awk '{print $5, $9}'
    echo ""
    echo "🎉 ¡Listo para subir a Chrome Web Store!"
else
    echo "❌ Error al crear el paquete"
    exit 1
fi
