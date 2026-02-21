"""
Alembic マイグレーション環境

データベーススキーマのマイグレーションを管理します。
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# alembic.ini から Logging 設定を読み込む
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# MetaData をインポート
from app.database import Base

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    オフラインモードでマイグレーションを実行

    データベースへの接続なしにマイグレーションスクリプトを生成します。
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    オンラインモードでマイグレーションを実行

    実際のデータベースに対して変更を適用します。
    """
    # configurable engine
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
