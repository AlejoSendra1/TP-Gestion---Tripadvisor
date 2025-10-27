# --- Etapa 1: Construir la App ---
FROM node:22 AS build
WORKDIR /app
COPY ./package.json ./package-lock.json ./

# --- CORRECCIÓN ---
# 1. Ejecuta 'npm ci' SIN '--omit=dev'.
#    Esto instala 'devDependencies' (como Vite) necesarias para el build.
RUN npm ci
# --- FIN CORRECCIÓN ---

COPY . .

# 2. Esta línea ya no es necesaria, 'npm ci' ya instaló el plugin.
# RUN npm install --save-dev @vitejs/plugin-react

# 3. Ahora el build funcionará
RUN npm run build


# --- Etapa 2: Servir la App con Nginx ---
FROM nginx:1.27.4 AS deploy
WORKDIR /usr/share/nginx/html/

# 4. ¡Esto está perfecto! Copia tu 'nginx.conf' (con el proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY run.sh /

# 5. ¡Esto está perfecto! Copia solo los archivos estáticos del build
COPY --from=build /app/dist/ .

# 6. Esto es un poco inusual (Nginx suele arrancar solo), pero si 'run.sh' 
#    inicia Nginx, está bien.
CMD ["sh", "/run.sh"]