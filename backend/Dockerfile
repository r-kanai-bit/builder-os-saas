# Dockerfile - Excel帳票エンジンバックエンド

# ビルドステージ
FROM python:3.11-slim as builder

WORKDIR /app

# システム依存関係をインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Pythonパッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 本番ステージ
FROM python:3.11-slim

WORKDIR /app

# 日本語フォントをインストール（PDF生成用）
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-droid-fallback \
    && rm -rf /var/lib/apt/lists/*

# システムユーザーを作成
RUN useradd -m -u 1000 appuser

# ビルドステージからPythonパッケージをコピー
COPY --from=builder /root/.local /home/appuser/.local

# アプリケーションコードをコピー
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser alembic ./alembic
COPY --chown=appuser:appuser alembic.ini .
COPY --chown=appuser:appuser .env.example .env

# テンプレートファイルをコピー（見積書テンプレート等）
COPY --chown=appuser:appuser storage/templates ./storage/templates

# 出力ディレクトリを作成
RUN mkdir -p storage/outputs && chown -R appuser:appuser storage

# ユーザーを切り替え
USER appuser

# PATH を設定
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# ポート設定
EXPOSE 8000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# アプリケーション起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
