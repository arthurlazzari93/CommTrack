# Usar uma imagem base do Python
FROM python:3.11-slim

# Definir variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Definir o diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema (se necessário)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar o arquivo de requisitos e instalar as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código do projeto
COPY . .

# Definir PYTHONPATH para que o Django encontre o módulo corretamente
ENV PYTHONPATH=/app/sistema_comissoes

# Expor a porta 8000
EXPOSE 8000

# Comando para iniciar o servidor com gunicorn
CMD ["gunicorn", "sistema_comissoes.wsgi:application", "--bind", "0.0.0.0:8000"]
