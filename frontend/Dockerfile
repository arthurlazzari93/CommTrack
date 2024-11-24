# Etapa de Build
FROM node:18-alpine as build

# Definir o diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código do projeto
COPY . .

# Executar a compilação da aplicação
RUN npm run build

# Etapa de Produção
FROM node:18-alpine

# Instalar o pacote 'serve' globalmente
RUN npm install -g serve

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos compilados da etapa anterior
COPY --from=build /app/build ./build

# Expor a porta 3000
EXPOSE 3000

# Comando para servir a aplicação
CMD ["serve", "-s", "build", "-l", "3000"]
